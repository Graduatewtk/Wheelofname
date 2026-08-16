/**
 * Confetti celebration particle engine (Zero external dependencies)
 */
class ConfettiEngine {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationId = null;
        this.colors = [
            '#f59e0b', '#f97316', '#fbbf24', '#ea580c', 
            '#fb923c', '#fef08a', '#e11d48', '#10b981', '#3b82f6', '#8b5cf6'
        ];
    }

    init() {
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'confetti-canvas';
            this.canvas.style.position = 'fixed';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100vw';
            this.canvas.style.height = '100vh';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.zIndex = '9999';
            document.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');
            this.resize();
            window.addEventListener('resize', () => this.resize());
        }
    }

    resize() {
        if (!this.canvas) return;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width * window.devicePixelRatio;
        this.canvas.height = this.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    fire(durationMs = 4000) {
        this.init();
        const count = 180;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: this.width * (0.2 + Math.random() * 0.6),
                y: this.height * 0.4 + (Math.random() * 50),
                vx: (Math.random() - 0.5) * 16,
                vy: -Math.random() * 14 - 6,
                size: Math.random() * 10 + 6,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                rotation: Math.random() * 360,
                rSpeed: (Math.random() - 0.5) * 12,
                opacity: 1,
                shape: Math.random() > 0.4 ? 'rect' : 'circle',
                gravity: 0.35,
                drag: 0.985
            });
        }

        if (!this.animationId) {
            this.animate();
        }

        setTimeout(() => {
            // Stop generating new particles
        }, durationMs);
    }

    animate() {
        if (this.particles.length === 0) {
            if (this.ctx && this.canvas) {
                this.ctx.clearRect(0, 0, this.width, this.height);
            }
            this.animationId = null;
            return;
        }

        this.ctx.clearRect(0, 0, this.width, this.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= p.drag;
            p.vy *= p.drag;
            p.rotation += p.rSpeed;
            p.opacity -= 0.005;

            if (p.opacity <= 0 || p.y > this.height + 50) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate((p.rotation * Math.PI) / 180);
            this.ctx.globalAlpha = Math.max(0, p.opacity);
            this.ctx.fillStyle = p.color;

            if (p.shape === 'rect') {
                this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            } else {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size / 2.5, 0, Math.PI * 2);
                this.ctx.fill();
            }
            this.ctx.restore();
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    clear() {
        this.particles = [];
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.width, this.height);
        }
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}

window.confettiEngine = new ConfettiEngine();
