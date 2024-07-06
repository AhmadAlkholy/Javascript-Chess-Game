const startBoard = (game, options = { playAgainst: 'human', aiColor: 'black', aiLevel: 'dumb' }) => {

    const aiPlayer = options.playAgainst === 'ai' ? ai(options.aiColor) : null;

    const board   = document.getElementById('board');
    const squares = board.querySelectorAll('.square');
    const whiteSematary = document.getElementById('whiteSematary');
    const blackSematary = document.getElementById('blackSematary');
    const turnSign = document.getElementById('turn');
    let clickedPieceName;

    const resetSematary = () => {
        whiteSematary.querySelectorAll('div').forEach(div => div.innerHTML = '');
        blackSematary.querySelectorAll('div').forEach(div => div.innerHTML = '');
    }

    const resetBoard = () => {
        resetSematary();

        for (const square of squares) {
            square.innerHTML = '';
        }

        for (const piece of game.pieces) {
            const square = document.getElementById(piece.position);
            square.innerHTML = `<img class="piece ${piece.rank}" id="${piece.name}" src="img/${piece.color}-${piece.rank}.png">`;
        }

        document.getElementById('endscene').classList.remove('show');
    }

    resetBoard();

    const setGameState = state => {
        gameState = state;
        if (gameState === 'ai_thinking') {
            turnSign.innerHTML += ' (thinking...)';
        }
    }

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
        board.querySelectorAll('.allowed').forEach( allowedSquare => allowedSquare.classList.remove('allowed') );

        const clickedSquare = document.getElementsByClassName('clicked-square')[0];
        if (clickedSquare) {
            clickedSquare.classList.remove('clicked-square');
        }
    }

    const setLastMoveSquares = (from, to) => {
        document.querySelectorAll('.last-move').forEach( lastMoveSquare => lastMoveSquare.classList.remove('last-move') );
        from.classList.add('last-move');
        to.classList.add('last-move');
    }

    function movePiece(square) {
        if (gameState === 'ai_thinking') {
            return;
        }

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

    game.pieces.forEach( piece => {
        const pieceImg = document.getElementById(piece.name);
        pieceImg.addEventListener("drop", function () {
            const square = document.getElementById(piece.position);
            movePiece(square);
        });
    });

    document.querySelectorAll('img.piece').forEach( pieceImg => {
        pieceImg.addEventListener("dragstart", function(event) {
            if (gameState === 'ai_thinking') {
                return;
            }
            event.stopPropagation();
            event.dataTransfer.setData("text", event.target.id);
            clearSquares();
            setAllowedSquares(event.target)
        });
        pieceImg.addEventListener("drop", function(event) {
            if (gameState === 'ai_thinking') {
                return;
            }
            event.stopPropagation();
            clearSquares();
            setAllowedSquares(event.target)
        });
    });

    const startTurn = turn => {
        gameState = turn + '_turn';
        turnSign.innerHTML = turn === 'white' ? "White's Turn" : "Black's Turn";

        if (gameState !== 'checkmate' && options.playAgainst === 'ai' && turn === options.aiColor) {
            setGameState('ai_thinking');
            aiPlayer.play(game.pieces, aiPlay => {
                setGameState('human_turn');
                game.movePiece(aiPlay.move.pieceName, aiPlay.move.position);
            });
        }
    }

    game.on('pieceMove', move => {
        const from = document.getElementById(move.from);
        const to = document.getElementById(move.piece.position);
        to.append( document.getElementById(move.piece.name) );
        clearSquares();

        setLastMoveSquares(from, to);
    });

    game.on('turnChange', startTurn);

    game.on('promotion', queen => {
        const square = document.getElementById(queen.position);
        square.innerHTML = `<img class="piece queen" id="${queen.name}" src="img/${queen.color}-queen.png">`;
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
        setGameState('checkmate');
    });

    startTurn('white');
}

const pieces = [
    new Knight(12, 'whiteKnight1'),
    new Knight(17, 'whiteKnight2'),
    new Queen(14, 'whiteQueen'),
    new Bishop(13, 'whiteBishop1'),
    new Bishop(16, 'whiteBishop2'),
    new Pawn(24, 'whitePawn4'),
    new Pawn(25, 'whitePawn5'),
    new Pawn(26, 'whitePawn6'),
    new Pawn(21, 'whitePawn1'),
    new Pawn(22, 'whitePawn2'),
    new Pawn(23, 'whitePawn3'),
    new Pawn(27, 'whitePawn7'),
    new Pawn(28, 'whitePawn8'),
    new Rook(11, 'whiteRook1'),
    new Rook(18, 'whiteRook2'),
    new King(15, 'whiteKing'),

    new Knight(82, 'blackKnight1'),
    new Knight(87, 'blackKnight2'),
    new Queen(84, 'blackQueen'),
    new Bishop(83, 'blackBishop1'),
    new Bishop(86, 'blackBishop2'),
    new Pawn(74, 'blackPawn4'),
    new Pawn(75, 'blackPawn5'),
    new Pawn(76, 'blackPawn6'),
    new Pawn(71, 'blackPawn1'),
    new Pawn(72, 'blackPawn2'),
    new Pawn(73, 'blackPawn3'),
    new Pawn(77, 'blackPawn7'),
    new Pawn(78, 'blackPawn8'),
    new Rook(81, 'blackRook1'),
    new Rook(88, 'blackRook2'),
    new King(85, 'blackKing'),
];
const game = new Game(pieces, 'white');

const startNewGame = () => {
    document.querySelectorAll('.scene').forEach( scene => scene.classList.remove('show') );

    const playAgainst = document.querySelector('input[name="oponent"]:checked').value;
    const humanColor = document.querySelector('input[name="human_color"]:checked')?.value;
    const aiColor = humanColor === 'white' ? 'black' : 'white';
    const aiLevel = 'dumb';
    
    startBoard(game, {playAgainst, aiColor, aiLevel});
}

const showColorSelect = () => document.querySelector('.select-color-container').classList.add('show');
const hideColorSelect = () => document.querySelector('.select-color-container').classList.remove('show');