// ============================================================
//  State
// ============================================================

let STATE = {
    player: { name:"", class:"warrior", realmIndex:0, exp:0, totalExp:0, hp:100, maxHp:100, mp:50, maxMp:50, attack:10, defense:5, money:10000, totalMoney:10000, cultivationSpeed:200 },
    inventory: {},
    equipment: { weapon:null, armor:null },
    tasks: {},
    monstersKilled: {},
    stagesCleared: [],
    lastOnline: Date.now()
};

let cultivationInterval = null;
let battleState = null;
let selectedClass = null;
