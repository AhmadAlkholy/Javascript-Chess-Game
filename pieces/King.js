class King extends Piece {
	constructor(position, name) {
		super(position, 'king', name);
		this.able_to_castle = true;
	}


	getAllowedMoves() {
		const position = this.position;
		const allowedMoves = [
			[parseInt(position) + 1],
			[parseInt(position) - 1],
			[parseInt(position) + 10],
			[parseInt(position) - 10],
			[parseInt(position) + 11],
			[parseInt(position) - 11],
			[parseInt(position) + 9],
			[parseInt(position) - 9]
		];

		if (this.able_to_castle) {
			const rook1 = game.getPieceByName(this.color+'Rook1');
			const rook2 = game.getPieceByName(this.color+'Rook2');
			if (rook1 && rook1.able_to_castle) {
				allowedMoves[1].push(rook1.position + 2);
				allowedMoves[1].push(rook1.position + 1);
			}
			if (rook2 && rook2.able_to_castle) {
				allowedMoves[0].push(rook2.position - 1);
			}
		}
		return allowedMoves;
	}

	remove_castling_ability() {
		this.able_to_castle = false;
	}

	changePosition(position, castle=false) {
		if (castle) {
			if (position - this.position == 2) game.castleRook(this.color+'Rook2');
			if (position - this.position == -3) game.castleRook(this.color+'Rook1');
			this.able_to_castle = false;
		}
		this.position = parseInt(position);
	}
}