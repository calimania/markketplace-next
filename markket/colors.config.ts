/**
 * Markketplace Color System
 *
 * Inspired by Latin American vibrancy meets Scandinavian/Japanese minimalism.
 * Colors are elegant, subtle, and sophisticated with Mexican Rosa as the hero.
 */

export const markketColors = {
  // Primary - Mexican Rosa (vibrant but elegant)
  rosa: {
    light: '#FFE5F1',    // Soft rosa for backgrounds
    main: '#E4007C',     // Mexican Rosa - hero color
    dark: '#B8005F',     // Deeper rosa for hover states
    gradient: 'linear-gradient(135deg, #E4007C 0%, #B8005F 100%)',
  },

  // Secondary - Cyan (fresh, clean)
  cyan: {
    light: '#E0F7FA',    // Soft cyan for accents
    main: '#00BCD4',     // Bright cyan
    dark: '#0097A7',     // Deep cyan
    gradient: 'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)',
  },

  // Accent - Magenta (bold, creative)
  magenta: {
    light: '#FCE4EC',    // Soft magenta
    main: '#E91E63',     // Vibrant magenta
    dark: '#C2185B',     // Deep magenta
    gradient: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)',
  },

  // Neutrals - Scandinavian/Japanese inspired
  neutral: {
    white: '#FFFFFF',
    offWhite: '#FAFAFA',
    lightGray: '#F5F5F5',
    gray: '#E0E0E0',
    mediumGray: '#9E9E9E',
    darkGray: '#616161',
    charcoal: '#424242',
    black: '#212121',
  },

  // Warm accents - Latin warmth
  warm: {
    sand: '#F5E6D3',     // Warm sand
    terracotta: '#E07856', // Soft terracotta
    coral: '#FF6B6B',    // Coral accent
  },

  // Status colors (minimalist)
  status: {
    success: '#4CAF50',  // Clean green
    warning: '#FF9800',  // Warm orange
    error: '#F44336',    // Clear red
    info: '#2196F3',     // Clear blue
  },

  // Gradients - Sophisticated combinations
  gradients: {
    hero: 'linear-gradient(135deg, #E4007C 0%, #E91E63 100%)',        // Rosa + Magenta
    fresh: 'linear-gradient(135deg, #00BCD4 0%, #E4007C 100%)',       // Cyan + Rosa
    sunset: 'linear-gradient(135deg, #E4007C 0%, #FF6B6B 100%)',      // Rosa + Coral
    elegant: 'linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%)',     // Soft neutral
    overlay: 'linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.5) 100%)',
  },

  // Section-specific colors (for navigation)
  sections: {
    shop: {
      main: '#00BCD4',    // Cyan for products/shop
      light: '#E0F7FA',
    },
    blog: {
      main: '#E91E63',    // Magenta for articles/blog
      light: '#FCE4EC',
    },
    events: {
      main: '#4CAF50',    // Green for events/calendar
      light: '#E8F5E9',
    },
    newsletter: {
      main: '#E4007C',    // Rosa for newsletter/mail
      light: '#FFE5F1',
    },
    about: {
      main: '#00BCD4',    // Cyan for info/about
      light: '#E0F7FA',
    },
  },
} as const;

/**
 * Helper function to get a gradient with custom colors
 */
export function createGradient(from: string, to: string, deg: number = 135): string {
  return `linear-gradient(${deg}deg, ${from} 0%, ${to} 100%)`;
}

/**
 * Helper function to add alpha channel to hex color
 */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
