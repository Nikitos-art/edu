import { isPawnMove, isRookMove, isKnightMove, isBishopMove, isKingMove, isQueenMove } from "./moves_logic.js"
import { createChessBoard } from "./chess_board.js";
import { getPawnMoves, getKnightMoves, getRookMoves, getBishopMoves, getKingMoves, getQueenMoves } from "./ai_moves.js";

// TO DO :
// stalemate in Multiplayer mode   


let selectedPiece = null;
let selectedSquare = null;

const PLAYER_ONE = 'white';
const PLAYER_TWO = 'black';
let currentPlayer = PLAYER_ONE;
let firstMoveOfTheGame = true;

let gameMode = ""

let rookFirstMove = {
    kingside: { white: true, black: true },
    queenside: { white: true, black: true }
};

let kingFirstMove = {
    white: true,
    black: true
};

let lastMoveMade = {
    from: "",
    to: "",
    piece: "",
    color: "",
    isCapture: false
}

let socket = null;
let aiActive = false;

let castlingFlag = {
    white: false,
    black: false
};
//////////////////////////////////////////// 


function main() {
    const gameModeSelector = document.getElementById('gameModeSelector');
    const playAIButton = document.getElementById('playAI');
    const playHumanButton = document.getElementById('playHuman');
    const chessBoard = document.getElementById('chessBoardWrapper');
    const preGameWrapper = document.getElementById('chess-wraper-pre');

    gameModeSelector.style.display = 'block';

    playAIButton.addEventListener('click', () => {
        gameModeSelector.style.display = 'none'; 
        chessBoard.style.display = 'flex';
        preGameWrapper.style.display = 'none'; 
        startGame('AI');
        gameMode = 'AI';
        updatePlayerColor(PLAYER_ONE);
    });

    playHumanButton.addEventListener('click', () => {
        gameModeSelector.style.display = 'none'; 
        chessBoard.style.display = 'flex';
        preGameWrapper.style.display = 'none'; 
        startGame('Human');
        gameMode = 'multiplayer';
        const roomName = prompt("Enter room name (or share with a friend):");
        if (roomName) {

            socket = new WebSocket(`ws://${window.location.hostname}:8001/ws/chess/${roomName}/`);
            socket.onopen = () => {
                console.log("Connected to the WebSocket room!");
            };
            
            socket.onmessage = (e) => {
                const data = JSON.parse(e.data);
                
                if (data.type === 'error') {
                    alert(data.message);
                    return;
                }

                if (data.type === 'player_joined') {
                    console.log(`A new player joined the room! They are playing as ${data.player_color}.`);
                }
                
                if (data.color) {
                    updatePlayerColor(data.color);
                }
                // if ('from' in data && 'to' in data) {
                if (data.type === 'move') {
  
                    const move = data.move;
                    selectedSquare = coordinateToDivConverter(move.from);
                    let squareDivObject = coordinateToDivConverter(move.to);

                    const pieceImg = selectedSquare.querySelector('.piece');
                    if (pieceImg) {
                        selectPiece(selectedSquare, pieceImg);
                        makeMove(squareDivObject, null, move.isCapture);
                        if (move.castleMoveFlag) {
                            console.log(`making castling move`);
                            performCastling(move.from, move.to, move.color, kingFirstMove, rookFirstMove);
                            castlingFlag[move.color] = true;
                        }
                    }
                }
            };
            socket.onclose = () => {
                console.log("Disconnected from the WebSocket room.");
            };
           
        }
    });
}


function updatePlayerColor(color) {
    document.getElementById('playerColor').innerText = `You are playing ${color}`;
}

function coordinateToDivConverter(coord) {
    const squares = document.querySelectorAll('#chessboard .square');
    const targetSquare = Array.from(squares).find(square => square.getAttribute('data-coordinate') === coord);
    return targetSquare;
}


function startGame(mode) {
    createChessBoard();
    let squares = document.querySelectorAll('.square'); 

    if (mode === 'AI') {
        const gameLoop = setInterval(() => {
            if (currentPlayer === PLAYER_TWO && !aiActive) {
                handleAITurn();
            }
        }, 500); 
    }

    squares.forEach(square => {
        square.addEventListener('click', () => {
            if (mode === 'AI') {
                if (currentPlayer === PLAYER_ONE) {
                    handlePlayerMove(square);
                }
            } else {
                handlePlayerMove(square);
            } 
        });
    });
}


