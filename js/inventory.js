// ============================================================
//  Inventory
// ============================================================

const Inventory = {
    addItem(name, count) {
        if (!STATE.inventory[name]) STATE.inventory[name] = 0;
        STATE.inventory[name] += count;
        if (STATE.inventory[name] <= 0) delete STATE.inventory[name];
        if (document.getElementById('panel-inventory').classList.contains('active')) Inventory.render();
        Save.save();
    },
    render() {
        const grid = document.getElementById('inventory-grid');
        grid.innerHTML = '';
        const items = Object.entries(STATE.inventory);
        if (items.length === 0) { grid.innerHTML = '<div class="inv-empty">空间戒指空空如也...</div>'; return; }
        items.forEach(([name, count]) => {
            const item = CONFIG.ITEMS[name] || { icon:"📦", desc:"未知物品" };
            const div = document.createElement('div');
            div.className = 'inv-item';
            div.innerHTML = '<div class="item-icon">' + renderIcon(item.icon) + '</div><div style="font-size:11px; color:var(--text-dim);">' + name + '</div><div class="item-count">x' + count + '</div>';
            div.title = item.desc;
            div.addEventListener('click', () => Inventory.useItem(name));
            grid.appendChild(div);
        });
    },
    useItem(name) {
        const item = CONFIG.ITEMS[name];
        if (!item) return;
        if (item.type === 'weapon' || item.type === 'armor') { Equipment.equip(name); return; }
        if (item.type !== 'consumable') { UI.log(name + ' 无法直接使用'); return; }
        if (!STATE.inventory[name] || STATE.inventory[name] <= 0) return;
        const effect = item.effect;
        if (effect.exp) {
            STATE.player.exp = Math.min(STATE.player.exp + effect.exp, CONFIG.REALM_EXP[STATE.player.realmIndex]);
            STATE.player.totalExp += effect.exp;
            UI.log('使用 ' + name + '，基因原能 +' + effect.exp + '！');
        }
        if (effect.heal) {
            const heal = Math.floor(STATE.player.maxHp * effect.heal);
            STATE.player.hp = Math.min(STATE.player.hp + heal, STATE.player.maxHp);
            UI.log('使用 ' + name + '，恢复 ' + heal + ' 点生命！');
        }
        if (effect.mp) {
            STATE.player.mp = Math.min(STATE.player.mp + effect.mp, STATE.player.maxMp);
            UI.log('使用 ' + name + '，念力 +' + effect.mp + '！');
        }
        Inventory.addItem(name, -1);
        Inventory.render(); UI.updateHeader(); Save.save();
    }
};
