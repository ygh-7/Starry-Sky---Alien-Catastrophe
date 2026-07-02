// ============================================================
//  Workshop
// ============================================================

const Workshop = {
    render() {
        Workshop.renderRecipes();
        Workshop.renderMaterials();
    },
    renderRecipes() {
        const list = document.getElementById('recipe-list');
        list.innerHTML = '';
        CONFIG.RECIPES.forEach(recipe => {
            const div = document.createElement('div');
            div.className = 'task-item';
            const reqText = Object.entries(recipe.materials).map(([name, count]) => {
                const have = STATE.inventory[name] || 0;
                const color = have >= count ? 'color:var(--neon-green);' : 'color:var(--neon-pink);';
                return name + '×' + count + ' <span style="font-size:11px; ' + color + '">(拥有:' + have + ')</span>';
            }).join(' + ');
            const item = CONFIG.ITEMS[recipe.name];
            div.innerHTML = '<div class="task-info"><div class="task-name">' + renderIcon(item.icon) + ' ' + recipe.name + '</div><div class="task-desc">需求: ' + reqText + '</div><div class="task-reward">成功率: ' + Math.floor(recipe.rate * 100) + '%</div></div><button class="btn btn-sm btn-primary" data-recipe="' + recipe.name + '">炼制</button>';
            const btn = div.querySelector('button');
            const canCraft = Workshop.canCraft(recipe);
            if (!canCraft) btn.disabled = true;
            btn.addEventListener('click', () => Workshop.craft(recipe.name));
            list.appendChild(div);
        });
    },
    renderMaterials() {
        const list = document.getElementById('material-sell-list');
        list.innerHTML = '';
        const materials = Object.entries(STATE.inventory).filter(([name]) => {
            const item = CONFIG.ITEMS[name];
            return item && item.type === 'material';
        });
        if (materials.length === 0) {
            list.innerHTML = '<div style="color:var(--text-dim); text-align:center; padding:20px;">当前没有可出售的材料</div>';
            return;
        }
        materials.forEach(([name, count]) => {
            const item = CONFIG.ITEMS[name];
            const total = item.price * count;
            const div = document.createElement('div');
            div.className = 'task-item';
            div.innerHTML = '<div class="task-info"><div class="task-name">' + renderIcon(item.icon) + ' ' + name + '</div><div class="task-desc">单价: ' + item.price.toLocaleString() + '💰</div><div class="task-reward">持有: ' + count + ' | 总价: ' + total.toLocaleString() + '💰</div></div><button class="btn btn-sm btn-gold" data-sell-material="' + name + '">出售</button>';
            div.querySelector('button').addEventListener('click', () => Workshop.sellMaterial(name));
            list.appendChild(div);
        });
    },
    canCraft(recipe) {
        return Object.entries(recipe.materials).every(([name, count]) => (STATE.inventory[name] || 0) >= count);
    },
    craft(recipeName) {
        const recipe = CONFIG.RECIPES.find(r => r.name === recipeName);
        if (!recipe) return;
        if (!Workshop.canCraft(recipe)) { UI.log('材料不足，无法炼制 ' + recipeName); return; }
        Object.entries(recipe.materials).forEach(([name, count]) => Inventory.addItem(name, -count));
        if (Math.random() < recipe.rate) {
            Inventory.addItem(recipe.name, 1);
            UI.log('炼制成功！获得 ' + recipe.name, 'success');
            Task.checkProgress('craft', 1);
        } else {
            UI.log('炼制失败，材料已消耗...', 'danger');
        }
        Workshop.render(); UI.updateHeader(); Save.save();
    },
    sellMaterial(name) {
        const count = STATE.inventory[name] || 0;
        if (count <= 0) return;
        const item = CONFIG.ITEMS[name];
        if (!item || item.type !== 'material' || !item.price) { UI.log(name + ' 无法出售'); return; }
        const total = item.price * count;
        Inventory.addItem(name, -count);
        STATE.player.money += total;
        STATE.player.totalMoney += total;
        UI.log('出售 ' + count + ' 个 ' + name + '，获得 ' + total.toLocaleString() + '💰', 'gold');
        Task.checkProgress('sell', total);
        Workshop.render(); UI.updateHeader(); Save.save();
    },
    sellAllMaterials() {
        const materials = Object.entries(STATE.inventory).filter(([name]) => {
            const item = CONFIG.ITEMS[name];
            return item && item.type === 'material';
        });
        if (materials.length === 0) { UI.log('没有可出售的材料'); return; }
        let total = 0;
        materials.forEach(([name, count]) => {
            const item = CONFIG.ITEMS[name];
            total += item.price * count;
            Inventory.addItem(name, -count);
        });
        STATE.player.money += total;
        STATE.player.totalMoney += total;
        UI.log('一键出售所有材料，获得 ' + total.toLocaleString() + '💰', 'gold');
        Task.checkProgress('sell', total);
        Workshop.render(); UI.updateHeader(); Save.save();
    }
};
