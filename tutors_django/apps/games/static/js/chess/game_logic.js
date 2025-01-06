import { isPawnMove, isRookMove, isKnightMove, isBishopMove, isKingMove, isQueenMove } from "./moves_logic.js"
import { createChessBoard } from "./chess_board.js";

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
    isCapture: false,
}

let movesHistory = []

let socket = null;
let aiActive = false;

let castlingFlag = {
    white: false,
    black: false
};

let enPassant = false;

function getCastlingRights(rookFirstMove, kingFirstMove) {
    let castlingRights = '';

    // Check white's castling rights
    if (kingFirstMove.white) {
        if (rookFirstMove.kingside.white) {
            castlingRights += 'K'; // White kingside castling
        }
        if (rookFirstMove.queenside.white) {
            castlingRights += 'Q'; // White queenside castling
        }
    }

    // Check black's castling rights
    if (kingFirstMove.black) {
        if (rookFirstMove.kingside.black) {
            castlingRights += 'k'; // Black kingside castling
        }
        if (rookFirstMove.queenside.black) {
            castlingRights += 'q'; // Black queenside castling
        }
    }

    // If no castling rights exist, use '-'
    return castlingRights || '-';
}

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

            const protocol = window.location.protocol === "https:" ? "wss" : "ws";
            if (protocol === 'ws') {
                socket = new WebSocket(`${protocol}://${window.location.hostname}:8001/ws/chess/${roomName}/`);
            } else if (protocol === 'wss') {
                socket = new WebSocket(`${protocol}://${window.location.hostname}/ws/chess/${roomName}/`);
            } else {
                return; 
            }

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
                if (data.type === 'move') {
  
                    const move = data.move;
                    selectedSquare = coordinateToDivConverter(move.from);
                    let squareDivObject = coordinateToDivConverter(move.to);

                    const pieceImg = selectedSquare.querySelector('.piece');
                    if (pieceImg) {
                        selectPiece(selectedSquare, pieceImg);
                        makeMove(squareDivObject, null, move.isCapture);
                        if (move.castleMoveFlag) {
                            performCastling(move.from, move.to, move.color, kingFirstMove, rookFirstMove);
                            castlingFlag[move.color] = true;
                        } else if (move.enPassantMove) {
                            console.log(`move.enPassantMove = ${move.enPassantMove}`);
                            let enPassantRow = move.enPassantMove[0];
                            let enPassantCol = move.enPassantMove[1];
                            const enPassantSquare = document.querySelector(`[data-coordinate="${enPassantRow}${enPassantCol}"]`);
                            const imgToRemove = enPassantSquare.querySelector('.piece');
                            if (imgToRemove) {
                                enPassantSquare.removeChild(imgToRemove);
                            }
                            enPassant = false;
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
    document.getElementById('playerColor').innerText = `You are playing: ${color}`;
}

function coordinateToDivConverter(coord) {
    const squares = document.querySelectorAll('#chessboard .square');
    const targetSquare = Array.from(squares).find(square => square.getAttribute('data-coordinate') === coord);
    return targetSquare;
}

function startGame(mode) {
    createChessBoard();
    let squares = document.querySelectorAll('.square'); 

    let gameLoop;

    if (mode === 'AI') {
        gameLoop = setInterval(() => {

            if (currentPlayer === PLAYER_TWO && !aiActive) {
                aiActive = true;

                console.log("AI's turn!");
                handleAITurn();

                currentPlayer = PLAYER_ONE;
                setTimeout(() => {
                    aiActive = false;
                }, 1000);

            }
        }, 1500);
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


const repetitionCount = {};

function handleAITurn() {

    const fen = generateFenFromBoard();

    function fetchAndHandleMove() {
        fetch(`/games/ai_move/?fen=${fen}`)
            .then(response => response.json())
            .then(data => {
                if (data.move) {
                    const nextFen = getUpdatedFEN(data.move);
                    if (repetitionCount[nextFen] && repetitionCount[nextFen] > 1) {
                        console.warn("Discouraging repetitive move:", data.move);
                        fetchAndHandleMove();
                        return;
                    }
    
                    const moveValid = handleAIMove(data.move);
                    if (!moveValid && currentPlayer === PLAYER_TWO) {
                        fetchAndHandleMove();
                    }
                } else {
                    console.error("Error from AI backend:", data.error);
                }
            })
            .catch(error => console.error("Error fetching AI move:", error))
            .finally(() => {
                aiActive = false;
            });
    }
    

    // function fetchAndHandleMove() {
    //     fetch(`/games/ai_move/?fen=${fen}`)
    //         .then(response => response.json())
    //         .then(data => {
    //             if (data.move) {
    //                 const moveValid = handleAIMove(data.move);
    //                 if (!moveValid && currentPlayer === PLAYER_TWO) {
    //                     fetchAndHandleMove();
    //                     // console.log(`moveValid: ${moveValid} \n data.move: ${data.move}`);
    //                 }
    //             } else {
    //                 // console.error("Error from AI backend:", data.error);
    //             }
    //         })
    //         .catch(error => console.error("Error fetching AI move:", error))
    //         .finally(() => {
    //             aiActive = false;
    //         });
    // }

    fetchAndHandleMove();
}

function generateFenFromBoard() {
    const boardArray = createBoardArray();
    let fen = "";

    for (let row = 0; row < 8; row++) {
        let emptySquares = 0;

        for (let col = 0; col < 8; col++) {
            const square = boardArray[row][col];

            if (square) {
                if (emptySquares > 0) {
                    fen += emptySquares;
                    emptySquares = 0;
                }

                // Map pieceType and pieceColor to FEN notation
                const pieceType = square.pieceType.toLowerCase();
                const piece = pieceType === 'knight' ? 'n' : pieceType[0];

                fen += square.pieceColor === 'white' ? piece.toUpperCase() : piece.toLowerCase();
            } else {
                emptySquares++;
            }
        }

        if (emptySquares > 0) {
            fen += emptySquares;
        }

        if (row < 7) {
            fen += '/';
        }
    }

    // Add other FEN fields
    const currentTurn = currentPlayer === PLAYER_ONE ? 'w' : 'b';
    //const castlingRights = 'KQkq';
    const castlingRights = getCastlingRights(rookFirstMove, kingFirstMove);
    const enPassantTarget = '-';

    fen += ` ${currentTurn} ${castlingRights} ${enPassantTarget}`;
    // console.log(fen);
    return fen;
}

function getUpdatedFEN(move) {
    // Placeholder: Update this logic to handle your game's FEN string based on the move
    const currentFen = generateFenFromBoard();
    const updatedFen = currentFen + "_" + move; // Simplified example
    return updatedFen;
}

main();

function updateLastMove(from, to, piece, color, isCapture=false) {
    lastMoveMade.from = from;
    lastMoveMade.to = to;
    lastMoveMade.piece = piece;
    lastMoveMade.color = color;
    lastMoveMade.isCapture = isCapture;
    const lastValueHTML = document.getElementById('lastMoveValue');
    lastValueHTML.textContent = `from:${from} to:${to}`;
    movesHistory.push(lastMoveMade);
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
                enPassantMove: enPassant
            }));
            
        } else {
            console.error("WebSocket is not open. Cannot send move.");
        }
    }
}

