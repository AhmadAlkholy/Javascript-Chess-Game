class Game {
	constructor(pieces, turn) {
		this.startNewGame(pieces, turn);
	}

	startNewGame(pieces, turn) {
		this._setPieces(pieces);

		this.turn = turn;
		this.clickedPiece = null;
		this._events = {
			pieceMove: [],
			kill: [],
			check: [],
			promotion: [],
			checkMate: [],
			turnChange: []
		}
		this.history = new History();
	}

	_setPieces(pieces) {
		this.pieces = Array(pieces.length);
        pieces.forEach( (piece, i) =>  {
			this.pieces[i] = { rank: piece.rank, position: piece.position, color: piece.color, name: piece.name, ableToCastle: piece.ableToCastle }
		});
		this.playerPieces = {
			white: this.pieces.filter(piece => piece.color === 'white'),
			black: this.pieces.filter(piece => piece.color === 'black')
		}
	}

	_removePiece(piece) {
		this.pieces.splice(this.pieces.indexOf(piece), 1);
		this.playerPieces[piece.color].splice(this.playerPieces[piece.color].indexOf(piece), 1)
	}

	_addPiece(piece) {
		this.pieces.push(piece);
		this.playerPieces[piece.color].push(piece);
	}

	saveHistory() {
		this.history.save();
	}

	addToHistory(move) {
		this.history.add(move);
	}

	clearEvents() {
		this._events = {};
	}

	undo() {
		const step = this.history.pop();

		if (!step) {
			return false;
		}

		for (const subStep of step) {
			changePosition(subStep.piece, subStep.from);
			if (subStep.from !== 0) {
				if (subStep.to === 0) {
					this._addPiece(subStep.piece);
				}
				else if (subStep.castling) {
					subStep.piece.ableToCastle = true;
				}
				this.triggerEvent('pieceMove', subStep);
			}
			else {
				this._removePiece(subStep.piece);
				this.triggerEvent('kill', subStep.piece);
			}

			if (subStep.from !== 0 && subStep.to !== 0 && (!subStep.castling || subStep.piece.rank === 'king') ) {
				this.softChangeTurn();
			}
		}
	}

	on(eventName, callback) {
		if (this._events[eventName] && typeof callback === 'function') {
			this._events[eventName].push(callback);
		}
	}

	softChangeTurn() {
		this.turn = this.turn === 'white' ? 'black' : 'white';
		this.triggerEvent('turnChange', this.turn);
	}

	changeTurn() {
		this.softChangeTurn();
		this.saveHistory();
	}

	getPiecesByColor(color) {
		return this.playerPieces[color];
	}

	getPlayerPositions(color){
		return this.getPiecesByColor(color).map(piece => piece.position);
	}

	filterPositions(positions) {
		return positions.filter(pos => {
			const x = pos % 10;
			return pos > 10 && pos < 89 && x !== 9 && x !== 0;
		});
	};

	unblockedPositions(piece, allowedPositions, checking=true) {
		const unblockedPositions = [];

		const myColor = piece.color;
		const otherColor = piece.color === 'white' ? 'black' : 'white';

		const myBlockedPositions    = this.getPlayerPositions(myColor);
		const otherBlockedPositions = this.getPlayerPositions(otherColor);

		if (piece.rank === 'pawn') {
			for (const move of allowedPositions[0]) { //attacking moves
				if (checking && this.myKingChecked(move)) continue;
				if (otherBlockedPositions.indexOf(move) !== -1) unblockedPositions.push(move);
			}

			for (const move of allowedPositions[1]) { //moving moves
				if (myBlockedPositions.indexOf(move) !== -1 || otherBlockedPositions.indexOf(move) !== -1) {
					break;
				}
				else if (checking && this.myKingChecked(move, false)) continue;
				unblockedPositions.push(move);
			}
		}
		else{
			allowedPositions.forEach( allowedPositionsGroup => {
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

			let pieceAllowedMoves = getAllowedMoves(piece);
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
		for (const piece of this.pieces) {
			if (piece.name === piecename) {
				return piece;
			}
		}
	}

	getPieceByPos(position) {
		for (const piece of this.pieces) {
			if (piece.position == position) {
				return piece;
			}
		}
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

		position = parseInt(position);

		if (piece && this.getPieceAllowedMoves(piece.name).indexOf(position) !== -1) {
			const prevPosition = piece.position;
			const existedPiece = this.getPieceByPos(position)

			if (existedPiece) {
				this.kill(existedPiece);
			}

			const castling = !existedPiece && piece.rank === 'king' && piece.ableToCastle === true;

			if (castling) {
				if (position - prevPosition === 2) {
					this.castleRook(piece.color + 'Rook2');
				}
				else if (position - prevPosition === -2) {
					this.castleRook(piece.color + 'Rook1');
				}
				changePosition(piece, position, true);
			}
			else {
				changePosition(piece, position);
			}

			const move = { from: prevPosition, to: position, piece: piece, castling };
			this.addToHistory(move);
			this.triggerEvent('pieceMove', move);

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
		this._removePiece(piece);
		this.addToHistory({from: piece.position, to: 0, piece: piece});
		this.triggerEvent('kill', piece);
	}

	castleRook(rookName) {
		const rook = this.getPieceByName(rookName);
		const prevPosition = rook.position;
		const newPosition = rookName.indexOf('Rook2') !== -1 ? rook.position - 2 : rook.position + 3;

		changePosition(rook, newPosition);
		const move = {from: prevPosition, to: newPosition, piece: rook, castling: true};
		this.triggerEvent('pieceMove', move);
		this.addToHistory(move);
	}

	promote(pawn) {
		pawn.name = pawn.name.replace('Pawn', 'Queen');
		pawn.rank = 'queen';
		this.addToHistory({from: 0, to: pawn.position, piece: pawn});
		this.triggerEvent('promotion', pawn);
	}

	myKingChecked(pos, kill=true){
		const piece = this.clickedPiece;
		const originalPosition = piece.position;
		const otherPiece = this.getPieceByPos(pos);
		const should_kill_other_piece = kill && otherPiece && otherPiece.rank !== 'king';
		changePosition(piece, pos);
		if (should_kill_other_piece) {
			this._removePiece(otherPiece);
		}
		if (this.king_checked(piece.color)) {
			changePosition(piece, originalPosition);
			if (should_kill_other_piece) {
				this._addPiece(otherPiece);
			}
			return 1;
		}
		else{
			changePosition(piece, originalPosition);
			if (should_kill_other_piece) {
				this._addPiece(otherPiece);
			}
			return 0;
		}
	}

	king_dead(color) {
		const pieces = this.getPiecesByColor(color);
		for (const piece of pieces) {
			this.setClickedPiece(piece);
			const allowedMoves = this.unblockedPositions(piece, getAllowedMoves(piece), true);
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
			const allowedMoves = this.unblockedPositions(enemyPiece, getAllowedMoves(enemyPiece), false);
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