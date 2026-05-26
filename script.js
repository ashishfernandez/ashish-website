/* ============================================
   Fluid Particle Background
   ============================================ */
(function () {
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let orbs = [];
    let mouse = { x: null, y: null, active: false };
    let time = 0;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
    });

    window.addEventListener('mouseleave', () => {
        mouse.active = false;
    });

    // Accent palette
    const palette = [
        [124, 106, 255],  // purple
        [0, 212, 170],    // teal
        [255, 92, 147],   // pink
        [80, 160, 255],   // blue
        [255, 180, 80],   // amber
    ];

    /* ---------- Floating Orbs (large, blurry, slow) ---------- */
    class Orb {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.radius = Math.random() * 180 + 100;
            this.color = palette[Math.floor(Math.random() * 3)]; // stick to main 3
            this.opacity = Math.random() * 0.06 + 0.02;
            this.driftX = (Math.random() - 0.5) * 0.15;
            this.driftY = (Math.random() - 0.5) * 0.15;
            this.phaseX = Math.random() * Math.PI * 2;
            this.phaseY = Math.random() * Math.PI * 2;
            this.freqX = Math.random() * 0.0004 + 0.0002;
            this.freqY = Math.random() * 0.0004 + 0.0002;
        }

        update(t) {
            this.x += this.driftX + Math.sin(t * this.freqX + this.phaseX) * 0.3;
            this.y += this.driftY + Math.cos(t * this.freqY + this.phaseY) * 0.3;

            // Wrap around
            if (this.x < -this.radius) this.x = canvas.width + this.radius;
            if (this.x > canvas.width + this.radius) this.x = -this.radius;
            if (this.y < -this.radius) this.y = canvas.height + this.radius;
            if (this.y > canvas.height + this.radius) this.y = -this.radius;
        }

        draw() {
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
            gradient.addColorStop(0, `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.opacity})`);
            gradient.addColorStop(1, `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, 0)`);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        }
    }

    /* ---------- Particles (small, sharp, fast) ---------- */
    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.3;
            this.baseSpeedX = (Math.random() - 0.5) * 0.4;
            this.baseSpeedY = (Math.random() - 0.5) * 0.4;
            this.opacity = Math.random() * 0.5 + 0.08;
            this.pulseSpeed = Math.random() * 0.002 + 0.001;
            this.pulsePhase = Math.random() * Math.PI * 2;
            this.color = palette[Math.floor(Math.random() * palette.length)];
            this.driftPhase = Math.random() * Math.PI * 2;
            this.driftFreq = Math.random() * 0.001 + 0.0005;
            this.driftAmp = Math.random() * 0.5 + 0.2;
        }

        update(t) {
            // Organic sine-wave drift
            this.x += this.baseSpeedX + Math.sin(t * this.driftFreq + this.driftPhase) * this.driftAmp;
            this.y += this.baseSpeedY + Math.cos(t * this.driftFreq + this.driftPhase * 1.3) * this.driftAmp;

            // Pulsing opacity
            this.currentOpacity = this.opacity * (0.6 + 0.4 * Math.sin(t * this.pulseSpeed + this.pulsePhase));

            // Mouse attraction / repulsion
            if (mouse.active && mouse.x !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200) {
                    const force = (200 - dist) / 200;
                    // Gentle attraction
                    this.x += (dx / dist) * force * 0.3;
                    this.y += (dy / dist) * force * 0.3;
                }
            }

            // Wrap
            if (this.x < -20) this.x = canvas.width + 20;
            if (this.x > canvas.width + 20) this.x = -20;
            if (this.y < -20) this.y = canvas.height + 20;
            if (this.y > canvas.height + 20) this.y = -20;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.currentOpacity})`;
            ctx.fill();
        }
    }

    /* ---------- Connecting Lines ---------- */
    function connectParticles() {
        const maxDist = 120;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxDist) {
                    const opacity = (1 - dist / maxDist) * 0.06;
                    // Blend colors of the two particles
                    const c1 = particles[i].color;
                    const c2 = particles[j].color;
                    const r = Math.round((c1[0] + c2[0]) / 2);
                    const g = Math.round((c1[1] + c2[1]) / 2);
                    const b = Math.round((c1[2] + c2[2]) / 2);
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    /* ---------- Mouse Glow ---------- */
    function drawMouseGlow() {
        if (!mouse.active || mouse.x === null) return;
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 250);
        gradient.addColorStop(0, 'rgba(124, 106, 255, 0.04)');
        gradient.addColorStop(0.5, 'rgba(0, 212, 170, 0.02)');
        gradient.addColorStop(1, 'rgba(255, 92, 147, 0)');
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 250, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    /* ---------- Init & Animate ---------- */
    function init() {
        particles = [];
        orbs = [];
        const particleCount = Math.min(100, Math.floor((canvas.width * canvas.height) / 12000));
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
        for (let i = 0; i < 5; i++) {
            orbs.push(new Orb());
        }
    }

    function animate() {
        time++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Layer 1: Floating orbs (background blobs)
        orbs.forEach(o => {
            o.update(time);
            o.draw();
        });

        // Layer 2: Mouse glow
        drawMouseGlow();

        // Layer 3: Particles
        particles.forEach(p => {
            p.update(time);
            p.draw();
        });

        // Layer 4: Connections
        connectParticles();

        requestAnimationFrame(animate);
    }

    init();
    animate();
    window.addEventListener('resize', init);
})();

/* ============================================
   3D Tilt Effect on Tiles
   ============================================ */
(function () {
    const tiles = document.querySelectorAll('.tile');

    tiles.forEach(tile => {
        tile.addEventListener('mousemove', (e) => {
            const rect = tile.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;

            tile.style.transform = `perspective(1000px) translateY(-8px) scale(1.015) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

            // Move glow with cursor
            const glow = tile.querySelector('.tile-glow');
            if (glow) {
                const percX = (x / rect.width) * 100;
                const percY = (y / rect.height) * 100;
                glow.style.background = glow.style.background.replace(
                    /at [\d.]+% [\d.]+%/,
                    `at ${percX}% ${percY}%`
                );
            }
        });

        tile.addEventListener('mouseleave', () => {
            tile.style.transform = '';
        });
    });
})();
