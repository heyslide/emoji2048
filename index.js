var twit = require('twit');
var config = require('./config.js');

var T = new twit(config);

var gameGrid = [ [0, 0, 0, 0],
                 [0, 0, 0, 0],
                 [0, 0, 0, 0],
                 [0, 0, 0, 0] ];

var priorTweet = -1;
var numMovements = 0;
var lastMove = "";
// 0: the game is on, 1: you lost the game
var buildTweetText = 0;
var chosenPallette = 1;
var gameIsWon = false;
const RECOVERCOUNT = 10;
const PALLETTES = [
    [ '\u{25FB}', '\u{2648}', '\u{2649}', '\u{264A}', '\u{264B}', '\u{264C}', '\u{264D}', '\u{264E}', '\u{264F}', '\u{2650}', '\u{2651}', '\u{2652}', '\u{2653}' ],
    [ '\u{25FB}', '\u{1F5A4}', '\u{1F49C}', '\u{1F499}', '\u{1F49A}', '\u{1F49B}', '\u{1F9E1}', '\u{2764}', '\u{1F496}', '\u{1F495}', '\u{1F49E}', '\u{1F49F}',  '\u{1F48C}'],
    [ '\u{25FB}', '\u{1F311}', '\u{1F312}', '\u{1F313}', '\u{1F314}', '\u{1F315}', '\u{1F31D}', '\u{1F316}', '\u{1F317}', '\u{1F318}', '\u{1F31A}', '\u{2B50}', '\u{1F320}']
                  ];


// Auxiliar functions
function getRandNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function gridEquals(grid1, grid2){
    for (i = 0; i < 4; i++) {
        for (j = 0; j < 4; j++) {
            if (grid1[i][j] != grid2[i][j]) return false;
        }
    }
    return true;
}

// moveDirection: move the numbers in the grid according to the chosen direction
function moveUp(grid) {
    for (j = 0; j < 4; j++) {
        for (rep = 0; rep < 3; rep++) { //We have to repeat three times to ensure that it i
            var row = -1;
            for (i = 0; i < 4; i++) {
                if (grid[i][j] == 0) continue;
                if (row == -1) {
                    row = i;
                    continue;
                }
                if (grid[i][j] != grid[row][j]) {
                    row = i;
                    continue;
                }
                if (grid[i][j] == grid[row][j]) {
                    grid[row][j] += 1;
                    if (grid[row][j] == 12) gameIsWon = true;
                    grid[i][j] = 0;
                    row = -1;
                }
            }
        }

        lastZero = 4;
        for (i = 0; i < 4; i++) {
            if (grid[i][j] == 0 && i < lastZero) lastZero = i;
            else if (lastZero != 4) {
                grid[lastZero][j] = grid[i][j];
                grid[i][j] = 0;
                for (z = lastZero; z < i+1; z++) {
                    if (grid[z][j] == 0) {
                        lastZero = z;
                        break;
                    }
                }
            }
        }
    }
}
function moveDown(grid) {
    for (j = 0; j < 4; j++) {
        for (rep = 0; rep < 3; rep++) { //We have to repeat three times to ensure that it i
            var row = -1;
            for (i = 3; i > -1; i--) {
                if (grid[i][j] == 0) continue;
                if (row == -1) {
                    row = i;
                    continue;
                }
                if (grid[i][j] != grid[row][j]) {
                    row = i;
                    continue;
                }
                if (grid[i][j] == grid[row][j]) {
                    grid[row][j] += 1;
                    if (grid[row][j] == 12) gameIsWon = true;
                    grid[i][j] = 0;
                    row = -1;
                }
            }
        }

        lastZero = -1;
        for (i = 3; i > -1; i--) {
            if (grid[i][j] == 0 && i > lastZero) lastZero = i;
            else if (lastZero != -1) {
                grid[lastZero][j] = grid[i][j];
                grid[i][j] = 0;
                for (z = lastZero; z > i-1; z--) {
                    if (grid[z][j] == 0) {
                        lastZero = z;
                        break;
                    }
                }
            }
        }
    }
}
function moveLeft(grid) {
    for (i = 0; i < 4; i++) {
        for (rep = 0; rep < 3; rep++) {
            col = -1;
            for (j = 0; j < 4; j++) {
                if (grid[i][j] == 0) continue;
                if (col == -1) {
                    col = j;
                    continue;
                }
                if (grid[i][j] != grid[i][col]) {
                    col = j;
                    continue;
                }
                if (grid[i][j] == grid[i][col]) {
                    grid[i][col] += 1;
                    if (grid[i][col] == 12) gameIsWon = true;
                    grid[i][j] = 0;
                    col = -1;
                }
            }
        }

        lastZero = 4;
        for (j = 0; j < 4; j++) {
            if (grid[i][j] == 0 && j < lastZero) lastZero = j;
            else if (lastZero != 4) {
                grid[i][lastZero] = grid[i][j];
                grid[i][j] = 0;
                for (z = lastZero; z < j+1; z++) {
                    if (grid[i][z] == 0) {
                        lastZero = z;
                        break;
                    }
                }
            }
        }
    }
}
function moveRight(grid) {
    for (i = 0; i < 4; i++) {
        for (rep = 0; rep < 3; rep++) {
            col = -1;
            for (j = 3; j > -1; j--) {
                if (grid[i][j] == 0) continue;
                if (col == -1) {
                    col = j;
                    continue;
                }
                if (grid[i][j] != grid[i][col]) {
                    col = j;
                    continue;
                }
                if (grid[i][j] == grid[i][col]) {
                    grid[i][col] += 1;
                    if (grid[i][col] == 12) gameIsWon = true;
                    grid[i][j] = 0;
                    col = -1
                }
            }
        }

        lastZero = -1;
        for (j = 3; j > -1; j--) {
            if (grid[i][j] == 0 && j > lastZero) lastZero = j;
            else if (lastZero != -1) {
                grid[i][lastZero] = grid[i][j];
                grid[i][j] = 0;
                for (z = lastZero; z > j-1; z--) {
                    if (grid[i][z] == 0) {
                        lastZero = z;
                        break;
                    }
                }
            }
        }
    }
}

