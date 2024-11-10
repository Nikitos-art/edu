import { isPawnMove, isRookMove, isKnightMove, isBishopMove, isKingMove, isQueenMove } from "./moves_logic.js"
import { createChessBoard } from "./chess_board.js";
import { getPawnMoves, getKnightMoves, getRookMoves, getBishopMoves, getKingMoves, getQueenMoves } from "./ai_moves.js";

let selectedPiece = null;
let selectedSquare = null;

let currentPlayer = 'white';

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
    color: ""
}

function updateLastMove(from, to, piece, color) {
    lastMoveMade.from = from;
    lastMoveMade.to = to;
    lastMoveMade.piece = piece;
    lastMoveMade.color = color;
    //console.log(lastMoveMade);
}

function updatePlayerTurn() {
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white'; 
    const playerTurnDisplay = document.getElementById('playerTurn');
    playerTurnDisplay.textContent = `Current Player: ${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}`;
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
    const direction = opponentColor === 'black' ? 1 : -1;

    return rowDiff === direction && colDiff === 1;
}


function convertToChessCoordinate(row, col) {
    const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    return columns[col] + (8 - row);
}


function isKingInCheck(simulatedBoardArray, currentColor) {

    const kingPosition = findKing(simulatedBoardArray, currentColor);
    
    // if (!kingPosition) {
    //     console.log(`King for ${currentColor} not found on the board!`); 
    //     console.log("Current board state: ", simulatedBoardArray);
    //     return false;
    // }
    
    const opponentColor = currentColor === 'white' ? 'black' : 'white';

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {

            const piece = simulatedBoardArray[row][col];

            if (piece?.pieceColor === opponentColor) {

                const attackFromSquare = convertToChessCoordinate(row, col);
                const toKingSquare = convertToChessCoordinate(kingPosition.row, kingPosition.col);

                if (piece.pieceType === 'rook') {
                    if (isRookMove(attackFromSquare, toKingSquare, opponentColor, simulatedBoardArray)) {
                        //console.log(`would be in check from ROOK move from | to : ${attackFromSquare} | ${toKingSquare}`);
                        return true;
                    }
                }
                
                if (piece.pieceType === 'knight' && isKnightMove(attackFromSquare, toKingSquare, opponentColor)) {
                    //console.log(`would be in check from KNIGHT move from | to : ${attackFromSquare} | ${toKingSquare}`);
                    return true;
                }
                
                if (piece.pieceType === 'bishop') {
                    if (isBishopMove(attackFromSquare, toKingSquare, opponentColor, simulatedBoardArray)) {
                        //console.log(`would be in check from BISHOP move from | to : ${attackFromSquare} | ${toKingSquare}`);
                        return true;
                    }
                }
                
                if (piece.pieceType === 'queen') {
                    if (isQueenMove(attackFromSquare, toKingSquare, opponentColor, simulatedBoardArray)) {
                       // console.log(`would be in check from QUEEN move from | to : ${attackFromSquare} | ${toKingSquare}`);
                        return true;
                    } 
                }
                
                if (piece.pieceType === 'king' && isKingMove(attackFromSquare, toKingSquare, kingFirstMove, rookFirstMove, opponentColor)) {
                   // console.log(`would be in check from KING move from | to : ${attackFromSquare} | ${toKingSquare}`);
                    return true;
                }
                
                if (piece.pieceType === 'pawn' && isPawnAttack(attackFromSquare, toKingSquare, opponentColor)) {
                   // console.log(`would be in check from PAWN move from | to : ${attackFromSquare} | ${toKingSquare}`);
                    return true;
                }
                
            }
        }
    }
    return false; 
}
///////////// END KING IN CHECK////////////////////////////////

function generateAllValidMoves() {
    const allMoves = [];
    const squares = document.querySelectorAll('#chessboard .square');

    squares.forEach(square => {
        const pieceImg = square.querySelector('.piece');
        if (pieceImg && pieceImg.src.includes('black')) {
            const piece = pieceImg.src.split('/').pop().split('.')[0].split('_')[0];
            const position = square.getAttribute('data-coordinate');
            const validMoves = getValidMovesForPiece(piece, square);
            validMoves.forEach(move => {
                allMoves.push({ from: position, to: move });
            });
        }
    });
    return allMoves;
}


