class MainMenu extends Phaser.Scene {
    constructor() { super('MainMenu'); }
    preload() {

        // Cargar musica
        const musicSource = 'assets/EndlessArcaneHunt.mp3';

        this.load.audio('bgMusic', musicSource);

        const frameWidth = 48;
        const frameHeight = 64;

        for (let i = 0; i < 8; i++) {
            this.load.spritesheet(`player_dir_${i}`, `assets/player_${i}.png`, {
                frameWidth: frameWidth,
                frameHeight: frameHeight
            });
        }

        this.load.spritesheet('player_idle', 'assets/player_idle.png', {
            frameWidth: frameWidth,
            frameHeight: frameHeight
        });

        // Cargar el spritesheet del jefe
        this.load.spritesheet('boss', 'assets/boss.png', {
            frameWidth: 224,
            frameHeight: 240
        });

        // Cargar imagen de fondo a modo de mapa
        this.load.image('background', 'assets/background.png');

        // Cargar spritesheets del enemigo cuerpo a cuerpo
        this.load.spritesheet('enemy_walk', 'assets/enemy_walk.png', {
            frameWidth: 96,
            frameHeight: 96
        });

        this.load.spritesheet('enemy_attack', 'assets/enemy_attack.png', {
            frameWidth: 96,
            frameHeight: 96
        });

        // Cargar spritesheet del enemigo a distancia
        this.load.spritesheet('enemy_range', 'assets/enemy_range.png', {
            frameWidth: 64,
            frameHeight: 62
        });

        // Cargar proyectil y explosión del boss
        this.load.spritesheet('boss_projectile', 'assets/boss_projectile.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.spritesheet('boss_explosion', 'assets/boss_explosion.png', {
            frameWidth: 32,
            frameHeight: 32
        });
    }
    create() {
        // Iniciar música globalmente al abrir la aplicación
        if (this.cache.audio.exists('bgMusic')) {
            let bgm = this.sound.get('bgMusic');
            if (!bgm) {
                bgm = this.sound.add('bgMusic', { loop: true, volume: gameState.settings.music / 100 });
            }
            if (gameState.settings.music > 0 && !bgm.isPlaying) {
                bgm.play();
            }
            bgm.setVolume(gameState.settings.music / 100);
        }

        this.input.on('pointerdown', () => {
            if (this.sound.context.state === 'suspended') {
                this.sound.context.resume();
            }
            let bgm = this.sound.get('bgMusic');
            if (gameState.settings.music > 0 && bgm && !bgm.isPlaying) {
                bgm.play();
            }
        });

        this.add.rectangle(400, 300, 800, 600, 0x111111);
        this.add.text(400, 150, 'SUPER SURVIVOR', { fontSize: '64px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5);
        const startBtn = this.add.rectangle(400, 400, 250, 70, 0x27ae60).setInteractive({ useHandCursor: true });
        this.add.text(400, 400, 'INICIAR PARTIDA', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);

        startBtn.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        this.add.text(400, 550, 'WASD/Joystick para mover | ESC para Pausa', { fontSize: '16px', fill: '#888' }).setOrigin(0.5);
        createSettingsButton(this);
    }
}
