// ========================================
// AIOS-THEMED PORTFOLIO SCRIPTS
// Neural network animations and interactions
// Integrated with Tecnocrat Intelligence Layer
// ========================================

// ========================================
// ORGANISM AWARENESS CORE
// The site is alive. It notices. It breathes.
// Every element has: resting state, responsiveness,
// recovery, and awareness of the observer.
// ========================================
const Organism = {
    mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    prevMouse: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    mouseVelocity: 0,
    scroll: { y: 0, velocity: 0 },
    prevScroll: 0,
    idleTime: 0,
    sleeping: false,
    waking: false,
    visible: true,
    lastActivity: Date.now(),
    particles: [],
    IDLE_THRESHOLD: 5000,
    SLEEP_THRESHOLD: 10000,

    init() {
        // Mouse tracking — the organism watches the observer
        document.addEventListener('mousemove', (e) => {
            this.prevMouse.x = this.mouse.x;
            this.prevMouse.y = this.mouse.y;
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            this.lastActivity = Date.now();
            this.wake();
        });

        // Touch tracking
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouse.x = e.touches[0].clientX;
                this.mouse.y = e.touches[0].clientY;
                this.lastActivity = Date.now();
                this.wake();
            }
        }, { passive: true });

        // Scroll tracking
        window.addEventListener('scroll', () => {
            this.lastActivity = Date.now();
            this.wake();
        });

        // Any interaction wakes the organism
        document.addEventListener('click', () => { this.lastActivity = Date.now(); this.wake(); });
        document.addEventListener('keydown', () => { this.lastActivity = Date.now(); this.wake(); });

        // Tab visibility — organism sleeps when unobserved
        document.addEventListener('visibilitychange', () => {
            this.visible = !document.hidden;
            if (document.hidden) {
                this.sleep();
            } else {
                this.lastActivity = Date.now();
                this.wake();
            }
        });

        // Start organism loop
        this._update();
        console.log('🧬 Organism awareness initialized');
    },

    _update() {
        const now = Date.now();
        this.idleTime = now - this.lastActivity;

        // Mouse velocity
        const dx = this.mouse.x - this.prevMouse.x;
        const dy = this.mouse.y - this.prevMouse.y;
        this.mouseVelocity = Math.sqrt(dx * dx + dy * dy);

        // Scroll velocity
        this.scroll.velocity = window.scrollY - this.prevScroll;
        this.prevScroll = window.scrollY;
        this.scroll.y = window.scrollY;

        // Idle → sleep transition
        if (this.idleTime > this.SLEEP_THRESHOLD && !this.sleeping) {
            this.sleep();
        }

        requestAnimationFrame(() => this._update());
    },

    sleep() {
        if (this.sleeping) return;
        this.sleeping = true;
        document.body.classList.add('organism-sleeping');
        document.body.classList.remove('organism-waking');
        console.log('💤 Organism entering sleep state');
    },

    wake() {
        if (!this.sleeping) return;
        this.sleeping = false;
        this.waking = true;
        document.body.classList.remove('organism-sleeping');
        document.body.classList.add('organism-waking');
        console.log('⚡ Organism waking');

        // Wake pulse duration
        setTimeout(() => {
            this.waking = false;
            document.body.classList.remove('organism-waking');
        }, 800);
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize organism awareness — central nervous system
    Organism.init();

    // Initialize Tecnocrat surface data
    initSurfaceData();
    
    // Initialize all components
    initParticles();
    initNeuralCanvas();
    initTypingAnimation();
    initSmoothScroll();
    initNavbar();
    initScrollAnimations();
    initInteractiveCube();  // Interactive 3D cube
    initCodeStack();        // 3D Code Stack - AIOS layers

    // Initialize organism-wide behaviors (last — needs DOM ready)
    initOrganismBehaviors();
});

// ========================================
// TECNOCRAT SURFACE INTEGRATION
// Live connection to Tecnocrat API
// Primary: tecnocrat-api.vercel.app/api
// Fallback: GitHub raw + local surface.js
// ========================================

const SURFACE_CONFIG = {
    // Primary: Live API endpoints
    apiBase: 'https://tecnocrat-api.vercel.app/api',
    surfaceUrl: 'https://tecnocrat-api.vercel.app/api/surface',
    statsUrl: 'https://tecnocrat-api.vercel.app/api/stats',
    genomeUrl: 'https://tecnocrat-api.vercel.app/api/genome',
    // Fallback: Raw manifest from GitHub
    manifestUrl: 'https://raw.githubusercontent.com/Tecnocrat/Tecnocrat/main/docs/tecnocrat/intelligence/manifests/exposed_surface.yaml',
    // Fallback to local surface.js data
    useFallback: true,
    // Cache duration in milliseconds (5 minutes)
    cacheDuration: 5 * 60 * 1000
};

