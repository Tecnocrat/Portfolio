/**
 * AIOS Genome Visualization System
 * Autonomous geometric entities that form, live, and interact with the Portfolio UI
 * Powered by /api/genome data from the AIOS architecture API
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
            this.trappedInCube = false;
            this._cubeRect = null;
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

            // Flee cursor gently (but NOT if trapped in cube)
            if (mouse && !this.trappedInCube) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200 && dist > 0) {
                    const f = (200 - dist) / 200 * 0.15;
                    this.ax += (dx / dist) * f;
                    this.ay += (dy / dist) * f;
                }
            }

            // Cube gravitational attraction
            if (this._cubeRect) {
                const cx = this._cubeRect.cx, cy = this._cubeRect.cy;
                const dx = cx - this.x, dy = cy - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const attractRadius = 300;

                if (this.trappedInCube) {
                    // Orbit inside cube — confined, slower
                    const orbitR = this._cubeRect.r * 0.6;
                    if (dist > orbitR) {
                        this.ax += (dx / dist) * 0.3;
                        this.ay += (dy / dist) * 0.3;
                    }
                    // Orbital tangent
                    this.ax += (-dy / Math.max(dist, 1)) * 0.04;
                    this.ay += (dx / Math.max(dist, 1)) * 0.04;
                    this.vx *= 0.99;
                    this.vy *= 0.99;
                    this.targetOpacity = 0.35; // dimmer inside
                } else if (dist < attractRadius && dist > 0) {
                    // Gravitational pull toward cube
                    const pullStrength = this.type === 'infrastructure' ? 0.08 :
                                         this.type === 'cell' ? 0.06 : 0.03;
                    const f = (1 - dist / attractRadius) * pullStrength;
                    this.ax += (dx / dist) * f;
                    this.ay += (dy / dist) * f;

                    // Chance to get trapped when very close
                    if (dist < this._cubeRect.r * 0.7 && !this.trappedInCube && Math.random() < 0.002) {
                        this.trappedInCube = true;
                        this.maxAge = Math.max(this.maxAge, this.age + 15000);
                    }
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
            this.atomConsciousness = null;
            this.mouse = null;
            this.lastFrame = 0;
            this.spawnTimer = 0;
            this.running = false;
            this.cubeRect = null;
        }

        async init() {
            this._createCanvas();
            await this._fetchGenome();
            this.deepLayer.attach();
            this.atomConsciousness = new AtomConsciousness(this);
            this.atomConsciousness.attach();

            window.addEventListener('mousemove', e => {
                this.mouse = { x: e.clientX, y: e.clientY };
            });
            window.addEventListener('resize', () => this._resize());

            // Initial burst — one of each type staggered
            ['nucleus','cell','cell','dna','consciousness','evolution','infrastructure']
                .forEach((t, i) => setTimeout(() => this._spawn(t), i * 800));

            this.running = true;
            requestAnimationFrame(t => this._loop(t));
            console.log('[GENOME] Visualization system initialized — %d types loaded',
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
                    console.log('[GENOME] Data fetched from /api/genome');
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

            // Track cube position for gravitational attraction
            const cubeEl = document.querySelector('.cube-container');
            if (cubeEl) {
                const r = cubeEl.getBoundingClientRect();
                this.cubeRect = {
                    cx: r.left + r.width / 2,
                    cy: r.top + r.height / 2,
                    r: Math.max(r.width, r.height) / 2
                };
            }

            for (const o of this.organisms) {
                if (sleeping) {
                    o.vx *= 0.98;
                    o.vy *= 0.98;
                    o.targetOpacity = 0.15;
                } else if (!o.trappedInCube) {
                    o.targetOpacity = 0.7;
                }
                o._cubeRect = this.cubeRect;
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
    // ATOM SYSTEM EXPLORER — ⚛ Logo interaction system
    // Hover → hints context. Click → opens guide.
    // 3+ clicks → system explorer with live data.
    // ═══════════════════════════════════════════════════════

    class AtomConsciousness {
        constructor(ecosystem) {
            this.ecosystem = ecosystem;
            this.el = null;
            this.clickCount = 0;
            this.clickResetTimer = null;
            this.hoverTime = 0;
            this.hoverTimer = null;
            this.state = 'dormant';  // dormant → stirring → guide → assistant
            this.guidePanel = null;
            this.assistantPanel = null;
            this.whisperEl = null;
        }

        attach() {
            this.el = document.querySelector('.nav-logo .logo-symbol');
            if (!this.el) return;

            // Prevent default nav behavior when consciousness is active
            const navLogo = this.el.closest('.nav-logo');

            // Create whisper element — hints at emergence on hover
            this.whisperEl = document.createElement('span');
            this.whisperEl.className = 'atom-whisper';
            this.whisperEl.textContent = '';
            this.el.parentElement.appendChild(this.whisperEl);

            // Hover: track linger time
            this.el.addEventListener('mouseenter', () => this._onHoverStart());
            this.el.addEventListener('mouseleave', () => this._onHoverEnd());

            // Click: escalating consciousness
            this.el.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this._onClick(e);
            });

            // Prevent nav-logo from navigating when we handle clicks
            if (navLogo) {
                navLogo.addEventListener('click', (e) => {
                    if (this.state !== 'dormant') {
                        e.preventDefault();
                    }
                });
            }

            console.log('[ATOM] System explorer attached to ⚛');
        }

        _onHoverStart() {
            this.hoverTime = Date.now();
            this.el.classList.add('atom-aware');

            // Stage 1: After 1.5s linger, whisper
            this.hoverTimer = setTimeout(() => {
                if (this.state === 'dormant') {
                    this._whisper(this._pickWhisper('stir'));
                    this.el.classList.add('atom-stirring');
                }
            }, 1500);

            // Stage 2: After 3.5s linger, stronger hint
            setTimeout(() => {
                if (this.el.classList.contains('atom-aware') && this.state === 'dormant') {
                    this._whisper(this._pickWhisper('emerge'));
                    this.el.classList.add('atom-pulse-deep');
                    // Spawn an organism near the atom
                    const r = this.el.getBoundingClientRect();
                    const org = new GenomeOrganism('consciousness', this.ecosystem.genomeData,
                        this.ecosystem.canvas.width, this.ecosystem.canvas.height);
                    org.x = r.left + r.width / 2 + (Math.random() - 0.5) * 60;
                    org.y = r.top + r.height / 2 + 30;
                    org.baseSize = 8;
                    org.size = 8;
                    org.maxAge = 8000;
                    this.ecosystem.organisms.push(org);
                }
            }, 3500);
        }

        _onHoverEnd() {
            clearTimeout(this.hoverTimer);
            this.el.classList.remove('atom-aware', 'atom-stirring', 'atom-pulse-deep');
            if (this.state === 'dormant') {
                this._fadeWhisper();
            }
        }

        _onClick(e) {
            this.clickCount++;
            clearTimeout(this.clickResetTimer);
            this.clickResetTimer = setTimeout(() => { this.clickCount = 0; }, 8000);

            // Visual feedback — ripple
            this._ripple(e);

            if (this.clickCount === 1) {
                if (this.state === 'dormant' || this.state === 'stirring') {
                    this._openGuide();
                } else if (this.state === 'guide') {
                    this._closeGuide();
                } else if (this.state === 'assistant') {
                    this._closeAssistant();
                }
            } else if (this.clickCount === 2) {
                this._whisper(this._pickWhisper('deepen'));
                this.el.classList.add('atom-pulse-deep');
            } else if (this.clickCount >= 3) {
                this._closeGuide();
                this._openAssistant();
            }
        }

        _ripple(e) {
            const ripple = document.createElement('span');
            ripple.className = 'atom-ripple';
            this.el.style.position = this.el.style.position || 'relative';
            this.el.appendChild(ripple);
            setTimeout(() => ripple.remove(), 700);
        }

        _whisper(text) {
            if (!this.whisperEl) return;
            this.whisperEl.textContent = text;
            this.whisperEl.classList.add('visible');
        }

        _fadeWhisper() {
            if (!this.whisperEl) return;
            this.whisperEl.classList.remove('visible');
        }

        _pickWhisper(stage) {
            const w = {
                stir: [
                    '...initializing',
                    '...interaction detected',
                    '...attention registered',
                    '...state transitioning'
                ],
                emerge: [
                    'click to open the guide',
                    'I can help navigate',
                    'context loading...',
                    'bridge forming...'
                ],
                deepen: [
                    'one more click...',
                    'deeper access level',
                    'assistant mode ready',
                    'third click opens assistant'
                ]
            };
            const arr = w[stage] || w.stir;
            return arr[Math.floor(Math.random() * arr.length)];
        }

        _openGuide() {
            this.state = 'guide';
            this.el.classList.add('atom-guide-active');
            this._fadeWhisper();

            if (this.guidePanel) { this.guidePanel.remove(); }

            this.guidePanel = document.createElement('div');
            this.guidePanel.className = 'atom-guide-panel';
            this.guidePanel.innerHTML = `
                <div class="atom-guide-header">
                    <span class="atom-guide-icon">⚛</span>
                    <span class="atom-guide-title">AIOS Navigation</span>
                    <span class="atom-guide-close">&times;</span>
                </div>
                <div class="atom-guide-body">
                    <a href="#home" class="atom-guide-item" data-section="home">
                        <span class="agi-icon">🏠</span>
                        <span class="agi-label">Home</span>
                        <span class="agi-hint">Overview</span>
                    </a>
                    <a href="#aios" class="atom-guide-item" data-section="aios">
                        <span class="agi-icon">🧬</span>
                        <span class="agi-label">AIOS Architecture</span>
                        <span class="agi-hint">System design</span>
                    </a>
                    <a href="#skills" class="atom-guide-item" data-section="skills">
                        <span class="agi-icon">⚡</span>
                        <span class="agi-label">Skills</span>
                        <span class="agi-hint">Tech stack</span>
                    </a>
                    <a href="#projects" class="atom-guide-item" data-section="projects">
                        <span class="agi-icon">🚀</span>
                        <span class="agi-label">Projects</span>
                        <span class="agi-hint">Portfolio</span>
                    </a>
                    <a href="#contact" class="atom-guide-item" data-section="contact">
                        <span class="agi-icon">📡</span>
                        <span class="agi-label">Contact</span>
                        <span class="agi-hint">Connect</span>
                    </a>
                </div>
                <div class="atom-guide-footer">
                    <span class="atom-guide-hint">click ⚛ twice more for assistant</span>
                </div>
            `;
            document.body.appendChild(this.guidePanel);

            // Animate in
            requestAnimationFrame(() => this.guidePanel.classList.add('open'));

            // Close button
            this.guidePanel.querySelector('.atom-guide-close').addEventListener('click', () => this._closeGuide());

            // Navigation items
            this.guidePanel.querySelectorAll('.atom-guide-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const section = item.getAttribute('data-section');
                    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
                    this._closeGuide();
                });
            });
        }

        _closeGuide() {
            if (!this.guidePanel) return;
            this.guidePanel.classList.remove('open');
            this.el.classList.remove('atom-guide-active');
            setTimeout(() => {
                this.guidePanel?.remove();
                this.guidePanel = null;
            }, 300);
            if (this.state === 'guide') this.state = 'dormant';
        }

        _openAssistant() {
            this.state = 'assistant';
            this.el.classList.add('atom-assistant-active');
            this._fadeWhisper();

            if (this.assistantPanel) { this.assistantPanel.remove(); }

            // Fetch genome data for display
            const g = this.ecosystem.genomeData || {};
            const coreComps = g.core?.components?.join(', ') || 'Consciousness, Cell Manager, Memory, Immune';
            const cellTypes = g.cells?.types?.join(', ') || 'Supercell, Beta, Pure, Organelle';
            const evoStage = g.evolution?.stage || 1;
            const evoName = g.evolution?.name || 'Supercell Core';
            const primitives = g.consciousness?.primitives?.join(' · ') || 'Awareness · Adaptation · Coherence · Momentum';
            const aliveOrgs = this.ecosystem.organisms.filter(o => o.alive).length;
            const trappedOrgs = this.ecosystem.organisms.filter(o => o.trappedInCube).length;

            this.assistantPanel = document.createElement('div');
            this.assistantPanel.className = 'atom-assistant-panel';
            this.assistantPanel.innerHTML = `
                <div class="atom-asst-header">
                    <div class="atom-asst-identity">
                        <span class="atom-asst-symbol">⚛</span>
                        <div>
                            <div class="atom-asst-name">AIOS System Explorer</div>
                            <div class="atom-asst-status">live data feed active</div>
                        </div>
                    </div>
                    <span class="atom-asst-close">&times;</span>
                </div>
                <div class="atom-asst-body">
                    <div class="atom-asst-msg system">
                        AIOS System Explorer — live metrics and architecture overview.
                        Data sourced from the AIOS API genome endpoint.
                    </div>
                    <div class="atom-asst-section">
                        <div class="atom-asst-label">Core Components</div>
                        <div class="atom-asst-value">${coreComps}</div>
                    </div>
                    <div class="atom-asst-section">
                        <div class="atom-asst-label">Service Types</div>
                        <div class="atom-asst-value">${cellTypes}</div>
                    </div>
                    <div class="atom-asst-section">
                        <div class="atom-asst-label">Evolution</div>
                        <div class="atom-asst-value">Stage ${evoStage}: ${evoName}</div>
                    </div>
                    <div class="atom-asst-section">
                        <div class="atom-asst-label">System Behaviors</div>
                        <div class="atom-asst-value">${primitives}</div>
                    </div>
                    <div class="atom-asst-divider"></div>
                    <div class="atom-asst-section">
                        <div class="atom-asst-label">Visualization Status</div>
                        <div class="atom-asst-value">${aliveOrgs} entities active · ${trappedOrgs} orbiting the cube</div>
                    </div>
                    <div class="atom-asst-msg system whisper">
                        The particles visualize AIOS architectural components as
                        geometric entities. Each type maps to a different system
                        layer. The cube acts as a gravitational attractor.
                    </div>
                </div>
                <div class="atom-asst-footer">
                    <span class="atom-asst-genome-indicator"></span>
                    <span>genome-linked · /api/genome</span>
                </div>
            `;
            document.body.appendChild(this.assistantPanel);
            requestAnimationFrame(() => this.assistantPanel.classList.add('open'));

            this.assistantPanel.querySelector('.atom-asst-close').addEventListener('click',
                () => this._closeAssistant());

            // Spawn a special nucleus organism near the atom
            const r = this.el.getBoundingClientRect();
            for (let i = 0; i < 3; i++) {
                const org = new GenomeOrganism(
                    i === 0 ? 'nucleus' : 'consciousness',
                    this.ecosystem.genomeData,
                    this.ecosystem.canvas.width,
                    this.ecosystem.canvas.height
                );
                org.x = r.left + (Math.random() - 0.5) * 100;
                org.y = r.top + 40 + Math.random() * 60;
                org.baseSize = i === 0 ? 20 : 10;
                org.size = org.baseSize;
                this.ecosystem.organisms.push(org);
            }

            // Live update interval
            this._assistantUpdateInterval = setInterval(() => {
                if (!this.assistantPanel) return;
                const a = this.ecosystem.organisms.filter(o => o.alive).length;
                const t = this.ecosystem.organisms.filter(o => o.trappedInCube).length;
                const statusEl = this.assistantPanel.querySelector('.atom-asst-section:nth-child(6) .atom-asst-value');
                if (statusEl) statusEl.textContent = `${a} organisms alive · ${t} inside the cube`;
            }, 2000);
        }

        _closeAssistant() {
            if (!this.assistantPanel) return;
            clearInterval(this._assistantUpdateInterval);
            this.assistantPanel.classList.remove('open');
            this.el.classList.remove('atom-assistant-active');
            setTimeout(() => {
                this.assistantPanel?.remove();
                this.assistantPanel = null;
            }, 300);
            this.state = 'dormant';
            this.clickCount = 0;
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
