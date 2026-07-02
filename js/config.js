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
        "废墟材料": { icon:"🧱", type:"material", desc:"废墟都市怪兽材料", price:25000 },
        "深海材料": { icon:"🐚", type:"material", desc:"深海禁区怪兽材料", price:60000 },
        "遗迹材料": { icon:"🏛️", type:"material", desc:"古文明遗迹材料", price:150000 },
        "基因药剂": { icon:"🧪", type:"consumable", desc:"提升30%突破成功率", effect:{ breakRate:0.3 } },
        "高级基因药剂": { icon:"🧪", type:"consumable", desc:"提升50%突破成功率", effect:{ breakRate:0.5 } },
        "完美基因药剂": { icon:"🧪", type:"consumable", desc:"提升80%突破成功率", effect:{ breakRate:0.8 } },
        "疗伤药剂": { icon:"💊", type:"consumable", desc:"恢复50%生命值", effect:{ heal:0.5 } },
        "能量药剂": { icon:"⚡", type:"consumable", desc:"增加200基因原能", effect:{ exp:200 } },
        "猩红战刃": { icon:"xinghong-zhanren.jpg", type:"weapon", desc:"SS级猩红战刃", attack:500, rarity:"SS" },
        "黑曜战甲": { icon:"heiyao-zhanjia.png", type:"armor", desc:"SS级黑曜战甲", defense:20, rarity:"SS" },
        "裂空梭": { icon:"liekong-suo.png", type:"weapon", desc:"精神念师专属兵器", attack:800, rarity:"SS" },
        "龙血": { icon:"🩸", type:"consumable", desc:"龙血，可大幅提升基因层次", effect:{ exp:2000, breakRate:0.5 } }
    },
    MONSTERS: [
        // 荒野区
        { id:1, name:"独角野狼", region:"荒野区", level:"兽兵级H阶", icon:"🐺", hp:120, atk:15, def:3, reward:{ money:500, exp:50, material:"兽兵材料" } },
        { id:2, name:"铁甲蛮牛", region:"荒野区", level:"兽兵级G阶", icon:"🐂", hp:200, atk:22, def:8, reward:{ money:800, exp:80, material:"兽兵材料" } },
        { id:3, name:"双头黑线蛇", region:"荒野区", level:"兽将级E阶", icon:"🐍", hp:400, atk:35, def:12, reward:{ money:2000, exp:150, material:"兽将材料" } },
        { id:4, name:"银月凶狼", region:"荒野区", level:"兽将级D阶", icon:"🐕", hp:700, atk:50, def:18, reward:{ money:5000, exp:250, material:"兽将材料" } },
        { id:5, name:"铁甲龙", region:"荒野区", level:"领主级B阶", icon:"🐉", hp:1500, atk:80, def:30, reward:{ money:20000, exp:500, material:"领主材料" } },
        // 废墟都市
        { id:6, name:"腐蚀巨鼠", region:"废墟都市", level:"领主级A阶", icon:"🐀", hp:3000, atk:120, def:40, reward:{ money:40000, exp:800, material:"废墟材料" } },
        { id:7, name:"钢铁丧尸", region:"废墟都市", level:"领主级S阶", icon:"🧟", hp:4500, atk:160, def:55, reward:{ money:55000, exp:1100, material:"废墟材料" } },
        { id:8, name:"暗影豹", region:"废墟都市", level:"王级A阶", icon:"🐆", hp:6500, atk:220, def:70, reward:{ money:75000, exp:1500, material:"废墟材料" } },
        { id:9, name:"火焰巨猿", region:"废墟都市", level:"王级S阶", icon:"🦍", hp:9000, atk:300, def:90, reward:{ money:100000, exp:2000, material:"废墟材料" } },
        { id:10, name:"城市领主", region:"废墟都市", level:"王级SS阶", icon:"👹", hp:13000, atk:400, def:120, reward:{ money:150000, exp:3000, material:"废墟材料" } },
        // 深海禁区
        { id:11, name:"深海巨蟹", region:"深海禁区", level:"皇级A阶", icon:"🦀", hp:25000, atk:600, def:180, reward:{ money:250000, exp:5000, material:"深海材料" } },
        { id:12, name:"电鳗王", region:"深海禁区", level:"皇级S阶", icon:"🐍", hp:35000, atk:800, def:220, reward:{ money:320000, exp:6500, material:"深海材料" } },
        { id:13, name:"章鱼怪", region:"深海禁区", level:"皇级SS阶", icon:"🐙", hp:50000, atk:1100, def:280, reward:{ money:420000, exp:8500, material:"深海材料" } },
        { id:14, name:"海蛇女王", region:"深海禁区", level:"皇级SSS阶", icon:"🐲", hp:70000, atk:1500, def:350, reward:{ money:550000, exp:11000, material:"深海材料" } },
        { id:15, name:"深海龙王", region:"深海禁区", level:"行星级一阶", icon:"🐉", hp:100000, atk:2000, def:450, reward:{ money:800000, exp:15000, material:"深海材料" } },
        // 古文明遗迹
        { id:16, name:"机械守卫", region:"古文明遗迹", level:"行星级一阶", icon:"🤖", hp:200000, atk:3000, def:600, reward:{ money:1200000, exp:22000, material:"遗迹材料" } },
        { id:17, name:"能量傀儡", region:"古文明遗迹", level:"行星级二阶", icon:"🎭", hp:280000, atk:4000, def:750, reward:{ money:1600000, exp:30000, material:"遗迹材料" } },
        { id:18, name:"遗迹巨像", region:"古文明遗迹", level:"行星级三阶", icon:"🗿", hp:380000, atk:5500, def:900, reward:{ money:2100000, exp:40000, material:"遗迹材料" } },
        { id:19, name:"古文明战士", region:"古文明遗迹", level:"行星级三阶", icon:"👾", hp:500000, atk:7000, def:1100, reward:{ money:2700000, exp:52000, material:"遗迹材料" } },
        { id:20, name:"遗迹主宰", region:"古文明遗迹", level:"恒星级一阶", icon:"👿", hp:700000, atk:9000, def:1400, reward:{ money:3500000, exp:70000, material:"遗迹材料" } }
    ],
    REGIONS: [
        { id:1, name:"荒野区", unlockRealmIndex:0, monsterIds:[1,2,3,4,5], desc:"地球表面的荒野区域，怪兽横行" },
        { id:2, name:"废墟都市", unlockRealmIndex:3, monsterIds:[6,7,8,9,10], desc:"被怪兽占领的废弃城市" },
        { id:3, name:"深海禁区", unlockRealmIndex:6, monsterIds:[11,12,13,14,15], desc:"海洋深处的危险区域" },
        { id:4, name:"古文明遗迹", unlockRealmIndex:9, monsterIds:[16,17,18,19,20], desc:"远古文明留下的神秘遗迹" }
    ],
    TASKS: [
        { id:1, name:"每日修炼", desc:"累计吸收1000基因原能", target:{ type:"cult", amount:1000 }, reward:{ money:1000, exp:100 } },
        { id:2, name:"猎杀兽兵", desc:"猎杀3只兽兵级怪兽", target:{ type:"kill", level:"兽兵", amount:3 }, reward:{ money:2000, exp:200 } },
        { id:3, name:"收集材料", desc:"收集5个兽兵材料", target:{ type:"collect", item:"兽兵材料", amount:5 }, reward:{ money:1500, exp:150 } },
        { id:4, name:"挑战兽将", desc:"猎杀1只兽将级怪兽", target:{ type:"kill", level:"兽将", amount:1 }, reward:{ money:5000, exp:400 } },
        { id:5, name:"极限挑战", desc:"击败领主级铁甲龙", target:{ type:"kill", monster:"铁甲龙", amount:1 }, reward:{ money:30000, exp:1000, item:"龙血" } }
    ],
    DAILY_TASKS: [
        { id:'d1', name:'每日修炼', desc:'累计吸收5000基因原能', target:{ type:'cult', amount:5000 }, reward:{ money:5000, exp:500 } },
        { id:'d2', name:'猎杀怪兽', desc:'猎杀10只怪兽', target:{ type:'kill', amount:10 }, reward:{ money:8000, exp:800 } },
        { id:'d3', name:'出售材料', desc:'通过出售材料获得20000星辰币', target:{ type:'sell', amount:20000 }, reward:{ money:3000, exp:300 } },
        { id:'d4', name:'工坊炼制', desc:'成功炼制3次药剂', target:{ type:'craft', amount:3 }, reward:{ money:5000, exp:500 } },
        { id:'d5', name:'装备强化', desc:'成功强化装备2次', target:{ type:'enhance', amount:2 }, reward:{ money:10000, exp:1000 } }
    ],
    ACHIEVEMENTS: [
        { id:'a1', name:'初出茅庐', desc:'突破到初级战将', target:{ type:'realm', realmIndex:3 }, reward:{ money:10000, exp:2000 } },
        { id:'a2', name:'战神之路', desc:'突破到初级战神', target:{ type:'realm', realmIndex:6 }, reward:{ money:50000, exp:10000 } },
        { id:'a3', name:'超凡入圣', desc:'突破到行星级一阶', target:{ type:'realm', realmIndex:9 }, reward:{ money:200000, exp:50000 } },
        { id:'a4', name:'荒野猎人', desc:'通关荒野区', target:{ type:'region', regionId:1 }, reward:{ money:50000, exp:5000 } },
        { id:'a5', name:'城市征服者', desc:'通关废墟都市', target:{ type:'region', regionId:2 }, reward:{ money:200000, exp:15000 } },
        { id:'a6', name:'深海霸主', desc:'通关深海禁区', target:{ type:'region', regionId:3 }, reward:{ money:800000, exp:40000 } },
        { id:'a7', name:'遗迹探索者', desc:'通关古文明遗迹', target:{ type:'region', regionId:4 }, reward:{ money:2000000, exp:100000 } },
        { id:'a8', name:'百兽斩', desc:'累计猎杀100只怪兽', target:{ type:'totalKill', amount:100 }, reward:{ money:100000, exp:10000 } },
        { id:'a9', name:'家财万贯', desc:'累计获得100万星辰币', target:{ type:'totalMoney', amount:1000000 }, reward:{ money:500000, exp:50000 } },
        { id:'a10', name:'神兵利器', desc:'任意装备强化到+5', target:{ type:'enhanceLevel', level:5 }, reward:{ money:200000, exp:20000 } },
        { id:'a11', name:'绝世神兵', desc:'任意装备强化到+10', target:{ type:'enhanceLevel', level:10 }, reward:{ money:1000000, exp:100000 } }
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
        { name:"完美基因药剂", materials:{ "领主材料":1, "兽将材料":3 }, rate:0.6 },
        { name:"废墟强化剂", materials:{ "废墟材料":3 }, rate:0.8 },
        { name:"深海精华", materials:{ "深海材料":2 }, rate:0.75 },
        { name:"遗迹秘药", materials:{ "遗迹材料":1 }, rate:0.7 }
    ],
    ENHANCE: {
        maxLevel: 10,
        weaponBonusPerLevel: 0.1,
        armorBonusPerLevel: 0.02,
        levels: [
            { level:1, material:"兽兵材料", materialCount:10, money:10000, rate:1.0 },
            { level:2, material:"兽兵材料", materialCount:20, money:20000, rate:1.0 },
            { level:3, material:"兽将材料", materialCount:5, money:50000, rate:0.9 },
            { level:4, material:"兽将材料", materialCount:10, money:100000, rate:0.8 },
            { level:5, material:"领主材料", materialCount:3, money:200000, rate:0.7 },
            { level:6, material:"领主材料", materialCount:5, money:350000, rate:0.6 },
            { level:7, material:"废墟材料", materialCount:3, money:600000, rate:0.5 },
            { level:8, material:"深海材料", materialCount:2, money:1000000, rate:0.45 },
            { level:9, material:"深海材料", materialCount:3, money:1500000, rate:0.4 },
            { level:10, material:"遗迹材料", materialCount:1, money:2500000, rate:0.35 }
        ]
    },
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
