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
    bg: 'bg-[#76DFCB]/15',
    bgHover: 'hover:bg-[#76DFCB]/25',
    text: 'text-[#137B7C]',
    border: 'border-[#76DFCB]/40',
    solidBg: 'bg-[#76DFCB]',
    solidHover: 'hover:bg-[#31ADAF]',
    solidText: 'text-[#301208] font-bold',
    ring: 'focus:ring-[#76DFCB]/40',
  },
  orange: {
    id: 'orange',
    name: 'Orange',
    bg: 'bg-[#EF681E]/15',
    bgHover: 'hover:bg-[#EF681E]/25',
    text: 'text-[#EF681E]',
    border: 'border-[#EF681E]/40',
    solidBg: 'bg-[#EF681E]',
    solidHover: 'hover:bg-[#d7500d]',
    solidText: 'text-white font-bold',
    ring: 'focus:ring-[#EF681E]/40',
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender',
    bg: 'bg-[#AE99F5]/15',
    bgHover: 'hover:bg-[#AE99F5]/25',
    text: 'text-[#6A4BC9]',
    border: 'border-[#AE99F5]/40',
    solidBg: 'bg-[#AE99F5]',
    solidHover: 'hover:bg-[#9680e3]',
    solidText: 'text-[#301208] font-bold',
    ring: 'focus:ring-[#AE99F5]/40',
  },
  skyblue: {
    id: 'skyblue',
    name: 'Sky Blue',
    bg: 'bg-[#7EC6F1]/15',
    bgHover: 'hover:bg-[#7EC6F1]/25',
    text: 'text-[#2884C7]',
    border: 'border-[#7EC6F1]/40',
    solidBg: 'bg-[#7EC6F1]',
    solidHover: 'hover:bg-[#5bb2ea]',
    solidText: 'text-[#301208] font-bold',
    ring: 'focus:ring-[#7EC6F1]/40',
  },
  green: {
    id: 'green',
    name: 'Green',
    bg: 'bg-[#44AB78]/15',
    bgHover: 'hover:bg-[#44AB78]/25',
    text: 'text-[#207D50]',
    border: 'border-[#44AB78]/40',
    solidBg: 'bg-[#44AB78]',
    solidHover: 'hover:bg-[#349665]',
    solidText: 'text-white font-bold',
    ring: 'focus:ring-[#44AB78]/40',
  },
  pink: {
    id: 'pink',
    name: 'Soft Pink',
    bg: 'bg-[#EEB0D1]/15',
    bgHover: 'hover:bg-[#EEB0D1]/25',
    text: 'text-[#C75294]',
    border: 'border-[#EEB0D1]/40',
    solidBg: 'bg-[#EEB0D1]',
    solidHover: 'hover:bg-[#e094be]',
    solidText: 'text-[#301208] font-bold',
    ring: 'focus:ring-[#EEB0D1]/40',
  },
  // Backward compatibility aliases
  purple: {
    id: 'lavender',
    name: 'Lavender',
    bg: 'bg-[#AE99F5]/15',
    bgHover: 'hover:bg-[#AE99F5]/25',
    text: 'text-[#6A4BC9]',
    border: 'border-[#AE99F5]/40',
    solidBg: 'bg-[#AE99F5]',
    solidHover: 'hover:bg-[#9680e3]',
    solidText: 'text-[#301208] font-bold',
    ring: 'focus:ring-[#AE99F5]/40',
  },
  blue: {
    id: 'skyblue',
    name: 'Sky Blue',
    bg: 'bg-[#7EC6F1]/15',
    bgHover: 'hover:bg-[#7EC6F1]/25',
    text: 'text-[#2884C7]',
    border: 'border-[#7EC6F1]/40',
    solidBg: 'bg-[#7EC6F1]',
    solidHover: 'hover:bg-[#5bb2ea]',
    solidText: 'text-[#301208] font-bold',
    ring: 'focus:ring-[#7EC6F1]/40',
  },
};

export function getColorScheme(colorId: string): ColorScheme {
  return COLOR_SCHEMES[colorId] || COLOR_SCHEMES.turquoise;
}
