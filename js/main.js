// ============================================================
//  Main / Startup
// ============================================================

document.addEventListener('visibilitychange', () => {
    if (document.hidden) { Cultivation.stopOnlineCultivation(); STATE.lastOnline = Date.now(); Save.save(); }
    else { Cultivation.calculateOfflineGain(); Cultivation.startOnlineCultivation(); }
});

window.addEventListener('DOMContentLoaded', Game.init);

function showPurchaseModal(itemName, itemIcon) {
    const modal = document.getElementById('purchase-modal');
    const iconDiv = document.getElementById('modal-icon');
    const textDiv = document.getElementById('modal-text');
    iconDiv.innerHTML = renderIcon(itemIcon, 120);
    textDiv.textContent = '恭喜购得 ' + itemName;
    modal.style.display = 'flex';
    requestAnimationFrame(() => {
        modal.classList.add('active');
    });
    // 2.5秒后自动关闭
    setTimeout(() => {
        closePurchaseModal();
    }, 2500);
}
function closePurchaseModal() {
    const modal = document.getElementById('purchase-modal');
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}
