// ============================================================
//  Multiplayer UI — 联机界面
// ============================================================

const MultiplayerUI = {
    currentRoom: null,
    rewardClaimed: false,

    init() {
        this.bindEvents();
        Multiplayer.onRoomUpdate((room) => this.onRoomUpdate(room));
    },

    bindEvents() {
        // 创建房间
        document.getElementById('btn-create-room')?.addEventListener('click', () => {
            const select = document.getElementById('mp-boss-select');
            const bossId = parseInt(select ? select.value : '1', 10);
            Multiplayer.createRoom(bossId);
        });

        // 加入房间
        document.getElementById('btn-join-room')?.addEventListener('click', () => {
            const input = document.getElementById('mp-room-code');
            Multiplayer.joinRoom(input ? input.value : '');
        });

        // 离开房间
        document.getElementById('btn-leave-room')?.addEventListener('click', () => {
            Multiplayer.leaveRoom();
            this.showLobby();
        });

        // 准备
        document.getElementById('btn-ready')?.addEventListener('click', () => {
            const me = this.getMe();
            if (me) Multiplayer.setReady(!me.ready);
        });

        // 开始战斗
        document.getElementById('btn-start-battle')?.addEventListener('click', () => {
            Multiplayer.startBattle();
        });

        // 发送聊天
        document.getElementById('btn-send-chat')?.addEventListener('click', () => this.sendChat());
        document.getElementById('mp-chat-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendChat();
        });

        // 战斗动作
        document.getElementById('btn-mp-attack')?.addEventListener('click', () => this.mpAction('attack'));
        document.getElementById('btn-mp-skill')?.addEventListener('click', () => this.mpAction('skill'));
        document.getElementById('btn-mp-defend')?.addEventListener('click', () => this.mpAction('defend'));
        document.getElementById('btn-mp-item')?.addEventListener('click', () => this.openMpItemModal());
        document.getElementById('btn-close-mp-item')?.addEventListener('click', () => UI.closeModal('mp-item-modal'));

        // 关闭多人战斗
        document.getElementById('btn-mp-close')?.addEventListener('click', () => {
            Multiplayer.leaveRoom();
            Battle.closeMultiplayer();
            this.showLobby();
        });
    },

    sendChat() {
        const input = document.getElementById('mp-chat-input');
        if (!input) return;
        const msg = input.value.trim();
        if (!msg) return;
        Multiplayer.sendChat(msg);
        input.value = '';
    },

    mpAction(action, data) {
        Multiplayer.submitAction(action, data);
    },

    openMpItemModal() {
        const list = document.getElementById('mp-usable-items-list');
        if (!list) return;
        list.innerHTML = '';
        const usable = Object.entries(STATE.inventory).filter(([name]) => CONFIG.ITEMS[name] && CONFIG.ITEMS[name].type === 'consumable');
        if (usable.length === 0) {
            list.innerHTML = '<div style="color:var(--text-dim); padding:12px;">没有可用药剂</div>';
        } else {
            usable.forEach(([name, count]) => {
                const item = CONFIG.ITEMS[name];
                const div = document.createElement('div');
                div.style.cssText = 'background:var(--bg-light); border:1px solid var(--border); border-radius:6px; padding:10px; margin-bottom:8px; cursor:pointer; text-align:center;';
                div.innerHTML = '<div style="font-size:24px; margin-bottom:4px;">' + renderIcon(item.icon, 24) + '</div><div style="font-size:13px;">' + name + ' x' + count + '</div><div style="font-size:11px; color:var(--text-dim);">' + item.desc + '</div>';
                div.addEventListener('click', () => { this.mpAction('item', name); UI.closeModal('mp-item-modal'); });
                list.appendChild(div);
            });
        }
        UI.showModal('mp-item-modal');
    },

    onRoomUpdate(room) {
        this.currentRoom = room;
        if (!room) {
            this.showLobby();
            return;
        }
        if (room.status === 'waiting') {
            this.renderRoom(room);
        } else if (room.status === 'fighting') {
            this.renderBattle(room);
            this.appendNewLogs(room.battleLog);
        } else if (room.status === 'finished') {
            this.renderFinished(room);
            this.appendNewLogs(room.battleLog);
        }
    },

    appendNewLogs(logs) {
        if (!logs) return;
        if (!this.lastLogKeys) {
            this.lastLogKeys = new Set(Object.keys(logs));
            return;
        }
        Object.entries(logs)
            .sort((a, b) => (a[1].time || 0) - (b[1].time || 0))
            .forEach(([key, entry]) => {
                if (!this.lastLogKeys.has(key)) {
                    this.lastLogKeys.add(key);
                    Battle.appendMultiplayerLog(entry);
                }
            });
    },

    getMe() {
        if (!this.currentRoom || !this.currentRoom.members) return null;
        return this.currentRoom.members[Multiplayer.playerKey(STATE.player.name)];
    },

    // ---------- 大厅 ----------
    showLobby() {
        // 如果已经在房间里，继续显示房间界面
        if (Multiplayer.currentRoomId && this.currentRoom) {
            this.renderRoom(this.currentRoom);
            return;
        }
        document.getElementById('mp-lobby') && (document.getElementById('mp-lobby').style.display = 'block');
        document.getElementById('mp-room') && (document.getElementById('mp-room').style.display = 'none');
        document.getElementById('mp-boss-select').innerHTML = this.buildBossOptions();
        this.currentRoom = null;
        this.rewardClaimed = false;
        this.lastLogKeys = null;
    },

    buildBossOptions() {
        let html = '';
        CONFIG.MONSTERS.forEach(m => {
            html += '<option value="' + m.id + '">' + m.region + ' - ' + m.level + ' ' + m.name + '</option>';
        });
        return html;
    },

    // ---------- 房间内 ----------
    renderRoom(room) {
        document.getElementById('mp-lobby') && (document.getElementById('mp-lobby').style.display = 'none');
        document.getElementById('mp-room') && (document.getElementById('mp-room').style.display = 'block');

        const roomCodeEl = document.getElementById('mp-room-code-display');
        if (roomCodeEl) roomCodeEl.textContent = Multiplayer.currentRoomId;

        const bossNameEl = document.getElementById('mp-room-boss');
        if (bossNameEl) bossNameEl.textContent = room.boss.region + ' · ' + room.boss.name;

        const members = Object.values(room.members || {});
        const list = document.getElementById('mp-member-list');
        if (list) {
            list.innerHTML = '';
            members.forEach(m => {
                const div = document.createElement('div');
                div.className = 'mp-member-item';
                const isMe = m.name === STATE.player.name;
                const readyText = m.ready ? '✅ 已准备' : '⏳ 未准备';
                div.innerHTML = '<div><div class="mp-member-name">' + (isMe ? '<span style="color:var(--neon-cyan)">[我]</span> ' : '') + m.name + '</div><div class="mp-member-info">' + CONFIG.CLASSES[m.class].name + ' · ' + m.realmName + '</div></div><div class="mp-member-status ' + (m.ready ? 'ready' : '') + '">' + readyText + '</div>';
                list.appendChild(div);
            });
        }

        const me = this.getMe();
        const isHost = Multiplayer.isHost;
        const allReady = members.length > 0 && members.every(m => m.ready);

        const readyBtn = document.getElementById('btn-ready');
        if (readyBtn) {
            readyBtn.textContent = me && me.ready ? '取消准备' : '准备';
            readyBtn.className = 'btn ' + (me && me.ready ? 'btn-danger' : 'btn-success');
            readyBtn.style.display = isHost ? 'none' : 'inline-block';
        }

        const startBtn = document.getElementById('btn-start-battle');
        if (startBtn) {
            startBtn.style.display = isHost ? 'inline-block' : 'none';
            startBtn.disabled = !(allReady && members.length >= 1);
        }

        this.renderChat(room.chat);
    },

    renderChat(chat) {
        const box = document.getElementById('mp-chat-box');
        if (!box) return;
        box.innerHTML = '';
        if (!chat) return;
        Object.values(chat).sort((a, b) => (a.time || 0) - (b.time || 0)).forEach(c => {
            const div = document.createElement('div');
            div.className = 'mp-chat-item';
            div.innerHTML = '<span class="mp-chat-player">' + c.player + ':</span> <span class="mp-chat-msg">' + this.escapeHtml(c.message) + '</span>';
            box.appendChild(div);
        });
        box.scrollTop = box.scrollHeight;
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // ---------- 战斗中 ----------
    renderBattle(room) {
        if (!Battle.isMultiplayer) {
            Battle.startMultiplayer(room);
        } else {
            Battle.updateMultiplayerUI(room);
        }
    },

    // ---------- 战斗结束 ----------
    renderFinished(room) {
        if (Battle.isMultiplayer) {
            Battle.updateMultiplayerUI(room);
            Battle.handleMultiplayerEnd(room);
        }
    }
};
