var canvas;
var context;

var players = [];
var stardusts = [];
var p1;
var p2;
var p3;
var p4;

const MAX_SPEED = 5;
const ROTATIONAL_SPEED_FACTOR = 1;
const DAMPING_FACTOR = 0.01;

document.addEventListener("click", function (e) {
    p1.addForce({
        magnitude: MAX_SPEED * 1 / (p1.size / 5),
        angle: getAngleBetween(p1.position, {
            x: e.clientX,
            y: e.clientY
        })
    });

});

function randomBotMovement() {
    console.log("moving");
    for (var i = 1; i < players.length; i++) {
        var bot = players[i];
        var randomAngle = Math.random() * (Math.PI / 8) - (Math.PI / 4);
        var lastAngle = bot.movementVector[0].angle;
        var newAngle = lastAngle + randomAngle;
        bot.addForce({
            angle: getAngleBetween(bot.position, p1.position),
            magnitude: MAX_SPEED / (bot.size / 5)
        });
    }
}

document.addEventListener("DOMContentLoaded", function () {
    //Set canvas to window height
    canvas = document.getElementById("playarea");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context = canvas.getContext("2d");

    p1 = new Player("YOU", 25, {
        x: 0,
        y: 0
    });
    p2 = new Player("Player2", 75, {
        x: 500,
        y: 300
    }, "#D34EF1");
    p3 = new Player("Player3", 50, {
        x: 400,
        y: 500
    }, "#5CAB32");
    p4 = new Player("Player4", 20, {
        x: 700,
        y: 200
    }, "#CD3987");
    players.push(p1);
    players.push(p2);
    players.push(p3);
    players.push(p4);

    setInterval(randomBotMovement, 300);

    for (var i = 0; i < 100; i++) {
        var randomX = Math.floor(Math.random() * window.innerWidth);
        var randomY = Math.floor(Math.random() * window.innerHeight);
        var dust = new Stardust({
            x: randomX,
            y: randomY
        });
        stardusts.push(dust);
    }
    setInterval(function () {
        update();
        draw();
    }, 10);

});

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < stardusts.length; i++) {
        stardusts[i].draw();
    }

    for (var i = 0; i < players.length; i++) {
        players[i].draw();
    }
}

function update() {
    for (var i = 0; i < players.length; i++) {
        players[i].update();
    }
}

