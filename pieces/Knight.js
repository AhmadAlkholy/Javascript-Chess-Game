class Knight extends Piece {
	constructor(position, name) {
		super(position, 'knight', name);
	}

	getAllowedMoves() {
		const position = this.position;
		return [
			[parseInt(position) + 21],
			[parseInt(position) - 21],
			[parseInt(position) + 19],
			[parseInt(position) - 19],
			[parseInt(position) + 12],
			[parseInt(position) - 12],
			[parseInt(position) + 8],
			[parseInt(position) - 8]
		];
	}
}