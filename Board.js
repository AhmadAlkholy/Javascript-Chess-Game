const startBoard = game => {
    const board = document.getElementById('board');
    const squares = board.querySelectorAll('.square');
    const whiteSematary = document.getElementById('whiteSematary');
    const blackSematary = document.getElementById('blackSematary');
    const turnSign = document.getElementById('turn');
    let clickedPieceName;

    const resetBoard = () => {
        for (const square of squares) {
            square.innerHTML = '';
        }

        for (const piece of game.pieces) {
            const square = document.getElementById(piece.position);
            square.innerHTML = `<img class="piece ${piece.rank}" id="${piece.name}" src="img/${piece.color}-${piece.rank}.png">`;
        }
    }

    resetBoard();

    const setAllowedSquares = (pieceImg) => {
        clickedPieceName = pieceImg.id;
        const allowedMoves = game.getPieceAllowedMoves(clickedPieceName);
        console.log(`Allowed moves for ${clickedPieceName}: ${allowedMoves}`);
        if (allowedMoves.length > 0) {
            const clickedSquare = pieceImg.parentNode;
            clickedSquare.classList.add('clicked-square');

            allowedMoves.forEach(allowedMove => {
                if (document.contains(document.getElementById(allowedMove))) {
                    document.getElementById(allowedMove).classList.add('allowed');
                    console.log(`Square ${allowedMove} set as allowed`);
                }
            });
        } else {
            clearSquares();
        }
    }

    const clearSquares = () => {
        const allowedSquares = board.querySelectorAll('.allowed');
        allowedSquares.forEach(allowedSquare => allowedSquare.classList.remove('allowed'));
        const clickedSquare = document.getElementsByClassName('clicked-square')[0];
        if (clickedSquare) {
            clickedSquare.classList.remove('clicked-square');
        }
    }

    function movePiece(square) {
        const position = square.getAttribute('id');
        const existedPiece = game.getPieceByPos(position);

        if (existedPiece && existedPiece.color === game.turn) {
            const pieceImg = document.getElementById(existedPiece.name);
            clearSquares();
            return setAllowedSquares(pieceImg);
        }

        const successfulMove = game.movePiece(clickedPieceName, position);

        // Actualizar la UI solo si el movimiento fue exitoso
        if (successfulMove) {
            const movedPiece = document.getElementById(clickedPieceName);
            if (movedPiece) {
                square.appendChild(movedPiece);
            }
        }
    }

    squares.forEach(square => {
        square.addEventListener("click", function () {
            movePiece(this);
        });
        square.addEventListener("dragover", function (event) {
            event.preventDefault();
        });
        square.addEventListener("drop", function () {
            movePiece(this);
        });
    });

    pieces.forEach(piece => {
        const pieceImg = document.getElementById(piece.name);
        pieceImg.addEventListener("drop", function () {
            const square = document.getElementById(piece.position);
            movePiece(square);
        });
    });

    document.querySelectorAll('img.piece').forEach(pieceImg => {
        pieceImg.addEventListener("dragstart", function (event) {
            event.stopPropagation();
            event.dataTransfer.setData("text", event.target.id);
            clearSquares();
            setAllowedSquares(event.target);
        });
        pieceImg.addEventListener("drop", function (event) {
            event.stopPropagation();
            clearSquares();
            setAllowedSquares(event.target);
        });
    });

    game.on('pieceMove', piece => {
        console.log(`Piece ${piece.name} moved to ${piece.position}`);
        const square = document.getElementById(piece.position);
        square.append(document.getElementById(piece.name));
        clearSquares();
    });

    game.on('turnChange', turn => {
        console.log(`Turn changed to ${turn}`);
        turnSign.innerHTML = turn === 'white' ? "White's Turn" : "Black's Turn";
    });

    game.on('promotion', queen => {
        const square = document.getElementById(queen.position);
        square.innerHTML = `<img class="piece queen" id="${queen.name}" src="img/${queen.color}Queen.png">`;
    });

    game.on('kill', piece => {
        console.log(`Piece ${piece.name} was killed`);
        const pieceImg = document.getElementById(piece.name);
        if (pieceImg) {
            pieceImg.parentNode.removeChild(pieceImg);
        }

        const sematary = piece.color === 'white' ? whiteSematary : blackSematary;
        sematary.querySelector('.' + piece.rank).append(pieceImg);
    });

    game.on('checkMate', color => {
        const endScene = document.getElementById('endscene');
        endScene.getElementsByClassName('winning-sign')[0].innerHTML = color + ' Wins';
        endScene.classList.add('show');
    });

    game.on('enPassant', data => {
        const { piece, opponentPawnPos } = data;
        console.log(`${piece.name} performed an en passant capture`);
        const opponentPawn = game.getPieceByPos(opponentPawnPos);
        if (opponentPawn) {
            const opponentPawnImg = document.getElementById(opponentPawn.name);
            if (opponentPawnImg) {
                opponentPawnImg.parentNode.removeChild(opponentPawnImg);
            }
        }

        // Actualizar la posición de la pieza que realiza la captura al paso
        const square = document.getElementById(piece.position);
        const movedPiece = document.getElementById(piece.name);
        if (movedPiece) {
            square.appendChild(movedPiece);
        }
    });

    game.on('enPassantCapture', data => {
        const { piece, opponentPawnPos } = data;
        const opponentPawn = game.getPieceByPos(opponentPawnPos);
        if (opponentPawn) {
            const opponentPawnImg = document.getElementById(opponentPawn.name);
            if (opponentPawnImg) {
                opponentPawnImg.parentNode.removeChild(opponentPawnImg);
            }
        }
    });
}

