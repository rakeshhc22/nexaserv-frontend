'use client';

import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';

const NeuralBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        let mouseX = 0;
        let mouseY = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const onMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };
        window.addEventListener('mousemove', onMouseMove);

        // ── Node setup ────────────────────────────────────────────────
        const NODE_COUNT = 90;
        type Node = {
            x: number; y: number; z: number;
            vx: number; vy: number; vz: number;
            radius: number; pulseOffset: number;
        };

        const nodes: Node[] = Array.from({ length: NODE_COUNT }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            z: Math.random() * 800 + 100,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            vz: (Math.random() - 0.5) * 0.3,
            radius: Math.random() * 2.5 + 1,
            pulseOffset: Math.random() * Math.PI * 2,
        }));

        const MAX_DIST = 180;
        let t = 0;

        const project = (node: Node) => {
            const fov = 600;
            const scale = fov / (fov + node.z);
            return {
                px: node.x * scale + (window.innerWidth / 2) * (1 - scale),
                py: node.y * scale + (window.innerHeight / 2) * (1 - scale),
                scale,
            };
        };

        const draw = () => {
            t += 0.008;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Subtle dark gradient background
            const bg = ctx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, 0,
                canvas.width / 2, canvas.height / 2, canvas.width * 0.8
            );
            bg.addColorStop(0, 'rgba(5, 8, 20, 1)');
            bg.addColorStop(1, 'rgba(0, 2, 10, 1)');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Mouse attraction
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            const mdx = (mouseX - cx) * 0.00008;
            const mdy = (mouseY - cy) * 0.00008;

            // Update nodes
            nodes.forEach(n => {
                n.x += n.vx + mdx * n.z * 0.5;
                n.y += n.vy + mdy * n.z * 0.5;
                n.z += n.vz;

                // Wrap around
                if (n.x < 0) n.x = canvas.width;
                if (n.x > canvas.width) n.x = 0;
                if (n.y < 0) n.y = canvas.height;
                if (n.y > canvas.height) n.y = 0;
                if (n.z < 50) n.z = 900;
                if (n.z > 900) n.z = 50;
            });

            // Draw connections
            for (let i = 0; i < nodes.length; i++) {
                const a = nodes[i];
                const pa = project(a);
                for (let j = i + 1; j < nodes.length; j++) {
                    const b = nodes[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > MAX_DIST) continue;

                    const pb = project(b);
                    const alpha = (1 - dist / MAX_DIST) * 0.45 * Math.min(pa.scale, pb.scale) * 1.5;

                    // Animated data pulse along connection
                    const pulsePos = (t * 0.6) % 1;
                    const px = pa.px + (pb.px - pa.px) * pulsePos;
                    const py = pa.py + (pb.py - pa.py) * pulsePos;

                    // Connection line — cyan/blue AI palette
                    const grad = ctx.createLinearGradient(pa.px, pa.py, pb.px, pb.py);
                    grad.addColorStop(0, `rgba(0, 200, 255, ${alpha * 0.6})`);
                    grad.addColorStop(0.5, `rgba(100, 80, 255, ${alpha})`);
                    grad.addColorStop(1, `rgba(0, 200, 255, ${alpha * 0.6})`);

                    ctx.beginPath();
                    ctx.moveTo(pa.px, pa.py);
                    ctx.lineTo(pb.px, pb.py);
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = pa.scale * 0.8;
                    ctx.stroke();

                    // Data pulse dot
                    ctx.beginPath();
                    ctx.arc(px, py, 1.5 * Math.min(pa.scale, pb.scale), 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(150, 220, 255, ${alpha * 1.5})`;
                    ctx.fill();
                }
            }

            // Draw nodes
            nodes.forEach(n => {
                const { px, py, scale } = project(n);
                const pulse = Math.sin(t * 2 + n.pulseOffset) * 0.4 + 0.8;
                const r = n.radius * scale * pulse;

                // Outer glow
                const glow = ctx.createRadialGradient(px, py, 0, px, py, r * 6);
                glow.addColorStop(0, `rgba(80, 180, 255, ${0.25 * scale})`);
                glow.addColorStop(0.4, `rgba(80, 100, 255, ${0.1 * scale})`);
                glow.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.beginPath();
                ctx.arc(px, py, r * 6, 0, Math.PI * 2);
                ctx.fillStyle = glow;
                ctx.fill();

                // Node core
                const core = ctx.createRadialGradient(px, py, 0, px, py, r);
                core.addColorStop(0, `rgba(220, 240, 255, ${scale})`);
                core.addColorStop(1, `rgba(60, 160, 255, ${scale * 0.8})`);
                ctx.beginPath();
                ctx.arc(px, py, r, 0, Math.PI * 2);
                ctx.fillStyle = core;
                ctx.fill();
            });

            // Subtle scanline overlay
            ctx.fillStyle = 'rgba(0, 10, 30, 0.03)';
            for (let y = 0; y < canvas.height; y += 4) {
                ctx.fillRect(0, y, canvas.width, 1);
            }

            animationId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
        };
    }, []);

    return (
        <Box
            sx={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                pointerEvents: 'none',
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                }}
            />
        </Box>
    );
};

export default NeuralBackground;