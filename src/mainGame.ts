var game: Phaser.Game;

var scoreFont: Phaser.BitmapText;
var scoreValue: number;
var scoreText: string;

var player: Phaser.Sprite;
var isPlayerHit: boolean;

var cursor: Phaser.CursorKeys;
var holdJumpTime: number = 0;
var maxHoldJumpTime: number = 10;

var hasTouchedGound: boolean;

var bmd: Phaser.BitmapData;
var floor: Phaser.Sprite;
var collider: Phaser.Group;
var bonusGroup: Phaser.Group;
var pattern: any;
var actualPattern: number[][];
var actualBonus: number[];
var oldPatternNum: number;

var colls: Array<Phaser.Sprite>;
var bonuses: Array<Phaser.Sprite>;
var id = 0;
var idBonus = 0;
var isHit: boolean;
var waitImmort: number = 3;

var wait: number = 0;

var gameOver: boolean = false;
var gameTime: number = 1; // minutes
var actualTime: number = 0;
var blinkTime: number = 0;
var timeFont: Phaser.BitmapText;
var timeText: string;

enum Bonus {
    Aubergine,
    Banane,
    Brocolie,
    Carotte,
    Cerises,
    Choux,
    Orange,
    Fraise,
    Pasteque,
    Pomme,
    Tomate
}

enum Malus {
    Donut,
    DonutAlt,
    Frites,
    Glace,
    Hamburger,
    HotDog,
    Pizza,
    Sandwich,
    Sucette,
    SucetteAlt,
    SucreDOrge
}

class MainGame {

