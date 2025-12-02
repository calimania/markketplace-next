// Markket-next npm package
// Entry point for utilities and components for next & typescript codebases using Markket

// Export API clients
export { strapiClient } from './api.strapi';

// Export utilities
export { verifyToken } from './helpers.api';

// Export design system
export { markketColors, createGradient, hexToRgba } from './colors.config';

// Export all types
export * from './index.d';

type Markket = {
  store: string;
}

export { type Markket as default };
