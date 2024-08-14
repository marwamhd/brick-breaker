// Define the initial game settings and elements
let containerWidth = document.getElementById("container").offsetWidth;
let containerHeight = document.getElementById("container").offsetHeight;

let scoreDom = document.getElementById("info-score");
let livesDom = document.getElementById("info-lives");

let playerWidth = 300;
let playerHeight = 20;
let score = 0;
let lives = 3;

let playerHit = true;

let player = {
  width: playerWidth,
  height: playerHeight,
  position: 50, // Initial position percentage (middle)
  velocityX: 130,
};

let char = {
  xPosition: 80,
  yPosition: 50,
  width: 30,
  height: 30,
  xOffset: 1,
  yOffset: 1,
};

let blocks = [];

let gameRunning = false; // A flag to control the game loop
let timerInterval; // Variable to hold the timer interval
let playerAnimationFrameId; // To store the player animation frame ID
let charAnimationFrameId; // To store the character animation frame ID
let keysPressed = {}; // To track the keys being pressed

let moveDirection = 0; // 0: no movement, -1: left, 1: right

document.addEventListener("keydown", (e) => {
  if (e.code === "Enter") {
    handleEnterKey();
  } else if (e.code === "KeyP") {
    pauseGame();
  } else if (e.code === "KeyC") {
    continueGame();
  } else if (e.code === "KeyR") {
    restartGame();
  } else if (e.code === "ArrowLeft") {
    keysPressed[e.code] = true;
    moveDirection = -1;
    if (!playerAnimationFrameId) {
      playerAnimationFrameId = requestAnimationFrame(movePlayer);
    }
  } else if (e.code === "ArrowRight") {
    keysPressed[e.code] = true;
    moveDirection = 1;
    if (!playerAnimationFrameId) {
      playerAnimationFrameId = requestAnimationFrame(movePlayer);
    }
  }
});

document.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft" || e.code === "ArrowRight") {
    delete keysPressed[e.code];
    if (!keysPressed["ArrowLeft"] && !keysPressed["ArrowRight"]) {
      moveDirection = 0;
      cancelAnimationFrame(playerAnimationFrameId);
      playerAnimationFrameId = null;
    } else if (keysPressed["ArrowLeft"] && !keysPressed["ArrowRight"]) {
      moveDirection = -1;
    } else if (keysPressed["ArrowRight"] && !keysPressed["ArrowLeft"]) {
      moveDirection = 1;
    }
  }
});

function createGameElements() {
  // Clear existing game container content if any
  const container = document.querySelector(".container");
  container.innerHTML = ""; // Clear existing content

  // Create the line
  const line = document.createElement("div");
  line.className = "line";
  line.id = "line";
  container.appendChild(line);

  // Create the character
  const char = document.createElement("div");
  char.className = "char";
  char.id = "char";
  container.appendChild(char);

  // Create strawberries
  const strawberriesContainer = document.createElement("div");
  strawberriesContainer.className = "strawberries";
  container.appendChild(strawberriesContainer);

  for (let i = 1; i <= 6 * 4; i++) {
    const strawberry = document.createElement("div");
    strawberry.className = "strawberry";
    strawberry.id = `straw${i}`;
    strawberriesContainer.appendChild(strawberry);

    blocks.push(strawberry);
  }
}

function resetGame() {
  if (lives <= 0) {
    lives = 3;
    score = 0;
  }

  scoreDom.innerHTML = `<span>Score</span><span>${score}</span>`;
  livesDom.innerHTML =
    "<span class='info-lives'>Lives</span><span class='info-lives'>" +
    lives +
    "</span>";

  player.position = 50; // Reset player position to the middle
  char.xPosition =  Math.random() * 100;
  char.yPosition = 50;

  // Reset styles
  document.getElementById("line").style.left = player.position + "%";
  document.getElementById("char").style.left = char.xPosition + "%";
  document.getElementById("char").style.bottom = char.yPosition + "%";
}

