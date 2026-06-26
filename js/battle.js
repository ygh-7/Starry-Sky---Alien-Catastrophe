// ============================================================
//  Battle
// ============================================================

const Battle = {
    start(monster) {
        battleState = {
            monster: monster,
            playerHp: STATE.player.hp,
            playerMp: STATE.player.mp,
            playerMaxHp: STATE.player.maxHp,
            playerMaxMp: STATE.player.maxMp,
            enemyHp: monster.hp,
            enemyMaxHp: monster.hp,
            enemyAtk: monster.atk,
            enemyDef: monster.def,
            defending: false
        };
        document.getElementById('battle-title').textContent = '荒野区猎杀';
        document.getElementById('battle-subtitle').textContent = monster.level + ' - ' + monster.name;
        document.getElementById('enemy-name').textContent = monster.name;
        const avatarEl = document.getElementById('enemy-avatar');
        if (monster.id === 1) {
            avatarEl.innerHTML = '<img src="assets/images/' + CONFIG.WOLF_IMG + '" style="width:50px;height:50px;object-fit:contain;filter:drop-shadow(0 0 15px rgba(0,200,255,0.8));animation:wolfBreath 2s ease-in-out infinite;">';
            avatarEl.style.borderColor = '#0099ff';
            avatarEl.style.boxShadow = '0 0 30px rgba(0,150,255,0.5), 0 0 60px rgba(0,200,255,0.2)';
            avatarEl.classList.add('wolf-avatar');
        } else {
            avatarEl.textContent = monster.icon;
            avatarEl.style.borderColor = 'var(--neon-pink)';
            avatarEl.style.boxShadow = '0 0 20px rgba(255,71,87,0.3)';
            avatarEl.classList.remove('wolf-avatar');
        }
        document.getElementById('player-battle-name').textContent = STATE.player.name;
        Battle.updateUI();
        document.getElementById('battle-screen').classList.add('active');
        document.getElementById('battle-log').innerHTML = '';
        const wolfBg = document.getElementById('wolf-bg');
        if (monster.id === 1) {
            wolfBg.style.backgroundImage = 'url(assets/images/' + CONFIG.WOLF_IMG + ')';
            wolfBg.classList.add('active');
        } else {
            wolfBg.classList.remove('active');
        }
        Battle.log('遭遇 ' + monster.name + '！', 'system');
    },
    updateUI() {
        const bs = battleState;
        document.getElementById('enemy-hp-bar').style.width = (bs.enemyHp / bs.enemyMaxHp * 100) + '%';
        document.getElementById('enemy-hp-text').textContent = bs.enemyHp + ' / ' + bs.enemyMaxHp;
        document.getElementById('player-hp-bar').style.width = (bs.playerHp / bs.playerMaxHp * 100) + '%';
        document.getElementById('player-hp-text').textContent = bs.playerHp + ' / ' + bs.playerMaxHp;
        document.getElementById('player-battle-mp').textContent = bs.playerMp;
        document.getElementById('player-battle-max-mp').textContent = bs.playerMaxMp;
    },
    log(msg, type) {
        const logDiv = document.getElementById('battle-log');
        const entry = document.createElement('div');
        entry.className = 'log-entry log-' + type;
        if (type === 'wolf') entry.classList.add('log-wolf');
        entry.textContent = msg;
        logDiv.appendChild(entry);
        logDiv.scrollTop = logDiv.scrollHeight;
    },
    playerAction(action) {
        if (!battleState) return;
        const bs = battleState;
        const cls = CONFIG.CLASSES[STATE.player.class];
        bs.defending = false;
        const equipBonus = Equipment.getBonus();
        const baseAtk = STATE.player.attack + equipBonus.attack + Math.floor(CONFIG.REALM_POWER[STATE.player.realmIndex] / 1000);
        switch(action) {
            case 'attack':
                const dmg1 = Math.max(1, Math.floor(baseAtk * cls.atkBonus) - bs.enemyDef + Math.floor(Math.random() * 5));
                bs.enemyHp -= dmg1;
                Battle.log('你发动攻击，造成 ' + dmg1 + ' 点伤害！', 'damage');
                break;
            case 'skill':
                if (bs.playerMp < 20) { Battle.log('念力不足！', 'system'); return; }
                bs.playerMp -= 20;
                const skillMultiplier = STATE.player.class === 'psychic' ? 1.8 : 1.5;
                const dmg2 = Math.max(1, Math.floor(baseAtk * skillMultiplier) - bs.enemyDef + Math.floor(Math.random() * 10));
                bs.enemyHp -= dmg2;
                Battle.log('你使用 ' + cls.skill + '，造成 ' + dmg2 + ' 点伤害！', 'damage');
                break;
            case 'defend':
                bs.defending = true;
                Battle.log('你进入防御姿态，受到的伤害减半！', 'system');
                break;
            case 'item':
                Battle.openItemModal(); return;
        }
        if (bs.enemyHp <= 0) { bs.enemyHp = 0; Battle.updateUI(); setTimeout(() => Battle.victory(), 500); return; }
        setTimeout(() => Battle.enemyTurn(), 600);
    },
    openItemModal() {
        const list = document.getElementById('usable-items-list');
        list.innerHTML = '';
        const usable = Object.entries(STATE.inventory).filter(([name]) => CONFIG.ITEMS[name] && CONFIG.ITEMS[name].type === 'consumable');
        if (usable.length === 0) { list.innerHTML = '<div style="color:var(--text-dim); padding:12px;">没有可用药剂</div>'; }
        else {
            usable.forEach(([name, count]) => {
                const item = CONFIG.ITEMS[name];
                const div = document.createElement('div');
                div.style.cssText = 'background:var(--bg-light); border:1px solid var(--border); border-radius:6px; padding:10px; margin-bottom:8px; cursor:pointer; text-align:center;';
                div.innerHTML = '<div style="font-size:24px; margin-bottom:4px;">' + renderIcon(item.icon, 24) + '</div><div style="font-size:13px;">' + name + ' x' + count + '</div><div style="font-size:11px; color:var(--text-dim);">' + item.desc + '</div>';
                div.addEventListener('click', () => { Battle.useItem(name); UI.closeModal('item-modal'); });
                list.appendChild(div);
            });
        }
        UI.showModal('item-modal');
    },
    useItem(name) {
        if (!battleState) return;
        const item = CONFIG.ITEMS[name];
        if (!item || !STATE.inventory[name]) return;
        const effect = item.effect;
        if (effect.heal) {
            const heal = Math.floor(battleState.playerMaxHp * effect.heal);
            battleState.playerHp = Math.min(battleState.playerHp + heal, battleState.playerMaxHp);
            Battle.log('使用 ' + name + '，恢复 ' + heal + ' 点生命！', 'heal');
        }
        if (effect.exp) { Battle.log(name + ' 战斗中无法使用！', 'system'); return; }
        Inventory.addItem(name, -1);
        Inventory.render(); Battle.updateUI();
        setTimeout(() => Battle.enemyTurn(), 600);
    },
    enemyTurn() {
        const bs = battleState;
        const equipBonus = Equipment.getBonus();
        const totalDef = STATE.player.defense + equipBonus.defense;
        let damage = Math.max(1, bs.enemyAtk - totalDef + Math.floor(Math.random() * 5));
        if (bs.defending) damage = Math.floor(damage / 2);
        bs.playerHp -= damage;
        if (bs.monster.id === 1) {
            Battle.spawnIceParticles();
            Battle.log('❄️ ' + bs.monster.name + ' 冰霜爪击，造成 ' + damage + ' 点伤害！', 'damage');
        } else {
            Battle.log(bs.monster.name + ' 攻击，造成 ' + damage + ' 点伤害！', 'damage');
        }
        if (bs.playerHp <= 0) { bs.playerHp = 1; Battle.updateUI(); setTimeout(() => Battle.defeat(), 500); return; }
        bs.playerMp = Math.min(bs.playerMp + 5, bs.playerMaxMp);
        Battle.updateUI();
    },
    spawnIceParticles() {
        const container = document.getElementById('wolf-ice-particles');
        if (!container) return;
        for (let i = 0; i < 12; i++) {
            const p = document.createElement('div');
            p.className = 'wolf-ice-particle';
            const startX = 20 + Math.random() * 60;
            const startY = 20 + Math.random() * 60;
            const tx = (Math.random() - 0.5) * 200 + 'px';
            const ty = -50 - Math.random() * 150 + 'px';
            p.style.left = startX + '%'; p.style.top = startY + '%';
            p.style.setProperty('--tx', tx); p.style.setProperty('--ty', ty);
            container.appendChild(p); void p.offsetWidth; p.classList.add('active');
            setTimeout(() => { if (p.parentNode) p.parentNode.removeChild(p); }, 2000);
        }
    },
    victory() {
        const bs = battleState;
        const reward = bs.monster.reward;
        Battle.log('🎉 猎杀成功！', 'system');
        STATE.player.money += reward.money;
        STATE.player.totalMoney += reward.money;
        STATE.player.exp = Math.min(STATE.player.exp + reward.exp, CONFIG.REALM_EXP[STATE.player.realmIndex]);
        STATE.player.totalExp += reward.exp;
        Inventory.addItem(reward.material, 1 + Math.floor(Math.random() * 2));
        if (!STATE.stagesCleared.includes(bs.monster.id)) STATE.stagesCleared.push(bs.monster.id);
        STATE.player.hp = Math.min(STATE.player.hp + Math.floor(STATE.player.maxHp * 0.3), STATE.player.maxHp);
        if (!STATE.monstersKilled[bs.monster.name]) STATE.monstersKilled[bs.monster.name] = 0;
        STATE.monstersKilled[bs.monster.name]++;
        let killLevel = bs.monster.level.includes('兽兵') ? '兽兵' : bs.monster.level.includes('兽将') ? '兽将' : '领主';
        Task.checkProgress('kill', 1, killLevel);
        Task.checkProgress('kill', 1, bs.monster.name);
        UI.log('猎杀 ' + bs.monster.name + '！获得 ' + reward.money.toLocaleString() + '💰 ' + reward.exp.toLocaleString() + '原能 ' + reward.material);
        setTimeout(() => { Battle.close(); Hunt.render(); UI.updateHeader(); Save.save(); }, 1500);
    },
    defeat() {
        Battle.log('💔 战斗失败，你重伤撤退...', 'system');
        STATE.player.hp = 1; STATE.player.mp = Math.floor(STATE.player.maxMp / 2);
        setTimeout(() => { Battle.close(); UI.updateHeader(); Save.save(); }, 1500);
    },
    close() {
        document.getElementById('battle-screen').classList.remove('active');
        document.getElementById('battle-log').innerHTML = '';
        document.getElementById('wolf-bg').classList.remove('active');
        battleState = null;
    }
};
