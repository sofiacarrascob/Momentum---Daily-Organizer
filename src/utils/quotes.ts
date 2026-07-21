/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Quote {
  text: string;
  author: string;
}

export const MOTIVATIONAL_QUOTES: Quote[] = [
  {
    text: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier"
  },
  {
    text: "It is not that we have a short time to live, but that we waste a lot of it.",
    author: "Seneca"
  },
  {
    text: "Consistency is what transforms average into excellence.",
    author: "Unknown"
  },
  {
    text: "You do not rise to the level of your goals. You fall to the level of your systems.",
    author: "James Clear"
  },
  {
    text: "The secret of your future is hidden in your daily routine.",
    author: "Mike Murdock"
  },
  {
    text: "Focus on being productive instead of busy.",
    author: "Tim Ferriss"
  },
  {
    text: "Small daily improvements over time lead to stunning results.",
    author: "Robin Sharma"
  },
  {
    text: "Do something today that your future self will thank you for.",
    author: "Unknown"
  },
  {
    text: "Energy and persistence conquer all things.",
    author: "Benjamin Franklin"
  },
  {
    text: "Your habits will determine your future.",
    author: "Jack Canfield"
  }
];

export function getQuoteOfTheDay(dateStr: string): Quote {
  // Simple deterministic hash based on date string so it changes once per day
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % MOTIVATIONAL_QUOTES.length;
  return MOTIVATIONAL_QUOTES[index];
}

export function getRandomGreeting(name: string = "Sofía"): string {
  const hour = new Date().getHours();
  let greeting = "Good Day";
  
  if (hour < 12) {
    greeting = "Good morning";
  } else if (hour < 17) {
    greeting = "Good afternoon";
  } else {
    greeting = "Good evening";
  }
  
  return `${greeting}, ${name}!`;
}
