/* COPYRIGHT NOTICE
    This script is public domain, 
    meaning it can freely be used without 
    crediting the authors, even for commercial 
    purposes. For more information, read:
    https://mit-license.org

    This script is meant for phaser-based
    games, but NEITHER the script, nor
    the authors are officially approved 
    or endorsed by Phaser.
*/
const SCcarMechanics = {}
const CarProperties = { // Default properties of the car
    speed: 0, // Current speed of the car
    maxSpeed: 10, // Maximum speed of the car
    power: 0.1, // Power of the car
    reverse: false, // If the car is in reverse gear
    // IF YOU DON'T WANT A FUEL SYSTEM, SET fuel AND maxFuel TO Infinity
    fuel: 100, // Current fuel of the car
    maxFuel: 100, // Maximum fuel of the car
    refuelRate: 0.1, // Rate of refueling
    //--------------------------------
    brakeRate: 0.2, // Rate of braking
    slowDownRate: 1.01, // Rate of natural speed loss
    turnSlowDown: 1.5, // Rate of speed loss when turning
    collisionSpeed: 0.1, // Speed of the car when colliding with an object
    Rpressed: false, // If the R key has been pressed
    direction: "forward", // Current direction of the car
    car: null, // The car sprite
    cursorKeys: this.addCursors(), // The cursor keys
    accelerateKey: this.addButton(Phaser.Keyboard.SPACEBAR), // The key for acceleration
    brakeKey: this.addButton(Phaser.Keyboard.SHIFT), // The key for braking
    reverseKey: this.addButton(Phaser.Keyboard.R), // The key for reverse gear
}

SCcarMechanics.addButton = function(key){ // Loading the key
    return Game.input.keyboard.addKey(key)
}

SCcarMechanics.addCursors = function(){ // Adding the cursor keys
    return Game.input.keyboard.createCursorKeys()
}

SCcarMechanics.accelerate = function(key = CarProperties.accelerateKey){ // Car acceleration & fuel usage
    if(key.isDown && CarProperties.fuel > 0){
        if(CarProperties.speed < CarProperties.maxSpeed && CarProperties.speed > -CarProperties.maxSpeed){
            CarProperties.speed += (positive(CarProperties.speed) + 0.0001) * CarProperties.power // Formula
        }
        CarProperties.fuel -= positive(CarProperties.power)/10 // Formula for using fuel
    }
}

SCcarMechanics.brake = function(key = CarProperties.brakeKey){ // Car braking
    if(key.isDown){ 
        if(CarProperties.speed > 0 && !CarProperties.reverse) 
            CarProperties.speed -= CarProperties.brakeRate
        else if(CarProperties.speed < 0 && CarProperties.reverse)
            CarProperties.speed += CarProperties.brakeRate

        if((CarProperties.speed < 0 && !CarProperties.reverse) || (CarProperties.speed > 0 && CarProperties.reverse)) CarProperties.speed = 0
        /* If we're driving and have speeds on the wrong side (forward/reverse),
           the speed becomes 0
        */
    }
}

SCcarMechanics.speedLoss = function(
    accelerateKey = CarProperties.accelerateKey, 
    brakeKey = CarProperties.brakeKey
){ // Natural speed loss
    if(accelerateKey.isUp && brakeKey.isUp){ // If the two keys for acceleration and braking aren't pressed
        CarProperties.speed /= CarProperties.slowDownRate //Formula
    }
}

SCcarMechanics.turn = function( // Function for changing directions
    keyRight = CarProperties.cursorKeys.right, 
    keyLeft = CarProperties.cursorKeys.left, 
    keyUp = CarProperties.cursorKeys.up, 
    keyDown = CarProperties.cursorKeys.down
){ 
    if(keyRight.isDown && CarProperties.direction != "backward" && CarProperties.direction != "forward"){
// If the key is down and the direction is neither the opposite, nor the same
        CarProperties.direction = "forward" // Change the direction
        CarProperties.speed /= CarProperties.turnSlowDown // Slow down (because of the turn)
    } // You can probably figure out the rest
    else if(keyLeft.isDown && CarProperties.direction != "forward" && CarProperties.direction != "backward"){
        CarProperties.direction = "backward"
        CarProperties.speed /= CarProperties.turnSlowDown
    }
    else if(keyUp.isDown && CarProperties.direction != "down" && CarProperties.direction != "up"){
        CarProperties.direction = "up"
        CarProperties.speed /= CarProperties.turnSlowDown
    }
    else if(keyDown.isDown && CarProperties.direction != "up" && CarProperties.direction != "down"){
        CarProperties.direction = "down"
        CarProperties.speed /= CarProperties.turnSlowDown
    }
}

