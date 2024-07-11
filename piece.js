const changePosition = (piece, position, castle=false) => {
	piece.position = position;

	if (piece.rank === 'king') {
		if (castle) {
			piece.ableToCastle = false;
		}
	}

	if (piece.rank === 'rook') {
		piece.ableToCastle = false;
	}

}

const getMovesTop = (piece) => {
	const movesTop = [];
	for (let move = piece.position+10; move <= 88; move+=10) movesTop.push(move);
	return movesTop;
}

const getMovesBottom = (piece) => {
	const movesBottom = [];
	for (let move = piece.position-10; move >= 11 ; move-=10) movesBottom.push(move);
	return movesBottom;
}

const getMovesRight = (piece) => {
	const num = piece.position+'';
	const movesRight = [];
	for (let move = piece.position+1; move <= parseInt(num[0]+'8'); move++) movesRight.push(move);
	return movesRight;
}

const getMovesLeft = (piece) => {
	const num = piece.position+'';
	const movesLeft = [];
	for (let move = piece.position-1; move >= parseInt(num[0]+'1'); move--) movesLeft.push(move);
	return movesLeft;
}

const getMovesTopRight = (piece) => {
	const movesTopRight = [];
	for (let move = piece.position+11; move <= 88; move+=11) {
		const firstDigit = (''+move)[1];
		if (firstDigit > 8 || firstDigit < 1) break;
		movesTopRight.push(move);
	}
	return movesTopRight;
}

const getMovesTopLeft = (piece) => {
	const movesTopLeft = [];
	for (let move = piece.position+9; move <= 88; move+=9) {
		const firstDigit = (''+move)[1];
		if (firstDigit > 8 || firstDigit < 1) break;
		movesTopLeft.push(move);
	}
	return movesTopLeft;
}

const getMovesBottomRight = (piece) => {
	const movesBottomRight = [];
	for (let move = piece.position-9; move >= 11 ; move-=9) {
		const firstDigit = (''+move)[1];
		if (firstDigit > 8 || firstDigit < 1) break;
		movesBottomRight.push(move);
	}
	return movesBottomRight;
}

const getMovesBottomLeft = (piece) => {
	const movesBottomLeft = [];
	for (let move = piece.position-11; move >= 11 ; move-=11) {
		const firstDigit = (''+move)[1];
		if (firstDigit > 8 || firstDigit < 1) break;
		movesBottomLeft.push(move);
	}
	return movesBottomLeft;
}

const getPawnAllowedMoves = (pawn) => {
	const position = pawn.position;
	const mathSign = (pawn.color === 'white') ? 1: -1;
	const allowedMoves = [position + mathSign * 10];

	if ( (position >20 && position < 29) || (position >70 && position < 79) ) {
		allowedMoves.push(position + mathSign * 20);
	}

	const attackMoves = [position + mathSign * 9, position + mathSign * 11];
	return [ attackMoves, allowedMoves ];
}

const getKnightAllowedMoves = (knight) => {
	const position = knight.position;
	return [
		[position + 21],
		[position - 21],
		[position + 19],
		[position - 19],
		[position + 12],
		[position - 12],
		[position + 8],
		[position - 8]
	];
}

const getKingAllowedMoves = king => {
	const position = king.position;
	return [
		[position + 1],
		[position - 1],
		[position + 10],
		[position - 10],
		[position + 11],
		[position - 11],
		[position + 9],
		[position - 9]
	];
}

const getBishopAllowedMoves = (bishop) => {
	return [ getMovesTopRight(bishop), getMovesTopLeft(bishop), getMovesBottomRight(bishop), getMovesBottomLeft(bishop) ];
}

const getRookAllowedMoves = (rook) => {
	return [ getMovesTop(rook), getMovesBottom(rook), getMovesRight(rook), getMovesLeft(rook) ];
}

const getQueenAllowedMoves = queen => {
	return [
		getMovesTop(queen),
		getMovesTopRight(queen),
		getMovesTopLeft(queen),
		getMovesBottom(queen),
		getMovesBottomRight(queen),
		getMovesBottomLeft(queen),
		getMovesRight(queen),
		getMovesLeft(queen)
	];
}

const getAllowedMoves = (piece) => {
	let allowedMoves;

	switch (piece.rank) {
		case 'pawn':
			allowedMoves = getPawnAllowedMoves(piece);
			break;
		case 'knight':
			allowedMoves = getKnightAllowedMoves(piece);
			break;
		case 'king':
			allowedMoves = getKingAllowedMoves(piece);
			break;
		case 'bishop':
			allowedMoves = getBishopAllowedMoves(piece);
			break;
		case 'rook':
			allowedMoves = getRookAllowedMoves(piece);
			break;
		case 'queen':
			allowedMoves = getQueenAllowedMoves(piece);
			break;
		default:
			throw "Unknown rank: " + piece.type;
	}

	return allowedMoves;
}