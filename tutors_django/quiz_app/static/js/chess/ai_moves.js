import { isPawnMove, isRookMove, isKnightMove, isBishopMove, isKingMove, isQueenMove } from "./moves_logic.js"

const AI_COLOR = 'black'

function isWithInBounds(move) {
    const row = parseInt(move[1]);
    const col = move.charCodeAt(0);
    return row >= 1 && row <= 8 && col >= 'a'.charCodeAt(0) && col <= 'h'.charCodeAt(0);
}

export function getPawnMoves(square, color) {
    const squares = Array.from(document.querySelectorAll('#chessboard .square'));
    const squareMap = new Map(squares.map(sq => [sq.getAttribute('data-coordinate'), sq]));
    const validMoves = [];
    const position = square.getAttribute('data-coordinate');
    const fromRow = parseInt(position[1]);
    const fromCol = position[0];
    const forwardMove = color === 'white' ? fromRow + 1 : fromRow - 1;

    const potentialMoves = [`${fromCol}${forwardMove}`];

    const isFirstMove = (color === 'white' && fromRow === 2) || (color === 'black' && fromRow === 7);

    if (isFirstMove) {
        const firstMove = color === 'white' ? fromRow + 2 : fromRow - 2;
        potentialMoves.push(`${fromCol}${firstMove}`);
    }

    // Capture moves
    const leftCapture = String.fromCharCode(fromCol.charCodeAt(0) - 1) + forwardMove;
    const rightCapture = String.fromCharCode(fromCol.charCodeAt(0) + 1) + forwardMove;

    checkCaptureMove(leftCapture, color, squareMap, potentialMoves);
    checkCaptureMove(rightCapture, color, squareMap, potentialMoves);

    potentialMoves.forEach(move => {
        if (isWithInBounds(move)) {
            const targetSquare = squareMap.get(move);
            const targetSquarePieceImg = targetSquare?.querySelector('.piece');
            const isDiagonalMove = Math.abs(move.charCodeAt(0) - position.charCodeAt(0)) === 1;

            if (targetSquarePieceImg && isDiagonalMove) {
                const targetPieceColor = targetSquarePieceImg.src.split('/').pop().split('_')[1].split('.')[0];
                if (targetPieceColor !== color) {
                    validMoves.push(move);
                    isPawnMove(position, move, color, true);
                }
            } else if (!targetSquarePieceImg && !isDiagonalMove && isPawnMove(position, move, color, false)) {
                validMoves.push(move);
            }
        }
    });

    return validMoves;
}

// Helper function to check capture moves
function checkCaptureMove(captureMove, color, squareMap, potentialMoves) {
    const targetSquare = squareMap.get(captureMove);
    if (targetSquare) {
        const targetPieceImg = targetSquare.querySelector('.piece');
        if (targetPieceImg) {
            const targetPieceColor = targetPieceImg.src.split('/').pop().split('_')[1].split('.')[0];
            if (targetPieceColor !== color) {
                potentialMoves.push(captureMove);
            }
        }
    }
}


export function getKnightMoves(square) {
    const squares = document.querySelectorAll('#chessboard .square');
    const validMoves = [];
    const position = square.getAttribute('data-coordinate');
    const row = parseInt(position[1]);
    const col = position[0];

    const potentialMoves = [{
            rowChange: 2,
            colChange: 1
        }, // Up 2, Right 1
        {
            rowChange: 2,
            colChange: -1
        }, // Up 2, Left 1
        {
            rowChange: -2,
            colChange: 1
        }, // Down 2, Right 1
        {
            rowChange: -2,
            colChange: -1
        }, // Down 2, Left 1
        {
            rowChange: 1,
            colChange: 2
        }, // Right 2, Up 1
        {
            rowChange: 1,
            colChange: -2
        }, // Left 2, Up 1
        {
            rowChange: -1,
            colChange: 2
        }, // Right 2, Down 1
        {
            rowChange: -1,
            colChange: -2
        } // Left 2, Down 1
    ];

    potentialMoves.forEach(({
        rowChange,
        colChange
    }) => {
        const newRow = row + rowChange;
        const newCol = String.fromCharCode(col.charCodeAt(0) + colChange);
        const newPosition = `${newCol}${newRow}`;

        if (isWithInBounds(newPosition)) {
            if (isKnightMove(position, newPosition)) {
                const targetSquare = Array.from(squares).find(square => square.getAttribute('data-coordinate') === newPosition);
                const pieceImg = targetSquare?.querySelector('.piece');
                const isBlackPiece = pieceImg?.src.includes('black');
                if (isBlackPiece) {
                    //console.log(`Move to ${newPosition} blocked by AI's piece.`);
                } else {
                    validMoves.push(newPosition);
                }
            }
        }
    });
    //console.log(validMoves);
    return validMoves;
}


