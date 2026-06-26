// ============================================================
//  Task
// ============================================================

const Task = {
    initTask(taskId) { if (!STATE.tasks[taskId]) STATE.tasks[taskId] = { progress:0, completed:false, claimed:false }; },
    render() {
        const list = document.getElementById('task-list');
        list.innerHTML = '';
        CONFIG.TASKS.forEach(task => {
            Task.initTask(task.id);
            const status = STATE.tasks[task.id];
            const div = document.createElement('div');
            div.className = 'task-item';
            let progressText = '';
            if (task.target.type === 'cult') progressText = '进度: ' + Math.min(status.progress, task.target.amount) + '/' + task.target.amount;
            else if (task.target.type === 'kill') progressText = '进度: ' + Math.min(status.progress, task.target.amount) + '/' + task.target.amount;
            else if (task.target.type === 'collect') progressText = '进度: ' + Math.min(STATE.inventory[task.target.item] || 0, task.target.amount) + '/' + task.target.amount;
            let btnText = '进行中', btnClass = '', btnDisabled = true;
            if (status.claimed) { btnText = '✓ 已完成'; btnClass = 'btn-success'; }
            else if (status.completed) { btnText = '🎁 领取'; btnClass = 'btn-gold'; btnDisabled = false; }
            div.innerHTML = '<div class="task-info"><div class="task-name">' + task.name + '</div><div class="task-desc">' + task.desc + '</div><div class="task-reward">奖励: ' + task.reward.money.toLocaleString() + '💰 ' + task.reward.exp.toLocaleString() + '原能' + (task.reward.item ? ' +' + task.reward.item : '') + '</div><div class="task-progress">' + progressText + '</div></div><button class="btn btn-sm ' + btnClass + '" ' + (btnDisabled ? 'disabled' : '') + '>' + btnText + '</button>';
            if (!btnDisabled) {
                div.querySelector('button').addEventListener('click', () => Task.claim(task.id));
            }
            list.appendChild(div);
        });
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
    checkProgress(type, value, detail) {
        CONFIG.TASKS.forEach(task => {
            Task.initTask(task.id);
            const status = STATE.tasks[task.id];
            if (status.completed) return;
            let shouldProgress = false;
            if (task.target.type === type) {
                if (type === 'cult') shouldProgress = true;
                else if (type === 'kill' && (!task.target.level || detail === task.target.level)) shouldProgress = true;
                else if (type === 'kill' && task.target.monster && detail === task.target.monster) shouldProgress = true;
            }
            if (shouldProgress) {
                status.progress += value;
                if (status.progress >= task.target.amount) status.completed = true;
            }
        });
        Save.save();
    }
};
