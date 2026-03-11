class OptionsMenu extends Phaser.Scene {
    constructor() { super('OptionsMenu'); }
    init(data) { this.from = data.from || 'MainMenu'; }
    create() {
        this.add.rectangle(400, 300, 800, 600, 0x1a1a1a);
        this.add.text(400, 80, 'OPCIONES', { fontSize: '42px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5);
        const settingsKeys = ['sound', 'music', 'vibration'];
        const labels = ['SONIDO', 'MÚSICA', 'VIBRACIÓN'];
        settingsKeys.forEach((key, i) => {
            const y = 200 + (i * 80);
            this.add.text(250, y, labels[i], { fontSize: '24px', fill: '#fff' }).setOrigin(0, 0.5);
            if (key === 'music') {
                const sliderTx = 450;
                const sliderWidth = 200;
                const track = this.add.rectangle(sliderTx, y, sliderWidth, 10, 0x7f8c8d).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
                const fillWidth = (gameState.settings.music / 100) * sliderWidth;
                const fillTrack = this.add.rectangle(sliderTx, y, fillWidth, 10, 0x3498db).setOrigin(0, 0.5);
                const knob = this.add.circle(sliderTx + fillWidth, y, 12, 0xffffff).setInteractive({ useHandCursor: true });
                this.input.setDraggable(knob);
                
                const valueTxt = this.add.text(sliderTx + sliderWidth + 40, y, `${gameState.settings.music}%`, { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);

                const updateMusicVolume = (xPos) => {
                    let newX = Phaser.Math.Clamp(xPos, sliderTx, sliderTx + sliderWidth);
                    let percentage = (newX - sliderTx) / sliderWidth;
                    gameState.settings.music = Math.round(percentage * 100);
                    
                    knob.x = newX;
                    fillTrack.width = newX - sliderTx;
                    valueTxt.setText(`${gameState.settings.music}%`);

                    const bgm = this.sound.get('bgMusic');
                    if (bgm) {
                        bgm.setVolume(gameState.settings.music / 100);
                        if (gameState.settings.music > 0 && !bgm.isPlaying) {
                            bgm.play();
                        } else if (gameState.settings.music === 0 && bgm.isPlaying) {
                            bgm.stop();
                        }
                    }
                };

                track.on('pointerdown', (pointer) => updateMusicVolume(pointer.x));
                knob.on('drag', (pointer, dragX) => updateMusicVolume(dragX));
            } else {
                const toggleBg = this.add.rectangle(550, y, 100, 40, gameState.settings[key] ? 0x2ecc71 : 0x7f8c8d).setInteractive({ useHandCursor: true });
                const toggleTxt = this.add.text(550, y, gameState.settings[key] ? 'ON' : 'OFF', { fontSize: '18px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5);
                toggleBg.on('pointerdown', () => {
                    gameState.settings[key] = !gameState.settings[key];
                    toggleBg.setFillStyle(gameState.settings[key] ? 0x2ecc71 : 0x7f8c8d);
                    toggleTxt.setText(gameState.settings[key] ? 'ON' : 'OFF');
                });
            }
        });
        const backBtn = this.add.rectangle(400, 500, 200, 60, 0x34495e).setInteractive({ useHandCursor: true });
        this.add.text(400, 500, 'VOLVER', { fontSize: '24px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5);
        backBtn.on('pointerdown', () => {
            if (this.from === 'PauseMenu') { this.scene.resume('PauseMenu'); this.scene.stop(); }
            else { this.scene.start('MainMenu'); }
        });
    }
}