    constructor() {
        game = new Phaser.Game(800, 600, Phaser.AUTO, 'content');

        var allOptions: Phaser.BitmapText[];

        var selectedOption: number;
        var selectionFont: Phaser.BitmapText;

        var keys: any;

        var nameChars = Array<Phaser.BitmapText>();

        game.state.add("menu", {
            preload: function() {
                game.load.bitmapFont('gem', './assets/font/gem.png', './assets/font/gem.xml');                
                game.load.spritesheet('dude', './assets/sprites/dude.png', 32, 48);
                game.load.spritesheet('bonus', './assets/sprites/bonussheet.png', 32, 32, 11);
                game.load.spritesheet('malus', './assets/sprites/malussheet.png', 32, 32, 11);
        
                game.load.json('pattern', "json/pattern.json");
        
                cursor = game.input.keyboard.createCursorKeys();
            },

            create: function() {
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
                testFont.text = "Lalilulelo";
                testFont.x = game.world.centerX - menuFont.textWidth / 2;

                allOptions.push(testFont);

                selectionFont = game.add.bitmapText(game.world.centerX, 40, 'gem', "", 30);
                selectionFont.text = "->";
                selectionFont.x = game.world.centerX - menuFont.textWidth / 2 - 50;

                /*let bonus = game.add.sprite(10, 10, "bonus", Bonus.Banane);
                let malus = game.add.sprite(50, 10, "malus", Malus.Sandwich);*/

                keys = game.input.keyboard.addKeys({"enter": Phaser.Keyboard.ENTER, "space": Phaser.Keyboard.SPACEBAR});
            },

            update: function() {

                if(cursor.up.justDown) {
                    selectedOption--;
                    if(selectedOption < 0)
                        selectedOption = allOptions.length - 1;
                }

                if(cursor.down.justDown) {
                    selectedOption++;
                    if(selectedOption > allOptions.length - 1)
                        selectedOption = 0;
                }

                selectionFont.y = allOptions[selectedOption].y;

                if(keys.enter.justDown || keys.space.justDown) {
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
        
            create: function() {
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
                // ------------------------

        
                // Collider creations
                for(let i = 0; i < actualPattern.length; i++) {
                    colls.push(createCollider(actualPattern[i][0], actualPattern[i][1]));
                }
        
                for(let i = 0; i < actualBonus.length; i++)
                    bonuses.push(createBonus(actualBonus[i][0], actualBonus[i][1]));
                
                game.world.bringToTop(collider);
                game.world.bringToTop(floor);
                game.world.bringToTop(player);
                game.world.bringToTop(scoreFont);
                game.world.bringToTop(timeFont);

                function createCollider(startx: number = 1000, starty: number = 500) {
                    let collid: Phaser.Sprite;

                    collid = collider.create(startx, starty, "malus", game.rnd.integerInRange(0, 10));
                    
                    collid.body.moves = false;
                    collid.body.setSize(50, 50);
                    collid.data.id = id;
                    collid.data.hasPassed = false;
                    id++;
                    
                    return collid
                }

                function createBonus(startx: number = 1000, starty: number = 500) {
                    let bon: Phaser.Sprite;
                    
                    bon = bonusGroup.create(startx, starty, "bonus", game.rnd.integerInRange(0, 10));
                
                    bon.body.moves = false;
                    bon.data.isTaken = false;
                    bon.body.setSize(50, 50);
                    bon.data.id = idBonus;
                    idBonus++;
                    
                    return bon;
                }
            },
        
            update: function() {        
                for(let i = 0; i < colls.length; i++) {
                    colliderManager(colls[i], gameOver);
                }
        
                for(let i = 0; i < bonuses.length; i++)
                    bonusManager(bonuses[i], gameOver);
        
                //Collisions
                var isGrounded = game.physics.arcade.collide(player, floor);

                var hasTouched = game.physics.arcade.overlap(player, collider);

                game.physics.arcade.overlap(player, bonusGroup, bonusCollisionHandler);
        
                if(gameOver) {
                    player.animations.stop();
                    
                    game.state.start("enterHS");
                } else {
                    actualTime += game.time.desiredFps;
                }
                
                if(!hasTouchedGound)
                    hasTouchedGound = true;
                    
                if(hasTouched && !isPlayerHit && !gameOver) {
                    isPlayerHit = true;
                    wait = game.time.now/1000 + waitImmort;
                    blinkTime = 0;
                    scoreValue -= 50;
                }
        
                if(isPlayerHit) {
                    playerBlink();
                    if((wait < game.time.now/1000)) {
                        isPlayerHit = false;
                        player.alpha = 1;
                    }
                }
        
                scoreFont.text = scoreText + scoreValue.toString();
                let actualSeconds: number = Math.floor(60 - (actualTime / 1000) % 60);
                timeFont.text = timeText + Math.floor(gameTime - (actualTime / 1000) / 60).toString() + ":" + (actualSeconds < 10 ? "0" : "") + actualSeconds.toString();
                if(Math.floor(gameTime - (actualTime / 1000) / 60) == 0 && actualSeconds == 0)
                    gameOver = true;
        
                if (cursor.up.isDown && (isGrounded || holdJumpTime < maxHoldJumpTime) && game.physics.arcade.gravity.y <= 500 && !gameOver) {
                    if(holdJumpTime == 0)
                        player.body.velocity.y = -300;
                    else
                        player.body.velocity.y -= 10;
                    holdJumpTime++;
                }
        
                if(cursor.up.isUp)
                    holdJumpTime = maxHoldJumpTime;
        
                if(isGrounded)
                    holdJumpTime = 0;
        
                if (cursor.down.isDown && !gameOver) {
                    player.body.velocity.y = player.body.velocity.y < 0 ? 0 : player.body.velocity.y;
                    game.physics.arcade.gravity.y = 2500;
                } else if (!gameOver) {
                    game.physics.arcade.gravity.y = 500;
                } else {
                    game.physics.arcade.gravity.y = 0;
                    player.body.velocity.y = 0;
                }

                function bonusCollisionHandler(player, bonus) {
                    if(!bonus.data.isTaken && bonus.visible) {
                        bonus.visible = false;
                        scoreValue += 15;
                        bonus.data.isTaken = true;
                    }
                }

                function playerBlink() {
                    blinkTime++;
                    if(blinkTime % 20 == 0 || blinkTime % 20 == 1 || blinkTime % 20 == 2|| blinkTime % 20 == 3)
                        player.alpha = 0;
                    else
                        player.alpha = 1;
                }
                
                function getPattern() {
                    let num = Math.floor(Math.random() * pattern.patterns.length);
                    if(num == oldPatternNum) getPattern();
                    else {
                        actualPattern = pattern.patterns[num].malus;
                        actualBonus = pattern.patterns[num].bonus;
                        oldPatternNum = num;
                    }
                }
                
                function colliderManager(collid: Phaser.Sprite, isGameOver: boolean) {
                    if(!isGameOver) {
                        collid.x-=10;
                        if(player.x <= collid.x + collid.width && player.x >= collid.x && !collid.data.hasPassed) {
                            scoreValue += 10;
                            collid.data.hasPassed = true;
                        }
                        if(collid.x <= -50) {
                            if(collid.data.id == 0) {
                                getPattern();
                            }
                            collid.x = 800;
                            collid.y = actualPattern[collid.data.id][1];
                            collid.data.hasPassed = false;

                            let rnd = game.rnd.integerInRange(0, 10);
                            collid.loadTexture("malus", rnd);
                        }
                    }
                }
                
                function bonusManager(bonus: Phaser.Sprite, isGameOver: boolean) {
                    if(!isGameOver) {
                        bonus.x-=10;
                        if(bonus.x <= -50) {
                            bonus.loadTexture("bonus", game.rnd.integerInRange(0, 10));
                            let newBonus = bonus;
                            newBonus.x = 800;
                            newBonus.y = actualBonus[bonus.data.id][1];
                            newBonus.visible = true;
                            newBonus.data.isTaken = false;
                            bonus = newBonus;
                            console.log("Bonus: " + bonus.data.id + " v: " + bonus.visible + " x: " + bonus.x + " y: " + bonus.y);
                            console.log(bonus);
                        }
                    }
                }
            }
                        
        });

        /* game.state.add("endAnimation", {

        });*/
        let x = 33, y = 243;
        var graphics: Phaser.Graphics;

        let indexName = 0;

        game.state.add("enterHS", {
            create: function() {
                keys = game.input.keyboard.addKeys({"space": Phaser.Keyboard.SPACEBAR});

                var menuFont = game.add.bitmapText(game.world.centerX, 40, 'gem', "", 50);
                var menuText = "Your score: " + scoreValue;
                menuFont.text = menuText;
                menuFont.x = game.world.centerX - menuFont.textWidth / 2;

                let indexChar = 0;

                for(let i = 0; i < 3; i++)
                {
                    let letterFont = game.add.bitmapText(i * 120 + 250, 200, 'gem', "", 40);
                    letterFont.text = "_";
                    nameChars[i] = letterFont;
                }

                for(let i = 0; i < 2; i++)
                {
                    for(let j = 0; j < 13; j++)
                    {
                        let letterFont = game.add.bitmapText(j * 40 + 140, (i+1) * 40 + 300, 'gem', "", 40);
                        letterFont.text = String.fromCharCode(indexChar+97);
                        indexChar++;
                    }
                }

                graphics = game.add.graphics(100, 100);
            }, 

            update: function() {
                graphics.lineStyle(2, 0xFFFFFF, 1);
                var rect = graphics.drawRect(x, y, 35, 40);

                if(cursor.up.justDown) {
                    if(rect.y > 100)
                        rect.y -= 40;
                    else
                        rect.y = 140;
                }
                if(cursor.down.justDown) {
                    if(rect.y < 140)
                        rect.y += 40;
                    else
                        rect.y = 100;
                }
                if(cursor.left.justDown) {
                    if(rect.x > 100)
                        rect.x -= 40;
                    else
                        rect.x = 580;
                }
                if(cursor.right.justDown) {
                    if(rect.x < 580)
                        rect.x += 40;
                    else
                        rect.x = 100;
                }

                if(keys.space.justDown) {
                    let indexX = (rect.x - 100) / 40, indexY = (rect.y - 100) / 40;
                    nameChars[indexName].text = String.fromCharCode(indexX + (indexY * 13) + 97).toUpperCase();
                    if(indexName < 2)
                        indexName++;
                    else
                        game.state.start("highscore");
                }
            }
        });

        game.state.add("highscore", {
            create: function() {
                keys = game.input.keyboard.addKeys({"enter": Phaser.Keyboard.ENTER, "space": Phaser.Keyboard.SPACEBAR});

                var menuFont = game.add.bitmapText(game.world.centerX, 40, 'gem', "", 50);
                var menuText = "Your score: " + scoreValue;
                menuFont.text = menuText;
                menuFont.x = game.world.centerX - menuFont.textWidth / 2;
            },

            update: function(){
                if(keys.enter.justDown || keys.space.justDown) {
                    game.state.start("menu");
                }
            }
        });

        // INITIAL GAME STATE
        game.state.start("menu");
    }

}