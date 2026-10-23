/**
 * aiController.js – Phase 7: AI Color Suggestions
 *
 * Provides AI-generated harmonious color palettes for coloring pages using
 * Google Gemini API (v1beta REST API with native fetch).
 *
 * Features & Safety:
 *  - Reads GEMINI_API_KEY from process.env (never exposed or logged).
 *  - Uses Node.js native fetch (no extra dependencies).
 *  - Configurable model via process.env.GEMINI_MODEL (defaults to 'gemini-2.5-flash',
 *    falls back to 'gemini-1.5-flash').
 *  - Strict 6-digit hex validation (^#[0-9A-Fa-f]{6}$).
 *  - Graceful fallback: If API key is missing or API call fails, serves a rich,
 *    curated thematic palette with an explicit notice, keeping the Studio 100% usable.
 */

// ─── Curated Thematic Fallback Palettes ─────────────────────────────────────────
export const FALLBACK_PALETTES = {
  cat: {
    paletteName: 'Warm Whispers',
    themeDescription: 'Cozy fur tones, soft creams, and gentle feline highlights.',
    colors: [
      { hex: '#e76f51', name: 'Ginger Warmth', role: 'Main coat & stripes' },
      { hex: '#f4a261', name: 'Sandy Cream', role: 'Belly & muzzle' },
      { hex: '#e9c46a', name: 'Golden Honey', role: 'Ear accents & highlights' },
      { hex: '#ffb5a7', name: 'Soft Paws Pink', role: 'Nose & inner ears' },
      { hex: '#2a9d8f', name: 'Emerald Whiskers', role: 'Cat eyes' },
      { hex: '#264653', name: 'Midnight Shadow', role: 'Tail tip & details' },
      { hex: '#8d99ae', name: 'Silver Mist', role: 'Shadows & collar' },
    ],
  },
  flower: {
    paletteName: 'Botanical Bloom',
    themeDescription: 'Vibrant garden florals, sunlit petals, and lush foliage.',
    colors: [
      { hex: '#e63946', name: 'Poppy Crimson', role: 'Outer petals' },
      { hex: '#ff758f', name: 'Peony Blush', role: 'Inner petals' },
      { hex: '#ffb703', name: 'Sunflower Core', role: 'Flower center' },
      { hex: '#fb8500', name: 'Tangerine Glow', role: 'Pollen accent' },
      { hex: '#2b9348', name: 'Leaf Emerald', role: 'Lush leaves' },
      { hex: '#55a630', name: 'Stem Olive', role: 'Flower stem' },
      { hex: '#8338ec', name: 'Iris Violet', role: 'Petal highlights' },
    ],
  },
  rocket: {
    paletteName: 'Cosmic Blastoff',
    themeDescription: 'Aerospace metallics, radiant thruster flames, and deep space.',
    colors: [
      { hex: '#d90429', name: 'Booster Red', role: 'Fins & nose cone' },
      { hex: '#f77f00', name: 'Thruster Flame', role: 'Engine fire core' },
      { hex: '#fcbf49', name: 'Plasma Amber', role: 'Outer flame burst' },
      { hex: '#0077b6', name: 'Stratosphere Blue', role: 'Rocket fuselage' },
      { hex: '#90e0ef', name: 'Cosmic Cyan', role: 'Cockpit porthole' },
      { hex: '#edf2f4', name: 'Apollo Silver', role: 'Fuselage body' },
      { hex: '#1d3557', name: 'Deep Nebula', role: 'Shadows & trim' },
    ],
  },
  dragon: {
    paletteName: 'Mythic Scales',
    themeDescription: 'Ancient dragon emeralds, fiery wings, and enchanted horns.',
    colors: [
      { hex: '#2d6a4f', name: 'Forest Dragon Green', role: 'Dragon scales' },
      { hex: '#52b788', name: 'Jade Belly', role: 'Underbelly & accents' },
      { hex: '#d62828', name: 'Wyvern Crimson', role: 'Wing membranes' },
      { hex: '#f77f00', name: 'Dragon Flame', role: 'Spines & breath' },
      { hex: '#ffb703', name: 'Treasure Gold', role: 'Horns & claws' },
      { hex: '#7209b7', name: 'Arcane Purple', role: 'Tail ridge' },
      { hex: '#00f5d4', name: 'Dragonfire Teal', role: 'Glowing eyes' },
    ],
  },
};

const DEFAULT_FALLBACK = {
  paletteName: 'Creative Harmony',
  themeDescription: 'A balanced selection of vibrant, complementary tones.',
  colors: [
    { hex: '#ff595e', name: 'Coral Rose', role: 'Warm focal point' },
    { hex: '#ffca3a', name: 'Sunny Gold', role: 'Vibrant highlight' },
    { hex: '#8ac926', name: 'Spring Green', role: 'Fresh nature' },
    { hex: '#1982c4', name: 'Ocean Azure', role: 'Cool background' },
    { hex: '#6a4c93', name: 'Royal Plum', role: 'Deep contrast' },
    { hex: '#f4a261', name: 'Warm Terracotta', role: 'Soft balance' },
  ],
};

// ─── Hex Code Sanitizer & Validator ───────────────────────────────────────────
const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;