async function initSurfaceData() {
    const syncIndicator = document.getElementById('surface-sync');
    const syncDot = document.querySelector('.sync-dot');
    const syncText = document.querySelector('.sync-text');
    
    // Try primary API first
    try {
        console.log('🚀 Connecting to Tecnocrat API...');
        const [surfaceData, statsData] = await Promise.all([
            fetchFromApi(SURFACE_CONFIG.surfaceUrl),
            fetchFromApi(SURFACE_CONFIG.statsUrl)
        ]);
        
        if (surfaceData && surfaceData.metadata) {
            // Update UI with live connection
            if (syncIndicator) syncIndicator.classList.add('connected');
            if (syncText) syncText.textContent = `Live API · v${surfaceData.metadata.version}`;
            
            console.log('✅ Tecnocrat API connected');
            console.log(`   Version: ${surfaceData.metadata.version}`);
            console.log(`   Stats: ${statsData?.metrics?.aiTools || 'N/A'} AI tools`);
            
            // Store for other functions to use
            window.TecnocratLive = {
                ...surfaceData.metadata,
                surface: surfaceData.surface,
                stats: statsData?.metrics || surfaceData.stats
            };
            
            // Update page stats
            updateStatsFromApi(statsData?.metrics || surfaceData.stats);
            return;
        }
    } catch (error) {
        console.warn('⚠️ API fetch failed, trying GitHub fallback:', error.message);
    }
    
    // Fallback: Try GitHub raw manifest
    try {
        console.log('📡 Fetching from GitHub raw...');
        const liveData = await fetchLiveSurface();
        
        if (liveData && liveData.version) {
            if (syncIndicator) syncIndicator.classList.add('connected');
            if (syncText) syncText.textContent = `GitHub · v${liveData.version}`;
            
            console.log('✅ GitHub surface connected');
            window.TecnocratLive = liveData;
            return;
        }
    } catch (error) {
        console.warn('⚠️ GitHub fetch failed, using local fallback:', error.message);
    }
    
    // Final fallback: local TecnocratSurface
    if (typeof TecnocratSurface !== 'undefined' && SURFACE_CONFIG.useFallback) {
        if (syncIndicator) syncIndicator.classList.add('connected');
        if (syncText) syncText.textContent = `Cached · v${TecnocratSurface.metadata.version}`;
        
        console.log(`📦 Using cached Surface v${TecnocratSurface.metadata.version}`);
        updateStatsFromSurface();
        window.TecnocratLive = TecnocratSurface.metadata;
        return;
    }
    
    // No data available
    if (syncIndicator) syncIndicator.classList.add('error');
    if (syncText) syncText.textContent = 'Offline';
    console.warn('❌ Surface data unavailable');
}

