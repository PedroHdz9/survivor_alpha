// --- ESTADO GLOBAL ---
let gameState = {
    score: 0,
    level: 1,
    exp: 0,
    nextLevelExp: 100,
    gameSeconds: 0,
    isInvulnerable: false,
    bossActive: false,
    bossCount: 0,
    abilities: {
        solarExplosion: 0,
        aura: 0,
        doubleShot: 0,
        ricochet: 0
    },
    inventory: [],
    stats: {
        maxHp: 100,
        hp: 100,
        speed: 190,
        damage: 25,
        attackSpeed: 1000,
        area: 1
    },
    settings: {
        sound: true,
        music: 40,
        vibration: true
    }
};

// --- CONSTANTES ---
const MAX_ABILITY_LEVEL = 5;
const MAX_INVENTORY_SLOTS = 3;
