// ============================================================
//  Hunt
// ============================================================

const Hunt = {
    render() {
        const list = document.getElementById('hunt-list');
        list.innerHTML = '';
        CONFIG.REGIONS.forEach(region => {
            const unlocked = STATE.player.realmIndex >= region.unlockRealmIndex;
            const regionCleared = STATE.regionsCleared.includes(region.id);
            const regionDiv = document.createElement('div');
            regionDiv.className = 'card';
            regionDiv.style.marginBottom = '14px';
            const regionTitle = region.name + (regionCleared ? ' ✓' : '') + (unlocked ? '' : ' 🔒');
            const requiredRealm = CONFIG.REALMS[region.unlockRealmIndex];
            regionDiv.innerHTML = '<div class="card-title">' + regionTitle + '</div><div style="font-size:12px; color:var(--text-dim); margin-bottom:10px;">' + (unlocked ? region.desc : '需要境界：' + requiredRealm) + '</div><div class="region-monsters" id="region-monsters-' + region.id + '"></div>';
            list.appendChild(regionDiv);
            if (!unlocked) return;
            const monsterList = regionDiv.querySelector('#region-monsters-' + region.id);
            region.monsterIds.forEach(monsterId => {
                const monster = CONFIG.MONSTERS.find(m => m.id === monsterId);
                if (!monster) return;
                const isCleared = STATE.stagesCleared.includes(monster.id);
                const div = document.createElement('div');
                div.className = 'hunt-item';
                let statusText = isCleared ? '✓ 已通关' : '⚔️ 挑战';
                let btnClass = isCleared ? 'btn-success' : 'btn-primary';
                div.innerHTML = '<div class="task-info"><div class="task-name">' + monster.icon + ' ' + monster.name + '</div><div class="task-desc">' + monster.level + ' | 推荐拳力: ' + (monster.hp * 10).toLocaleString() + 'kg</div><div class="task-reward">掉落: ' + monster.reward.money.toLocaleString() + '💰 ' + monster.reward.exp.toLocaleString() + '原能 ' + monster.reward.material + '</div></div><button class="btn btn-sm ' + btnClass + '">' + statusText + '</button>';
                div.querySelector('button').addEventListener('click', () => Hunt.enter(monster.id));
                monsterList.appendChild(div);
            });
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
            STATE.totalKills++;
            if (!STATE.monstersKilled[monster.name]) STATE.monstersKilled[monster.name] = 0;
            STATE.monstersKilled[monster.name]++;
            Task.checkProgress('kill', 1);
            UI.log('猎杀成功！获得 ' + monster.reward.money.toLocaleString() + '💰 ' + monster.reward.exp.toLocaleString() + '原能 ' + monster.reward.material);
            UI.updateHeader(); Save.save();
            Task.render();
        }, 1500);
    },
    checkRegionClear(regionId) {
        const region = CONFIG.REGIONS.find(r => r.id === regionId);
        if (!region) return;
        const allCleared = region.monsterIds.every(id => STATE.stagesCleared.includes(id));
        if (allCleared && !STATE.regionsCleared.includes(regionId)) {
            STATE.regionsCleared.push(regionId);
            UI.log('🎉 通关区域：' + region.name + '！', 'success');
            Task.checkAchievement('region', regionId);
        }
    }
};
