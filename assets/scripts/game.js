var debug = true;
var gameDiv = "game";
var basketColors = ['box','boxgreen','boxred'];
var colors = ['yellow','red','green','blue','purple','grey'];
var dots;
var dotCG;
var dotMaterial;
var circle;
var circleCG;
var circleMaterial;
var baskets;
var basketCG;
var basketMaterial;
var fps;
var points;

var game = new Phaser.Game($("#"+gameDiv).width(), $("#"+gameDiv).height(), debug ? Phaser.CANVAS : Phaser.AUTO, gameDiv, { preload: preload, loadUpdate: loadUpdate, loadRender: loadRender, create: create, update: update, render: render });

function preload() {
	game.load.image('boxgreen','assets/sprites/boxgreen.png');
	game.load.image('boxred','assets/sprites/boxred.png');
	game.load.image('circle', 'assets/sprites/cd.png');	
	for(var i in colors) {
		game.load.image(colors[i]+'Dot', 'assets/sprites/'+colors[i]+'Dot.png');
	}
	for(var i in basketColors) {
		game.load.image(basketColors[i],'assets/sprites/'+basketColors[i]+'.png');
	}	
}

function loadUpdate() {
	//console.log("loadUpdate");
}

function loadRender() {
	//console.log("loadRender");
}

function create() {	
	//if (debug) {
		game.time.advancedTiming = true;
		fps = game.add.text(2.5, 2.5, '', { font: '30px Verdana', fill: '#FFFFFF', align: 'left' });
		fps.update = function () {
			fps.setText(game.time.fps+' fps');
		}
	//}
		
	game.time.advancedTiming = true;
	points = game.add.text(game.world.width-5, 2.5, '0 points', { font: '30px Verdana', fill: '#FFFFFF', align: 'left' });
	points.p = 0;
	points.update = function () {
		points.pivot.x = points.width;
		points.pivot.y = 0;		
		points.setText(points.p+' points');
	}		

	game.physics.gravity.y = 200;
	game.physics.restitution = 0.6;
	game.physics.friction = 0.8;		

	//circle
	
	circleMaterial = game.physics.createMaterial('circleMaterial');
	circleCG = game.physics.createCollisionGroup();

	circle = game.add.sprite(150, 15, 'circle');
	circle.collidedWith = [];
	circle.name = 'circle';
	circle.anchor.setTo(0.5,0.5);
	circle.scale.setTo(0.5,0.5);
	circle.physicsEnabled = true;
	circle.body.setCircle(circle.width * .5);
	circle.body.mass = 4;
	circle.body.damping = 0.2; //bounce?
	circle.body.setMaterial(circleMaterial);
	circle.body.setCollisionGroup(circleCG);
	//circle.body.static = true;
	circle.body.collideWorldBounds = true;

	//dots
	dotCG = game.physics.createCollisionGroup();		

	var rows = 6;
	var cols = 20;
	var startX = 50;
	var startY = 100;
	var spaceX = 85;
	var spaceY = 85;
	dots = game.add.group();
	dots.name = 'dots';
	for(var i=0; i<cols; i++) {
		for(var j=0; j<rows; j++) {
			if (j%2==0) {
				offsetX = startX;
			}
			else {
				offsetX = 10;
			}

			var dot = dots.create(i*spaceX+offsetX, j*spaceY+startY, colors[game.rnd.integerInRange(0,colors.length-1)]+'Dot');
			dot.row = j+1;
			dot.name = ((j+1)*i)+'dot';
			dot.anchor.setTo(0.5,0.5);
			dot.scale.setTo(0.4,0.4);
			dot.physicsEnabled = true;
			dot.body.setCircle(dot.width * .5);
			dot.body.setMaterial(dotMaterial);
			dot.body.setCollisionGroup(dotCG);				
			dot.body.static = true;
			dot.body.collides(circleCG); //now it works!
		}
	}

	game.physics.createContactMaterial(circleMaterial, dotMaterial, { friction: 0.04, restitution: 0.6 });
	circle.body.collides([dotCG], function(circleBody,otherBody) {
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
	startY = game.world.height - 35.0;
	spaceX = 92.5;
	var basketNumber = 11;
	
	basketMaterial = game.physics.createMaterial('basketMaterial');
	basketCG = game.physics.createCollisionGroup();	
	
	baskets = game.add.group();
	baskets.name = 'baskets';
	for(var i=0; i<basketNumber; i++) {
		var basket = baskets.create(i*spaceX+startX, startY, basketColors[game.rnd.integerInRange(0,basketColors.length-1)]);
		basket.name = (i+1)+'basket';
		basket.anchor.setTo(0.5,1.0);
		basket.scale.setTo(0.75,0.75);
		basket.physicsEnabled = true;
		//basket.body.setPolygon(0,0, 60,0, 100,40, 60,80, 0,80);
		basket.body.setMaterial(basketMaterial);
		basket.body.setCollisionGroup(basketCG);
		basket.body.static = true;
		basket.body.collides(circleCG);
	}
	
	game.physics.createContactMaterial(circleMaterial, basketMaterial, { friction: 0.04, restitution: 0.6 });
	circle.body.collides([basketCG], function(circleBody, otherBody) {
		var row = otherBody.sprite.row;
		switch(otherBody.sprite.key) {
			case 'boxgreen':
				points.p=parseInt(points.p*1.5);
			break;				
			case 'boxred':
				points.p=parseInt(points.p*0.5);
			break;				
		}
	});
}

var started = false;
function update() {
	if (circle.body.static) {
		circle.body.x = game.input.activePointer.worldX;
	}

	if (game.input.activePointer.isDown) {
		circle.body.static = false;
	}
}

function render() {
	/*
	if (debug) {		
		game.debug.renderPhysicsBody(circle.body);
		if (dots != undefined) {
			dots.forEach(function(dot) {
				game.debug.renderPhysicsBody(dot.body);
			});
		}
		if (baskets != undefined) {
			baskets.forEach(function(basket) {
				game.debug.renderPhysicsBody(basket.body);
			});	
		}
	}
	*/
}