async function fetchFromApi(url) {
    const response = await fetch(url, {
        cache: 'no-cache',
        headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    
    return response.json();
}

async function fetchLiveSurface() {
    const response = await fetch(SURFACE_CONFIG.manifestUrl, {
        cache: 'no-cache',
        headers: { 'Accept': 'text/plain' }
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    
    const yamlText = await response.text();
    
    // Parse YAML (simple parser for our manifest structure)
    const parsed = parseSimpleYaml(yamlText);
    return parsed;
}

// Simple YAML parser for our specific manifest format
function parseSimpleYaml(yaml) {
    const result = {};
    const lines = yaml.split('\n');
    
    for (const line of lines) {
        // Extract version
        if (line.trim().startsWith('version:')) {
            result.version = line.split(':')[1].trim().replace(/['"]/g, '');
        }
        // Extract last_updated
        if (line.trim().startsWith('last_updated:')) {
            result.last_updated = line.split(':').slice(1).join(':').trim().replace(/['"]/g, '');
        }
        // Extract curator
        if (line.trim().startsWith('curator:')) {
            result.curator = line.split(':')[1].trim().replace(/['"]/g, '');
        }
    }
    
    result.raw = yaml;
    result.fetchedAt = new Date().toISOString();
    
    return result;
}

function updateStatsFromSurface() {
    if (typeof TecnocratSurface === 'undefined') return;
    
    const stats = TecnocratSurface.stats;
    
    // Update any stat elements that exist (new v2.0 format)
    const statMappings = {
        'stat-tools': stats.aiTools || stats.diagnosticTools,
        'stat-security': (stats.securityScore || 97.6) + '%',
        'stat-containers': stats.containers || 9,
        'stat-agents': stats.aiAgents || 5,
        'stat-loc': Math.round((stats.linesOfCode || 15800) / 1000) + 'K'
    };
    
    for (const [id, value] of Object.entries(statMappings)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
}

// Update stats from live API response
function updateStatsFromApi(metrics) {
    if (!metrics) return;
    
    const statMappings = {
        'stat-tools': metrics.aiTools,
        'stat-security': metrics.attackResistance + '%',
        'stat-containers': metrics.containers,
        'stat-tests': metrics.securityTests,
        'stat-loc': Math.round(metrics.linesOfCode / 1000) + 'K',
        'stat-modules': metrics.pythonModules
    };
    
    for (const [id, value] of Object.entries(statMappings)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
    
    console.log('📊 Stats updated from live API');
}

// ========================================
// PARTICLE SYSTEM
// ========================================
function initParticles() {
    const particleContainer = document.getElementById('particles');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = createParticle(particleContainer);
        Organism.particles.push({
            el: particle,
            color: particle.style.background,
            baseOpacity: parseFloat(particle.style.opacity)
        });
    }
    
    // Particle awareness loop — particles notice the cursor
    function updateParticleAwareness() {
        Organism.particles.forEach(p => {
            const rect = p.el.getBoundingClientRect();
            const px = rect.left + rect.width / 2;
            const py = rect.top + rect.height / 2;
            
            const dx = Organism.mouse.x - px;
            const dy = Organism.mouse.y - py;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const radius = 180;
            
            if (dist < radius) {
                const intensity = 1 - dist / radius;
                p.el.style.opacity = p.baseOpacity + intensity * 0.6;
                p.el.style.boxShadow = `0 0 ${intensity * 25 + 5}px ${p.color}`;
                p.el.style.width = `${4 + intensity * 6}px`;
                p.el.style.height = `${4 + intensity * 6}px`;
            } else {
                // Return to resting state
                p.el.style.opacity = '';
                p.el.style.boxShadow = '';
                p.el.style.width = '';
                p.el.style.height = '';
            }
        });
        
        requestAnimationFrame(updateParticleAwareness);
    }
    
    updateParticleAwareness();
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random position and animation properties
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
    particle.style.animationDelay = Math.random() * 10 + 's';
    particle.style.opacity = Math.random() * 0.5 + 0.2;
    
    // Random color from palette
    const colors = ['#667eea', '#764ba2', '#00f5d4', '#f72585'];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    particle.style.boxShadow = `0 0 ${Math.random() * 10 + 5}px ${particle.style.background}`;
    
    container.appendChild(particle);
    return particle;
}

// ========================================
// NEURAL NETWORK CANVAS
// ========================================
function initNeuralCanvas() {
    const canvas = document.getElementById('neural-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let nodes = [];
    let animationFrame;
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initNodes();
    }
    
    function initNodes() {
        nodes = [];
        const nodeCount = Math.floor((canvas.width * canvas.height) / 25000);
        
        for (let i = 0; i < nodeCount; i++) {
            nodes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1
            });
        }
    }
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw connections — synapses fire near consciousness (cursor)
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    // Connection midpoint proximity to cursor
                    const midX = (nodes[i].x + nodes[j].x) / 2;
                    const midY = (nodes[i].y + nodes[j].y) / 2;
                    const cursorDist = Math.sqrt(
                        (Organism.mouse.x - midX) ** 2 +
                        (Organism.mouse.y - midY) ** 2
                    );
                    const cursorInfluence = Math.max(0, 1 - cursorDist / 280);
                    
                    // Near cursor: accent glow, thicker lines
                    if (cursorInfluence > 0.2) {
                        ctx.strokeStyle = `rgba(0, 245, 212, ${0.1 + cursorInfluence * 0.45})`;
                        ctx.lineWidth = 1 + cursorInfluence * 2;
                    } else {
                        ctx.strokeStyle = 'rgba(102, 126, 234, 0.15)';
                        ctx.lineWidth = 1;
                    }
                    
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.globalAlpha = (1 - distance / 150) * (1 + cursorInfluence * 0.5);
                    ctx.stroke();
                }
            }
        }
        
        // Draw nodes — they notice the observer
        ctx.globalAlpha = 1;
        nodes.forEach(node => {
            // Node proximity to cursor — glow when noticed
            const nodeToCursor = Math.sqrt(
                (Organism.mouse.x - node.x) ** 2 +
                (Organism.mouse.y - node.y) ** 2
            );
            const nodeGlow = Math.max(0, 1 - nodeToCursor / 280);
            
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius + nodeGlow * 3, 0, Math.PI * 2);
            ctx.fillStyle = nodeGlow > 0.2
                ? `rgba(0, 245, 212, ${0.5 + nodeGlow * 0.5})`
                : '#667eea';
            ctx.fill();
            
            // Update position
            node.x += node.vx;
            node.y += node.vy;
            
            // Organism: gravitational pull toward cursor
            const cursorDx = Organism.mouse.x - node.x;
            const cursorDy = Organism.mouse.y - node.y;
            const cursorDist = Math.sqrt(cursorDx * cursorDx + cursorDy * cursorDy);
            const attractRadius = 280;
            if (cursorDist < attractRadius && cursorDist > 10) {
                const force = (1 - cursorDist / attractRadius) * 0.012;
                node.vx += (cursorDx / cursorDist) * force;
                node.vy += (cursorDy / cursorDist) * force;
            }
            
            // Dampen velocity — prevents runaway acceleration
            node.vx *= 0.997;
            node.vy *= 0.997;
            
            // Bounce off edges
            if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
            if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
        });
        
        animationFrame = requestAnimationFrame(draw);
    }
    
    resize();
    draw();
    
    window.addEventListener('resize', () => {
        cancelAnimationFrame(animationFrame);
        resize();
        draw();
    });
}

// ========================================
// TYPING ANIMATION
// Uses Tecnocrat surface data when available
// ========================================
function initTypingAnimation() {
    const typingElement = document.getElementById('typing-text');
    if (!typingElement) return;
    
    // Base phrases (fallback)
    let phrases = [
        'init AIOS.core()',
        'loading multi_agent_system...',
        'docker compose up -d',
        'bridge.connect(":8000")',
        'system.health_check()',
        'security.validate_all()'
    ];
    
    // Enhance with surface data if available
    if (typeof TecnocratSurface !== 'undefined') {
        const hydrolang = TecnocratSurface.surface.hydrolang;
        const security = TecnocratSurface.surface.security;
        const runtime = TecnocratSurface.surface.runtime;
        
        // Add dynamic phrases from exposed surface
        phrases = [
            'init AIOS.core()',
            `runtime_tools: ${TecnocratSurface.stats.diagnosticTools}`,
            'docker compose up -d --scale agent=3',
            `security_score: ${TecnocratSurface.stats.securityScore}%`,
            'system.health_check() // all green',
            `agents: [${TecnocratSurface.surface.evolution.exposed[0].displayContent.agents.join(', ')}]`,
            'bridge.connect(":8000")',
            'tecnocrat.surface.sync()'
        ];
    }
    
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    function type() {
        const currentPhrase = phrases[phraseIndex];
        
        if (isDeleting) {
            typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }
        
        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            typingSpeed = 2000; // Pause before deleting
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typingSpeed = 500; // Pause before typing new phrase
        }
        
        setTimeout(type, typingSpeed);
    }
    
    type();
}

// ========================================
// SMOOTH SCROLL
// ========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const navMenu = document.getElementById('nav-menu');
                const navToggle = document.getElementById('nav-toggle');
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            }
        });
    });
}

