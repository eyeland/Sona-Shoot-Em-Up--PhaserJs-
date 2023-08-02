// Game.js
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.enemyCounter = 0;
    }


    preload() {
        // Load your assets here (e.g., player sprite, background, etc.)
        this.load.image('background', '0.png');
        this.load.image('sona', 'sona.png')
        this.load.image('enemy', 'enemy-mumu.png');
        this.load.image('bullet', 'rocket.png');
    }

    create() {
        // Call the custom resize function initially to set up the game size
        this.resizeGame();

        // Set up a listener for the window resize event
        window.addEventListener('resize', this.resizeGame.bind(this));
        // Add game elements to the scene


        this.player = this.add.sprite(this.sys.game.config.width * 0.5, this.sys.game.config.height * 0.8, 'sona')
        this.player.setScale(0.2)
        this.player.setDepth(1)
        // Enable physics for the player (assuming Arcade Physics)
        this.physics.world.enable(this.player);
        this.player.body.setCircle(430, 80, 0)

        this.cursors = this.input.keyboard.createCursorKeys();
        // Create the scrolling background
        this.background = this.add.tileSprite(0, 0, this.sys.game.config.width, this.sys.game.config.height, 'background');
        this.background.setOrigin(0, 0);

        // Slow scrolling speed (change this value to adjust the speed)
        this.scrollSpeed = 1;

        // Create an enemy group to hold all enemy instances
        this.enemies = this.physics.add.group();

        // Set up an enemy shooting timer
        this.shootingTimer = this.time.addEvent({
            delay: 5500, // Adjust this value to control the shooting interval (in milliseconds)
            callback: this.enemyShoot,
            callbackScope: this,
            loop: true, // Set to true to make the timer repeat indefinitely
        });


    }

    resizeGame() {
        // Calculate the actual width and height of the game canvas based on the device's screen size
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // Update the game canvas size to fit the screen
        this.sys.game.config.width = screenWidth;
        this.sys.game.config.height = screenHeight;
        this.sys.game.renderer.resize(screenWidth, screenHeight);

        // Update the game camera to fit the resized canvas
        this.cameras.main.setViewport(0, 0, screenWidth, screenHeight);

        // Resize the game world to fit the new canvas size
        this.physics.world.setBounds(0, 0, screenWidth, screenHeight);

        // Calculate the aspect ratio of the game
        const gameAspectRatio = this.sys.game.config.width / this.sys.game.config.height;

        // Calculate the target width and height of the game canvas to fit the screen while maintaining the aspect ratio
        let gameWidth, gameHeight;

        if (screenWidth / screenHeight > gameAspectRatio) {
            // If the screen width is wider, fit the game width to the screen width
            gameWidth = screenWidth;
            gameHeight = screenWidth / gameAspectRatio;
        } else {
            // If the screen height is taller, fit the game height to the screen height
            gameHeight = screenHeight;
            gameWidth = screenHeight * gameAspectRatio;
        }

        // Resize the game canvas to fit the calculated dimensions
        this.sys.game.config.width = gameWidth;
        this.sys.game.config.height = gameHeight;
        this.sys.game.renderer.resize(gameWidth, gameHeight);
    }

    update() {
        // Player movement logic
        const playerSpeed = 5;
        const leftRightSpeed = playerSpeed * (this.cursors.left.isDown ? -1 : this.cursors.right.isDown ? 1 : 0);
        const upDownSpeed = playerSpeed * (this.cursors.up.isDown ? -1 : this.cursors.down.isDown ? 1 : 0);

        // Update player position
        this.player.x += leftRightSpeed;
        this.player.y += upDownSpeed;

        // Prevent player from moving out of the screen
        const halfPlayerWidth = 15; // Half of the player's width (30/2)
        const halfPlayerHeight = 15; // Half of the player's height (30/2)
        const minX = halfPlayerWidth;
        console.log(minX)
        const minY = halfPlayerHeight;
        const maxX = (this.sys.game.config.width) - halfPlayerWidth;
        const maxY = (this.sys.game.config.height) - halfPlayerHeight;

        this.player.x = Phaser.Math.Clamp(this.player.x, minX, maxX);
        this.player.y = Phaser.Math.Clamp(this.player.y, minY, maxY);

        // Scroll the background from top to bottom
        this.background.tilePositionY -= this.scrollSpeed;

    }

    enemyShoot() {
        // Stop creating new enemies if the enemy counter reaches three
        if (this.enemyCounter >= 3) {
            return;
        }

        // Increment the enemy counter
        this.enemyCounter++;
        // Create an enemy sprite at a random position on the screen
        const enemyX = Phaser.Math.Between(50, this.sys.game.config.width - 50);
        const enemyY = Phaser.Math.Between(50, this.sys.game.config.height - 50);
        const enemy = this.enemies.create(enemyX, enemyY, 'enemy');
        enemy.setScale(0.3);

        // Enable physics for the enemy (assuming Arcade Physics)
        this.physics.world.enable(enemy);
        enemy.body.setCircle(20); // Set the enemy's hitbox

        // Enemy AI: Track the player and shoot bullets at the player's position
        const angleToPlayer = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        const angleOffset = Phaser.Math.DegToRad(105); // Adjust the offset angle as needed
        const bulletSpeed = 200; // Adjust bullet speed as needed

        // Calculate the adjusted rotation for the bullet
        const adjustedRotation = angleToPlayer + angleOffset;

        // Shoot a bullet in the direction of the player
        const bullet = this.physics.add.sprite(enemy.x, enemy.y, 'bullet');
        bullet.setScale(0.08)
        console.log(angleToPlayer)
        bullet.rotation = adjustedRotation;
        this.physics.moveTo(bullet, this.player.x, this.player.y, bulletSpeed);

        // Set up a timer to continuously shoot bullets at the player
        this.time.addEvent({
            delay: 1000, // Adjust this value to control the interval between bullets (in milliseconds)
            callback: () => {
                // Shoot a new bullet at the player's position
                const newBullet = this.physics.add.sprite(enemy.x, enemy.y, 'bullet');
                newBullet.setScale(0.08)
                newBullet.rotation = adjustedRotation;
                this.physics.moveTo(newBullet, this.player.x, this.player.y, bulletSpeed);
            },
            callbackScope: this,
            repeat: -1, // Repeat indefinitely
        });
    }
}



const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: GameScene,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true,
        },
    },
};

const game = new Phaser.Game(config);
