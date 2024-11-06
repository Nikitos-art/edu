export function createChessBoard() {
    const chessboard = document.getElementById('chessboard');
    const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    // const initialPositions = {
    //     'e1': 'king_white', 'e8': 'king_black',
    //     'a2': 'pawn_white', 'b2': 'pawn_white', 'c2': 'pawn_white', 'd2': 'pawn_white', 'e2': 'pawn_white', 'f2': 'pawn_white', 'g2': 'pawn_white', 'h2': 'pawn_white',
    //     'a7': 'pawn_black', 'b7': 'pawn_black', 'c7': 'pawn_black', 'd7': 'pawn_black', 'e7': 'pawn_black', 'f7': 'pawn_black', 'g7': 'pawn_black', 'h7': 'pawn_black',
    // };

    const initialPositions = {
        'a1': 'rook_white', 'b1': 'knight_white', 'c1': 'bishop_white', 'd1': 'queen_white', 'e1': 'king_white', 'f1': 'bishop_white', 'g1': 'knight_white', 'h1': 'rook_white',
        'a2': 'pawn_white', 'b2': 'pawn_white', 'c2': 'pawn_white', 'd2': 'pawn_white', 'e2': 'pawn_white', 'f2': 'pawn_white', 'g2': 'pawn_white', 'h2': 'pawn_white',
        'a8': 'rook_black', 'b8': 'knight_black', 'c8': 'bishop_black', 'd8': 'queen_black', 'e8': 'king_black', 'f8': 'bishop_black', 'g8': 'knight_black', 'h8': 'rook_black',
        'a7': 'pawn_black', 'b7': 'pawn_black', 'c7': 'pawn_black', 'd7': 'pawn_black', 'e7': 'pawn_black', 'f7': 'pawn_black', 'g7': 'pawn_black', 'h7': 'pawn_black',
    };

    for (let row = 8; row > 0; row--) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = (row + col) % 2 === 0 ? 'white' : 'black'; 
            square.classList.add('square');
            
            const coordinate = `${columns[col]}${row}`;
            square.setAttribute('data-coordinate', coordinate);
            
            const piece = initialPositions[coordinate];
            if (piece) {
                const img = document.createElement('img');
                img.src = `/static/img/chess_pieces/${piece}.png`;  
                img.classList.add('piece');
                square.appendChild(img);
            }
            chessboard.appendChild(square);
        }
    }
    return chessboard;
}