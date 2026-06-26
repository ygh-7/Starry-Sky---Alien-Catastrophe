// ============================================================
//  Mecha
// ============================================================

const Mecha = {
    triggerAnimation() {
        const body = document.getElementById('mecha-body');
        const flash = document.getElementById('mecha-flash');
        const wave = document.getElementById('mecha-wave');
        const particles = document.getElementById('mecha-particles');
        if (!body) return;
        const actions = ['punch', 'kick', 'burst'];
        const action = actions[Math.floor(Math.random() * actions.length)];
        body.classList.remove('punch', 'kick', 'burst');
        void body.offsetWidth;
        body.classList.add(action);
        if (flash) { flash.classList.remove('active'); void flash.offsetWidth; flash.classList.add('active'); setTimeout(() => flash.classList.remove('active'), 700); }
        if (wave) { wave.classList.remove('active'); void wave.offsetWidth; wave.classList.add('active'); setTimeout(() => wave.classList.remove('active'), 1000); }
        if (particles) Mecha.spawnParticles(particles);
        setTimeout(() => body.classList.remove(action), 700);
    },
    spawnParticles(container) {
        for (let i = 0; i < 8; i++) {
            const p = document.createElement('div');
            p.className = 'mecha-particle';
            const angle = (Math.PI * 2 / 8) * i + Math.random() * 0.5;
            const dist = 60 + Math.random() * 40;
            const tx = Math.cos(angle) * dist + 'px';
            const ty = Math.sin(angle) * dist + 'px';
            p.style.setProperty('--tx', tx); p.style.setProperty('--ty', ty);
            p.style.left = '50%'; p.style.top = '50%'; p.style.marginLeft = '-2px'; p.style.marginTop = '-2px';
            const colors = ['var(--neon-cyan)', 'var(--neon-purple)', 'var(--neon-green)', 'var(--neon-pink)'];
            p.style.background = colors[Math.floor(Math.random() * colors.length)];
            p.style.boxShadow = '0 0 10px ' + p.style.background;
            container.appendChild(p); void p.offsetWidth; p.classList.add('active');
            setTimeout(() => { if (p.parentNode) p.parentNode.removeChild(p); }, 1500);
        }
    }
};