var Player = function (id, size = 50, position = {
    x: 500,
    y: 500
}, color = "#FFFFFF", initialVector = {
    angle: 0,
    magnitude: 0
}) {
    if (id == null) {
        throw "ERROR: PLAYER ID NOT PROVIDED";
    }
    var thisPlayer = this;
    this.id = id;
    this.size = size;
    this.position = position;
    this.speed = 0.5;
    this.color = color;
    this.movementVector = [];
    this.sphereOfInfluenceRadius = size * 4;
    this.movementVector.push(initialVector);
    this.parent = null;

    this.kill = function () {
        for (i = 0; i < players.length; i++) {
            if (players[i].id == thisPlayer.id) {
                players[i] = new Player(thisPlayer.id, 20, {x: 1500, y: 900}, thisPlayer.color);
            }
        }
    }

    this.grow = function (amount) {
        thisPlayer.size += amount;
        thisPlayer.sphereOfInfluenceRadius = thisPlayer.size * 3;
    }

    this.draw = function () {
        context.strokeStyle = thisPlayer.color;
        context.fillStyle = thisPlayer.color;

        context.beginPath();
        context.arc(thisPlayer.position.x, thisPlayer.position.y, thisPlayer.size, 0, 2 * Math.PI);

        context.fill()
        context.stroke();
        context.fillStyle = thisPlayer.color;

        context.fillStyle = "red";
        context.fillText(thisPlayer.id, thisPlayer.position.x, thisPlayer.position.y);

        //draw sphere of influence
        var newColorString = parseInt("0x" + thisPlayer.color.substring(1))
        context.strokeStyle = "#" + newColorString * 2 % 0xFFFFFF;
        context.beginPath();
        context.arc(thisPlayer.position.x, thisPlayer.position.y, thisPlayer.sphereOfInfluenceRadius, 0, 2 * Math.PI);
        context.stroke();

        //draw line between child => parent
        if (thisPlayer.parent != null) {
            drawLine(thisPlayer.parent.position, thisPlayer.position);
        }
    }

    this.update = function () {
        // Eat stardust
        for (var i = 0; i < stardusts.length; i++) {
            var distance = getDistanceBetween(thisPlayer.position, stardusts[i].position);
            if (distance < thisPlayer.size) {
                thisPlayer.grow(1);
                stardusts.splice(i, 1);
            }
        }

        /* TODO: Check for sphere of influence */
        thisPlayer.parent = null;
        var greatestInfluence = calculateGravitationalPull(thisPlayer.parent);
        for (var i = 0; i < players.length; i++) {
            if (players[i].id == thisPlayer.id) {
                continue;
            }
            if (players[i].size <= thisPlayer.size) {
                if (getDistanceBetween(players[i].position, thisPlayer.position) < thisPlayer.size - players[i].size) {
                    thisPlayer.grow(players[i].size);
                    players[i].kill();
                }
                continue;
            }

            var otherPlayer = players[i];
            var distanceBetween = getDistanceBetween(otherPlayer.position, thisPlayer.position);



            var angleBetween = getAngleBetween(otherPlayer.position, thisPlayer.position);
            var pull = calculateGravitationalPull(otherPlayer, thisPlayer);
            if (pull > greatestInfluence) {
                greatestInfluence = pull;
                thisPlayer.parent = otherPlayer;
            }

        }
        if (thisPlayer.parent != null) {
            doOrbit(thisPlayer.parent, thisPlayer);
        }



        /* Evaluate all vectors and condense into 1 single average vector */
        var originalPosition = JSON.parse(JSON.stringify(thisPlayer.position));
        for (var i = 0; i < thisPlayer.movementVector.length; i++) {
            thisPlayer.move(thisPlayer.movementVector[i]);
        }
        var angle = getAngleBetween(originalPosition, thisPlayer.position);
        var magnitude = Math.max(0, getDistanceBetween(originalPosition, thisPlayer.position) - DAMPING_FACTOR);



        var vector = {
            angle: angle,
            magnitude: magnitude
        };
        thisPlayer.movementVector = [];
        thisPlayer.movementVector.push(vector);

    }

    this.move = function (vector) {
        this.position.x += Math.cos(vector.angle) * vector.magnitude;
        this.position.y += Math.sin(vector.angle) * vector.magnitude;
    }

    this.addForce = function (forceIn) {
        if (isNaN(forceIn.magnitude)) {
            console.log("MAGNITUDE: " + forceIn.magnitude + " is not a number!");
        }
        if (isNaN(forceIn.angle)) {
            console.log("ANGLE: " + forceIn.magnitude + " is not a number!");
        }
        thisPlayer.movementVector.push(forceIn);
    }
}

var Stardust = function (position, size = 5) {
    var thisStardust = this;
    this.position = position;
    this.size = size;
    this.color = "#FFFFFF";
    this.draw = function () {
        context.beginPath();
        context.fillStyle = thisStardust.color;
        context.rect(thisStardust.position.x, thisStardust.position.y, thisStardust.size, thisStardust.size);
        context.fill();
    }
}

/**
 * Calculates the gravitational pull between two bodies.
 * @param {*} bodyA a body 
 * @param {*} bodyB a body
 */
function calculateGravitationalPull(bodyA, bodyB) {
    if (bodyA == null || bodyB == null) {
        return 0;
    }
    var distance = getDistanceBetween(bodyA.position, bodyB.position);
    return bodyA.size / distance;
}

/** moves the smaller body around the bigger body with speed as a function of distance.
 * @param bodyA the larger body
 * @param bodyB the smaller body
 */
function doOrbit(bodyA, bodyB, strict = true) {
    var distance = getDistanceBetween(bodyA.position, bodyB.position);
    var angle = getAngleBetween(bodyA.position, bodyB.position);

    if (strict && distance > bodyA.sphereOfInfluenceRadius) {
        return;
    }

    bodyB.move({
        angle: angle,
        magnitude: -distance
    });
    bodyB.move({
        angle: angle + ROTATIONAL_SPEED_FACTOR / (distance),
        magnitude: distance
    });
    if (bodyA.parent != null) {
        doOrbit(bodyA.parent, bodyB, false);
    }
}

function getAngleBetween(pointA, pointB) {

    dy = pointB.y - pointA.y;
    dx = pointB.x - pointA.x;

    theta = Math.atan2(dy, dx);

    return theta;
}

function getDistanceBetween(pointA, pointB) {
    var a = pointB.x - pointA.x;
    var b = pointB.y - pointA.y;

    var c = Math.sqrt(a * a + b * b);
    return c;
}

function drawLine(positionA, positionB) {
    context.strokeStyle = "#FFFFFF";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(positionA.x, positionA.y);
    context.lineTo(positionB.x, positionB.y);
    context.stroke();
}