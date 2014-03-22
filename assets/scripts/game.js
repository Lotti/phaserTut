var debug = false;
var gameDiv = "game";
var basketColors = ['basket','basketgreen','basketred'];
var colors = ['yellow','red','green','blue','purple','grey'];
var dots;
var dotCG;
var circle;
var circleCG;
var baskets;
var basketCG;
var fps;
var points;
var started = false;

var gameWidth = parseInt(document.getElementById("game").offsetWidth);
var gameHeight = parseInt(document.getElementById("game").offsetHeight);

var game = new Phaser.Game(gameWidth, gameHeight, debug ? Phaser.CANVAS : Phaser.AUTO, 'game', { preload: preload, loadUpdate: loadUpdate, loadRender: loadRender, create: create, update: update, render: render });

function preload() {
	game.load.image('circle', 'assets/sprites/cd.png');	
	for(var i in colors) {
		game.load.image(colors[i]+'Dot', 'assets/sprites/'+colors[i]+'Dot.png');
	}
	for(var i in basketColors) {
		game.load.image(basketColors[i],'assets/sprites/'+basketColors[i]+'.png');
	}
	game.load.physics('physicsBasket', 'assets/physics/basket.json');
}

function loadUpdate() {
	//console.log("loadUpdate");
}

function loadRender() {
	//console.log("loadRender");
}

function create() {		
	if (debug) {
		game.time.advancedTiming = true;
		fps = game.add.text(2.5, 2.5, '', { font: '30px Verdana', fill: '#FFFFFF', align: 'left' });
		fps.update = function () {
			fps.setText(game.time.fps+' fps');
		}
	}
	
	game.time.advancedTiming = true;
	points = game.add.text(game.world.width-5, 2.5, '0 points', { font: '30px Verdana', fill: '#FFFFFF', align: 'left' });
	points.p = 0;
	points.update = function () {
		points.pivot.x = points.width;
		points.pivot.y = 0;		
		points.setText(points.p+' points');
	}		
	
	game.physics.startSystem(Phaser.Physics.P2JS);
	game.physics.p2.setImpactEvents(true); //Turn on impact events for the world, without this we get no collision callbacks
	game.physics.p2.gravity.y = 200;

	//circle
	circleCG = game.physics.p2.createCollisionGroup();
	
	circle = game.add.sprite(300, 20, 'circle');
	circle.collidedWith = [];
	circle.name = 'circle';
	circle.anchor.setTo(0.5,0.5);
	circle.scale.setTo(0.3,0.3);
	game.physics.p2.enable(circle, debug);
	circle.body.data.gravityScale = 1;
	circle.body.setCircle(circle.width * .5);
	circle.body.damping = 0.2; //velocity lost per second
	circle.body.mass = 1;
	circle.body.setCollisionGroup(circleCG);
	circle.body.data.motionState = 2; //circle.body.static = true;
	circle.body.collideWorldBounds = true;
		
	//dots
	dotCG = game.physics.p2.createCollisionGroup();		

	var rows = 11;
	var cols = 21;
	var startX = -1;
	var startX2 = 29;
	var startY = 90;
	var spaceX = 50;
	var spaceY = 45;
	dots = game.add.group();
	dots.name = 'dots';
	for(var i=0; i<cols; i++) {
		for(var j=0; j<rows; j++) {
			if (j%2==0) {
				offsetX = startX;
			}
			else {
				offsetX = spaceX*0.5;
			}

			var dot = dots.create(i*spaceX+offsetX, j*spaceY+startY, colors[game.rnd.integerInRange(0,colors.length-1)]+'Dot');
			dot.row = j+1; //ad-hoc variable
			dot.name = ((j+1)*i)+'dot';
			dot.anchor.setTo(0.5,0.5);
			dot.scale.setTo(0.4,0.4);
			game.physics.p2.enable(dot, debug);
			dot.body.setCircle(dot.width * .5);
			dot.body.mass = 100;
			dot.body.setCollisionGroup(dotCG);				
			dot.body.data.motionState = 2; //dot.body.static = true;
			dot.body.collides(circleCG); //now it works!
		}
	}

	circle.body.collides(dotCG, function(circleBody,otherBody) {
		if (circle.collidedWith.indexOf(otherBody) == -1) {
			circle.collidedWith.push(otherBody);
			var row = otherBody.sprite.row;
			switch(otherBody.sprite.key) {
				default:
					points.p+=row;
				break;
				case 'greyDot':
					points.p-=row;
				break;				
			}
		}
	});
	
	//baskets
	startX = 50;
	startY = game.world.height-35;
	spaceX = 92.5;
	var basketNumber = 11;
	
	basketCG = game.physics.p2.createCollisionGroup();	
	
	baskets = game.add.group();
	baskets.name = 'baskets';	
	for(var i=0; i<basketNumber; i++) {
		var basket = baskets.create(i*spaceX+startX, startY, basketColors[game.rnd.integerInRange(0,basketColors.length-1)]);
		basket.name = (i+1)+'basket';
		basket.anchor.setTo(0.5,1.0);
		basket.scale.setTo(0.75,0.75);
		game.physics.p2.enable(basket, debug);
		basket.body.clearShapes();
		basket.body.loadPolygon('physicsBasket','scaledBasket');
		basket.body.mass = 100;
		basket.body.setCollisionGroup(basketCG);
		basket.body.data.motionState = 2; //basket.body.static = true;
		basket.body.collides(circleCG);
	}
	
	circle.body.collides(basketCG, function(circleBody, otherBody) {
		if (circle.collidedWith.indexOf(otherBody) == -1) {
			circle.collidedWith.push(otherBody);
			switch(otherBody.sprite.key) {
				case 'basketgreen':
					points.p=Math.round(parseInt(points.p)*1.5);
				break;				
				case 'basketred':
					points.p=Math.round(parseInt(points.p)*0.5);
				break;				
			}
		}
	});
	
    //  This part is vital if you want the objects with their own collision groups to still collide with the world bounds
    //  (which we do) - what this does is adjust the bounds to use its own collision group.
    game.physics.p2.updateBoundsCollisionGroup();	
}

var press = false;
function update() {
	var speed = 7.5;
	var circlePressed = false;
	
	if (circle.body.data.motionState == 2) {
		if (game.input.activePointer.isUp) {
			circlePressed = false;
			press = false;
		}		
		else if (game.input.activePointer.isDown) {
			if (!press && game.input.activePointer.positionDown.x > circle.position.x-circle.width*.5 
				&& game.input.activePointer.positionDown.x < circle.position.x+circle.width*.5
			  	&& game.input.activePointer.positionDown.y > circle.position.y-circle.height*.5
				&& game.input.activePointer.positionDown.y > circle.position.y-circle.height*.5) {
				circlePressed = true;
			}
			
			press = true;
			
			if (circlePressed) {
				circle.body.data.motionState = 1;
			}
			else {
				circle.body.x = game.input.activePointer.worldX;
			}
		}
		else if (game.input.keyboard.isDown(Phaser.Keyboard.CONTROL)) {
			circle.body.data.motionState = 1;
		}
		else if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
			circle.body.x-= speed;
		}
		else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
			circle.body.x+= speed;
		}
				
		if (circle.body.x < 0 + circle.width * 0.5) {
			circle.body.x = circle.width * 0.5;
		} 
		else if (circle.body.x > game.world.width - circle.width * 0.5) {
			circle.body.x = game.world.width - circle.width * 0.5;
		}
	}
}

function render() {
}