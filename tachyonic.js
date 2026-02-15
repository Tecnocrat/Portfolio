// ═══════════════════════════════════════════════════════════
// TACHYONIC ENGINE — Hand-Rolled 3D Void Renderer
// ═══════════════════════════════════════════════════════════
// Canvas 2D software rasterizer. No WebGL. No Three.js.
// Pure math → pixel. The way it should be.
//
// Architecture:
//   rotY / rotX / proj — the entire 3D pipeline
//   Geometry: outer room (tesseract), inner rotating cube, core sphere
//   Event horizon: infinite perspective plane beyond the sphere surface
//   Input: mouse look, scroll zoom, ESC layered exit
//
// Integration:
//   TachyonicEngine.init({ cubeContainer, onExit })
//   TachyonicEngine.enter()   — triple-click activates
//   TachyonicEngine.exit()    — ESC or API
//   TachyonicEngine.isActive  — read-only state
// ═══════════════════════════════════════════════════════════

const TachyonicEngine = (() => {
    'use strict';

    // ── State ──
    let cubeContainer = null;
    let onExitCallback = null;
    let isExpanded = false;

    // Canvas
    const hyperCanvas = document.createElement('canvas');
    hyperCanvas.className = 'hypercube-interior';
    document.body.appendChild(hyperCanvas);

    let hyperCtx = null;
    let hyperAnimId = null;

    // Camera
    let camYaw = 0, camPitch = 0;
    let targetYaw = 0, targetPitch = 0;
    let camZoom = 0, targetZoom = 0;
    const MAX_ZOOM = 4.3;

    // Timing
    let hyperTime = 0;
    let entryAlpha = 0;

    // Event horizon
    let inEventHorizon = false;
    let horizonAlpha = 0;


    // ═════════════════════════════════════
    // 3D MATH — the entire rendering pipeline
    // ═════════════════════════════════════

    function rotY(p, a) {
        const c = Math.cos(a), s = Math.sin(a);
        return [p[0]*c - p[2]*s, p[1], p[0]*s + p[2]*c];
    }

    function rotX(p, a) {
        const c = Math.cos(a), s = Math.sin(a);
        return [p[0], p[1]*c - p[2]*s, p[1]*s + p[2]*c];
    }

    function proj(p, w, h) {
        const z = p[2] + 5 - camZoom;
        if (z <= 0.1) return null;
        const fov = 600;
        return [w/2 + (p[0]*fov)/z, h/2 + (p[1]*fov)/z, z];
    }

    function xform(p, w, h) {
        return proj(rotX(rotY(p, -camYaw), -camPitch), w, h);
    }


    // ═════════════════════════════════════
    // GEOMETRY — tesseract wireframe
    // ═════════════════════════════════════

    const S = 3.5;   // outer cube half-size
    const outerV = [
        [-S,-S,-S], [S,-S,-S], [S,S,-S], [-S,S,-S],
        [-S,-S, S], [S,-S, S], [S,S, S], [-S,S, S]
    ];

    const s2 = 1.0;  // inner cube half-size
    const innerV = [
        [-s2,-s2,-s2], [s2,-s2,-s2], [s2,s2,-s2], [-s2,s2,-s2],
        [-s2,-s2, s2], [s2,-s2, s2], [s2,s2, s2], [-s2,s2, s2]
    ];

    const edges = [
        [0,1], [1,2], [2,3], [3,0],
        [4,5], [5,6], [6,7], [7,4],
        [0,4], [1,5], [2,6], [3,7]
    ];


    // ═════════════════════════════════════
    // DRAWING HELPERS
    // ═════════════════════════════════════

    function drawGrid(ctx, w, h) {
        const gridY = S * 0.95;
        const gridLines = 12;
        const step = S * 2 / gridLines;
        ctx.strokeStyle = `rgba(102, 126, 234, ${0.06 * (1 - camZoom / MAX_ZOOM * 0.8)})`;
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= gridLines; i++) {
            const offset = -S + i * step;
            const a1 = proj(rotX(rotY([offset, gridY, -S], -camYaw), -camPitch), w, h);
            const a2 = proj(rotX(rotY([offset, gridY,  S], -camYaw), -camPitch), w, h);
            if (a1 && a2) { ctx.beginPath(); ctx.moveTo(a1[0],a1[1]); ctx.lineTo(a2[0],a2[1]); ctx.stroke(); }
            const b1 = proj(rotX(rotY([-S, gridY, offset], -camYaw), -camPitch), w, h);
            const b2 = proj(rotX(rotY([ S, gridY, offset], -camYaw), -camPitch), w, h);
            if (b1 && b2) { ctx.beginPath(); ctx.moveTo(b1[0],b1[1]); ctx.lineTo(b2[0],b2[1]); ctx.stroke(); }
        }
    }

    function drawScanlines(ctx, w, h) {
        ctx.fillStyle = 'rgba(255,255,255,0.008)';
        for (let y = 0; y < h; y += 4) {
            ctx.fillRect(0, y, w, 1);
        }
    }


    // ═════════════════════════════════════
    // EVENT HORIZON — the sphere's surface
    // ═════════════════════════════════════
    // An infinite flat plane. You zoomed too deep.

    function renderEventHorizon(ctx, w, h, alpha) {
        ctx.fillStyle = '#020206';
        ctx.fillRect(0, 0, w, h);

        const horizon = h * 0.42;
        const vanishX = w / 2;
        const vanishY = horizon;
        const gridPhase = (hyperTime * 0.3) % 1;

        ctx.globalAlpha = alpha;

        // Horizontal lines receding to vanishing point
        const numHLines = 40;
        for (let i = 0; i < numHLines; i++) {
            const t = (i + gridPhase) / numHLines;
            const y = horizon + (h - horizon) * Math.pow(t, 1.8);
            const depth = 1 - t;
            const fade = Math.pow(depth, 0.5) * 0.35;
            const spread = w * 0.8 + (w * 1.5) * t;

            ctx.strokeStyle = `rgba(118, 75, 162, ${fade})`;
            ctx.lineWidth = 0.5 + t * 1.5;
            ctx.beginPath();
            ctx.moveTo(vanishX - spread / 2, y);
            ctx.lineTo(vanishX + spread / 2, y);
            ctx.stroke();
        }

        // Vertical lines converging to vanishing point
        const numVLines = 24;
        for (let i = 0; i < numVLines; i++) {
            const frac = (i / (numVLines - 1)) - 0.5;
            const bottomX = vanishX + frac * w * 2.5;
            const fade = 0.2 - Math.abs(frac) * 0.25;
            if (fade <= 0) continue;

            ctx.strokeStyle = `rgba(102, 126, 234, ${Math.max(0, fade)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(vanishX, vanishY);
            ctx.lineTo(bottomX, h + 20);
            ctx.stroke();
        }

        // Horizon glow line
        const glowIntensity = 0.3 + Math.sin(hyperTime * 0.8) * 0.1;
        const horizGrad = ctx.createLinearGradient(0, vanishY - 20, 0, vanishY + 20);
        horizGrad.addColorStop(0, 'rgba(118, 75, 162, 0)');
        horizGrad.addColorStop(0.5, `rgba(118, 75, 162, ${glowIntensity})`);
        horizGrad.addColorStop(1, 'rgba(118, 75, 162, 0)');
        ctx.fillStyle = horizGrad;
        ctx.fillRect(0, vanishY - 20, w, 40);

        // Concentric ripples from vanishing point
        for (let r = 0; r < 6; r++) {
            const rippleRadius = ((hyperTime * 40 + r * 80) % 500);
            const rippleFade = Math.max(0, 1 - rippleRadius / 500) * 0.12;
            const ellipseH = rippleRadius * 0.15;
            ctx.strokeStyle = `rgba(102, 126, 234, ${rippleFade})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.ellipse(vanishX, vanishY + ellipseH * 0.5, rippleRadius, ellipseH, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Floating data fragments
        for (let i = 0; i < 30; i++) {
            const seed = i * 7919;
            const sx = ((seed * 13) % w);
            const sy = horizon + ((seed * 17) % (h - horizon));
            const depthT = (sy - horizon) / (h - horizon);
            const blink = Math.sin(hyperTime * (1 + (seed % 3)) + seed) * 0.5 + 0.5;
            const size = 0.5 + depthT * 1.5;
            const brightness = blink * depthT * 0.25;
            ctx.fillStyle = `rgba(200, 180, 255, ${brightness})`;
            ctx.fillRect(sx, sy, size, size);
        }

        // Stars above horizon
        for (let i = 0; i < 20; i++) {
            const seed = i * 3571;
            const sx = (seed * 23) % w;
            const sy = (seed * 31) % horizon;
            const blink = Math.sin(hyperTime * 0.5 + seed) * 0.5 + 0.5;
            ctx.fillStyle = `rgba(150, 140, 200, ${blink * 0.15})`;
            ctx.fillRect(sx, sy, 1, 1);
        }

        drawScanlines(ctx, w, h);

        // Vignette
        const vr = Math.max(w, h) * 0.8;
        const vg = ctx.createRadialGradient(w/2, h/2, vr*0.3, w/2, h/2, vr);
        vg.addColorStop(0, 'rgba(0,0,0,0)');
        vg.addColorStop(1, 'rgba(0,0,0,0.7)');
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, w, h);

        ctx.globalAlpha = 1;
    }


    // ═════════════════════════════════════
    // INPUT HANDLERS
    // ═════════════════════════════════════

    function onHyperMouse(e) {
        targetYaw  = ((e.clientX / window.innerWidth) - 0.5) * Math.PI * 1.6;
        targetPitch = ((e.clientY / window.innerHeight) - 0.5) * Math.PI * 0.9;
    }

    function onHyperKey(e) {
        if (e.key === 'Escape') {
            if (inEventHorizon) {
                inEventHorizon = false;
                targetZoom = MAX_ZOOM - 0.5;
            } else {
                exit();
            }
        }
    }

    function onHyperWheel(e) {
        e.preventDefault();
        if (inEventHorizon) return;
        targetZoom += e.deltaY * 0.003;
        targetZoom = Math.max(0, Math.min(MAX_ZOOM, targetZoom));
    }

    function onHyperResize() {
        hyperCanvas.width = window.innerWidth;
        hyperCanvas.height = window.innerHeight;
    }


    // ═════════════════════════════════════
    // RENDER LOOP
    // ═════════════════════════════════════

    function renderLoop() {
        if (!isExpanded) return;
        const ctx = hyperCtx;
        const w = hyperCanvas.width, h = hyperCanvas.height;
        hyperTime += 0.016;
        if (entryAlpha < 1) entryAlpha = Math.min(1, entryAlpha + 0.02);

        // Smooth camera
        camYaw += (targetYaw - camYaw) * 0.05;
        camPitch += (targetPitch - camPitch) * 0.05;
        camZoom += (targetZoom - camZoom) * 0.04;

        // Event horizon threshold
        if (camZoom >= MAX_ZOOM - 0.05 && !inEventHorizon) {
            inEventHorizon = true;
            horizonAlpha = 0;
        }

        // ── EVENT HORIZON MODE ──
        if (inEventHorizon) {
            horizonAlpha = Math.min(1, horizonAlpha + 0.015);
            renderEventHorizon(ctx, w, h, horizonAlpha);
            hyperAnimId = requestAnimationFrame(renderLoop);
            return;
        }

        // Fade geometries as we approach the sphere
        const approachFade = Math.max(0, 1 - (camZoom / MAX_ZOOM) * 0.6);

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
            ctx.strokeStyle = `rgba(102,126,234,${(0.25 + pulse*0.15) * entryAlpha * approachFade})`;
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
            ctx.strokeStyle = `rgba(0,245,212,${(0.2 + pulse*0.1) * entryAlpha * approachFade})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        // ── Hyper-connections: outer → inner ──
        ctx.shadowBlur = 0;
        for (let i = 0; i < 8; i++) {
            const pa = xform(outerV[i], w, h);
            const pb = xform(rotInner[i], w, h);
            if (!pa || !pb) continue;
            ctx.beginPath();
            ctx.moveTo(pa[0], pa[1]);
            ctx.lineTo(pb[0], pb[1]);
            ctx.strokeStyle = `rgba(118,75,162,${(0.06 + pulse*0.04) * entryAlpha * approachFade})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }

        // ── Core sphere ──
        const sphereRadius = 0.45;
        const sphereRings = 12;
        const sphereSegments = 16;
        const sphereRotA = hyperTime * 0.25;
        const sphereRotB = hyperTime * 0.15;
        const sphereIntensity = 1 + (camZoom / MAX_ZOOM) * 3;

        ctx.shadowColor = '#764ba2';
        ctx.shadowBlur = (6 + camZoom * 4) * entryAlpha;

        // Latitude rings
        for (let ring = 1; ring < sphereRings; ring++) {
            const phi = (ring / sphereRings) * Math.PI;
            const y = Math.cos(phi) * sphereRadius;
            const r = Math.sin(phi) * sphereRadius;
            let prevP = null;
            for (let seg = 0; seg <= sphereSegments; seg++) {
                const theta = (seg / sphereSegments) * Math.PI * 2;
                let pt = [Math.cos(theta) * r, y, Math.sin(theta) * r];
                pt = rotY(pt, sphereRotA);
                pt = rotX(pt, sphereRotB);
                const sp = xform(pt, w, h);
                if (sp && prevP) {
                    ctx.beginPath();
                    ctx.moveTo(prevP[0], prevP[1]);
                    ctx.lineTo(sp[0], sp[1]);
                    ctx.strokeStyle = `rgba(118,75,162,${Math.min(1, (0.12 + pulse*0.08) * entryAlpha * sphereIntensity)})`;
                    ctx.lineWidth = 0.6 + camZoom * 0.15;
                    ctx.stroke();
                }
                prevP = sp;
            }
        }

        // Longitude lines
        for (let seg = 0; seg < sphereSegments; seg++) {
            const theta = (seg / sphereSegments) * Math.PI * 2;
            let prevP = null;
            for (let ring = 0; ring <= sphereRings; ring++) {
                const phi = (ring / sphereRings) * Math.PI;
                const y = Math.cos(phi) * sphereRadius;
                const r = Math.sin(phi) * sphereRadius;
                let pt = [Math.cos(theta) * r, y, Math.sin(theta) * r];
                pt = rotY(pt, sphereRotA);
                pt = rotX(pt, sphereRotB);
                const sp = xform(pt, w, h);
                if (sp && prevP) {
                    ctx.beginPath();
                    ctx.moveTo(prevP[0], prevP[1]);
                    ctx.lineTo(sp[0], sp[1]);
                    ctx.strokeStyle = `rgba(118,75,162,${Math.min(1, (0.08 + pulse*0.06) * entryAlpha * sphereIntensity)})`;
                    ctx.lineWidth = 0.4 + camZoom * 0.1;
                    ctx.stroke();
                }
                prevP = sp;
            }
        }
        ctx.shadowBlur = 0;

        // ── Scanlines ──
        drawScanlines(ctx, w, h);

        // ── Crosshair ──
        ctx.strokeStyle = `rgba(102,126,234,${0.12 * entryAlpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(w/2 - 15, h/2); ctx.lineTo(w/2 + 15, h/2);
        ctx.moveTo(w/2, h/2 - 15); ctx.lineTo(w/2, h/2 + 15);
        ctx.stroke();

        // Center dot
        ctx.beginPath();
        ctx.arc(w/2, h/2, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(102,126,234,${0.2 * entryAlpha})`;
        ctx.fill();

        hyperAnimId = requestAnimationFrame(renderLoop);
    }


    // ═════════════════════════════════════
    // PUBLIC API
    // ═════════════════════════════════════

    function init(config) {
        cubeContainer = config.cubeContainer;
        onExitCallback = config.onExit || null;

        // Triple-click detection
        let clickCount = 0;
        let clickTimer = null;

        cubeContainer.addEventListener('click', (e) => {
            if (isExpanded) return;
            clickCount++;
            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => { clickCount = 0; }, 1200);

            if (clickCount === 2) {
                cubeContainer.classList.add('cube-sensing');
                setTimeout(() => cubeContainer.classList.remove('cube-sensing'), 800);
            }

            if (clickCount >= 3) {
                clickCount = 0;
                enter();
            }
        });

        console.log('Tachyonic Engine initialized');
    }

    function enter() {
        if (isExpanded) return;
        isExpanded = true;
        hyperCanvas.width = window.innerWidth;
        hyperCanvas.height = window.innerHeight;
        hyperCtx = hyperCanvas.getContext('2d');
        hyperTime = 0;
        entryAlpha = 0;
        camYaw = 0; camPitch = 0;
        targetYaw = 0; targetPitch = 0;
        camZoom = 0; targetZoom = 0;
        inEventHorizon = false;
        horizonAlpha = 0;

        document.body.classList.add('hypercube-active');
        hyperCanvas.classList.add('active');

        document.addEventListener('mousemove', onHyperMouse);
        document.addEventListener('keydown', onHyperKey);
        document.addEventListener('wheel', onHyperWheel, { passive: false });
        window.addEventListener('resize', onHyperResize);

        renderLoop();
    }

    function exit() {
        if (!isExpanded) return;
        isExpanded = false;

        document.body.classList.remove('hypercube-active');
        hyperCanvas.classList.remove('active');

        document.removeEventListener('mousemove', onHyperMouse);
        document.removeEventListener('keydown', onHyperKey);
        document.removeEventListener('wheel', onHyperWheel);
        window.removeEventListener('resize', onHyperResize);

        if (hyperAnimId) cancelAnimationFrame(hyperAnimId);
        hyperAnimId = null;

        if (onExitCallback) onExitCallback();
    }

    // ── Public surface ──
    return {
        init,
        enter,
        exit,
        get isActive() { return isExpanded; }
    };

})();
