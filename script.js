window.addEventListener('load', function(){
    // canvas setup
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d'); //or webgl for 3d

    canvas.width = 700;
    canvas.height = 500;

    class InputHandler {
        constructor(game){
            this.game = game;
            window.addEventListener('keydown', e => {
                if((e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')
                    && !this.game.keys.includes(e.key)) {
                        this.game.keys.push(e.key) //save key to game.keys [] in class Game
                }
                else if(e.key === ' ') this.game.player.shootTop(); // set key to shooting bullet
                else if(e.key === 'b') this.game.debug = !this.game.debug; // swith debug mode
            })
            // window.addEventListener('keyup', e => this.game.keys.splice(e.key)) // remove key to game.key[] if key up
            window.addEventListener('keyup', e => {
                this.game.keys.splice(this.game.keys.indexOf(e.key), 1) // remove key to game.key[] if key up
            })
        }
    }
    class Projectile {
        constructor(game, x, y){
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 10;
            this.height = 3;
            this.speed = 3;
            this.makedForDeletion = false;
            this.image = document.getElementById('projectile');
        }
        update(){
            this.x += this.speed; //add speed for bullet
            if (this.x > this.game.width ) this.makedForDeletion = true // set a flag to remove bullet if over screen
        }
        draw(context){
            context.drawImage(this.image, this.x, this.y); // draw bullet
        }
    }
    class Particle {
        constructor(game, x, y){
            this.game = game;
            this.x = x;
            this.y = y;
            this.image = document.getElementById('gears');
            this.frameX = Math.floor(Math.random() * 3); // case sprite is 9 x 9
            this.frameY = Math.floor(Math.random() * 3);
            // resize gears random
            this.spriteSize = 50; // default site of gears
            this.sizeModifile = Math.random()*0.5 + 0.5;
            this.size = this.spriteSize * this.sizeModifile // resize gears
            // gravity fall effect
            this.speedX = Math.random() * 6 - 3; // gears fall to left or right enemy obj
            this.speedY = Math.random() * -15 ; // gear fly up
            this.gravity = 0.5; // ctrol fall effect;
            // flag for delete gears
            this.makedForDeletion = false;
            // for gears turn
            this.radian = 0;
            this.radianVal = Math.random() * 0.2 - 0.1; // random radian each frame
            // bounce effect
            this.bounced = 0; // bounce control state
            this.bottomBounceBoundary = Math.random() * 80 - 60 // vitrual bounce boundary
        }
        update(){
            this.speedY += this.gravity; // gravity fall effect
            this.x -= this.speedX + this.game.speed;
            this.y += this.speedY;
            this.radian += this.radianVal; // randome radian effect
            // bounce if collision with vitrual bottom
            if(this.y > this.game.height - this.bottomBounceBoundary && this.bounced < 2) {
                this.bounced++;
                this.speedY *= -0.7;
            }
            if(this.y > this.game.height || this.x < 0 - this.size) this.makedForDeletion = true
        }
        draw(context){
            context.save();
                context.translate(this.x, this.y);
                context.rotate(this.radian);
                context.drawImage(this.image, this.spriteSize * this.frameX, this.spriteSize * this.frameY, this.spriteSize, this.spriteSize, this.size * -0.5, this.size * -0.5, this.size, this.size);
            context.restore();
        }
    }
    class Player {
        constructor(game){
            this.game = game;
            this.width = 120;
            this.height = 190;
            this.x = 20;
            this.y = 100;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrameX = 37;
            this.speedX = 0;
            this.speedY = 0;
            this.maxSpeed = 2;
            this.projectiles = [];
            this.image = document.getElementById('player');
            this.powerUp = false; // swith to powerup stage
            this.powerUpTimer = 0;
            this.powerUpLimit = 10000;
        }
        update(deltaTime){
            if (this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed;
            else if (this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed;
            else if (this.game.keys.includes('ArrowLeft')) this.speedX = -this.maxSpeed;
            else if (this.game.keys.includes('ArrowRight')) this.speedX = this.maxSpeed;
            else {this.speedX = 0; this.speedY = 0}
            this.x += this.speedX;
            this.y += this.speedY;
            // hande player render
            (this.frameX < this.maxFrameX) ? this.frameX++ : this.frameX = 0;
            //vertical boundaries
            if(this.y > this.game.height - this.height * 0.5) this.y = this.game.height - this.height * 0.5 ; // bottom vertical is 1/2 player height
            else if (this.y < -this.height * 0.5) this.y = -this.height * 0.5;
            // handle projectiles
            this.projectiles.forEach(projectile => projectile.update()) // call update() on each bullet
            this.projectiles = this.projectiles.filter(projectile => !projectile.makedForDeletion)
            //power Up
            if(this.powerUp){
                if(this.powerUpTimer > this.powerUpLimit) {
                    this.powerUp = false;
                    this.powerUpTimer = 0;
                    this.frameY = 0;
                } else {
                    this.powerUpTimer += deltaTime;
                    this.frameY = 1;
                    this.game.ammo += 0.1; // fast ammo return
                }
            }
        }
        draw(context){
            if(this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            this.projectiles.forEach(projectile => projectile.draw(context)) // draw each buller on array
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        // player shoot bullet
        shootTop(){
            if(this.game.ammo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 30))
                this.game.ammo--
            };
            if(this.powerUp) this.shootBottom();
        }
        shootBottom(){
            if(this.game.ammo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 175))
            }
        }
        enterPowerUp(){
            this.powerUpTimer= 0; // reset timer if collision second enemy
            this.powerUp = true;
            if(this.game.ammo < this.game.maxAmmo) this.game.ammo = this.game.maxAmmo // reset full ammo;
        }
    }
    class Enemy {
        constructor(game){
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random() * -1.5 -0.5;
            this.makedForDeletion = false;
            this.frameX = 0;
            this.frameY=0;
            this.maxFrameX = 37;
        }
        update(){
            this.x += this.speedX - this.game.speed; // add game speed for control
            if (this.x + this.width < 0) this.makedForDeletion = true;
            // enemy animation
            (this.frameX < this.maxFrameX) ? this.frameX++ : this.frameX = 0;
        }
        draw(context){
            // debug mode
            if(this.game.debug) {
                context.strokeRect(this.x, this.y, this.width, this.height);
                context.fillStyle = 'black';
                // context.font = '20px Helvetica';
                context.fillText(this.lives, this.x, this.y);
            };
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height)
        }
    }
    class Angular1 extends Enemy {
        constructor(game) {
            super(game);
            this.width = 228;
            this.height = 169;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById('angler1');
            this.frameY = Math.floor(Math.random() * 3); // casuse sprite sheet have 3 row
            this.lives = 2;
            this.score = this.lives;
        }
    }
    // second enemy - Night Angler enemy class
    class Angular2 extends Enemy {
        constructor(game) {
            super(game);
            this.width = 213;
            this.height = 165;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById('angler2');
            this.frameY = Math.floor(Math.random() * 2); // casuse sprite sheet have 3 row
            this.lives = 3;
            this.score = this.lives;
        }
    }
    // third enemy - Lucky Fish enemy class
    class LuckyFish extends Enemy {
        constructor(game) {
            super(game);
            this.width = 99;
            this.height = 95;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById('lucky');
            this.frameY = Math.floor(Math.random() * 2); // casuse sprite sheet have 2 row
            this.lives = 3;
            this.score = 15;
            this.type = 'lucky';
            this.speedX = Math.random() * -8 - 2;
        }
    }
    // fourth enemy - hiveWhale fish enemy class
    class HiveWhale extends Enemy {
        constructor(game) {
            super(game);
            this.width = 400;
            this.height = 227;
            this.y = Math.random() * (this.game.height - this.height);
            this.image = document.getElementById('hivewhale');
            this.frameY = 0;
            this.lives = 15;
            this.score = this.lives;
            this.type = 'hive';
            this.speedX = Math.random() * -1.2 - 0.2; // rewrite enemy speed
        }
    }
    // fifth eneme - drone fish enemy class
    class Drone extends Enemy{
        constructor(game, x, y){
            super(game);
            this.x = x;
            this.y = y;
            this.width = 115;
            this.height = 95;
            this.frameY = Math.floor(Math.random() * 2);
            this.image = document.getElementById('drone');
            this.lives = 3;
            this.score = this.lives;
            this.speedX = Math.random() * -6 - 0.5;
        }
    }
    // handle logic for render layer on game
    class Layer {
        constructor(game, image, speedModifier){
            this.game = game;
            this.image = image;
            this.speedModifier = speedModifier;
            this.width = 1768;
            this.height = 500;
            this.x = 0;
            this.y = 0;
        };
        update(){
            if (this.x <= -this.width) this.x = 0; // if img move out left screen => reset x position
            this.x -= this.game.speed * this.speedModifier; // move speed depends game speed and speedModifier (its speed) to create paralax and easy control
        };
        draw(context){
            context.drawImage(this.image, this.x, this.y);
            context.drawImage(this.image, this.x + this.width, this.y); // joint two layers together to create a seemless feel smooth
        };
    }
    // handle draw Background layer
    class Background {
        constructor(game){
            this.game = game;
            this.image1 = document.getElementById('layer1');
            this.image2 = document.getElementById('layer2');
            this.image3 = document.getElementById('layer3');
            this.image4 = document.getElementById('layer4');
            this.layer1 = new Layer(game, this.image1, 0.2); // init Layer Objet for draw Background
            this.layer2 = new Layer(game, this.image2, 0.4);
            this.layer3 = new Layer(game, this.image3, 1);
            this.layer4 = new Layer(game, this.image4, 1.5);

            this.layers = [this.layer1, this.layer2, this.layer3]; // draw multilayer on layers []
        };
        update(){
            this.layers.forEach(layer => layer.update());
        };
        draw(context){
            this.layers.forEach(layer => layer.draw(context));
        };
    }
    class UI {
        constructor(game){
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = 'Bangers';
            this.color = 'white';
        }
        draw(context){
            context.save();
                // setup
                context.fillStyle= this.color;
                context.shadowOffsetX = 2;
                context.shadowOffsetY = 2;
                context.shadowColor = 'black';
                context.font = this.fontSize + 'px ' + this.fontFamily;
                // draw core
                context.fillText("Score: " + this.game.score, 20, 40);
                // game timer
                context.fillText ('Timer: '+ (this.game.gameTime*0.001).toFixed(1), 20, 100);
                // game over message
                if(this.game.gameOver){
                    let message1;
                    let message2;
                    if(this.game.score > this.game.winningScore){
                        message1 = 'Most Wonderous!';
                        message2 = 'Well Done Explorer!';
                    } else{
                        message1 = 'Blazes!';
                        message2 = 'Get My repair kit and Try Again!';
                    };
                    context.textAlign = 'center';
                    context.font = '70px ' + this.fontFamily;
                    context.fillText(message1, this.game.width*0.5, this.game.height*0.5-20);
                    context.font = '25px '+this.fontFamily;
                    context.fillText(message2, this.game.width*0.5, this.game.height*0.5+20);
                    context.font = '15px '+this.fontFamily;
                    context.fillText('t r u n g  h o', this.game.width*0.6, this.game.height*0.5+45);
                };
                // draw ammo
                if(this.game.player.powerUp) context.fillStyle = "yellow" ;
                for (let i = 0; i < this.game.ammo; i++) {
                    context.fillRect(20 + 5*i, 50, 4, 20);
                };
            context.restore();
        }
    }
    class Game {
        constructor(width, height){
            this.width = width;
            this.height = height;
            this.background = new Background(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.keys = [];
            this.enemies = [];
            this.particles = [];
            this.drones = [];
            this.enemyTimer = 0;
            this.enemyInterval = 1000; // time to call enemy 1s
            this.ammo = 20;
            this.maxAmmo = 50;
            this.ammoTimer = 0;
            this.ammoInterval = 500;
            this.gameOver = false;
            this.score = 0;
            this.winningScore = 1000;
            this.gameTime = 0;
            this.timeLimit = 15000;
            this.speed = 1;
            this.debug = false;
        }
        // update obj with deltaTime
        update(deltaTime){
            // update game timmer
            if(!this.gameOver) this.gameTime += deltaTime;
            if(this.gameTime > this.timeLimit) this.gameOver = true;
            this.background.update();
            this.background.layer4.update();
            this.player.update(deltaTime); // update player for power up time
            // update ammo with deltaTime
            if(this.ammoTimer > this.ammoInterval) {
                if(this.ammo < this.maxAmmo) this.ammo++ ; this.ammoTimer = 0;
            } else {
                this.ammoTimer += deltaTime;
            };
            // update particle
            this.particles.forEach(particle => particle.update());
            this.particles = this.particles.filter(particle => !particle.makedForDeletion);
            // update enemy with deltaTime
            if(this.enemyTimer > this.enemyInterval && !this.gameOver) {
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += deltaTime;
            };
            this.enemies.forEach(
                enemy => {
                    enemy.update();
                    // check collision of player and enemy
                    if(this.checkCollision(this.player, enemy)){
                        enemy.makedForDeletion = true;
                        // particle fall effect
                        for (let i = 0; i < enemy.score; i++) {
                            this.particles.push( new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                        }
                        // check type of enemy
                        enemy.type === 'lucky' ? this.player.enterPowerUp() : this.score -= enemy.score;
                    };
                    // check collision of projectile and enemy
                    this.player.projectiles.forEach(
                        projectile => {
                            if(this.checkCollision(projectile, enemy)){
                                projectile.makedForDeletion = true;
                                enemy.lives--;
                                // particle fall effect
                                this.particles.push( new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                                if(enemy.lives <= 0){
                                    enemy.makedForDeletion = true;
                                    // particle fall effect
                                    for (let i = 0; i < enemy.score; i++) {
                                        this.particles.push( new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                                    }
                                    // call drone affter hivewhile die
                                    if(enemy.type === 'hive') {
                                        for (let i = 0; i < 5; i++) {
                                            this.enemies.push(new Drone(this, enemy.x + Math.random() * enemy.width, enemy.y + Math.random() * enemy.height));
                                        }
                                    };
                                    // game score
                                    if(!this.gameOver) this.score += enemy.score;
                                    if(this.score > this.winningScore) this.gameOver = true;
                                }
                            }
                        }
                    )
                }
            );
            this.enemies = this.enemies.filter(enemy => !enemy.makedForDeletion) // rewrite the enemise for loop

        }
        draw(context){
            this.background.draw(context);
            this.ui.draw(context);
            this.player.draw(context);
            this.enemies.forEach(enemy => enemy.draw(context)); // draw each enemy
            this.particles.forEach(particle => particle.draw(context)); // draw each particle
            this.background.layer4.draw(context); // draw layer 4 outermost
        }
        // push enemy to enemies []
        addEnemy(){
            const randomize = Math.random();
            // if(randomize < 0.5) this.enemies.push(new Angular1(this));
            // else if(randomize < 0.7) this.enemies.push(new Angular2(this));
            // else if(randomize < 0.9) this.enemies.push(new HiveWhale(this));
            // else this.enemies.push(new LuckyFish(this));
            switch (true) {
                case (randomize < 0.5):
                    this.enemies.push(new Angular1(this));
                    break;
                case (randomize < 0.8):
                    this.enemies.push(new Angular2(this));
                    break;
                case (randomize < 0.9):
                    this.enemies.push(new HiveWhale(this));
                    break;
                default:
                    this.enemies.push(new LuckyFish(this));
                    break;
            }
        }
        // collision check
        checkCollision(rect1, rect2){
            return(
                rect1.x < rect2.x + rect2.width
                && rect2.x < rect1.x + rect1.width
                && rect1.y < rect2.y + rect2.height
                && rect2.y < rect1.y + rect1.height
            )
        }
    }

    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0 ;
    // animation loop
    function animate(timeStamp){ // with timeStamp get form requestAnimationFrame()
        const deltaTime =  timeStamp - lastTime; // time bettwen each animation loop
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height) // clear all canvas draw before render new player
        game.update(deltaTime);
        game.draw(ctx); // draw player into canvas
        requestAnimationFrame(animate); // browser will loop fn animate before render new frame
    };
    animate(0); // with pass 0 to first time timeStamp
    // ht - end game
});