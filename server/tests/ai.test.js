import { describe, it } from 'node:test';
import assert from 'node:assert';
import { suggestColors, FALLBACK_PALETTES } from '../controllers/aiController.js';

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

describe('AI Palette Suggestions Tests', () => {

  it('should return 400 if pageId is missing or empty', async () => {
    const req = { body: { pageId: '', title: 'Test Page' } };
    const res = createMockRes();
    await suggestColors(req, res, (err) => { throw err; });

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.success, false);
    assert.strictEqual(res.data.message, 'Valid pageId is required.');
  });

  it('should return curated fallback palette when GEMINI_API_KEY is not configured', async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    try {
      const req = {
        body: {
          pageId: 'rocket',
          title: 'Space Rocket',
          category: 'Space',
        },
      };
      const res = createMockRes();
      await suggestColors(req, res, (err) => { throw err; });

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.isFallback, true);
      assert.ok(res.data.message.includes('curated palette'));
      assert.strictEqual(res.data.palette.paletteName, FALLBACK_PALETTES.rocket.paletteName);
      assert.ok(Array.isArray(res.data.palette.colors));
      assert.ok(res.data.palette.colors.length >= 6);

      // Verify all colors in the fallback have valid 6-character hex codes
      for (const color of res.data.palette.colors) {
        assert.match(color.hex, /^#[0-9A-Fa-f]{6}$/);
      }
    } finally {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

  it('should return curated fallback palette when Gemini API call fails (mocked 500 error)', async (t) => {
    const originalKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = 'mock_api_key_test';

    // Mock global fetch to simulate a 500 error from Google Gemini
    t.mock.method(global, 'fetch', async () => ({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error from AI service',
    }));

    try {
      const req = {
        body: {
          pageId: 'dragon',
          title: 'Friendly Dragon',
          category: 'Fantasy',
        },
      };
      const res = createMockRes();
      await suggestColors(req, res, (err) => { throw err; });

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.isFallback, true);
      assert.strictEqual(res.data.palette.paletteName, FALLBACK_PALETTES.dragon.paletteName);
    } finally {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

  it('should parse and return AI palette when Gemini returns valid structured JSON', async (t) => {
    const originalKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = 'mock_api_key_test';

    const mockAiResponse = {
      paletteName: 'Enchanted Meadow',
      themeDescription: 'Soft morning petals and dewy green leaves.',
      colors: [
        { hex: '#ff758f', name: 'Petal Blush', role: 'Main petals' },
        { hex: '#ffb703', name: 'Sunbeam Gold', role: 'Center pistil' },
        { hex: '#52b788', name: 'Dewy Leaf', role: 'Stem and leaves' },
        { hex: '#2d6a4f', name: 'Deep Moss', role: 'Shadows' },
        { hex: '#b5179e', name: 'Violet Accent', role: 'Outer rim' },
      ],
    };

    // Mock global fetch returning structured Gemini candidate text
    t.mock.method(global, 'fetch', async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: JSON.stringify(mockAiResponse) }],
            },
          },
        ],
      }),
    }));

    try {
      const req = {
        body: {
          pageId: 'flower',
          title: 'Garden Flower',
          category: 'Nature',
        },
      };
      const res = createMockRes();
      await suggestColors(req, res, (err) => { throw err; });

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.isFallback, false);
      assert.strictEqual(res.data.palette.paletteName, 'Enchanted Meadow');
      assert.strictEqual(res.data.palette.colors.length, 5);

      // Verify all colors have valid 6-digit hex format
      for (const color of res.data.palette.colors) {
        assert.match(color.hex, /^#[0-9A-Fa-f]{6}$/);
      }
    } finally {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

  it('should fall back safely if AI response contains malformed or insufficient hex colors', async (t) => {
    const originalKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = 'mock_api_key_test';

    const malformedResponse = {
      paletteName: 'Broken Palette',
      colors: [
        { hex: 'not-a-hex', name: 'Bad Color' },
        { hex: '#12', name: 'Too short' },
      ],
    };

    t.mock.method(global, 'fetch', async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: JSON.stringify(malformedResponse) }],
            },
          },
        ],
      }),
    }));

    try {
      const req = {
        body: {
          pageId: 'cat',
          title: 'Sitting Cat',
          category: 'Animals',
        },
      };
      const res = createMockRes();
      await suggestColors(req, res, (err) => { throw err; });

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.isFallback, true);
      assert.strictEqual(res.data.palette.paletteName, FALLBACK_PALETTES.cat.paletteName);
    } finally {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

});
