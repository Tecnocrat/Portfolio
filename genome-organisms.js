/**
 * AIOS Genome Organism System
 * Autonomous geometric organisms that form, live, and interact with the Portfolio UI
 * Powered by /api/genome data from the AIOS consciousness mesh
 *
 * Architecture:
 *   GenomeOrganism     — Individual autonomous geometric entity with physics + rendering
 *   DeepLayerSystem    — Attaches organism-aware behaviors to all UI elements
 *   OrganismEcosystem  — Canvas manager, spawn controller, animation loop
 */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════

    const CONFIG = {
        genomeUrl: 'https://tecnocrat-api.vercel.app/api/genome',
        canvas: { zIndex: 1, opacity: 0.85 },
        organisms: {
            maxCount: 10,
            spawnInterval: 5000,
            proximityRadius: 160,
            connectionDistance: 220
        },
        deepLayer: {
            updateInterval: 250,
            surpriseInterval: [25000, 55000],
            cornerMarkSize: 12
        },
        colors: {
            nucleus:        ['#667eea', '#764ba2'],
            cell:           ['#00f5d4', '#00d4aa'],
            dna:            ['#667eea', '#00f5d4', '#f72585', '#764ba2'],
            consciousness:  ['#f72585', '#b5179e'],
            evolution:      ['#ff6b35', '#ffd700'],
            infrastructure: ['#4a5568', '#718096']
        }
    };

    // ═══════════════════════════════════════════════════════
    // GENOME ORGANISM CLASS
    // ═══════════════════════════════════════════════════════

    class GenomeOrganism {
        constructor(type, genomeData, w, h) {
            this.type = type;
            this.genome = genomeData;
            this.id = Math.random().toString(36).substr(2, 9);

            // Physics — viewport coordinates (canvas is position:fixed)
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = (Math.random() - 0.5) * 0.8;
            this.ax = 0;
            this.ay = 0;

            // Visual properties
            this.baseSize = this._calcBaseSize();
            this.size = this.baseSize;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.02;
            this.phase = Math.random() * Math.PI * 2;
            this.pulsePhase = 0;

            // Lifecycle
            this.age = 0;
            this.maxAge = 30000 + Math.random() * 60000;
            this.opacity = 0;
            this.targetOpacity = 0.7;
            this.alive = true;
            this.state = 'spawning';

            // Evolution-type morphing
            this.morphSides = 3;
            this.morphTarget = 4;
            this.morphProgress = 0;

            this.w = w;
            this.h = h;
        }

        _calcBaseSize() {
            const s = {
                nucleus: 35, cell: 18, dna: 14,
                consciousness: 12, evolution: 18, infrastructure: 10
            };
            return (s[this.type] || 20) + Math.random() * 18;
        }

        update(dt, organisms, mouse) {
            this.age += dt;
            this.phase += dt * 0.001;
            this.rotation += this.rotationSpeed;
            this.pulsePhase += dt * 0.003;

            // State machine
            if (this.age < 2000) {
                this.state = 'spawning';
                this.opacity = Math.min(this.targetOpacity, (this.age / 2000) * this.targetOpacity);
            } else if (this.age > this.maxAge - 3000) {
                this.state = 'fading';
                this.opacity = Math.max(0, ((this.maxAge - this.age) / 3000) * this.targetOpacity);
                if (this.age >= this.maxAge) { this.alive = false; return; }
            } else {
                this.state = 'mature';
                this.opacity = this.targetOpacity;
            }

            this._applyBehavior(dt, organisms, mouse);

            // Integrate
            this.vx += this.ax * dt * 0.001;
            this.vy += this.ay * dt * 0.001;
            this.vx *= 0.995;
            this.vy *= 0.995;

            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            const maxSpeed = this.type === 'nucleus' ? 0.5 : 1.2;
            if (speed > maxSpeed) {
                this.vx = (this.vx / speed) * maxSpeed;
                this.vy = (this.vy / speed) * maxSpeed;
            }

            this.x += this.vx * dt * 0.06;
            this.y += this.vy * dt * 0.06;

            // Wrap
            const m = this.size * 2;
            if (this.x < -m) this.x = this.w + m;
            if (this.x > this.w + m) this.x = -m;
            if (this.y < -m) this.y = this.h + m;
            if (this.y > this.h + m) this.y = -m;

            this.ax = 0;
            this.ay = 0;

            // Evolution morph
            if (this.type === 'evolution') {
                this.morphProgress += dt * 0.0003;
                if (this.morphProgress >= 1) {
                    this.morphProgress = 0;
                    this.morphSides = this.morphTarget;
                    this.morphTarget = 3 + Math.floor(Math.random() * 5);
                }
            }

            // Consciousness pulse
            if (this.type === 'consciousness') {
                this.size = this.baseSize * (1 + Math.sin(this.pulsePhase) * 0.3);
            }
        }

        _applyBehavior(dt, organisms, mouse) {
            // Random wander
            this.ax += (Math.random() - 0.5) * 0.3;
            this.ay += (Math.random() - 0.5) * 0.3;

            // Flee cursor gently
            if (mouse) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200 && dist > 0) {
                    const f = (200 - dist) / 200 * 0.15;
                    this.ax += (dx / dist) * f;
                    this.ay += (dy / dist) * f;
                }
            }

            // Type-specific
            switch (this.type) {
                case 'nucleus':
                    for (const o of organisms) {
                        if (o.id === this.id || o.type === 'nucleus') continue;
                        const dx = o.x - this.x, dy = o.y - this.y;
                        const d = Math.sqrt(dx * dx + dy * dy);
                        if (d < CONFIG.organisms.connectionDistance && d > 50) {
                            o.ax -= (dx / d) * 0.05;
                            o.ay -= (dy / d) * 0.05;
                        }
                    }
                    break;
                case 'cell':
                    for (const o of organisms) {
                        if (o.type !== 'nucleus') continue;
                        const dx = o.x - this.x, dy = o.y - this.y;
                        const d = Math.sqrt(dx * dx + dy * dy);
                        if (d < 300 && d > 80) {
                            this.ax += (-dy / d) * 0.02;
                            this.ay += (dx / d) * 0.02;
                            this.ax += (dx / d) * 0.01;
                            this.ay += (dy / d) * 0.01;
                        }
                    }
                    break;
                case 'dna':
                    for (const o of organisms) {
                        if (o.type !== 'dna' || o.id <= this.id) continue;
                        const dx = o.x - this.x, dy = o.y - this.y;
                        const d = Math.sqrt(dx * dx + dy * dy);
                        if (d < 100 && d > 0) {
                            const f = (d - 40) / 100 * 0.1;
                            this.ax += (dx / d) * f;
                            this.ay += (dy / d) * f;
                        }
                    }
                    break;
                case 'infrastructure':
                    if (Math.random() < 0.01) {
                        const a = Math.floor(Math.random() * 4) * Math.PI / 2;
                        this.vx = Math.cos(a) * 0.5;
                        this.vy = Math.sin(a) * 0.5;
                    }
                    break;
            }
        }

        /* ── Renderers ── */

        render(ctx) {
            if (this.opacity <= 0) return;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.globalAlpha = this.opacity;
            this['_r_' + this.type](ctx);
            ctx.restore();
        }

        _r_nucleus(ctx) {
            const [c1, c2] = CONFIG.colors.nucleus;
            const s = this.size;
            const b = 1 + Math.sin(this.pulsePhase) * 0.08;

            ctx.beginPath();
            ctx.arc(0, 0, s * b, 0, Math.PI * 2);
            ctx.strokeStyle = c1;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            for (let i = 3; i > 0; i--) {
                const r = (s * i / 4) * b;
                const a = this.phase * (i % 2 ? 1 : -1);
                ctx.beginPath();
                ctx.arc(0, 0, r, a, a + Math.PI * 1.5);
                const g = ctx.createLinearGradient(-r, 0, r, 0);
                g.addColorStop(0, c1 + '80');
                g.addColorStop(1, c2 + '80');
                ctx.strokeStyle = g;
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 0.3 * b);
            glow.addColorStop(0, c1 + '40');
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(0, 0, s * 0.3 * b, 0, Math.PI * 2);
            ctx.fill();
        }

        _r_cell(ctx) {
            const color = CONFIG.colors.cell[0];
            const s = this.size;
            const b = 1 + Math.sin(this.pulsePhase * 0.7) * 0.1;

            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const a = (Math.PI / 3) * i - Math.PI / 6;
                const px = Math.cos(a) * s * b, py = Math.sin(a) * s * b;
                i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.2;
            ctx.stroke();

            for (let i = 0; i < 3; i++) {
                const a = (Math.PI * 2 / 3) * i + this.phase * 0.5;
                const r = s * 0.4;
                ctx.beginPath();
                ctx.arc(Math.cos(a) * r, Math.sin(a) * r, s * 0.12, 0, Math.PI * 2);
                ctx.fillStyle = color + '30';
                ctx.fill();
                ctx.strokeStyle = color + '60';
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }

        _r_dna(ctx) {
            const colors = CONFIG.colors.dna;
            const s = this.size, steps = 12, h = s * 2;

            for (let strand = 0; strand < 2; strand++) {
                ctx.beginPath();
                for (let i = 0; i <= steps; i++) {
                    const t = i / steps;
                    const y = -h / 2 + t * h;
                    const x = Math.sin(t * Math.PI * 3 + this.phase + strand * Math.PI) * s * 0.6;
                    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                }
                ctx.strokeStyle = colors[strand % colors.length];
                ctx.lineWidth = 1.2;
                ctx.stroke();
            }

            for (let i = 1; i < steps; i += 2) {
                const t = i / steps;
                const y = -h / 2 + t * h;
                const x1 = Math.sin(t * Math.PI * 3 + this.phase) * s * 0.6;
                const x2 = Math.sin(t * Math.PI * 3 + this.phase + Math.PI) * s * 0.6;
                ctx.beginPath();
                ctx.moveTo(x1, y);
                ctx.lineTo(x2, y);
                ctx.strokeStyle = colors[2] + '40';
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }

        _r_consciousness(ctx) {
            const [c1, c2] = CONFIG.colors.consciousness;
            const s = this.size;

            for (let i = 0; i < 4; i++) {
                const r = (s * (i + 1) / 4) * (1 + Math.sin(this.pulsePhase + i * 0.5) * 0.2);
                const segs = 6 + i * 2;
                ctx.beginPath();
                for (let j = 0; j <= segs; j++) {
                    const a = (Math.PI * 2 / segs) * j + this.phase * (i % 2 ? 1 : -1) * 0.3;
                    const wobble = 1 + Math.sin(a * 3 + this.phase) * 0.1;
                    const px = Math.cos(a) * r * wobble, py = Math.sin(a) * r * wobble;
                    j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.strokeStyle = (i % 2 ? c1 : c2) + '60';
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.arc(0, 0, 2, 0, Math.PI * 2);
            ctx.fillStyle = c1;
            ctx.fill();
        }

        _r_evolution(ctx) {
            const [c1, c2] = CONFIG.colors.evolution;
            const s = this.size;
            const sides = Math.round(this.morphSides + (this.morphTarget - this.morphSides) * this.morphProgress);

            ctx.beginPath();
            for (let i = 0; i <= sides; i++) {
                const a = (Math.PI * 2 / sides) * i;
                const r = s * (1 + Math.sin(a * 2 + this.phase) * 0.1);
                const px = Math.cos(a) * r, py = Math.sin(a) * r;
                i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
            }
            ctx.closePath();
            const g = ctx.createLinearGradient(-s, -s, s, s);
            g.addColorStop(0, c1 + '50');
            g.addColorStop(1, c2 + '50');
            ctx.fillStyle = g;
            ctx.fill();
            ctx.strokeStyle = c1;
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.font = '8px JetBrains Mono';
            ctx.fillStyle = c2;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('S' + Math.max(1, this.morphSides - 2), 0, 0);
        }

        _r_infrastructure(ctx) {
            const color = CONFIG.colors.infrastructure[1];
            const s = this.size;

            ctx.beginPath();
            ctx.moveTo(-s, 0); ctx.lineTo(s, 0);
            ctx.moveTo(0, -s); ctx.lineTo(0, s);
            ctx.strokeStyle = color + '60';
            ctx.lineWidth = 0.8;
            ctx.stroke();

            for (const [nx, ny] of [[-s,-s],[s,-s],[s,s],[-s,s]]) {
                ctx.beginPath();
                ctx.rect(nx - 2, ny - 2, 4, 4);
                ctx.fillStyle = color + '40';
                ctx.fill();
                ctx.strokeStyle = color + '80';
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }

            if (Math.sin(this.phase * 2) > 0) {
                ctx.beginPath();
                ctx.arc(0, 0, 2, 0, Math.PI * 2);
                ctx.fillStyle = '#00f5d4';
                ctx.fill();
            }
        }
    }

    // ═══════════════════════════════════════════════════════
    // DEEP LAYER SYSTEM
    // UI element organism-awareness: buttons, cards, icons,
    // badges, nav links, sections, social links
    // ═══════════════════════════════════════════════════════

    class DeepLayerSystem {
        constructor() {
            this.elements = [];
            this.surpriseTimer = null;
            this.lastCheck = 0;
        }

        attach() {
            this._collect('.btn',                                'button');
            this._collectCards('.feature-card, .project-card, .contact-card');
            this._collect('.feature-icon, .fas, .fab, .far',     'icon');
            this._collect('.tech-badge, .skill-tag, .project-badge', 'badge');
            this._collect('.nav-link',                           'nav');
            this._collect('.section-title',                      'title');
            this._collect('.social-link, .footer a',             'social');
            this._scheduleSurprise();
        }

        _collect(selector, type) {
            document.querySelectorAll(selector).forEach(el => {
                el.classList.add('genome-deep-' + type);
                if (type === 'button') {
                    el.addEventListener('click', e => this._burst(el, e));
                }
                this.elements.push({ el, type, rect: null });
            });
        }

        _collectCards(selector) {
            document.querySelectorAll(selector).forEach(card => {
                card.classList.add('genome-deep-card');
                const marks = document.createElement('div');
                marks.className = 'genome-corner-marks';
                marks.innerHTML =
                    '<span class="gcm tl"></span><span class="gcm tr"></span>' +
                    '<span class="gcm bl"></span><span class="gcm br"></span>';
                card.style.position = card.style.position || 'relative';
                card.appendChild(marks);
                this.elements.push({ el: card, type: 'card', rect: null });
            });
        }

        _burst(btn, e) {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            for (let i = 0; i < 8; i++) {
                const p = document.createElement('span');
                p.className = 'genome-burst-particle';
                const angle = (Math.PI * 2 / 8) * i;
                p.style.setProperty('--bx', Math.cos(angle) * 40 + 'px');
                p.style.setProperty('--by', Math.sin(angle) * 40 + 'px');
                p.style.left = x + 'px';
                p.style.top = y + 'px';
                btn.appendChild(p);
                setTimeout(() => p.remove(), 600);
            }
        }

        updateProximity(organisms) {
            const now = Date.now();
            if (now - this.lastCheck < CONFIG.deepLayer.updateInterval) return;
            this.lastCheck = now;

            for (const item of this.elements) {
                const r = item.el.getBoundingClientRect();
                item.rect = {
                    x: r.left + r.width / 2,
                    y: r.top + r.height / 2
                };

                let closest = Infinity;
                let closestOrg = null;

                for (const org of organisms) {
                    if (!org.alive || org.opacity < 0.1) continue;
                    const dx = org.x - item.rect.x;
                    const dy = org.y - item.rect.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < closest) { closest = dist; closestOrg = org; }
                }

                if (closest < CONFIG.organisms.proximityRadius && closestOrg) {
                    item.el.classList.add('genome-proximity');
                    const colors = CONFIG.colors[closestOrg.type];
                    if (colors) item.el.style.setProperty('--genome-color', colors[0]);
                    item.el.style.setProperty('--genome-intensity',
                        (1 - closest / CONFIG.organisms.proximityRadius).toFixed(2));
                } else {
                    item.el.classList.remove('genome-proximity');
                    item.el.style.removeProperty('--genome-color');
                    item.el.style.removeProperty('--genome-intensity');
                }
            }
        }

        _scheduleSurprise() {
            const [min, max] = CONFIG.deepLayer.surpriseInterval;
            this.surpriseTimer = setTimeout(() => {
                this._triggerSurprise();
                this._scheduleSurprise();
            }, min + Math.random() * (max - min));
        }

        _triggerSurprise() {
            const icons = this.elements.filter(e => e.type === 'icon');
            if (!icons.length) return;
            const target = icons[Math.floor(Math.random() * icons.length)];
            const r = target.el.getBoundingClientRect();
            if (r.top < 0 || r.bottom > window.innerHeight) return;
            const fx = ['genome-surprise-spin', 'genome-surprise-bounce',
                         'genome-surprise-glow', 'genome-surprise-float',
                         'genome-surprise-split'];
            const chosen = fx[Math.floor(Math.random() * fx.length)];
            target.el.classList.add(chosen);
            setTimeout(() => target.el.classList.remove(chosen), 1200);
        }
    }

    // ═══════════════════════════════════════════════════════
    // ORGANISM ECOSYSTEM — Canvas, spawn, animation loop
    // ═══════════════════════════════════════════════════════

    class OrganismEcosystem {
        constructor() {
            this.canvas = null;
            this.ctx = null;
            this.organisms = [];
            this.genomeData = null;
            this.deepLayer = new DeepLayerSystem();
            this.mouse = null;
            this.lastFrame = 0;
            this.spawnTimer = 0;
            this.running = false;
        }

        async init() {
            this._createCanvas();
            await this._fetchGenome();
            this.deepLayer.attach();

            window.addEventListener('mousemove', e => {
                this.mouse = { x: e.clientX, y: e.clientY };
            });
            window.addEventListener('resize', () => this._resize());

            // Initial burst — one of each type staggered
            ['nucleus','cell','cell','dna','consciousness','evolution','infrastructure']
                .forEach((t, i) => setTimeout(() => this._spawn(t), i * 800));

            this.running = true;
            requestAnimationFrame(t => this._loop(t));
            console.log('[GENOME] Organism ecosystem awakened — %d types loaded',
                Object.keys(CONFIG.colors).length);
        }

        _createCanvas() {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'genome-canvas';
            this.canvas.style.cssText =
                'position:fixed;top:0;left:0;width:100%;height:100%;' +
                'pointer-events:none;z-index:' + CONFIG.canvas.zIndex +
                ';opacity:' + CONFIG.canvas.opacity;
            document.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');
            this._resize();
        }

        _resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            for (const o of this.organisms) { o.w = this.canvas.width; o.h = this.canvas.height; }
        }

        async _fetchGenome() {
            try {
                const ctrl = new AbortController();
                const timer = setTimeout(() => ctrl.abort(), 5000);
                const res = await fetch(CONFIG.genomeUrl, { signal: ctrl.signal });
                clearTimeout(timer);
                if (res.ok) {
                    this.genomeData = await res.json();
                    console.log('[GENOME] DNA fetched from /api/genome');
                }
            } catch (_) {
                console.warn('[GENOME] API unavailable, using fallback genome');
            }
            if (!this.genomeData) {
                this.genomeData = {
                    core: { components: ['Consciousness','Cell Manager','Memory','Immune'] },
                    cells: { types: ['Supercell','Beta','Pure','Organelle'] },
                    dna: { languages: { Python:60,'C++':20,'C#':15,TypeScript:5 } },
                    consciousness: { primitives: ['Awareness','Adaptation','Coherence','Momentum'] },
                    evolution: { stage: 1, name: 'Supercell Core' },
                    infrastructure: { layers: ['Win11','WSL2','Docker','Traefik','Vault'] }
                };
            }
        }

        _spawn(type) {
            if (this.organisms.filter(o => o.alive).length >= CONFIG.organisms.maxCount) return;
            type = type || this._randType();
            const o = new GenomeOrganism(type, this.genomeData, this.canvas.width, this.canvas.height);

            // Spawn away from cursor
            if (this.mouse) {
                for (let n = 0; n < 10; n++) {
                    const dx = o.x - this.mouse.x, dy = o.y - this.mouse.y;
                    if (Math.sqrt(dx*dx + dy*dy) > 300) break;
                    o.x = Math.random() * this.canvas.width;
                    o.y = Math.random() * this.canvas.height;
                }
            }
            this.organisms.push(o);
        }

        _randType() {
            const t = ['nucleus','cell','cell','dna','dna',
                        'consciousness','evolution','infrastructure','infrastructure'];
            return t[Math.floor(Math.random() * t.length)];
        }

        _loop(ts) {
            if (!this.running) return;
            const dt = Math.min(ts - this.lastFrame, 50);
            this.lastFrame = ts;

            // Periodic spawn
            this.spawnTimer += dt;
            if (this.spawnTimer > CONFIG.organisms.spawnInterval) {
                this.spawnTimer = 0;
                this._spawn();
            }

            // Sleep awareness — integrate with existing organism system
            const sleeping = document.body.classList.contains('organism-sleeping');

            for (const o of this.organisms) {
                if (sleeping) {
                    o.vx *= 0.98;
                    o.vy *= 0.98;
                    o.targetOpacity = 0.15;
                } else {
                    o.targetOpacity = 0.7;
                }
                o.update(dt, this.organisms, this.mouse);
            }

            this.organisms = this.organisms.filter(o => o.alive);
            this.deepLayer.updateProximity(this.organisms);
            this._render(sleeping);
            requestAnimationFrame(t => this._loop(t));
        }

        _render(sleeping) {
            const ctx = this.ctx;
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Inter-organism connections
            const maxD = CONFIG.organisms.connectionDistance;
            for (let i = 0; i < this.organisms.length; i++) {
                for (let j = i + 1; j < this.organisms.length; j++) {
                    const a = this.organisms[i], b = this.organisms[j];
                    if (!a.alive || !b.alive) continue;
                    const dx = b.x - a.x, dy = b.y - a.y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < maxD) {
                        let alpha = (1 - d / maxD) * 0.15 * Math.min(a.opacity, b.opacity);
                        if (sleeping) alpha *= 0.3;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = 'rgba(102,126,234,' + alpha + ')';
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            for (const o of this.organisms) o.render(ctx);
        }
    }

    // ═══════════════════════════════════════════════════════
    // BOOT — Wait for DOM + existing systems, then awaken
    // ═══════════════════════════════════════════════════════

    function boot() {
        // Delay to let existing organism system initialize first
        setTimeout(() => new OrganismEcosystem().init(), 1800);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

})();
