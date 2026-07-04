// ============================================================
//  Game
// ============================================================

const Game = {
    init() {
        if (Save.load()) {
            Game.showMainGame();
            Cultivation.calculateOfflineGain();
        } else {
            document.getElementById('create-char').classList.add('active');
        }
        Cultivation.startOnlineCultivation();
        Multiplayer.init();
        MultiplayerUI.init();
        Game.showMqttTip();
        Game.bindEvents();
    },
    showMqttTip() {
        const tip = document.getElementById('mp-mqtt-tip');
        if (tip) tip.style.display = mqttAvailable() ? 'none' : 'block';
    },
    bindEvents() {
        // 导航按钮
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => UI.switchPanel(btn.dataset.panel));
        });
        // 创建角色界面
        document.getElementById('class-warrior').addEventListener('click', () => Game.selectClass('warrior'));
        document.getElementById('class-psychic').addEventListener('click', () => Game.selectClass('psychic'));
        document.getElementById('btn-create-char').addEventListener('click', () => Game.createCharacter());
        // 突破按钮
        document.getElementById('btn-breakthrough').addEventListener('click', () => Cultivation.tryBreakthrough());
        // 设置按钮
        document.getElementById('btn-export').addEventListener('click', () => Save.exportSave());
        document.getElementById('btn-import').addEventListener('click', () => UI.showModal('import-modal'));
        document.getElementById('btn-reset').addEventListener('click', () => Save.resetGame());
        document.getElementById('btn-close-import').addEventListener('click', () => UI.closeModal('import-modal'));
        document.getElementById('btn-confirm-import').addEventListener('click', () => Save.importSave());
        document.getElementById('btn-close-item').addEventListener('click', () => UI.closeModal('item-modal'));
        // 战斗按钮
        document.getElementById('btn-attack').addEventListener('click', () => Battle.playerAction('attack'));
        document.getElementById('btn-skill').addEventListener('click', () => Battle.playerAction('skill'));
        document.getElementById('btn-defend').addEventListener('click', () => Battle.playerAction('defend'));
        document.getElementById('btn-item').addEventListener('click', () => Battle.playerAction('item'));
        // 工坊按钮
        document.getElementById('btn-sell-all-materials').addEventListener('click', () => Workshop.sellAllMaterials());
    },
    selectClass(cls) {
        selectedClass = cls;
        document.querySelectorAll('.class-option').forEach(el => el.classList.remove('selected'));
        document.getElementById('class-' + cls).classList.add('selected');
    },
    createCharacter() {
        const name = document.getElementById('char-name-input').value.trim();
        if (!name) { UI.log('请输入姓名！'); return; }
        if (!selectedClass) { UI.log('请选择流派！'); return; }
        STATE.player.name = name;
        STATE.player.class = selectedClass;
        STATE.lastOnline = Date.now();
        Save.save();
        Game.showMainGame();
        UI.log('欢迎' + name + '加入极限武馆！流派：' + CONFIG.CLASSES[selectedClass].name);
    },
    showMainGame() {
        document.getElementById('create-char').classList.remove('active');
        document.getElementById('main-game').style.display = 'block';
        Task.initDailyTasks();
        UI.updateHeader();
        Task.render(); Hunt.render(); Inventory.render(); Equipment.render(); Shop.render();
        Cultivation.startOnlineCultivation();
    }
};
