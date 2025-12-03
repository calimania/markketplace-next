// // import React from 'react';
// // import { MantineProvider } from '@mantine/core';
// // import '@mantine/core/styles.css';

// // export const decorators = [
// //   (Story) => (
// //     <MantineProvider>
// //       <Story />
// //     </MantineProvider>
// //   ),
// // ];

// // export const parameters = {
// //   actions: { argTypesRegex: "^on[A-Z].*" },
// //   controls: {
// //     matchers: {
// //       color: /(background|color)$/i,
// //       date: /Date$/,
// //     },
// //   },
// // };


// import type { Preview } from '@storybook/nextjs-vite';

// // 👇 Must include the `.mock` portion of filename to have mocks typed correctly
// import { getRouter } from "@storybook/nextjs-vite/router.mock";

// const preview: Preview = {
//   parameters: {
//     nextjs: {
//       // 👇 Override the default router properties
//       router: {
//         basePath: '/app/',
//       },
//     },
//   },
//   async beforeEach() {
//     // 👇 Manipulate the default router method mocks
//     getRouter().push.mockImplementation(() => {
//       /* ... */
//     });
//   },
// };
