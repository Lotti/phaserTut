var debug = true;
var gameDiv = "game";
var game = new Phaser.Game($("#"+gameDiv).width(), $("#"+gameDiv).height(), debug ? Phaser.CANVAS : Phaser.AUTO, gameDiv, { preload: preload, loadUpdate: loadUpdate, loadRender: loadRender, create: create, update: update, render: render });

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

	var colors = [ 'yellow', 'red', 'green', 'blue', 'purple', 'grey' ];
	var dots;
	var dotCG;
	var circle;
	var circleCG;
	var circleMaterial;
	var dotMaterial;
	var fps;
	
	function create() {
		//if (debug) {
			game.time.advancedTiming = true;
			fps = game.add.text(2.5, game.world.height, game.time.fps+" fps", { font: "10px Arial", fill: "#FFFFFF", align: "left" });
			fps.pivot.x = 0;
			fps.pivot.y = fps.height;
			fps.update = function () {
				fps.setText(game.time.fps+" fps");
			}
		//}
		
        game.physics.gravity.y = 200;
        game.physics.restitution = 0.6;
        game.physics.friction = 0.8;		
		
		circleMaterial = game.physics.createMaterial('circleMaterial');
		circleCG = game.physics.createCollisionGroup();

		circle = game.add.sprite(100, 15, 'circle');
		circle.name = 'circle';
		circle.anchor.setTo(0.5,0.5);
		circle.scale.setTo(0.3,0.3);
		circle.physicsEnabled = true;
		circle.body.setCircle(circle.width * .5);
		circle.body.mass = 4;
		circle.body.damping = 0.2; //bounce?
        circle.body.setMaterial(circleMaterial);
		circle.body.setCollisionGroup(circleCG);
	  	//circle.body.static = true;
		circle.body.collideWorldBounds = true;
		
		dotMaterial = game.physics.createMaterial('dotMaterial');
		dotCG = game.physics.createCollisionGroup();		

		var rows = 10;
		var cols = 20;
		var startX = 25;
		var startY = 100;
		dots = game.add.group();
		dots.name = 'dots';
		for(var i=0; i<cols; i++) {
			for(var j=0; j<rows; j++) {
				if (j%2==0) {
					offsetX = startX;
				}
				else {
					offsetX = 9.6*.5;
				}

				var dot = dots.create(i*32+offsetX, j*32+startY, colors[game.rnd.integerInRange(0,colors.length-1)]+'Dot');
				dot.name = ((j+1)*i)+"dot";
				dot.anchor.setTo(0.5,0.5);
				dot.scale.setTo(0.3,0.3);
				dot.physicsEnabled = true;
				dot.body.setCircle(dot.width * .5);
                dot.body.setMaterial(dotMaterial);
				dot.body.setCollisionGroup(dotCG);				
				dot.body.static = true;
				dot.body.collides(circleCG); //now it works!
			}
		}
		
		game.physics.createContactMaterial(circleMaterial, dotMaterial, { friction: 0.04, restitution: 0.6 });
		circle.body.collides([dotCG], function() {console.log("circle collided");}); //now it works!
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
		if (debug) {		
			game.debug.renderPhysicsBody(circle.body);
			dots.forEach(function(dot) {
				game.debug.renderPhysicsBody(dot.body);
			});
		}
	}
