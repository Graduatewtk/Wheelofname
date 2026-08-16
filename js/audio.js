/**
 * Audio Engine using Web Audio API
 * Generates realistic tick sounds and victory fanfare without external audio files
 */
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.volume = 0.7;
        this.lastTickTime = 0;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setMuted(muted) {
        this.enabled = !muted;
    }

    setVolume(val) {
        this.volume = Math.max(0, Math.min(1, val));
    }

    playTick(speedFactor = 1) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        // Prevent sound overlapping too fast
        if (now - this.lastTickTime < 0.02) return;
        this.lastTickTime = now;

        try {
            // Mechanical click sound
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1200 + (speedFactor * 400), now);
            filter.Q.setValueAtTime(3.0, now);

            // Short percussive pulse
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(600 + Math.random() * 200, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.025);

            gain.gain.setValueAtTime(this.volume * 0.45, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.025);
        } catch (e) {
            console.warn('Audio playback error', e);
        }
    }

    playWinner() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [
            { f: 523.25, t: 0, d: 0.12 },    // C5
            { f: 659.25, t: 0.12, d: 0.12 }, // E5
            { f: 783.99, t: 0.24, d: 0.15 }, // G5
            { f: 1046.50, t: 0.38, d: 0.6 }  // C6 (Triumph)
        ];

        notes.forEach(n => {
            const noteTime = now + n.t;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(n.f, noteTime);

            gain.gain.setValueAtTime(0, noteTime);
            gain.gain.linearRampToValueAtTime(this.volume * 0.5, noteTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, noteTime + n.d);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(noteTime);
            osc.stop(noteTime + n.d);
        });

        // Add subtle celebratory shimmer
        setTimeout(() => {
            if (!this.enabled || !this.ctx) return;
            const shimmerTime = this.ctx.currentTime;
            [1318.51, 1567.98, 2093.00].forEach((freq, i) => {
                const o = this.ctx.createOscillator();
                const g = this.ctx.createGain();
                o.type = 'sine';
                o.frequency.setValueAtTime(freq, shimmerTime + (i * 0.08));
                g.gain.setValueAtTime(this.volume * 0.2, shimmerTime + (i * 0.08));
                g.gain.exponentialRampToValueAtTime(0.0001, shimmerTime + (i * 0.08) + 0.4);
                o.connect(g);
                g.connect(this.ctx.destination);
                o.start(shimmerTime + (i * 0.08));
                o.stop(shimmerTime + (i * 0.08) + 0.45);
            });
        }, 400);
    }
}

window.soundEngine = new SoundEngine();
