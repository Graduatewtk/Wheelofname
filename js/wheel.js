/**
 * High-DPI Canvas Wheel of Names Engine
 * Features: Realistic physics, customizable themes, dynamic font scaling, pointer bounce
 */

const THEMES = {
    gold_orange: {
        id: 'gold_orange',
        name: 'ทอง & ส้ม (Gold & Orange)',
        colors: [
            '#F59E0B', '#F97316', '#FBBF24', '#EA580C', 
            '#D97706', '#FB923C', '#B45309', '#FFEDD5'
        ],
        textColors: [
            '#ffffff', '#ffffff', '#1e293b', '#ffffff', 
            '#ffffff', '#1e293b', '#ffffff', '#9a3412'
        ]
    },
    classroom: {
        id: 'classroom',
        name: 'ห้องเรียนสดใส (Vibrant)',
        colors: [
            '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
            '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
        ],
        textColors: ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff']
    },
    pastel: {
        id: 'pastel',
        name: 'พาสเทลนุ่มนวล (Pastel)',
        colors: [
            '#FECDD3', '#BAE6FD', '#BBF7D0', '#FEF08A', 
            '#DDD6FE', '#FED7AA', '#CFFAFE', '#E9D5FF'
        ],
        textColors: [
            '#881337', '#0369A1', '#15803D', '#854D0E', 
            '#6B21A8', '#9A3412', '#0E7490', '#581C87'
        ]
    },
    midnight: {
        id: 'midnight',
        name: 'มิดไนท์โกลด์ (Midnight Gold)',
        colors: [
            '#1E293B', '#F59E0B', '#334155', '#FBBF24', 
            '#0F172A', '#D97706', '#475569', '#F97316'
        ],
        textColors: [
            '#FDE68A', '#0F172A', '#FDE68A', '#0F172A', 
            '#FDE68A', '#0F172A', '#FDE68A', '#0F172A'
        ]
    },
    rainbow: {
        id: 'rainbow',
        name: 'สายรุ้ง (Rainbow)',
        colors: [
            '#FF4B4B', '#FF851B', '#FFDC00', '#2ECC40', 
            '#0074D9', '#B10DC9', '#01FF70', '#F012BE'
        ],
        textColors: ['#ffffff', '#ffffff', '#1e293b', '#ffffff', '#ffffff', '#ffffff', '#1e293b', '#ffffff']
    }
};

class WheelOfNames {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.items = [];
        this.theme = THEMES.gold_orange;
        
        this.currentAngle = 0; // in radians
        this.angularVelocity = 0;
        this.isSpinning = false;
        this.spinDuration = 6000; // ms
        this.spinStartTime = 0;
        this.targetAngle = 0;
        this.startAngle = 0;

        this.pointerBounce = 0; // radians offset for pointer
        this.pointerBounceVelocity = 0;
        this.lastPegIndex = -1;

        this.onSpinStart = options.onSpinStart || (() => {});
        this.onSpinEnd = options.onSpinEnd || (() => {});
        this.onTick = options.onTick || (() => {});

