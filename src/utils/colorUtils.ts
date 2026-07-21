/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ColorScheme {
  id: string;
  name: string;
  bg: string;
  bgHover: string;
  text: string;
  border: string;
  solidBg: string;
  solidHover: string;
  solidText: string;
  ring: string;
}

export const COLOR_SCHEMES: Record<string, ColorScheme> = {
  turquoise: {
    id: 'turquoise',
    name: 'Turquoise',
    bg: 'bg-turquoise-50',
    bgHover: 'hover:bg-turquoise-100',
    text: 'text-turquoise-700',
    border: 'border-turquoise-200',
    solidBg: 'bg-turquoise-500',
    solidHover: 'hover:bg-turquoise-600',
    solidText: 'text-neutral-900 font-bold',
    ring: 'focus:ring-turquoise-500/30',
  },
  orange: {
    id: 'orange',
    name: 'Orange',
    bg: 'bg-orange-50',
    bgHover: 'hover:bg-orange-100',
    text: 'text-orange-600',
    border: 'border-orange-200',
    solidBg: 'bg-orange-500',
    solidHover: 'hover:bg-orange-600',
    solidText: 'text-white',
    ring: 'focus:ring-orange-500/30',
  },
  purple: {
    id: 'purple',
    name: 'Purple',
    bg: 'bg-purple-50',
    bgHover: 'hover:bg-purple-100',
    text: 'text-purple-600',
    border: 'border-purple-200',
    solidBg: 'bg-purple-500',
    solidHover: 'hover:bg-purple-600',
    solidText: 'text-white',
    ring: 'focus:ring-purple-500/30',
  },
  blue: {
    id: 'blue',
    name: 'Blue',
    bg: 'bg-blue-50',
    bgHover: 'hover:bg-blue-100',
    text: 'text-blue-600',
    border: 'border-blue-200',
    solidBg: 'bg-blue-500',
    solidHover: 'hover:bg-blue-600',
    solidText: 'text-white',
    ring: 'focus:ring-blue-500/30',
  },
  green: {
    id: 'green',
    name: 'Green',
    bg: 'bg-emerald-50',
    bgHover: 'hover:bg-emerald-100',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
    solidBg: 'bg-emerald-500',
    solidHover: 'hover:bg-emerald-600',
    solidText: 'text-white',
    ring: 'focus:ring-emerald-500/30',
  },
  pink: {
    id: 'pink',
    name: 'Pink',
    bg: 'bg-rose-50',
    bgHover: 'hover:bg-rose-100',
    text: 'text-rose-600',
    border: 'border-rose-200',
    solidBg: 'bg-rose-500',
    solidHover: 'hover:bg-rose-600',
    solidText: 'text-white',
    ring: 'focus:ring-rose-500/30',
  },
};

export function getColorScheme(colorId: string): ColorScheme {
  return COLOR_SCHEMES[colorId] || COLOR_SCHEMES.turquoise;
}
