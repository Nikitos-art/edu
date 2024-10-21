

function isPathBlocked(from, to, color) {
    const fromRow = parseInt(from.charAt(1));
    const toRow = parseInt(to.charAt(1));
    const fromCol = from.charCodeAt(0);
    const toCol = to.charCodeAt(0);

    const rowDirection = Math.sign(toRow - fromRow);
    const colDirection = Math.sign(toCol - fromCol);

    const rowSteps = Math.abs(toRow - fromRow);
    const colSteps = Math.abs(toCol - fromCol);

    const maxSteps = Math.max(rowSteps, colSteps);

    // Generate the squares between `from` and `to`
    const pathSquares = Array.from({ length: maxSteps - 1 }, (_, index) => {
        const currentRow = fromRow + rowDirection * (index + 1);
        const currentCol = fromCol + colDirection * (index + 1);
        return String.fromCharCode(currentCol) + currentRow;
    });

    // Check if any square is blocked
    const isBlocked = pathSquares.some(square => {
        const pieceOnSquare = document.querySelector(`[data-coordinate="${square}"] .piece`);  // Check if there's a piece element
        return pieceOnSquare !== null;
    });

    // Additionally, check the destination square for potential capture
    const pieceOnTargetSquareImg = document.querySelector(`[data-coordinate="${to}"] .piece`);
    if (pieceOnTargetSquareImg) {
        const pieceColor = pieceOnTargetSquareImg.src.split('/').pop().split('.')[0].split('_')[1];
        if (pieceColor === color) {
            return true;  
        }
    }

    return isBlocked;
}


export function isPawnMove(from, to, color, isCapture = false) {
    const fromRow = parseInt(from.charAt(1));
    const toRow = parseInt(to.charAt(1));
    const fromCol = from.charAt(0);
    const toCol = to.charAt(0);

    // Determine if this is the pawn's first move
    const isFirstMove = (color === 'white' && fromRow === 2) || (color === 'black' && fromRow === 7);

    // Non-capture move logic (pawns moving straight forward)
    if (!isCapture) {
        if (color === 'white') {
            // First move: move forward 2 squares
            if (isFirstMove && toRow === fromRow + 2 && toCol === fromCol) {
                return !isPathBlocked(from, to); // Ensure no pieces are blocking the path
            }
            // Regular move: move forward 1 square
            return toRow === fromRow + 1 && toCol === fromCol;
        } else {
            // First move: move forward 2 squares
            if (isFirstMove && toRow === fromRow - 2 && toCol === fromCol) {
                return !isPathBlocked(from, to); // Ensure no pieces are blocking the path
            }
            // Regular move: move forward 1 square
            return toRow === fromRow - 1 && toCol === fromCol;
        }
    } 

    // Capture move logic (pawns capturing diagonally)
    else {
        if (color === 'white') {
            // Capture one square diagonally
            return (toRow === fromRow + 1 && Math.abs(toCol.charCodeAt(0) - fromCol.charCodeAt(0)) === 1);
        } else {
            // Capture one square diagonally
            return (toRow === fromRow - 1 && Math.abs(toCol.charCodeAt(0) - fromCol.charCodeAt(0)) === 1);
        }
    }
}



export function isRookMove(fromSquare, toSquare, color) {


    const squareRegex = /^[a-h][1-8]$/;

    const fromCoordinate = typeof fromSquare === 'string' && squareRegex.test(fromSquare) 
        ? fromSquare 
        : fromSquare.getAttribute('data-coordinate');

    const toCoordinate = typeof toSquare === 'string' && squareRegex.test(toSquare) 
        ? toSquare 
        : toSquare.getAttribute('data-coordinate');

    const fromRow = parseInt(fromCoordinate.charAt(1));
    const toRow = parseInt(toCoordinate.charAt(1));
    const fromCol = fromCoordinate.charAt(0);
    const toCol = toCoordinate.charAt(0);

    const isRookMoveValid = fromRow === toRow || fromCol === toCol;

    const pathBlocked = isPathBlocked(fromCoordinate, toCoordinate, color);
    return isRookMoveValid && !pathBlocked;
}


export function isKnightMove(from, to) {
    const fromRow = parseInt(from.charAt(1));
    const toRow = parseInt(to.charAt(1));
    const fromCol = from.charCodeAt(0);
    const toCol = to.charCodeAt(0);

    const rowDiff = Math.abs(fromRow - toRow);
    const colDiff = Math.abs(fromCol - toCol);
    
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2); 
}

export function isBishopMove(from, to, color) {
    const fromRow = parseInt(from.charAt(1));
    const toRow = parseInt(to.charAt(1));
    const fromCol = from.charCodeAt(0);
    const toCol = to.charCodeAt(0);

    // Bishop moves diagonally
    const isBishopMoveValid = Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol);

    // Check if the path is blocked
    const pathBlocked = isPathBlocked(from, to, color);

    return isBishopMoveValid && !pathBlocked;
}

export function isKingMove(from, to, kingFirstMove, rookFirstMoveKingside, rookFirstMoveQueenside) {
    const fromRow = parseInt(from.charAt(1));
    const toRow = parseInt(to.charAt(1));
    const fromCol = from.charCodeAt(0);
    const toCol = to.charCodeAt(0);

    const rowDiff = Math.abs(fromRow - toRow);
    const colDiff = Math.abs(fromCol - toCol);

    // Regular king move
    if (rowDiff <= 1 && colDiff <= 1) {
        return true;
    }

    // Castling logic
    if (kingFirstMove && (colDiff === 2 || colDiff === 3)) {
        if (fromRow === toRow) {
            // Kingside castling
            if (toCol > fromCol && rookFirstMoveKingside) {
                const squareBetween = String.fromCharCode(fromCol + 1) + fromRow;
                return !isPathBlocked(from, to) && !isPathBlocked(from, squareBetween);
            }
            // Queenside castling
            if (toCol < fromCol && rookFirstMoveQueenside) {
                const squareBetween = String.fromCharCode(fromCol - 1) + fromRow; // This checks the square directly next to the king
                const squareBetweenQueenside = String.fromCharCode(fromCol - 2) + fromRow; // This checks the square next to the rook
                return !isPathBlocked(from, to) && !isPathBlocked(from, squareBetween) && !isPathBlocked(from, squareBetweenQueenside);
            }
        }
    }

    return false; // Return false if not a valid move
}


export function isQueenMove(from, to, color) {
    const fromRow = parseInt(from.charAt(1));
    const toRow = parseInt(to.charAt(1));
    const fromCol = from.charCodeAt(0);
    const toCol = to.charCodeAt(0);

    const rowDiff = Math.abs(fromRow - toRow);
    const colDiff = Math.abs(fromCol - toCol);

    // Queen moves like both a rook and a bishop (horizontally, vertically, or diagonally)
    const isQueenMoveValid = (rowDiff === 0 || colDiff === 0 || rowDiff === colDiff);

    // Check if the path is blocked
    const pathBlocked = isPathBlocked(from, to);

    return isQueenMoveValid && !pathBlocked;
}