const sanitizeHex = (input) => {
  if (typeof input !== 'string') return null;
  let clean = input.trim();
  if (!clean.startsWith('#')) clean = `#${clean}`;
  return HEX_REGEX.test(clean) ? clean.toLowerCase() : null;
};

// ─── Gemini API Calling Logic ──────────────────────────────────────────────────
const requestGeminiPalette = async (apiKey, modelName, pageInfo) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const prompt = `You are an expert digital art colorist.
Generate a coordinated, aesthetic coloring palette of 6 to 8 colors for this coloring page:
- Title: "${pageInfo.title}"
- Category: "${pageInfo.category}"
- Description: "${pageInfo.description || ''}"

Return ONLY a valid JSON object matching this exact schema:
{
  "paletteName": "Creative name for the palette (2-4 words)",
  "themeDescription": "One short sentence describing the mood or theme",
  "colors": [
    {
      "hex": "#XXXXXX (valid 6-digit hex code)",
      "name": "Creative color name (e.g. Amber Glow)",
      "role": "Suggested use (e.g. Main coat, petals, wings)"
    }
  ]
}
Do NOT include markdown fences, comments, or any extra text.`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error (Status ${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('Gemini API returned an empty response.');
  }

  // Parse JSON response
  let parsed;
  try {
    parsed = JSON.parse(rawText.trim());
  } catch (parseErr) {
    // Strip possible markdown backticks if any were included
    const cleaned = rawText.replace(/^```json/i, '').replace(/```$/g, '').trim();
    parsed = JSON.parse(cleaned);
  }

  return parsed;
};

// ─── Controller Handler: suggestColors ─────────────────────────────────────────
// @route   POST /api/ai/suggest-colors
// @access  Public
export const suggestColors = async (req, res, next) => {
  try {
    const { pageId, title, category, description } = req.body;

    // Validate required input
    if (!pageId || typeof pageId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Valid pageId is required.',
      });
    }

    const normalizedPageId = String(pageId).toLowerCase().trim();
    const fallback = FALLBACK_PALETTES[normalizedPageId] || DEFAULT_FALLBACK;

    const apiKey = process.env.GEMINI_API_KEY;

    // 1. If no API key configured, return the curated fallback palette
    if (!apiKey || apiKey.trim() === '') {
      return res.status(200).json({
        success: true,
        isFallback: true,
        message: 'Displaying curated palette. To enable live AI, add GEMINI_API_KEY to server/.env.',
        palette: fallback,
      });
    }

    // 2. Call Gemini with configured or default Flash model
    const primaryModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    let rawPalette;

    try {
      rawPalette = await requestGeminiPalette(apiKey, primaryModel, {
        title: title || normalizedPageId,
        category: category || 'General',
        description: description || '',
      });
    } catch (primaryErr) {
      console.warn(`Primary model (${primaryModel}) failed:`, primaryErr.message);

      // Attempt secondary fallback to gemini-1.5-flash if primary was 2.5
      if (primaryModel !== 'gemini-1.5-flash') {
        try {
          rawPalette = await requestGeminiPalette(apiKey, 'gemini-1.5-flash', {
            title: title || normalizedPageId,
            category: category || 'General',
            description: description || '',
          });
        } catch (secondaryErr) {
          console.warn('Secondary model (gemini-1.5-flash) failed:', secondaryErr.message);
          // Return curated fallback with clear message
          return res.status(200).json({
            success: true,
            isFallback: true,
            message: 'Gemini service is currently unavailable. Displaying curated palette.',
            palette: fallback,
          });
        }
      } else {
        return res.status(200).json({
          success: true,
          isFallback: true,
          message: 'Gemini service is currently unavailable. Displaying curated palette.',
          palette: fallback,
        });
      }
    }

    // 3. Validate and sanitize returned colors
    if (!rawPalette || !Array.isArray(rawPalette.colors) || rawPalette.colors.length === 0) {
      return res.status(200).json({
        success: true,
        isFallback: true,
        message: 'AI response was malformed. Displaying curated palette.',
        palette: fallback,
      });
    }

    const validatedColors = [];
    for (const c of rawPalette.colors) {
      const validHex = sanitizeHex(c.hex || c.color);
      if (validHex) {
        validatedColors.push({
          hex: validHex,
          name: typeof c.name === 'string' && c.name.trim() ? c.name.trim() : 'Accent Color',
          role: typeof c.role === 'string' && c.role.trim() ? c.role.trim() : 'Coloring region',
        });
      }
    }

    // If fewer than 4 valid hex colors were extracted, fall back safely
    if (validatedColors.length < 4) {
      return res.status(200).json({
        success: true,
        isFallback: true,
        message: 'Could not extract sufficient valid colors from AI. Displaying curated palette.',
        palette: fallback,
      });
    }

    // Return the clean, validated AI palette
    res.status(200).json({
      success: true,
      isFallback: false,
      message: 'AI color suggestions generated successfully.',
      palette: {
        paletteName: rawPalette.paletteName || `${title || 'Coloring'} Palette`,
        themeDescription: rawPalette.themeDescription || 'Coordinated colors generated for your page.',
        colors: validatedColors,
      },
    });
  } catch (error) {
    next(error);
  }
};
