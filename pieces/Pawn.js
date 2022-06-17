class Pawn extends Piece {
	constructor(position, name) {
		super(position, 'pawn', name)
	}

	getAllowedMoves() {
			const position = this.position;
			const mathSign = (this.color == 'white')? '+': '-';
			const allowedMoves = [eval(position + mathSign +'10' )];

			if ( (position >20 && position < 29) || (position >70 && position < 79) )
				allowedMoves.push(eval(position + mathSign +'20' ));

			const attackMoves = [eval(position + mathSign + '9'), eval(position + mathSign + '11')]
			return [ attackMoves, allowedMoves ];
	}

	changePosition(position, promote=false) {
		this.position = parseInt(position);
		if (promote && (position > 80 || position < 20)) game.promote(this);
	}
}