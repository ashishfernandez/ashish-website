/* ============================================
   Particle Background
   ============================================ */
(function () {
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null };

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.5 + 0.3;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.4 + 0.05;
            // Random accent color
            const colors = [
                [124, 106, 255],  // purple
                [0, 212, 170],    // teal
                [255, 92, 147],   // pink
            ];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (mouse.x !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    const force = (100 - dist) / 100;
                    this.x -= (dx / dist) * force * 0.6;
                    this.y -= (dy / dist) * force * 0.6;
                }
            }

            if (this.x < -10 || this.x > canvas.width + 10 || this.y < -10 || this.y > canvas.height + 10) {
                this.reset();
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.opacity})`;
            ctx.fill();
        }
    }

    function init() {
        particles = [];
        const count = Math.min(60, Math.floor((canvas.width * canvas.height) / 20000));
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 140) {
                    const opacity = (1 - dist / 140) * 0.08;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(124, 106, 255, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
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