// Start the game
function startGame() {
  
  if (playerAnimationFrameId) {
    cancelAnimationFrame(playerAnimationFrameId);
    playerAnimationFrameId = null; // ensure playerAnimationFrameId is reset
  }

  if (charAnimationFrameId) {
    cancelAnimationFrame(charAnimationFrameId);
    charAnimationFrameId = null; // ensure charAnimationFrameId is reset
  }

  createGameElements();
  // Reset game state
  resetGame();

  checkWinCondition();

  // Start the game loop
  gameRunning = true;
  charAnimationFrameId = requestAnimationFrame(moveChar);
  startTimer();

  document.querySelector(".pause").addEventListener("click", pauseGame);
  document.querySelector(".continue").addEventListener("click", continueGame);
  document.querySelector(".restart").addEventListener("click", restartGame);

  playerAnimationFrameId = requestAnimationFrame(movePlayer);
}

function moveChar() {
  if (!gameRunning) return;

  let charDom = document.getElementById("char");
  char.xPosition += char.xOffset;
  char.yPosition += char.yOffset;

  // Get the container width and height
  let containerWidth = document.getElementById("container").offsetWidth;
  let containerHeight = document.getElementById("container").offsetHeight;

  // Get the character width and height
  let charWidth = charDom.offsetWidth;
  let charHeight = charDom.offsetHeight;

  // Boundary conditions
  if (
    char.xPosition <= 0 ||
    char.xPosition >= 100 - (charWidth / containerWidth) * 100
  ) {
    char.xOffset *= -1;
    char.xPosition = Math.max(
      0,
      Math.min(char.xPosition, 100 - (charWidth / containerWidth) * 100)
    );
  }
  if (
    char.yPosition <= 0 ||
    char.yPosition >= 100 - (charHeight / containerHeight) * 100
  ) {
    char.yOffset *= -1;
    char.yPosition = Math.max(
      0,
      Math.min(char.yPosition, 100 - (charHeight / containerHeight) * 100)
    );
  }

  // Update the char's position
  charDom.style.left = char.xPosition + "%";
  charDom.style.bottom = char.yPosition + "%";

  // Check console logs for position values

  isInContact();

  // End game condition
  if (char.yPosition <= 0) {
    endGame();
  }

  charAnimationFrameId = requestAnimationFrame(moveChar);
}

function movePlayer() {
  if (!gameRunning) return; // Prevent player movement if the game has ended

  let lineElement = document.getElementById("line");
  let currentPercentage = player.position;
  let nextPlayerX;

  if (moveDirection === -1) {
    nextPlayerX = currentPercentage - player.velocityX / 60;
    if (nextPlayerX > 0) {
      player.position = nextPlayerX;
      lineElement.style.left = nextPlayerX + "%";
    } else {
      player.position = 0;
      lineElement.style.left = "0%";
    }
  } else if (moveDirection === 1) {
    nextPlayerX = currentPercentage + player.velocityX / 60;
    let containerWidth = document.getElementById("container").offsetWidth;
    let playerWidth = lineElement.offsetWidth;
    let maxPercentage = ((containerWidth - playerWidth) / containerWidth) * 100;

    if (nextPlayerX <= maxPercentage) {
      player.position = nextPlayerX;
      lineElement.style.left = nextPlayerX + "%";
    } else {
      player.position = maxPercentage;
      lineElement.style.left = maxPercentage + "%";
    }
  }

  if (moveDirection !== 0) {
    playerAnimationFrameId = requestAnimationFrame(movePlayer);
  } else {
    cancelAnimationFrame(playerAnimationFrameId);
    playerAnimationFrameId = null;
  }
}