function handleAITurn() {

    if (aiActive) return; 
    aiActive = true;

    setTimeout(() => {
        const aiMove = calculateBestMoveAI();
        handleAIMove(aiMove);
        aiActive = false; 
    }, 2000); 
}

main();

////////////////////////////////////////////
function updateLastMove(from, to, piece, color, isCapture=false) {
    lastMoveMade.from = from;
    lastMoveMade.to = to;
    lastMoveMade.piece = piece;
    lastMoveMade.color = color;
    lastMoveMade.isCapture = isCapture;
    //console.log(lastMoveMade);
    if (gameMode === 'multiplayer') {
        if (socket && socket.readyState === WebSocket.OPEN) {
            const nextPlayer = color === 'white' ? 'black' : 'white';
            const curSelectedPiece = selectedPiece;
            socket.send(JSON.stringify({
                // type: "move",
                from: from,
                to: to,
                color: color,
                piece: piece,
                currentPlayer: nextPlayer,
                selectedPiecetoPass: curSelectedPiece,
                isCapture: isCapture,
                castleMoveFlag: castlingFlag[color],
            }));
            
        } else {
            console.error("WebSocket is not open. Cannot send move.");
        }
    }
}


function updatePlayerTurn(plColor=PLAYER_ONE) {
    // console.log("*********");
    // console.log(currentPlayer);
    currentPlayer = plColor;
    // console.log(currentPlayer);
    // console.log("*********");
    const playerTurnDisplay = document.getElementById('playerTurn');
    playerTurnDisplay.textContent = `Current Player: ${plColor.charAt(0).toUpperCase() + plColor.slice(1)}`;
    selectedPiece = null;
    selectedSquare = null;
}


function findKing(boardArray, color) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = boardArray[row][col];
            if (square && square.pieceType === 'king' && square.pieceColor === color) {
                return { row, col };
            }
        }
    }

    return null; 
}


function isPawnAttack(fromSquare, toSquare, opponentColor) {
    const fromIndices = getBoardIndices(fromSquare);
    const toIndices = getBoardIndices(toSquare);

    const rowDiff = toIndices.row - fromIndices.row;
    const colDiff = Math.abs(toIndices.col - fromIndices.col);
    const direction = opponentColor === PLAYER_TWO ? 1 : -1;

    return rowDiff === direction && colDiff === 1;
}


function convertToChessCoordinate(row, col) {
    const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    return columns[col] + (8 - row);
}


function isKingInCheck(simulatedBoardArray, currentColor) {
    const kingPosition = findKing(simulatedBoardArray, currentColor);
    const opponentColor = currentColor === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {

            const piece = simulatedBoardArray[row][col];

            if (piece?.pieceColor === opponentColor) {

                const attackFromSquare = convertToChessCoordinate(row, col);
                const toKingSquare = convertToChessCoordinate(kingPosition.row, kingPosition.col);

                if (piece.pieceType === 'rook') {
                    if (isRookMove(attackFromSquare, toKingSquare, opponentColor, simulatedBoardArray)) {
                        return true;
                    }
                }
                
                if (piece.pieceType === 'knight' && isKnightMove(attackFromSquare, toKingSquare, opponentColor)) {
                    return true;
                }
                
                if (piece.pieceType === 'bishop') {
                    if (isBishopMove(attackFromSquare, toKingSquare, opponentColor, simulatedBoardArray)) {
                        return true;
                    }
                }
                
                if (piece.pieceType === 'queen') {
                    if (isQueenMove(attackFromSquare, toKingSquare, opponentColor, simulatedBoardArray)) {
                        return true;
                    } 
                }
                
                if (piece.pieceType === 'king' && isKingMove(attackFromSquare, toKingSquare, kingFirstMove[currentColor], rookFirstMove, opponentColor)) {
                    return true;
                }
                
                if (piece.pieceType === 'pawn' && isPawnAttack(attackFromSquare, toKingSquare, opponentColor)) {
                    return true;
                }
                
            }
        }
    }
    return false; 
}
///////////// END KING IN CHECK////////////////////////////////

