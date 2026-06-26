// ============================================================
//  UI
// ============================================================

const UI = {
    switchPanel(name) {
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('panel-' + name).classList.add('active');
        document.querySelector('.nav-btn[data-panel="' + name + '"]').classList.add('active');
        if (name === 'task') Task.render();
        if (name === 'hunt') Hunt.render();
        if (name === 'inventory') Inventory.render();
        if (name === 'equipment') Equipment.render();
        if (name === 'shop') Shop.render();
        if (name === 'workshop') Workshop.render();
    },
    showModal(id) { document.getElementById(id).classList.add('active'); },
    closeModal(id) { document.getElementById(id).classList.remove('active'); },
    log(msg, type) {
        const logDiv = document.getElementById('game-log');
        const entry = document.createElement('div');
        entry.className = 'log-message';
        if (type === 'success') entry.style.color = 'var(--neon-green)';
        if (type === 'danger') entry.style.color = 'var(--neon-pink)';
        if (type === 'gold') entry.style.color = 'var(--neon-gold)';
        entry.textContent = msg;
        logDiv.appendChild(entry);
        logDiv.scrollTop = logDiv.scrollHeight;
        while (logDiv.children.length > 5) logDiv.removeChild(logDiv.firstChild);
    },
    updateHeader() {
        const p = STATE.player;
        const cls = CONFIG.CLASSES[p.class];
        document.getElementById('display-name').textContent = p.name;
        document.getElementById('display-realm').textContent = CONFIG.REALMS[p.realmIndex];
        document.getElementById('display-class').textContent = cls.name;
        const equipBonus = Equipment.getBonus();
        const totalAtk = Math.floor(p.attack + equipBonus.attack + CONFIG.REALM_POWER[p.realmIndex] / 100);
        document.getElementById('display-power').textContent = totalAtk * 10 + CONFIG.REALM_POWER[p.realmIndex];
        document.getElementById('display-hp').textContent = p.hp + '/' + p.maxHp;
        document.getElementById('display-mp').textContent = p.mp + '/' + p.maxMp;
        document.getElementById('display-money').textContent = p.money.toLocaleString();
        const maxExp = CONFIG.REALM_EXP[p.realmIndex];
        document.getElementById('display-exp').textContent = p.exp + ' / ' + maxExp.toLocaleString();
        document.getElementById('exp-fill').style.width = (p.exp / maxExp * 100) + '%';
        const cultDisplay = document.getElementById('cult-exp-display');
        if (cultDisplay) {
            cultDisplay.textContent = p.exp + ' / ' + maxExp.toLocaleString();
            cultDisplay.classList.add('flash');
            setTimeout(() => cultDisplay.classList.remove('flash'), 300);
        }
        document.getElementById('cult-rate').textContent = '约5分钟/周期';
        document.getElementById('realm-info').textContent = CONFIG.REALMS[p.realmIndex];
        document.getElementById('next-realm-info').textContent = p.realmIndex < CONFIG.REALMS.length - 1 ? CONFIG.REALMS[p.realmIndex + 1] : '已达巅峰';
        document.getElementById('realm-power').textContent = CONFIG.REALM_POWER[p.realmIndex].toLocaleString();
        const btn = document.getElementById('btn-breakthrough');
        if (p.exp >= maxExp) {
            btn.disabled = false; btn.textContent = '尝试突破';
            document.getElementById('breakthrough-info').textContent = '原能已满，可尝试突破';
        } else {
            btn.disabled = true; btn.textContent = '原能不足';
            document.getElementById('breakthrough-info').textContent = '还需 ' + (maxExp - p.exp).toLocaleString() + ' 原能';
        }
    }
};
