import { isPawnMove, isRookMove, isKnightMove, isBishopMove, isKingMove, isQueenMove } from "./moves_logic.js"
import { createChessBoard } from "./chess_board.js";
import { getPawnMoves, getKnightMoves, getRookMoves, getBishopMoves, getKingMoves, getQueenMoves } from "./ai_moves.js";

let selectedPiece = null;
let selectedSquare = null;

let currentPlayer = 'white';
let prevPlayerMoveColor = 'black';
/// Current problems:
/// 1) Couldnt move bishop to block check
/// 2) AI moves into check 
/// 3) Player and AI alike can make moves to expose their king to being in check
/// 4) Castling is still fucked up 

function updatePlayerTurn() {
    prevPlayerMoveColor = currentPlayer;
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white'; 
    const playerTurnDisplay = document.getElementById('playerTurn');
    playerTurnDisplay.textContent = `Current Player: ${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}`;
}


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
    //console.log(allMoves);    
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
    //console.log(`------validMoves: ${validMoves}-------`);
    return validMoves;
}

/////////////////////// AI SMART MOVES ////////////////////////////////////////////


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
    const col = square.charCodeAt(0) - 'a'.charCodeAt(0); 
    const row = 8 - parseInt(square[1]); 
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
    //console.log(`simulating move: ${move.from}${move.to}`);
    // Convert coordinates to array indices
    const fromIndices = getBoardIndices(from);
    const toIndices = getBoardIndices(to);

    // Simulate the move in the boardArray
    const pieceToMove = boardArray[fromIndices.row][fromIndices.col];
    
    // Store the piece being captured if any
    move.capturedPiece = boardArray[toIndices.row][toIndices.col];

    // Move the piece
    boardArray[toIndices.row][toIndices.col] = pieceToMove; // Move to the 'to' square
    boardArray[fromIndices.row][fromIndices.col] = null;    // Empty the 'from' square

    return boardArray;
}


function unSimulateMove(move, boardArray) {
    const { from, to, capturedPiece } = move;
    //console.log(`UNsimulating move: ${move.from}${move.to}`);
    // Convert coordinates to array indices
    const fromIndices = getBoardIndices(from);
    const toIndices = getBoardIndices(to);
    
    // Undo the move in the boardArray
    boardArray[fromIndices.row][fromIndices.col] = boardArray[toIndices.row][toIndices.col]; // Move back to 'from' square
    boardArray[toIndices.row][toIndices.col] = capturedPiece; // Restore captured piece (if any)

    return boardArray;
}

const previousMoves = []; 

function calculateBestMove() {
    const allMoves = generateAllValidMoves();
    let bestMove = null;
    let bestScore = -Infinity; 

    if (!allMoves || allMoves.length === 0) {
        console.error("No moves generated.");
        return null;
    }

    allMoves.forEach(move => {
        //console.log(`${move.from}, ${move.to}`);

        // if (move === null || isCyclicMove(move)) {
        //     console.log(`Invalid or cyclic move: ${move}`);
        //     return;
        // } 

        let boardArray = createBoardArray();
        let isCapturingMove = isCapturing(move, boardArray);
        let boardAfterSimulatedMove = simulateMove(move, boardArray);
        // Check if the king is in check after the move
        if (isKingInCheck(boardAfterSimulatedMove, 'black')) {
            //console.log(`Move skipped, king would be in check: ${move.from} -> ${move.to}`);
            unSimulateMove(move, boardAfterSimulatedMove); 
            return; // Skip to the next move if king is in check
        }

        let moveScore = evaluateBoard(boardAfterSimulatedMove);
        
        if (isCapturingMove) {
            moveScore += 10; // Encourage capturing moves
        }
        
        // Randomness: small chance to slightly modify the score for some variety
        moveScore += Math.random() * 0.5;

        unSimulateMove(move, boardAfterSimulatedMove);     

        // Update the best move
        if (moveScore > bestScore) {
            bestScore = moveScore;
            bestMove = move;
            //console.log(`New best move found: ${move.from} -> ${move.to} with score ${moveScore}`);
        }
    });

    // Avoid repetition: store the last few moves
    if (bestMove) {
        previousMoves.push(bestMove);
        if (previousMoves.length > 5) {
            previousMoves.shift();
        }
    } else {
        alert(`Checkmate! You win!`);
        console.error("No valid move found.");
    }
    //console.log(`Best move selected: ${bestMove ? bestMove.from : 'none'}, ${bestMove ? bestMove.to : 'none'}`);
    return bestMove;    
}


// function isCyclicMove(move) {
//     const { from, to } = move;

//     if (previousMoves.length === 0) return false;

//     const lastMove = previousMoves[previousMoves.length - 1];
    