SCcarMechanics.directions = function(){
    if(direction == "forward"){
        CarProperties.car.x += CarProperties.speed
        CarProperties.car.angle = 270
    }
    else if(direction == "backward"){
        CarProperties.car.x -= CarProperties.speed
        CarProperties.car.angle = 90
    }
    else if(direction == "up"){
        CarProperties.car.y -= CarProperties.speed
        CarProperties.car.angle = 180
    }
    else if(direction == "down"){
        CarProperties.car.y += CarProperties.speed
        CarProperties.car.angle = 0
    }
}

SCcarMechanics.reverseGear = function(key = CarProperties.reverseKey){ // Function for turning on/off reverse gear
    if(CarProperties.speed < 1 && CarProperties.speed > -1 && key.isDown && !CarProperties.Rpressed){
/*  If the key is pressed and the car isn't too fast.
    Rpressed records if the R key has been up since 
    the last time it was pressed (to prevent holding
    recording it as pressed)
*/
        CarProperties.power *= -1 // Reversing the power so it produces negative speed
        CarProperties.reverse = !CarProperties.reverse // Reversing the gear
        CarProperties.Rpressed = true // Recording that R has been pressed
    }

    if(key.isUp) Rpressed = false // Recording that R has been let up
}

SCcarMechanics.refuel = function(refuelRate = CarProperties.refuelRate){ // Function for refueling
    CarProperties.fuel += refuelRate // The car will be refueled as fast as it is set
    if(CarProperties.fuel > CarProperties.maxFuel) // The fuel cannot break the limit (maxFuel)
        {CarProperties.fuel = CarProperties.maxFuel}
}

SCcarMechanics.collision = function(
    obj1, 
    obj2 = CarProperties.car, 
    toleranceX = 0, 
    toleranceY = 0
){ /* Regular collision:
    obj1 CANNOT be inside obj2 */
    let x1 = obj1.x + obj1.width/2 - toleranceX >= obj2.x - obj2.width/2
    let x2 = obj1.x - obj1.width/2 + toleranceX <= obj2.x + obj2.width/2

    let y1 = obj1.y + obj1.height/2 - toleranceY >= obj2.y - obj2.height/2
    let y2 = obj1.y - obj1.height/2 + toleranceY <= obj2.y + obj2.height/2
    return x1 && x2 && y1 && y2
}

SCcarMechanics.borderCollision = function(
    obj1, 
    obj2 = CarProperties.car, 
    toleranceX = 0, 
    toleranceY = 0
){ /* Border collision:
    obj1 can be inside obj2, but CANNOT cross its borders
     */
    let x1 = obj1.x + obj1.width/2 + maxSpeed >= obj2.x - obj2.width/2 && 
    obj1.x + obj1.width/2 - maxSpeed <= obj2.x - obj2.width/2
    let x2 = obj1.x - obj1.width/2 - maxSpeed <= obj2.x + obj2.width/2 &&
    obj1.x - obj1.width/2 + maxSpeed >= obj2.x + obj2.width/2

    let x3 = obj1.x - obj1.width/2 + maxSpeed >= obj2.x - obj2.width/2 && 
    obj1.x - obj1.width/2 - maxSpeed <= obj2.x - obj2.width/2
    let x4 = obj1.x + obj1.width/2 - maxSpeed <= obj2.x + obj2.width/2 &&
    obj1.x + obj1.width/2 + maxSpeed >= obj2.x + obj2.width/2


    let y1 = obj1.y + obj1.height/2 + maxSpeed >= obj2.y - obj2.height/2 &&
    obj1.y + obj1.height/2 - maxSpeed <= obj2.y - obj2.height/2
    let y2 = obj1.y - obj1.height/2 - maxSpeed <= obj2.y + obj2.height/2 &&
    obj1.y - obj1.height/2 + maxSpeed >= obj2.y + obj2.height/2

    let y3 = obj1.y - obj1.height/2 + maxSpeed >= obj2.y - obj2.height/2 &&
    obj1.y - obj1.height/2 - maxSpeed <= obj2.y - obj2.height/2
    let y4 = obj1.y + obj1.height/2 - maxSpeed <= obj2.y + obj2.height/2 &&
    obj1.y + obj1.height/2 + maxSpeed >= obj2.y + obj2.height/2



    let x5 = obj1.x + obj1.width/2 - toleranceX >= obj2.x - obj2.width/2
    let x6 = obj1.x - obj1.width/2 + toleranceX <= obj2.x + obj2.width/2

    let y5 = obj1.y + obj1.height/2 - toleranceY >= obj2.y - obj2.height/2
    let y6 = obj1.y - obj1.height/2 + toleranceY <= obj2.y + obj2.height/2

    return (x1 || x2 || x3 || x4 || y1 || y2 || y3 || y4) && x5 && x6 && y5 && y6
}


    /* If we don't want to record collision with every border,
       we can use one or more of the next 4 functions. */
