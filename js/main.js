const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 1280, // Resolución base HD
    height: 720,
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT, // Mantiene la proporción y se adapta al máximo espacio
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    pixelArt: false,
    antialias: true,
    physics: { default: 'arcade', arcade: { gravity: { y: 0 } } },
    fps: { target: 60, forceSetTimeOut: true },
    disableContextMenu: true,
    autoFocus: true,
    pauseOnBlur: false, // Evita que se congele al minimizar
    scene: [MainMenu, GameScene, SpecialAbilityScene, PauseMenu, OptionsMenu]
};
const game = new Phaser.Game(config);
