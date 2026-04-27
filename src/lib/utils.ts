import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTon(amount: number) {
  return `${amount.toFixed(2)} TON`;
}

export const LOTTERY_TIERS = [
  { id: 't1', cost: 0.1, participants: 20, prize: 1.5 },
  { id: 't2', cost: 1, participants: 10, prize: 9 },
  { id: 't3', cost: 5, participants: 10, prize: 48 },
  { id: 't4', cost: 1, participants: 100, prize: 95 },
];

export const BOX_PROBABILITIES = [
  { reward: '1_TON', amount: 1, chance: 0.19 },
  { reward: '0_5_TON', amount: 0.5, chance: 0.5 },
  { reward: '2_TON', amount: 2, chance: 0.009 },
  { reward: '10_TON', amount: 10, chance: 0.001 },
  { reward: 'LOSE', amount: 0, chance: 0.3 },
];

export function rollMysteryBox() {
  const roll = Math.random();
  let cumulative = 0;
  for (const prob of BOX_PROBABILITIES) {
    cumulative += prob.chance;
    if (roll < cumulative) return prob;
  }
  return BOX_PROBABILITIES[BOX_PROBABILITIES.length - 1];
}
