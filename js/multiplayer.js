// ============================================================
//  Multiplayer — 联机核心（MQTT 房主权威模式）
// ============================================================

const Multiplayer = {
    client: null,
    currentRoomId: null,
    isHost: false,
    roomState: null,
    bossAttackTimer: null,
    onRoomUpdateCallback: null,
    connected: false,

    init() {
        if (!mqttAvailable()) {
            console.warn('[Multiplayer] MQTT 库未加载，联机功能不可用。');
            return;
        }
        this.connect();
    },

    connect() {
        if (this.client) return;
        const clientId = 'sc_' + Math.random().toString(36).substr(2, 8) + '_' + Date.now().toString(36);
        this.client = mqtt.connect(MQTT_CONFIG.brokerURL, {
            clientId: clientId,
            clean: true,
            connectTimeout: 5000,
            reconnectPeriod: 3000,
            rejectUnauthorized: false
        });

        this.client.on('connect', () => {
            console.log('[Multiplayer] MQTT 已连接');
            this.connected = true;
        });

        this.client.on('disconnect', () => {
            console.log('[Multiplayer] MQTT 断开');
            this.connected = false;
        });

        this.client.on('error', (err) => {
            console.error('[Multiplayer] MQTT 错误:', err);
            UI.log('联机连接失败，请检查网络或更换 MQTT 代理', 'danger');
        });

        this.client.on('message', (topic, payload) => {
            this.handleMessage(topic, payload);
        });
    },

    // ---------- 工具 ----------
    generateRoomId() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let id = '';
        for (let i = 0; i < 6; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    },

    playerKey(name) {
        return name.replace(/[\s.#$\[\]]/g, '_');
    },

    topic(roomId) {
        return MQTT_CONFIG.topicPrefix + '/' + roomId;
    },

    getPlayerSnapshot() {
        const p = STATE.player;
        const equipBonus = Equipment.getBonus ? Equipment.getBonus() : { attack: 0, defense: 0 };
        return {
            name: p.name,
            class: p.class,
            realmIndex: p.realmIndex,
            realmName: CONFIG.REALMS[p.realmIndex],
            hp: p.hp,
            maxHp: p.maxHp,
            mp: p.mp,
            maxMp: p.maxMp,
            attack: p.attack + equipBonus.attack + Math.floor(CONFIG.REALM_POWER[p.realmIndex] / 1000),
            defense: p.defense + equipBonus.defense,
            ready: false,
            status: 'online',
            defending: false,
            lastAction: null
        };
    },

    // ---------- 房间操作 ----------
    async createRoom(bossId) {
        if (!mqttAvailable()) { UI.log('MQTT 未加载，无法创建房间', 'danger'); return null; }
        if (this.currentRoomId) { UI.log('你已在房间中', 'danger'); return null; }

        const roomId = this.generateRoomId();
        const monster = CONFIG.MONSTERS.find(m => m.id === bossId);
        if (!monster) { UI.log('BOSS 不存在', 'danger'); return null; }

        const player = this.getPlayerSnapshot();
        player.ready = true;
        const hostKey = this.playerKey(player.name);

        this.roomState = {
            name: player.name + ' 的房间',
            host: player.name,
            status: 'waiting',
            selectedBossId: bossId,
            createdAt: Date.now(),
            members: { [hostKey]: player },
            boss: {
                id: monster.id,
                name: monster.name,
                icon: monster.icon,
                region: monster.region,
                level: monster.level,
                hp: monster.hp,
                maxHp: monster.hp,
                atk: monster.atk,
                def: monster.def
            },
            battleLog: [],
            chat: []
        };

        this.currentRoomId = roomId;
        this.isHost = true;
        this.client.subscribe(this.topic(roomId), { qos: 1 }, (err) => {
            if (err) { UI.log('订阅房间失败', 'danger'); return; }
            this.publishState();
            if (this.onRoomUpdateCallback) this.onRoomUpdateCallback(this.roomState);
            UI.log('房间创建成功：' + roomId, 'success');
        });
        return roomId;
    },

    async joinRoom(roomId) {
        if (!mqttAvailable()) { UI.log('MQTT 未加载，无法加入房间', 'danger'); return false; }
        if (this.currentRoomId) { UI.log('你已在房间中', 'danger'); return false; }
        roomId = roomId.trim().toUpperCase();
        if (!roomId) { UI.log('请输入房间号', 'danger'); return false; }

        this.currentRoomId = roomId;
        this.isHost = false;
        this.client.subscribe(this.topic(roomId), { qos: 1 }, (err) => {
            if (err) {
                this.currentRoomId = null;
                UI.log('加入房间失败', 'danger');
                return;
            }
            // 发送加入请求（由房主处理并更新状态）
            const player = this.getPlayerSnapshot();
            this.publish({ type: 'join', player: player });
            UI.log('正在加入房间：' + roomId + '...', 'success');
        });
        return true;
    },

    async leaveRoom() {
        if (!this.currentRoomId) return;
        const roomId = this.currentRoomId;

        if (this.isHost) {
            // 房主离开：清空保留状态
            this.stopBossAttackTimer();
            this.client.publish(this.topic(roomId), '', { qos: 1, retain: true });
        } else {
            this.publish({ type: 'leave', playerName: STATE.player.name });
        }

        this.client.unsubscribe(this.topic(roomId));
        this.currentRoomId = null;
        this.isHost = false;
        this.roomState = null;
        this.stopBossAttackTimer();
        UI.log('已离开房间', 'success');
    },

    async setReady(ready) {
        if (!this.currentRoomId || this.isHost) return;
        this.publish({ type: 'ready', playerName: STATE.player.name, ready: !!ready });
    },

    async startBattle() {
        if (!this.currentRoomId || !this.isHost) return;
        if (!this.roomState) return;

        const members = Object.values(this.roomState.members || {});
        const alive = members.filter(m => m.hp > 0);
        if (alive.length === 0) { UI.log('没有可战斗的玩家', 'danger'); return; }
        if (members.some(m => !m.ready)) { UI.log('还有玩家未准备', 'danger'); return; }

        const hpMultiplier = members.length * 3;
        const atkMultiplier = 1 + (members.length - 1) * 0.3;
        const newMaxHp = Math.floor(this.roomState.boss.maxHp * hpMultiplier);
        const newAtk = Math.floor(this.roomState.boss.atk * atkMultiplier);

        this.roomState.status = 'fighting';
        this.roomState.boss.hp = newMaxHp;
        this.roomState.boss.maxHp = newMaxHp;
        this.roomState.boss.atk = newAtk;
        this.pushBattleLog('system', '战斗开始！' + this.roomState.boss.name + ' 出现了！');
        this.publishState();
        this.startBossAttackLoop();
    },

    // ---------- 消息处理 ----------
    publish(msg) {
        if (!this.client || !this.currentRoomId) return;
        this.client.publish(this.topic(this.currentRoomId), JSON.stringify(msg), { qos: 1, retain: false });
    },

    publishState() {
        if (!this.client || !this.currentRoomId || !this.isHost || !this.roomState) return;
        this.client.publish(this.topic(this.currentRoomId), JSON.stringify({ type: 'state', state: this.roomState }), { qos: 1, retain: true });
    },

    handleMessage(topic, payload) {
        if (!payload || payload.length === 0) {
            // 清空保留消息，表示房间关闭
            this.currentRoomId = null;
            this.isHost = false;
            this.roomState = null;
            this.stopBossAttackTimer();
            if (this.onRoomUpdateCallback) this.onRoomUpdateCallback(null);
            return;
        }
        let msg;
        try {
            msg = JSON.parse(payload.toString());
        } catch (e) { return; }

        if (!msg || !msg.type) return;

        if (msg.type === 'state') {
            this.roomState = msg.state;
            if (this.onRoomUpdateCallback) this.onRoomUpdateCallback(msg.state);
            return;
        }

        // 只有房主处理以下消息
        if (!this.isHost) return;

        switch (msg.type) {
            case 'join':
                this.handleJoin(msg.player);
                break;
            case 'leave':
                this.handleLeave(msg.playerName);
                break;
            case 'ready':
                this.handleReady(msg.playerName, msg.ready);
                break;
            case 'action':
                this.handleAction(msg);
                break;
            case 'chat':
                this.handleChatMessage(msg);
                break;
        }
    },

    handleJoin(player) {
        if (!this.roomState || this.roomState.status !== 'waiting') return;
        const members = this.roomState.members || {};
        if (Object.keys(members).length >= 4) return;
        const key = this.playerKey(player.name);
        members[key] = player;
        this.roomState.members = members;
        this.pushBattleLog('system', player.name + ' 加入了房间');
        this.publishState();
    },

    handleLeave(playerName) {
        if (!this.roomState) return;
        const key = this.playerKey(playerName);
        if (this.roomState.members[key]) {
            delete this.roomState.members[key];
            this.pushBattleLog('system', playerName + ' 离开了房间');
            if (Object.keys(this.roomState.members).length === 0) {
                // 没人了，清空保留状态
                this.client.publish(this.topic(this.currentRoomId), '', { qos: 1, retain: true });
                this.currentRoomId = null;
                this.isHost = false;
                this.roomState = null;
                this.stopBossAttackTimer();
            } else {
                this.publishState();
            }
        }
    },

    handleReady(playerName, ready) {
        if (!this.roomState || this.roomState.status !== 'waiting') return;
        const key = this.playerKey(playerName);
        if (this.roomState.members[key]) {
            this.roomState.members[key].ready = !!ready;
            this.publishState();
        }
    },

    handleChatMessage(msg) {
        if (!this.roomState) return;
        this.roomState.chat.push({ player: msg.player, message: msg.message, time: Date.now() });
        this.publishState();
    },

    // ---------- 战斗动作 ----------
    async submitAction(action, data) {
        if (!this.currentRoomId) return;
        if (this.isHost) {
            this.handleAction({ playerName: STATE.player.name, action: action, data: data });
        } else {
            this.publish({ type: 'action', playerName: STATE.player.name, action: action, data: data });
        }
    },

    handleAction(msg) {
        if (!this.roomState || this.roomState.status !== 'fighting') return;
        const key = this.playerKey(msg.playerName);
        const me = this.roomState.members[key];
        if (!me || me.hp <= 0) return;

        const cls = CONFIG.CLASSES[me.class];
        const baseAtk = me.attack;
        let damage = 0, mpCost = 0, logMsg = '';

        switch (msg.action) {
            case 'attack':
                damage = Math.max(1, Math.floor(baseAtk * cls.atkBonus) - this.roomState.boss.def + Math.floor(Math.random() * 5));
                logMsg = me.name + ' 发动攻击，造成 ' + damage + ' 点伤害！';
                break;
            case 'skill':
                mpCost = 20;
                if (me.mp < mpCost) return;
                const skillMultiplier = me.class === 'psychic' ? 1.8 : 1.5;
                damage = Math.max(1, Math.floor(baseAtk * skillMultiplier) - this.roomState.boss.def + Math.floor(Math.random() * 10));
                logMsg = me.name + ' 使用 ' + cls.skill + '，造成 ' + damage + ' 点伤害！';
                break;
            case 'defend':
                logMsg = me.name + ' 进入防御姿态！';
                break;
            case 'item':
                const itemName = msg.data;
                const item = CONFIG.ITEMS[itemName];
                if (!item || !STATE.inventory[itemName]) return;
                if (item.effect && item.effect.exp) return;
                if (item.effect && item.effect.heal) {
                    const heal = Math.floor(me.maxHp * item.effect.heal);
                    me.hp = Math.min(me.hp + heal, me.maxHp);
                    logMsg = me.name + ' 使用 ' + itemName + '，恢复生命！';
                }
                if (item.effect && item.effect.mp) {
                    me.mp = Math.min(me.mp + item.effect.mp, me.maxMp);
                    logMsg = me.name + ' 使用 ' + itemName + '，恢复念力！';
                }
                Inventory.addItem(itemName, -1);
                Inventory.render();
                break;
        }

        if (mpCost > 0) me.mp = Math.max(0, me.mp - mpCost);
        me.defending = (msg.action === 'defend');
        me.lastAction = { action: msg.action, time: Date.now() };

        if (damage > 0) {
            this.roomState.boss.hp = Math.max(0, this.roomState.boss.hp - damage);
        }

        if (logMsg) this.pushBattleLog('damage', logMsg);

        if (this.roomState.boss.hp <= 0) {
            this.handleVictory();
        } else {
            this.publishState();
        }
    },

    // ---------- BOSS 攻击（仅房主） ----------
    startBossAttackLoop() {
        if (!this.isHost || this.bossAttackTimer) return;
        this.bossAttackTimer = setInterval(() => this.bossAttack(), 3000);
    },

    stopBossAttackTimer() {
        if (this.bossAttackTimer) { clearInterval(this.bossAttackTimer); this.bossAttackTimer = null; }
    },

    bossAttack() {
        if (!this.isHost || !this.roomState || this.roomState.status !== 'fighting') return;
        const members = this.roomState.members || {};
        const entries = Object.entries(members);
        const living = entries.filter(([k, m]) => m.hp > 0);
        if (living.length === 0) {
            this.handleDefeat();
            return;
        }
        const [targetKey, target] = living[Math.floor(Math.random() * living.length)];

        let damage = Math.max(1, this.roomState.boss.atk - target.defense + Math.floor(Math.random() * 5));
        if (target.defending) damage = Math.floor(damage / 2);

        target.hp = Math.max(0, target.hp - damage);
        target.defending = false;

        entries.forEach(([k, m]) => {
            if (m.hp > 0) {
                m.mp = Math.min(m.mp + 5, m.maxMp);
                members[k] = m;
            }
        });

        const msg = this.roomState.boss.name + ' 攻击 ' + target.name + '，造成 ' + damage + ' 点伤害！';
        this.pushBattleLog(this.roomState.boss.id === 1 ? 'wolf' : 'damage', msg);

        if (living.length === 1 && target.hp <= 0) {
            this.handleDefeat();
        } else {
            this.publishState();
        }
    },

    // ---------- 胜负结算 ----------
    handleVictory() {
        if (!this.isHost || !this.roomState) return;
        this.stopBossAttackTimer();
        this.roomState.status = 'finished';
        this.pushBattleLog('system', '🎉 战斗胜利！全员获得奖励！');
        this.publishState();
    },

    handleDefeat() {
        if (!this.isHost || !this.roomState) return;
        this.stopBossAttackTimer();
        this.roomState.status = 'finished';
        this.pushBattleLog('system', '💔 战斗失败，全员撤退...');
        this.publishState();
    },

    pushBattleLog(type, message) {
        if (!this.roomState) return;
        this.roomState.battleLog.push({ type: type, message: message, time: Date.now() });
    },

    // ---------- 聊天 ----------
    async sendChat(message) {
        if (!this.currentRoomId || !message.trim()) return;
        if (this.isHost) {
            this.handleChatMessage({ player: STATE.player.name, message: message.trim() });
        } else {
            this.publish({ type: 'chat', player: STATE.player.name, message: message.trim() });
        }
    },

    onRoomUpdate(callback) {
        this.onRoomUpdateCallback = callback;
    }
};