//     const isCyclic = (lastMove.from === from && lastMove.to === to) ||
//                      (lastMove.from === to && lastMove.to === from);

//     return isCyclic;
// }


function isCapturing(move, boardArray) {
    const { to } = move;
    const { row, col } = getBoardIndices(to);
    return boardArray[row][col] !== null; 
}

function handleAIMove(move) {

    const squares = [...document.querySelectorAll('.square')];
    const fromSquare = squares.find(square => square.getAttribute('data-coordinate') === move.from);
    const toSquare = squares.find(square => square.getAttribute('data-coordinate') === move.to);

    let pieceType = null;
    let pieceImg = fromSquare.querySelector('.piece');

    if (pieceImg) {
        pieceType = pieceImg.src.split('/').pop().split('.')[0];
    }
    
    const opponentColor = 'white';
    const toPieceImg = toSquare ? toSquare.querySelector('.piece') : null;
    const isCapture = toPieceImg && toPieceImg.src.split('/').pop().split('.')[0].includes(opponentColor);

    if (isValidMove(pieceImg, fromSquare, toSquare, isCapture, 'AI')) {

        if (isCapture) {
            toSquare.removeChild(toPieceImg);
        }
        toSquare.appendChild(pieceImg);

        //Handle pawn promotion
        if (pieceType.includes('pawn')) {
            const toRow = parseInt(move.to[1]); 
            if ((currentPlayer === 'white' && toRow === 8) || (currentPlayer === 'black' && toRow === 1)) {
                promotePawn(toSquare);
            }
        }
        updatePlayerTurn()
    } else {
        return false;
    }
    // console.log(`
    //     \n-----------------------------------
    //     \n AI made a move.
    //     \n from:  ${move.from} 
    //     \n to:    ${move.to}
    //     \n piece: ${pieceType}
    //     \n-----------------------------------`);

}

/////////////////////////////END AI SMART MOVES/////////////////////////////////////////////
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
        if (!pieceImg || isCapture) {
            if (isValidMove(selectedPiece, selectedSquare, square, isCapture, 'user')) {
                if (isCapture) {
                    square.removeChild(pieceImg);
                }

                square.appendChild(selectedPiece);
                selectedSquare.classList.remove('selected');

                const selectedPieceType = selectedPiece.src.split('/').pop().split('.')[0];

                const toCoordinate = square.getAttribute('data-coordinate');
                const toRow = parseInt(toCoordinate.charAt(1));

                if (selectedPieceType.includes('pawn')) {
                    if ((currentPlayer === 'white' && toRow === 8) || (currentPlayer === 'black' && toRow === 1)) {
                        promotePawn(square);
                    }
                }

                updatePlayerTurn();
            }
        }
        selectedPiece = null;
        selectedSquare = null;
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
///////////// KING IN CHECK //////////////////////////////////
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
    const direction = opponentColor === 'white' ? 1 : -1;

    return rowDiff === direction && colDiff === 1;
}


function convertToChessCoordinate(row, col) {
    const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    return columns[col] + (8 - row);
}

function isKingInCheck(boardArray, currentColor) {
    const kingPosition = findKing(boardArray, currentColor);
    if (!kingPosition) return false; 
    
    const opponentColor = currentColor === 'white' ? 'black' : 'white';

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = boardArray[row][col];
            if (piece && piece.pieceColor === opponentColor) {
                const fromSquare = convertToChessCoordinate(row, col);
                const toSquare = convertToChessCoordinate(kingPosition.row, kingPosition.col);

                //console.log(`---------\nchecking king from/to\n${fromSquare}/${toSquare}\ncurrentColor: ${currentColor}\n----------`);

                if (piece.pieceType === 'rook' && isRookMove(fromSquare, toSquare, opponentColor)) {
                    console.log(`king's in check from rook's move`)
                    return true; 
                }
                if (piece.pieceType === 'knight' && isKnightMove(fromSquare, toSquare, opponentColor)) {
                    return true; 
                }
                if (piece.pieceType === 'bishop' && isBishopMove(fromSquare, toSquare, opponentColor)) {
                    return true;
                }
                if (piece.pieceType === 'queen' && isQueenMove(fromSquare, toSquare, opponentColor)) {
                    return true;
                }
                if (piece.pieceType === 'king' && isKingMove(fromSquare, toSquare, opponentColor)) {
                    return true;
                }
                // if (piece.pieceType === 'pawn' && isPawnMove(fromSquare, toSquare, opponentColor)) {
                //     return true; 
                // }
                if (piece.pieceType === 'pawn' && isPawnAttack(fromSquare, toSquare, opponentColor)) {
                    return true; 
                }
            }
        }
    }
    return false; 
}
///////////// END KING IN CHECK////////////////////////////////


