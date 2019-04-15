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
var actualBonus;
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
var MainGame = /** @class */ (function () {
    function MainGame() {
        game = new Phaser.Game(800, 600, Phaser.AUTO, 'content');
        var allOptions;
        var selectedOption;
        var selectionFont;
        var keys;
        game.state.add("menu", {
            preload: function () {
                game.load.bitmapFont('gem', './assets/font/gem.png', './assets/font/gem.xml');
                game.load.spritesheet('dude', './assets/sprites/dude.png', 32, 48);
                game.load.json('pattern', "json/pattern.json");
                cursor = game.input.keyboard.createCursorKeys();
            },
            create: function () {
                allOptions = [];
                selectedOption = 0;
                var menuFont = game.add.bitmapText(game.world.centerX, 40, 'gem', "", 50);
                var menuText = "Hamburger Chase";
                menuFont.text = menuText;
                menuFont.x = game.world.centerX - menuFont.textWidth / 2;
                var playFont = game.add.bitmapText(game.world.centerX, 300, 'gem', "", 30);
                playFont.text = "Play";
                playFont.x = game.world.centerX - menuFont.textWidth / 2;
                allOptions.push(playFont);
                var highScoreFont = game.add.bitmapText(game.world.centerX, 350, 'gem', "", 30);
                highScoreFont.text = "Highscore";
                highScoreFont.x = game.world.centerX - menuFont.textWidth / 2;
                allOptions.push(highScoreFont);
                var testFont = game.add.bitmapText(game.world.centerX, 400, 'gem', "", 30);
                testFont.text = "Laliloulelo";
                testFont.x = game.world.centerX - menuFont.textWidth / 2;
                allOptions.push(testFont);
                selectionFont = game.add.bitmapText(game.world.centerX, 40, 'gem', "", 30);
                selectionFont.text = "->";
                selectionFont.x = game.world.centerX - menuFont.textWidth / 2 - 50;
                keys = game.input.keyboard.addKeys({ "enter": Phaser.Keyboard.ENTER, "space": Phaser.Keyboard.SPACEBAR });
            },
            update: function () {
                if (cursor.up.justDown) {
                    selectedOption--;
                    if (selectedOption < 0)
                        selectedOption = allOptions.length - 1;
                }
                if (cursor.down.justDown) {
                    selectedOption++;
                    if (selectedOption > allOptions.length - 1)
                        selectedOption = 0;
                }
                selectionFont.y = allOptions[selectedOption].y;
                if (keys.enter.justDown || keys.space.justDown) {
                    switch (selectedOption) {
                        case 0:
                            game.state.start("play");
                            break;
                    }
                }
            }
        });
        game.state.add("play", {
            /*preload: function() {
            },*/
            create: function () {
                // INIT
                holdJumpTime = 0;
                maxHoldJumpTime = 10;
                id = 0;
                gameOver = false;
                gameTime = 1; // minutes
                actualTime = 0;
                blinkTime = 0;
                hasTouchedGound = false;
                isHit = false;
                waitImmort = 3;
                wait = 0;
                colls = [];
                isPlayerHit = false;
                pattern = game.cache.getJSON("pattern", true);
                oldPatternNum = Math.floor(Math.random() * pattern.patterns.length);
                actualPattern = pattern.patterns[oldPatternNum].malus;
                actualBonus = pattern.patterns[oldPatternNum].bonus;
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
                //cursor = game.input.keyboard.createCursorKeys();
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
                // --------HAMBURGER-------
                bmd = game.add.bitmapData(50, 600);
                bmd.ctx.beginPath();
                bmd.ctx.rect(0, 0, 50, 600);
                bmd.ctx.fillStyle = '#ff0000';
                bmd.ctx.fill();
                hamburger = collider.create(0, 0, bmd);
                bmd.ctx.closePath();
                hamburger.body.moves = false;
                // ------------------------
                // Collider creations
                for (var i = 0; i < actualPattern.length; i++) {
                    colls.push(createCollider(actualPattern[i][0], actualPattern[i][1]));
                }
                bonus = createBonus(actualBonus[0], actualBonus[1]);
                game.world.bringToTop(collider);
                game.world.bringToTop(floor);
                game.world.bringToTop(player);
                game.world.bringToTop(scoreFont);
                game.world.bringToTop(timeFont);
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
            },
            update: function () {
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
                    game.state.start("menu");
                }
                else {
                    actualTime += game.time.desiredFps;
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
                if (getBonus && !bonus.data.isTaken && bonus.visible) {
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
                function playerBlink() {
                    blinkTime++;
                    if (blinkTime % 20 == 0 || blinkTime % 20 == 1 || blinkTime % 20 == 2 || blinkTime % 20 == 3)
                        player.alpha = 0;
                    else
                        player.alpha = 1;
                }
                function getPattern() {
                    var num = Math.floor(Math.random() * pattern.patterns.length);
                    if (num == oldPatternNum)
                        getPattern();
                    else {
                        actualPattern = pattern.patterns[num].malus;
                        actualBonus = pattern.patterns[num].bonus;
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
                            collid.x = actualPattern[collid.data.id][0] - (200 * (collid.data.id + 1));
                            collid.y = actualPattern[collid.data.id][1];
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
                            bonus.y = actualBonus[1];
                        }
                    }
                }
            }
        });
        /* game.state.add("endAnimation", {

        });*/
        /* game.state.add("enterHS", {

        });*/
        /* game.state.add("highscore", {

        });*/
        // INITIAL GAME STATE
        game.state.start("menu");
    }
    return MainGame;
}());
function willBonusBeCreated() {
    return Math.floor(Math.random() * 2) > 0;
}
