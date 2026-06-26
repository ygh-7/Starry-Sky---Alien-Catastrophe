// ============================================================
//  Shop
// ============================================================

const Shop = {
    render() {
        const list = document.getElementById('shop-list');
        list.innerHTML = '';
        CONFIG.SHOP_ITEMS.forEach(item => {
            const div = document.createElement('div');
            div.className = 'shop-item';
            const itemIcon = CONFIG.ITEMS[item.name] ? CONFIG.ITEMS[item.name].icon : item.name;
            div.innerHTML = '<div class="shop-item-info"><div class="shop-item-name">' + renderIcon(itemIcon) + ' ' + item.name + '</div><div class="shop-item-desc">' + item.desc + '</div></div><div style="display:flex; align-items:center; gap:8px;"><span style="color:var(--neon-gold); font-weight:bold;">' + item.price.toLocaleString() + '💰</span><button class="btn btn-sm" data-shop="' + item.name + '">购买</button></div>';
            div.querySelector('button').addEventListener('click', () => Shop.buy(item.name));
            list.appendChild(div);
        });
    },
    buy(itemName) {
        const item = CONFIG.SHOP_ITEMS.find(i => i.name === itemName);
        if (!item) return;
        if (STATE.player.money < item.price) { UI.log('华夏币不足！'); return; }
        STATE.player.money -= item.price;
        Inventory.addItem(item.name, 1);
        UI.log('购买了 ' + item.name);
        const purchaseIcon = CONFIG.ITEMS[item.name] ? CONFIG.ITEMS[item.name].icon : item.name;
        showPurchaseModal(item.name, purchaseIcon);
        UI.updateHeader(); Shop.render(); Save.save();
    }
};
