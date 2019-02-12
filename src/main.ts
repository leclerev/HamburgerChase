
class SimpleGame {

    constructor() {
        this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', { preload: this.preload, create: this.create, update: this.update });
    }

    game: Phaser.Game;
    scoreFont: Phaser.BitmapText;
    scoreValue: number;
    scoreText: string;
    player: Phaser.Sprite;
    cursor: Phaser.CursorKeys;
    hasTouchedGound;
    bmd: Phaser.BitmapData;
    floor: Phaser.Sprite;
    collider: Phaser.Group;
    playerHealth: number;
    coll1: Phaser.Sprite; coll2: Phaser.Sprite;
    isHit: boolean;
    waitImmort: number = 3;
    wait: number = 0;

    preload() {
        this.game.load.bitmapFont('gem', 'assets/font/gem.png', 'assets/font/gem.xml');
        this.game.load.spritesheet('dude', 'assets/sprites/dude.png', 32, 48);
    }

    create() {
        // INIT
        this.hasTouchedGound = false;
        this.playerHealth = 3;
        this.isHit = false;
        this.waitImmort = 3;
        this.wait = 0;


        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        this.collider = this.game.add.group();
        this.collider.enableBody = true

        this.scoreText = "Score: ";
        this.scoreValue = 0;

        this.game.time.desiredFps = 30;

        this.scoreFont = this.game.add.bitmapText(20, 20, 'gem', "", 34);

        this.player = this.game.add.sprite(350, 400, 'dude');
        this.player.anchor.x = 0.5;
        this.player.anchor.y = 0.5;
        this.game.physics.enable(this.player, Phaser.Physics.ARCADE);

        this.player.body.bounce.y = 0;
        this.player.body.collideWorldBounds = true;
        this.player.body.setSize(20, 32, 5, 16);

        this.player.animations.add('right', [5, 6, 7, 8], 10, true);
        this.player.animations.play('right');

        this.cursor = this.game.input.keyboard.createCursorKeys();
        
        this.bmd = this.game.add.bitmapData(800, 50);
        
        this.bmd.ctx.beginPath();
        this.bmd.ctx.rect(0, 0, 800, 50);
        this.bmd.ctx.fillStyle = '#ffff0f';
        this.bmd.ctx.fill();
        this.floor = this.game.add.sprite(0, 550, this.bmd);
        this.game.physics.enable(this.floor, Phaser.Physics.ARCADE);
        this.bmd.ctx.closePath();
        
        this.floor.body.immovable = true;
        this.floor.body.moves = false;
    }

    update() {
        if(!this.coll1) {
            this.bmd = this.game.add.bitmapData(50, 50);
            this.bmd.ctx.beginPath();
            this.bmd.ctx.rect(0, 0, 50, 50);
            this.bmd.ctx.fillStyle = '#ff0000';
            this.bmd.ctx.fill();
            this.coll1 = this.collider.create(800, 500, this.bmd);
            this.bmd.ctx.closePath();
            this.coll1.body.moves = false;
            this.coll1.body.checkCollision.left = false;
        } else {
            this.coll1.x-=5;
        }

        //Collisions
        var isGrounded = this.game.physics.arcade.collide(this.player, this.floor);
        var hasTouched = this.game.physics.arcade.collide(this.player, this.collider);

        if(hasTouched && this.wait < this.game.time.now/1000) {
            this.wait = this.game.time.now/1000 + this.waitImmort;
            this.player.x -= 100;
        }
        
        if(!this.hasTouchedGound)
            this.hasTouchedGound = true

        if (this.hasTouchedGound)
            this.scoreValue += 30;

        this.scoreFont.text = this.scoreText + Math.floor(this.scoreValue / 1000).toString();
        this.game.debug.text("Time:" + this.game.time.now/1000, 20, 100);

        if (this.cursor.up.isDown && isGrounded && this.game.physics.arcade.gravity.y <= 500) {
            this.player.body.velocity.y = -400;
        }

        if (this.cursor.down.isDown) {
            this.player.body.velocity.y = this.player.body.velocity.y < 0 ? 0 : this.player.body.velocity.y;
            this.game.physics.arcade.gravity.y = 2500;
        } else {
            this.game.physics.arcade.gravity.y = 500;
        }
    }

}

window.onload = () => {

    var game = new SimpleGame();

};