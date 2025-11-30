// ========================================
// AIOS-THEMED PORTFOLIO SCRIPTS
// Neural network animations and interactions
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initParticles();
    initNeuralCanvas();
    initTypingAnimation();
    initSmoothScroll();
    initNavbar();
    initScrollAnimations();
});

// ========================================
// PARTICLE SYSTEM
// ========================================
function initParticles() {
    const particleContainer = document.getElementById('particles');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle(particleContainer);
    }
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
        
        // Draw connections
        ctx.strokeStyle = 'rgba(102, 126, 234, 0.15)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.globalAlpha = 1 - distance / 150;
                    ctx.stroke();
                }
            }
        }
        
        // Draw nodes
        ctx.globalAlpha = 1;
        nodes.forEach(node => {
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#667eea';
            ctx.fill();
            
            // Update position
            node.x += node.vx;
            node.y += node.vy;
            
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
// ========================================
function initTypingAnimation() {
    const typingElement = document.getElementById('typing-text');
    if (!typingElement) return;
    
    const phrases = [
        'init AIOS.core()',
        'loading multi_agent_system...',
        'Φ(consciousness) → ∞',
        'bridge.connect(reality)',
        'observer.watch(∃₀→∃ₙ)',
        'security_supercell.activate()'
    ];
    
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
// CUBE INTERACTION (Optional mouse tracking)
// ========================================
document.addEventListener('mousemove', (e) => {
    const cube = document.querySelector('.cube');
    if (!cube) return;
    
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Subtle rotation based on mouse position
    const rotateY = (mouseX / centerX) * 10;
    const rotateX = -(mouseY / centerY) * 10;
    
    // Only apply on larger screens
    if (window.innerWidth > 992) {
        cube.style.transform = `rotateX(${-20 + rotateX}deg) rotateY(${rotateY}deg)`;
    }
});

// Reset cube rotation when mouse leaves
document.addEventListener('mouseleave', () => {
    const cube = document.querySelector('.cube');
    if (cube && window.innerWidth > 992) {
        cube.style.transform = '';
    }
});

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
    const footerYear = document.querySelector('.footer p');
    if (footerYear) {
        footerYear.innerHTML = footerYear.innerHTML.replace('2025', new Date().getFullYear());
    }
});
