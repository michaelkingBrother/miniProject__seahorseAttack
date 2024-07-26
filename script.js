window.addEventListener('load', function(){
    // canvas setup
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d'); //or webgl for 3d

    canvas.width = 1500;
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
        }
        update(){
            this.x += this.speed; //add speed for bullet
            if (this.x > this.game.width * 0.8 ) this.makedForDeletion = true // set a flag to remove bullet if over 80% screen
        }
        draw(context){
            context.fillStyle = 'yellow';
            if(!this.makedForDeletion){
                context.fillRect(this.x, this.y, this.width, this.height); // draw bullet
            }
        }
    }
    class Particle {}
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
        }
        update(){
            if (this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed;
            else if (this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed;
            else if (this.game.keys.includes('ArrowLeft')) this.speedX = -this.maxSpeed;
            else if (this.game.keys.includes('ArrowRight')) this.speedX = this.maxSpeed;
            else {this.speedX = 0; this.speedY = 0}
            this.x += this.speedX;
            this.y += this.speedY;
            // hande player render
            (this.frameX < this.maxFrameX) ? this.frameX++ : this.frameX = 0;
            // handle projectiles
            this.projectiles.forEach(projectile => projectile.update()) // call update() on each bullet
            this.projectiles = this.projectiles.filter(projectile => !projectile.makedForDeletion)
        }
        draw(context){
            if(this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
            this.projectiles.forEach(projectile => projectile.draw(context)) // draw each buller on array
        }
        // player shoot bullet
        shootTop(){
            if(this.game.ammo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 30))
                this.game.ammo--
            }
        }
    }
    class Enemy {
        constructor(game){
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random() * -1.5 -0.5;
            this.makedForDeletion = false;
            this.lives = 5;
            this.score = this.lives;
        }
        update(){
            this.x += this.speedX;
            if (this.x + this.width < 0) this.makedForDeletion = true;
        }
        draw(context){
            context.fillStyle = 'red';
            context.fillRect(this.x, this.y, this.width, this.height);
            context.fillStyle = 'black';
            context.font = '20px Helvetica';
            context.fillText(this.lives, this.x, this.y);
        }
    }
    class Angular1 extends Enemy {
        constructor(game) {
            super(game);
            this.width = 228 * 0.2;
            this.height = 169 * 0.2;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
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
            this.fontFamily = 'Helveticle';
            this.color = 'white';
        }
        draw(context){
            context.save();
            // setup
            context.font = this.fontSize + 'px' + this.fontFamily;

            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = 'black';
            context.fillStyle= this.color;
                // draw core
                context.fillText("Score: " + this.game.score, 20, 40);
                // draw ammo
                for (let i = 0; i < this.game.ammo; i++) {
                    context.fillRect(20 + 5*i, 50, 4, 20);
                };
                // game timer
                context.fillText ('Timer: '+ (this.game.gameTime*0.001).toFixed(1), 20, 100);
                // game over message
                if(this.game.gameOver){
                    let message1;
                    let message2;
                    if(this.game.score > this.game.winningScore){
                        message1 = 'You Win!';
                        message2 = 'Well Done!';
                    } else{
                        message1 = 'You Lose!';
                        message2 = 'Try Again!';
                    };
                    this.fontSize = 50;
                    context.fillText(message1, this.game.width*0.5, this.game.height*0.5-40);
                    this.fontSize = 25;
                    context.fillText(message2, this.game.width*0.5, this.game.height*0.5+40);
                }
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
            this.enemyTimer = 0;
            this.enemyInterval = 1000; // time to call enemy 1s
            this.ammo = 20;
            this.maxAmmo = 50;
            this.ammoTimer = 0;
            this.ammoInterval = 500;
            this.gameOver = false;
            this.score = 0;
            this.winningScore = 10;
            this.gameTime = 0;
            this.timeLimit = 5000;
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
            this.player.update();
            // update ammo with deltaTime
            if(this.ammoTimer > this.ammoInterval) {
                if(this.ammo < this.maxAmmo) this.ammo++ ; this.ammoTimer = 0;
            } else {
                this.ammoTimer += deltaTime;
            };
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
                    if(this.checkCollision(this.player, enemy)){
                        enemy.makedForDeletion = true;
                    };
                    this.player.projectiles.forEach(
                        projectile => {
                            if(this.checkCollision(projectile, enemy)){
                                projectile.makedForDeletion = true;
                                enemy.lives--;
                                if(enemy.lives <= 0){
                                    enemy.makedForDeletion = true;
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
            this.player.draw(context);
            this.ui.draw(context);
            this.enemies.forEach(enemy => enemy.draw(context)); // draw each enemy
            this.background.layer4.draw(context); // draw layer 4 outermost
        }
        // push enemy to enemies []
        addEnemy(){
            this.enemies.push(new Angular1(this));
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