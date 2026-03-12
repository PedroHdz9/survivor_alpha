// --- FUNCIÓN ÚTIL: DIBUJAR ICONOS ---
function drawIconById(graphics, x, y, id, scale = 1) {
    graphics.clear();
    if (id === 'solar') {
        graphics.fillStyle(0xf1c40f, 1); graphics.fillCircle(x, y, 15 * scale);
        for (let i = 0; i < 8; i++) {
            const angle = i * (Math.PI / 4);
            graphics.lineStyle(3 * scale, 0xf1c40f);
            graphics.lineBetween(x + Math.cos(angle) * 18 * scale, y + Math.sin(angle) * 18 * scale, x + Math.cos(angle) * 26 * scale, y + Math.sin(angle) * 26 * scale);
        }
    } else if (id === 'aura') {
        graphics.fillStyle(0x3498db, 1); graphics.beginPath();
        graphics.moveTo(x - 15 * scale, y - 15 * scale); graphics.lineTo(x + 15 * scale, y - 15 * scale);
        graphics.lineTo(x + 15 * scale, y + 5 * scale); graphics.lineTo(x, y + 20 * scale);
        graphics.lineTo(x - 15 * scale, y + 5 * scale); graphics.closePath(); graphics.fillPath();
    } else if (id === 'double') {
        graphics.lineStyle(2 * scale, 0xffffff); graphics.strokeCircle(x, y, 20 * scale);
        graphics.lineStyle(1 * scale, 0xffffff); graphics.lineBetween(x - 25 * scale, y, x + 25 * scale, y);
        graphics.lineBetween(x, y - 25 * scale, x, y + 25 * scale);
        graphics.fillStyle(0xff3333, 1); graphics.fillCircle(x, y, 5 * scale);
    } else if (id === 'rico') {
        graphics.lineStyle(3 * scale, 0x2ecc71); graphics.beginPath();
        graphics.moveTo(x - 20 * scale, y + 10 * scale); graphics.lineTo(x, y - 10 * scale);
        graphics.lineTo(x + 20 * scale, y + 10 * scale); graphics.strokePath();
        graphics.fillStyle(0x2ecc71, 1); graphics.fillCircle(x + 20 * scale, y + 10 * scale, 5 * scale);
    } else if (id === 'damage') {
        graphics.fillStyle(0xe74c3c, 1); graphics.fillRect(x - 15 * scale, y - 5 * scale, 30 * scale, 10 * scale);
        graphics.fillRect(x - 5 * scale, y - 15 * scale, 10 * scale, 30 * scale);
    } else if (id === 'speed') {
        graphics.fillStyle(0x2ecc71, 1); graphics.beginPath();
        graphics.moveTo(x - 15 * scale, y); graphics.lineTo(x, y - 15 * scale); graphics.lineTo(x, y - 5 * scale);
        graphics.lineTo(x + 15 * scale, y - 5 * scale); graphics.lineTo(x + 15 * scale, y + 5 * scale);
        graphics.lineTo(x, y + 5 * scale); graphics.lineTo(x, y + 15 * scale); graphics.closePath(); graphics.fillPath();
    } else if (id === 'hp') {
        graphics.fillStyle(0xe74c3c, 1);
        graphics.fillCircle(x - 8 * scale, y - 8 * scale, 8 * scale); graphics.fillCircle(x + 8 * scale, y - 8 * scale, 8 * scale);
        graphics.fillRect(x - 16 * scale, y - 8 * scale, 32 * scale, 8 * scale);
        graphics.beginPath(); graphics.moveTo(x - 16 * scale, y); graphics.lineTo(x, y + 16 * scale); graphics.lineTo(x + 16 * scale, y); graphics.closePath(); graphics.fillPath();
    } else if (id === 'atkSpeed') {
        graphics.lineStyle(4 * scale, 0xf39c12);
        graphics.strokeCircle(x, y, 15 * scale);
        graphics.fillStyle(0xf39c12, 1);
        graphics.beginPath();
        graphics.moveTo(x, y - 10 * scale); graphics.lineTo(x + 10 * scale, y);
        graphics.lineTo(x, y + 10 * scale); graphics.closePath(); graphics.fillPath();
    }
}

function createSettingsButton(scene) {
    const w = 1280;
    const x = w - 50, y = 50;
    
    // Extraer los elementos del contenedor evita bugs de "hitbox" con cámaras que se mueven
    const circle = scene.add.circle(x, y, 25, 0x333333, 0.8)
        .setDepth(2000)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true });
        
    const graphics = scene.add.graphics()
        .setDepth(2000)
        .setScrollFactor(0);
        
    graphics.lineStyle(3, 0xffffff);
    graphics.strokeCircle(x, y, 10);
    for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        graphics.lineBetween(x + Math.cos(angle) * 10, y + Math.sin(angle) * 10, x + Math.cos(angle) * 16, y + Math.sin(angle) * 16);
    }

    const togglePause = () => {
        if (scene.scene.key === 'GameScene') {
            scene.scene.pause();
            scene.scene.launch('PauseMenu');
        }
        else if (scene.scene.key === 'MainMenu') { 
            scene.scene.start('OptionsMenu', { from: 'MainMenu' }); 
        }
    };
    
    circle.on('pointerdown', togglePause);
    circle.on('pointerover', () => circle.setFillStyle(0x555555));
    circle.on('pointerout', () => circle.setFillStyle(0x333333));
    
    return circle;
}
