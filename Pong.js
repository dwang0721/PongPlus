// jshint esversion: 6
// jshint browser: true

// global constants for the game.
let gameSetting = {
    countDownAmount: 400, 
    healthAmount: 10,
    energyAmount: 10,
    energyIncrement: 1 / 100,
    energyConsumption: 5,
    bubbleSize: 120,
    initAngleTolerance: 15,
    ballAmount: 10, 
    ballRadius: 8,
    ballSpeed: 2.5,
    paddleAccleration: 0.3,
    paddleSpeed: 5,
    particleSpeed: 3,
    particleRadius: 4,
    particleAmount: 10,
    particleGravity: 0.2
};

// global variable for the game.
let gameStatus = {
    id: '',
    gamestart: false,
    score_l: gameSetting.healthAmount,
    score_r: gameSetting.healthAmount,
    energy_l: gameSetting.energyAmount,
    energy_r: gameSetting.energyAmount,
    countDown: gameSetting.countDownAmount
};


// custom tools and functions placed hereunder:


/*
 * calculate the distance between 2 balls.
 */
let distanceBetween = function (object1, object2) {
    let distX = object1.x - object2.x;
    let distY = object1.y - object2.y;
    let dist = Math.sqrt((distX * distX) + (distY * distY));
    return dist;
};

/*
 * The function returns a random angle in Radian.
 */
let randomAngle = function () {

    let angle;
    let deviance = 15;

    do {
        angle = Math.random() * 360;
    } while (Math.abs(angle - 90) < deviance || Math.abs(angle - 270) < deviance);

    return angle * Math.PI / 180;

};

/*
 * The function returns random color in String.
 */
let getRandomColor = function () {
    let colors = [
          '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
          '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50',
          '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
          '#FF5722', '#795548', '#9E9E9E', '#607D8B', '#777777'
        ];
    return colors[Math.floor(Math.random() * 20)];
};


/*
 * calculate the reflection if the ball hits a bubble surface.
 */
let reflection = function (ballObject, bubbleObject) {
    let new_vel_x;
    let new_vel_y;

    if (bubbleObject.x != ballObject.x) {
        // find the normal line: y=m*x.
        let m = -1 * (bubbleObject.x - ballObject.x) / (bubbleObject.y - ballObject.y);

        // the matrix of transformation a11, a12, a21, a22.
        let a11 = (1 - m * m) / (m * m + 1);
        let a12 = (2 * m) / (m * m + 1);
        let a21 = (2 * m) / (m * m + 1);
        let a22 = (-1 + m * m) / (m * m + 1);

        new_vel_x = a11 * ballObject.vel_x + a12 * ballObject.vel_y;
        new_vel_y = a21 * ballObject.vel_x + a22 * ballObject.vel_y;

    } else {
        new_vel_x = -1 * ballObject.vel_x;
        new_vel_y = ballObject.vel_y;
    }

    ballObject.vel_x = new_vel_x;
    ballObject.vel_y = new_vel_y;
};


//Constructors put hereunder:

/*
 * constructor for building a bubble object. you call it bubble if you like.
 */
let BuildBubble = function (x, y, color, bubbleSize) {
    return {
        x: x,
        y: y,
        color: color,
        bubbleSize: bubbleSize,
        size: 1
    };
};

/*
 * constructor for building a ball object. 
 */
let BuildBall = function (x, y, speed, color, vel_x, vel_y, radius) {

    let angle = randomAngle();

    return {
        x: x,
        y: y,
        speed: speed,
        color: color,
        vel_x: speed * Math.cos(angle),
        vel_y: speed * Math.sin(angle),
        radius: radius,
        super: false
    };
};

/*
 * constructor for building a paddle object. 
 */
let BuildPaddle = function (x, y, width, height, speed, color) {
    return {
        x: x,
        y: y,
        width: width,
        height: height,
        speed: speed,
        color: color,
        accelaration: 0,
        super: false
    };
};


// particles generator

