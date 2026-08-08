import React, { useEffect, useRef } from 'react';

interface NetworkBackgroundProps {
  theme: "dark" | "light";
}

export default function NetworkBackground({ theme }: NetworkBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const labels = ["AI", "GPT", "ML", "{}", "🤖", "🧠", "⚡", "⚙️", "</>", "💬", "API"];

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      label: string | null;

      constructor() {
        this.x = Math.random() * (canvas?.width || window.innerWidth);
        this.y = Math.random() * (canvas?.height || window.innerHeight);
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        
        // 12% chance to be a "special" node with a label/logo
        if (Math.random() < 0.12) {
          this.label = labels[Math.floor(Math.random() * labels.length)];
          this.radius = Math.random() * 2 + 4; // larger radius for labeled nodes
        } else {
          this.label = null;
          this.radius = Math.random() * 1.5 + 1; // slightly larger normal nodes
        }
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > (canvas?.width || 0)) this.vx = -this.vx;
        if (this.y < 0 || this.y > (canvas?.height || 0)) this.vy = -this.vy;
      }

      draw() {
        if (!ctx) return;
        
        const isDark = themeRef.current === 'dark';
        const nodeColor = isDark ? 'rgba(0, 255, 209, 0.6)' : 'rgba(13, 148, 136, 0.6)';
        const haloColor = isDark ? 'rgba(0, 255, 209, 0.15)' : 'rgba(13, 148, 136, 0.15)';
        const labelColor = isDark ? 'rgba(0, 255, 209, 0.9)' : 'rgba(13, 148, 136, 0.9)';

        if (this.label) {
          // Draw a glowing halo around special nodes
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius + 8, 0, Math.PI * 2);
          ctx.fillStyle = haloColor;
          ctx.fill();

          // Draw the main node
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fillStyle = nodeColor;
          ctx.fill();
          
          // Draw the label/logo
          ctx.font = "12px monospace";
          ctx.fillStyle = labelColor;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(this.label, this.x, this.y - 18);
        } else {
          // Draw normal node
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fillStyle = nodeColor;
          ctx.fill();
        }
      }
    }

    const initParticles = () => {
      particles = [];
      const numParticles = Math.min(Math.floor((canvas.width * canvas.height) / 10000), 150);
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isDark = themeRef.current === 'dark';
      const lineColor = isDark ? '0, 255, 209' : '13, 148, 136';

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 160) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${lineColor}, ${0.25 * (1 - distance / 160)})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1] opacity-90 transition-opacity duration-700"
    />
  );
}