function updatePlayerTurn(plColor=PLAYER_ONE) {
    currentPlayer = plColor;
    const playerTurnDisplay = document.getElementById('playerTurn');
    playerTurnDisplay.textContent = `Current turn: ${plColor}`;
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

function createBoardArray() {
    const squares = document.querySelectorAll('.square'); 
    const boardArray = Array.from({ length: 8 }, () => Array(8).fill(null)); 

    squares.forEach(square => {
        const coordinate = square.getAttribute('data-coordinate'); 
        if (!coordinate) {
            console.error("Square without valid coordinate:", square);
            return;
        }

        const { row, col } = getBoardIndices(coordinate); 
        if (row < 0 || row > 7 || col < 0 || col > 7) {
            console.error("Invalid board indices:", { coordinate, row, col });
            return;
        }

        const pieceElement = square.querySelector('.piece'); 
        if (pieceElement) {
            const src = pieceElement.src;
            if (!src) {
                console.error("Piece element without a valid src:", pieceElement);
                return;
            }

            const splitSrc = src.split('/').pop().split('_');
            if (splitSrc.length < 2) {
                console.error("Invalid src format for piece:", src);
                return;
            }

            const pieceType = splitSrc[0].split('.')[0];
            const pieceColor = splitSrc[1].split('.')[0];

            boardArray[row][col] = { pieceType, pieceColor };

            // console.log(`Placed ${pieceColor} ${pieceType} at ${coordinate} (${row}, ${col})`);
        } else {
            //console.log(`Empty square at ${coordinate} (${row}, ${col})`);
        }
    });

    return boardArray;
}


function getBoardIndices(square) {
    const coord_letter = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    if (!coord_letter.includes(square[0]) || square[1] < 1 || square[1] > 8) {
        console.log(square);
    }
    const row = 8 - parseInt(square[1]);
    const col = square.charCodeAt(0) - 'a'.charCodeAt(0);
    return { row, col };
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

function handleAIMove(move) {
    const squares = [...document.querySelectorAll('.square')];
    const fromCoordinate = move.substring(0, 2);
    const toCoordinate = move.substring(2, 4);

    const fromSquare = squares.find(square => square.getAttribute('data-coordinate') === fromCoordinate);
    const toSquare = squares.find(square => square.getAttribute('data-coordinate') === toCoordinate);
    
    let pieceType = null;
    let pieceImg = fromSquare.querySelector('.piece');

    if (pieceImg) {
        pieceType = pieceImg.src.split('/').pop().split('.')[0].split('_')[0];
    }
    
    const toPieceImg = toSquare ? toSquare.querySelector('.piece') : null;
    const isCapture = toPieceImg && toPieceImg.src.split('/').pop().split('.')[0].includes(PLAYER_ONE);

    if (isValidMove(pieceImg, fromSquare, toSquare, isCapture, 'AI', PLAYER_TWO)) {
        if (isCapture) {
            toSquare.removeChild(toPieceImg);
        }

        toSquare.appendChild(pieceImg);
        
        // Handle pawn promotion
        if (pieceType.includes('pawn')) {
            const toRow = move.substring(2, 3); 
            if (currentPlayer === PLAYER_TWO && toRow === 1) {    
                promotePawn(toSquare, PLAYER_TWO);
            }
        }

        updateLastMove(fromCoordinate, toCoordinate, pieceType, PLAYER_TWO);
        updatePlayerTurn(PLAYER_ONE);
        
    } else {
        return false;
    }
}

function handlePlayerMove(square) {
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

function getCurPlayer() {
    const playerTurnDisplay = document.getElementById('playerTurn').textContent.slice(-5);
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
    if (isCapture) {
        const capturedPiece = pieceImg || square.querySelector('.piece'); 
        if (capturedPiece) {
            const a = capturedPiece.src.split('/').pop().split('_')[0];
            const b = capturedPiece.src.split('/').pop().split('_')[1].split('.')[0];
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

    // const pieceType = piece.src.split('/').pop().split('.')[0];

    if (!piece || !piece.src) {
        console.error("Invalid piece object:", piece);
        return false;
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
        case 'pawn_black':
            const pawnMoveResult = isPawnMove(fromCoordinate, toCoordinate, currentColor, isCapture, movesHistory)
            if (pawnMoveResult.length > 1) {
                enPassant = pawnMoveResult;
                return true;
            } else if (pawnMoveResult.length === 1 || pawnMoveResult) {
                return true;
            } else {
                return false;
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
