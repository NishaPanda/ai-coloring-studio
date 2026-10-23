/**
 * coloringPages.js – Single source of truth for all sample coloring pages.
 *
 * Each entry has:
 *   id         – matches the URL param /studio/:id and the SVG component map
 *   title      – display name shown on cards and in the Studio header
 *   category   – used for the category filter in Browse
 *   difficulty – used for the difficulty filter in Browse
 *   description – short text shown on the PageCard
 *   svgFile    – path served from /public, used for thumbnail <img> in PageCard
 *   regionIds  – all colorable region IDs for this page;
 *                Studio uses this list to initialize and reset regionColors state
 */

export const coloringPages = [
  {
    id: 'cat',
    title: 'Sitting Cat',
    category: 'Animals',
    difficulty: 'Easy',
    description: 'A cute sitting cat with whiskers, big eyes, and a curly tail.',
    svgFile: '/coloring-pages/cat.svg',
    regionIds: [
      'cat-tail',
      'cat-body',
      'cat-belly',
      'cat-paw-left',
      'cat-paw-right',
      'cat-ear-left',
      'cat-ear-right',
      'cat-head',
      'cat-eye-left',
      'cat-eye-right',
      'cat-nose',
    ],
  },
  {
    id: 'flower',
    title: 'Garden Flower',
    category: 'Nature',
    difficulty: 'Easy',
    description: 'A beautiful flower in full bloom with eight petals and lush leaves.',
    svgFile: '/coloring-pages/flower.svg',
    regionIds: [
      'flower-petal-1',
      'flower-petal-2',
      'flower-petal-3',
      'flower-petal-4',
      'flower-petal-5',
      'flower-petal-6',
      'flower-petal-7',
      'flower-petal-8',
      'flower-center',
      'flower-stem',
      'flower-leaf-left',
      'flower-leaf-right',
    ],
  },
  {
    id: 'rocket',
    title: 'Space Rocket',
    category: 'Space',
    difficulty: 'Medium',
    description: 'A rocket ship with fins and a blazing flame, ready to blast off!',
    svgFile: '/coloring-pages/rocket.svg',
    regionIds: [
      'rocket-flame',
      'rocket-fin-left',
      'rocket-fin-right',
      'rocket-body',
      'rocket-nose',
      'rocket-window',
    ],
  },
  {
    id: 'dragon',
    title: 'Friendly Dragon',
    category: 'Fantasy',
    difficulty: 'Hard',
    description: 'A friendly cartoon dragon with big wings, a spotted belly, and a curly tail.',
    svgFile: '/coloring-pages/dragon.svg',
    regionIds: [
      'dragon-wing-left',
      'dragon-wing-right',
      'dragon-tail',
      'dragon-body',
      'dragon-belly',
      'dragon-head',
      'dragon-eye-left',
      'dragon-eye-right',
    ],
  },
];

/** All unique categories present in the data, plus the 'All' sentinel. */
export const CATEGORIES = ['All', ...new Set(coloringPages.map((p) => p.category))];

/** Difficulty options in fixed display order, plus the 'All' sentinel. */
export const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];
