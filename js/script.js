// reference to canvas and a context
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

// sounds
const hitSound = new Audio('../sounds/hitSound.wav');
const scoreSound = new Audio('../sounds/scoreSound.wav');
const wallHitSound = new Audio('../sounds/wallHitSound.wav');

// variables
const paddleWidth = 10;
const paddleHeight = 75;
let upArrowPressed = false;
let downArrowPressed = false;
let userPoint = false;
let aiPoint = false;
let userIsWinner = true;
let aiIsWinner = false;

// user paddle
const user = {
  x: 40,
  y: canvas.height/2 - paddleHeight/2,
  width: paddleWidth,
  height: paddleHeight,
  color: '#EADDCA',
  score: 0
};

// ai paddle
const ai = {
  x: canvas.width - (paddleWidth + 40),
  y: canvas.height/2 - paddleHeight/2,
  width: paddleWidth,
  height: paddleHeight,
  color: '#EADDCA',
  score: 0
};

// ball
const ball = {
  x: canvas.width/2,
  y: canvas.height/2,
  radius: 7,
  speed: 7,
  velocityX: 5,
  velocityY: 5,
  color: '#808000'
};

// draws score
function drawScore(x, y, score) {
  context.fillStyle = '#593e2d';
  context.font = '100px monospace';
  context.fillText(score, x, y);
}

// draws message
function drawMessage(x, y, message) {
  context.fillStyle = '#593e2d';
  context.font = '15px monospace';
  context.fillText(message, x, y);
}

// draws paddle
function drawPaddle(x, y, width, height, color) {
  context.fillStyle = color;
  context.fillRect(x, y, width, height);
}

// draws ball
function drawBall(x, y, radius, color) {
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2, true); // π * 2 Radians = 360 degrees
  context.closePath();
  context.fill();
}

// moving Paddles
// eventListener
window.addEventListener('keydown', keyDownHandler);
window.addEventListener('keyup', keyUpHandler);

// pressing a key
function keyDownHandler(event) {
  switch (event.keyCode) {
    case 38: // up arrow key
      upArrowPressed = true;
      break;
    case 40: // down arrow key
      downArrowPressed = true;
      break;
  }
}

// releasing a key
function keyUpHandler(event) {
  switch (event.keyCode) {
    case 38:
      upArrowPressed = false;
      break;
    case 40:
      downArrowPressed = false;
      break;
  }
}

// resets ball
function reset() {
  ball.x = canvas.width/2;
  ball.y = canvas.height/2;
  ball.speed = 7;

  // changes the direction of ball
  ball.velocityX = -ball.velocityX;
  ball.velocityY = -ball.velocityY;
}

// collision detection
function collisionDetect(player, ball) {
  player.top = player.y;
  player.right = player.x + player.width;
  player.bottom = player.y + player.height;
  player.left = player.x;

  ball.top = ball.y - ball.radius;
  ball.right = ball.x + ball.radius;
  ball.bottom = ball.y + ball.radius;
  ball.left = ball.x - ball.radius;

  return ball.left < player.right && ball.top < player.bottom && ball.right > player.left && ball.bottom > player.top;
}

// updates variables
function update() {
  // moving the paddle
  if (upArrowPressed && user.y > 0) {
    user.y -= 8;
  } else if (downArrowPressed && (user.y < canvas.height - user.height)) {
    user.y += 8;
  }

  // top or bottom wall
  if (ball.y + ball.radius >= canvas.height || ball.y - ball.radius <= 0) {
    wallHitSound.play();
    ball.velocityY = -ball.velocityY;
  }

   // right wall
   if (ball.x + ball.radius >= canvas.width) {
    scoreSound.play();
    user.score += 1;
    userPoint = true;
    aiPoint = false;
    reset();
  }

  // left wall
  if (ball.x - ball.radius <= 0) {
    scoreSound.play();
    ai.score += 1;
    aiPoint = true;
    userPoint = false;
    reset();
  }

  // move the ball
  ball.x += ball.velocityX;
  ball.y += ball.velocityY;

  // ai paddle movement
  ai.y += ((ball.y - (ai.y + ai.height/2))) * 0.1;

  // collision detection on paddles
  let player = (ball.x < canvas.width/2) ? user : ai;

  if (collisionDetect(player, ball)) {
    hitSound.play();
    let angle = 0; // default angle is 0 deg in Radian

    // if ball hit the top of paddle then -1 * Math.PI / 4 = -45 deg
    if (ball.y < (player.y + player.height/2)) {
      angle = -1 * Math.PI/4;
    } else if (ball.y > (player.y + player.height/2)) {
      // if it hit the bottom of paddle then angle will be Math.PI / 4 = 45 deg
      angle = Math.PI/4;
    }

    // change velocity of ball according to on which paddle the ball hit
    ball.velocityX = (player === user ? 1 : -1) * ball.speed * Math.cos(angle);
    ball.velocityY = ball.speed * Math.sin(angle);

    // increase ball speed
    ball.speed += 0.2;
  }
}

// checks if there's a winner
function checkWin() {
  // if user hits 20
  if (user.score == 20) {
    reset();
    ball.speed = 0;
    ball.velocityX = 0;
    ball.velocityY = 0;
    userIsWinner = true;
    aiIsWinner = false;
    return true;
  }
  // if ai hits 20
  else if (ai.score == 20) {
    reset();
    ball.speed = 0;
    ball.velocityX = 0;
    ball.velocityY = 0;
    userIsWinner = false;
    aiIsWinner = true;
    return true;
  }
  return false;
}

// draws everything on to canvas
function render() {
  context.fillStyle = "#6F4E37";
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawScore(canvas.width/4-25, canvas.height/2+25, user.score);
  drawScore(3 * canvas.width/4-25, canvas.height/2+25, ai.score);
  drawPaddle(user.x, user.y, user.width, user.height, user.color);
  drawPaddle(ai.x, ai.y, ai.width, ai.height, ai.color);
  drawBall(ball.x, ball.y, ball.radius, ball.color);

  if (!checkWin()) {
    if (userPoint) {
      drawMessage(canvas.width/4+75, canvas.height/2, "User got a point!");
    }
    else if (aiPoint) {
      drawMessage(canvas.width/4+85, canvas.height/2, "Ai got a point!");
    }
  } else {
    if (userIsWinner) {
      drawMessage(canvas.width/4+110, canvas.height/2, "User wins!");
    }
    else if (aiIsWinner) {
      drawMessage(canvas.width/4+120, canvas.height/2, "Ai wins!");
    }
  }
}

// main loop
function gameLoop() {
  if (!checkWin()) {
    update();
  }
  render();
}

setInterval(gameLoop, 1000/60);
