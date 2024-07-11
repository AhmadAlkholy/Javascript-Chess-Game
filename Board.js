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
            square.innerHTML = `<img class="piece ${piece.rank}" id="${piece.name}" src="img/${piece.color}-${piece.rank}.webp">`;
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
        square.innerHTML = `<img class="piece queen" id="${queen.name}" src="img/${queen.color}-queen.webp">`;
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
    { rank: 'knight', position: 12, color: 'white', name: 'whiteKnight1' },
    { rank: 'knight', position: 17, color: 'white', name: 'whiteKnight2' },
    { rank: 'queen', position: 14, color: 'white', name: 'whiteQueen' },
    { rank: 'bishop', position: 13, color: 'white', name: 'whiteBishop1' },
    { rank: 'bishop', position: 16, color: 'white', name: 'whiteBishop2' },
    { rank: 'pawn', position: 24, color: 'white', name: 'whitePawn4' },
    { rank: 'pawn', position: 25, color: 'white', name: 'whitePawn5' },
    { rank: 'pawn', position: 26, color: 'white', name: 'whitePawn6' },
    { rank: 'pawn', position: 21, color: 'white', name: 'whitePawn1' },
    { rank: 'pawn', position: 22, color: 'white', name: 'whitePawn2' },
    { rank: 'pawn', position: 23, color: 'white', name: 'whitePawn3' },
    { rank: 'pawn', position: 27, color: 'white', name: 'whitePawn7' },
    { rank: 'pawn', position: 28, color: 'white', name: 'whitePawn8' },
    { rank: 'rook', position: 11, color: 'white', name: 'whiteRook1', ableToCastle: true },
    { rank: 'rook', position: 18, color: 'white', name: 'whiteRook2', ableToCastle: true },
    { rank: 'king', position: 15, color: 'white', name: 'whiteKing', ableToCastle: true },

    { rank: 'knight', position: 82, color: 'black', name: 'blackKnight1' },
    { rank: 'knight', position: 87, color: 'black', name: 'blackKnight2' },
    { rank: 'queen', position: 84, color: 'black', name: 'blackQueen' },
    { rank: 'bishop', position: 83, color: 'black', name: 'blackBishop1' },
    { rank: 'bishop', position: 86, color: 'black', name: 'blackBishop2' },
    { rank: 'pawn', position: 74, color: 'black', name: 'blackPawn4' },
    { rank: 'pawn', position: 75, color: 'black', name: 'blackPawn5' },
    { rank: 'pawn', position: 76, color: 'black', name: 'blackPawn6' },
    { rank: 'pawn', position: 71, color: 'black', name: 'blackPawn1' },
    { rank: 'pawn', position: 72, color: 'black', name: 'blackPawn2' },
    { rank: 'pawn', position: 73, color: 'black', name: 'blackPawn3' },
    { rank: 'pawn', position: 77, color: 'black', name: 'blackPawn7' },
    { rank: 'pawn', position: 78, color: 'black', name: 'blackPawn8' },
    { rank: 'rook', position: 81, color: 'black', name: 'blackRook1', ableToCastle: true },
    { rank: 'rook', position: 88, color: 'black', name: 'blackRook2', ableToCastle: true },
    { rank: 'king', position: 85, color: 'black', name: 'blackKing', ableToCastle: true },
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