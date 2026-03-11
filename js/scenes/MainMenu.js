class MainMenu extends Phaser.Scene {
    constructor() { super('MainMenu'); }
    preload() {

        // Cargar musica
        const musicSource = 'assets/EndlessArcaneHunt.mp3';

        this.load.audio('bgMusic', musicSource);

        // Cargar los 8 sprites del jugador como "spritesheets"
        // AJUSTA frameWidth y frameHeight
        const frameWidth = 48;
        const frameHeight = 64;

        for (let i = 0; i < 8; i++) {
            this.load.spritesheet(`player_dir_${i}`, `assets/player_${i}.png`, {
                frameWidth: frameWidth,
                frameHeight: frameHeight
            });
        }

        // Cargar el spritesheet de Idle 
        this.load.spritesheet('player_idle', 'assets/player_idle.png', {
            frameWidth: frameWidth,
            frameHeight: frameHeight
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
