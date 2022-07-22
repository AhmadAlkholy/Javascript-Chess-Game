class Game {
	constructor(pieces) {
		this.board   = document.getElementById('board');
		this.squares = this.board.querySelectorAll('.square');
		this.pieces  = pieces;
		this.turn    = 'white';
		this.turnSign = document.getElementById('turn');
		this.clickedPiece = null;
		this.allowedMoves = null;
		this.addEventListeners();
		this.whiteSematary = document.getElementById('whiteSematary');
		this.blackSematary = document.getElementById('blackSematary');
	}

	addEventListeners() {
		this.pieces.forEach( piece => {
			piece.img.addEventListener("click", this.pieceMove.bind(this)); 
			piece.img.addEventListener("dragstart", this.pieceMove.bind(this)); 
			piece.img.addEventListener("drop", this.pieceMove.bind(this));
		});
		this.squares.forEach( square => {
			square.addEventListener("click", this.movePiece.bind(this)); 
			square.addEventListener("dragover", function(event){
				event.preventDefault();
			}); 
			square.addEventListener("drop", this.movePiece.bind(this)); 
		});
	}

	pieceMove(event) {
		const name = event.target.getAttribute('id');
		const allowedMoves = this.getPieceAllowedMoves(event, name);
		if (allowedMoves) {
			const position = this.getPieceByName(name).position;
			const clickedSquare = document.getElementById(position);

			/*if (event.type == 'click' && this.clickedPiece && this.clickedPiece.name == name) {
				this.setClickedPiece(null);
				return this.clearSquares();
			}*/
			clickedSquare.classList.add('clicked-square');

			allowedMoves.forEach( allowedMove => {
				if (document.body.contains(document.getElementById(allowedMove))) {
					document.getElementById(allowedMove).classList.add('allowed');		
				}	
			});
		}
		else{
			this.clearSquares();
		}
	}

	changeTurn() {
		if (this.turn == 'white') {
			this.turn = 'black';
			this.turnSign.innerHTML = "Black's Turn";
		}
		else{
			this.turn = 'white';
			this.turnSign.innerHTML = "White's Turn";
		}
	}

	getPiecesByColor(color) {
		return this.pieces.filter(obj => {
		  return obj.color === color
		});
	}

	getPlayerPositions(color){
		const pieces = this.getPiecesByColor(color);
		return pieces.map( a => parseInt(a.position));
	}

	filterPositions(positions) {
		return positions.filter(pos => {
			return pos > 10 && pos < 89
		});
	};

	unblockedPositions(allowedPositions=[], position, color, checking=true){
		position = parseInt(position);
		const unblockedPositions = [];

		if (color == 'white') {
			var myBlockedPositions    = this.getPlayerPositions('white');
			var otherBlockedPositions = this.getPlayerPositions('black');
		}
		else{
			var myBlockedPositions    = this.getPlayerPositions('black');
			var otherBlockedPositions = this.getPlayerPositions('white');
		}
		
		if (this.clickedPiece.hasRank('pawn')) {
			for (const move of allowedPositions[0]) { //attacking moves
				if (checking && this.myKingChecked(move)) continue;
				if (otherBlockedPositions.indexOf(move) != -1) unblockedPositions.push(move);
			}
			const blockedPositions = myBlockedPositions + otherBlockedPositions;
			for (const move of allowedPositions[1]) { //moving moves
				if (blockedPositions.indexOf(move) != -1) break;
				else if (checking && this.myKingChecked(move, false)) continue;
				unblockedPositions.push(move);
			}
		}
		else{
			allowedPositions.forEach( allowedPositionsGroup => {
				for (const move of allowedPositionsGroup) {
					if (myBlockedPositions.indexOf(move) != -1) {
						break;
					}
					else if ( checking && this.myKingChecked(move) ) {
						continue;
					}
					unblockedPositions.push(move);
					if (otherBlockedPositions.indexOf(move) != -1) break;
				}
			});
		}
			
		return this.filterPositions(unblockedPositions);
	}

	getPieceAllowedMoves(event, pieceName){
		const piece = this.getPieceByName(pieceName);
		if(this.turn == piece.color){
			this.clearSquares();
			this.setClickedPiece(piece);
			if (event.type == 'dragstart') {
				event.dataTransfer.setData("text", event.target.id);
			}

			let pieceAllowedMoves = piece.getAllowedMoves();
			if (piece.rank == 'king') {
				pieceAllowedMoves = this.getCastlingSquares(pieceAllowedMoves);
			}

			const allowedMoves = this.unblockedPositions( pieceAllowedMoves, piece.position, piece.color, true );
			this.allowedMoves = allowedMoves;
			return allowedMoves;
		}
		else if (this.clickedPiece && this.turn == this.clickedPiece.color && this.allowedMoves && this.allowedMoves.indexOf(piece.position) != -1) {
			this.kill(piece);
		}
		else{
			return 0;
		}
	}

	getCastlingSquares(allowedMoves) {
		if ( !this.clickedPiece.ableToCastle || this.king_checked(this.turn) ) return allowedMoves;
		const rook1 = this.getPieceByName(this.turn+'Rook1');
		const rook2 = this.getPieceByName(this.turn+'Rook2');
		if (rook1 && rook1.ableToCastle) {
			const castlingPosition = rook1.position + 2
            if(
                !this.positionHasExistingPiece(castlingPosition - 1) &&
                !this.positionHasExistingPiece(castlingPosition) && !this.myKingChecked(castlingPosition, true) &&
                !this.positionHasExistingPiece(castlingPosition + 1) && !this.myKingChecked(castlingPosition + 1, true)
            )
			allowedMoves[1].push(castlingPosition);
		}
		if (rook2 && rook2.ableToCastle) {
			const castlingPosition = rook2.position - 1;
			if(
                !this.positionHasExistingPiece(castlingPosition - 1) && !this.myKingChecked(castlingPosition - 1, true) &&
                !this.positionHasExistingPiece(castlingPosition) && !this.myKingChecked(castlingPosition, true)
            )
			allowedMoves[0].push(castlingPosition);
		}
		return allowedMoves;
	}

	getPieceByName(piecename) {
		return this.pieces.filter( obj => obj.name === piecename )[0];
	}

	getPieceByPos(piecePosition) {
		return this.pieces.filter(obj =>  obj.position === piecePosition )[0];
	}

	positionHasExistingPiece(position) {
		return this.getPieceByPos(position) != undefined;
	}

	setClickedPiece(piece) {
		this.clickedPiece = piece;
	}

	movePiece(event, square='') {
		square = square || event.target;
		if (square.classList.contains('allowed')) {
			const clickedPiece = this.clickedPiece;
			if (clickedPiece) {
				const newPosition = square.getAttribute('id');
				if (clickedPiece.hasRank('king') || clickedPiece.hasRank('pawn'))
					clickedPiece.changePosition(newPosition, true);
				else
					clickedPiece.changePosition(newPosition);
				square.append(clickedPiece.img);
				this.clearSquares();
				this.changeTurn();
				if (this.king_checked(this.turn)) {
					if (this.king_dead(this.turn)) {
						this.checkmate(clickedPiece.color);
					}
					else{
						// alert('check');
					}
				}
			}
			else{
				return 0;
			}
		}
		if (event) event.preventDefault();
	}

	kill(piece) {
		piece.img.parentNode.removeChild(piece.img);
		piece.img.className = '';

		if (piece.color == 'white') this.whiteSematary.querySelector('.'+piece.rank).append(piece.img);
		else this.blackSematary.querySelector('.'+piece.rank).append(piece.img);

		const chosenSquare = document.getElementById(piece.position);
		this.pieces.splice(this.pieces.indexOf(piece), 1);
		this.movePiece('', chosenSquare);
	}

	castleRook(rookName) {
		const rook = this.getPieceByName(rookName);
		const newPosition = rookName.indexOf('Rook2') != -1 ? rook.position - 2 : rook.position + 3;

		this.setClickedPiece(rook);
		const chosenSquare = document.getElementById(newPosition);
		chosenSquare.classList.add('allowed');

		this.movePiece('', chosenSquare );
		this.changeTurn();
	}

	promote(pawn) {
		const queenName = pawn.name.replace('Pawn', 'Queen');
		const image = pawn.img;
		image.id = queenName;
		image.src = image.src.replace('Pawn', 'Queen');
		this.pieces.splice(this.pieces.indexOf(pawn), 1);
		this.pieces.push( new Queen(pawn.position, queenName) );
	}

	myKingChecked(pos, kill=true){
		const piece = this.clickedPiece;
		const originalPosition = piece.position;
		const otherPiece = this.getPieceByPos(pos);
		const should_kill_other_piece = kill && otherPiece && otherPiece.rank != 'king';
		piece.changePosition(pos);
		if (should_kill_other_piece) this.pieces.splice(this.pieces.indexOf(otherPiece), 1);
		if (this.king_checked(piece.color)) {
			piece.changePosition(originalPosition);
			if (should_kill_other_piece) this.pieces.push(otherPiece);
			return 1;
		}
		else{
			piece.changePosition(originalPosition);
			if (should_kill_other_piece) this.pieces.push(otherPiece);
			return 0;
		}
	}

	king_dead(color) {
		const pieces = this.getPiecesByColor(color);
		for (const piece of pieces) {
			this.setClickedPiece(piece);
			const allowedMoves = this.unblockedPositions( piece.getAllowedMoves(), piece.position, piece.color, true );
			if (allowedMoves.length) {
				this.setClickedPiece(null);
				return 0;
			}
		}
		this.setClickedPiece(null);
		return 1;
	}

	king_checked(color) {
		const piece = this.clickedPiece;
		const king = this.getPieceByName(color + 'King');
		const enemyColor = (color == 'white') ? 'black' : 'white';
		const enemyPieces = this.getPiecesByColor(enemyColor);
		for (const enemyPiece of enemyPieces) {
			this.setClickedPiece(enemyPiece);
			const allowedMoves = this.unblockedPositions( enemyPiece.getAllowedMoves(), enemyPiece.position, enemyColor, false );
			if (allowedMoves.indexOf(king.position) != -1) {
				this.setClickedPiece(piece);
				return 1;
			}
		}
		this.setClickedPiece(piece);
		return 0;
	}

	clearSquares(){
		this.allowedMoves = null;
		const allowedSquares = this.board.querySelectorAll('.allowed');
		allowedSquares.forEach( allowedSquare => allowedSquare.classList.remove('allowed') );
		const cllickedSquare = document.getElementsByClassName('clicked-square')[0];
		if (cllickedSquare) cllickedSquare.classList.remove('clicked-square');
	}

	checkmate(color){
		const endScene = document.getElementById('endscene');
		endScene.getElementsByClassName('winning-sign')[0].innerHTML = color + ' Wins';
		endScene.classList.add('show');
	}
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