// ============================================================
//  Save
// ============================================================

const Save = {
    save() { STATE.lastOnline = Date.now(); localStorage.setItem('tunshi_v2_save', JSON.stringify(STATE)); },
    load() {
        const saved = localStorage.getItem('tunshi_v2_save');
        if (saved) { try { const data = JSON.parse(saved); if (data.player && data.player.name) { STATE = data; Save.migrate(); return true; } } catch(e) {} }
        return false;
    },
    migrate() {
        const nameMap = { "血影战刀": "猩红战刃", "黑神套装": "黑曜战甲", "遁天梭": "裂空梭" };
        // 迁移背包物品
        Object.keys(STATE.inventory || {}).forEach(oldName => {
            if (nameMap[oldName]) {
                const count = STATE.inventory[oldName];
                delete STATE.inventory[oldName];
                STATE.inventory[nameMap[oldName]] = (STATE.inventory[nameMap[oldName]] || 0) + count;
            }
        });
        // 迁移已装备物品
        if (STATE.equipment) {
            if (nameMap[STATE.equipment.weapon]) STATE.equipment.weapon = nameMap[STATE.equipment.weapon];
            if (nameMap[STATE.equipment.armor]) STATE.equipment.armor = nameMap[STATE.equipment.armor];
            if (STATE.equipment.weaponLevel === undefined) STATE.equipment.weaponLevel = 0;
            if (STATE.equipment.armorLevel === undefined) STATE.equipment.armorLevel = 0;
        }
        // 补全新系统字段
        if (!STATE.dailyTasks) STATE.dailyTasks = { date:"", tasks:{}, claimed:[] };
        if (!STATE.achievements) STATE.achievements = {};
        if (!STATE.regionsCleared) STATE.regionsCleared = [];
        if (!STATE.totalKills) STATE.totalKills = 0;
    },
    exportSave() {
        const encoded = btoa(encodeURIComponent(JSON.stringify(STATE)));
        const textarea = document.createElement('textarea'); textarea.value = encoded;
        document.body.appendChild(textarea); textarea.select(); document.execCommand('copy'); document.body.removeChild(textarea);
        UI.log('存档已导出并复制到剪贴板！');
    },
    importSave() {
        const input = document.getElementById('import-data').value.trim();
        if (!input) return;
        try {
            const data = JSON.parse(decodeURIComponent(atob(input)));
            if (data.player && data.player.name) { STATE = data; Save.migrate(); Save.save(); UI.closeModal('import-modal'); Game.showMainGame(); UI.log('存档导入成功！'); }
            else throw new Error('Invalid');
        } catch(e) { UI.log('存档数据无效！'); }
    },
    resetGame() { if (!confirm('确定重置？')) return; localStorage.removeItem('tunshi_v2_save'); location.reload(); }
};