function rookCheckIfBlocked(from, to) {
    const squares = document.querySelectorAll('#chessboard .square');
    const squareRegex = /^[a-h][1-8]$/;

    const fromCoordinate = typeof from === 'string' && squareRegex.test(from)
        ? from
        : from.getAttribute('data-coordinate');

    const toCoordinate = typeof to === 'string' && squareRegex.test(to)
        ? to
        : to.getAttribute('data-coordinate');

    const fromRow = parseInt(fromCoordinate[1]);
    const fromCol = fromCoordinate.charCodeAt(0);
    const toRow = parseInt(toCoordinate[1]);
    const toCol = toCoordinate.charCodeAt(0);

    if (fromRow === toRow) { 
        // Moving horizontally
        const step = toCol > fromCol ? 1 : -1;
        for (let col = fromCol + step; col !== toCol; col += step) {
            const currentSquare = `${String.fromCharCode(col)}${fromRow}`;
            if (Array.from(squares).find(square => square.getAttribute('data-coordinate') === currentSquare).querySelector('img')) {
                return true; 
            }
        }
    } else if (fromCol === toCol) { 
        // Moving vertically
        const step = toRow > fromRow ? 1 : -1;
        for (let row = fromRow + step; row !== toRow; row += step) {
            const currentSquare = `${String.fromCharCode(fromCol)}${row}`;
            if (Array.from(squares).find(square => square.getAttribute('data-coordinate') === currentSquare).querySelector('img')) {
                return true; 
            }
        }
    }

    return false; 
}


export function getRookMoves(square) {
    const squares = document.querySelectorAll('#chessboard .square');
    const validMoves = [];
    const position = square.getAttribute('data-coordinate');

    const row = parseInt(position[1]);
    const col = position[0];

    const directions = [
        { rowChange: 1, colChange: 0 },  // Move up
        { rowChange: -1, colChange: 0 }, // Move down
        { rowChange: 0, colChange: 1 },  // Move right
        { rowChange: 0, colChange: -1 }  // Move left
    ];

    directions.forEach(({ rowChange, colChange }) => {
        for (let step = 1; step <= 7; step++) {  
            const newRow = row + rowChange * step;
            const newCol = String.fromCharCode(col.charCodeAt(0) + colChange * step);
            const newPosition = `${newCol}${newRow}`;

            if (!isWithInBounds(newPosition)) break; 
            if (rookCheckIfBlocked(square, newPosition)) break; 

            if (!isRookMove(square, newPosition, AI_COLOR)) break; 

            // Check if the target square has a black piece
            const targetSquare = Array.from(squares).find(square => square.getAttribute('data-coordinate') === newPosition);
            const pieceImg = targetSquare?.querySelector('.piece');
            const isBlackPiece = pieceImg?.src.includes('black');

            if (!isBlackPiece) {
                validMoves.push(newPosition); 
            } else {
                break; // Stop if there's a black piece
            }
        }
    });

    return validMoves;
}



function bishopCheckIfBlocked(from, to) {

    const squares = document.querySelectorAll('#chessboard .square');

    const squareRegex = /^[a-h][1-8]$/;

    const fromCoordinate = typeof from === 'string' && squareRegex.test(from)
        ? from
        : from.getAttribute('data-coordinate');

    const toCoordinate = typeof to === 'string' && squareRegex.test(to)
        ? to
        : to.getAttribute('data-coordinate');

    const fromRow = parseInt(fromCoordinate[1]);
    const fromCol = fromCoordinate.charCodeAt(0);
    const toRow = parseInt(toCoordinate[1]);
    const toCol = toCoordinate.charCodeAt(0);

    const rowStep = toRow > fromRow ? 1 : -1;
    const colStep = toCol > fromCol ? 1 : -1;

    const steps = Math.abs(toRow - fromRow); // Number of steps diagonally

    for (let i = 1; i < steps; i++) {
        const currentRow = fromRow + i * rowStep;
        const currentCol = fromCol + i * colStep;
        const currentSquare = `${String.fromCharCode(currentCol)}${currentRow}`;
        if (Array.from(squares).find(square => square.getAttribute('data-coordinate') === currentSquare).querySelector('img')) {
            return true; 
        }
    }

    return false; 
}


export function getBishopMoves(square) {
    const squares = document.querySelectorAll('#chessboard .square');
    const validMoves = [];
    const position = square.getAttribute('data-coordinate');
    const row = parseInt(position[1]);
    const col = position[0];

    const directions = [
        { rowChange: 1, colChange: 1 },   // NE
        { rowChange: 1, colChange: -1 },  // NW
        { rowChange: -1, colChange: 1 },  // SE
        { rowChange: -1, colChange: -1 }  // SW
    ];

    directions.forEach(({ rowChange, colChange }) => {
        for (let step = 1; step <= 7; step++) {  // Maximum 7 steps for bishop moves
            const newRow = row + rowChange * step;
            const newCol = String.fromCharCode(col.charCodeAt(0) + colChange * step);
            const newPosition = `${newCol}${newRow}`;

            if (!isWithInBounds(newPosition)) break; 
            if (bishopCheckIfBlocked(position, newPosition)) break; 

            if (!isBishopMove(position, newPosition, AI_COLOR)) break; 

            // Check if the target square has a black piece
            const targetSquare = Array.from(squares).find(square => square.getAttribute('data-coordinate') === newPosition);
            // console.log(targetSquare)
            const pieceImg = targetSquare?.querySelector('.piece');
            const isBlackPiece = pieceImg?.src.includes('black');

            if (!isBlackPiece) {
                validMoves.push(newPosition); 
            } else {
                break; // Stop if there's a black piece
            }
        }
    });

    return validMoves;
}


