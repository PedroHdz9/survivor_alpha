class PauseMenu extends Phaser.Scene {
    constructor() { super('PauseMenu'); }
    create() {
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
        this.add.text(400, 120, 'PAUSA', { fontSize: '48px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5);
        const options = [
            { text: 'REANUDAR', color: 0x27ae60, cb: () => { this.scene.resume('GameScene'); this.scene.stop(); } },
            { text: 'OPCIONES', color: 0x3498db, cb: () => { this.scene.launch('OptionsMenu', { from: 'PauseMenu' }); this.scene.pause(); } },
            { text: 'SALIR', color: 0xe74c3c, cb: () => { this.scene.stop('GameScene'); this.scene.start('MainMenu'); } }
        ];
        options.forEach((opt, i) => {
            const y = 200 + (i * 100);
            const btn = this.add.rectangle(400, y, 220, 60, opt.color).setInteractive({ useHandCursor: true });
            this.add.text(400, y, opt.text, { fontSize: '24px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5);
            btn.on('pointerdown', opt.cb);
        });
        this.input.keyboard.on('keydown-ESC', () => { this.scene.resume('GameScene'); this.scene.stop(); });
    }
}
