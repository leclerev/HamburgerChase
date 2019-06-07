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
//var floor: Phaser.Sprite;
var collider;
var bonusGroup;
var ground;
var pattern;
var actualPattern;
var actualBonus;
var oldPatternNum;
var groundILast;
var colls, floor;
var bonuses;
var id = 0;
var idBonus = 0;
var isHit;
var waitImmort = 3;
var wait = 0;
var gameOver = false;
var gameTime = 1; // minutes
var actualTime = 0;
var blinkTime = 0;
var timeFont;
var timeText;
var Bonus;
(function (Bonus) {
    Bonus[Bonus["Aubergine"] = 0] = "Aubergine";
    Bonus[Bonus["Banane"] = 1] = "Banane";
    Bonus[Bonus["Brocolie"] = 2] = "Brocolie";
    Bonus[Bonus["Carotte"] = 3] = "Carotte";
    Bonus[Bonus["Cerises"] = 4] = "Cerises";
    Bonus[Bonus["Choux"] = 5] = "Choux";
    Bonus[Bonus["Orange"] = 6] = "Orange";
    Bonus[Bonus["Fraise"] = 7] = "Fraise";
    Bonus[Bonus["Pasteque"] = 8] = "Pasteque";
    Bonus[Bonus["Pomme"] = 9] = "Pomme";
    Bonus[Bonus["Tomate"] = 10] = "Tomate";
})(Bonus || (Bonus = {}));
var Malus;
(function (Malus) {
    Malus[Malus["Donut"] = 0] = "Donut";
    Malus[Malus["DonutAlt"] = 1] = "DonutAlt";
    Malus[Malus["Frites"] = 2] = "Frites";
    Malus[Malus["Glace"] = 3] = "Glace";
    Malus[Malus["Hamburger"] = 4] = "Hamburger";
    Malus[Malus["HotDog"] = 5] = "HotDog";
    Malus[Malus["Pizza"] = 6] = "Pizza";
    Malus[Malus["Sandwich"] = 7] = "Sandwich";
    Malus[Malus["Sucette"] = 8] = "Sucette";
    Malus[Malus["SucetteAlt"] = 9] = "SucetteAlt";
    Malus[Malus["SucreDOrge"] = 10] = "SucreDOrge";
})(Malus || (Malus = {}));
var MainGame = /** @class */ (function () {
    function MainGame() {
        game = new Phaser.Game(800, 600, Phaser.AUTO, 'content');
        var allOptions;
        var selectedOption;
        var selectionFont;
        var keys;
        var nameChars = Array();
        var highscores;
        game.state.add("menu", {
            preload: function () {
                game.load.bitmapFont('gem', './assets/font/gem.png', './assets/font/gem.xml');
                game.load.spritesheet('dude', './assets/sprites/dude.png', 32, 48);
                game.load.spritesheet('bonus', './assets/sprites/bonussheet.png', 32, 32, 11);
                game.load.spritesheet('malus', './assets/sprites/malussheet.png', 32, 32, 11);
                game.load.image('ground', './assets/sprites/ground.png');
                game.load.json('pattern', "json/pattern.json");
                // HIGHSCORE ITEMS
                var highscoresStr = localStorage.getItem("highscores");
                if (!highscoresStr) {
                    localStorage.setItem("highscores", JSON.stringify([
                        { "name": "DOE", "score": 990 },
                        { "name": "JOE", "score": 950 },
                        { "name": "VVV", "score": 975 },
                        { "name": "AAA", "score": 945 },
                        { "name": "AZE", "score": 1100 }
                    ]));
                    highscores = JSON.parse(localStorage.getItem("highscores"));
                }
                else
                    highscores = JSON.parse(highscoresStr);
                sortHighScore();
                cursor = game.input.keyboard.createCursorKeys();
            },
            create: function () {
                game.stage.backgroundColor = "#000000";
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
                var creditFont = game.add.bitmapText(game.world.centerX, 450, 'gem', "", 30);
                creditFont.text = "Created by InProgress";
                creditFont.x = game.world.centerX - creditFont.textWidth / 2;
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
                        case 1:
                            game.state.start("highscore");
                            break;
                    }
                }
            }
        });
        game.state.add("play", {
            /*preload: function() {
            },*/
            create: function () {
                game.stage.backgroundColor = "#1A1C4A";
                // INIT
                holdJumpTime = 0;
                maxHoldJumpTime = 10;
                id = 0;
                idBonus = 0;
                gameOver = false;
                gameTime = 1; // minutes
                actualTime = 0;
                blinkTime = 0;
                hasTouchedGound = false;
                isHit = false;
                waitImmort = 3;
                wait = 0;
                colls = [];
                floor = [];
                bonuses = [];
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
                ground = game.add.group();
                ground.enableBody = true;
                ground.physicsBodyType = Phaser.Physics.ARCADE;
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
                for (var i = 0; i <= 800 / game.cache.getImage("ground").width + 1; i++) {
                    floor[i] = game.add.sprite(game.cache.getImage("ground").width * i, 550, "ground");
                    ground.add(floor[i]);
                    floor[i].body.immovable = true;
                    floor[i].body.moves = false;
                    floor[i].height = 50;
                    groundILast = i;
                }
                game.physics.enable(floor, Phaser.Physics.ARCADE);
                // ------------------------
                // Collider creations
                for (var i = 0; i < actualPattern.length; i++) {
                    colls.push(createCollider(actualPattern[i][0], actualPattern[i][1]));
                }
                for (var i = 0; i < actualBonus.length; i++)
                    bonuses.push(createBonus(actualBonus[i][0], actualBonus[i][1]));
                game.world.bringToTop(collider);
                game.world.bringToTop(floor);
                game.world.bringToTop(player);
                game.world.bringToTop(scoreFont);
                game.world.bringToTop(timeFont);
                function createCollider(startx, starty) {
                    if (startx === void 0) { startx = 1000; }
                    if (starty === void 0) { starty = 500; }
                    var collid;
                    collid = collider.create(startx, starty, "malus", game.rnd.integerInRange(0, 10));
                    collid.body.moves = false;
                    collid.body.setSize(50, 50);
                    collid.data.id = id;
                    collid.data.hasPassed = false;
                    id++;
                    return collid;
                }
                function createBonus(startx, starty) {
                    if (startx === void 0) { startx = 1000; }
                    if (starty === void 0) { starty = 500; }
                    var bon;
                    bon = bonusGroup.create(startx, starty, "bonus", game.rnd.integerInRange(0, 10));
                    bon.body.moves = false;
                    bon.data.isTaken = false;
                    bon.body.setSize(50, 50);
                    bon.data.id = idBonus;
                    idBonus++;
                    return bon;
                }
            },
            update: function () {
                //Floor movement
                for (var i = 0; i < floor.length; i++) {
                    floor[i].x -= 10;
                    if (floor[i].x + floor[i].width <= 0) {
                        floor[i].x = floor[groundILast].x + floor[groundILast].width;
                        if (i == 0)
                            floor[i].x -= 10;
                        groundILast = i;
                    }
                }
                for (var i = 0; i < colls.length; i++) {
                    colliderManager(colls[i], gameOver);
                }
                for (var i = 0; i < bonuses.length; i++)
                    bonusManager(bonuses[i], gameOver);
                //Collisions
                var isGrounded = game.physics.arcade.collide(player, floor);
                var hasTouched = game.physics.arcade.overlap(player, collider);
                game.physics.arcade.overlap(player, bonusGroup, bonusCollisionHandler);
                if (gameOver) {
                    player.animations.stop();
                    game.state.start("enterHS");
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
                    scoreValue -= 20;
                }
                if (isPlayerHit) {
                    playerBlink();
                    if ((wait < game.time.now / 1000)) {
                        isPlayerHit = false;
                        player.alpha = 1;
                    }
                }
                scoreFont.text = scoreText + scoreValue.toString();
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
                function bonusCollisionHandler(player, bonus) {
                    if (!bonus.data.isTaken && bonus.visible && Math.abs((player.x + player.width) - bonus.x) < 50) {
                        bonus.visible = false;
                        scoreValue += 15;
                        bonus.data.isTaken = true;
                    }
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
                        if (player.x <= collid.x + collid.width && player.x >= collid.x && !collid.data.hasPassed) {
                            scoreValue += 10;
                            collid.data.hasPassed = true;
                        }
                        if (collid.x <= -50) {
                            if (collid.data.id == 0) {
                                getPattern();
                            }
                            collid.x = 800;
                            collid.y = actualPattern[collid.data.id][1];
                            collid.data.hasPassed = false;
                            var rnd = game.rnd.integerInRange(0, 10);
                            collid.loadTexture("malus", rnd);
                        }
                    }
                }
                function bonusManager(bonus, isGameOver) {
                    if (!isGameOver) {
                        bonus.x -= 10;
                        if (bonus.x <= -50) {
                            bonus.loadTexture("bonus", game.rnd.integerInRange(0, 10));
                            bonus.x = 800;
                            bonus.y = actualBonus[bonus.data.id][1];
                            bonus.data.isTaken = false;
                            bonus.visible = true;
                        }
                    }
                }
            }
        });
        /* game.state.add("endAnimation", {

        });*/
        var x = 33, y = 243;
        var graphics;
        var indexName = 0;
        game.state.add("enterHS", {
            create: function () {
                game.stage.backgroundColor = "#000000";
                keys = game.input.keyboard.addKeys({ "space": Phaser.Keyboard.SPACEBAR });
                var menuFont = game.add.bitmapText(game.world.centerX, 40, 'gem', "", 50);
                var menuText = "Your score: " + scoreValue;
                menuFont.text = menuText;
                menuFont.x = game.world.centerX - menuFont.textWidth / 2;
                var indexChar = 0;
                for (var i = 0; i < 3; i++) {
                    var letterFont = game.add.bitmapText(i * 120 + 250, 200, 'gem', "", 40);
                    letterFont.text = "_";
                    nameChars[i] = letterFont;
                }
                for (var i = 0; i < 2; i++) {
                    for (var j = 0; j < 13; j++) {
                        var letterFont = game.add.bitmapText(j * 40 + 140, (i + 1) * 40 + 300, 'gem', "", 40);
                        letterFont.text = String.fromCharCode(indexChar + 97);
                        indexChar++;
                    }
                }
                graphics = game.add.graphics(100, 100);
            },
            update: function () {
                graphics.lineStyle(2, 0xFFFFFF, 1);
                var rect = graphics.drawRect(x, y, 35, 40);
                if (cursor.up.justDown) {
                    if (rect.y > 100)
                        rect.y -= 40;
                    else
                        rect.y = 140;
                }
                if (cursor.down.justDown) {
                    if (rect.y < 140)
                        rect.y += 40;
                    else
                        rect.y = 100;
                }
                if (cursor.left.justDown) {
                    if (rect.x > 100)
                        rect.x -= 40;
                    else
                        rect.x = 580;
                }
                if (cursor.right.justDown) {
                    if (rect.x < 580)
                        rect.x += 40;
                    else
                        rect.x = 100;
                }
                if (keys.space.justDown) {
                    var indexX = (rect.x - 100) / 40, indexY = (rect.y - 100) / 40;
                    nameChars[indexName].text = String.fromCharCode(indexX + (indexY * 13) + 97).toUpperCase();
                    if (indexName < 2)
                        indexName++;
                    else {
                        game.state.start("highscore");
                        var enteredHS_1 = { "name": "", "score": scoreValue };
                        nameChars.forEach(function (char) { enteredHS_1.name += char.text; });
                        var minHSValue = highscores[highscores.length - 1].score;
                        console.log(minHSValue);
                        if (enteredHS_1.score > minHSValue) {
                            highscores.splice(4, 1, enteredHS_1);
                            sortHighScore();
                            localStorage.setItem("highscores", JSON.stringify(highscores));
                        }
                    }
                }
            }
        });
        game.state.add("highscore", {
            create: function () {
                console.log(highscores);
                keys = game.input.keyboard.addKeys({ "enter": Phaser.Keyboard.ENTER, "space": Phaser.Keyboard.SPACEBAR });
                var menuFont = game.add.bitmapText(game.world.centerX, 40, 'gem', "", 51);
                menuFont.text = "Highscore";
                menuFont.x = game.world.centerX - menuFont.textWidth / 2;
                var pScoreFont = game.add.bitmapText(game.world.centerX, 100, 'gem', "", 50);
                pScoreFont.text = scoreValue != undefined ? "Your score: " + scoreValue : "";
                pScoreFont.x = game.world.centerX - pScoreFont.textWidth / 2;
                // Order highscore by score
                sortHighScore();
                var highscoreFonts = [];
                highscores.forEach(function (highscore, i) {
                    highscoreFonts[i] = game.add.bitmapText(20, 180 + 50 * i, 'gem', "", 45);
                    highscoreFonts[i].text = (i + 1) + ": " + highscore.name + " " + highscore.score;
                    highscoreFonts[i].x = game.world.centerX - menuFont.textWidth / 2 - 15;
                });
            },
            update: function () {
                if (keys.enter.justDown || keys.space.justDown) {
                    game.state.start("menu");
                }
            }
        });
        // INITIAL GAME STATE
        game.state.start("menu");
        function sortHighScore() {
            highscores.sort(function (a, b) { return (a.score < b.score) ? 1 : -1; });
        }
    }
    return MainGame;
}());
