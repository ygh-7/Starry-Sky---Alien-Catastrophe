// ============================================================
//  Hunt
// ============================================================

const Hunt = {
    render() {
        const list = document.getElementById('hunt-list');
        list.innerHTML = '';
        CONFIG.MONSTERS.forEach(monster => {
            const isCleared = STATE.stagesCleared.includes(monster.id);
            const div = document.createElement('div');
            div.className = 'hunt-item';
            let statusText = isCleared ? '✓ 已通关' : '⚔️ 挑战';
            let btnClass = isCleared ? 'btn-success' : 'btn-primary';
            div.innerHTML = '<div class="task-info"><div class="task-name">' + monster.icon + ' ' + monster.name + '</div><div class="task-desc">' + monster.level + ' | 推荐拳力: ' + (monster.hp * 10) + 'kg</div><div class="task-reward">掉落: ' + monster.reward.money.toLocaleString() + '💰 ' + monster.reward.exp.toLocaleString() + '原能 ' + monster.reward.material + '</div></div><button class="btn btn-sm ' + btnClass + '">' + statusText + '</button>';
            div.querySelector('button').addEventListener('click', () => Hunt.enter(monster.id));
            list.appendChild(div);
        });
    },
    enter(monsterId) {
        const monster = CONFIG.MONSTERS.find(m => m.id === monsterId);
        if (!monster) return;
        const isCleared = STATE.stagesCleared.includes(monster.id);
        if (isCleared) Hunt.autoHunt(monster);
        else Battle.start(monster);
    },
    autoHunt(monster) {
        UI.log('自动猎杀 ' + monster.name + '...');
        setTimeout(() => {
            STATE.player.money += monster.reward.money;
            STATE.player.totalMoney += monster.reward.money;
            STATE.player.exp = Math.min(STATE.player.exp + monster.reward.exp, CONFIG.REALM_EXP[STATE.player.realmIndex]);
            STATE.player.totalExp += monster.reward.exp;
            Inventory.addItem(monster.reward.material, 1 + Math.floor(Math.random() * 2));
            UI.log('猎杀成功！获得 ' + monster.reward.money.toLocaleString() + '💰 ' + monster.reward.exp.toLocaleString() + '原能 ' + monster.reward.material);
            UI.updateHeader(); Save.save();
        }, 1500);
    }
};
