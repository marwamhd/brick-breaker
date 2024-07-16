let char = {
    xPosition : 50,
    yPosition : 50,
    width : 100,
    heigth : 100,
    xOffset: 1,
    yOffset: 1,
}

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

    charDom.style.left = char.xPosition +"%"
    charDom.style.bottom = char.yPosition +"%"

    requestAnimationFrame(moveChar)
    
}

window.requestAnimationFrame(moveChar)