function generateAllValidMovesAI() {
    const allMoves = [];
    const squares = document.querySelectorAll('#chessboard .square');

    squares.forEach(square => {
        const pieceImg = square.querySelector('.piece');
        if (pieceImg && pieceImg.src.includes(PLAYER_TWO)) {
            const piece = pieceImg.src.split('/').pop().split('.')[0].split('_')[0];
            const position = square.getAttribute('data-coordinate');
            const validMoves = getValidMovesForPieceAI(piece, square);
            validMoves.forEach(move => {
                allMoves.push({ from: position, to: move });
            });
        }
    });
    return allMoves;
}


function getValidMovesForPieceAI(pieceType, square) {
    const validMoves = [];
    switch (pieceType) {
        case 'pawn':
            validMoves.push(...getPawnMoves(square, PLAYER_TWO));
            break;
        case 'rook':
            validMoves.push(...getRookMoves(square));
            break;
        case 'knight':
            validMoves.push(...getKnightMoves(square));
            break;
        case 'bishop':
            validMoves.push(...getBishopMoves(square));
            break;
        case 'queen':
            validMoves.push(...getQueenMoves(square));
            break;
        case 'king':
            validMoves.push(...getKingMoves(square, PLAYER_TWO));
            break;
        default:
            break;
    }

    return validMoves;

}


function createBoardArray() {
    const squares = document.querySelectorAll('.square'); 
    const boardArray = Array.from({ length: 8 }, () => Array(8).fill(null)); 

    squares.forEach(square => {
        const coordinate = square.getAttribute('data-coordinate'); 
        const { row, col } = getBoardIndices(coordinate); 
        const pieceElement = square.querySelector('.piece'); 

        if (pieceElement) {
            boardArray[row][col] = {
                pieceType: pieceElement.src.split('/').pop().split('_')[0].split('.')[0],
                pieceColor: pieceElement.src.split('/').pop().split('_')[1].split('.')[0]
            };
        }

    });

    return boardArray;
}


function getBoardIndices(square) {
    const row = 8 - parseInt(square[1]);
    const col = square.charCodeAt(0) - 'a'.charCodeAt(0); 
    return { row, col };
}


function evaluateBoardAI(boardArray) {
    let score = 0;

    boardArray.forEach(row => {
        row.forEach(square => {
            if (square) { 
                const pieceType = square.pieceType; 
                const pieceColor = square.pieceColor; 
                const pieceValue = getPieceValueAI(pieceType);
                //console.log(score)
                if (pieceColor === PLAYER_ONE) {
                    score += pieceValue;
                } else if (pieceColor === PLAYER_TWO) {
                    score -= pieceValue;
                }
            }
        });
    });

    return score; 
}


function getPieceValueAI(pieceType) {
    switch (pieceType) {
        case 'pawn': return 1;
        case 'knight': return 3;
        case 'bishop': return 3;
        case 'rook': return 5;
        case 'queen': return 9;
        case 'king': return 100; 
        default: return 0;
    }
}

function simulateMove(move, boardArray) {

    const { from, to } = move;
    const fromIndices = getBoardIndices(from);
    const toIndices = getBoardIndices(to);

    const pieceToMove = boardArray[fromIndices.row][fromIndices.col]; 
    move.capturedPiece = boardArray[toIndices.row][toIndices.col] || null;
    boardArray[fromIndices.row][fromIndices.col] = null; 
    boardArray[toIndices.row][toIndices.col] = pieceToMove;

    return boardArray;
}

function unSimulateMove(move, boardArray) {
    const { from, to, capturedPiece } = move;

    const fromIndices = getBoardIndices(from);
    const toIndices = getBoardIndices(to);

    const pieceToMoveBack = boardArray[toIndices.row][toIndices.col];

    // Restore the piece to the 'from' position
    boardArray[fromIndices.row][fromIndices.col] = pieceToMoveBack;
    boardArray[toIndices.row][toIndices.col] = capturedPiece || null; 
    
    return boardArray;
}


const previousMoves = [];  