function isInContact() {

  // checkWinCondition();

  let charDom = document.getElementById("char");
  let lineDom = document.getElementById("line");

  for (let index = 0; index < blocks.length; index++) {
    const blockElement = blocks[index];

    if (
      topCollision(charDom, blockElement) ||
      bottomCollision(charDom, blockElement)
    ) {
      // Reverse the direction of the character if it collides with the line
      char.yOffset *= -1;
      blockElement.style.backgroundColor = "#f6f3f3";
      const index = blocks.indexOf(blockElement);
      if (index > -1) {
        // only splice array when item is found
        blocks.splice(index, 1); // 2nd parameter means remove one item only
        score += 50;
        scoreDom.innerHTML = `<span>Score</span><span>${score}</span>`;
        checkWinCondition();
      }
    }

    if (
      leftCollision(charDom, blockElement) ||
      rightCollision(charDom, blockElement)
    ) {
      char.xOffset *= -1;
      blockElement.style.backgroundColor = "#f6f3f3";
      const index = blocks.indexOf(blockElement);
      if (index > -1) {
        // only splice array when item is found
        blocks.splice(index, 1); // 2nd parameter means remove one item only
        score += 50;
        scoreDom.innerHTML = `<span>Score</span><span>${score}</span>`;
        checkWinCondition();
      }
    }

  
  }

  if (topCollision(charDom, lineDom) && playerHit) {
    playerHit = false;
    setVariableTrueAfterDelay(playerHit); //

    // Reverse the direction of the character if it collides with the line
    char.yOffset *= -1;
  }

  if (
    (leftCollision(charDom, lineDom) || rightCollision(charDom, lineDom)) &&
    playerHit
  ) {
    char.xOffset *= -1;
    playerHit = false;
    setVariableTrueAfterDelay(playerHit); //
  }

  if (isInside(charDom, lineDom)) {
    // handleInsidePosition(char, charDom, lineDom);


    char.yPosition =
      parseFloat(lineDom.style.bottom) + (playerHeight / containerHeight) * 100;

    if (!isRightInside(charDom, lineDom)) {
      char.xPosition =
        parseFloat(lineDom.style.left) - (char.width / containerWidth) * 100;
    }
    if (isRightInside(charDom, lineDom)) {
      char.xPosition =
        parseFloat(lineDom.style.left) + (playerWidth / containerWidth) * 100;
    }


    charDom.style.left = char.xPosition + "%";
    charDom.style.bottom = char.yPosition + "%";

    console.log(lineDom.style.left);
    console.log("Character moved to avoid being inside the element!");
    // playerHit = false;
    // setVariableTrueAfterDelay(playerHit); //
  }
  
}

function isTopInside(rect1Dom, rect2Dom) {
  let rect1 = rect1Dom.getBoundingClientRect();
  let rect2 = rect2Dom.getBoundingClientRect();

  // Check if rect1 is entirely inside rect2
  if (
    rect1.left >= rect2.left &&
    rect1.right <= rect2.right &&
    rect1.top >= rect2.top &&
    rect1.bottom <= rect2.bottom
  ) {
    // Calculate the distances to the top and bottom edges of rect2
    let distanceToTop = rect1.top - rect2.top;
    let distanceToBottom = rect2.bottom - rect1.bottom;

    // Check if rect1 is closer to the top edge of rect2
    return distanceToTop < distanceToBottom;
  }
}
function isRightInside(rect1Dom, rect2Dom) {
  let rect1 = rect1Dom.getBoundingClientRect();
  let rect2 = rect2Dom.getBoundingClientRect();

  // Check if rect1 is entirely inside rect2
  if (
    rect1.left >= rect2.left &&
    rect1.right <= rect2.right &&
    rect1.top >= rect2.top &&
    rect1.bottom <= rect2.bottom
  ) {
    // Calculate the distances to the left and right edges of rect2
    let distanceToLeft = rect1.left - rect2.left;
    let distanceToRight = rect2.right - rect1.right;

    // Check if rect1 is closer to the right edge of rect2
    return distanceToRight < distanceToLeft;
  }

  return false;
}

// function handleInsidePosition(char, rect1Dom, rect2Dom) {
//     let rect2StyleLeft = parseFloat(rect2Dom.style.left) || 0; // Default to 0 if not set
//     let rect2StyleBottom = parseFloat(rect2Dom.style.bottom) || 0; // Default to 0 if not set

//     // Determine if the character is more towards the top or right
//     let charDom = document.getElementById("char");
//     let charStyleLeft = parseFloat(charDom.style.left) || 0;
//     let charStyleBottom = parseFloat(charDom.style.bottom) || 0;

//     if (charStyleLeft + char.width / 2 < rect2StyleLeft + rect2Dom.offsetWidth / 2) {
//       // If the character's center is left of the container's center, move it to the right
//       char.xPosition = rect2StyleLeft + 80; // Move to the right of rect2
//       charDom.style.left = char.xPosition + "%";
//     } else {
//       // Otherwise, move it to the top of the container
//       char.yPosition = rect2StyleBottom + 10; // Move to the top of rect2
//       charDom.style.bottom = char.yPosition + "%";
//     }
//   }