function kingCheckIfBlocked(square, move, color) {
    const squares = document.querySelectorAll('#chessboard .square');
    const targetSquare = Array.from(squares).find(square => square.getAttribute('data-coordinate') === move);
    
    const pieceImg = targetSquare?.querySelector('.piece');
    const isOwnPiece = pieceImg?.src.includes(color);

    return isOwnPiece; 
}

export function getKingMoves(square, color) {
    const squares = document.querySelectorAll('#chessboard .square');
    const validMoves = [];
    const position = square.getAttribute('data-coordinate');
    const fromRow = parseInt(position[1]);
    const fromCol = position[0].charCodeAt(0); // Get column as ASCII code

    const potentialMoves = [
        `${String.fromCharCode(fromCol)}${fromRow + 1}`,     // Up
        `${String.fromCharCode(fromCol)}${fromRow - 1}`,     // Down
        `${String.fromCharCode(fromCol + 1)}${fromRow}`,     // Right
        `${String.fromCharCode(fromCol - 1)}${fromRow}`,     // Left
        `${String.fromCharCode(fromCol + 1)}${fromRow + 1}`, // Up-Right
        `${String.fromCharCode(fromCol + 1)}${fromRow - 1}`, // Down-Right
        `${String.fromCharCode(fromCol - 1)}${fromRow + 1}`, // Up-Left
        `${String.fromCharCode(fromCol - 1)}${fromRow - 1}`  // Down-Left
    ];

    const isKingFirstMove = 
    (color === 'white' && fromRow === 1 && fromCol === 101) ||  // 'e1' for white king
    (color === 'black' && fromRow === 8 && fromCol === 101);    // 'e8' for black king

    potentialMoves.forEach(move => {
        if (isKingMove(position, move, isKingFirstMove, false) && // Assuming rook first move isn't needed here
            isWithInBounds(move) && 
            !kingCheckIfBlocked(square, move)) { // Check if blocked by own piece
            const targetSquare = Array.from(squares).find(square => square.getAttribute('data-coordinate') === move);
            const pieceImg = targetSquare?.querySelector('.piece');
            const isBlackPiece = pieceImg?.src.includes('black');
            
            if (!isBlackPiece) {
                validMoves.push(move);
            }
        }
    });
    
    return validMoves;
}


function queenCheckIfBlocked(fromSquare, toSquare) {
    const fromRow = parseInt(fromSquare[1]);
    const fromCol = fromSquare[0].charCodeAt(0);
    
    const toRow = parseInt(toSquare[1]);
    const toCol = toSquare[0].charCodeAt(0);
    
    const rowDiff = Math.abs(fromRow - toRow);
    const colDiff = Math.abs(fromCol - toCol);
    
    if (fromRow === toRow || fromCol === toCol) {
        return rookCheckIfBlocked(fromSquare, toSquare);
    }
    
    if (rowDiff === colDiff) {
        return bishopCheckIfBlocked(fromSquare, toSquare);  
    }
    
    return false;  
}

export function getQueenMoves(square) {
    const squares = document.querySelectorAll('#chessboard .square');
    const validMoves = [];
    const position = square.getAttribute('data-coordinate');
    const row = parseInt(position[1]);
    const col = position[0].charCodeAt(0);

    const potentialMoves = [];

    for (let i = 1; i <= 8; i++) {
        if (i !== row) potentialMoves.push(`${String.fromCharCode(col)}${i}`); 
        const newCol = String.fromCharCode(col + i);
        if (newCol >= 'a' && newCol <= 'h') potentialMoves.push(`${newCol}${row}`);
    }

    for (let i = 1; i <= 8; i++) {
        const newRowUp = row + i;
        const newRowDown = row - i;
        const newColRight = String.fromCharCode(col + i);
        const newColLeft = String.fromCharCode(col - i);

        if (newColRight >= 'a' && newColRight <= 'h') {
            if (newRowUp <= 8) potentialMoves.push(`${newColRight}${newRowUp}`);
            if (newRowDown >= 1) potentialMoves.push(`${newColRight}${newRowDown}`);
        }

        if (newColLeft >= 'a' && newColLeft <= 'h') {
            if (newRowUp <= 8) potentialMoves.push(`${newColLeft}${newRowUp}`);
            if (newRowDown >= 1) potentialMoves.push(`${newColLeft}${newRowDown}`);
        }
    }

    potentialMoves.forEach(move => {
        if (isWithInBounds(move) && isQueenMove(position, move, AI_COLOR) && !queenCheckIfBlocked(position, move)) {
            const targetSquare = Array.from(squares).find(square => square.getAttribute('data-coordinate') === move);
            const pieceImg = targetSquare?.querySelector('.piece');
            const isBlackPiece = pieceImg?.src.includes('black');
            
            if (!isBlackPiece) {
                validMoves.push(move);
            }
        }
    });
    
    return validMoves;
}