function calculateBestMoveAI() {
    const currentBoard = createBoardArray();
    const allMoves = generateAllValidMovesAI();
    let bestMove = null; 
    let bestScore = -Infinity; 

    if (!allMoves || allMoves.length === 0) {
        console.error("No moves generated.");
        return null;
    }

    for (let i = 0; i < allMoves.length; i++) {
        const move = allMoves[i];
        const simulatedArray = simulateMove(move, currentBoard);
        
        if (isKingInCheck(simulatedArray, PLAYER_TWO)) {
            unSimulateMove(move, simulatedArray);
            continue;
        } else {
            let moveScore = evaluateBoardAI(simulatedArray); 
            const isCapturingMove = move.capturedPiece ? true : false; 

            if (isCapturingMove) {
                moveScore += 20;
            } else {
                moveScore += Math.random() * 0.5;
            }

            for (let j = 0; j < previousMoves.length; j++) {
                const prevMove = previousMoves[j]; // Use 'const' because this isn't reassigned
                if (prevMove.from === move.from && prevMove.to === move.to) {
                    moveScore -= 5;
                }
            }

            //console.log("Before undoing move", JSON.stringify(simulatedArray));
            unSimulateMove(move, simulatedArray);

            if (moveScore > bestScore) {
                bestScore = moveScore;
                bestMove = move;
            }
        }
    }

    if (bestMove) {
        previousMoves.push(bestMove);
        if (previousMoves.length > 5) {
            previousMoves.shift(); 
        }
    } else {
        const curBoard = createBoardArray();
        if (isKingInCheck(curBoard, PLAYER_TWO)) {
            alert(`Checkmate! You win!`);
        } else {
            alert(`Stalemate. It's a draw.`);
        }
        
    }

    return bestMove;
}

function handleAIMove(move) {
    //console.log(`handleAIMove: ${move}`);
    const squares = [...document.querySelectorAll('.square')];
    const fromSquare = squares.find(square => square.getAttribute('data-coordinate') === move.from);
    const toSquare = squares.find(square => square.getAttribute('data-coordinate') === move.to);
    let pieceType = null;
    let pieceImg = fromSquare.querySelector('.piece');

    if (pieceImg) {
        pieceType = pieceImg.src.split('/').pop().split('.')[0].split('_')[0];
    }
    
    //const opponentColor = PLAYER_ONE;
    const toPieceImg = toSquare ? toSquare.querySelector('.piece') : null;
    const isCapture = toPieceImg && toPieceImg.src.split('/').pop().split('.')[0].includes(PLAYER_ONE);

    if (isValidMove(pieceImg, fromSquare, toSquare, isCapture, 'AI', PLAYER_TWO)) {
        if (isCapture) {
            toSquare.removeChild(toPieceImg);
        }

        toSquare.appendChild(pieceImg);

        // Handle pawn promotion
        if (pieceType.includes('pawn')) {
            const toRow = parseInt(move.to[1]); 
            //if ((currentPlayer === PLAYER_ONE && toRow === 8) || (currentPlayer === PLAYER_TWO && toRow === 1)) {
            if (currentPlayer === PLAYER_TWO && toRow === 1) {    
                promotePawn(toSquare, PLAYER_TWO);
            }
        }

        updateLastMove(move.from, move.to, pieceType, PLAYER_TWO);
        updatePlayerTurn(PLAYER_ONE);
        
    } else {
        return false;
    }
}


function handlePlayerMove(square) {
    console.log(`called handlePlayerMove`);
    const pieceImg = square.querySelector('.piece');
    let pieceColor = '';
    
    if (pieceImg) {
        pieceColor = pieceImg.src.split('/').pop().split('.')[0].split('_')[1];
    }

    if (isDeselectingSquare(square)) {
        deselectSquare();
        return;
    }

    if (!selectedPiece) {
        let triplCheck = document.getElementById('playerColor').innerText.slice(-5);

        currentPlayer = getCurPlayer();

        if (
            pieceColor === currentPlayer &&
            currentPlayer === triplCheck &&
            !(firstMoveOfTheGame && currentPlayer === PLAYER_TWO)
        ) {
            selectPiece(square, pieceImg);
        }
            
        return;
    }

    const opponentColor = getOpponentColor(currentPlayer);
    const isCapture = isCaptureMove(pieceImg, opponentColor);

    if (canMovePiece(square, isCapture, currentPlayer)) {
        makeMove(square, pieceImg, isCapture);
    } else {
        resetSelection();
    }
}

/** Helper Functions **/

function getCurPlayer() {
    const playerTurnDisplay = document.getElementById('playerTurn').textContent.slice(-5).toLowerCase();
    return playerTurnDisplay;
}

function isDeselectingSquare(square) {
    return selectedSquare === square;
}