function setVariableTrueAfterDelay(variableSetter) {
  setTimeout(() => {
    playerHit = true;
  }, 150); // 500 milliseconds = 0.5 seconds
}

function startTimer() {
  const timeElement = document.getElementById("info-time");
  let [minutes, seconds] = timeElement.textContent
    .split(" ")[0]
    .split(":")
    .map(Number);

  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (seconds == 59) {
      seconds = 0;
      minutes++;
    } else {
      seconds++;
    }

    timeElement.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }, 1000);
}

function endGame(now = false) {
  if (lives > 1 && !now) {
    lives--;
    livesDom.innerHTML =
      "<span class='info-lives'>Lives</span><span class='info-lives'>" +
      lives +
      "</span>";

    // Pause the game and show the lost life message
    pauseGame();
    resetGame(); // Reset the game elements to the middle
    showLostLifeMessage();
    return;
  }

  lives--;
  livesDom.innerHTML =
    "<span class='info-lives'>Lives</span><span class='info-lives'>" +
    lives +
    "</span>";

  if (lives <= 0) {
    gameRunning = false; // Stop the game loop
    clearInterval(timerInterval); // Stop the timer

    // Show the game over message and display the score
    const gameOverMessage = document.getElementById("gameOverMessage");
    const finalScoreElement = document.getElementById("finalScore");

    if (gameOverMessage && finalScoreElement) {
      finalScoreElement.textContent = score; // Replace `score` with your score variable
      gameOverMessage.classList.remove("hidden");
    }
  }
}

function showLostLifeMessage() {
  const lostLifeMessage = document.getElementById("lostLifeMessage");
  if (lostLifeMessage) {
    lostLifeMessage.classList.remove("hidden");
  }
}

function hideLostLifeMessage() {
  const lostLifeMessage = document.getElementById("lostLifeMessage");
  if (lostLifeMessage) {
    lostLifeMessage.classList.add("hidden");
  }
}

function pauseGame() {
  if (gameRunning) {
    gameRunning = false; // Stop the game loop
    clearInterval(timerInterval); // Stop the timer
  }
}

function continueGame() {
  hideLostLifeMessage();
  if (!gameRunning) {
    gameRunning = true;
    charAnimationFrameId = requestAnimationFrame(moveChar);

    startTimer();
  }
  if (lives <= 0) {
    gameRunning = false;
    return;
  }
}

function restartGame() {
  // checkWinCondition();
  gameRunning = false;
  clearInterval(timerInterval); // stop the current timer

  // Reset game state
  lives = 3;
  score = 0;
  blocks = [];
  scoreDom.innerHTML = `<span>Score</span><span>${score}</span>`;
  livesDom.innerHTML = "<span class='info-lives'>Lives</span><span class='info-lives'>" + lives + "</span>";

  // Reset the timer
  const timeElement = document.getElementById("info-time");
  timeElement.textContent = "0:00";

  // Hide win and game over messages
  const winMessage = document.getElementById("winMessage");
  if (winMessage) winMessage.classList.add("hidden");

  const lostlifemessage = document.getElementById("lostLifeMessage");
  if (lostlifemessage) lostlifemessage.classList.add("hidden");

  const gameOverMessage = document.getElementById("gameOverMessage");
  if (gameOverMessage) gameOverMessage.classList.add("hidden");

  // Start the game
  startGame();

  // checkWinCondition();

}

function handleEnterKey() {
  const winMessage = document.getElementById("winMessage");
  const gameOverMessage = document.getElementById("gameOverMessage");
  const lostLifeMessage = document.getElementById("lostLifeMessage");

  if (!winMessage.classList.contains("hidden")) {
    restartGame();
  } else if (!gameOverMessage.classList.contains("hidden")) {
    restartGame();
  } else if (!lostLifeMessage.classList.contains("hidden")) {
    continueGame();
  }
}

