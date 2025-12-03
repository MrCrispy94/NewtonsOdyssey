import { PlanetConfig, Skin } from './types';

export const PLANETS: Record<string, PlanetConfig> = {
  moon: {
    id: 'moon',
    name: 'The Moon',
    gravity: 1.6,
    color: '#e2e8f0',
    skyColor: '#0f172a',
    surfaceColor: '#64748b',
    difficultyMultiplier: 1,
  },
  mars: {
    id: 'mars',
    name: 'Mars',
    gravity: 3.7,
    color: '#fdba74',
    skyColor: '#451a03',
    surfaceColor: '#c2410c',
    difficultyMultiplier: 1.5,
  },
  europa: {
    id: 'europa',
    name: 'Europa',
    gravity: 1.3,
    color: '#bfdbfe',
    skyColor: '#020617',
    surfaceColor: '#93c5fd',
    difficultyMultiplier: 1.2,
  },
  earth: {
    id: 'earth',
    name: 'Earth',
    gravity: 9.8,
    color: '#4ade80',
    skyColor: '#1e3a8a',
    surfaceColor: '#15803d',
    difficultyMultiplier: 3.0,
  },
};

export const SKINS: Skin[] = [
  {
    id: 'default',
    name: 'Odyssey Mk.I',
    description: 'Standard issue lunar module.',
    unlockScore: 0,
    color: '#e2e8f0'
  },
  {
    id: 'saucer',
    name: 'The Invader',
    description: 'We come in peace... mostly.',
    unlockScore: 1000,
    color: '#a3e635'
  },
  {
    id: 'burger',
    name: 'McFlyer',
    description: 'Fast food delivery at terminal velocity.',
    unlockScore: 2500,
    color: '#fbbf24'
  },
  {
    id: 'banana',
    name: 'Potassium Pod',
    description: 'Slippery handling guaranteed.',
    unlockScore: 5000,
    color: '#fef08a'
  },
  {
    id: 'trash',
    name: 'Oscar-1',
    description: 'One man\'s trash is another man\'s spaceship.',
    unlockScore: 10000,
    color: '#94a3b8'
  },
  {
    id: 'toilet',
    name: 'Throne 3000',
    description: 'Flush controls not included.',
    unlockScore: 15000,
    color: '#ffffff'
  }
];

export const GAME_CONSTANTS = {
  FPS: 60,
  SHIP_WIDTH: 24,
  SHIP_HEIGHT: 24,
  INITIAL_FUEL: 100,
  THRUST_POWER: 0.15, // Upward acceleration per frame
  FUEL_CONSUMPTION: 0.3,
  SAFE_LANDING_VELOCITY: 2.5, // m/s
  PAD_WIDTH: 80,
};