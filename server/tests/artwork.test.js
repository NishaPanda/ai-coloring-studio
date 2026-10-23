import { describe, it } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import Artwork from '../models/Artwork.js';
import {
  createArtwork,
  getMyArtworks,
  getArtworkById,
  updateArtwork,
  deleteArtwork,
} from '../controllers/artworkController.js';

function createMockRes() {
  return {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    },
  };
}

const OWNER_ID = new mongoose.Types.ObjectId().toString();
const STRANGER_ID = new mongoose.Types.ObjectId().toString();
const VALID_ARTWORK_ID = new mongoose.Types.ObjectId().toString();

describe('Artwork Controller & Ownership Tests', () => {

  // ─── createArtwork ───────────────────────────────────────────────────────────
  describe('createArtwork', () => {
    it('should return 400 if pageId is missing', async () => {
      const req = {
        user: { _id: OWNER_ID },
        body: { regionColors: { 'cat-body': '#ff6b6b' } },
      };
      const res = createMockRes();
      await createArtwork(req, res, (err) => { throw err; });

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.data.success, false);
      assert.strictEqual(res.data.message, 'Page ID is required');
    });

    it('should return 400 if regionColors is missing or invalid', async () => {
      const req = {
        user: { _id: OWNER_ID },
        body: { pageId: 'flower' },
      };
      const res = createMockRes();
      await createArtwork(req, res, (err) => { throw err; });

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.data.success, false);
      assert.strictEqual(res.data.message, 'Region color data is required');
    });

    it('should create artwork associated with the authenticated user (201)', async (t) => {
      let createdPayload = null;
      t.mock.method(Artwork, 'create', async (data) => {
        createdPayload = data;
        return {
          _id: VALID_ARTWORK_ID,
          ...data,
        };
      });

      const req = {
        user: { _id: OWNER_ID },
        body: {
          pageId: 'cat',
          pageTitle: 'Sitting Cat',
          title: 'My Fluffy Cat',
          regionColors: { 'cat-tail': '#ff6b6b', 'cat-head': '#ffd166' },
        },
      };
      const res = createMockRes();
      await createArtwork(req, res, (err) => { throw err; });

      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.artwork.title, 'My Fluffy Cat');
      assert.strictEqual(createdPayload.user, OWNER_ID);
      assert.strictEqual(createdPayload.pageId, 'cat');
    });
  });

  // ─── getMyArtworks ───────────────────────────────────────────────────────────
  describe('getMyArtworks', () => {
    it('should return only the authenticated user artworks sorted by newest', async (t) => {
      let queryFilter = null;
      t.mock.method(Artwork, 'find', (filter) => {
        queryFilter = filter;
        return {
          sort: async (sortOptions) => {
            assert.deepStrictEqual(sortOptions, { updatedAt: -1, createdAt: -1 });
            return [
              { _id: VALID_ARTWORK_ID, title: 'Art 1', user: OWNER_ID },
              { _id: 'art_2', title: 'Art 2', user: OWNER_ID },
            ];
          },
        };
      });

      const req = { user: { _id: OWNER_ID } };
      const res = createMockRes();
      await getMyArtworks(req, res, (err) => { throw err; });

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.count, 2);
      assert.strictEqual(queryFilter.user, OWNER_ID);
    });
  });

  // ─── getArtworkById & Ownership ──────────────────────────────────────────────
  describe('getArtworkById (Ownership enforcement)', () => {
    it('should return 400 for an invalid MongoDB ObjectId string', async () => {
      const req = {
        user: { _id: OWNER_ID },
        params: { id: 'invalid-id-format' },
      };
      const res = createMockRes();
      await getArtworkById(req, res, (err) => { throw err; });

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.data.success, false);
      assert.strictEqual(res.data.message, 'Invalid artwork ID');
    });

    it('should return 404 if artwork does not exist', async (t) => {
      t.mock.method(Artwork, 'findById', async () => null);

      const req = {
        user: { _id: OWNER_ID },
        params: { id: VALID_ARTWORK_ID },
      };
      const res = createMockRes();
      await getArtworkById(req, res, (err) => { throw err; });

      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(res.data.success, false);
      assert.strictEqual(res.data.message, 'Artwork not found');
    });

    it('should return 403 if the user is not the owner of the artwork', async (t) => {
      t.mock.method(Artwork, 'findById', async () => ({
        _id: VALID_ARTWORK_ID,
        title: 'Secret Artwork',
        user: OWNER_ID, // Owned by OWNER_ID
      }));

      // Stranger tries to access
      const req = {
        user: { _id: STRANGER_ID },
        params: { id: VALID_ARTWORK_ID },
      };
      const res = createMockRes();
      await getArtworkById(req, res, (err) => { throw err; });

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.data.success, false);
      assert.strictEqual(res.data.message, 'Not authorized to view this artwork');
    });

    it('should return 200 with artwork when requested by owner', async (t) => {
      t.mock.method(Artwork, 'findById', async () => ({
        _id: VALID_ARTWORK_ID,
        title: 'Owner Artwork',
        user: OWNER_ID,
      }));

      const req = {
        user: { _id: OWNER_ID },
        params: { id: VALID_ARTWORK_ID },
      };
      const res = createMockRes();
      await getArtworkById(req, res, (err) => { throw err; });

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.artwork.title, 'Owner Artwork');
    });
  });

  // ─── updateArtwork & Ownership ───────────────────────────────────────────────
  describe('updateArtwork (Ownership enforcement)', () => {
    it('should return 403 if non-owner attempts to update', async (t) => {
      t.mock.method(Artwork, 'findById', async () => ({
        _id: VALID_ARTWORK_ID,
        user: OWNER_ID,
      }));

      const req = {
        user: { _id: STRANGER_ID },
        params: { id: VALID_ARTWORK_ID },
        body: { title: 'Hacked Title' },
      };
      const res = createMockRes();
      await updateArtwork(req, res, (err) => { throw err; });

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.data.success, false);
      assert.strictEqual(res.data.message, 'Not authorized to edit this artwork');
    });

    it('should update and save artwork when owner edits (200)', async (t) => {
      let saved = false;
      const mockArtworkInstance = {
        _id: VALID_ARTWORK_ID,
        user: OWNER_ID,
        title: 'Old Title',
        regionColors: { 'flower-petal-1': '#ffffff' },
        async save() {
          saved = true;
          return this;
        },
      };

      t.mock.method(Artwork, 'findById', async () => mockArtworkInstance);

      const req = {
        user: { _id: OWNER_ID },
        params: { id: VALID_ARTWORK_ID },
        body: {
          title: 'New Blooming Title',
          regionColors: { 'flower-petal-1': '#e63946' },
        },
      };
      const res = createMockRes();
      await updateArtwork(req, res, (err) => { throw err; });

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(saved, true);
      assert.strictEqual(res.data.artwork.title, 'New Blooming Title');
    });
  });

  // ─── deleteArtwork & Ownership ───────────────────────────────────────────────
  describe('deleteArtwork (Ownership enforcement)', () => {
    it('should return 403 if non-owner attempts to delete', async (t) => {
      t.mock.method(Artwork, 'findById', async () => ({
        _id: VALID_ARTWORK_ID,
        user: OWNER_ID,
      }));

      const req = {
        user: { _id: STRANGER_ID },
        params: { id: VALID_ARTWORK_ID },
      };
      const res = createMockRes();
      await deleteArtwork(req, res, (err) => { throw err; });

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.data.success, false);
      assert.strictEqual(res.data.message, 'Not authorized to delete this artwork');
    });

    it('should delete artwork when owner confirms (200)', async (t) => {
      let deleted = false;
      t.mock.method(Artwork, 'findById', async () => ({
        _id: VALID_ARTWORK_ID,
        user: OWNER_ID,
        async deleteOne() {
          deleted = true;
        },
      }));

      const req = {
        user: { _id: OWNER_ID },
        params: { id: VALID_ARTWORK_ID },
      };
      const res = createMockRes();
      await deleteArtwork(req, res, (err) => { throw err; });

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(deleted, true);
      assert.strictEqual(res.data.message, 'Artwork deleted successfully');
    });
  });

});
