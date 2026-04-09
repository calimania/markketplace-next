/**
 * Markketplace Color System
 *
 * Inspired by Latin American vibrancy meets Scandinavian/Japanese minimalism.
 * Colors are elegant, subtle, and sophisticated with Mexican Rosa as the hero.
 */

import {
  markketColors,
  markketTailwindColors,
  markketMantineColors,
} from './colors.tokens.mjs';

export { markketColors, markketTailwindColors, markketMantineColors };

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