function deselectSquare() {
    selectedSquare.classList.remove('selected');
    selectedPiece = null;
    selectedSquare = null;
}

function selectPiece(square, pieceImg) {
    selectedPiece = pieceImg;
    selectedSquare = square;
    square.classList.add('selected');
}

function getOpponentColor(currentPlayer) {
    return currentPlayer === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE;
}

function isCaptureMove(pieceImg, opponentColor) {
    return pieceImg && opponentColor !== currentPlayer;
}

function canMovePiece(square, isCapture, pieceColor) {
    return (!square.querySelector('.piece') || isCapture) &&
        isValidMove(selectedPiece, selectedSquare, square, isCapture, 'user', pieceColor);
}

function makeMove(square, pieceImg = null, isCapture = false) {
    //console.log(`makeMove iscalled`);
    if (isCapture) {
        const capturedPiece = pieceImg || square.querySelector('.piece'); 
        if (capturedPiece) {
            const a = capturedPiece.src.split('/').pop().split('_')[0];
            const b = capturedPiece.src.split('/').pop().split('_')[1].split('.')[0];
            //console.log(`a_b: ${a}_${b}`);
            square.removeChild(capturedPiece);
        } else {
            console.error('Capture error: No piece found to capture!');
        }
    }

    square.appendChild(selectedPiece);
    selectedSquare.classList.remove('selected');

    const selectedPieceType = selectedPiece.src.split('/').pop().split('_')[0];
    const curPlayerPieceColor = selectedPiece.src.split('/').pop().split('_')[1].split('.')[0];

    const fromCoordinate = selectedSquare.getAttribute('data-coordinate');
    const toCoordinate = square.getAttribute('data-coordinate');
    const toRow = parseInt(toCoordinate.charAt(1));

    // if (castleMoveFlag) {
    //     console.log(`making castling move`);
    //     performCastling(fromCoordinate, toCoordinate, curPlayerPieceColor, kingFirstMove, rookFirstMove);
    //     castleMoveFlag = false;
    // }

    if (selectedPieceType.includes('pawn')) {
        checkPawnPromotion(square, toRow, curPlayerPieceColor);
    }

    firstMoveOfTheGame = false;

    updateLastMove(fromCoordinate, toCoordinate, selectedPieceType, curPlayerPieceColor, isCapture);

    if (curPlayerPieceColor === PLAYER_ONE) {
        updatePlayerTurn(PLAYER_TWO);
    } else if (curPlayerPieceColor === PLAYER_TWO) {
        updatePlayerTurn(PLAYER_ONE);
    }
}


function checkPawnPromotion(square, toRow, playerColor) {
    if ((currentPlayer === PLAYER_ONE && toRow === 8) || (currentPlayer === PLAYER_TWO && toRow === 1)) {
        promotePawn(square, playerColor);
    }
}

function resetSelection() {

    if (!selectedSquare) {
        return false;
    }

    selectedSquare.classList.remove('selected');
    selectedPiece = null;
    selectedSquare = null;
}


function promotePawn(square, promPlayerColor) {
    const piece = 'queen';
    const color = promPlayerColor; 
    const queenImg = document.createElement('img');
    queenImg.src = `/static/img/chess_pieces/${piece}_${color}.png`;
    queenImg.classList.add('piece'); 

    square.innerHTML = ''; 
    square.appendChild(queenImg); 
}


