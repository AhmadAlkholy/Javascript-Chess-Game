class Pawn extends Piece {
	constructor(position, name) {
		super(position, 'pawn', name)
	}

	getAllowedMoves() {
			const position = this.position;
			const mathSign = (this.color === 'white') ? 1: -1;
			const allowedMoves = [position + mathSign * 10];

			if ( (position >20 && position < 29) || (position >70 && position < 79) ) {
				allowedMoves.push(position + mathSign * 20);
			}

			const attackMoves = [position + mathSign * 9, position + mathSign * 11];
			return [ attackMoves, allowedMoves ];
	}
}