var game;
var scoreFont;
var scoreValue;
var scoreText;
var player;
var isPlayerHit;
var cursor;
var holdJumpTime = 0;
var maxHoldJumpTime = 10;
var hasTouchedGound;
var bmd;
var floor;
var collider;
var bonusGroup;
var pattern;
var actualPattern;
var oldPatternNum;
var colls, hamburger;
var bonus;
var id = 0;
var isHit;
var waitImmort = 3;
var wait = 0;
var gameOver = false;
var gameTime = 1; // minutes
var actualTime = 0;
var blinkTime = 0;
var timeFont;
var timeText;
var SimpleGame = /** @class */ (function () {
    function SimpleGame() {
        game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', { preload: this.preload, create: this.create, update: this.update });
    }
    SimpleGame.prototype.preload = function () {
        game.load.bitmapFont('gem', './assets/font/gem.png', './assets/font/gem.xml');
        game.load.spritesheet('dude', './assets/sprites/dude.png', 32, 48);
    };
    SimpleGame.prototype.create = function () {
        // INIT
        hasTouchedGound = false;
        isHit = false;
        waitImmort = 3;
        wait = 0;
        colls = [];
        isPlayerHit = false;
        pattern =
            [
                [
                    [1000, 500],
                    [1200, 400],
                    [1400, 450],
                    [1300, 430]
                ],
                [
                    [1000, 510],
                    [1200, 500],
                    [1400, 400],
                    [1300, 430]
                ],
                [
                    [1000, 420],
                    [1200, 500],
                    [1400, 410],
                    [1300, 430]
                ],
                [
                    [1000, 450],
                    [1200, 510],
                    [1400, 500],
                    [1300, 430]
                ]
            ];
        console.log(pattern[0]);
        oldPatternNum = Math.floor(Math.random() * pattern.length);
        actualPattern = pattern[oldPatternNum];
        game.physics.setBoundsToWorld();
        game.physics.startSystem(Phaser.Physics.ARCADE);
        collider = game.add.group();
        collider.enableBody = true;
        collider.physicsBodyType = Phaser.Physics.ARCADE;
        bonusGroup = game.add.group();
        bonusGroup.enableBody = true;
        bonusGroup.physicsBodyType = Phaser.Physics.ARCADE;
        scoreText = "Score: ";
        scoreValue = 0;
        timeText = "Temps restant: ";
        game.time.desiredFps = 30;
        scoreFont = game.add.bitmapText(20, 20, 'gem', "", 34);
        timeFont = game.add.bitmapText(20, 50, 'gem', "", 34);
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
        colls.push(createCollider(actualPattern[0][0], actualPattern[0][1]));
        colls.push(createCollider(actualPattern[1][0], actualPattern[1][1]));
        colls.push(createCollider(actualPattern[2][0], actualPattern[2][1]));
        bonus = createBonus(actualPattern[3][0], actualPattern[3][1]);
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
        for (var i = 0; i < colls.length; i++) {
            colliderManager(colls[i], gameOver);
        }
        bonusManager(bonus, gameOver);
        //Collisions
        var isGrounded = game.physics.arcade.collide(player, floor);
        var hasTouched = game.physics.arcade.overlap(player, collider);
        var getBonus = game.physics.arcade.overlap(player, bonus);
        if (gameOver) {
            player.animations.stop();
        }
        else {
            actualTime += 30;
        }
        if (!hasTouchedGound)
            hasTouchedGound = true;
        if (hasTouched && !isPlayerHit && !gameOver) {
            isPlayerHit = true;
            wait = game.time.now / 1000 + waitImmort;
            blinkTime = 0;
            scoreValue -= 10000;
        }
        if (isPlayerHit) {
            playerBlink();
            if ((wait < game.time.now / 1000)) {
                isPlayerHit = false;
                player.alpha = 1;
            }
        }
        if (getBonus && !bonus.data.isTaken) {
            bonus.visible = false;
            scoreValue += 3000;
            bonus.data.isTaken = true;
        }
        scoreFont.text = scoreText + Math.floor(scoreValue / 1000).toString();
        var actualSeconds = Math.floor(60 - (actualTime / 1000) % 60);
        timeFont.text = timeText + Math.floor(gameTime - (actualTime / 1000) / 60).toString() + ":" + (actualSeconds < 10 ? "0" : "") + actualSeconds.toString();
        if (Math.floor(gameTime - (actualTime / 1000) / 60) == 0 && actualSeconds == 0)
            gameOver = true;
        if (cursor.up.isDown && (isGrounded || holdJumpTime < maxHoldJumpTime) && game.physics.arcade.gravity.y <= 500 && !gameOver) {
            if (holdJumpTime == 0)
                player.body.velocity.y = -300;
            else
                player.body.velocity.y -= 10;
            holdJumpTime++;
        }
        if (cursor.up.isUp)
            holdJumpTime = maxHoldJumpTime;
        if (isGrounded)
            holdJumpTime = 0;
        if (cursor.down.isDown && !gameOver) {
            player.body.velocity.y = player.body.velocity.y < 0 ? 0 : player.body.velocity.y;
            game.physics.arcade.gravity.y = 2500;
        }
        else if (!gameOver) {
            game.physics.arcade.gravity.y = 500;
        }
        else {
            game.physics.arcade.gravity.y = 0;
            player.body.velocity.y = 0;
        }
    };
    return SimpleGame;
}());
function playerBlink() {
    blinkTime++;
    if (blinkTime % 20 == 0 || blinkTime % 20 == 1 || blinkTime % 20 == 2 || blinkTime % 20 == 3)
        player.alpha = 0;
    else
        player.alpha = 1;
}
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
    collid.data.id = id;
    id++;
    return collid;
}
function willBonusBeCreated() {
    return Math.floor(Math.random() * 2) > 0;
}
function createBonus(startx, starty) {
    if (startx === void 0) { startx = 1000; }
    if (starty === void 0) { starty = 500; }
    var bon;
    bmd = game.add.bitmapData(50, 50);
    bmd.ctx.beginPath();
    bmd.ctx.rect(0, 0, 50, 50);
    bmd.ctx.fillStyle = '#00ff00';
    bmd.ctx.fill();
    bon = bonusGroup.create(startx, starty, bmd);
    bmd.ctx.closePath();
    bon.body.moves = false;
    bon.data.isTaken = false;
    if (!willBonusBeCreated()) {
        bon.visible = false;
        bon.data.isTaken = true;
    }
    return bon;
}
function getPattern() {
    var num = Math.floor(Math.random() * pattern.length);
    if (num == oldPatternNum)
        getPattern();
    else {
        actualPattern = pattern[num];
        oldPatternNum = num;
    }
}
function colliderManager(collid, isGameOver) {
    if (!isGameOver) {
        collid.x -= 10;
        if (player.x == collid.x + collid.width) {
            scoreValue += 1000;
        }
        if (collid.x <= -50) {
            if (collid.data.id == 0) {
                getPattern();
            }
            outOfBounds(collid);
        }
    }
}
function bonusManager(bonus, isGameOver) {
    if (!isGameOver) {
        bonus.x -= 10;
        if (bonus.x <= -50) {
            bonus.visible = true;
            bonus.data.isTaken = false;
            if (!willBonusBeCreated()) {
                bonus.visible = false;
                bonus.data.isTaken = true;
            }
            bonus.x = 800;
            bonus.y = actualPattern[3][1];
        }
    }
}
function outOfBounds(collider) {
    collider.x = 800;
    collider.y = actualPattern[collider.data.id][1];
}
window.onload = function () {
    var game = new SimpleGame();
};