function isValidMove(piece, fromSquare, toSquare, isCapture, userOrAI, pieceColor) {

    if (!fromSquare) {
        return false; 
    }

    const squareRegex = /^[a-h][1-8]$/;
    const fromCoordinate = typeof fromSquare === 'string' && squareRegex.test(fromSquare) 
        ? fromSquare 
        : fromSquare.getAttribute('data-coordinate');

    const toCoordinate = typeof toSquare === 'string' && squareRegex.test(toCoordinate) 
        ? toSquare 
        : toSquare.getAttribute('data-coordinate');


    if (userOrAI === 'user') {
 
        const currentBoard = createBoardArray();
        const simulatedMoveBoard = simulateMove({ from: fromCoordinate, to: toCoordinate }, currentBoard, 'user');

        if (isKingInCheck(simulatedMoveBoard, pieceColor)) {
            unSimulateMove({ from: fromCoordinate, to: toCoordinate }, simulatedMoveBoard);
            alert(`${pieceColor} king would be in check if move: ${fromCoordinate} ${toCoordinate}!`);

            return false; 
        }
        unSimulateMove({ from: fromCoordinate, to: toCoordinate }, currentBoard);
    }        

    const pieceType = piece.src.split('/').pop().split('.')[0];
    const targetPiece = toSquare.querySelector('.piece');
    const currentColor = pieceType.includes(PLAYER_ONE) ? PLAYER_ONE : PLAYER_TWO;

    if (targetPiece) {
        const targetPieceType = targetPiece.src.split('/').pop().split('.')[0];
        const targetPieceColor = targetPieceType.includes(PLAYER_ONE) ? PLAYER_ONE : PLAYER_TWO;

        if (targetPieceColor === currentColor) {
            return false; 
        }
    }

    switch (pieceType) {
        case 'pawn_white':
            if (isPawnMove(fromCoordinate, toCoordinate, PLAYER_ONE, isCapture, lastMoveMade, toSquare)) {
                return true;
            }
            break;
        case 'pawn_black':
            if (isPawnMove(fromCoordinate, toCoordinate, PLAYER_TWO, isCapture, lastMoveMade, toSquare)) {
                return true;
            }
            break;
        case 'rook_white':
        case 'rook_black':
            if (isRookMove(fromCoordinate, toCoordinate)) {
                const isKingside = fromCoordinate[0] === 'h'; 
        
                if (isKingside) {
                    rookFirstMove.kingside[currentColor] = false;  
                } else {
                    rookFirstMove.queenside[currentColor] = false;
                }
                return true;
            }
            break;
            
        case 'knight_white':
        case 'knight_black':
            return isKnightMove(fromCoordinate, toCoordinate);
        case 'bishop_white':
        case 'bishop_black':
            return isBishopMove(fromCoordinate, toCoordinate);
        case 'king_white':
        case 'king_black':
            if (isKingMove(fromCoordinate, toCoordinate, kingFirstMove[currentColor])) {
                let isCastling = false;
        
                if (currentColor === PLAYER_ONE && fromCoordinate === 'e1' && 
                    (toCoordinate === 'c1' || toCoordinate === 'g1')) {
                    isCastling = true;
                } else if (currentColor === PLAYER_TWO && fromCoordinate === 'e8' && 
                            (toCoordinate === 'c8' || toCoordinate === 'g8')) {
                    isCastling = true;
                }
        
                if (isCastling) {
                    const currentBoard = createBoardArray();
                    if (isKingInCheck(currentBoard, currentColor)) {
                        return false;  
                    }
        
                    return performCastling(fromCoordinate, toCoordinate, currentColor, kingFirstMove, rookFirstMove);
                }
        
                kingFirstMove[currentColor] = false;
                return true;
            }
            break;
          
        case 'queen_white':
        case 'queen_black':
            return isQueenMove(fromCoordinate, toCoordinate);
        default:
            return false;
    }
}

function performCastling(fromCoordinate, toCoordinate, currentColor, kingFirstMove, rookFirstMove) {

    if (castlingFlag[currentColor]) {
        console.log(`castlingFlag[currentColor] is ${castlingFlag[currentColor]}`);
        return false
    }

    const isKingsideCastling = toCoordinate.charCodeAt(0) > fromCoordinate.charCodeAt(0);
    const rookCurrentPosition = isKingsideCastling 
        ? 'h' + fromCoordinate.charAt(1) 
        : 'a' + fromCoordinate.charAt(1);
    const rookNewPosition = isKingsideCastling 
        ? 'f' + fromCoordinate.charAt(1) 
        : 'd' + fromCoordinate.charAt(1);
    
    const rookElement = document.querySelector(`[data-coordinate="${rookCurrentPosition}"]`);
    const newRookElement = document.querySelector(`[data-coordinate="${rookNewPosition}"]`);

    // Ensure rook exists and can move
    if (rookElement && newRookElement && rookElement.firstChild) {
        newRookElement.appendChild(rookElement.firstChild);
        
        // Update castling rights
        if (isKingsideCastling) {
            rookFirstMove.kingside[currentColor] = false;
        } else {
            rookFirstMove.queenside[currentColor] = false;
        }
    }
    kingFirstMove[currentColor] = false;
    castlingFlag[currentColor] = true;
    return true;
}
