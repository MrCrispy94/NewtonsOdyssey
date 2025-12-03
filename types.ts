
export type PlanetType = 'moon' | 'mars' | 'earth' | 'europa' | 'custom';

export interface PlanetConfig {
  id: PlanetType;
  name: string;
  gravity: number;
  color: string;
  skyColor: string; // Gradient top
  surfaceColor: string;
  difficultyMultiplier: number;
  isCustom?: boolean;
}

export interface Skin {
  id: string;
  name: string;
  description: string;
  unlockScore: number; // Career score needed
  color: string;
}

export interface GameState {
  isPlaying: boolean;
  isGameOver: boolean;
  landedSafely: boolean;
  score: number;
  fuel: number;
  message: string;
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  // Visual properties
  type: 'fire' | 'chip' | 'nugget' | 'pulse' | 'bubble' | 'smog' | 'slime';
  size: number;
  rotation?: number;
  vRot?: number; // Rotational velocity
}
