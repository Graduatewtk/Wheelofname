/**
 * Main Application Controller for Classroom Wheel of Names
 * Handles State, LocalStorage, Audio, Confetti, Themes, Classroom Presets, and DOM interactions
 */

const DEFAULT_NAMES = [
    'เด็กชาย ธนากร ใจดี',
    'เด็กหญิง วริศรา มณีโชติ',
    'เด็กชาย ภานุพงศ์ แสงทอง',
    'เด็กหญิง กานดา สุขสมบูรณ์',
    'เด็กชาย ธีรภัทร มุ่งเจริญ',
    'เด็กหญิง พิชญา สดใส',
    'เด็กชาย ชัยวัฒน์ รุ่งเรือง',
    'เด็กหญิง ณัฐนิชา ปัญญาดี',
    'เด็กชาย ภูมิพัฒน์ ศรีสุข',
    'เด็กหญิง นลินทิพย์ แจ่มจรัส',
    'เด็กชาย ศุภชัย วิริยะ',
    'เด็กหญิง ปรียาภรณ์ เจริญสุข'
];

class AppController {
    constructor() {
        this.wheel = null;
        this.names = [];
        this.winnerHistory = [];
        this.classes = {};
        this.currentClassId = 'class-default';
        this.lastWinner = null;
        this.settings = {
            duration: 6,
            theme: 'gold_orange',
            winnerTitle: 'ขอแสดงความยินดีกับ!',
            volume: 70,
            muted: false,
            darkMode: false
        };

        this.init();
    }

    init() {
        this.loadSettings();
        this.loadClasses();
        this.loadHistory();

        // Initialize Wheel Engine
        this.wheel = new WheelOfNames('wheel-canvas', {
            onSpinStart: () => this.handleSpinStart(),
            onSpinEnd: (winner) => this.handleSpinEnd(winner),
            onTick: (speed) => window.soundEngine.playTick(speed)
        });

        this.wheel.setTheme(this.settings.theme);
        this.wheel.setDuration(this.settings.duration);

        // Bind DOM Elements and Events
        this.bindEvents();

        // Initial Data Load
        this.loadRosterFromCurrentClass();
        this.updateHistoryUI();
        this.renderThemeOptions();
        this.applyThemeMode();

        // Welcome Setup
        window.soundEngine.setMuted(this.settings.muted);
        window.soundEngine.setVolume(this.settings.volume / 100);
    }

    // --- State & LocalStorage Management ---

    loadSettings() {
        try {
            const saved = localStorage.getItem('won_settings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Failed to load settings', e);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('won_settings', JSON.stringify(this.settings));
        } catch (e) {
            console.warn('Failed to save settings', e);
        }
    }

    loadClasses() {
        try {
            const saved = localStorage.getItem('won_classes');
            if (saved) {
                this.classes = JSON.parse(saved);
            } else {
                this.classes = {
                    'class-default': {
                        id: 'class-default',
                        name: 'ห้องเรียนตัวอย่าง (ม.1/1)',
                        names: [...DEFAULT_NAMES]
                    }
                };
            }
        } catch (e) {
            this.classes = {
                'class-default': {
                    id: 'class-default',
                    name: 'ห้องเรียนตัวอย่าง (ม.1/1)',
                    names: [...DEFAULT_NAMES]
                }
            };
        }
        this.updateClassSelectDropdown();
    }

