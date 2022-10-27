let gameScene = new Phaser.Scene('Game');

let config = {
    type: Phaser.AUTO,  //Phaser will decide how to render our game (WebGL or Canvas)
  width: 640, // game width
  height: 360, // game height
  scene: gameScene // our newly created scene
};

let game = new Phaser.Game(config);

gameScene.init = function() {
    this.playerSpeed = 1.5;
    this.enemyMaxY = 280;
    this.enemyMinY = 80;
};



gameScene.preload = function() {

    this.load.image('background', 'assets/background.png');
    this.load.image('player', 'assets/player.png');
    this.load.image('dragon', 'assets/dragon.png');
    this.load.image('treasure', 'assets/treasure.png');
  
};
   

gameScene.create = function() {
    let bg = this.add.sprite(0, 0, 'background');

    bg.setOrigin(0,0);

    this.player = this.add.sprite(40, this.sys.game.config.height / 2, 'player');
    // scale down
    this.player.setScale(0.5);

    this.treasure = this.add.sprite(this.sys.game.config.width - 80, this.sys.game.config.height / 2, 'treasure');
    this.treasure.setScale(0.6);

    this.enemies = this.add.group({
        key: 'dragon',
        repeat: 5,
        setXY: {
          x: 110,
          y: 100,
          stepX: 80,
          stepY: 20
        }
    });

    Phaser.Actions.ScaleXY(this.enemies.getChildren(), -0.5, -0.5);
    Phaser.Actions.Call(this.enemies.getChildren(), function(enemy) {
        enemy.speed = Math.random() * 2 + 1;
    }, this);

    this.isPlayerAlive = true;

    this.cameras.main.resetFX();
};

gameScene.update = function() {

    // only if the player is alive
    if (!this.isPlayerAlive) {
        return;
    }


    if (this.input.activePointer.isDown) {

        //player walks
        this.player.x += this.playerSpeed;
    }

    if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.treasure.getBounds())) {
        this.gameOver();
    }

    let enemies = this.enemies.getChildren();
    let numEnemies = enemies.length;
    for (let i = 0; i < numEnemies; i++) {
      // move enemies
      enemies[i].y += enemies[i].speed;
      // reverse movement if reached the edges
      if (enemies[i].y >= this.enemyMaxY && enemies[i].speed > 0) {
        enemies[i].speed *= -1;
      } else if (enemies[i].y <= this.enemyMinY && enemies[i].speed < 0) {
        enemies[i].speed *= -1;
      }

        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), enemies[i].getBounds())) {
            this.gameOver();
            break;
        }

    }


};

gameScene.gameOver = function() {
 
  // flag to set player is dead
  this.isPlayerAlive = false;
  // shake the camera
  this.cameras.main.shake(500);
  // fade camera
  this.time.delayedCall(250, function() {
    this.cameras.main.fade(250);
  }, [], this);
  // restart game
  this.time.delayedCall(500, function() {
    this.scene.restart();
  }, [], this);

};