const pieces = [
    new Rook(11, 'whiteRook1'),
    new Knight(12, 'whiteKnight1'),
    new Bishop(13, 'whiteBishop1'),
    new Queen(14, 'whiteQueen'),
    new King(15, 'whiteKing'),
    new Bishop(16, 'whiteBishop2'),
    new Knight(17, 'whiteKnight2'),
    new Rook(18, 'whiteRook2'),
    new Pawn(21, 'whitePawn1'),
    new Pawn(22, 'whitePawn2'),
    new Pawn(23, 'whitePawn3'),
    new Pawn(24, 'whitePawn4'),
    new Pawn(25, 'whitePawn5'),
    new Pawn(26, 'whitePawn6'),
    new Pawn(27, 'whitePawn7'),
    new Pawn(28, 'whitePawn8'),

    new Pawn(71, 'blackPawn1'),
    new Pawn(72, 'blackPawn2'),
    new Pawn(73, 'blackPawn3'),
    new Pawn(74, 'blackPawn4'),
    new Pawn(75, 'blackPawn5'),
    new Pawn(76, 'blackPawn6'),
    new Pawn(77, 'blackPawn7'),
    new Pawn(78, 'blackPawn8'),
    new Rook(81, 'blackRook1'),
    new Knight(82, 'blackKnight1'),
    new Bishop(83, 'blackBishop1'),
    new Queen(84, 'blackQueen'),
    new King(85, 'blackKing'),
    new Bishop(86, 'blackBishop2'),
    new Knight(87, 'blackKnight2'),
    new Rook(88, 'blackRook2')
];

const game = new Game(pieces);

game.on('pieceMove', piece => {
    console.log(`${piece.name} moved to position ${piece.position}`);
    // Actualiza la interfaz del tablero aquí
});

game.on('kill', piece => {
    console.log(`${piece.name} was captured`);
    // Actualiza la interfaz del tablero aquí
});

game.on('enPassant', data => {
    const { piece, opponentPawnPos } = data;
    console.log(`${piece.name} performed an en passant capture`);
    const opponentPawn = game.getPieceByPos(opponentPawnPos);
    if (opponentPawn) {
        const opponentPawnImg = document.getElementById(opponentPawn.name);
        if (opponentPawnImg) {
            opponentPawnImg.parentNode.removeChild(opponentPawnImg);
        }
    }

    // Actualizar la posición de la pieza que realiza la captura al paso
    const square = document.getElementById(piece.position);
    const movedPiece = document.getElementById(piece.name);
    if (movedPiece) {
        square.appendChild(movedPiece);
    }
});

startBoard(game);