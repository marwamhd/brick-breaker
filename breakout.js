// Define the initial game settings and elements
let containerWidth = document.getElementById("container").offsetWidth;
let containerHeight = document.getElementById("container").offsetHeight;

let playerWidth = 500;
let playerHeight = 100;

let player = {
    width: playerWidth,
    height: playerHeight,
    position: 43, // Initial position percentage
    velocityX: 5
};

let char = {
    xPosition: 80,
    yPosition: 50,
    width: 100,
    height: 100,
    xOffset: 1,
    yOffset: 1
};

let gameRunning = false; // A flag to control the game loop
let timerInterval; // Variable to hold the timer interval

document.addEventListener("keydown", movePlayer);

// Function to create and append game elements
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
    
    for (let i = 1; i <= 6*4; i++) {
        const strawberry = document.createElement("div");
        strawberry.className = "strawberry";
        strawberry.id = `straw${i}`;
        strawberriesContainer.appendChild(strawberry);
    }
}

// Start the game
function startGame() {
    // Create game elements
    createGameElements();
    
    // Reset game state
    gameRunning = true;
    player.position = 0;
    char.xPosition = 80;
    char.yPosition = 50;
    
    // Reset styles
    document.getElementById("line").style.left = player.position + "%";
    document.getElementById("char").style.left = char.xPosition + "%";
    document.getElementById("char").style.bottom = char.yPosition + "%";
    
    // Start the game loop and timer
    window.requestAnimationFrame(moveChar);
    startTimer();
    
    // Add event listeners to buttons
    document.querySelector(".start").addEventListener("click", startGame);
    document.querySelector(".pause").addEventListener("click", pauseGame);
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

    requestAnimationFrame(moveChar);
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
        let maxPercentage = (containerWidth - playerWidth) / containerWidth * 100;

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



    if (topCollision(charDom, lineDom)) {
        console.log("top collision")
        // Reverse the direction of the character if it collides with the line
        char.yOffset *= -1;
    }

    if (leftCollision(charDom, lineDom) || rightCollision(charDom, lineDom)){
        char.xOffset *= -1;
        console.log("left or right collision")
    } 
}

function startTimer() {
    const timeElement = document.getElementById("info-time");
    let [minutes, seconds] = timeElement.textContent.split(' ')[0].split(':').map(Number);
    
    timerInterval = setInterval(() => {
        if (seconds === 0) {
            if (minutes === 0) {
                clearInterval(timerInterval);
                alert('Time is up!');
                endGame(); // End the game if the time is up
                return;
            } else {
                minutes--;
                seconds = 59;
            }
        } else {
            seconds--;
        }

        timeElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds} Time`;
    }, 1000);
}

function endGame() {
    gameRunning = false; // Stop the game loop
    clearInterval(timerInterval); // Stop the timer
    alert('Game Over!');
    // Optionally update the UI to show game over status
}

function pauseGame() {
    if (gameRunning) {
        gameRunning = false; // Stop the game loop
        clearInterval(timerInterval); // Stop the timer
    }
}

function restartGame() {
    endGame(); // Ensure any ongoing game is stopped
    startGame(); // Restart the game
}

function topCollision(rect1Dom, rect2Dom) { 
    let rect1 = rect1Dom.getBoundingClientRect();
    let rect2 = rect2Dom.getBoundingClientRect();

    // Check if rect1 is colliding with rect2
    if (checkCollision(rect1Dom, rect2Dom)) {
        return (
            rect1.bottom > rect2.top &&   // Bottom of rect1 is below the top of rect2
            rect1.top < rect2.top &&      // Top of rect1 is above the top of rect2
            rect1.right > rect2.left &&   // Right side of rect1 extends beyond the left side of rect2
            rect1.left < rect2.right       // Left side of rect1 extends before the right side of rect2
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
            rect1.right > rect2.left &&   // Right side of rect1 is beyond the left side of rect2
            rect1.left < rect2.left &&    // Left side of rect1 is to the left of the left side of rect2
            rect1.bottom > rect2.top &&   // Bottom of rect1 is below the top of rect2
            rect1.top < rect2.bottom       // Top of rect1 is above the bottom of rect2
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
            rect1.left < rect2.right &&    // Left side of rect1 is before the right side of rect2
            rect1.right > rect2.right &&   // Right side of rect1 is beyond the right side of rect2
            rect1.bottom > rect2.top &&    // Bottom of rect1 is below the top of rect2
            rect1.top < rect2.bottom        // Top of rect1 is above the bottom of rect2
        );
    }

    return false;
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
