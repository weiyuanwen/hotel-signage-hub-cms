"use client";

import { useEffect, useRef } from "react";

type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  g: number;
  w: number;
  h: number;
  rot: number;
  vr: number;
  color: string;
  shape: number;
};

const COLORS = ["#22c55e", "#f59e0b", "#f472b6", "#38bdf8", "#a78bfa", "#fb7185", "#facc15", "#2dd4bf"];

export function PaySuccessFireworks({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas || !canvas.getContext) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const originX = width / 2;
    const originY = Math.max(140, height / 2 - 90);
    const pieces: Piece[] = [];
    for (let i = 0; i < 150; i += 1) {
      const angle = (Math.PI * 2 * i) / 150 + Math.random() * 0.25;
      const speed = 3.4 + Math.random() * 8.5;
      pieces.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3.2,
        g: 0.12 + Math.random() * 0.08,
        w: 5 + Math.random() * 7,
        h: 7 + Math.random() * 8,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.28,
        color: COLORS[i % COLORS.length],
        shape: i % 3,
      });
    }

    const start = performance.now();
    const frame = (now: number) => {
      const elapsed = (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);
      let alive = false;
      for (const p of pieces) {
        p.vy += p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.991;
        p.rot += p.vr;
        const life = Math.max(0, 1 - elapsed / 2.15);
        if (life <= 0 || p.y > height + 40) continue;
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = life;
        ctx.fillStyle = p.color;
        if (p.shape === 0) {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else if (p.shape === 1) {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2.2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -p.h / 2);
          ctx.lineTo(p.w / 2, p.h / 2);
          ctx.lineTo(-p.w / 2, p.h / 2);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
      if (alive && elapsed < 2.3) {
        rafRef.current = window.requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, width, height);
        rafRef.current = 0;
      }
    };

    rafRef.current = window.requestAnimationFrame(frame);
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      ctx.clearRect(0, 0, width, height);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[81] h-full w-full"
      aria-hidden
    />
  );
}