function isValidMove(piece, fromSquare, toSquare, isCapture, userOrAI) {

    const squareRegex = /^[a-h][1-8]$/;

    const fromCoordinate = typeof fromSquare === 'string' && squareRegex.test(fromSquare) 
        ? fromSquare 
        : fromSquare.getAttribute('data-coordinate');

    const toCoordinate = typeof toSquare === 'string' && squareRegex.test(toSquare) 
        ? toSquare 
        : toSquare.getAttribute('data-coordinate');

    if (userOrAI === 'user') {

        let currentBoard = createBoardArray();
        let simulatedMoveBoard = simulateMove({ from: fromCoordinate, to: toCoordinate }, currentBoard);
        
        if (isKingInCheck(simulatedMoveBoard, 'white')) {
            unSimulateMove({ from: fromCoordinate, to: toCoordinate }, simulatedMoveBoard);
            alert(`White king is in check!`);
            return false; 
        }
    
        unSimulateMove({ from: fromCoordinate, to: toCoordinate }, currentBoard);
    }        

    const pieceType = piece.src.split('/').pop().split('.')[0];
    const targetPiece = toSquare.querySelector('.piece');

    if (targetPiece) {
        const targetPieceType = targetPiece.src.split('/').pop().split('.')[0];
        const targetPieceColor = targetPieceType.includes('white') ? 'white' : 'black';
        const currentPieceColor = pieceType.includes('white') ? 'white' : 'black';

        if (targetPieceColor === currentPieceColor) {
            return false; 
        }
    }

    let rookFirstMoveKingside = true;
    let rookFirstMoveQueenside = true;
    let kingFirstMove = true;

    switch (pieceType) {
        case 'pawn_white':
            if (isPawnMove(fromCoordinate, toCoordinate, 'white', isCapture)) {
                return true;
            }
            break;
        case 'pawn_black':
            if (isPawnMove(fromCoordinate, toCoordinate, 'black', isCapture)) {
                return true;
            }
            break;
        case 'rook_white':
        case 'rook_black':
            if (isRookMove(fromCoordinate, toCoordinate)) {
                const isKingside = fromCoordinate[0] === 'h'; 
        
                if (isKingside) {
                    rookFirstMoveKingside = false;  
                } else {
                    rookFirstMoveQueenside = false;
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
            if (isKingMove(fromCoordinate, toCoordinate, kingFirstMove, rookFirstMoveKingside, rookFirstMoveQueenside)) {
                const isKingsideCastling = toCoordinate.charCodeAt(0) > fromCoordinate.charCodeAt(0);
                const isQueensideCastling = toCoordinate.charCodeAt(0) < fromCoordinate.charCodeAt(0);
        
                // Kingside castling
                if (isKingsideCastling && Math.abs(fromCoordinate.charCodeAt(0) - toCoordinate.charCodeAt(0)) === 2) {
                    const rookCurrentPosition = 'h' + fromCoordinate.charAt(1);
                    const rookNewPosition = 'f' + toCoordinate.charAt(1);
        
                    const rookElement = document.querySelector(`[data-coordinate="${rookCurrentPosition}"]`);
                    const newRookElement = document.querySelector(`[data-coordinate="${rookNewPosition}"]`);
                    if (rookElement && newRookElement && rookElement.firstChild) {
                        newRookElement.appendChild(rookElement.firstChild); // Move the rook
                        rookFirstMoveKingside = false; // Disable kingside rook castling
                    }
                }
        
                // Queenside castling
                //console.log(Math.abs(fromCoordinate.charCodeAt(0) - toCoordinate.charCodeAt(0)));
                if (isQueensideCastling && Math.abs(fromCoordinate.charCodeAt(0) - toCoordinate.charCodeAt(0)) === 3) {
                    const rookCurrentPosition = 'a' + fromCoordinate.charAt(1);
                    const rookNewPosition = 'c' + toCoordinate.charAt(1); // Rook moves to c1 for queenside
        
                    const rookElement = document.querySelector(`[data-coordinate="${rookCurrentPosition}"]`);
                    const newRookElement = document.querySelector(`[data-coordinate="${rookNewPosition}"]`);
                    //console.log(`---Queens side castle is taking place---`);
                    if (rookElement && newRookElement && rookElement.firstChild) {
                        newRookElement.appendChild(rookElement.firstChild); // Move the rook
                        rookFirstMoveQueenside = false; // Disable queenside rook castling
                    }
                }
        
                kingFirstMove = false; // Allow further king moves after castling
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
        //const aiMove = calculateRandomMove();
        const aiMove = calculateBestMove();
        handleAIMove(aiMove);
    }, 1500); 
}



main();