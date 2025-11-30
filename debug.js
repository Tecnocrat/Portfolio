// ========================================
// PORTFOLIO DEBUG TOOL
// Paste this entire script into browser console (F12 → Console)
// ========================================

(function() {
    console.log('%c🔍 PORTFOLIO DEBUG REPORT', 'font-size: 20px; font-weight: bold; color: #667eea;');
    console.log('='.repeat(50));
    
    const report = {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        elements: {},
        scripts: {},
        errors: [],
        cube: {}
    };
    
    // Check key elements
    const elements = [
        '.cube-container',
        '.cube',
        '.face',
        '#neural-canvas',
        '#particles',
        '.navbar'
    ];
    
    console.log('\n%c📦 ELEMENTS CHECK', 'font-weight: bold; color: #00f5d4;');
    elements.forEach(selector => {
        const el = document.querySelector(selector);
        const exists = el !== null;
        report.elements[selector] = exists;
        console.log(`  ${exists ? '✅' : '❌'} ${selector}: ${exists ? 'FOUND' : 'NOT FOUND'}`);
    });
    
    // Check cube state
    console.log('\n%c🎲 CUBE STATE', 'font-weight: bold; color: #f72585;');
    const cube = document.querySelector('.cube');
    const cubeContainer = document.querySelector('.cube-container');
    
    if (cube) {
        const computedStyle = window.getComputedStyle(cube);
        report.cube = {
            animation: cube.style.animation || 'not set inline',
            computedAnimation: computedStyle.animation,
            transform: cube.style.transform || 'not set inline',
            computedTransform: computedStyle.transform,
            cursor: cubeContainer?.style.cursor || 'not set'
        };
        
        console.log(`  Animation (inline): ${report.cube.animation}`);
        console.log(`  Animation (computed): ${report.cube.computedAnimation}`);
        console.log(`  Transform (inline): ${report.cube.transform}`);
        console.log(`  Cursor: ${report.cube.cursor}`);
    } else {
        console.log('  ❌ Cube element not found!');
    }
    
    // Check if script loaded
    console.log('\n%c📜 SCRIPTS CHECK', 'font-weight: bold; color: #764ba2;');
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(s => {
        console.log(`  📄 ${s.src}`);
    });
    
    // Check for initInteractiveCube function
    const hasCubeFunction = typeof window.initInteractiveCube === 'function' || 
                            document.body.innerHTML.includes('initInteractiveCube');
    console.log(`  ${hasCubeFunction ? '✅' : '❌'} initInteractiveCube defined`);
    
    // Check event listeners (limited detection)
    console.log('\n%c🎯 EVENT LISTENER TEST', 'font-weight: bold; color: #00f5d4;');
    if (cubeContainer) {
        // Try to trigger and detect
        const hasGrabCursor = cubeContainer.style.cursor === 'grab';
        console.log(`  ${hasGrabCursor ? '✅' : '❌'} Grab cursor set: ${cubeContainer.style.cursor || 'none'}`);
        console.log(`  ${cubeContainer.style.userSelect === 'none' ? '✅' : '❌'} User-select disabled`);
    }
    
    // Check console for previous errors
    console.log('\n%c⚠️ BROWSER INFO', 'font-weight: bold; color: #f72585;');
    console.log(`  Browser: ${navigator.userAgent.split(' ').slice(-2).join(' ')}`);
    console.log(`  Page loaded: ${document.readyState}`);
    
    // Output copyable report
    console.log('\n%c📋 COPY THIS REPORT:', 'font-weight: bold; color: #667eea;');
    console.log(JSON.stringify(report, null, 2));
    
    // Visual test - try moving the cube
    console.log('\n%c🧪 ATTEMPTING CUBE TEST...', 'font-weight: bold; color: #00f5d4;');
    if (cube) {
        const originalTransform = cube.style.transform;
        cube.style.transform = 'rotateX(-20deg) rotateY(45deg)';
        console.log('  ✅ Set test transform - cube should have moved!');
        console.log('  (Will reset in 2 seconds)');
        
        setTimeout(() => {
            cube.style.transform = originalTransform;
            console.log('  🔄 Reset transform');
        }, 2000);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('%c📤 Please share the JSON report above!', 'font-size: 14px; color: #667eea;');
    
    return report;
})();
