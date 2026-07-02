// ============================================================
//  Cultivation
// ============================================================

const Cultivation = {
    startOnlineCultivation() {
        if (cultivationInterval) clearInterval(cultivationInterval);
        let tickCount = 0;
        cultivationInterval = setInterval(() => {
            const maxExp = CONFIG.REALM_EXP[STATE.player.realmIndex];
            if (STATE.player.exp < maxExp) {
                const gain = Math.max(1, Math.floor(maxExp / 60));
                STATE.player.exp = Math.min(STATE.player.exp + gain, maxExp);
                STATE.player.totalExp += gain;
                UI.updateHeader(); Save.save(); tickCount++;
                Mecha.triggerAnimation();
                if (tickCount % 6 === 0) {
                    UI.log('🦾 机甲修炼中... 30秒累计 +' + (gain * 6).toLocaleString() + ' 原能');
                }
                Task.checkProgress('cult', gain);
            }
        }, 5000);
    },
    stopOnlineCultivation() { if (cultivationInterval) { clearInterval(cultivationInterval); cultivationInterval = null; } },
    calculateOfflineGain() {
        const now = Date.now();
        const offlineSeconds = Math.floor((now - STATE.lastOnline) / 1000);
        const maxExp = CONFIG.REALM_EXP[STATE.player.realmIndex];
        const cycles = Math.floor(offlineSeconds / 300);
        let gain = cycles * maxExp;
        if (gain === 0 && offlineSeconds >= 30) gain = Math.floor(offlineSeconds * maxExp / 300);
        if (gain > 0) {
            const maxGain = maxExp * 10;
            const actualGain = Math.min(gain, maxGain);
            STATE.player.exp = Math.min(STATE.player.exp + actualGain, maxExp);
            STATE.player.totalExp += actualGain;
            document.getElementById('offline-gain').textContent = actualGain.toLocaleString();
            const minutes = Math.floor(offlineSeconds / 60);
            const hours = Math.floor(minutes / 60);
            const timeStr = hours > 0 ? hours + '小时' + (minutes % 60) + '分钟' : minutes + '分钟';
            UI.log('📴 离线收益: +' + actualGain.toLocaleString() + ' 原能（离线 ' + timeStr + '）');
        }
        STATE.lastOnline = now; Save.save(); UI.updateHeader();
    },
    tryBreakthrough() {
        const max = CONFIG.REALM_EXP[STATE.player.realmIndex];
        if (STATE.player.exp < max) { UI.log('原能未满！'); return; }
        let rate = STATE.player.realmIndex < 3 ? 1.0 : 0.3;
        if (STATE.player.realmIndex >= 3) {
            const potions = [
                { name:"完美基因药剂", rate:0.8 },
                { name:"高级基因药剂", rate:0.5 },
                { name:"基因药剂", rate:0.3 }
            ];
            for (let p of potions) {
                if (STATE.inventory[p.name] > 0) {
                    rate += p.rate;
                    Inventory.addItem(p.name, -1);
                    UI.log('使用' + p.name + '，成功率+' + Math.floor(p.rate * 100) + '%！');
                    break;
                }
            }
        }
        if (Math.random() < rate) {
            const oldSpeed = STATE.player.cultivationSpeed;
            STATE.player.realmIndex++;
            STATE.player.exp = 0;
            STATE.player.maxHp += 50; STATE.player.hp = STATE.player.maxHp;
            STATE.player.maxMp += 20; STATE.player.mp = STATE.player.maxMp;
            STATE.player.attack += 5; STATE.player.defense += 3;
            STATE.player.cultivationSpeed = Math.floor(200 * Math.pow(1.15, STATE.player.realmIndex));
            UI.log('🎉 突破成功！' + CONFIG.REALMS[STATE.player.realmIndex] + '！拳力' + CONFIG.REALM_POWER[STATE.player.realmIndex].toLocaleString() + 'kg', 'success');
            UI.log('⚡ 修炼速度: ' + oldSpeed + '/h → ' + STATE.player.cultivationSpeed + '/h', 'gold');
            Task.checkAchievement('realm');
        } else {
            STATE.player.exp = Math.floor(max * 0.5);
            UI.log('💔 突破失败，原能跌落一半！', 'danger');
        }
        UI.updateHeader(); Save.save();
    }
};