function topCollision(rect1Dom, rect2Dom) {
  let rect1 = rect1Dom.getBoundingClientRect();
  let rect2 = rect2Dom.getBoundingClientRect();

  // Check if rect1 is colliding with rect2
  if (checkCollision(rect1Dom, rect2Dom)) {
    return (
      rect1.bottom > rect2.top && // Bottom of rect1 is below the top of rect2
      rect1.top < rect2.top && // Top of rect1 is above the top of rect2
      rect1.right > rect2.left && // Right side of rect1 extends beyond the left side of rect2
      rect1.left < rect2.right // Left side of rect1 extends before the right side of rect2
    );
  }

  return false;
}

function bottomCollision(rect1Dom, rect2Dom) {
  let rect1 = rect1Dom.getBoundingClientRect();
  let rect2 = rect2Dom.getBoundingClientRect();

  // Check if rect1 is colliding with rect2
  if (checkCollision(rect1Dom, rect2Dom)) {
    return (
      rect1.top < rect2.bottom && // Top of rect1 is above the bottom of rect2
      rect1.bottom > rect2.bottom && // Bottom of rect1 is below the bottom of rect2
      rect1.right > rect2.left && // Right side of rect1 extends beyond the left side of rect2
      rect1.left < rect2.right // Left side of rect1 extends before the right side of rect2
    );
  }

  return false;
}

function leftCollision(rect1Dom, rect2Dom) {
  let rect1 = rect1Dom.getBoundingClientRect();
  let rect2 = rect2Dom.getBoundingClientRect();

  // Check if rect1 is colliding with rect2
  if (checkCollision(rect1Dom, rect2Dom)) {
    return (
      rect1.right > rect2.left && // Right side of rect1 is beyond the left side of rect2
      rect1.left < rect2.left && // Left side of rect1 is to the left of the left side of rect2
      rect1.bottom > rect2.top && // Bottom of rect1 is below the top of rect2
      rect1.top < rect2.bottom // Top of rect1 is above the bottom of rect2
    );
  }

  return false;
}

function rightCollision(rect1Dom, rect2Dom) {
  let rect1 = rect1Dom.getBoundingClientRect();
  let rect2 = rect2Dom.getBoundingClientRect();

  // Check if rect1 is colliding with rect2
  if (checkCollision(rect1Dom, rect2Dom)) {
    return (
      rect1.left < rect2.right && // Left side of rect1 is before the right side of rect2
      rect1.right > rect2.right && // Right side of rect1 is beyond the right side of rect2
      rect1.bottom > rect2.top && // Bottom of rect1 is below the top of rect2
      rect1.top < rect2.bottom // Top of rect1 is above the bottom of rect2
    );
  }

  return false;
}

function isInside(rect1Dom, rect2Dom) {
  let rect1 = rect1Dom.getBoundingClientRect();
  let rect2 = rect2Dom.getBoundingClientRect();

  // Check if rect1 is entirely inside rect2
  return (
    rect1.left >= rect2.left && // Left side of rect1 is not before the left side of rect2
    rect1.right <= rect2.right && // Right side of rect1 is not beyond the right side of rect2
    rect1.top >= rect2.top && // Top of rect1 is not above the top of rect2
    rect1.bottom <= rect2.bottom // Bottom of rect1 is not below the bottom of rect2
  );
}

function checkCollision(rect1Dom, rect2Dom) {
  // Get the bounding rectangles of the two elements
  let rect1 = rect1Dom.getBoundingClientRect();
  let rect2 = rect2Dom.getBoundingClientRect();

  // Check for collision
  return (
    rect1.left < rect2.right &&
    rect1.right > rect2.left &&
    rect1.top < rect2.bottom &&
    rect1.bottom > rect2.top
  );
}

function checkWinCondition() {
  // alert(blocks.length);
  if (blocks.length === 0) {
    winGame();
  }
}

function winGame() {
  console.log("Win game function called");
  gameRunning = false;
  clearInterval(timerInterval);

  const winMessage = document.getElementById("winMessage");
  const winTime = document.getElementById("winTime");
  const winScore = document.getElementById("winScore");

  if (winMessage && winTime && winScore) {
    winTime.textContent =
      "Time: " + document.getElementById("info-time").textContent;
    winScore.textContent = "Score: " + score;

    winMessage.classList.remove("hidden");
  }
}


// Initialize the game when the page loads
window.onload = startGame();
