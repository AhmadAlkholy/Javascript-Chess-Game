class Bishop extends Piece {
	constructor(position, name) {
		super(position, 'bishop', name);
	}

	getAllowedMoves() {
		return [ this.getMovesTopRight(), this.getMovesTopLeft(), this.getMovesBottomRight(), this.getMovesBottomLeft() ];
	}
}

exports = Bishop;