// ========================================
// NAVBAR
// ========================================
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // Active link highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        let current = '';
        const navHeight = navbar.offsetHeight;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - navHeight - 100;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// ========================================
// SCROLL ANIMATIONS
// ========================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Stagger animations for child elements
                const children = entry.target.querySelectorAll('.feature-card, .project-card, .skill-category, .contact-card');
                children.forEach((child, index) => {
                    child.style.animationDelay = `${index * 0.1}s`;
                    child.classList.add('animate-in');
                });
            }
        });
    }, observerOptions);
    
    // Observe sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        section {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        section.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .feature-card,
        .project-card,
        .skill-category,
        .contact-card {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
        
        .feature-card.animate-in,
        .project-card.animate-in,
        .skill-category.animate-in,
        .contact-card.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .nav-link.active {
            color: #667eea;
        }
        
        .nav-link.active::after {
            width: 100%;
        }
    `;
    document.head.appendChild(style);
}

// ========================================
// 3D CODE STACK - Living Abstraction Layers
// Scroll/click to navigate, returns to idle breathing
// ========================================
function initCodeStack() {
    const container = document.getElementById('code-stack');
    if (!container) return;
    
    const cards = container.querySelectorAll('.stack-card');
    const dots = container.querySelectorAll('.stack-dot');
    const upBtn = document.getElementById('stack-up');
    const downBtn = document.getElementById('stack-down');
    const hint = container.querySelector('.stack-hint');
    
    let currentIndex = 0;
    let isAnimating = false;
    let idleTimeout = null;
    let lastInteraction = Date.now();
    
    // Initialize stack positions
    updateStack(0, 'none');
    
    // Navigation functions
    function goToCard(index, direction = 'none') {
        if (isAnimating || index === currentIndex) return;
        if (index < 0 || index >= cards.length) return;
        
        isAnimating = true;
        lastInteraction = Date.now();
        
        // Hide hint after first interaction
        if (hint) hint.style.display = 'none';
        
        currentIndex = index;
        updateStack(index, direction);
        
        setTimeout(() => {
            isAnimating = false;
        }, 500);
    }
    
    function updateStack(activeIndex, direction) {
        cards.forEach((card, i) => {
            // Remove all position classes
            card.classList.remove('active', 'behind-1', 'behind-2', 'behind-3', 'behind-4', 'entering-up', 'entering-down');
            
            if (i === activeIndex) {
                card.classList.add('active');
                if (direction === 'up') card.classList.add('entering-up');
                if (direction === 'down') card.classList.add('entering-down');
            } else {
                // Calculate distance from active
                const distance = i - activeIndex;
                if (distance > 0 && distance <= 4) {
                    card.classList.add(`behind-${distance}`);
                } else if (distance < 0) {
                    // Cards above active go far back
                    card.classList.add('behind-4');
                }
            }
        });
        
        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === activeIndex);
        });
        
        // Update button states
        if (upBtn) upBtn.disabled = activeIndex === 0;
        if (downBtn) downBtn.disabled = activeIndex === cards.length - 1;
    }
    
    // Arrow button clicks
    if (upBtn) {
        upBtn.addEventListener('click', () => goToCard(currentIndex - 1, 'up'));
    }
    if (downBtn) {
        downBtn.addEventListener('click', () => goToCard(currentIndex + 1, 'down'));
    }
    
    // Dot clicks
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            const direction = i < currentIndex ? 'up' : 'down';
            goToCard(i, direction);
        });
    });
    
    // Mouse wheel navigation
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        if (isAnimating) return;
        
        if (e.deltaY > 0) {
            goToCard(currentIndex + 1, 'down');
        } else {
            goToCard(currentIndex - 1, 'up');
        }
    }, { passive: false });
    
    // Keyboard navigation when focused
    container.setAttribute('tabindex', '0');
    container.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            goToCard(currentIndex - 1, 'up');
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            goToCard(currentIndex + 1, 'down');
        }
    });
    
    // Click on cards to select (visible edges)
    cards.forEach((card, i) => {
        card.addEventListener('click', () => {
            if (i !== currentIndex) {
                const direction = i < currentIndex ? 'up' : 'down';
                goToCard(i, direction);
            }
        });
    });
    
    // Reactive behavior: stack subtly follows cursor
    container.addEventListener('mousemove', (e) => {
        if (isAnimating) return;
        
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        
        // Subtle tilt toward cursor - the stack notices you
        const stack = container.querySelector('.code-stack');
        if (stack) {
            stack.style.transform = `rotateY(${x * 5}deg) rotateX(${-y * 3}deg)`;
        }
    });
    
    // Return to neutral when mouse leaves - volition
    container.addEventListener('mouseleave', () => {
        const stack = container.querySelector('.code-stack');
        if (stack) {
            stack.style.transform = 'rotateY(0) rotateX(0)';
        }
    });
    
    // Touch support for mobile
    let touchStartY = 0;
    container.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    container.addEventListener('touchend', (e) => {
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY - touchEndY;
        
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                goToCard(currentIndex + 1, 'down');
            } else {
                goToCard(currentIndex - 1, 'up');
            }
        }
    }, { passive: true });
    
    console.log('📚 Code Stack initialized - 5 abstraction layers ready');
}

// ========================================
// INTERACTIVE 3D CUBE
// Drag to rotate, release to continue spinning
// ========================================
function initInteractiveCube() {
    const cube = document.querySelector('.cube');
    const cubeContainer = document.querySelector('.cube-container');
    if (!cube || !cubeContainer) return;
    
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;
    let rotationX = -20;  // Initial tilt
    let rotationY = 0;
    let velocityX = 0;
    let velocityY = 0.5;  // Initial spin speed
    
    const DEFAULT_VELOCITY_Y = 0.5;  // Target: constant left-to-right rotation
    const DEFAULT_ROTATION_X = -20;  // Target: slight downward tilt
    const VELOCITY_RETURN_SPEED = 0.01;  // How fast velocity returns to default
    const TILT_RETURN_SPEED = 0.005;     // How fast tilt returns to default
    
    // Disable CSS animation - we'll handle it with JS
    cube.style.animation = 'none';
    
    // Make container interactive
    cubeContainer.style.cursor = 'grab';
    cubeContainer.style.userSelect = 'none';
    
    function updateCube() {
        cube.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
    }
    
    function animate() {
        if (!isDragging) {
            // Apply velocity
            rotationY += velocityY;
            rotationX += velocityX;
            
            // Gradually return Y velocity to constant left-to-right spin
            velocityY += (DEFAULT_VELOCITY_Y - velocityY) * VELOCITY_RETURN_SPEED;
            
            // Gradually slow down X velocity
            velocityX *= 0.95;
            
            // Gradually return X rotation (tilt) back to default angle
            rotationX += (DEFAULT_ROTATION_X - rotationX) * TILT_RETURN_SPEED;
        }
        
        updateCube();
        requestAnimationFrame(animate);
    }
    
    function onMouseDown(e) {
        e.preventDefault();
        isDragging = true;
        previousMouseX = e.clientX;
        previousMouseY = e.clientY;
        cubeContainer.style.cursor = 'grabbing';
        
        // Stop any residual velocity on grab
        velocityX = 0;
        velocityY = 0;
    }
    
    function onMouseMove(e) {
        if (!isDragging) return;
        
        const deltaX = e.clientX - previousMouseX;
        const deltaY = e.clientY - previousMouseY;
        
        // Update rotation based on drag - full 360 freedom
        rotationY += deltaX * 0.5;
        rotationX -= deltaY * 0.3;
        
        // No clamping - allow full 360 rotation on all axes
        
        // Track velocity for momentum
        velocityY = deltaX * 0.1;
        velocityX = -deltaY * 0.05;
        
        previousMouseX = e.clientX;
        previousMouseY = e.clientY;
    }
    
    function onMouseUp() {
        if (!isDragging) return;
        
        isDragging = false;
        cubeContainer.style.cursor = 'grab';
        // Velocity will gradually return to default in animate()
    }
    
    // Touch support for mobile
    function onTouchStart(e) {
        if (e.touches.length === 1) {
            e.preventDefault();
            isDragging = true;
            previousMouseX = e.touches[0].clientX;
            previousMouseY = e.touches[0].clientY;
            velocityX = 0;
            velocityY = 0;
        }
    }
    
    function onTouchMove(e) {
        if (!isDragging || e.touches.length !== 1) return;
        
        const deltaX = e.touches[0].clientX - previousMouseX;
        const deltaY = e.touches[0].clientY - previousMouseY;
        
        // Full 360 rotation
        rotationY += deltaX * 0.5;
        rotationX -= deltaY * 0.3;
        
        velocityY = deltaX * 0.1;
        velocityX = -deltaY * 0.05;
        
        previousMouseX = e.touches[0].clientX;
        previousMouseY = e.touches[0].clientY;
        
        e.preventDefault();
    }
    
    function onTouchEnd() {
        isDragging = false;
        // Velocity will gradually return to default in animate()
    }
    
    // Mouse events - attach to container for better hit detection
    cubeContainer.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    
    // Touch events
    cubeContainer.addEventListener('touchstart', onTouchStart, { passive: false });
    cubeContainer.addEventListener('touchmove', onTouchMove, { passive: false });
    cubeContainer.addEventListener('touchend', onTouchEnd);
    
    // ── HYPERCUBE INTERIOR — Tachyonic Void ──
    // Three fast clicks → the UI vanishes. You're inside.
    let cubeClickCount = 0;
    let cubeClickTimer = null;
    let isExpanded = false;

    // Full-screen takeover canvas
    const hyperCanvas = document.createElement('canvas');
    hyperCanvas.className = 'hypercube-interior';
    document.body.appendChild(hyperCanvas);

    let hyperCtx = null;
    let hyperAnimId = null;
    let camYaw = 0, camPitch = 0;
    let targetYaw = 0, targetPitch = 0;
    let hyperTime = 0;
    let entryAlpha = 0;  // fade-in progress

    // ── 3D Math ──
    function rotY(p, a) {
        const c = Math.cos(a), s = Math.sin(a);
        return [p[0]*c - p[2]*s, p[1], p[0]*s + p[2]*c];
    }
    function rotX(p, a) {
        const c = Math.cos(a), s = Math.sin(a);
        return [p[0], p[1]*c - p[2]*s, p[1]*s + p[2]*c];
    }
    function proj(p, w, h) {
        const z = p[2] + 5;
        if (z <= 0.1) return null;
        const fov = 600;
        return [w/2 + (p[0]*fov)/z, h/2 + (p[1]*fov)/z, z];
    }

    // ── Geometry: outer room + inner rotating cube (tesseract) ──
    const S = 3.5;  // outer cube half-size
    const outerV = [
        [-S,-S,-S],[S,-S,-S],[S,S,-S],[-S,S,-S],
        [-S,-S, S],[S,-S, S],[S,S, S],[-S,S, S]
    ];
    const s2 = 1.0;  // inner cube half-size
    const innerV = [
        [-s2,-s2,-s2],[s2,-s2,-s2],[s2,s2,-s2],[-s2,s2,-s2],
        [-s2,-s2, s2],[s2,-s2, s2],[s2,s2, s2],[-s2,s2, s2]
    ];
    const edges = [
        [0,1],[1,2],[2,3],[3,0],
        [4,5],[5,6],[6,7],[7,4],
        [0,4],[1,5],[2,6],[3,7]
    ];

    // ── Grid floor (spatial grounding) ──
    function drawGrid(ctx, w, h) {
        const gridY = S * 0.95;  // floor level
        const gridLines = 12;
        const step = S * 2 / gridLines;
        ctx.strokeStyle = 'rgba(102, 126, 234, 0.06)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= gridLines; i++) {
            const offset = -S + i * step;
            // lines along Z
            const a1 = proj(rotX(rotY([offset, gridY, -S], -camYaw), -camPitch), w, h);
            const a2 = proj(rotX(rotY([offset, gridY,  S], -camYaw), -camPitch), w, h);
            if (a1 && a2) { ctx.beginPath(); ctx.moveTo(a1[0],a1[1]); ctx.lineTo(a2[0],a2[1]); ctx.stroke(); }
            // lines along X
            const b1 = proj(rotX(rotY([-S, gridY, offset], -camYaw), -camPitch), w, h);
            const b2 = proj(rotX(rotY([ S, gridY, offset], -camYaw), -camPitch), w, h);
            if (b1 && b2) { ctx.beginPath(); ctx.moveTo(b1[0],b1[1]); ctx.lineTo(b2[0],b2[1]); ctx.stroke(); }
        }
    }

    // ── Scanline overlay ──
    function drawScanlines(ctx, w, h) {
        ctx.fillStyle = 'rgba(255,255,255,0.008)';
        for (let y = 0; y < h; y += 4) {
            ctx.fillRect(0, y, w, 1);
        }
    }

    // ── Transform helper ──
    function xform(p, w, h) {
        return proj(rotX(rotY(p, -camYaw), -camPitch), w, h);
    }

    // ── Enter ──
    function enterHypercube() {
        if (isExpanded) return;
        isExpanded = true;
        hyperCanvas.width = window.innerWidth;
        hyperCanvas.height = window.innerHeight;
        hyperCtx = hyperCanvas.getContext('2d');
        hyperTime = 0;
        entryAlpha = 0;
        camYaw = 0; camPitch = 0;
        targetYaw = 0; targetPitch = 0;

        document.body.classList.add('hypercube-active');
        hyperCanvas.classList.add('active');

        document.addEventListener('mousemove', onHyperMouse);
        document.addEventListener('keydown', onHyperKey);
        window.addEventListener('resize', onHyperResize);

        renderLoop();
    }

    // ── Exit ──
    function exitHypercube() {
        if (!isExpanded) return;
        isExpanded = false;

        document.body.classList.remove('hypercube-active');
        hyperCanvas.classList.remove('active');

        document.removeEventListener('mousemove', onHyperMouse);
        document.removeEventListener('keydown', onHyperKey);
        window.removeEventListener('resize', onHyperResize);

        if (hyperAnimId) cancelAnimationFrame(hyperAnimId);
        hyperAnimId = null;

        velocityY = DEFAULT_VELOCITY_Y;
        rotationX = DEFAULT_ROTATION_X;
    }

    // ── Input ──
    function onHyperMouse(e) {
        targetYaw  = ((e.clientX / window.innerWidth) - 0.5) * Math.PI * 1.6;
        targetPitch = ((e.clientY / window.innerHeight) - 0.5) * Math.PI * 0.9;
    }

    function onHyperKey(e) {
        if (e.key === 'Escape') exitHypercube();
    }

    function onHyperResize() {
        hyperCanvas.width = window.innerWidth;
        hyperCanvas.height = window.innerHeight;
    }

    // ── Render Loop ──
    function renderLoop() {
        if (!isExpanded) return;
        const ctx = hyperCtx;
        const w = hyperCanvas.width, h = hyperCanvas.height;
        hyperTime += 0.016;
        if (entryAlpha < 1) entryAlpha = Math.min(1, entryAlpha + 0.02);

        // Smooth camera
        camYaw += (targetYaw - camYaw) * 0.05;
        camPitch += (targetPitch - camPitch) * 0.05;

        // Dark void background
        ctx.fillStyle = '#030308';
        ctx.fillRect(0, 0, w, h);

        // Subtle radial vignette
        const vg = ctx.createRadialGradient(w/2, h/2, w*0.1, w/2, h/2, w*0.7);
        vg.addColorStop(0, 'rgba(102,126,234,0.02)');
        vg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, w, h);

        const pulse = 0.5 + 0.5 * Math.sin(hyperTime * 2);

        // ── Floor grid ──
        drawGrid(ctx, w, h);

        // ── Outer cube wireframe (the room) ──
        ctx.shadowColor = '#667eea';
        ctx.shadowBlur = 10 * entryAlpha;
        edges.forEach(([a, b]) => {
            const pa = xform(outerV[a], w, h);
            const pb = xform(outerV[b], w, h);
            if (!pa || !pb) return;
            ctx.beginPath();
            ctx.moveTo(pa[0], pa[1]);
            ctx.lineTo(pb[0], pb[1]);
            ctx.strokeStyle = `rgba(102,126,234,${(0.25 + pulse*0.15) * entryAlpha})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });

        // ── Inner cube (rotating tesseract core) ──
        const ia = hyperTime * 0.4;
        const rotInner = innerV.map(v => {
            let p = rotY(v, ia);
            p = rotX(p, ia * 0.6);
            return p;
        });

        ctx.shadowColor = '#00f5d4';
        ctx.shadowBlur = 8 * entryAlpha;
        edges.forEach(([a, b]) => {
            const pa = xform(rotInner[a], w, h);
            const pb = xform(rotInner[b], w, h);
            if (!pa || !pb) return;
            ctx.beginPath();
            ctx.moveTo(pa[0], pa[1]);
            ctx.lineTo(pb[0], pb[1]);
            ctx.strokeStyle = `rgba(0,245,212,${(0.2 + pulse*0.1) * entryAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        // ── Hyper-connections: outer vertices → inner vertices ──
        ctx.shadowBlur = 0;
        for (let i = 0; i < 8; i++) {
            const pa = xform(outerV[i], w, h);
            const pb = xform(rotInner[i], w, h);
            if (!pa || !pb) continue;
            ctx.beginPath();
            ctx.moveTo(pa[0], pa[1]);
            ctx.lineTo(pb[0], pb[1]);
            ctx.strokeStyle = `rgba(118,75,162,${(0.06 + pulse*0.04) * entryAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }

        // ── Scanlines ──
        drawScanlines(ctx, w, h);

        // ── Crosshair ──
        ctx.strokeStyle = `rgba(102,126,234,${0.12 * entryAlpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(w/2 - 15, h/2); ctx.lineTo(w/2 + 15, h/2);
        ctx.moveTo(w/2, h/2 - 15); ctx.lineTo(w/2, h/2 + 15);
        ctx.stroke();

        // Small dot at center
        ctx.beginPath();
        ctx.arc(w/2, h/2, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(102,126,234,${0.2 * entryAlpha})`;
        ctx.fill();

        hyperAnimId = requestAnimationFrame(renderLoop);
    }

    // ── Triple-click detection ──
    cubeContainer.addEventListener('click', (e) => {
        if (isExpanded) return;
        cubeClickCount++;
        clearTimeout(cubeClickTimer);
        cubeClickTimer = setTimeout(() => { cubeClickCount = 0; }, 1200);

        if (cubeClickCount === 2) {
            cubeContainer.classList.add('cube-sensing');
            setTimeout(() => cubeContainer.classList.remove('cube-sensing'), 800);
        }

        if (cubeClickCount >= 3) {
            cubeClickCount = 0;
            enterHypercube();
        }
    });

    // Start animation loop
    animate();
    
    console.log('Interactive cube initialized (hypercube interior enabled)');
}

// ========================================
// HYDROLANG CODE BLOCK HOVER EFFECT
// ========================================
const hydrolangBlock = document.querySelector('.hydrolang-block');
if (hydrolangBlock) {
    hydrolangBlock.addEventListener('mouseenter', () => {
        hydrolangBlock.style.boxShadow = '0 0 40px rgba(102, 126, 234, 0.6)';
    });
    
    hydrolangBlock.addEventListener('mouseleave', () => {
        hydrolangBlock.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.4)';
    });
}