SCcarMechanics.borderCollisionLeft = function(
    obj1, 
    obj2 = CarProperties.car, 
    toleranceX = 0, 
    toleranceY = 0
){
    let x1 = obj1.x + obj1.width/2 + maxSpeed >= obj2.x - obj2.width/2 && 
    obj1.x + obj1.width/2 - maxSpeed <= obj2.x - obj2.width/2

    let x3 = obj1.x - obj1.width/2 + maxSpeed >= obj2.x - obj2.width/2 && 
    obj1.x - obj1.width/2 - maxSpeed <= obj2.x - obj2.width/2


    let x5 = obj1.x + obj1.width/2 - toleranceX >= obj2.x - obj2.width/2
    let x6 = obj1.x - obj1.width/2 + toleranceX <= obj2.x + obj2.width/2

    let y5 = obj1.y + obj1.height/2 - toleranceY >= obj2.y - obj2.height/2
    let y6 = obj1.y - obj1.height/2 + toleranceY <= obj2.y + obj2.height/2

    return (x1 || x3) && x5 && x6 && y5 && y6
}

SCcarMechanics.borderCollisionRight = function(
    obj1, 
    obj2 = CarProperties.car, 
    toleranceX = 0, 
    toleranceY = 0
){
    let x2 = obj1.x - obj1.width/2 - maxSpeed <= obj2.x + obj2.width/2 &&
    obj1.x - obj1.width/2 + maxSpeed >= obj2.x + obj2.width/2

    let x4 = obj1.x + obj1.width/2 - maxSpeed <= obj2.x + obj2.width/2 &&
    obj1.x + obj1.width/2 + maxSpeed >= obj2.x + obj2.width/2


    let x5 = obj1.x + obj1.width/2 - toleranceX >= obj2.x - obj2.width/2
    let x6 = obj1.x - obj1.width/2 + toleranceX <= obj2.x + obj2.width/2

    let y5 = obj1.y + obj1.height/2 - toleranceY >= obj2.y - obj2.height/2
    let y6 = obj1.y - obj1.height/2 + toleranceY <= obj2.y + obj2.height/2

    return (x2 || x4) && x5 && x6 && y5 && y6
}

SCcarMechanics.borderCollisionTop = function(
    obj1, 
    obj2 = CarProperties.car, 
    toleranceX = 0, 
    toleranceY = 0
){
    let y1 = obj1.y + obj1.height/2 + maxSpeed >= obj2.y - obj2.height/2 &&
    obj1.y + obj1.height/2 - maxSpeed <= obj2.y - obj2.height/2

    let y3 = obj1.y - obj1.height/2 + maxSpeed >= obj2.y - obj2.height/2 &&
    obj1.y - obj1.height/2 - maxSpeed <= obj2.y - obj2.height/2


    let x5 = obj1.x + obj1.width/2 - toleranceX >= obj2.x - obj2.width/2
    let x6 = obj1.x - obj1.width/2 + toleranceX <= obj2.x + obj2.width/2

    let y5 = obj1.y + obj1.height/2 - toleranceY >= obj2.y - obj2.height/2
    let y6 = obj1.y - obj1.height/2 + toleranceY <= obj2.y + obj2.height/2

    return (y1 || y3) && x5 && x6 && y5 && y6
}

SCcarMechanics.borderCollisionBottom = function(
    obj1, 
    obj2 = CarProperties.car, 
    toleranceX = 0, 
    toleranceY = 0
){
    let y2 = obj1.y - obj1.height/2 - maxSpeed <= obj2.y + obj2.height/2 &&
    obj1.y - obj1.height/2 + maxSpeed >= obj2.y + obj2.height/2

    let y4 = obj1.y + obj1.height/2 - maxSpeed <= obj2.y + obj2.height/2 &&
    obj1.y + obj1.height/2 + maxSpeed >= obj2.y + obj2.height/2


    let x5 = obj1.x + obj1.width/2 - toleranceX >= obj2.x - obj2.width/2
    let x6 = obj1.x - obj1.width/2 + toleranceX <= obj2.x + obj2.width/2

    let y5 = obj1.y + obj1.height/2 - toleranceY >= obj2.y - obj2.height/2
    let y6 = obj1.y - obj1.height/2 + toleranceY <= obj2.y + obj2.height/2

    return (y2 || y4) && x5 && x6 && y5 && y6
}