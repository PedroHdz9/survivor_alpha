class SpecialAbilityScene extends Phaser.Scene {
    constructor() { super('SpecialAbilityScene'); }
    create() {
        const w = 1280, h = 720;
        const isMilestone = (gameState.level % 5 === 0);
        this.add.rectangle(w / 2, h / 2, 500, 520, 0x1a1a1a, 0.98).setStrokeStyle(5, isMilestone ? 0xf1c40f : 0x9b59b6);
        this.add.text(w / 2, h * 0.22, isMilestone ? '¡NUEVA HABILIDAD!' : 'MEJORA', { fontSize: '32px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5);

        const specialAbilities = [
            { name: 'Explosión Solar', id: 'solar', effect: () => { if (this.getLvl('solar') === 0) gameState.inventory.push('solar'); gameState.abilities.solarExplosion++; } },
            { name: 'Aura Divina', id: 'aura', effect: () => { if (this.getLvl('aura') === 0) gameState.inventory.push('aura'); gameState.abilities.aura++; } },
            { name: 'Tiro Doble', id: 'double', effect: () => { if (this.getLvl('double') === 0) gameState.inventory.push('double'); gameState.abilities.doubleShot++; } },
            { name: 'Ricochet', id: 'rico', effect: () => { if (this.getLvl('rico') === 0) gameState.inventory.push('rico'); gameState.abilities.ricochet++; } }
        ];

        const baseUpgrades = [
            { name: 'DAÑO +10', id: 'damage', effect: () => gameState.stats.damage += 10 },
            { name: 'VELOCIDAD +20', id: 'speed', effect: () => gameState.stats.speed += 20 },
            {
                name: 'VEL. ATAQUE +15%', id: 'atkSpeed', effect: () => {
                    gameState.stats.attackSpeed *= 0.85;
                    const gs = this.scene.get('GameScene');
                    gs.updateAttackSpeed();
                }
            },
            { name: 'VIDA MÁX +30', id: 'hp', effect: () => { gameState.stats.maxHp += 30; gameState.hp = Math.min(gameState.stats.maxHp, gameState.hp + 30); } }
        ];

        const acquiredNotMax = specialAbilities.filter(a => { const lvl = this.getLvl(a.id); return lvl > 0 && lvl < MAX_ABILITY_LEVEL; });
        const canGetNew = gameState.inventory.length < MAX_INVENTORY_SLOTS;
        const newAvailable = canGetNew ? specialAbilities.filter(a => this.getLvl(a.id) === 0) : [];

        let pool = isMilestone && newAvailable.length > 0 ?
            Phaser.Utils.Array.Shuffle(newAvailable).slice(0, 3) :
            Phaser.Utils.Array.Shuffle([...acquiredNotMax, ...baseUpgrades]).slice(0, 3);

        pool.forEach((opt, i) => {
            const y = (h * 0.35) + (i * 105);
            const isSpec = specialAbilities.find(s => s.id === opt.id);
            const btn = this.add.rectangle(w / 2, y, 400, 80, isSpec ? 0x2c3e50 : 0x34495e).setInteractive({ useHandCursor: true });
            const iconGraph = this.add.graphics();
            drawIconById(iconGraph, w / 2 - 170, y, opt.id, 0.5);
            const lvl = this.getLvl(opt.id);
            const title = isSpec ? `${opt.name} (NVL ${lvl + 1})` : opt.name;
            this.add.text(w / 2 + 10, y, title, { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
            btn.on('pointerdown', () => {
                opt.effect();
                const gs = this.scene.get('GameScene');
                gs.updateInventoryUI();
                this.scene.stop();
                this.scene.resume('GameScene');
            });
        });
    }
    getLvl(id) {
        if (id === 'solar') return gameState.abilities.solarExplosion;
        if (id === 'aura') return gameState.abilities.aura;
        if (id === 'double') return gameState.abilities.doubleShot;
        if (id === 'rico') return gameState.abilities.ricochet;
        return 0;
    }
}