// ========================================
// DYNAMIC YEAR IN FOOTER
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    const footerYear = document.getElementById('footer-year');
    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }
});

// ========================================
// EXPANDABLE ARCHITECTURE LAYERS
// ========================================
function toggleLayerDetail(element) {
    // Close other expanded layers
    document.querySelectorAll('.expanded').forEach(el => {
        if (el !== element) el.classList.remove('expanded');
    });
    element.classList.toggle('expanded');
}

// ========================================
// ORGANISM BEHAVIORS
// Cards, layers, and elements react to presence.
// Everything notices. Everything recovers.
// ========================================
function initOrganismBehaviors() {
    // --- Feature & Project Cards: 3D tilt toward cursor ---
    const interactiveCards = document.querySelectorAll('.feature-card, .project-card');
    interactiveCards.forEach(card => {
        card.style.transformStyle = 'preserve-3d';
        card.style.willChange = 'transform';
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
            const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
            
            // 3D tilt + lift + scale — the card orients toward you
            card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 4}deg) translateY(-5px) scale(1.02)`;
            
            // Dynamic inner glow follows cursor position
            const glowX = ((e.clientX - rect.left) / rect.width) * 100;
            const glowY = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.background = `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(102, 126, 234, 0.12) 0%, var(--bg-card) 60%)`;
        });
        
        card.addEventListener('mouseleave', () => {
            // Fluid recovery to resting state
            card.style.transform = '';
            card.style.background = '';
        });
    });
    
    // --- Architecture Layers: breathing animation ---
    document.querySelectorAll('.arch-layer').forEach(layer => {
        layer.classList.add('organism-breathing');
    });
    
    // Security supercell gets its own heartbeat rhythm
    document.querySelectorAll('.security-supercell').forEach(cell => {
        cell.classList.add('organism-breathing');
    });
    
    // --- Skill tags and badges: stagger delays for wave effect ---
    document.querySelectorAll('.tech-badge').forEach((badge, i) => {
        badge.style.animationDelay = `${i * 0.2}s`;
        badge.classList.add('organism-tag-breathing');
    });
    
    // --- Contact cards: subtle depth response ---
    document.querySelectorAll('.contact-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
            const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
            card.style.transform = `perspective(600px) rotateY(${x * 4}deg) rotateX(${-y * 3}deg) translateY(-3px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
    
    // --- Global proximity awareness for nav links ---
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('mouseenter', () => {
            link.style.textShadow = '0 0 10px rgba(102, 126, 234, 0.5)';
        });
        link.addEventListener('mouseleave', () => {
            link.style.textShadow = '';
        });
    });
    
    // --- Surface sync indicator breathing ---
    const syncDot = document.querySelector('.sync-dot');
    if (syncDot) {
        syncDot.classList.add('organism-pulse');
    }
    
    console.log('🌿 Organism behaviors active — the site is alive');
}

// ========================================
// LIVE API STATS UPDATE
// ========================================
(async function updateLiveStats() {
    try {
        const response = await fetch('https://tecnocrat-api.vercel.app/api');
        if (!response.ok) return;
        const data = await response.json();
        const m = data.metrics;
        if (m) {
            const tools = document.getElementById('stat-tools');
            const commits = document.getElementById('stat-commits');
            const loc = document.getElementById('stat-loc');
            const security = document.getElementById('security-score');
            if (tools) tools.textContent = m.aiTools + '+';
            if (commits) commits.textContent = m.commits;
            if (loc) loc.textContent = (m.linesOfCode / 1000).toFixed(1) + 'K';
            if (security) security.textContent = m.attackResistance + '%';
        }
    } catch (e) {
        // Silently fall back to static values
    }
})();

