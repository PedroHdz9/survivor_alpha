class PauseMenu extends Phaser.Scene {
    constructor() { super('PauseMenu'); }
    create() {
        const w = 1280, h = 720;
        this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.7);
        this.add.text(w / 2, h * 0.2, 'PAUSA', { fontSize: '48px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5);
        const options = [
            { text: 'REANUDAR', color: 0x27ae60, cb: () => { this.scene.resume('GameScene'); this.scene.stop(); } },
            { text: 'OPCIONES', color: 0x3498db, cb: () => { this.scene.launch('OptionsMenu', { from: 'PauseMenu' }); this.scene.pause(); } },
            { text: 'SALIR', color: 0xe74c3c, cb: () => { this.scene.stop('GameScene'); this.scene.start('MainMenu'); } }
        ];
        options.forEach((opt, i) => {
            const y = (h * 0.4) + (i * 100);
            const btn = this.add.rectangle(w / 2, y, 220, 60, opt.color).setInteractive({ useHandCursor: true });
            this.add.text(w / 2, y, opt.text, { fontSize: '24px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5);
            btn.on('pointerdown', opt.cb);
        });
        this.input.keyboard.on('keydown-ESC', () => { this.scene.resume('GameScene'); this.scene.stop(); });
    }
}
