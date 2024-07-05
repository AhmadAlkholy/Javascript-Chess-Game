class Pawn extends Piece {
	constructor(position, name) {
		super(position, 'pawn', name);
	}

	getAllowedMoves() {
		let allowedMoves = [[], []]; // [attacking moves, moving moves]

		if (this.color === 'white') {
			// Movimientos de ataque
			allowedMoves[0].push(this.position + 9, this.position + 11);
			// Movimientos normales
			allowedMoves[1].push(this.position + 10);
			if (Math.floor(this.position / 10) === 2) allowedMoves[1].push(this.position + 20); // Movimiento doble
		} else {
			// Movimientos de ataque
			allowedMoves[0].push(this.position - 9, this.position - 11);
			// Movimientos normales
			allowedMoves[1].push(this.position - 10);
			if (Math.floor(this.position / 10) === 7) allowedMoves[1].push(this.position - 20); // Movimiento doble
		}

		return allowedMoves;
	}

	getEnPassantMoves(lastMove) {
		let enPassantMoves = [];

		if (!lastMove || lastMove.piece.rank !== 'pawn') return enPassantMoves;

		const direction = this.color === 'white' ? 10 : -10;
		const startRow = this.color === 'white' ? 5 : 4;
		const opponentColor = this.color === 'white' ? 'black' : 'white';

		if (Math.floor(this.position / 10) === startRow && lastMove.piece.color === opponentColor &&
			Math.abs(lastMove.to - lastMove.from) === 20 &&
			Math.abs(this.position - lastMove.to) === 1) {
			enPassantMoves.push(lastMove.to + direction);
		}

		return enPassantMoves;
	}
}