class Pawn extends Piece {
	constructor(position, name) {
		super(position, 'pawn', name);
	}

	getAllowedMoves() {
		const position = this.position;
		const mathSign = (this.color === 'white') ? 1 : -1;
		const allowedMoves = [position + mathSign * 10];

		if ((position > 20 && position < 29) || (position > 70 && position < 79)) {
			allowedMoves.push(position + mathSign * 20);
		}

		const attackMoves = [position + mathSign * 9, position + mathSign * 11];

		return [attackMoves, allowedMoves];
	}

	getEnPassantMoves(lastMove) {
		const position = this.position;
		const mathSign = (this.color === 'white') ? 1 : -1;
		const enPassantMoves = [];
		const row = Math.floor(position / 10);
		const col = position % 10;
		const targetRow = (this.color === 'white') ? 5 : 4;

		console.log(`Checking en passant for ${this.name} at position ${position}`);
		console.log(`Pawn is at row ${row}, should be at row ${targetRow}`);

		if (row !== targetRow) {
			console.log(`Pawn is not at the correct row for en passant.`);
			return enPassantMoves;
		}

		if (lastMove && lastMove.piece.rank === 'pawn' && Math.abs(lastMove.to - lastMove.from) === 20) {
			const opponentPawnPos = lastMove.to;
			const opponentRow = Math.floor(opponentPawnPos / 10);
			const opponentCol = opponentPawnPos % 10;

			console.log(`Last move details: piece=${lastMove.piece.name}, from=${lastMove.from}, to=${lastMove.to}, isDoubleStep=${Math.abs(lastMove.to - lastMove.from) === 20}`);
			console.log(`Opponent pawn is at row ${opponentRow}, column ${opponentCol}, current pawn is at column ${col}`);

			if (opponentRow === targetRow && Math.abs(col - opponentCol) === 1) {
				const targetPos = opponentPawnPos + mathSign * 10;
				enPassantMoves.push(targetPos);
				console.log(`En passant move detected for ${this.name} to position ${targetPos}`);
			} else {
				console.log(`No en passant move for ${this.name}: row=${row}, opponentRow=${opponentRow}, currentCol=${col}, opponentCol=${opponentCol}`);
			}
		} else {
			console.log(`No valid last move for en passant: last move was not a double step or last move is null`);
		}

		return enPassantMoves;
	}
}
