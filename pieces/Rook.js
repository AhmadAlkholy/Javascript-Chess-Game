class Rook extends Piece {
	constructor(position, name) {
		super(position, 'rook', name);
		this.able_to_castle = true;
	}

	changePosition(position) {
		this.position = parseInt(position);
		this.able_to_castle = false;
	}

	getAllowedMoves() {
		return [ this.getMovesTop(), this.getMovesBottom(), this.getMovesRight(), this.getMovesLeft() ];
	}
}