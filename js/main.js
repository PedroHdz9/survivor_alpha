const config = {
    type: Phaser.AUTO, width: 800, height: 600, parent: 'game-container',
    physics: { default: 'arcade', arcade: { gravity: { y: 0 } } },
    scene: [MainMenu, GameScene, SpecialAbilityScene, PauseMenu, OptionsMenu]
};
new Phaser.Game(config);
