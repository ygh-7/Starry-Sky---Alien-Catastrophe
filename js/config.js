// ============================================================
//  Config
// ============================================================

const CONFIG = {
    REALMS: ["初级战士","中级战士","高级战士","初级战将","中级战将","高级战将","初级战神","中级战神","高级战神","行星级一阶","行星级二阶","行星级三阶"],
    REALM_EXP: [150,350,700,1400,2800,5500,11000,22000,45000,90000,180000,360000],
    REALM_POWER: [900,1500,2500,5000,10000,18000,35000,60000,90000,128000,200000,350000],
    CLASSES: {
        warrior: { name:"武者", icon:"⚔️", atkBonus:1.3, defBonus:1.2, skill:"九重雷刀", skillDesc:"造成150%拳力伤害" },
        psychic: { name:"精神念师", icon:"🧠", atkBonus:1.5, defBonus:0.9, skill:"裂空梭", skillDesc:"念力攻击，造成180%念力伤害" }
    },
    ITEMS: {
        "兽兵材料": { icon:"🦴", type:"material", desc:"兽兵级怪兽材料，可出售", price:500 },
        "兽将材料": { icon:"🦴", type:"material", desc:"兽将级怪兽材料，价值更高", price:2000 },
        "领主材料": { icon:"💎", type:"material", desc:"领主级怪兽材料，稀有", price:10000 },
        "基因药剂": { icon:"🧪", type:"consumable", desc:"提升30%突破成功率", effect:{ breakRate:0.3 } },
        "高级基因药剂": { icon:"🧪", type:"consumable", desc:"提升50%突破成功率", effect:{ breakRate:0.5 } },
        "完美基因药剂": { icon:"🧪", type:"consumable", desc:"提升80%突破成功率", effect:{ breakRate:0.8 } },
        "疗伤药剂": { icon:"💊", type:"consumable", desc:"恢复50%生命值", effect:{ heal:0.5 } },
        "能量药剂": { icon:"⚡", type:"consumable", desc:"增加200基因原能", effect:{ exp:200 } },
        "猩红战刃": { icon:"xinghong-zhanren.jpg",  type:"weapon", desc:"SS级猩红战刃", attack:500, rarity:"SS" },
        "黑曜战甲": { icon:"heiyao-zhanjia.png",  type:"armor", desc:"SS级黑曜战甲", defense:20, rarity:"SS" },
        "裂空梭": { icon:"liekong-suo.png",  type:"weapon", desc:"精神念师专属兵器", attack:800, rarity:"SS" },
        "龙血": { icon:"🩸", type:"consumable", desc:"龙血，可大幅提升基因层次", effect:{ exp:2000, breakRate:0.5 } }
    },
    MONSTERS: [
        { id:1, name:"独角野狼", level:"兽兵级H阶", icon:"🐺", hp:120, atk:15, def:3, reward:{ money:500, exp:50, material:"兽兵材料" } },
        { id:2, name:"铁甲蛮牛", level:"兽兵级G阶", icon:"🐂", hp:200, atk:22, def:8, reward:{ money:800, exp:80, material:"兽兵材料" } },
        { id:3, name:"双头黑线蛇", level:"兽将级E阶", icon:"🐍", hp:400, atk:35, def:12, reward:{ money:2000, exp:150, material:"兽将材料" } },
        { id:4, name:"银月凶狼", level:"兽将级D阶", icon:"🐕", hp:700, atk:50, def:18, reward:{ money:5000, exp:250, material:"兽将材料" } },
        { id:5, name:"铁甲龙", level:"领主级B阶", icon:"🐉", hp:1500, atk:80, def:30, reward:{ money:20000, exp:500, material:"领主材料" } }
    ],
    TASKS: [
        { id:1, name:"每日修炼", desc:"累计吸收1000基因原能", target:{ type:"cult", amount:1000 }, reward:{ money:1000, exp:100 } },
        { id:2, name:"猎杀兽兵", desc:"猎杀3只兽兵级怪兽", target:{ type:"kill", level:"兽兵", amount:3 }, reward:{ money:2000, exp:200 } },
        { id:3, name:"收集材料", desc:"收集5个兽兵材料", target:{ type:"collect", item:"兽兵材料", amount:5 }, reward:{ money:1500, exp:150 } },
        { id:4, name:"挑战兽将", desc:"猎杀1只兽将级怪兽", target:{ type:"kill", level:"兽将", amount:1 }, reward:{ money:5000, exp:400 } },
        { id:5, name:"极限挑战", desc:"击败领主级铁甲龙", target:{ type:"kill", monster:"铁甲龙", amount:1 }, reward:{ money:30000, exp:1000, item:"龙血" } }
    ],
    SHOP_ITEMS: [
        { name:"基因药剂", icon:"🧪", price:2000, desc:"突破成功率+30%", type:"consumable" },
        { name:"疗伤药剂", icon:"💊", price:500, desc:"恢复50%生命", type:"consumable" },
        { name:"能量药剂", icon:"⚡", price:1000, desc:"基因原能+200", type:"consumable" },
        { name:"猩红战刃", price:50000, desc:"SS级猩红战刃" },
        { name:"黑曜战甲", price:80000, desc:"SS级黑曜战甲" },
        { name:"裂空梭", price:100000, desc:"精神念师专属兵器" }
    ],
    RECIPES: [
        { name:"基因药剂", materials:{ "兽兵材料":5 }, rate:0.8 },
        { name:"高级基因药剂", materials:{ "兽将材料":3 }, rate:0.7 },
        { name:"疗伤药剂", materials:{ "兽兵材料":5, "兽将材料":5 }, rate:0.75 },
        { name:"完美基因药剂", materials:{ "领主材料":1, "兽将材料":3 }, rate:0.6 }
    ],
    WOLF_IMG: "wolf.png"
};


// 统一渲染图标：emoji 直接显示，图片文件名渲染为 img 标签
function renderIcon(icon, size) {
    size = size || 22;
    if (!icon) return '';
    if (icon.indexOf('.') > -1) {
        return '<img src="assets/images/' + icon + '" style="width:' + size + 'px;height:' + size + 'px;object-fit:contain;vertical-align:middle;border-radius:3px;">';
    }
    return icon;
}