// checkDirection(grid): returns True if the two grids are equal (returns False if there is any possible movement)
function checkUp(grid) {
    checkGrid = JSON.parse(JSON.stringify(grid));
    moveUp(checkGrid);
    if (gridEquals(checkGrid, grid)) return true;
    else return false;
}
function checkDown(grid) {
    checkGrid = JSON.parse(JSON.stringify(grid));
    moveDown(checkGrid);
    if (gridEquals(checkGrid, grid)) return true;
    else return false;
}
function checkLeft(grid) {
    checkGrid = JSON.parse(JSON.stringify(grid));
    moveLeft(checkGrid);
    if (gridEquals(checkGrid, grid)) return true;
    else return false;
}
function checkRight(grid) {
    checkGrid = JSON.parse(JSON.stringify(grid));
    moveRight(checkGrid);
    if (gridEquals(checkGrid, grid)) return true;
    else return false;
}

///// Game functions
// isItFull: checks if the grid is full (before checking if there are any possible movements)
function isItFull(grid) {
    for (i = 0; i < 4; i++) {
        for (j = 0; j < 4; j++) {
            if (grid[i][j] == 0) return false;
        }
    }
    return true;
}

// haveYouLost: returns True if the game is lost (no possible movements)
function haveYouLost(grid) {
    return (checkUp(grid) && checkDown(grid) && checkLeft(grid) && checkRight(grid))
}

// addNewPiece: adds a new number to the grid
function addNewPiece(grid) {
    while (true) {
        var rx = getRandNumber(0, 3);
        var ry = getRandNumber(0, 3);
        if (grid[rx][ry] == 0) {
            var randNew = getRandNumber(1,3);
            grid[rx][ry] = randNew;
            break;
        }
    }
}

// initGame: initialises a new game
function initGame() {
    gameIsWon = false;
    numMovements = 0;
    buildTweetText = 0;
    lastMove = ""
    chosenPallette = getRandNumber(0, PALLETTES.length-1);
    gameGrid = [ [0, 0, 0, 0],
                 [0, 0, 0, 0],
                 [0, 0, 0, 0],
                 [0, 0, 0, 0] ];
    addNewPiece(gameGrid);
}

// checkAvailableMovements: checks in which directions the nummbers can be moved
function checkAvailableMovements(){
    var availableMovements = [];
    if (!checkUp(gameGrid)) availableMovements.push("up");
    if (!checkDown(gameGrid)) availableMovements.push("down");
    if (!checkLeft(gameGrid)) availableMovements.push("left");
    if (!checkRight(gameGrid)) availableMovements.push("right");
    return availableMovements;
}

