class Pawn extends Piece {
	constructor(position, name) {
		super(position, 'pawn', name)
	}

	getAllowedMoves() {
		const position = this.position;
		const mathSign = (this.color === 'white') ? 1 : -1;
		const allowedMoves = [position + mathSign * 10];

		if ((position > 20 && position < 29) || (position > 70 && position < 79)) {
			allowedMoves.push(position + mathSign * 20);
		}

		const attackMoves = [position + mathSign * 9, position + mathSign * 11];

		// En passant conditions
		if ((this.color === 'white' && Math.floor(position / 10) === 5) ||
			(this.color === 'black' && Math.floor(position / 10) === 4)) {
			if (game.enPassantTarget === position + mathSign * 9) {
				attackMoves.push(position + mathSign * 9);
			}
			if (game.enPassantTarget === position + mathSign * 11) {
				attackMoves.push(position + mathSign * 11);
			}
		}

		return [attackMoves, allowedMoves];
	}

}