function getValidMovesForPiece(pieceType, square) {
    const validMoves = [];
    switch (pieceType) {
        case 'pawn':
            validMoves.push(...getPawnMoves(square, 'black'));
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
            validMoves.push(...getKingMoves(square, 'black'));
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


function evaluateBoard(boardArray) {
    let score = 0;

    boardArray.forEach(row => {
        row.forEach(square => {
            if (square) { 
                const pieceType = square.pieceType; 
                const pieceColor = square.pieceColor; 
                const pieceValue = getPieceValue(pieceType);
                //console.log(score)
                if (pieceColor === 'white') {
                    score += pieceValue;
                } else if (pieceColor === 'black') {
                    score -= pieceValue;
                }
            }
        });
    });

    return score; 
}


function getPieceValue(pieceType) {
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
    
    //console.log(`Board after undoing move:`, JSON.stringify(boardArray));
    return boardArray;
}


const previousMoves = [];  

function calculateBestMove() {
    const currentBoard = createBoardArray();
    const allMoves = generateAllValidMoves();
    let bestMove = null; 
    let bestScore = -Infinity; 

    if (!allMoves || allMoves.length === 0) {
        console.error("No moves generated.");
        return null;
    }

    for (let i = 0; i < allMoves.length; i++) {
        const move = allMoves[i];
        const simulatedArray = simulateMove(move, currentBoard);
        
        if (isKingInCheck(simulatedArray, 'black')) {
            unSimulateMove(move, simulatedArray);
            continue;
        } else {
            let moveScore = evaluateBoard(simulatedArray); 
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
        alert(`Checkmate! You win!`);
        console.error("No valid move found.");
    }

    return bestMove;
}

function handleAIMove(move) {
    const squares = [...document.querySelectorAll('.square')];
    const fromSquare = squares.find(square => square.getAttribute('data-coordinate') === move.from);
    const toSquare = squares.find(square => square.getAttribute('data-coordinate') === move.to);
    let pieceType = null;
    let pieceImg = fromSquare.querySelector('.piece');

    //console.log(`AI is moving from: ${move.from}, to: ${move.to}`); 

    if (pieceImg) {
        pieceType = pieceImg.src.split('/').pop().split('.')[0].split('_')[0];
        //console.log(`Piece being moved: ${pieceType}`);
    }
    
    const opponentColor = 'white';
    const toPieceImg = toSquare ? toSquare.querySelector('.piece') : null;
    const isCapture = toPieceImg && toPieceImg.src.split('/').pop().split('.')[0].includes(opponentColor);

    if (isValidMove(pieceImg, fromSquare, toSquare, isCapture, 'AI')) {
        if (isCapture) {
            toSquare.removeChild(toPieceImg);
        }

        toSquare.appendChild(pieceImg);

        // Handle pawn promotion
        if (pieceType.includes('pawn')) {
            const toRow = parseInt(move.to[1]); 
            if ((currentPlayer === 'white' && toRow === 8) || (currentPlayer === 'black' && toRow === 1)) {
                promotePawn(toSquare);
            }
        }

        updateLastMove(move.from, move.to, pieceType, "black");
        updatePlayerTurn();
    } else {
        return false;
    }
}


/////////////////////////////END AI SMART MOVES/////////////////////////////////////////////

// function handlePlayerMove(square) {
//     const pieceImg = square.querySelector('.piece');
//     let pieceType = null;
//     let pieceColor = "white";

//     if (pieceImg) {
//         pieceType = pieceImg.src.split('/').pop().split('.')[0];
//         pieceColor = pieceType ? (pieceType.includes('white') ? 'white' : 'black') : null; 
//     }

//     // Deselect the selected square
//     if (selectedSquare === square) {
//         selectedSquare.classList.remove('selected');
//         selectedPiece = null;
//         selectedSquare = null;
//         return;
//     }

//     // if (selectedPiece && !isValidMove(selectedPiece, square)) {
//     //     selectedSquare.classList.remove('selected');
//     //     selectedPiece = null;
//     //     selectedSquare = null;
//     //     return;
//     // }

//     // Only allow the current player's pieces to be selected
//     if (!selectedPiece) {
//         if (pieceColor === currentPlayer) {
//             selectedPiece = pieceImg;
//             selectedSquare = square;
//             square.classList.add('selected');
//             return;
//         } else {
//             return;
//         }
//     } else {

//         const opponentColor = 'black';
//         const isCapture = pieceImg && opponentColor !== currentPlayer;

//         // Only attempt to move if it's an empty square or a capture
//         if (!pieceImg || isCapture) {
//             if (isValidMove(selectedPiece, selectedSquare, square, isCapture, 'user')) {
//                 //console.log(`square: ${square}`)
//                 if (isCapture) {
//                     square.removeChild(pieceImg);
//                 }

//                 square.appendChild(selectedPiece);
//                 selectedSquare.classList.remove('selected');

//                 const selectedPieceType = selectedPiece.src.split('/').pop().split('.')[0].split('_')[0];
                
//                 const fromCoordinate = selectedSquare.getAttribute('data-coordinate');

//                 const toCoordinate = square.getAttribute('data-coordinate');
//                 const toRow = parseInt(toCoordinate.charAt(1));

//                 if (selectedPieceType.includes('pawn')) {
//                     if ((currentPlayer === 'white' && toRow === 8) || (currentPlayer === 'black' && toRow === 1)) {
//                         promotePawn(square);
//                     }
//                 }

//                 updateLastMove(fromCoordinate, toCoordinate, selectedPieceType, "white");
//                 updatePlayerTurn();
//             }
//         }
//         selectedPiece = null;
//         selectedSquare = null;
//     }
// }
function handlePlayerMove(square) {
    const pieceImg = square.querySelector('.piece');
    let pieceType = null;
    let pieceColor = "white";

    if (pieceImg) {
        pieceType = pieceImg.src.split('/').pop().split('.')[0];
        pieceColor = pieceType ? (pieceType.includes('white') ? 'white' : 'black') : null; 
    }

    // Deselect the selected square
    if (selectedSquare === square) {
        selectedSquare.classList.remove('selected');
        selectedPiece = null;
        selectedSquare = null;
        return;
    }

    // Only allow the current player's pieces to be selected
    if (!selectedPiece) {
        if (pieceColor === currentPlayer) {
            selectedPiece = pieceImg;
            selectedSquare = square;
            square.classList.add('selected');
            return;
        } else {
            return;
        }
    } else {
        const opponentColor = 'black';
        const isCapture = pieceImg && opponentColor !== currentPlayer;

        // Only attempt to move if it's an empty square or a capture
        if ((!pieceImg || isCapture) && isValidMove(selectedPiece, selectedSquare, square, isCapture, 'user')) {
            if (isCapture) {
                square.removeChild(pieceImg);
            }
            square.appendChild(selectedPiece);
            selectedSquare.classList.remove('selected');

            const selectedPieceType = selectedPiece.src.split('/').pop().split('.')[0].split('_')[0];
            const fromCoordinate = selectedSquare.getAttribute('data-coordinate');
            const toCoordinate = square.getAttribute('data-coordinate');
            const toRow = parseInt(toCoordinate.charAt(1));

            if (selectedPieceType.includes('pawn')) {
                if ((currentPlayer === 'white' && toRow === 8) || (currentPlayer === 'black' && toRow === 1)) {
                    promotePawn(square);
                }
            }

            updateLastMove(fromCoordinate, toCoordinate, selectedPieceType, "white");
            updatePlayerTurn();
            
            selectedPiece = null;
            selectedSquare = null;
        } else {
            // Reset selection only if no valid move was made
            selectedSquare.classList.remove('selected');
            selectedPiece = null;
            selectedSquare = null;
        }
    }
}


function promotePawn(square) {
    const piece = 'queen';
    const color = currentPlayer; 
    const queenImg = document.createElement('img');
    queenImg.src = `/static/img/chess_pieces/${piece}_${color}.png`;
    queenImg.classList.add('piece'); 

    square.innerHTML = ''; 
    square.appendChild(queenImg); 
}


function isValidMove(piece, fromSquare, toSquare, isCapture, userOrAI) {
    const squareRegex = /^[a-h][1-8]$/;

    const fromCoordinate = typeof fromSquare === 'string' && squareRegex.test(fromSquare) 
        ? fromSquare 
        : fromSquare.getAttribute('data-coordinate');

    const toCoordinate = typeof toSquare === 'string' && squareRegex.test(toCoordinate) 
        ? toSquare 
        : toSquare.getAttribute('data-coordinate');

    //console.log(`toSquare: ${toSquare} \n toCoordinate: ${toCoordinate}`)

    if (userOrAI === 'user') {
 
        const currentBoard = createBoardArray();
        const simulatedMoveBoard = simulateMove({ from: fromCoordinate, to: toCoordinate }, currentBoard, 'user');

        if (isKingInCheck(simulatedMoveBoard, 'white')) {
            unSimulateMove({ from: fromCoordinate, to: toCoordinate }, simulatedMoveBoard);
            alert(`White king would be in check if move: ${fromCoordinate} ${toCoordinate}!`);
            // alert(`White king would be in check if move: ${fromCoordinate} ${toCoordinate}!\n
            //      Board simulation: ${JSON.stringify(simulatedMoveBoard)}`);
            //after simulation: ${JSON.stringify(simulatedMoveBoard, null, 2)}\n
            return false; 
        }
        unSimulateMove({ from: fromCoordinate, to: toCoordinate }, currentBoard);
    }        

    const pieceType = piece.src.split('/').pop().split('.')[0];
    const targetPiece = toSquare.querySelector('.piece');
    const currentColor = pieceType.includes('white') ? 'white' : 'black';

    if (targetPiece) {
        const targetPieceType = targetPiece.src.split('/').pop().split('.')[0];
        const targetPieceColor = targetPieceType.includes('white') ? 'white' : 'black';

        if (targetPieceColor === currentColor) {
            return false; 
        }
    }

    switch (pieceType) {
        case 'pawn_white':
            if (isPawnMove(fromCoordinate, toCoordinate, 'white', isCapture, lastMoveMade, toSquare)) {
                //console.log(`white pawn move ${fromCoordinate} ${toCoordinate}`);
                return true;
            }
            break;
        case 'pawn_black':
            if (isPawnMove(fromCoordinate, toCoordinate, 'black', isCapture, lastMoveMade, toSquare)) {
               // console.log(`black pawn move ${fromCoordinate} ${toCoordinate}`)
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
            // Ensure it's a valid king move
            if (isKingMove(fromCoordinate, toCoordinate, kingFirstMove[currentColor], rookFirstMove, currentColor)) {
        
                // Initializing a variable for castling check
                let isCastling = false;
        
                // Handle castling only if king is at the initial position
                if (currentColor === "white") {
                    if (fromCoordinate === 'e1') {
                        // Kingside or Queenside castling
                        if (toCoordinate === 'c1' || toCoordinate === 'g1') {
                            isCastling = true;
                        }
                    }
                } else if (currentColor === "black") {
                    if (fromCoordinate === 'e8') {
                        // Kingside or Queenside castling
                        if (toCoordinate === 'c8' || toCoordinate === 'g8') {
                            isCastling = true;
                        }
                    }
                }
        
                if (isCastling) {
                    const currentBoard = createBoardArray();
                    if (isKingInCheck(currentBoard, currentColor)) {
                        return false;  // King is in check, so castling is not allowed
                    }
        
                    const isKingsideCastling = toCoordinate.charCodeAt(0) > fromCoordinate.charCodeAt(0);
        
                    if (isKingsideCastling) {
                        // Handle kingside castling
                        const rookCurrentPosition = 'h' + fromCoordinate.charAt(1);
                        const rookNewPosition = 'f' + fromCoordinate.charAt(1);
                        const rookElement = document.querySelector(`[data-coordinate="${rookCurrentPosition}"]`);
                        const newRookElement = document.querySelector(`[data-coordinate="${rookNewPosition}"]`);
        
                        if (rookElement && newRookElement && rookElement.firstChild) {
                            newRookElement.appendChild(rookElement.firstChild);
                            rookFirstMove.kingside[currentColor] = false;
                        }
                    } else {
                        // Handle queenside castling
                        const rookCurrentPosition = 'a' + fromCoordinate.charAt(1);
                        const rookNewPosition = 'd' + fromCoordinate.charAt(1);
                        const rookElement = document.querySelector(`[data-coordinate="${rookCurrentPosition}"]`);
                        const newRookElement = document.querySelector(`[data-coordinate="${rookNewPosition}"]`);
        
                        if (rookElement && newRookElement && rookElement.firstChild) {
                            newRookElement.appendChild(rookElement.firstChild);
                            rookFirstMove.queenside[currentColor] = false;
                        }
                    }
        
                    kingFirstMove[currentColor] = false;
                    return true;
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


function main() {
    createChessBoard();
    let squares = document.querySelectorAll('.square');

    squares.forEach(square => {
        square.addEventListener('click', () => {
            if (currentPlayer === 'white') {
                handlePlayerMove(square);
                if (currentPlayer === 'black') {
                    handleAITurn(); 
                }
            }
        });
    });
}


function handleAITurn() {
    setTimeout(() => {
        const aiMove = calculateBestMove();
        handleAIMove(aiMove);
    }, 1500); 
}


main();