// buildTweet: builds the text of the tweet
// if state == -1, the game has just started
function buildTweet(grid, state, availableMovements) {
    var gameState = "";
    if (state >= 0) gameState = "@emoji2048\n"; //needed to thread a game

    // Show grid
    for (i = 0; i < 4; i++) {
        for (j = 0; j < 4; j++) {
            gameState = gameState.concat(PALLETTES[chosenPallette][ grid[i][j] ]);
        }
        gameState = gameState.concat("\n");
    }

    // Other data of the game
    if (state == -1) {
        gameState = `${gameState}\n\u{2728} A new game has started!`
    }

    if (state >= 0) gameState = `${gameState}\n\u{23EA} Last movement: ${lastMove}`

    if (state <= 0) {
        gameState = `${gameState}\n\u{2753} Available movements: `
        for (i = 0; i < availableMovements.length; i++) {
            if (i != 0) gameState = `${gameState}, `
            gameState = `${gameState}${availableMovements[i]}`

        }
        gameState = `${gameState}\n\u{0023}\u{FE0F}\u{20E3} Movements made: ${numMovements}`
    }

    if (state == 1) {
        gameState = `${gameState}\n\u{1F4A5} The game has finished. ${numMovements} movements made. A new game will start now.`
    }
    if (state == 2) {
        gameState = `${gameState}\n\u{1F389} You have won this game in ${numMovements} movements! A new game will start now. \u{2764}`
    }
    return gameState;
}

function findAndChooseDirection(data) {
    var tweetTexts = [];
    for (i = 0; i < data.statuses.length; i++) {
        if (priorTweet.localeCompare(data.statuses[i].in_reply_to_status_id_str) == 0) {
            tweetTexts.push(data.statuses[i].text);
        }
    }
    var directionChosen = getRandNumber(0, tweetTexts.length-1);
    if (tweetTexts.length != 0) {
        return tweetTexts[directionChosen].toLowerCase();
    }
    else return "rand"
}

var gameFlow = function() {
    if (priorTweet == -1) {
        initGame();
        var tweetText = buildTweet(gameGrid, -1, checkAvailableMovements());
        T.post('statuses/update', {status: tweetText}, function(err, data, response) {
            if (err) {
                console.log("error on tweeting the first game!", err);
            }
            else {
                priorTweet = data.id_str;
                console.log("Prior tweet: " + priorTweet);
            }
        })
    }
    else {
        T.get('search/tweets', {q: "to:emoji2048", result_type: "recent", count: RECOVERCOUNT, since_id: priorTweet}, function(err, data, response) {
            if(err) console.log("error on searching tweets!", err);
            else {
                var direction = findAndChooseDirection(data);
                if (direction.localeCompare("@emoji2048 up") == 0) {
                    moveUp(gameGrid);
                    lastMove = "up";
                }
                else if (direction.localeCompare("@emoji2048 down") == 0) {
                    moveDown(gameGrid);
                    lastMove = "down";
                }
                else if (direction.localeCompare("@emoji2048 left") == 0) {
                    moveLeft(gameGrid);
                    lastMove = "left";
                }
                else if (direction.localeCompare("@emoji2048 right") == 0) {
                    moveRight(gameGrid);
                    lastMove = "right";
                }
                else {
                    var available = checkAvailableMovements()
                    var randMove = getRandNumber(0, available.length-1);
                    console.log("Available: " + available + ", rand: " + randMove);
                    switch(available[randMove]) {
                        case "up":
                            moveUp(gameGrid);
                            lastMove = "up (random)";
                            break;
                        case "down":
                            moveDown(gameGrid);
                            lastMove = "down (random)";
                            break;
                        case "left":
                            moveLeft(gameGrid);
                            lastMove = "left (random)";
                            break;
                        case "right":
                            moveRight(gameGrid);
                            lastMove = "right (random)";
                            break;
                    }
                }

                //win condition
                if (gameIsWon) {
                    buildTweetText = 2;
                }
                else {
                    ++numMovements;
                    addNewPiece(gameGrid);

                    // loss condition
                    if (isItFull(gameGrid) && haveYouLost(gameGrid)) {
                        console.log("Full grid");
                        buildTweetText = 1;
                    }
                }

                var tweetText = buildTweet(gameGrid, buildTweetText, checkAvailableMovements());
                T.post('statuses/update', {status: tweetText, in_reply_to_status_id: priorTweet}, function(err, data, response) {
                    if (err) {
                        console.log("error on tweeting an update!", err);
                    }
                    else {
                        if (buildTweetText >= 1) priorTweet = -1;
                        else priorTweet = data.id_str;
                        console.log("Prior tweet: " + priorTweet);
                    }
                })
            }
        })

    }
}

gameFlow();
setInterval(gameFlow, 5*60*1000);
