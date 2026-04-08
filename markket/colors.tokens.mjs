export const markketColors = {
  rosa: {
    light: '#FFE5F1',
    main: '#E4007C',
    dark: '#B8005F',
    gradient: 'linear-gradient(135deg, #E4007C 0%, #B8005F 100%)',
  },
  cyan: {
    light: '#E0F7FA',
    main: '#00BCD4',
    dark: '#0097A7',
    gradient: 'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)',
  },
  magenta: {
    light: '#FCE4EC',
    main: '#E91E63',
    dark: '#C2185B',
    gradient: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)',
  },
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
  warm: {
    sand: '#F5E6D3',
    terracotta: '#E07856',
    coral: '#FF6B6B',
  },
  status: {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  },
  gradients: {
    hero: 'linear-gradient(135deg, #E4007C 0%, #E91E63 100%)',
    fresh: 'linear-gradient(135deg, #00BCD4 0%, #E4007C 100%)',
    sunset: 'linear-gradient(135deg, #E4007C 0%, #FF6B6B 100%)',
    elegant: 'linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%)',
    overlay: 'linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.5) 100%)',
  },
  sections: {
    shop: {
      main: '#00BCD4',
      light: '#E0F7FA',
    },
    blog: {
      main: '#E91E63',
      light: '#FCE4EC',
    },
    events: {
      main: '#4CAF50',
      light: '#E8F5E9',
    },
    newsletter: {
      main: '#E4007C',
      light: '#FFE5F1',
    },
    about: {
      main: '#00BCD4',
      light: '#E0F7FA',
    },
  },
};

export const markketTailwindColors = {
  markket: {
    // Legacy aliases kept for existing @apply usage in app/styles/*.scss
    yellow: '#FBDA0F',
    blue: '#0051BA',
    pink: '#FF00FF',
    cyanLegacy: '#00FFFF',

    // Design-system semantic tokens
    rosa: markketColors.rosa.main,
    rosaLight: markketColors.rosa.light,
    cyan: markketColors.cyan.main,
    cyanLight: markketColors.cyan.light,
    magenta: markketColors.magenta.main,
    magentaLight: markketColors.magenta.light,
    sand: markketColors.warm.sand,
    terracotta: markketColors.warm.terracotta,
    coral: markketColors.warm.coral,
    charcoal: markketColors.neutral.charcoal,
    offWhite: markketColors.neutral.offWhite,
    gray: markketColors.neutral.gray,
    success: markketColors.status.success,
    warning: markketColors.status.warning,
    error: markketColors.status.error,
    info: markketColors.status.info,
  },
};

export const markketMantineColors = {
  rosa: ['#fff0f8', '#ffe0f0', '#ffc2df', '#ff99c7', '#ff6cae', '#f94898', '#e4007c', '#b8005f', '#93004a', '#6b0035'],
  cyan: ['#ecfdff', '#cffafe', '#a5f3fc', '#67e8f9', '#22d3ee', '#00bcd4', '#0097a7', '#0e7490', '#155e75', '#164e63'],
  magenta: ['#fff1f7', '#ffe4ef', '#fecde0', '#fda4c8', '#fb74ab', '#f04c89', '#e91e63', '#c2185b', '#9f174d', '#831843'],
  sand: ['#fffaf5', '#fdf2e7', '#f5e6d3', '#ecd6ba', '#e2c39d', '#d6ae81', '#c99763', '#b37f4b', '#8d643c', '#6f4f31'],
  charcoal: ['#f6f6f6', '#e7e7e7', '#d1d1d1', '#b0b0b0', '#888888', '#616161', '#424242', '#333333', '#242424', '#171717'],
};