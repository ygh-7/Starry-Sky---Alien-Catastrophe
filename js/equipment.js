// ============================================================
//  Equipment
// ============================================================

const Equipment = {
    getBonus() {
        let atk = 0, def = 0;
        if (STATE.equipment.weapon) { 
            const item = CONFIG.ITEMS[STATE.equipment.weapon]; 
            if (item) {
                const level = STATE.equipment.weaponLevel || 0;
                const multiplier = 1 + level * CONFIG.ENHANCE.weaponBonusPerLevel;
                atk += Math.floor((item.attack || 0) * multiplier);
            }
        }
        if (STATE.equipment.armor) { 
            const item = CONFIG.ITEMS[STATE.equipment.armor]; 
            if (item) {
                const level = STATE.equipment.armorLevel || 0;
                const multiplier = 1 + level * CONFIG.ENHANCE.armorBonusPerLevel;
                def += Math.floor((item.defense || 0) * multiplier);
            }
        }
        return { attack:atk, defense:def };
    },
    getEnhanceInfo(slot) {
        const level = slot === 'weapon' ? (STATE.equipment.weaponLevel || 0) : (STATE.equipment.armorLevel || 0);
        if (level >= CONFIG.ENHANCE.maxLevel) return null;
        return CONFIG.ENHANCE.levels[level];
    },
    equip(name) {
        const item = CONFIG.ITEMS[name];
        if (!item) return;
        const slot = item.type === 'weapon' ? 'weapon' : 'armor';
        if (STATE.player.class === 'psychic' && name === '猩红战刃') { UI.log('精神念师无法使用武者战刀！'); return; }
        if (STATE.player.class === 'warrior' && name === '裂空梭') { UI.log('武者无法使用念力兵器！'); return; }
        if (STATE.equipment[slot]) {
            Inventory.addItem(STATE.equipment[slot], 1);
            STATE.equipment[slot + 'Level'] = 0;
        }
        STATE.equipment[slot] = name;
        STATE.equipment[slot + 'Level'] = 0;
        Inventory.addItem(name, -1);
        UI.log('装备 ' + name + '！' + (item.type === 'weapon' ? '拳力' : '防御') + '+' + (item.type === 'weapon' ? item.attack : item.defense));
        Equipment.render(); UI.updateHeader(); Save.save();
    },
    unequip(slot) {
        if (!STATE.equipment[slot]) return;
        const name = STATE.equipment[slot];
        Inventory.addItem(name, 1);
        STATE.equipment[slot] = null;
        STATE.equipment[slot + 'Level'] = 0;
        UI.log('卸下 ' + name);
        Equipment.render(); UI.updateHeader(); Save.save();
    },
    enhance(slot) {
        const name = STATE.equipment[slot];
        if (!name) { UI.log('该位置没有装备！'); return; }
        const level = slot === 'weapon' ? (STATE.equipment.weaponLevel || 0) : (STATE.equipment.armorLevel || 0);
        if (level >= CONFIG.ENHANCE.maxLevel) { UI.log('装备已达到最高强化等级！'); return; }
        const cfg = CONFIG.ENHANCE.levels[level];
        const matCount = STATE.inventory[cfg.material] || 0;
        if (matCount < cfg.materialCount) { UI.log(cfg.material + ' 不足！'); return; }
        if (STATE.player.money < cfg.money) { UI.log('星辰币不足！'); return; }
        Inventory.addItem(cfg.material, -cfg.materialCount);
        STATE.player.money -= cfg.money;
        if (Math.random() < cfg.rate) {
            STATE.equipment[slot + 'Level'] = level + 1;
            UI.log('🎉 强化成功！' + name + ' +' + (level + 1), 'success');
            Task.checkProgress('enhance', 1);
            Task.checkAchievement('enhanceLevel', level + 1);
        } else {
            UI.log('💔 强化失败，材料已消耗', 'danger');
        }
        Equipment.render(); UI.updateHeader(); Save.save();
    },
    render() {
        const slots = document.getElementById('equip-slots');
        slots.innerHTML = '';
        const bonus = Equipment.getBonus();
        document.getElementById('equip-atk-bonus').textContent = bonus.attack;
        document.getElementById('equip-def-bonus').textContent = bonus.defense;
        const wDiv = document.createElement('div');
        wDiv.className = 'equip-slot' + (STATE.equipment.weapon ? '' : ' empty');
        if (STATE.equipment.weapon) {
            const item = CONFIG.ITEMS[STATE.equipment.weapon];
            const level = STATE.equipment.weaponLevel || 0;
            wDiv.innerHTML = '<div class="slot-label">武器</div><div class="slot-icon">' + renderIcon(item.icon, 36) + '</div><div class="slot-name">' + STATE.equipment.weapon + (level > 0 ? ' +' + level : '') + '</div><div class="slot-attr">拳力 +' + bonus.attack + 'kg</div>';
            wDiv.addEventListener('click', () => Equipment.unequip('weapon'));
        } else { wDiv.innerHTML = '<div class="slot-label">武器</div><div class="slot-icon">🗡️</div><div class="slot-name">未装备</div>'; }
        slots.appendChild(wDiv);
        const aDiv = document.createElement('div');
        aDiv.className = 'equip-slot' + (STATE.equipment.armor ? '' : ' empty');
        if (STATE.equipment.armor) {
            const item = CONFIG.ITEMS[STATE.equipment.armor];
            const level = STATE.equipment.armorLevel || 0;
            aDiv.innerHTML = '<div class="slot-label">防具</div><div class="slot-icon">' + renderIcon(item.icon, 36) + '</div><div class="slot-name">' + STATE.equipment.armor + (level > 0 ? ' +' + level : '') + '</div><div class="slot-attr">防御 +' + bonus.defense + '%</div>';
            aDiv.addEventListener('click', () => Equipment.unequip('armor'));
        } else { aDiv.innerHTML = '<div class="slot-label">防具</div><div class="slot-icon">🛡️</div><div class="slot-name">未装备</div>'; }
        slots.appendChild(aDiv);

        // 强化区域
        const enhanceContainer = document.getElementById('equip-enhance');
        enhanceContainer.innerHTML = '<div class="card-title" style="font-size:14px;">⚒️ 装备强化</div><div id="enhance-slots"></div>';
        const enhanceSlots = enhanceContainer.querySelector('#enhance-slots');
        ['weapon', 'armor'].forEach(slot => {
            const name = STATE.equipment[slot];
            const div = document.createElement('div');
            div.className = 'task-item';
            if (!name) {
                div.innerHTML = '<div class="task-info"><div class="task-name">未装备' + (slot === 'weapon' ? '武器' : '防具') + '</div><div class="task-desc">装备后才能强化</div></div><button class="btn btn-sm" disabled>强化</button>';
            } else {
                const level = slot === 'weapon' ? (STATE.equipment.weaponLevel || 0) : (STATE.equipment.armorLevel || 0);
                if (level >= CONFIG.ENHANCE.maxLevel) {
                    div.innerHTML = '<div class="task-info"><div class="task-name">' + name + ' +' + level + '</div><div class="task-desc">已达最高强化等级</div></div><button class="btn btn-sm btn-success" disabled>满级</button>';
                } else {
                    const cfg = CONFIG.ENHANCE.levels[level];
                    const matCount = STATE.inventory[cfg.material] || 0;
                    const enough = matCount >= cfg.materialCount && STATE.player.money >= cfg.money;
                    div.innerHTML = '<div class="task-info"><div class="task-name">' + name + ' +' + level + ' → +' + (level + 1) + '</div><div class="task-desc">消耗: ' + cfg.material + '×' + cfg.materialCount + ' (拥有' + matCount + ') + ' + cfg.money.toLocaleString() + '💰</div><div class="task-reward">成功率: ' + Math.floor(cfg.rate * 100) + '%</div></div><button class="btn btn-sm btn-primary" ' + (enough ? '' : 'disabled') + '>强化</button>';
                    div.querySelector('button').addEventListener('click', () => Equipment.enhance(slot));
                }
            }
            enhanceSlots.appendChild(div);
        });

        const list = document.getElementById('equip-list');
        list.innerHTML = '';
        const equipItems = Object.entries(STATE.inventory).filter(([name]) => { const item = CONFIG.ITEMS[name]; return item && (item.type === 'weapon' || item.type === 'armor'); });
        if (equipItems.length === 0) { list.innerHTML = '<div style="color:var(--text-dim); text-align:center; padding:20px;">背包中没有装备</div>'; return; }
        equipItems.forEach(([name, count]) => {
            const item = CONFIG.ITEMS[name];
            const div = document.createElement('div');
            div.className = 'equip-list-item';
            const attrText = item.type === 'weapon' ? '拳力 +' + item.attack + 'kg' : '防御 +' + item.defense + '%';
            div.innerHTML = '<div style="flex:1;"><div style="font-weight:bold;">' + renderIcon(item.icon) + ' ' + name + '</div><div style="font-size:12px; color:var(--neon-green);">' + attrText + '</div></div><button class="btn btn-sm btn-success" data-equip="' + name + '">穿戴</button>';
            div.querySelector('button').addEventListener('click', () => Equipment.equip(name));
            list.appendChild(div);
        });
    }
};
