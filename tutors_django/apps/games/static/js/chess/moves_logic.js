

function getBoardIndices(square) {
    const row = 8 - parseInt(square[1]);
    const col = square.charCodeAt(0) - 'a'.charCodeAt(0); 
    return { row, col };
}

function isPathBlocked(from, to, curColor, simulatedBoardArray = null) {
    const fromIndices = getBoardIndices(from);
    const toIndices = getBoardIndices(to);

    const rowDiff = toIndices.row - fromIndices.row;
    const colDiff = toIndices.col - fromIndices.col;

    // Set step directions to move one square at a time toward the `to` square
    const rowStep = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
    const colStep = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);

    const maxSteps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));

    for (let step = 1; step <= maxSteps; step++) {
        const currentRow = fromIndices.row + rowStep * step;
        const currentCol = fromIndices.col + colStep * step;

        // Ensure currentRow and currentCol stay within 0-7 range
        if (currentRow < 0 || currentRow > 7 || currentCol < 0 || currentCol > 7) {
            return true; // Path is blocked if out of range
        }

        // Convert to chess notation and obtain board indices
        const currentSquare = String.fromCharCode('a'.charCodeAt(0) + currentCol) + (8 - currentRow);
        const { row, col } = getBoardIndices(currentSquare);

        let pieceOnSquare;

        if (simulatedBoardArray) {
            pieceOnSquare = simulatedBoardArray[row][col];
        } else {
            pieceOnSquare = document.querySelector(`[data-coordinate="${currentSquare}"] .piece`);
        }

        if (pieceOnSquare) {
            const pieceColor = simulatedBoardArray
                ? pieceOnSquare.pieceColor
                : pieceOnSquare.src.split('/').pop().split('.')[0].split('_')[1];

            if (step === maxSteps && pieceColor !== curColor) {
                return false; 
            }
            return true; 
        }
    }
    return false; 
}

export function isPawnMove(from, to, color, isCapture = false, movesHistory) {
    const fromRow = parseInt(from.charAt(1));
    const toRow = parseInt(to.charAt(1));
    const fromCol = from.charAt(0);
    const toCol = to.charAt(0);
    const direction = color === 'white' ? 1 : -1;
    const isFirstMove = (color === 'white' && fromRow === 2) || (color === 'black' && fromRow === 7);

    // Check for en passant
    if (movesHistory) {
        const enPassantPossible = movesHistory.some((move) => {
            const prevFromRow = parseInt(move.from.charAt(1));
            const prevToRow = parseInt(move.to.charAt(1));
            const isTwoSquareAdvance = move.piece === 'pawn' && Math.abs(prevToRow - prevFromRow) === 2;
    
            return (
                move.to === `${toCol}${fromRow}` &&
                move.color !== color &&
                isTwoSquareAdvance
            );
        });

        if (enPassantPossible) {
            const enPassantRow = fromRow;
            const enPassantCol = String.fromCharCode(toCol.charCodeAt(0));
    
            const enPassantSquare = document.querySelector(`[data-coordinate="${enPassantCol}${enPassantRow}"]`);
            if (enPassantSquare) {
                const pieceImg = enPassantSquare.querySelector('.piece');
                if (pieceImg) {
                    enPassantSquare.removeChild(pieceImg);
                }
                return [enPassantCol, enPassantRow];
            }
        }

    }

    // Regular pawn move logic
    if (!isCapture) {
        if (toCol === fromCol) {
            if (isFirstMove && toRow === fromRow + 2 * direction) {
                return !isPathBlocked(from, to);
            }
            if (toRow === fromRow + direction) {
                return true;
            }
        }
    } else {
        const isDiagonalCapture = toRow === fromRow + direction && Math.abs(toCol.charCodeAt(0) - fromCol.charCodeAt(0)) === 1;
        if (isDiagonalCapture) {
            return true;
        }
    }

    return false;
}


export function isRookMove(fromSquare, toSquare, color, simulatedBoardArray=null) {
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

    const pathBlocked = isPathBlocked(fromCoordinate, toCoordinate, color, simulatedBoardArray);
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

export function isBishopMove(from, to, color, simulatedBoardArray=null) {
    const fromRow = parseInt(from.charAt(1));
    const toRow = parseInt(to.charAt(1));
    const fromCol = from.charCodeAt(0);
    const toCol = to.charCodeAt(0);

    // Bishop moves diagonally
    const isBishopMoveValid = Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol);

    // Check if the path is blocked
    const pathBlocked = isPathBlocked(from, to, color, simulatedBoardArray);

    return isBishopMoveValid && !pathBlocked;
}


export function isKingMove(from, to, kingFirstMove=false) {
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

    // Castling move
    if (kingFirstMove && (colDiff === 2) && fromRow === toRow) {
        return !isPathBlocked(from, to);
    }
    
    return false; 
}


export function isQueenMove(from, to, color, simulatedBoardArray=null) {
    const fromRow = parseInt(from.charAt(1));
    const toRow = parseInt(to.charAt(1));
    const fromCol = from.charCodeAt(0);
    const toCol = to.charCodeAt(0);

    const rowDiff = Math.abs(fromRow - toRow);
    const colDiff = Math.abs(fromCol - toCol);

    // Queen moves like both a rook and a bishop (horizontally, vertically, or diagonally)
    const isQueenMoveValid = (rowDiff === 0 || colDiff === 0 || rowDiff === colDiff);

    // Check if the path is blocked
    const pathBlocked = isPathBlocked(from, to, color, simulatedBoardArray);

    return isQueenMoveValid && !pathBlocked;
}

