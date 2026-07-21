/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import * as Lucide from 'lucide-react';

export const HABIT_ICONS = {
  Droplet: { component: Lucide.Droplet, label: 'Hydration' },
  BookOpen: { component: Lucide.BookOpen, label: 'Reading' },
  Dumbbell: { component: Lucide.Dumbbell, label: 'Exercise' },
  Moon: { component: Lucide.Moon, label: 'Sleep Early' },
  Coffee: { component: Lucide.Coffee, label: 'Routine/Coffee' },
  Brain: { component: Lucide.Brain, label: 'Meditation' },
  Apple: { component: Lucide.Apple, label: 'Healthy Eating' },
  Heart: { component: Lucide.Heart, label: 'Self Care' },
  PenTool: { component: Lucide.PenTool, label: 'Journaling' },
  Sparkles: { component: Lucide.Sparkles, label: 'Routine' },
  Laptop: { component: Lucide.Laptop, label: 'Coding/Work' },
  Smile: { component: Lucide.Smile, label: 'Mindset/Mood' },
};

export type HabitIconName = keyof typeof HABIT_ICONS;

interface HabitIconProps extends React.ComponentPropsWithoutRef<'svg'> {
  name: string;
  className?: string;
  size?: number;
}

export const HabitIcon: React.FC<HabitIconProps> = ({ name, size = 20, className = '', ...props }) => {
  const iconObj = HABIT_ICONS[name as HabitIconName] || HABIT_ICONS.Sparkles;
  const IconComponent = iconObj.component;
  return <IconComponent size={size} className={className} {...props} />;
};
