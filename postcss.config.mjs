/** @type {import('postcss-load-config').Config} */
const config = {
  'postcss-preset-mantine': {},
  'postcss-simple-vars': {
    variables: {
      'mantine-breakpoint-xs': '36em',
      'mantine-breakpoint-sm': '48em',
      'mantine-breakpoint-md': '62em',
      'mantine-breakpoint-lg': '75em',
      'mantine-breakpoint-xl': '88em',
      'bg-markket-yellow': '#FFD700',
      'bg-markket-yellow-light': '#FFD700',
      'bg-markket-yellow-dark': '#FFD700',
      'bg-markket-yellow-darker': '#FFD700',
    },
  },
  plugins: {
    tailwindcss: {},
  },
};

export default config;
