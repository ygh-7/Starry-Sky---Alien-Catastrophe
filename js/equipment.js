// ============================================================
//  Equipment
// ============================================================

const Equipment = {
    getBonus() {
        let atk = 0, def = 0;
        if (STATE.equipment.weapon) { const item = CONFIG.ITEMS[STATE.equipment.weapon]; if (item) atk += item.attack || 0; }
        if (STATE.equipment.armor) { const item = CONFIG.ITEMS[STATE.equipment.armor]; if (item) def += item.defense || 0; }
        return { attack:atk, defense:def };
    },
    equip(name) {
        const item = CONFIG.ITEMS[name];
        if (!item) return;
        const slot = item.type === 'weapon' ? 'weapon' : 'armor';
        if (STATE.player.class === 'psychic' && name === '猩红战刃') { UI.log('精神念师无法使用武者战刀！'); return; }
        if (STATE.player.class === 'warrior' && name === '裂空梭') { UI.log('武者无法使用念力兵器！'); return; }
        if (STATE.equipment[slot]) Inventory.addItem(STATE.equipment[slot], 1);
        STATE.equipment[slot] = name;
        Inventory.addItem(name, -1);
        UI.log('装备 ' + name + '！' + (item.type === 'weapon' ? '拳力' : '防御') + '+' + (item.type === 'weapon' ? item.attack : item.defense));
        Equipment.render(); UI.updateHeader(); Save.save();
    },
    unequip(slot) {
        if (!STATE.equipment[slot]) return;
        const name = STATE.equipment[slot];
        Inventory.addItem(name, 1);
        STATE.equipment[slot] = null;
        UI.log('卸下 ' + name);
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
            wDiv.innerHTML = '<div class="slot-label">武器</div><div class="slot-icon">' + renderIcon(item.icon, 36) + '</div><div class="slot-name">' + STATE.equipment.weapon + '</div><div class="slot-attr">拳力 +' + item.attack + 'kg</div>';
            wDiv.addEventListener('click', () => Equipment.unequip('weapon'));
        } else { wDiv.innerHTML = '<div class="slot-label">武器</div><div class="slot-icon">🗡️</div><div class="slot-name">未装备</div>'; }
        slots.appendChild(wDiv);
        const aDiv = document.createElement('div');
        aDiv.className = 'equip-slot' + (STATE.equipment.armor ? '' : ' empty');
        if (STATE.equipment.armor) {
            const item = CONFIG.ITEMS[STATE.equipment.armor];
            aDiv.innerHTML = '<div class="slot-label">防具</div><div class="slot-icon">' + renderIcon(item.icon, 36) + '</div><div class="slot-name">' + STATE.equipment.armor + '</div><div class="slot-attr">防御 +' + item.defense + '%</div>';
            aDiv.addEventListener('click', () => Equipment.unequip('armor'));
        } else { aDiv.innerHTML = '<div class="slot-label">防具</div><div class="slot-icon">🛡️</div><div class="slot-name">未装备</div>'; }
        slots.appendChild(aDiv);
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
