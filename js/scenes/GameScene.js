class GameScene extends Phaser.Scene {
    constructor() { super('GameScene'); }

    init() {
        gameState.stats.maxHp = 100; gameState.hp = 100; gameState.stats.speed = 190;
        gameState.stats.damage = 25; gameState.stats.attackSpeed = 1000;
        gameState.exp = 0; gameState.level = 1; gameState.score = 0;
        gameState.nextLevelExp = 100; gameState.gameSeconds = 0;
        gameState.isInvulnerable = false; gameState.bossActive = false; gameState.bossCount = 0;
        gameState.abilities.solarExplosion = 0; gameState.abilities.aura = 0;
        gameState.abilities.doubleShot = 0; gameState.abilities.ricochet = 0;
        gameState.inventory = [];
        this.joystickData = { x: 0, y: 0, active: false };
    }

    create() {
        // Sustituir la cuadrícula por el fondo de textura repetible (TileSprite)
        this.add.tileSprite(0, 0, 4000, 4000, 'background').setOrigin(0.5);

        this.cameras.main.setBounds(-2000, -2000, 4000, 4000);
        this.physics.world.setBounds(-2000, -2000, 4000, 4000);

        this.player = this.physics.add.sprite(0, 0, 'player_dir_0');
        this.player.setScale(1.8); // Escalar al personaje
        this.player.body.setCircle(12, 12, 28); // Hitbox
        this.player.body.setCollideWorldBounds(true);

        this.auraGraphic = this.add.circle(0, 0, 100, 0x3498db, 0.15).setVisible(false);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.enemies = this.physics.add.group({ bounceX: 0.3, bounceY: 0.3 });
        this.bullets = this.physics.add.group();
        this.enemyProjectiles = this.physics.add.group();
        this.gems = this.physics.add.group();
        this.pickups = this.physics.add.group();

        this.physics.add.collider(this.enemies, this.enemies);
        this.physics.add.collider(this.player, this.enemies);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.pause();
            this.scene.launch('PauseMenu');
        });

        this.createHUD();
        this.createJoystick();
        this.createInventoryUI();
        createSettingsButton(this);

        this.clockEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                gameState.gameSeconds++;
                this.timeText.setText(this.getFormattedTime());
                if ((gameState.gameSeconds + 5) % 150 === 0) this.showBossWarning();
                if (gameState.gameSeconds > 0 && gameState.gameSeconds % 150 === 0 && !gameState.bossActive) this.spawnBoss();
            },
            callbackScope: this,
            loop: true
        });

        this.enemyTimer = this.time.addEvent({ delay: 2800, callback: this.spawnWave, callbackScope: this, loop: true });
        this.attackTimer = this.time.addEvent({ delay: gameState.stats.attackSpeed, callback: this.autoAttack, callbackScope: this, loop: true });
        this.auraTimer = this.time.addEvent({ delay: 800, callback: this.applyAuraDamage, callbackScope: this, loop: true });

        this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.player, this.gems, this.collectGem, null, this);
        this.physics.add.overlap(this.player, this.enemyProjectiles, this.hitPlayerByProjectile, null, this);
        this.physics.add.overlap(this.player, this.pickups, this.collectPickup, null, this);

        // Crear animaciones de caminar para las 8 direcciones
        for (let i = 0; i < 8; i++) {
            this.anims.create({
                key: `walk_${i}`,
                frames: this.anims.generateFrameNumbers(`player_dir_${i}`, { start: 0, end: 7 }), // Asumiendo 8 frames (0 a 7)
                frameRate: 12,
                repeat: -1
            });
        }

        // Crear animación de idle
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player_idle', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });

        // Crear animación de boss_walk (15 frames)
        this.anims.create({
            key: 'boss_walk',
            frames: this.anims.generateFrameNumbers('boss', { start: 0, end: 14 }),
            frameRate: 15,
            repeat: -1
        });

        // Crear animaciones del enemigo a melé
        this.anims.create({
            key: 'enemy_walk',
            frames: this.anims.generateFrameNumbers('enemy_walk', { start: 0, end: 7 }),
            frameRate: 12,
            repeat: -1
        });

        this.anims.create({
            key: 'enemy_attack',
            frames: this.anims.generateFrameNumbers('enemy_attack', { start: 0, end: 7 }),
            frameRate: 15,
            repeat: 0 // Solo ataca una vez, para que espere el intervalo
        });

        // Crear animación del enemigo a distancia (14 frames)
        this.anims.create({
            key: 'enemy_range_walk',
            frames: this.anims.generateFrameNumbers('enemy_range', { start: 0, end: 13 }),
            frameRate: 15,
            repeat: -1
        });
    }



    createHUD() {
        this.hud = this.add.container(0, 0).setScrollFactor(0).setDepth(100);
        this.hpBarBase = this.add.rectangle(20, 35, 200, 20, 0x000000).setOrigin(0);
        this.hpBar = this.add.rectangle(20, 35, 200, 20, 0x2ecc71).setOrigin(0);
        this.hpText = this.add.text(120, 45, '100 / 100', { fontSize: '12px', fill: '#ffffff', fontWeight: 'bold' }).setOrigin(0.5);
        this.expBarBase = this.add.rectangle(0, 0, 800, 10, 0x444444).setOrigin(0);
        this.expBar = this.add.rectangle(0, 0, 0, 10, 0x9b59b6).setOrigin(0);
        this.levelText = this.add.text(20, 65, 'Nivel: 1', { fontSize: '18px', fill: '#fff', fontWeight: 'bold' });
        this.timeText = this.add.text(400, 35, '00:00', { fontSize: '26px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5);

        this.bossBarContainer = this.add.container(400, 570).setAlpha(0);
        this.bossBarBase = this.add.rectangle(0, 0, 400, 8, 0x333333).setOrigin(0.5);
        this.bossBarFill = this.add.rectangle(0, 0, 400, 8, 0x9b59b6).setOrigin(0.5);
        this.bossBarText = this.add.text(0, -15, 'JEFE', { fontSize: '14px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5);
        this.bossBarContainer.add([this.bossBarBase, this.bossBarFill, this.bossBarText]);

        this.bossWarning = this.add.container(400, 175).setAlpha(0).setScale(0.5);
        const warningBg = this.add.rectangle(0, 0, 320, 90, 0x000000, 0.9).setStrokeStyle(4, 0xe74c3c);
        this.bossWarning.add([warningBg, this.add.text(0, 0, '¡HA APARECIDO\nUN JEFE!', { fontSize: '24px', fill: '#e74c3c', fontWeight: 'bold', align: 'center' }).setOrigin(0.5)]);

        this.hud.add([this.hpBarBase, this.hpBar, this.hpText, this.expBarBase, this.expBar, this.levelText, this.timeText, this.bossBarContainer, this.bossWarning]);
    }

    createInventoryUI() {
        const startX = 580; const y = 50; const slotSize = 45; const spacing = 52;
        this.add.rectangle(startX + spacing, y, 170, 60, 0x000000, 0.4).setScrollFactor(0).setDepth(190).setStrokeStyle(2, 0x444444);
        this.abilitySlots = [];
        for (let i = 0; i < MAX_INVENTORY_SLOTS; i++) {
            const slotX = startX + (i * spacing);
            this.add.rectangle(slotX, y, slotSize, slotSize, 0x222222).setScrollFactor(0).setDepth(200).setStrokeStyle(2, 0x666666);
            const iconGraphics = this.add.graphics().setScrollFactor(0).setDepth(201);
            this.abilitySlots.push({ graphics: iconGraphics, x: slotX, y: y });
        }
    }

    updateInventoryUI() {
        this.abilitySlots.forEach((slot, i) => {
            const id = gameState.inventory[i];
            if (id) drawIconById(slot.graphics, slot.x, slot.y, id, 0.6);
            else slot.graphics.clear();
        });
    }

    update(time, delta) {
        if (!this.player.active) return;
        let vx = 0, vy = 0;
        const speed = gameState.stats.speed;
        if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -speed;
        else if (this.cursors.right.isDown || this.wasd.D.isDown) vx = speed;
        if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -speed;
        else if (this.cursors.down.isDown || this.wasd.S.isDown) vy = speed;
        if (this.joystickData.active) { vx = this.joystickData.x * speed; vy = this.joystickData.y * speed; }
        this.player.body.setVelocity(vx, vy);
        if (vx !== 0 || vy !== 0) {
            const angle = Math.atan2(vy, vx);
            let normAngle = angle < 0 ? angle + Math.PI * 2 : angle;
            let dir = Math.floor((normAngle + Math.PI / 8) / (Math.PI / 4)) % 8;

            // Si no está ejecutando ya la animación de esa dirección, reproducirla
            if (!this.player.anims.isPlaying || this.player.anims.currentAnim.key !== `walk_${dir}`) {
                this.player.anims.play(`walk_${dir}`, true);
            }
        } else {
            // Si el personaje no se mueve, reproducir la animación de idle
            if (!this.player.anims.isPlaying || this.player.anims.currentAnim.key !== 'idle') {
                this.player.anims.play('idle', true);
            }
        }

        if (gameState.abilities.aura > 0) {
            this.auraGraphic.setVisible(true).setPosition(this.player.x, this.player.y).setScale(1 + (gameState.abilities.aura - 1) * 0.2);
        }

        this.enemies.getChildren().forEach(enemy => {
            if (enemy.isBoss) {
                this.physics.moveToObject(enemy, this.player, enemy.speed);

                // Voltear sprite según su dirección X
                if (enemy.body.velocity.x < 0) {
                    enemy.setFlipX(true);
                } else if (enemy.body.velocity.x > 0) {
                    enemy.setFlipX(false);
                }

                if (time > enemy.nextAttackTime) { this.bossAttack(enemy); enemy.nextAttackTime = time + enemy.shootCooldown; }
                this.bossBarFill.width = 400 * Math.max(0, enemy.hp / enemy.maxHp);
            } else if (enemy.isRange) {
                const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);

                // Asegurar que la animación de andar se está reproduciendo siempre, se mueva o ataque
                if (enemy.anims && (!enemy.anims.isPlaying || enemy.anims.currentAnim.key !== 'enemy_range_walk')) {
                    enemy.play('enemy_range_walk', true);
                }

                // Siempre mirar hacia el jugador
                enemy.setFlipX(this.player.x < enemy.x);

                if (dist < 200) {
                    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
                    enemy.body.setVelocity(Math.cos(angle) * enemy.speed * 0.8, Math.sin(angle) * enemy.speed * 0.8);
                } else if (dist > 350) {
                    this.physics.moveToObject(enemy, this.player, enemy.speed);
                } else {
                    enemy.body.setVelocity(0, 0);
                }
                if (time > enemy.nextAttackTime) {
                    this.enemyShoot(enemy);
                    enemy.nextAttackTime = time + 2000;
                }
            } else {
                const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);

                if (dist < 55) { // Distancia de ataque cuerpo a cuerpo
                    enemy.body.setVelocity(0, 0); // Detenerse para atacar
                    enemy.setFlipX(this.player.x < enemy.x); // Mirar al jugador

                    if (time > enemy.nextAttackTime) {
                        enemy.play('enemy_attack', true);
                        this.applyDamage(10);
                        enemy.nextAttackTime = time + 1500; // Intervalo de 1.5s

                        enemy.once('animationcomplete-enemy_attack', () => {
                            if (enemy.active) enemy.play('enemy_walk', true);
                        });
                    }
                } else {
                    this.physics.moveToObject(enemy, this.player, enemy.speed);

                    if (enemy.body.velocity.x < 0) enemy.setFlipX(true);
                    else if (enemy.body.velocity.x > 0) enemy.setFlipX(false);

                    if (enemy.anims && (!enemy.anims.isPlaying || enemy.anims.currentAnim.key !== 'enemy_attack')) {
                        enemy.play('enemy_walk', true);
                    }
                }
            }
        });

        this.checkPlayerDamage();
        this.hpBar.width = Math.max(0, (gameState.hp / gameState.stats.maxHp) * 200);
        this.hpText.setText(`${Math.ceil(Math.max(0, gameState.hp))} / ${gameState.stats.maxHp}`);
        this.expBar.width = Math.min(800, (gameState.exp / gameState.nextLevelExp) * 800);
    }

    applyAuraDamage() {
        if (gameState.abilities.aura <= 0) return;
        const r = 100 * (1 + (gameState.abilities.aura - 1) * 0.2);
        this.enemies.getChildren().forEach(enemy => {
            if (Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y) < r) this.damageEnemy(enemy, gameState.stats.damage * 0.75);
        });
    }

    checkPlayerDamage() {
        if (gameState.isInvulnerable) return;
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.isBoss && Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y) < 75) {
                this.applyDamage(30 + gameState.bossCount * 10);
            }
        });
    }

    applyDamage(amount) {
        if (gameState.isInvulnerable || gameState.hp <= 0) return;
        gameState.hp -= amount;
        if (gameState.hp <= 0) { this.scene.start('MainMenu'); return; }
        gameState.isInvulnerable = true;
        this.tweens.add({ targets: this.player, alpha: 0.4, duration: 100, yoyo: true, repeat: 3 });
        this.time.delayedCall(400, () => { gameState.isInvulnerable = false; if (this.player.active) this.player.setAlpha(1); });
    }

    hitPlayerByProjectile(player, projectile) {
        if (gameState.isInvulnerable) { projectile.destroy(); return; }
        this.applyDamage(10 + gameState.bossCount * 5); projectile.destroy();
    }

    spawnBoss() {
        gameState.bossActive = true; gameState.bossCount++;

        const boss = this.physics.add.sprite(this.player.x + 600, this.player.y, 'boss');
        this.enemies.add(boss);

        // Ajustar el círculo de colisión para el jefe
        boss.body.setCircle(80, 32, 40);

        // Reproducir la animación creada para el jefe
        boss.play('boss_walk');

        boss.isBoss = true;
        boss.maxHp = 5000 * Math.pow(1.5, gameState.bossCount - 1);
        boss.hp = boss.maxHp;
        boss.speed = 100 + (gameState.bossCount * 5);
        boss.shootCooldown = Math.max(800, 1500 - (gameState.bossCount * 100));
        boss.nextAttackTime = this.time.now + 1000;
        this.bossBarContainer.setAlpha(1);
    }

    bossAttack(boss) {
        const bulletsCount = 10 + gameState.bossCount * 2;
        for (let i = 0; i < bulletsCount; i++) {
            const angle = (Math.PI * 2 / bulletsCount) * i;
            const ball = this.add.circle(boss.x, boss.y, 12, 0x9b59b6);
            this.enemyProjectiles.add(ball); this.physics.add.existing(ball);
            ball.body.setVelocity(Math.cos(angle) * 300, Math.sin(angle) * 300);
            this.time.delayedCall(4000, () => { if (ball.active) ball.destroy(); });
        }
    }

    enemyShoot(enemy) {
        const ball = this.add.circle(enemy.x, enemy.y, 8, 0xe67e22);
        this.enemyProjectiles.add(ball);
        this.physics.add.existing(ball);
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        ball.body.setVelocity(Math.cos(angle) * 250, Math.sin(angle) * 250);
        this.time.delayedCall(3000, () => { if (ball.active) ball.destroy(); });
    }

    autoAttack() {
        const shoot = (mod = 1.0) => {
            const target = this.getClosestEnemy();
            if (target) {
                const b = this.add.circle(this.player.x, this.player.y, 8, 0xf1c40f);
                this.bullets.add(b); this.physics.add.existing(b);
                b.bounces = gameState.abilities.ricochet; b.dmgMult = mod;
                this.physics.moveToObject(b, target, 500);
                this.time.delayedCall(1200, () => { if (b.active) b.destroy(); });
            }
        };
        if (gameState.abilities.doubleShot > 0) { shoot(0.6); this.time.delayedCall(150, () => shoot(0.6)); }
        else shoot(1.0);
    }

    updateAttackSpeed() {
        if (this.attackTimer) {
            this.attackTimer.remove();
            this.attackTimer = this.time.addEvent({
                delay: gameState.stats.attackSpeed,
                callback: this.autoAttack,
                callbackScope: this,
                loop: true
            });
        }
    }

    getClosestEnemy(exclude = null) {
        let enemies = this.enemies.getChildren();
        if (enemies.length === 0) return null;
        return enemies.reduce((closest, enemy) => {
            if (enemy === exclude) return closest;
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
            if (!closest || dist < closest.dist) return { enemy, dist };
            return closest;
        }, null)?.enemy;
    }

    spawnWave() {
        if (gameState.bossActive) return;
        const count = 5 + Math.floor(gameState.gameSeconds / 30);
        for (let i = 0; i < count; i++) {
            const a = Math.random() * Math.PI * 2;
            const dist = 700;
            const ex = this.player.x + Math.cos(a) * dist;
            const ey = this.player.y + Math.sin(a) * dist;
            const isRange = gameState.level >= 5 && Math.random() > 0.8;

            let e;
            if (isRange) {
                e = this.physics.add.sprite(ex, ey, 'enemy_range');
                e.setScale(2); // Usando la misma escala que el meele
                this.enemies.add(e);
                e.body.setCircle(16, 16, 16); // Hitbox adaptada y centrada
                e.play('enemy_range_walk');
            } else {
                e = this.physics.add.sprite(ex, ey, 'enemy_walk');
                e.setScale(2); // escala del enemigo melee
                this.enemies.add(e);
                e.body.setCircle(16, 32, 32); // Hitbox enemigo melee
                e.play('enemy_walk');
            }

            e.hp = (20 + (gameState.gameSeconds / 8)) * (isRange ? 0.8 : 1);
            e.speed = (80 + (gameState.gameSeconds / 30)) * (isRange ? 0.9 : 1);
            e.isRange = isRange;
            if (isRange) e.nextAttackTime = this.time.now + 1500;
            else e.nextAttackTime = this.time.now;
        }
    }

    hitEnemy(bullet, enemy) {
        const bx = bullet.x, by = bullet.y;
        this.damageEnemy(enemy, gameState.stats.damage * (bullet.dmgMult || 1.0));
        if (bullet.bounces > 0) {
            bullet.bounces--; bullet.dmgMult *= 0.7;
            const next = this.getClosestEnemy(enemy);
            if (next) this.physics.moveToObject(bullet, next, 500); else bullet.destroy();
        } else bullet.destroy();

        if (gameState.abilities.solarExplosion > 0) {
            const r = 80 * (1 + (gameState.abilities.solarExplosion - 1) * 0.25);
            const circle = this.add.circle(bx, by, r, 0xf1c40f, 0.3);
            this.tweens.add({ targets: circle, scale: 1.5, alpha: 0, duration: 300, onComplete: () => circle.destroy() });
            this.enemies.getChildren().forEach(t => {
                if (Phaser.Math.Distance.Between(bx, by, t.x, t.y) < r && t !== enemy) this.damageEnemy(t, gameState.stats.damage * 0.5);
            });
        }
    }

    damageEnemy(enemy, amount) {
        enemy.hp -= amount;
        if (enemy.hp <= 0) {
            if (enemy.isBoss) {
                gameState.bossActive = false; this.bossBarContainer.setAlpha(0);
                for (let i = 0; i < 10; i++) this.spawnGem(enemy.x + Math.random() * 40, enemy.y + Math.random() * 40, true);
            } else {
                this.spawnGem(enemy.x, enemy.y, Math.random() > 0.9);
                const currentPickups = this.pickups.getChildren();
                const healthCount = currentPickups.filter(p => p.type === 'health').length;
                const magnetCount = currentPickups.filter(p => p.type === 'magnet').length;

                const rand = Math.random();
                if (rand < 0.01 && healthCount < 3) {
                    this.spawnPickup(enemy.x, enemy.y, 'health');
                }
                else if (rand < 0.015 && rand >= 0.01 && magnetCount < 2) {
                    this.spawnPickup(enemy.x, enemy.y, 'magnet');
                }
            }
            enemy.destroy();
        }
    }

    spawnPickup(x, y, type) {
        const color = type === 'health' ? 0xe74c3c : 0x3498db;
        const pickup = this.add.container(x, y);
        const bg = this.add.circle(0, 0, 15, 0xffffff, 0.2);
        const icon = this.add.graphics();
        icon.fillStyle(color, 1);
        if (type === 'health') { icon.fillRect(-8, -3, 16, 6); icon.fillRect(-3, -8, 6, 16); }
        else { icon.lineStyle(4, color); icon.arc(0, 0, 8, 0, Math.PI, true); icon.strokePath(); }
        pickup.add([bg, icon]);
        pickup.type = type;
        this.pickups.add(pickup);
        this.physics.add.existing(pickup);
        pickup.body.setCircle(15, -15, -15);
        this.tweens.add({ targets: pickup, y: y - 10, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    collectPickup(player, pickup) {
        if (pickup.type === 'health') {
            gameState.hp = Math.min(gameState.stats.maxHp, gameState.hp + 30);
            this.showPopupText("+30 HP", 0x2ecc71);
        } else if (pickup.type === 'magnet') {
            this.gems.getChildren().forEach(gem => {
                this.tweens.add({
                    targets: gem, x: this.player.x, y: this.player.y,
                    duration: 600, ease: 'Power2',
                    onComplete: () => { if (gem.active) this.collectGem(this.player, gem); }
                });
            });
            this.showPopupText("IMÁN", 0x3498db);
        }
        pickup.destroy();
    }

    showPopupText(text, color) {
        const txt = this.add.text(this.player.x, this.player.y - 40, text, { fontSize: '20px', fill: '#' + color.toString(16).padStart(6, '0'), fontWeight: 'bold' }).setOrigin(0.5);
        this.tweens.add({ targets: txt, y: txt.y - 50, alpha: 0, duration: 800, onComplete: () => txt.destroy() });
    }

    spawnGem(x, y, large = false) {
        const gem = this.add.star(x, y, 5, 4, large ? 12 : 8, large ? 0xf1c40f : 0x9b59b6);
        this.gems.add(gem); this.physics.add.existing(gem); gem.isLarge = large;
    }

    collectGem(player, gem) {
        gameState.exp += gem.isLarge ? 150 : 40; gem.destroy();
        if (gameState.exp >= gameState.nextLevelExp) this.levelUp();
    }

    levelUp() {
        gameState.level++; gameState.exp = 0; gameState.nextLevelExp *= 1.25;
        this.levelText.setText('Nivel: ' + gameState.level);
        this.scene.pause(); this.scene.launch('SpecialAbilityScene');
    }

    showBossWarning() {
        this.tweens.add({ targets: this.bossWarning, alpha: 1, scale: 1, duration: 600, ease: 'Back.easeOut' });
        this.time.delayedCall(3000, () => { this.tweens.add({ targets: this.bossWarning, alpha: 0, duration: 500 }); });
    }

    getFormattedTime() {
        const m = Math.floor(gameState.gameSeconds / 60).toString().padStart(2, '0');
        const s = (gameState.gameSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    createJoystick() {
        const x = 680, y = 480;
        this.joyBase = this.add.circle(x, y, 60, 0xffffff, 0.1).setScrollFactor(0).setDepth(101).setInteractive();
        this.joyStick = this.add.circle(x, y, 30, 0xffffff, 0.2).setScrollFactor(0).setDepth(102);
        this.joyBase.on('pointerdown', () => this.joystickData.active = true);
        this.input.on('pointermove', (p) => {
            if (!this.joystickData.active) return;
            const d = Math.min(Phaser.Math.Distance.Between(x, y, p.x, p.y), 60);
            const a = Phaser.Math.Angle.Between(x, y, p.x, p.y);
            this.joyStick.setPosition(x + Math.cos(a) * d, y + Math.sin(a) * d);
            this.joystickData.x = Math.cos(a) * (d / 60); this.joystickData.y = Math.sin(a) * (d / 60);
        });
        this.input.on('pointerup', () => { this.joystickData.active = false; this.joyStick.setPosition(x, y); this.joystickData.x = 0; this.joystickData.y = 0; });
    }
}
