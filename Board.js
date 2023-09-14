const startBoard = game => {
    const board   = document.getElementById('board');
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
            square.innerHTML = `<img class="piece ${piece.rank}" id="${piece.name}" src="img/${piece.color}-${piece.rank}.png">`
        }
    }

    resetBoard();

    const setAllowedSquares = (pieceImg) => {
        clickedPieceName = pieceImg.id;
        const allowedMoves = game.getPieceAllowedMoves(clickedPieceName);
        if (allowedMoves) {
            const clickedSquare = pieceImg.parentNode;
            clickedSquare.classList.add('clicked-square');

            allowedMoves.forEach( allowedMove => {
                if (document.contains(document.getElementById(allowedMove))) {
                    document.getElementById(allowedMove).classList.add('allowed');
                }
            });
        }
        else{
            clearSquares();
        }
    }

    const clearSquares = () => {
        const allowedSquares = board.querySelectorAll('.allowed');
        allowedSquares.forEach( allowedSquare => allowedSquare.classList.remove('allowed') );
        const cllickedSquare = document.getElementsByClassName('clicked-square')[0];
        if (cllickedSquare) {
            cllickedSquare.classList.remove('clicked-square');
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

        game.movePiece(clickedPieceName, position);
    }

    squares.forEach( square => {
        square.addEventListener("click", function () {
            movePiece(this);
        });
        square.addEventListener("dragover", function(event){
            event.preventDefault();
        });
        square.addEventListener("drop", function () {
            movePiece(this);
        });
    });

    pieces.forEach( piece => {
        const pieceImg = document.getElementById(piece.name);
        pieceImg.addEventListener("drop", function () {
            const square = document.getElementById(piece.position);
            movePiece(square);
        });
    });

    document.querySelectorAll('img.piece').forEach( pieceImg => {
        pieceImg.addEventListener("dragstart", function(event) {
            event.stopPropagation();
            event.dataTransfer.setData("text", event.target.id);
            clearSquares();
            setAllowedSquares(event.target)
        });
        pieceImg.addEventListener("drop", function(event) {
            event.stopPropagation();
            clearSquares();
            setAllowedSquares(event.target)
        });
    });

    game.on('pieceMove', piece => {
        const square = document.getElementById(piece.position)
        square.append( document.getElementById(piece.name) );
        clearSquares();
    });

    game.on('turnChange', turn => {
        turnSign.innerHTML = turn === 'white' ? "White's Turn" : "Black's Turn";
    });

    game.on('promotion', queen => {
        const square = document.getElementById(queen.position);
        square.innerHTML = `<img class="piece queen" id="${queen.name}" src="img/${queen.color}Queen.png">`;
    })

    game.on('kill', piece => {
        const pieceImg = document.getElementById(piece.name);
        pieceImg.parentNode.removeChild(pieceImg);
        pieceImg.className = '';

        const sematary = piece.color === 'white' ? whiteSematary : blackSematary;
        sematary.querySelector('.'+piece.rank).append(pieceImg);
    });

    game.on('checkMate', color => {
        const endScene = document.getElementById('endscene');
        endScene.getElementsByClassName('winning-sign')[0].innerHTML = color + ' Wins';
        endScene.classList.add('show');
    })
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

startBoard(game);