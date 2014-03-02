/*
preload
This function is called first. It should contain code to handle the loading of assets needed by your game. I.e. game.load.image(), etc. Note: while 'preload' is running the game doesn't call the update or render functions, instead it calls 2 special functions (if they exist): loadUpdate and loadRender.
You don't have to put just loader specific code in the preload function. You could also do things like set the stage background color or scale modes. However to keep it clean and logical I would suggest you do limit it to just loading assets.
Note that you don't need to tell Phaser to start the load, it happens automatically.

loadUpdate
This is a special-case function that is only called while assets are preloading (as the standard update function is not). You could use it to do something like update a progress bar.

loadRender
Most likely not needed (especially not for WebGL games) but this is an optional special-case function that is called after update and should contain render specific code.

create
The create function is called automatically once the preload has finished. Equally if you don't actually load any assets at all or don't have a preload function then create is the first function called by Phaser. In here you can safely create sprites, particles and anything else you need that may use assets the preload will now have loaded for you. Typically this function would contain the bulk of your set-up code, creating game objects and the like.

update
The update (and render) functions are called every frame. So on a desktop that'd be around 60 time per second. In update this is where you'd do things like poll for input to move a player, check for object collision, etc. It's the heart of your game really.

render
The render function is called AFTER the WebGL/canvas render has taken place, so consider it the place to apply post-render effects or extra debug overlays. For example when building a game I will often put the game into CANVAS mode only and then use the render function to draw lots of debug info over the top of my game.
Once render has completed the frame is over and it returns to update again.
Note that you cannot use any of the above function names in your game other than for the use they were intended above. What I mean by that is you should consider them as being 'reserved' as game system only functions.
*/

var colors = [ 'yellow', 'red', 'green', 'blue', 'purple', 'gray' ];

var gameDiv = "game";
var game = new Phaser.Game($("#"+gameDiv).width(), $("#"+gameDiv).height(), Phaser.AUTO, gameDiv, { preload: preload, loadUpdate: loadUpdate, loadRender: loadRender, create: create/*, update: update, render: render*/ });

function preload() {
    game.load.image('circle', 'assets/sprites/circle.png');
    for(var i in colors) {
        game.load.image(colors[i]+'Dot', 'assets/sprites/'+colors[i]+'Dot.png');
    }
}

function loadUpdate() {
    //console.log("loadUpdate");
}

function loadRender() {
    //console.log("loadRender");
}

function create() {
    //  A simple background for our game
    game.add.sprite(0, 0, 'circle');
 
    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();
 
    // Here we create the ground.
    var ground = platforms.create(0, game.world.height - 64, 'yellowDot');
 
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(2, 2);
 
    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;
 
    //  Now let's create two ledges
    var ledge = platforms.create(400, 400, 'redDot');
    ledge.body.immovable = true;
 
    ledge = platforms.create(-150, 250, 'grayDot');
    ledge.body.immovable = true;
}

/*
function update() {
    console.log("update");
}

function render() {
    console.log("render");
}
*/