    saveClasses() {
        try {
            localStorage.setItem('won_classes', JSON.stringify(this.classes));
        } catch (e) {
            console.warn('Failed to save classes', e);
        }
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('won_history');
            if (saved) {
                this.winnerHistory = JSON.parse(saved);
            }
        } catch (e) {
            this.winnerHistory = [];
        }
    }

    saveHistory() {
        try {
            localStorage.setItem('won_history', JSON.stringify(this.winnerHistory));
        } catch (e) {
            console.warn('Failed to save history', e);
        }
    }

    // --- Roster & Input Sync ---

    loadRosterFromCurrentClass() {
        const cls = this.classes[this.currentClassId] || this.classes['class-default'];
        if (cls && cls.names) {
            this.names = [...cls.names];
        } else {
            this.names = [...DEFAULT_NAMES];
        }
        const textarea = document.getElementById('names-input');
        if (textarea) {
            textarea.value = this.names.join('\n');
        }
        this.syncNamesFromTextarea();
    }

    syncNamesFromTextarea() {
        const textarea = document.getElementById('names-input');
        const raw = textarea.value;
        this.names = raw
            .split('\n')
            .map(n => n.trim())
            .filter(n => n.length > 0);

        this.wheel.setItems(this.names);
        this.updateCounts();

        // Update current class object
        if (this.classes[this.currentClassId]) {
            this.classes[this.currentClassId].names = [...this.names];
            this.saveClasses();
        }
    }

    updateCounts() {
        const count = this.names.length;
        const totalBadge = document.getElementById('badge-total-count');
        const nameCountLabel = document.getElementById('name-count-label');
        if (totalBadge) totalBadge.textContent = count;
        if (nameCountLabel) nameCountLabel.textContent = `ทั้งหมด ${count} คน`;

        const spinBtn = document.getElementById('btn-spin-action');
        if (spinBtn) {
            spinBtn.disabled = count === 0 || this.wheel.isSpinning;
        }
    }

    updateClassSelectDropdown() {
        const select = document.getElementById('classroom-select');
        if (!select) return;

        select.innerHTML = '';
        Object.values(this.classes).forEach(cls => {
            const opt = document.createElement('option');
            opt.value = cls.id;
            opt.textContent = cls.name;
            if (cls.id === this.currentClassId) opt.selected = true;
            select.appendChild(opt);
        });
    }

    // --- Event Binding ---

    bindEvents() {
        // Textarea Input
        const textarea = document.getElementById('names-input');
        textarea.addEventListener('input', () => this.syncNamesFromTextarea());

        // Spin triggers
        const spinBtn = document.getElementById('btn-spin-action');
        spinBtn.addEventListener('click', () => this.startSpin());

        const canvasContainer = document.getElementById('wheel-container');
        canvasContainer.addEventListener('click', () => this.startSpin());

        // Keyboard Spacebar to spin
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && document.activeElement !== textarea && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                this.startSpin();
            }
            if (e.key === 'Escape') {
                this.closeAllModals();
                this.exitFullscreen();
            }
        });

        // Tabs
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                const targetId = btn.getAttribute('data-tab');
                const targetContent = document.getElementById(targetId);
                if (targetContent) targetContent.classList.add('active');
            });
        });

        // Classroom selection & creation
        const classSelect = document.getElementById('classroom-select');
        classSelect.addEventListener('change', (e) => {
            this.currentClassId = e.target.value;
            this.loadRosterFromCurrentClass();
        });

        const btnSaveClass = document.getElementById('btn-save-class');
        btnSaveClass.addEventListener('click', () => {
            const currentName = this.classes[this.currentClassId]?.name || 'ห้องเรียน';
            const newName = prompt('ตั้งชื่อห้องเรียน / กลุ่มวิชา:', currentName);
            if (newName && newName.trim()) {
                if (this.classes[this.currentClassId]) {
                    this.classes[this.currentClassId].name = newName.trim();
                    this.classes[this.currentClassId].names = [...this.names];
                    this.saveClasses();
                    this.updateClassSelectDropdown();
                    alert(`บันทึกข้อมูล "${newName.trim()}" เรียบร้อยแล้ว!`);
                }
            }
        });

        const btnNewClass = document.getElementById('btn-new-class');
        btnNewClass.addEventListener('click', () => {
            const name = prompt('กรุณาใส่ชื่อห้องเรียนใหม่ (เช่น ม.1/2, กลุ่มวิทยาศาสตร์):');
            if (name && name.trim()) {
                const newId = 'class-' + Date.now();
                this.classes[newId] = {
                    id: newId,
                    name: name.trim(),
                    names: []
                };
                this.currentClassId = newId;
                this.saveClasses();
                this.updateClassSelectDropdown();
                this.loadRosterFromCurrentClass();
                textarea.focus();
            }
        });

        // Quick Tools: Shuffle, Sort, Numbers, Clear
        document.getElementById('btn-shuffle').addEventListener('click', () => {
            if (this.names.length <= 1) return;
            for (let i = this.names.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.names[i], this.names[j]] = [this.names[j], this.names[i]];
            }
            textarea.value = this.names.join('\n');
            this.syncNamesFromTextarea();
        });

        document.getElementById('btn-sort').addEventListener('click', () => {
            if (this.names.length <= 1) return;
            this.names.sort((a, b) => a.localeCompare(b, 'th'));
            textarea.value = this.names.join('\n');
            this.syncNamesFromTextarea();
        });

        document.getElementById('btn-sample-numbers').addEventListener('click', () => {
            const numbers = Array.from({ length: 30 }, (_, i) => `เลขที่ ${i + 1}`);
            textarea.value = numbers.join('\n');
            this.syncNamesFromTextarea();
        });

        document.getElementById('btn-clear').addEventListener('click', () => {
            if (confirm('คุณต้องการล้างรายชื่อทั้งหมดใช่หรือไม่?')) {
                textarea.value = '';
                this.syncNamesFromTextarea();
            }
        });

        // File Import & Export
        const fileInput = document.getElementById('file-import-input');
        document.getElementById('btn-import-file').addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target.result;
                const lines = content
                    .split(/[\r\n,]+/)
                    .map(l => l.trim().replace(/^["']|["']$/g, ''))
                    .filter(l => l.length > 0);
                if (lines.length > 0) {
                    textarea.value = lines.join('\n');
                    this.syncNamesFromTextarea();
                    alert(`นำเข้ารายชื่อสำเร็จ ${lines.length} รายการ`);
                }
            };
            reader.readAsText(file);
            fileInput.value = '';
        });

        document.getElementById('btn-export-file').addEventListener('click', () => {
            if (this.names.length === 0) {
                alert('ไม่มีรายชื่อสำหรับบันทึก');
                return;
            }
            const blob = new Blob([this.names.join('\n')], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const className = this.classes[this.currentClassId]?.name || 'student_names';
            a.href = url;
            a.download = `${className.replace(/\s+/g, '_')}_names.txt`;
            a.click();
            URL.revokeObjectURL(url);
        });

        // Winner Modal Actions
        const modalWinner = document.getElementById('modal-winner');
        document.getElementById('btn-remove-winner-action').addEventListener('click', () => {
            if (this.lastWinner) {
                this.removeWinnerName(this.lastWinner.name);
                this.closeModal(modalWinner);
            }
        });

        document.getElementById('btn-winner-spin-again').addEventListener('click', () => {
            this.closeModal(modalWinner);
            setTimeout(() => this.startSpin(), 300);
        });

        document.getElementById('btn-close-winner-modal').addEventListener('click', () => {
            this.closeModal(modalWinner);
        });

        // History Actions
        document.getElementById('btn-clear-history').addEventListener('click', () => {
            if (confirm('ต้องการล้างประวัติผู้ชนะทั้งหมดใช่หรือไม่?')) {
                this.winnerHistory = [];
                this.saveHistory();
                this.updateHistoryUI();
            }
        });

        // Header Controls
        const btnSoundToggle = document.getElementById('btn-sound-toggle');
        btnSoundToggle.addEventListener('click', () => {
            this.settings.muted = !this.settings.muted;
            window.soundEngine.setMuted(this.settings.muted);
            this.updateSoundIcon();
            this.saveSettings();
        });

        const btnDarkToggle = document.getElementById('btn-dark-toggle');
        btnDarkToggle.addEventListener('click', () => {
            this.settings.darkMode = !this.settings.darkMode;
            this.applyThemeMode();
            this.saveSettings();
        });

        const btnFullscreenToggle = document.getElementById('btn-fullscreen-toggle');
        btnFullscreenToggle.addEventListener('click', () => this.toggleFullscreen());

        const btnExitFullscreen = document.getElementById('btn-exit-fullscreen');
        btnExitFullscreen.addEventListener('click', () => this.exitFullscreen());

        // Settings Modal
        const modalSettings = document.getElementById('modal-settings');
        document.getElementById('btn-open-settings').addEventListener('click', () => {
            this.openModal(modalSettings);
        });
        document.getElementById('btn-close-settings-modal').addEventListener('click', () => {
            this.closeModal(modalSettings);
        });

        // Duration Setting
        const settingDuration = document.getElementById('setting-duration');
        settingDuration.value = this.settings.duration;
        document.getElementById('label-duration-val').textContent = `${this.settings.duration} วินาที`;
        settingDuration.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            this.settings.duration = val;
            document.getElementById('label-duration-val').textContent = `${val} วินาที`;
            this.wheel.setDuration(val);
            this.saveSettings();
        });

        // Winner Title Setting
        const settingWinnerTitle = document.getElementById('setting-winner-title');
        settingWinnerTitle.value = this.settings.winnerTitle;
        settingWinnerTitle.addEventListener('input', (e) => {
            this.settings.winnerTitle = e.target.value;
            this.saveSettings();
        });

        // Volume Setting
        const settingVolume = document.getElementById('setting-volume');
        settingVolume.value = this.settings.volume;
        document.getElementById('label-volume-val').textContent = `${this.settings.volume}%`;
        settingVolume.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            this.settings.volume = val;
            document.getElementById('label-volume-val').textContent = `${val}%`;
            window.soundEngine.setVolume(val / 100);
            this.saveSettings();
        });

        // Modal backdrop close on click
        [modalWinner, modalSettings].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });
    }

    // --- Spin Handling ---

    startSpin() {
        if (this.wheel.isSpinning || this.names.length === 0) return;
        window.confettiEngine.clear();
        this.wheel.spin();
    }

    handleSpinStart() {
        const spinBtn = document.getElementById('btn-spin-action');
        if (spinBtn) spinBtn.disabled = true;
    }

    handleSpinEnd(winner) {
        const spinBtn = document.getElementById('btn-spin-action');
        if (spinBtn) spinBtn.disabled = false;

        if (!winner) return;
        this.lastWinner = winner;

        // Play celebration audio and fire confetti
        window.soundEngine.playWinner();
        window.confettiEngine.fire(4500);

        // Add to history
        const record = {
            id: Date.now(),
            name: winner.name,
            time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
        this.winnerHistory.unshift(record);
        this.saveHistory();
        this.updateHistoryUI();

        // Show Winner Modal
        const modalWinner = document.getElementById('modal-winner');
        const winnerTitleEl = document.getElementById('winner-modal-title');
        const winnerNameEl = document.getElementById('winner-name-text');

        winnerTitleEl.textContent = this.settings.winnerTitle || 'ขอแสดงความยินดีกับ!';
        winnerNameEl.textContent = winner.name;

        this.openModal(modalWinner);
    }

    removeWinnerName(nameToRemove) {
        const textarea = document.getElementById('names-input');
        // Remove first occurrence of this name
        const index = this.names.indexOf(nameToRemove);
        if (index !== -1) {
            this.names.splice(index, 1);
            textarea.value = this.names.join('\n');
            this.syncNamesFromTextarea();
        }
    }

    // --- History UI ---

    updateHistoryUI() {
        const list = document.getElementById('history-list');
        const empty = document.getElementById('history-empty');
        const badge = document.getElementById('badge-winner-count');

        if (!list || !empty) return;

        if (badge) badge.textContent = this.winnerHistory.length;

        if (this.winnerHistory.length === 0) {
            list.innerHTML = '';
            empty.style.display = 'flex';
            return;
        }

        empty.style.display = 'none';
        list.innerHTML = '';

        this.winnerHistory.forEach((item, idx) => {
            const li = document.createElement('li');
            li.className = 'history-item';
            li.innerHTML = `
                <span class="history-name">
                    <span>👑</span>
                    <span>${item.name}</span>
                </span>
                <span class="history-time">${item.time}</span>
            `;
            list.appendChild(li);
        });
    }

    // --- Settings, Fullscreen, and Themes ---

    renderThemeOptions() {
        const container = document.getElementById('theme-options-container');
        if (!container) return;

        container.innerHTML = '';
        Object.entries(THEMES).forEach(([key, theme]) => {
            const btn = document.createElement('button');
            btn.className = `theme-btn-card ${key === this.settings.theme ? 'active' : ''}`;
            btn.innerHTML = `
                <span>${theme.name}</span>
                <div class="theme-color-preview">
                    ${theme.colors.slice(0, 6).map(c => `<span style="background:${c}"></span>`).join('')}
                </div>
            `;
            btn.addEventListener('click', () => {
                this.settings.theme = key;
                this.wheel.setTheme(key);
                this.saveSettings();
                this.renderThemeOptions();
            });
            container.appendChild(btn);
        });
    }

    applyThemeMode() {
        if (this.settings.darkMode) {
            document.body.setAttribute('data-theme', 'dark');
            const icon = document.getElementById('theme-icon');
            if (icon) icon.textContent = '☀️';
        } else {
            document.body.removeAttribute('data-theme');
            const icon = document.getElementById('theme-icon');
            if (icon) icon.textContent = '🌓';
        }
    }

    updateSoundIcon() {
        const icon = document.getElementById('sound-icon');
        if (icon) {
            icon.textContent = this.settings.muted ? '🔇' : '🔊';
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(() => {});
            }
            document.body.classList.add('fullscreen-mode');
        } else {
            this.exitFullscreen();
        }
        setTimeout(() => this.wheel.setupDPI(), 200);
    }

    exitFullscreen() {
        if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
        }
        document.body.classList.remove('fullscreen-mode');
        setTimeout(() => this.wheel.setupDPI(), 200);
    }

    openModal(modal) {
        if (modal) modal.classList.add('active');
    }

    closeModal(modal) {
        if (modal) modal.classList.remove('active');
    }

    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    }
}

// Start app once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AppController();
});
