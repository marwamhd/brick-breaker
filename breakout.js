let playerWidth = 130
let playerHeight = 20

let player = {
    width: playerWidth,
    heigth: playerHeight,
    position: 43,
    velocityX: 5
}

let char = {
    xPosition : 80,
    yPosition : 50,
    width : 100,
    heigth : 100,
    xOffset: 1,
    yOffset: 1,
}

// document.querySelectorAll("strawberry").forEach(function(element) {
//     // Your code here
//     console.log(element); // This will log each "strawberry" element
// });


function moveChar(){

    let charDom = document.getElementById("char")
    char.xPosition +=  char.xOffset
    char.yPosition +=  char.yOffset


    if (char.xPosition == 0 || char.xPosition == 90){
        char.xOffset  *=-1
    }

    if (char.yPosition == 0 || char.yPosition == 90){
        char.yOffset  *=-1
    }

    // console.log("we are in ", char.xPosition, char.yPosition)

    charDom.style.left = char.xPosition +"%"
    charDom.style.bottom = char.yPosition +"%"

    document.addEventListener("keydown", movePlayer);


    
    // console.log(document.getElementById("char").offsetTop)
    isInContact();


    if (char.yPosition == 0 && char.yPosition == 0){
        // alert("game over")
        // char.yOffset  *=-1
    }
    requestAnimationFrame(moveChar)
startTimer();

    
}

function movePlayer(e) {
    if (e.code == "ArrowLeft") {
        let nextplayerX = player.position - player.velocityX;
        if (nextplayerX>0) {
            player.position = nextplayerX;
            document.getElementById("line").style.left= nextplayerX+"%"
        }
    }
    else if (e.code == "ArrowRight") {
        let nextplayerX = player.position + player.velocityX;
        if (nextplayerX<85) {
            player.position = nextplayerX;
            document.getElementById("line").style.left= nextplayerX+"%"
        } 
    }
}


function isInContact(){
   let ballx = document.getElementById("char").offsetLeft
   let linex = document.getElementById("line").offsetLeft
   let bally = document.getElementById("char").offsetTop
   let liney = document.getElementById("line").offsetTop

//    console.log("ballx is", ballx, " linex is", linex, "bally is", bally, "lineyis", liney)

   if ((ballx >linex-char.width && ballx < linex+player.width+char.width) && bally > (liney-player.heigth) ){
    char.yOffset  *=-1
   }
}



window.requestAnimationFrame(moveChar)

function startTimer() {
    const timeElement = document.querySelector('.info-time');
    let [minutes, seconds] = timeElement.textContent.split(' ')[0].split(':').map(Number);
    
    const interval = setInterval(() => {
        if (seconds === 0) {
            if (minutes === 0) {
                clearInterval(interval);
                alert('Time is up!');
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
