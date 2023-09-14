class Game {
	constructor(pieces) {
		this.pieces  = pieces;
		this.turn    = 'white';
		this.clickedPiece = null;
		this._events = {
			pieceMove: [],
			kill: [],
			check: [],
			promotion: [],
			checkMate: [],
			turnChange: []
		}
	}

	clearEvents() {
		this._events = {};
	}

	on (eventName, callback) {
		if (this._events[eventName] && typeof callback === 'function') {
			this._events[eventName].push(callback);
		}
	}

	changeTurn() {
		this.turn = this.turn === 'white' ? 'black' : 'white';
		this.triggerEvent('turnChange', this.turn);
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
			const secondDigit = pos.toString().charAt(1);
			return pos > 10 && pos < 89 && secondDigit < 9 && secondDigit > 0;
		});
	};

	unblockedPositions(piece, allowedPositions, checking=true) {
		const unblockedPositions = [];

		if (piece.color === 'white') {
			var myBlockedPositions    = this.getPlayerPositions('white');
			var otherBlockedPositions = this.getPlayerPositions('black');
		}
		else{
			var myBlockedPositions    = this.getPlayerPositions('black');
			var otherBlockedPositions = this.getPlayerPositions('white');
		}

		if (piece.hasRank('pawn')) {
			for (const move of allowedPositions[0]) { //attacking moves
				if (checking && this.myKingChecked(move)) continue;
				if (otherBlockedPositions.indexOf(move) !== -1) unblockedPositions.push(move);
			}
			const blockedPositions = [...myBlockedPositions, ...otherBlockedPositions];
			for (const move of allowedPositions[1]) { //moving moves
				if (blockedPositions.indexOf(move) !== -1) {
					break;
				}
				else if (checking && this.myKingChecked(move, false)) continue;
				unblockedPositions.push(move);
			}
		}
		else{
			allowedPositions.forEach( (allowedPositionsGroup, index) => {
				for (const move of allowedPositionsGroup) {
					if (myBlockedPositions.indexOf(move) !== -1) {
						break;
					}
					else if ( checking && this.myKingChecked(move) ) {
						if (otherBlockedPositions.indexOf(move) !== -1) {
							break;
						}
						continue;
					}
					unblockedPositions.push(move);

					if (otherBlockedPositions.indexOf(move) !== -1) {
						break;
					}
				}
			});
		}

		return this.filterPositions(unblockedPositions);
	}

	getPieceAllowedMoves(pieceName){
		const piece = this.getPieceByName(pieceName);
		if(this.turn === piece.color){
			this.setClickedPiece(piece);

			let pieceAllowedMoves = piece.getAllowedMoves();
			if (piece.rank === 'king') {
				pieceAllowedMoves = this.getCastlingSquares(piece, pieceAllowedMoves);
			}

			return this.unblockedPositions(piece, pieceAllowedMoves, true);
		}
		else{
			return [];
		}
	}

	getCastlingSquares(king, allowedMoves) {
		if ( !king.ableToCastle || this.king_checked(this.turn) ) return allowedMoves;
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
		return this.pieces.filter(obj =>  obj.position == piecePosition )[0];
	}

	positionHasExistingPiece(position) {
		return this.getPieceByPos(position) !== undefined;
	}

	setClickedPiece(piece) {
		this.clickedPiece = piece;
	}

	triggerEvent(eventName, params) {
		if (this._events[eventName]) {
			for (const cb of this._events[eventName]) {
				cb(params);
			}
		}
	}

	movePiece(pieceName, position) {
		const piece = this.getPieceByName(pieceName);
		const prevPosition = piece.position;
		position = parseInt(position);

		if (piece && this.getPieceAllowedMoves(piece.name).indexOf(position) !== -1) {
			const existedPiece = this.getPieceByPos(position)

			if (existedPiece) {
				this.kill(existedPiece);
			}

			if (!existedPiece && piece.hasRank('king') && piece.ableToCastle === true) {
				if (position - prevPosition === 2) {
					this.castleRook(piece.color + 'Rook2');
				}
				else if (position - prevPosition === -2) {
					this.castleRook(piece.color + 'Rook1');
				}
				piece.changePosition(position, true);
			}
			else {
				piece.changePosition(position);
			}

			this.triggerEvent('pieceMove', piece);

			if (piece.rank === 'pawn' && (position > 80 || position < 20)) {
				this.promote(piece);
			}

			this.changeTurn();

			if (this.king_checked(this.turn)) {
				this.triggerEvent('check', this.turn);

				if (this.king_dead(this.turn)) {
					this.checkmate(piece.color);
				}
				else{
					// alert('check');
				}
			}

			return true;
		}
		else{
			return false;
		}
	}

	kill(piece) {
		this.pieces.splice(this.pieces.indexOf(piece), 1);
		this.triggerEvent('kill', piece);
	}

	castleRook(rookName) {
		const rook = this.getPieceByName(rookName);
		const newPosition = rookName.indexOf('Rook2') !== -1 ? rook.position - 2 : rook.position + 3;

		this.setClickedPiece(rook);

		this.movePiece(rookName, newPosition);
		this.triggerEvent('pieceMove', rook);
		this.changeTurn();
	}

	promote(pawn) {
		const queenName = pawn.name.replace('Pawn', 'Queen');
		this.pieces.splice(this.pieces.indexOf(pawn), 1);
		const queen = new Queen(pawn.position, queenName);
		this.pieces.push(queen);
		this.triggerEvent('promotion', queen);
	}

	myKingChecked(pos, kill=true){
		const piece = this.clickedPiece;
		const originalPosition = piece.position;
		const otherPiece = this.getPieceByPos(pos);
		const should_kill_other_piece = kill && otherPiece && otherPiece.rank !== 'king';
		piece.changePosition(pos);
		if (should_kill_other_piece) this.pieces.splice(this.pieces.indexOf(otherPiece), 1);
		if (this.king_checked(piece.color)) {
			piece.changePosition(originalPosition);
			if (should_kill_other_piece) {
				this.pieces.push(otherPiece);
			}
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
			const allowedMoves = this.unblockedPositions(piece, piece.getAllowedMoves(), true);
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
		const enemyColor = (color === 'white') ? 'black' : 'white';
		const enemyPieces = this.getPiecesByColor(enemyColor);
		for (const enemyPiece of enemyPieces) {
			this.setClickedPiece(enemyPiece);
			const allowedMoves = this.unblockedPositions(enemyPiece, enemyPiece.getAllowedMoves(), false);
			if (allowedMoves.indexOf(king.position) !== -1) {
				this.setClickedPiece(piece);
				return 1;
			}
		}
		this.setClickedPiece(piece);
		return 0;
	}

	checkmate(color){
		this.triggerEvent('checkMate', color);
		this.clearEvents();
	}
}