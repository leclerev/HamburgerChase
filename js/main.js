var game;
var scoreFont;
var scoreValue;
var scoreText;
var player;
var cursor;
var hasTouchedGound;
var bmd;
var floor;
var collider;
var playerHealth;
var colls, hamburger;
var isHit;
var waitImmort = 3;
var wait = 0;
var SimpleGame = /** @class */ (function () {
    function SimpleGame() {
        game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', { preload: this.preload, create: this.create, update: this.update });
    }
    SimpleGame.prototype.preload = function () {
        game.load.bitmapFont('gem', 'assets/font/gem.png', 'assets/font/gem.xml');
        game.load.spritesheet('dude', 'assets/sprites/dude.png', 32, 48);
    };
    SimpleGame.prototype.create = function () {
        // INIT
        hasTouchedGound = false;
        playerHealth = 3;
        isHit = false;
        waitImmort = 3;
        wait = 0;
        colls = [];
        game.physics.setBoundsToWorld();
        game.physics.startSystem(Phaser.Physics.ARCADE);
        collider = game.add.group();
        collider.enableBody = true;
        collider.physicsBodyType = Phaser.Physics.ARCADE;
        scoreText = "Score: ";
        scoreValue = 0;
        game.time.desiredFps = 30;
        scoreFont = game.add.bitmapText(20, 20, 'gem', "", 34);
        player = game.add.sprite(350, 400, 'dude');
        player.anchor.x = 0.5;
        player.anchor.y = 0.5;
        game.physics.enable(player, Phaser.Physics.ARCADE);
        player.body.bounce.y = 0;
        player.body.collideWorldBounds = true;
        player.body.setSize(20, 32, 5, 16);
        player.animations.add('right', [5, 6, 7, 8], 10, true);
        player.animations.play('right');
        cursor = game.input.keyboard.createCursorKeys();
        bmd = game.add.bitmapData(800, 50);
        bmd.ctx.beginPath();
        bmd.ctx.rect(0, 0, 800, 50);
        bmd.ctx.fillStyle = '#ffff0f';
        bmd.ctx.fill();
        floor = game.add.sprite(0, 550, bmd);
        game.physics.enable(floor, Phaser.Physics.ARCADE);
        bmd.ctx.closePath();
        floor.body.immovable = true;
        floor.body.moves = false;
        // Collider creations
        colls.push(createCollider(1000, 500));
        colls.push(createCollider(1200, 400));
    };
    SimpleGame.prototype.update = function () {
        if (!hamburger) {
            bmd = game.add.bitmapData(50, 600);
            bmd.ctx.beginPath();
            bmd.ctx.rect(0, 0, 50, 600);
            bmd.ctx.fillStyle = '#ff0000';
            bmd.ctx.fill();
            hamburger = collider.create(0, 0, bmd);
            bmd.ctx.closePath();
            hamburger.body.moves = false;
        }
        var isDead = game.physics.arcade.collide(player, hamburger);
        colliderManager(colls[0], isDead);
        colliderManager(colls[1], isDead);
        //Collisions
        var isGrounded = game.physics.arcade.collide(player, floor);
        var hasTouched = game.physics.arcade.collide(player, collider);
        if (isDead) {
            player.tint = 5;
            player.animations.stop();
        }
        if (hasTouched && wait < game.time.now / 1000 && !isDead) {
            wait = game.time.now / 1000 + waitImmort;
            player.x -= 100;
        }
        if (!hasTouchedGound)
            hasTouchedGound = true;
        if (hasTouchedGound && !isDead)
            scoreValue += 30;
        scoreFont.text = scoreText + Math.floor(scoreValue / 1000).toString();
        //this.game.debug.text("Time:" + this.game.time.now/1000, 20, 100);
        if (cursor.up.isDown && isGrounded && game.physics.arcade.gravity.y <= 500) {
            player.body.velocity.y = -400;
        }
        if (cursor.down.isDown) {
            player.body.velocity.y = player.body.velocity.y < 0 ? 0 : player.body.velocity.y;
            game.physics.arcade.gravity.y = 2500;
        }
        else {
            game.physics.arcade.gravity.y = 500;
        }
    };
    return SimpleGame;
}());
function createCollider(startx, starty) {
    if (startx === void 0) { startx = 1000; }
    if (starty === void 0) { starty = 500; }
    var collid;
    bmd = game.add.bitmapData(50, 50);
    bmd.ctx.beginPath();
    bmd.ctx.rect(0, 0, 50, 50);
    bmd.ctx.fillStyle = '#ff0000';
    bmd.ctx.fill();
    collid = collider.create(startx, starty, bmd);
    bmd.ctx.closePath();
    collid.body.moves = false;
    collid.body.checkCollision.left = false;
    return collid;
}
function colliderManager(collid, isPlayerDead) {
    if (!isPlayerDead) {
        collid.x -= 5;
        if (collid.x <= -50)
            outOfBounds(collid);
    }
}
function outOfBounds(collider) {
    collider.x = 1000;
}
window.onload = function () {
    var game = new SimpleGame();
};
