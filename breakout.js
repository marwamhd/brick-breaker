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
  position: 43, // Initial position percentage
  velocityX: 15,
};

let char = {
  xPosition: 80,
  yPosition: 50,
  width: 30,
  height: 30,
  xOffset: 0.7,
  yOffset: 0.7,
};

let blocks = [];

let gameRunning = false; // A flag to control the game loop
let timerInterval; // Variable to hold the timer interval
let animationFrameId;

document.addEventListener("keydown", movePlayer);

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

  player.position = 0;
  char.xPosition = 80;
  char.yPosition = 50;

  // Reset styles
  document.getElementById("line").style.left = player.position + "%";
  document.getElementById("char").style.left = char.xPosition + "%";
  document.getElementById("char").style.bottom = char.yPosition + "%";
}

// Start the game
function startGame() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null; // ensure animationFrameId is reset
  }

  // create the game elements only once
  if (blocks.length === 0) {
    createGameElements();
  }

  // Reset game state
  resetGame();

  // Start the game loop
  gameRunning = true;
  window.requestAnimationFrame(moveChar);
  startTimer();

  document.querySelector(".pause").addEventListener("click", pauseGame);
  document.querySelector(".continue").addEventListener("click", continueGame);
  document.querySelector(".restart").addEventListener("click", restartGame);
}

function moveChar() {
  if (!gameRunning) return; // Stop the loop if the game has ended

  let charDom = document.getElementById("char");
  char.xPosition += char.xOffset;
  char.yPosition += char.yOffset;

  // Reverse direction if the char hits the bounds
  if (char.xPosition <= 0 || char.xPosition >= 90) {
    char.xOffset *= -1;
  }
  if (char.yPosition <= 0 || char.yPosition >= 90) {
    char.yOffset *= -1;
  }

  // Update the char's position
  charDom.style.left = char.xPosition + "%";
  charDom.style.bottom = char.yPosition + "%";

  isInContact();

  // End game condition
  if (char.yPosition <= 0) {
    endGame();
  }

  animationFrameId = requestAnimationFrame(moveChar);
}

function movePlayer(e) {
  if (!gameRunning) return; // Prevent player movement if the game has ended

  let lineElement = document.getElementById("line");
  let currentPercentage = player.position;
  let nextPlayerX;

  if (e.code === "ArrowLeft") {
    nextPlayerX = currentPercentage - player.velocityX;
    if (nextPlayerX > 0) {
      player.position = nextPlayerX;
      lineElement.style.left = nextPlayerX + "%";
    } else {
      // Prevent player from moving beyond the left boundary
      player.position = 0;
      lineElement.style.left = "0%";
    }
  } else if (e.code === "ArrowRight") {
    nextPlayerX = currentPercentage + player.velocityX;
    // Calculate the maximum allowed position
    let maxPercentage = ((containerWidth - playerWidth) / containerWidth) * 100;

    if (nextPlayerX <= maxPercentage) {
      player.position = nextPlayerX;
      lineElement.style.left = nextPlayerX + "%";
    } else {
      // Prevent player from moving beyond the right boundary
      player.position = maxPercentage;
      lineElement.style.left = maxPercentage + "%";
    }
  }
}

function isInContact() {
  let charDom = document.getElementById("char");
  let lineDom = document.getElementById("line");

  for (let index = 0; index < blocks.length; index++) {
    const blockElement = blocks[index];

    if (
      topCollision(charDom, blockElement) ||
      bottomCollision(charDom, blockElement)
    ) {
      console.log("top collision");
      // Reverse the direction of the character if it collides with the line
      char.yOffset *= -1;
      blockElement.style.backgroundColor = "#f6f3f3";
      const index = blocks.indexOf(blockElement);
      if (index > -1) {
        // only splice array when item is found
        blocks.splice(index, 1); // 2nd parameter means remove one item only
        score += 50;
        scoreDom.innerHTML = `<span>Score</span><span>${score}</span>`;
      }
    }

    if (
      leftCollision(charDom, blockElement) ||
      rightCollision(charDom, blockElement)
    ) {
      char.xOffset *= -1;
      console.log("left or right collision");
      blockElement.style.backgroundColor = "#f6f3f3";
      const index = blocks.indexOf(blockElement);
      if (index > -1) {
        // only splice array when item is found
        blocks.splice(index, 1); // 2nd parameter means remove one item only
        score += 50;
        scoreDom.innerHTML = `<span>Score</span><span>${score}</span>`;
      }
    }

    if (bottomCollision(charDom, blockElement)) {
      console.log("bottom touched");
    }
  }

  if (topCollision(charDom, lineDom) && playerHit) {
    console.log("top collision");
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
    console.log("left or right collision");
    playerHit = false;
    setVariableTrueAfterDelay(playerHit); //
  }

  if (isInside(charDom, lineDom)) {
    // handleInsidePosition(char, charDom, lineDom);

    console.log(isRightInside(charDom, lineDom));

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

    console.log(char.xPosition);

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

    resetGame();
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
    alert("Game Over!");
    // Optionally update the UI to show game over status
  }
}

function pauseGame() {
  if (gameRunning) {
    gameRunning = false; // Stop the game loop
    clearInterval(timerInterval); // Stop the timer
  }
}

function continueGame() {
  if (!gameRunning) {
    gameRunning = true;
    window.requestAnimationFrame(moveChar);

    startTimer();
  }
}

function restartGame() {
  createGameElements();

  gameRunning = false;
  clearInterval(timerInterval); // stop the current timer

  lives = 3;
  score = 0;

  // reset the timer
  const timeElement = document.getElementById("info-time");
  timeElement.textContent = "3:00";

  // Restart the game
  startGame();
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


// Initialize the game when the page loads
window.onload = startGame;