        this.setupDPI();
        window.addEventListener('resize', () => {
            this.setupDPI();
            this.draw();
        });
    }

    setupDPI() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const size = Math.min(rect.width, rect.height > 0 ? rect.height : rect.width, 650);
        const dpr = window.devicePixelRatio || 1;

        this.width = size;
        this.height = size;
        this.canvas.width = size * dpr;
        this.canvas.height = size * dpr;
        this.canvas.style.width = `${size}px`;
        this.canvas.style.height = `${size}px`;

        this.ctx.setTransform(1, 0, 0, 1, 0, 0); // reset
        this.ctx.scale(dpr, dpr);
        this.centerX = size / 2;
        this.centerY = size / 2;
        this.radius = (size / 2) - 24; // padding for pointer and shadow
    }

    setItems(names) {
        this.items = names.filter(n => n.trim().length > 0);
        this.draw();
    }

    setTheme(themeKey) {
        if (THEMES[themeKey]) {
            this.theme = THEMES[themeKey];
            this.draw();
        }
    }

    setDuration(seconds) {
        this.spinDuration = seconds * 1000;
    }

    spin() {
        if (this.isSpinning || this.items.length === 0) return;

        this.isSpinning = true;
        this.spinStartTime = performance.now();
        this.startAngle = this.currentAngle % (Math.PI * 2);

        // Calculate random rotations: at least 5-8 full circles + random slice offset
        const fullSpins = 6 + Math.floor(Math.random() * 4);
        const randomExtra = Math.random() * Math.PI * 2;
        this.targetAngle = this.startAngle + (fullSpins * Math.PI * 2) + randomExtra;

        this.onSpinStart();
        this.animate(this.spinStartTime);
    }

    // Cubic-quintic easing for super-smooth deceleration
    easeOutQuint(t) {
        return 1 - Math.pow(1 - t, 5);
    }

    animate(now) {
        if (!this.isSpinning) return;

        const elapsed = now - this.spinStartTime;
        const progress = Math.min(elapsed / this.spinDuration, 1);
        const easedProgress = this.easeOutQuint(progress);

        this.currentAngle = this.startAngle + (this.targetAngle - this.startAngle) * easedProgress;

        // Pointer bounce & tick calculation
        const sliceAngle = (Math.PI * 2) / this.items.length;
        // Pointer is at angle 0 (3 o'clock) or -PI/2 (12 o'clock). Let's use 0 (Right pointer / 3 o'clock).
        const normalizedAngle = (this.currentAngle) % (Math.PI * 2);
        const currentPeg = Math.floor(normalizedAngle / sliceAngle);

        if (currentPeg !== this.lastPegIndex) {
            this.lastPegIndex = currentPeg;
            this.pointerBounce = -0.32; // flick pointer up
            const speed = (1 - progress);
            this.onTick(speed);
        }

        // Pointer spring physics back to 0
        this.pointerBounce += (0 - this.pointerBounce) * 0.25;

        this.draw();

        if (progress < 1) {
            requestAnimationFrame((timestamp) => this.animate(timestamp));
        } else {
            this.isSpinning = false;
            this.pointerBounce = 0;
            this.draw();
            const winner = this.getWinner();
            this.onSpinEnd(winner);
        }
    }

    getWinner() {
        if (this.items.length === 0) return null;
        const sliceAngle = (Math.PI * 2) / this.items.length;
        // Pointer is on the RIGHT (angle 0 / 3 o'clock).
        // Since wheel rotates clockwise:
        // Angle pointing at 0 corresponds to: (2PI - (currentAngle % 2PI)) % 2PI
        let effectiveAngle = (Math.PI * 2 - (this.currentAngle % (Math.PI * 2))) % (Math.PI * 2);
        const index = Math.floor(effectiveAngle / sliceAngle) % this.items.length;
        return {
            name: this.items[index],
            index: index
        };
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        if (this.items.length === 0) {
            this.drawEmptyWheel();
            return;
        }

        const numSlices = this.items.length;
        const sliceAngle = (Math.PI * 2) / numSlices;

        this.ctx.save();
        this.ctx.translate(this.centerX, this.centerY);

        // Draw Outer Golden Glow & Rim
        this.drawOuterRim();

        // Draw Slices
        this.ctx.rotate(this.currentAngle);

        for (let i = 0; i < numSlices; i++) {
            const startAngle = i * sliceAngle;
            const endAngle = startAngle + sliceAngle;
            const color = this.theme.colors[i % this.theme.colors.length];
            const textColor = this.theme.textColors[i % this.theme.textColors.length];

            // Slice arc
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.arc(0, 0, this.radius, startAngle, endAngle);
            this.ctx.closePath();
            this.ctx.fillStyle = color;
            this.ctx.fill();

            // Slice subtle border
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.lineWidth = 1.5;
            this.ctx.stroke();

            // Slice Text
            this.drawSliceText(this.items[i], startAngle, sliceAngle, textColor, numSlices);
        }

        // Draw Rim Pegs (Golden Pins)
        for (let i = 0; i < numSlices; i++) {
            const pegAngle = i * sliceAngle;
            const pegX = (this.radius - 6) * Math.cos(pegAngle);
            const pegY = (this.radius - 6) * Math.sin(pegAngle);

            this.ctx.beginPath();
            this.ctx.arc(pegX, pegY, 4.5, 0, Math.PI * 2);
            this.ctx.fillStyle = '#fef08a';
            this.ctx.fill();
            this.ctx.lineWidth = 1.5;
            this.ctx.strokeStyle = '#d97706';
            this.ctx.stroke();
        }

        this.ctx.restore();

        // Center Golden Hub
        this.drawCenterHub();

        // Needle Pointer (Right Side pointing inward)
        this.drawPointer();
    }

    drawSliceText(text, startAngle, sliceAngle, textColor, totalItems) {
        this.ctx.save();
        const midAngle = startAngle + sliceAngle / 2;
        this.ctx.rotate(midAngle);

        // Dynamic typography sizing based on item count and radius
        let fontSize = 20;
        if (totalItems > 50) fontSize = 11;
        else if (totalItems > 35) fontSize = 13;
        else if (totalItems > 20) fontSize = 15;
        else if (totalItems > 12) fontSize = 17;
        else if (totalItems > 6) fontSize = 21;
        else fontSize = 24;

        this.ctx.fillStyle = textColor;
        this.ctx.font = `bold ${fontSize}px "Quark", "Prompt", "Kanit", sans-serif`;
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';

        // Add soft text shadow for high contrast
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
        this.ctx.shadowBlur = 4;
        this.ctx.shadowOffsetX = 1;
        this.ctx.shadowOffsetY = 1;

        // Truncate if too long
        let displayText = text;
        const maxTextWidth = this.radius - 65;
        if (this.ctx.measureText(displayText).width > maxTextWidth) {
            while (displayText.length > 2 && this.ctx.measureText(displayText + '...').width > maxTextWidth) {
                displayText = displayText.slice(0, -1);
            }
            displayText += '...';
        }

        this.ctx.fillText(displayText, this.radius - 20, 0);
        this.ctx.restore();
    }

    drawOuterRim() {
        // Outer Shadow
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.radius + 6, 0, Math.PI * 2);
        this.ctx.strokeStyle = '#f59e0b';
        this.ctx.lineWidth = 10;
        this.ctx.shadowColor = 'rgba(245, 158, 11, 0.4)';
        this.ctx.shadowBlur = 18;
        this.ctx.stroke();

        // Inner Gold Border
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.radius + 1, 0, Math.PI * 2);
        this.ctx.strokeStyle = '#d97706';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        this.ctx.restore();
    }

    drawCenterHub() {
        this.ctx.save();
        this.ctx.translate(this.centerX, this.centerY);

        // Hub Outer Gold Ring
        const hubGradient = this.ctx.createRadialGradient(0, 0, 5, 0, 0, 44);
        hubGradient.addColorStop(0, '#fef08a');
        hubGradient.addColorStop(0.5, '#f59e0b');
        hubGradient.addColorStop(1, '#b45309');

        this.ctx.beginPath();
        this.ctx.arc(0, 0, 42, 0, Math.PI * 2);
        this.ctx.fillStyle = hubGradient;
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        this.ctx.shadowBlur = 12;
        this.ctx.fill();

        // Hub Inner Plate
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 32, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.shadowBlur = 0;
        this.ctx.fill();
        this.ctx.lineWidth = 2.5;
        this.ctx.strokeStyle = '#f97316';
        this.ctx.stroke();

        // Center Icon / Text
        this.ctx.fillStyle = '#ea580c';
        this.ctx.font = 'bold 15px "Quark", "Prompt", "Kanit", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('SPIN', 0, 1);

        this.ctx.restore();
    }

    drawPointer() {
        this.ctx.save();
        // Pointer on the RIGHT border (3 o'clock) pointing directly LEFT towards center
        const pointerX = this.centerX + this.radius + 6;
        const pointerY = this.centerY;

        this.ctx.translate(pointerX, pointerY);
        this.ctx.rotate(this.pointerBounce);

        // Pointer triangle with 3D gradient
        const pGrad = this.ctx.createLinearGradient(-35, -12, 10, 12);
        pGrad.addColorStop(0, '#ea580c');
        pGrad.addColorStop(0.5, '#f97316');
        pGrad.addColorStop(1, '#f59e0b');

        this.ctx.beginPath();
        this.ctx.moveTo(8, -13);
        this.ctx.lineTo(-30, 0); // Tip pointing left
        this.ctx.lineTo(8, 13);
        this.ctx.closePath();

        this.ctx.fillStyle = pGrad;
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        this.ctx.shadowBlur = 8;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 3;
        this.ctx.fill();

        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.stroke();

        // Pointer Base Pin
        this.ctx.beginPath();
        this.ctx.arc(4, 0, 6, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fill();
        this.ctx.strokeStyle = '#d97706';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.restore();
    }

    drawEmptyWheel() {
        this.ctx.save();
        this.ctx.translate(this.centerX, this.centerY);

        // Circle
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#fffbeb';
        this.ctx.fill();
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = '#fcd34d';
        this.ctx.setLineDash([8, 8]);
        this.ctx.stroke();

        // Text
        this.ctx.fillStyle = '#d97706';
        this.ctx.font = 'bold 20px "Quark", "Prompt", "Kanit", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('กรุณาใส่รายชื่อนักเรียน', 0, -10);

        this.ctx.font = '15px "Quark", "Prompt", "Kanit", sans-serif';
        this.ctx.fillStyle = '#f59e0b';
        this.ctx.fillText('พิมพ์หรือวางรายชื่อในกล่องด้านขวา', 0, 20);

        this.ctx.restore();
    }
}

window.WheelOfNames = WheelOfNames;
window.THEMES = THEMES;
