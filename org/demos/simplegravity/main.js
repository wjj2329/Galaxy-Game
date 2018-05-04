var canvas;
var context;
var gravityInput;

var players = [];
var p1;
var p2;
var p3;

const MAX_SPEED = 5;
var GRAVITATIONAL_CONSTANT = localStorage.getItem("gravity") || 0.5;
document.addEventListener("click", function (e) {
    
    p1.addForce({
        magnitude: Math.min(getDistanceBetween(p1.position, {
            x: e.clientX,
            y: e.clientY
        }) / 1000, MAX_SPEED),
        angle: getAngleBetween(p1.position, {
            x: e.clientX,
            y: e.clientY
        })
    });
});

function updateGravity(e){
    GRAVITATIONAL_CONSTANT = gravityInput.value;
    localStorage.setItem("gravity", gravityInput.value);
}

document.addEventListener("DOMContentLoaded", function () {
    gravityInput = document.getElementById("gravity");
    gravityInput.value = GRAVITATIONAL_CONSTANT;
    gravityInput.addEventListener("change", updateGravity);
    //Set canvas to window height
    canvas = document.getElementById("playarea");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context = canvas.getContext("2d");

    p1 = new Player("YOU", 25, {x: 0, y: 0});
    p2 = new Player("Player2", 75, {x: 500, y: 300}, "#D34EF1");
    p3 = new Player("Player3", 50, {x: 300, y: 600}, "#5CAB32", {angle: Math.random() * Math.PI * 2, magnitude: Math.random() * 3});
    players.push(p1);
    players.push(p2);
    players.push(p3);
    setInterval(function () {
        update();
        draw();
    }, 10);

});

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
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
}, color = "#FFFFFF", initialVector = {angle: 0, magnitude: 0}) {
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
    
    this.movementVector.push(initialVector);
    this.draw = function () {
        context.strokeStyle = thisPlayer.color;
        context.beginPath();
        context.arc(thisPlayer.position.x, thisPlayer.position.y, thisPlayer.size, 0, 2 * Math.PI);
        context.stroke();
        context.fillStyle= "red";
        context.fillText(thisPlayer.id, thisPlayer.position.x, thisPlayer.position.y);
    }

    this.update = function () {
        /* TODO: Check for sphere of influence */
        for (var i = 0; i < players.length; i++){
            if (players[i].id == thisPlayer.id){
                continue;
            }
            if (players[i].size <= thisPlayer.size){
                continue;
            }
            var otherPlayer = players[i];
            var distanceBetween = getDistanceBetween(otherPlayer.position, thisPlayer.position);
            var angleBetween = getAngleBetween(otherPlayer.position, thisPlayer.position);
            var gravitationalPull = GRAVITATIONAL_CONSTANT * (otherPlayer.size * thisPlayer.size) / Math.pow(distanceBetween, 2);
            thisPlayer.addForce({angle: angleBetween, magnitude: -gravitationalPull});

        }


        /* Evaluate all vectors and condense into 1 single average vector */
        var originalPosition = JSON.parse(JSON.stringify(thisPlayer.position));
        for (var i = 0; i < thisPlayer.movementVector.length; i++) {
            thisPlayer.move(thisPlayer.movementVector[i]);
        }
        var angle = getAngleBetween(originalPosition, thisPlayer.position);
        var magnitude = getDistanceBetween(originalPosition, thisPlayer.position);

        

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