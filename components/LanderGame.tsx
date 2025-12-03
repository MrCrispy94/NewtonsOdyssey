import React, { useEffect, useRef, useCallback } from 'react';
import { PlanetConfig, Skin, Particle } from '../types';
import { GAME_CONSTANTS } from '../constants';

interface LanderGameProps {
  planet: PlanetConfig;
  skin: Skin;
  onGameOver: (score: number, landed: boolean) => void;
  isActive: boolean;
}

const LanderGame: React.FC<LanderGameProps> = ({ planet, skin, onGameOver, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Game Physics State
  const ship = useRef({
    x: 0,
    y: 50,
    vx: 0,
    vy: 0,
    rotation: 0,
    fuel: GAME_CONSTANTS.INITIAL_FUEL,
    thrusting: false,
    width: GAME_CONSTANTS.SHIP_WIDTH,
    height: GAME_CONSTANTS.SHIP_HEIGHT
  });

  const particles = useRef<Particle[]>([]);
  const stars = useRef<{x: number, y: number, size: number, alpha: number}[]>([]);
  
  // Initialize Stars
  useEffect(() => {
    if (!stars.current.length && canvasRef.current) {
        const w = canvasRef.current.width;
        const h = canvasRef.current.height;
        for(let i = 0; i < 50; i++) {
            stars.current.push({
                x: Math.random() * w,
                y: Math.random() * h,
                size: Math.random() * 2,
                alpha: Math.random()
            });
        }
    }
  }, []);

  const handleStartThrust = useCallback(() => {
    if (ship.current.fuel > 0) ship.current.thrusting = true;
  }, []);

  const handleEndThrust = useCallback(() => {
    ship.current.thrusting = false;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        handleStartThrust();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        handleEndThrust();
      }
    };

    if (isActive) {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isActive, handleStartThrust, handleEndThrust]);

  const resetShip = useCallback((canvas: HTMLCanvasElement) => {
    ship.current = {
      x: canvas.width / 2,
      y: 50,
      vx: (Math.random() - 0.5) * 2,
      vy: 0,
      rotation: 0,
      fuel: GAME_CONSTANTS.INITIAL_FUEL,
      thrusting: false,
      width: GAME_CONSTANTS.SHIP_WIDTH,
      height: GAME_CONSTANTS.SHIP_HEIGHT
    };
    particles.current = [];
  }, []);

  // --- SKIN RENDERING FUNCTIONS ---
  const drawSkin = (ctx: CanvasRenderingContext2D, s: any) => {
    const w = s.width;
    const h = s.height;

    switch (skin.id) {
        case 'saucer':
            // Dome
            ctx.fillStyle = '#bae6fd';
            ctx.beginPath();
            ctx.arc(0, -5, w/2, Math.PI, 0);
            ctx.fill();
            // Disk
            ctx.fillStyle = '#a3e635';
            ctx.beginPath();
            ctx.ellipse(0, 0, w, h/2, 0, 0, Math.PI * 2);
            ctx.fill();
            // Lights
            ctx.fillStyle = s.thrusting ? '#facc15' : '#166534';
            [-15, 0, 15].forEach(ox => {
                ctx.beginPath(); ctx.arc(ox, 2, 2, 0, Math.PI*2); ctx.fill();
            });
            break;

        case 'burger':
            // Bottom Bun
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.roundRect(-w/2, 5, w, 8, [0,0,5,5]);
            ctx.fill();
            // Lettuce
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-w/2, 5);
            ctx.lineTo(w/2, 5);
            ctx.stroke();
            // Patty
            ctx.fillStyle = '#78350f';
            ctx.fillRect(-w/2 + 2, -2, w - 4, 6);
            // Cheese
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.moveTo(-w/2 + 2, -2); ctx.lineTo(w/2 - 2, -2); ctx.lineTo(0, 2); ctx.fill();
            // Top Bun
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.roundRect(-w/2, -14, w, 12, [10,10,2,2]);
            ctx.fill();
            // Sesame Seeds
            ctx.fillStyle = '#fef3c7';
            ctx.beginPath(); ctx.arc(-5, -10, 1, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(5, -8, 1, 0, Math.PI*2); ctx.fill();
            break;

        case 'banana':
            ctx.save();
            ctx.rotate(Math.PI / 4);
            ctx.fillStyle = '#fef08a'; // Yellow
            ctx.strokeStyle = '#854d0e'; // Brown tip
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-10, -15);
            ctx.quadraticCurveTo(15, 0, -10, 15);
            ctx.quadraticCurveTo(0, 0, -10, -15);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
            break;

        case 'trash':
            // Can
            ctx.fillStyle = '#94a3b8'; // Metal
            ctx.fillRect(-10, -12, 20, 24);
            // Ribs
            ctx.fillStyle = '#64748b';
            ctx.fillRect(-10, -5, 20, 2);
            ctx.fillRect(-10, 5, 20, 2);
            // Lid
            ctx.fillStyle = '#cbd5e1';
            ctx.beginPath();
            ctx.moveTo(-12, -12);
            ctx.lineTo(12, -12);
            ctx.lineTo(8, -16);
            ctx.lineTo(-8, -16);
            ctx.fill();
            // Handle
            ctx.fillStyle = '#475569';
            ctx.fillRect(-4, -18, 8, 2);
            break;
            
        case 'toilet':
            // Bowl
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(-10, 0);
            ctx.quadraticCurveTo(-10, 15, 0, 15);
            ctx.quadraticCurveTo(10, 15, 10, 0);
            ctx.fill();
            // Tank
            ctx.fillRect(-12, -15, 24, 15);
            // Lid
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(-13, -17, 26, 3);
            break;

        case 'default':
        default:
            // Legs
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-w/2 + 2, h/2 - 5);
            ctx.lineTo(-w/2 - 5, h/2 + 5);
            ctx.moveTo(w/2 - 2, h/2 - 5);
            ctx.lineTo(w/2 + 5, h/2 + 5);
            ctx.stroke();

            // Main Body
            ctx.fillStyle = '#e2e8f0'; 
            ctx.beginPath();
            ctx.moveTo(0, -h/2);
            ctx.lineTo(w/2, h/2 - 5);
            ctx.lineTo(-w/2, h/2 - 5);
            ctx.closePath();
            ctx.fill();
            
            // Cockpit
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(0, -2, 5, 0, Math.PI * 2);
            ctx.fill();
            break;
    }
  }

  const createExhaustParticles = (s: any) => {
    switch(skin.id) {
        case 'saucer':
            // PULSE: Rare emission, expanding ring
            if (Math.random() > 0.85) {
                particles.current.push({
                    type: 'pulse',
                    x: s.x,
                    y: s.y + 10,
                    vx: 0,
                    vy: 2.0,
                    life: 1.0,
                    color: '#a3e635',
                    size: 5
                });
            }
            break;
        
        case 'burger':
            // CHIPS & NUGGETS
            for (let i = 0; i < 2; i++) {
                const isChip = Math.random() > 0.4;
                particles.current.push({
                    type: isChip ? 'chip' : 'nugget',
                    x: s.x + (Math.random() - 0.5) * 10,
                    y: s.y + s.height/2,
                    vx: (Math.random() - 0.5) * 4,
                    vy: Math.random() * 4 + 2,
                    life: 1.0,
                    color: isChip ? '#fbbf24' : '#78350f', // Yellow or Brown
                    size: isChip ? 6 : 4,
                    rotation: Math.random() * Math.PI,
                    vRot: (Math.random() - 0.5) * 0.3
                });
            }
            break;
        
        case 'toilet':
            // BUBBLES
            for (let i = 0; i < 3; i++) {
                particles.current.push({
                    type: 'bubble',
                    x: s.x + (Math.random() - 0.5) * 10,
                    y: s.y + s.height/2 + 5,
                    vx: (Math.random() - 0.5) * 1,
                    vy: Math.random() * 3 + 2,
                    life: 1.0,
                    color: '#60a5fa',
                    size: Math.random() * 3 + 2
                });
            }
            break;

        case 'trash':
            // SMOG
            if (Math.random() > 0.5) {
                particles.current.push({
                    type: 'smog',
                    x: s.x + (Math.random() - 0.5) * 8,
                    y: s.y + s.height/2,
                    vx: (Math.random() - 0.5) * 2,
                    vy: Math.random() * 2 + 1,
                    life: 1.0,
                    color: '#4b5563', // Grey
                    size: Math.random() * 5 + 5
                });
            }
            break;

        case 'banana':
             // SLIME
             for (let i = 0; i < 2; i++) {
                particles.current.push({
                    type: 'slime',
                    x: s.x + (Math.random() - 0.5) * 5,
                    y: s.y + s.height/2,
                    vx: (Math.random() - 0.5) * 1,
                    vy: Math.random() * 5 + 3,
                    life: 1.0,
                    color: '#fef08a',
                    size: Math.random() * 2 + 2
                });
            }
            break;

        case 'default':
        default:
            // FIRE
            for (let i = 0; i < 3; i++) {
                particles.current.push({
                  type: 'fire',
                  x: s.x + (Math.random() - 0.5) * 8,
                  y: s.y + s.height / 2,
                  vx: (Math.random() - 0.5) * 2,
                  vy: Math.random() * 4 + 2,
                  life: 1.0,
                  color: i % 2 === 0 ? '#fbbf24' : '#ef4444',
                  size: 3
                });
              }
            break;
    }
  }

  // Main Loop
  const animate = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!isActive) return;

    // 1. Physics
    const s = ship.current;
    s.vy += (planet.gravity * 0.02);

    if (s.thrusting && s.fuel > 0) {
      s.vy -= GAME_CONSTANTS.THRUST_POWER;
      s.fuel -= GAME_CONSTANTS.FUEL_CONSUMPTION;
      createExhaustParticles(s);
    } else {
        s.thrusting = false;
    }

    s.x += s.vx;
    s.y += s.vy;

    if (s.x < 0) { s.x = 0; s.vx *= -0.5; }
    if (s.x > canvas.width) { s.x = canvas.width; s.vx *= -0.5; }
    if (s.y < 0) { s.y = 0; s.vy = 0; }

    // Particle Physics
    for (let i = particles.current.length - 1; i >= 0; i--) {
      const p = particles.current[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.03; // Fade out speed
      
      // Growth for some types
      if (p.type === 'pulse') p.size += 1.5;
      if (p.type === 'smog') p.size += 0.2;
      
      // Rotation
      if (p.rotation !== undefined && p.vRot !== undefined) {
          p.rotation += p.vRot;
      }

      if (p.life <= 0) particles.current.splice(i, 1);
    }

    // 2. Render
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, planet.skyColor);
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    stars.current.forEach(star => {
        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    const groundY = canvas.height - 40; // Lift ground up slightly for visibility on phones
    ctx.fillStyle = planet.surfaceColor;
    ctx.fillRect(0, groundY, canvas.width, 40);

    // Particles Rendering
    particles.current.forEach(p => {
        ctx.globalAlpha = p.life;
        
        switch (p.type) {
            case 'pulse':
                // Semi-circle pulses (expanding rings)
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI, false); // Bottom semi-circle
                ctx.stroke();
                break;
            
            case 'chip':
                // Spinning Rectangles (French Fries)
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation || 0);
                ctx.fillStyle = p.color;
                ctx.fillRect(-2, -p.size/2, 4, p.size);
                ctx.restore();
                break;

            case 'nugget':
                // Irregular blobs
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'bubble':
                // Blue bubbles with shine
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                // Shine
                ctx.fillStyle = 'white';
                ctx.globalAlpha = p.life * 0.8;
                ctx.beginPath();
                ctx.arc(p.x - p.size*0.3, p.y - p.size*0.3, p.size*0.3, 0, Math.PI*2);
                ctx.fill();
                break;

            case 'smog':
                // Large fuzzy circles
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life * 0.4;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'slime':
            case 'fire':
            default:
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
    });
    ctx.globalAlpha = 1.0;

    // Ship
    ctx.save();
    ctx.translate(s.x, s.y);
    drawSkin(ctx, s);
    ctx.restore();

    // 3. Collision
    let collisionY = s.y + s.height/2;
    if (skin.id === 'toilet') collisionY += 5;
    if (skin.id === 'saucer') collisionY -= 5;

    if (collisionY >= groundY) {
        s.y = groundY - (collisionY - s.y); // Snap to surface
        
        const safeSpeed = s.vy < GAME_CONSTANTS.SAFE_LANDING_VELOCITY;
        if (safeSpeed) {
            // New Scoring Formula: Priority on Low Velocity
            const velocityMultiplier = 1 + (GAME_CONSTANTS.SAFE_LANDING_VELOCITY - s.vy) * 4;
            const fuelBase = Math.floor(s.fuel * 10);
            const difficulty = planet.difficultyMultiplier;
            
            // Ensure multiplier is at least 1
            const safeMultiplier = Math.max(1, velocityMultiplier);
            
            const finalScore = Math.floor(fuelBase * safeMultiplier * difficulty);
            
            onGameOver(finalScore, true);
        } else {
            onGameOver(0, false);
        }
        return;
    }

    // HUD
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(`ALT: ${(groundY - collisionY).toFixed(1)}m`, 15, 25);
    
    const vel = s.vy.toFixed(1);
    ctx.fillStyle = s.vy > GAME_CONSTANTS.SAFE_LANDING_VELOCITY ? '#ef4444' : '#4ade80';
    ctx.fillText(`VEL: ${vel} m/s`, 15, 45);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(`FUEL`, 15, 65);
    ctx.fillStyle = '#334155';
    ctx.fillRect(55, 55, 100, 10);
    ctx.fillStyle = s.fuel > 20 ? '#fbbf24' : '#ef4444';
    ctx.fillRect(55, 55, s.fuel, 10);

    requestRef.current = requestAnimationFrame(animate);

  }, [isActive, planet, onGameOver, skin]);

  useEffect(() => {
    const handleResize = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
    };

    window.addEventListener('resize', handleResize);
    
    // Initial size set
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Re-initialize logic
    const canvas = canvasRef.current;
    if (canvas && isActive) {
        resetShip(canvas);
        if (stars.current.length === 0) {
            const w = canvas.width;
            const h = canvas.height;
            for(let i = 0; i < 50; i++) {
                stars.current.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    size: Math.random() * 2,
                    alpha: Math.random()
                });
            }
        }
        requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [resetShip, isActive, animate]);

  return (
    <canvas 
        ref={canvasRef} 
        className="w-full h-full block touch-none cursor-pointer"
        onMouseDown={handleStartThrust}
        onMouseUp={handleEndThrust}
        onTouchStart={(e) => { e.preventDefault(); handleStartThrust(); }}
        onTouchEnd={(e) => { e.preventDefault(); handleEndThrust(); }}
    />
  );
};

export default LanderGame;