// ============================================================
//  Task
// ============================================================

const Task = {
    initTask(taskId) { if (!STATE.tasks[taskId]) STATE.tasks[taskId] = { progress:0, completed:false, claimed:false }; },
    initDailyTasks() {
        const today = new Date().toISOString().split('T')[0];
        if (!STATE.dailyTasks || STATE.dailyTasks.date !== today) {
            STATE.dailyTasks = { date:today, tasks:{}, claimed:[] };
            CONFIG.DAILY_TASKS.forEach(task => {
                STATE.dailyTasks.tasks[task.id] = { progress:0, completed:false };
            });
        }
    },
    render() {
        const list = document.getElementById('task-list');
        list.innerHTML = '';

        // 主线任务
        const mainCard = document.createElement('div');
        mainCard.className = 'card';
        mainCard.innerHTML = '<div class="card-title">📜 主线任务</div><div id="main-task-list"></div>';
        list.appendChild(mainCard);
        const mainList = mainCard.querySelector('#main-task-list');
        CONFIG.TASKS.forEach(task => {
            Task.initTask(task.id);
            const status = STATE.tasks[task.id];
            const div = Task.createTaskDiv(task, status, false);
            mainList.appendChild(div);
        });

        // 每日任务
        Task.initDailyTasks();
        const dailyCard = document.createElement('div');
        dailyCard.className = 'card';
        dailyCard.style.marginTop = '14px';
        dailyCard.innerHTML = '<div class="card-title">🌅 每日任务 (' + STATE.dailyTasks.date + ')</div><div id="daily-task-list"></div>';
        list.appendChild(dailyCard);
        const dailyList = dailyCard.querySelector('#daily-task-list');
        CONFIG.DAILY_TASKS.forEach(task => {
            const status = STATE.dailyTasks.tasks[task.id];
            const div = Task.createTaskDiv(task, status, true);
            dailyList.appendChild(div);
        });

        // 成就
        const achCard = document.createElement('div');
        achCard.className = 'card';
        achCard.style.marginTop = '14px';
        achCard.innerHTML = '<div class="card-title">🏆 成就</div><div id="achievement-list"></div>';
        list.appendChild(achCard);
        const achList = achCard.querySelector('#achievement-list');
        CONFIG.ACHIEVEMENTS.forEach(ach => {
            if (!STATE.achievements[ach.id]) STATE.achievements[ach.id] = { completed:false, claimed:false };
            const status = STATE.achievements[ach.id];
            const div = Task.createAchievementDiv(ach, status);
            achList.appendChild(div);
        });
    },
    createTaskDiv(task, status, isDaily) {
        const div = document.createElement('div');
        div.className = 'task-item';
        let progressText = '';
        if (task.target.type === 'cult') progressText = '进度: ' + Math.min(status.progress, task.target.amount) + '/' + task.target.amount;
        else if (task.target.type === 'kill') progressText = '进度: ' + Math.min(status.progress, task.target.amount) + '/' + task.target.amount;
        else if (task.target.type === 'collect') progressText = '进度: ' + Math.min(STATE.inventory[task.target.item] || 0, task.target.amount) + '/' + task.target.amount;
        else if (task.target.type === 'sell') progressText = '进度: ' + Math.min(status.progress, task.target.amount) + '/' + task.target.amount;
        else if (task.target.type === 'craft') progressText = '进度: ' + Math.min(status.progress, task.target.amount) + '/' + task.target.amount;
        else if (task.target.type === 'enhance') progressText = '进度: ' + Math.min(status.progress, task.target.amount) + '/' + task.target.amount;
        let btnText = '进行中', btnClass = '', btnDisabled = true;
        if (status.claimed) { btnText = '✓ 已完成'; btnClass = 'btn-success'; }
        else if (status.completed) { btnText = '🎁 领取'; btnClass = 'btn-gold'; btnDisabled = false; }
        div.innerHTML = '<div class="task-info"><div class="task-name">' + task.name + '</div><div class="task-desc">' + task.desc + '</div><div class="task-reward">奖励: ' + task.reward.money.toLocaleString() + '💰 ' + task.reward.exp.toLocaleString() + '原能' + (task.reward.item ? ' +' + task.reward.item : '') + '</div><div class="task-progress">' + progressText + '</div></div><button class="btn btn-sm ' + btnClass + '" ' + (btnDisabled ? 'disabled' : '') + '>' + btnText + '</button>';
        if (!btnDisabled) {
            div.querySelector('button').addEventListener('click', () => isDaily ? Task.claimDaily(task.id) : Task.claim(task.id));
        }
        return div;
    },
    createAchievementDiv(ach, status) {
        const div = document.createElement('div');
        div.className = 'task-item';
        let btnText = '未达成', btnClass = '', btnDisabled = true;
        if (status.claimed) { btnText = '✓ 已领取'; btnClass = 'btn-success'; }
        else if (status.completed) { btnText = '🎁 领取'; btnClass = 'btn-gold'; btnDisabled = false; }
        div.innerHTML = '<div class="task-info"><div class="task-name">' + ach.name + '</div><div class="task-desc">' + ach.desc + '</div><div class="task-reward">奖励: ' + ach.reward.money.toLocaleString() + '💰 ' + ach.reward.exp.toLocaleString() + '原能' + (ach.reward.item ? ' +' + ach.reward.item : '') + '</div></div><button class="btn btn-sm ' + btnClass + '" ' + (btnDisabled ? 'disabled' : '') + '>' + btnText + '</button>';
        if (!btnDisabled) {
            div.querySelector('button').addEventListener('click', () => Task.claimAchievement(ach.id));
        }
        return div;
    },
    claim(taskId) {
        const task = CONFIG.TASKS.find(t => t.id === taskId);
        if (!task) return;
        const status = STATE.tasks[taskId];
        if (!status.completed || status.claimed) return;
        status.claimed = true;
        STATE.player.money += task.reward.money;
        STATE.player.totalMoney += task.reward.money;
        STATE.player.exp = Math.min(STATE.player.exp + task.reward.exp, CONFIG.REALM_EXP[STATE.player.realmIndex]);
        STATE.player.totalExp += task.reward.exp;
        if (task.reward.item) Inventory.addItem(task.reward.item, 1);
        UI.log('任务完成！获得 ' + task.reward.money.toLocaleString() + '💰 ' + task.reward.exp.toLocaleString() + '原能', 'success');
        UI.updateHeader(); Task.render(); Save.save();
    },
    claimDaily(taskId) {
        Task.initDailyTasks();
        const task = CONFIG.DAILY_TASKS.find(t => t.id === taskId);
        if (!task) return;
        const status = STATE.dailyTasks.tasks[taskId];
        if (!status.completed || STATE.dailyTasks.claimed.includes(taskId)) return;
        STATE.dailyTasks.claimed.push(taskId);
        STATE.player.money += task.reward.money;
        STATE.player.totalMoney += task.reward.money;
        STATE.player.exp = Math.min(STATE.player.exp + task.reward.exp, CONFIG.REALM_EXP[STATE.player.realmIndex]);
        STATE.player.totalExp += task.reward.exp;
        if (task.reward.item) Inventory.addItem(task.reward.item, 1);
        UI.log('每日任务完成！获得 ' + task.reward.money.toLocaleString() + '💰 ' + task.reward.exp.toLocaleString() + '原能', 'success');
        UI.updateHeader(); Task.render(); Save.save();
    },
    claimAchievement(achId) {
        const ach = CONFIG.ACHIEVEMENTS.find(a => a.id === achId);
        if (!ach) return;
        const status = STATE.achievements[achId];
        if (!status.completed || status.claimed) return;
        status.claimed = true;
        STATE.player.money += ach.reward.money;
        STATE.player.totalMoney += ach.reward.money;
        STATE.player.exp = Math.min(STATE.player.exp + ach.reward.exp, CONFIG.REALM_EXP[STATE.player.realmIndex]);
        STATE.player.totalExp += ach.reward.exp;
        if (ach.reward.item) Inventory.addItem(ach.reward.item, 1);
        UI.log('成就达成！获得 ' + ach.reward.money.toLocaleString() + '💰 ' + ach.reward.exp.toLocaleString() + '原能', 'gold');
        UI.updateHeader(); Task.render(); Save.save();
    },
    checkProgress(type, value, detail) {
        // 主线任务
        CONFIG.TASKS.forEach(task => {
            Task.initTask(task.id);
            const status = STATE.tasks[task.id];
            if (status.completed) return;
            let shouldProgress = false;
            if (task.target.type === type) {
                if (type === 'cult') shouldProgress = true;
                else if (type === 'kill' && (!task.target.level || detail === task.target.level)) shouldProgress = true;
                else if (type === 'kill' && task.target.monster && detail === task.target.monster) shouldProgress = true;
                else if (type === 'collect' && detail === task.target.item) shouldProgress = true;
            }
            if (shouldProgress) {
                status.progress += value;
                if (status.progress >= task.target.amount) status.completed = true;
            }
        });
        // 每日任务
        Task.initDailyTasks();
        CONFIG.DAILY_TASKS.forEach(task => {
            const status = STATE.dailyTasks.tasks[task.id];
            if (status.completed) return;
            let shouldProgress = false;
            if (task.target.type === type) {
                if (type === 'cult') shouldProgress = true;
                else if (type === 'kill') shouldProgress = true;
                else if (type === 'sell') shouldProgress = true;
                else if (type === 'craft') shouldProgress = true;
                else if (type === 'enhance') shouldProgress = true;
            }
            if (shouldProgress) {
                status.progress += value;
                if (status.progress >= task.target.amount) status.completed = true;
            }
        });
        Save.save();
    },
    checkAchievement(type, detail) {
        CONFIG.ACHIEVEMENTS.forEach(ach => {
            if (STATE.achievements[ach.id] && STATE.achievements[ach.id].completed) return;
            if (!STATE.achievements[ach.id]) STATE.achievements[ach.id] = { completed:false, claimed:false };
            let completed = false;
            if (ach.target.type === 'realm' && type === 'realm' && STATE.player.realmIndex >= ach.target.realmIndex) completed = true;
            if (ach.target.type === 'region' && type === 'region' && STATE.regionsCleared.includes(ach.target.regionId)) completed = true;
            if (ach.target.type === 'totalKill' && STATE.totalKills >= ach.target.amount) completed = true;
            if (ach.target.type === 'totalMoney' && STATE.player.totalMoney >= ach.target.amount) completed = true;
            if (ach.target.type === 'enhanceLevel' && type === 'enhanceLevel' && detail >= ach.target.level) completed = true;
            if (completed) {
                STATE.achievements[ach.id].completed = true;
                UI.log('🏆 达成成就：' + ach.name + '！', 'gold');
                Save.save();
            }
        });
    }
};