/*
 * generate a cluster of particles in an array. 
 */
let buildParticle = function (x, y) {

    let particleList = [];

    for (let index = 0; index < gameSetting.particleAmount; index++) {
        let angle = randomAngle();
        let speed = gameSetting.particleSpeed + Math.random() * gameSetting.particleSpeed;
        let color = getRandomColor();
        let vel_x = speed * Math.cos(angle);
        let vel_y = speed * Math.sin(angle);
        let radius = gameSetting.particleRadius + gameSetting.particleRadius * Math.random();
        particleList.push(BuildBall(x, y, speed, color, vel_x, vel_y, radius));
        playAudio(explosionAudio);
    }

    return particleList;

};


// draw functions put hereunder

/*
 * draw a particle con canvas. 
 */
let drawParticle = function (particleObject) {
    ctx.beginPath();
    ctx.fillStyle = particleObject.color;
    ctx.arc(particleObject.x, particleObject.y, particleObject.radius, 0, Math.PI * 2);
    ctx.fill();
};

/*
 * draw the bubble based on the object properties. 
 */
let drawBubble = function (bubbleObject) {
    ctx.beginPath();
    ctx.strokeStyle = bubbleObject.color;
    ctx.arc(bubbleObject.x, bubbleObject.y, bubbleObject.size, 0, Math.PI * 2);
    ctx.stroke();
};

/*
 * draw the paddle based on the object properties. 
 */
let drawPaddle = function (paddleObject) {
    if (!paddleObject.super) {
        ctx.fillStyle = paddleObject.color;
    } else {
        ctx.fillStyle = getRandomColor();
    }

    ctx.save();
    ctx.translate(paddleObject.x - paddleObject.width / 2, paddleObject.y - paddleObject.height / 2);
    ctx.fillRect(0, 0, paddleObject.width, paddleObject.height);
    ctx.restore();
};

/*
 * draw the ball based on the object properties. 
 */
let drawBall = function (ballObject) {
    ctx.beginPath();
    if (!ballObject.super) {
        ctx.fillStyle = ballObject.color; // ordinary ball;
    } else {
        ctx.fillStyle = getRandomColor(); //draw a rainbow ball;
    }

    ctx.arc(ballObject.x, ballObject.y, ballObject.radius, 0, Math.PI * 2);
    ctx.fill();
    //console.log(ballObject);
};

/*
 * draw the the health bar on top of the monitor. 
 */
let drawHealth = function () {
    let unit = 25;
    let height = 15;
    let distTop = 30;
    let distMid = 20;

    ctx.strokeStyle = "lightgrey";
    ctx.strokeRect(surface.width / 2 - distMid - gameSetting.healthAmount * unit, distTop, gameSetting.healthAmount * unit, height);
    ctx.strokeRect(surface.width / 2 + distMid, distTop, gameSetting.healthAmount * unit, height);

    ctx.fillStyle = paddle_l.color;
    ctx.fillRect(surface.width / 2 - distMid - unit * gameStatus.score_l, distTop, unit * gameStatus.score_l, height);

    ctx.fillStyle = paddle_r.color;
    ctx.fillRect(surface.width / 2 + distMid, distTop, unit * gameStatus.score_r, height);
};

/*
 * draw the the energy bar on top of the monitor. 
 */
