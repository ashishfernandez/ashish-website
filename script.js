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

            const rotateX = ((y - centerY) / centerY) * -4;
            const rotateY = ((x - centerX) / centerX) * 4;

            tile.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        tile.addEventListener('mouseleave', () => {
            tile.style.transform = '';
        });
    });
})();