let drawEnergy = function () {
    let unit = 10;
    let height = 7;
    let distTop = 55;
    let distMid = 20;

    ctx.beginPath();
    ctx.strokeStyle = "lightgrey";
    ctx.lineWidth = 0.4;
    ctx.moveTo(surface.width / 2, 0);
    ctx.lineTo(surface.width / 2, surface.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(surface.width / 2, surface.height / 2, 50, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = '#607D8B';
    ctx.font = "18px Arial";
    ctx.fillText("K.O.", surface.width / 2 - 17, distTop * 0.8);

    ctx.fillStyle = '#607D8B';
    ctx.font = "12px Arial";
    ctx.fillText("POW.", surface.width / 2 - 16, distTop * 1.15);

    ctx.strokeStyle = "lightgrey";
    ctx.strokeRect(surface.width / 2 - distMid - gameSetting.energyAmount * unit, distTop, gameSetting.energyAmount * unit, height);
    ctx.strokeRect(surface.width / 2 + distMid, distTop, gameSetting.energyAmount * unit, height);




    ctx.fillStyle = paddle_l.color;
    ctx.fillRect(surface.width / 2 - distMid - unit * gameStatus.energy_l, distTop, unit * gameStatus.energy_l, height);

    ctx.fillStyle = paddle_r.color;
    ctx.fillRect(surface.width / 2 + distMid, distTop, unit * gameStatus.energy_r, height);

};



// game detection functions put other hereunder

/*
 * draw a ball based that start from the center of the canvas at random angle/color/size. 
 */
let initBall = function (ballArray) {

    let angle = randomAngle();

    let x = surface.width / 2;
    let y = surface.height / 2;
    let speed = gameSetting.ballSpeed + Math.random() * gameSetting.ballSpeed;
    let color = getRandomColor();
    let vel_x = speed * Math.cos(angle);
    let vel_y = speed * Math.sin(angle);
    let radius = gameSetting.ballRadius + Math.random() * gameSetting.ballRadius;

    gameStatus.countDown = gameSetting.countDownAmount;

    ballArray.push(BuildBall(x, y, speed, color, vel_x, vel_y, radius));
};

/*
 * check if a ball is inside the bubbles. bubbles are a list of bubble. it check if a ball object is inside all the bubble 
 */
let insideBubble = function (ballObject, bubbleObject) {

    let distX = ballObject.x - bubbleObject.x;
    let distY = ballObject.y - bubbleObject.y;
    let dist = Math.sqrt((distX * distX) + (distY * distY));
    if (dist - ballObject.radius <= bubbleObject.size) {
        return true;
    }
    return false;
};

/*
 * check if balls hits each other 
 */
let ballCollision = function () {
    for (let i = 0; i < ball.length; i++) {
        for (let j = i + 1; j < ball.length; j++) {

            let dist = distanceBetween(ball[i], ball[j]);
            if (dist <= ball[i].radius + ball[j].radius) {


                // avoid balls overlap
                while (distanceBetween(ball[i], ball[j]) <= ball[i].radius + ball[j].radius) {
                    ball[i].x -= ball[i].vel_x;
                    ball[j].y -= ball[j].vel_y;
                }

                // exchange speed and super status
                let temp;

                temp = ball[i].vel_x;
                ball[i].vel_x = ball[j].vel_x;
                ball[j].vel_x = temp;

                temp = ball[i].vel_y;
                ball[i].vel_y = ball[j].vel_y;
                ball[j].vel_y = temp;

                temp = ball[i].super;
                ball[i].super = ball[j].super;
                ball[j].super = temp;

                //playthe sound
                playAudio(ballHitAudio);
            }
        }
    }
};





/*
 * detect if the ball hits a paddle. return ture or false 
 */
let insidePaddle = function (ballObject, paddleObject) {
    let distX = Math.abs(ballObject.x - paddleObject.x);
    let distY = Math.abs(ballObject.y - paddleObject.y);

    if (distX < ballObject.radius + paddleObject.width / 2 && distY < paddleObject.height / 2) {
        playAudio(paddleHitAudio);
        return true;
    }
    return false;
};

/*
 * decrease the energy level, depending on the user's input 
 */
let consumeEnergy = function (side) {
    if (side == "l") {
        gameStatus.energy_l -= gameSetting.energyConsumption;
    }

    if (side == "r") {
        gameStatus.energy_r -= gameSetting.energyConsumption;
    }

};

/*
 * listen to the keyboard input, and update paddle objects
 */
let paddleListener = function (paddleObject1, paddleObject2) {

    let accAmount = gameSetting.paddleAccleration;
    let speedAmount = gameSetting.paddleSpeed;

    let up = 38;
    let down = 40;
    let w = 87;
    let s = 83;
    let right = 39;
    let d = 68;
    let left = 37;
    let a = 65;

    //press down or up arrow
    window.onkeydown = function (event) {
        let key = event.keyCode ? event.keyCode : event.which;

        paddleObject1.accelaration = 0;
        paddleObject2.accelaration = 0;

        switch (key) {
        case up:
            paddleObject1.speed = -speedAmount;
            break;
        case down:
            paddleObject1.speed = speedAmount;
            break;
        case w:
            paddleObject2.speed = -speedAmount;
            break;
        case s:
            paddleObject2.speed = speedAmount;
            break;
        case right:
            if (gameStatus.energy_r > gameSetting.energyConsumption) {
                bubble.push(BuildBubble(paddleObject1.x, paddleObject1.y, getRandomColor(), gameSetting.bubbleSize));
                playAudio(bubbleSheildAudio);
                consumeEnergy("r");
            }
            break;
        case a:
            if (gameStatus.energy_l > gameSetting.energyConsumption) {
                bubble.push(BuildBubble(paddleObject2.x, paddleObject2.y, getRandomColor(), gameSetting.bubbleSize));
                playAudio(bubbleSheildAudio);
                consumeEnergy("l");
            }
            break;
        case left:
            if (gameStatus.energy_r > gameSetting.energyConsumption) {
                paddleObject1.super = true;
                consumeEnergy("r");
            }
            break;
        case d:
            if (gameStatus.energy_l > gameSetting.energyConsumption) {
                paddleObject2.super = true;
                consumeEnergy("l");
            }
            break;
        }

    };

    //release down or up arrow
    window.onkeyup = function (event) {
        let key = event.keyCode ? event.keyCode : event.which;

        switch (key) {
        case up:
            paddleObject1.accelaration = accAmount;
            break;
        case down:
            paddleObject1.accelaration = -accAmount;
            break;
        case w:
            paddleObject2.accelaration = accAmount;
            break;
        case s:
            paddleObject2.accelaration = -accAmount;
            break;
        }

    };
    //update paddle position and speed. 
    paddleControl(paddleObject1, accAmount);
    paddleControl(paddleObject2, accAmount);
};

/*
 * handle the paddle speed and position update. it accepts a input for accelration amount, and the paddleObject.
 */
let paddleControl = function (paddleObject, accAmount) {
    //avoid being stuck at the edge
    if (paddleObject.y > surface.height - paddleObject.height / 2) {
        paddleObject.y = surface.height - paddleObject.height / 2;
    }
    if (paddleObject.y < paddleObject.height / 2) {
        paddleObject.y = paddleObject.height / 2;
    }

    // handling the cusion in
    if (Math.abs(paddleObject.speed) >= accAmount) {
        paddleObject.speed += paddleObject.accelaration;
    } else {
        paddleObject.speed = 0;
    }

    // update the paddle position
    paddleObject.y += paddleObject.speed;
    drawPaddle(paddleObject);
};



//buttons event put here under

/*
 * reset button function
 */
let reset = function () {

    // stop animation
    cancelAnimationFrame(gameStatus.id);

    // clear balls
    while (ball.length > 0) {
        ball.pop();
    }

    // clear particles
    while (particles.length > 0) {
        particles.pop();
    }

    // clear bubbles
    while (bubble.length > 0) {
        bubble.pop();
    }

    // stop the music
    pauseAudio(startAudio);

    // reset paddles
    paddle_l.y = surface.height / 2;
    paddle_l.super = false;
    paddle_r.y = surface.height / 2;
    paddle_r.super = false;

    // reset game status
    gameStatus.gamestart = true;
    gameStatus.score_l = gameSetting.healthAmount;
    gameStatus.score_r = gameSetting.healthAmount;
    gameStatus.energy_l = gameSetting.energyAmount;
    gameStatus.energy_r = gameSetting.energyAmount;


    // initiate a ball item
    initBall(ball);

    // play animation
    updateCanvas();
};

/*
 * pause button function
 */
let pause = function () {
    cancelAnimationFrame(gameStatus.id);
};

/*
 * continue button function
 */
let contiueGame = function () {
    if (gameStatus.gamestart) {
        cancelAnimationFrame(gameStatus.id);
        requestAnimationFrame(updateCanvas);
    }

};

let instruction = function () {
    pause();
    ctx.drawImage(instructionImg, 0, 0);
};

let title = function () {
    pause();
    ctx.drawImage(titleImg, 0, 0);

    playAudio(startAudio);

    let myText = "Pong Plus beta v001: Di Wang / Prabhjit Kaur";
    ctx.fillStyle = "grey";
    ctx.font = "10px Arial";
    ctx.fillText(myText, surface.width - myText.length * 6, surface.height - 30);

};

let gameOver = function () {
    pause();

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, surface.width, surface.height);

    ctx.fillStyle = "grey";
    ctx.font = "30px Arial";
    ctx.fillText("The Winner Is", surface.width / 2 - 100, surface.height / 2 - 60);
    ctx.font = "15px Arial";
    ctx.fillText("Play Again?", surface.width / 2 - 40, surface.height / 2 + 80);

    if (gameStatus.score_l > gameStatus.score_r) {
        ctx.fillStyle = paddle_l.color;
        ctx.fillRect(surface.width / 2 - 30, surface.height / 2 - 30, 60, 60);
    } else {
        ctx.fillStyle = paddle_r.color;
        ctx.fillRect(surface.width / 2 - 30, surface.height / 2 - 30, 60, 60);
    }

};

let playAgain = function (event) {
    //console.log("clicked");
    //console.log(event.offsetX + "/" + event.offsetX );

    //ctx.strokeRect(surface.width/2 - 75, surface.height/2 + 50, 150, 50);

    if (!gameStatus.gamestart &&
        event.offsetX < surface.width / 2 + 75 &&
        event.offsetX > surface.width / 2 - 70 &&
        event.offsetY > surface.height / 2 + 50 &&
        event.offsetY < surface.height / 2 + 100) {
        reset();
    }
};

// audio functions put hereunder
let playAudio = function (audio) {
    audio.play();

};

let pauseAudio = function (audio) {
    audio.pause();
};



// Main function for canvas

/*
 * main function to update the canvas, it updates every 1/60 seconds
 */
let updateCanvas = function () {

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(0, 0, surface.width, surface.height);

    drawHealth();
    drawEnergy();

    // update the energy amount for paddles
    if (gameStatus.energy_l <= gameSetting.energyAmount) {
        gameStatus.energy_l += gameSetting.energyAmount * gameSetting.energyIncrement;
    }

    if (gameStatus.energy_r <= gameSetting.energyAmount) {
        gameStatus.energy_r += gameSetting.energyAmount * gameSetting.energyIncrement;
    }


    if (gameStatus.score_l <= 0 || gameStatus.score_r <= 0) {
        gameStatus.gamestart = false;
        cancelAnimationFrame(gameStatus.id); //add restartGame;
        gameOver();
        return;
    }

    // every a certain amount of time, add a new ball. maximum is 5.
    if (ball.length < gameSetting.ballAmount) {
        gameStatus.countDown -= 1;
    }

    if (gameStatus.countDown < 0) {
        initBall(ball);
    }







    // update ball positions

    for (let i = 0; i < ball.length; i++) {
        ball[i].x += ball[i].vel_x * (1 + ball[i].super);
        ball[i].y += ball[i].vel_y * (1 + ball[i].super);

        // when the ball hits the left paddle.
        if (insidePaddle(ball[i], paddle_l)) {

            ball[i].x = paddle_l.width + ball[i].radius;
            ball[i].vel_x *= -1;
            ball[i].super = paddle_l.super;
            paddle_l.super = false;
        }

        // when the ball hits the right paddle.
        if (insidePaddle(ball[i], paddle_r)) {

            ball[i].x = surface.width - paddle_l.width - ball[i].radius;
            ball[i].vel_x *= -1;
            ball[i].super = paddle_r.super;
            paddle_r.super = false;
        }

        // when the ball hits the top 
        if ((ball[i].y + ball[i].radius) > surface.height) {
            ball[i].y = surface.height - ball[i].radius;
            ball[i].vel_y *= -1;
        }

        // when the ball hits the bottom 
        if ((ball[i].y - ball[i].radius) < 0) {
            ball[i].y = ball[i].radius;
            ball[i].vel_y *= -1;
        }

        // when the ball hits the right border.        
        if ((ball[i].x + ball[i].radius) > surface.width) {

            particles.push(buildParticle(ball[i].x, ball[i].y)); // shoot particle

            ball.splice(i, 1); // delete the ball

            initBall(ball); // create a new ball from the center

            gameStatus.score_r -= 1; // deduct health from left

        }

        // when the ball hits the left border. 
        if ((ball[i].x - ball[i].radius) < 0) {

            particles.push(buildParticle(ball[i].x, ball[i].y));

            ball.splice(i, 1);

            initBall(ball);

            gameStatus.score_l -= 1;
        }


        //when ball hits each other
        ballCollision();

        //check if the ball hits a bubble;
        for (let j = 0; j < bubble.length; j++) {
            if (insideBubble(ball[i], bubble[j])) {
                reflection(ball[i], bubble[j]);
                bubble.splice(j, 1);
            }
        }
        drawBall(ball[i]);

    }


    //animate particles

    // update the position of the particles

    for (let i = 0; i < particles.length; i++) {

        let gravity = gameSetting.particleGravity;

        if (particles.length > 0) {

            for (let j = 0; j < particles[i].length; j++) {
                if (particles[i][j].radius > 0.1) {
                    particles[i][j].vel_y += gravity;

                    particles[i][j].x += particles[i][j].vel_x;
                    particles[i][j].y += particles[i][j].vel_y;

                    particles[i][j].radius -= particles[i][j].radius * 0.02;
                    drawParticle(particles[i][j]);
                } else {
                    particles[i].splice(j, 1);
                }
            }
        } else {
            particles.splice(0, 1);
        }
    }



    //animate bubbles.
    for (let i = 0; i < bubble.length; i++) {
        if (bubble[i].size < bubble[i].bubbleSize) {
            bubble[i].size += bubble[i].bubbleSize * 0.01;
            drawBubble(bubble[i]);
        } else {
            // destroy that bubble
            bubble.splice(i, 1);
        }
    }

    // update paddle position  
    //KeyCode: up 38 / down 40 / left 37 / right 39 / w 87 / s 83 / a 65 / d 68 / http://keycode.info/

    paddleListener(paddle_r, paddle_l);
    gameStatus.id = requestAnimationFrame(updateCanvas);

};


// load game images
let instructionImg = new Image();
instructionImg.src = "instruction.png";

let titleImg = new Image();
titleImg.src = "title.png";

// load game audios
let startAudio = new Audio('audio/RoccoW.mp3');
let ballHitAudio = new Audio('audio/ballHit.wav');
let bubbleSheildAudio = new Audio('audio/bubbleSheild.wav');
let explosionAudio = new Audio('audio/explosion.wav');
let paddleHitAudio = new Audio('audio/paddleHit.wav');

let ball = [];
let bubble = [];
let particles = [];
let bossCat = [];

let surface = window.document.getElementById("gameArea");
let ctx = surface.getContext("2d");
surface.addEventListener("click", playAgain, false);

let paddle_l = BuildPaddle(2.5, surface.height / 2, 5, 100, 0, 'lightblue');
let paddle_r = BuildPaddle(surface.width - 2.5, surface.height / 2, 5, 100, 0, 'pink');