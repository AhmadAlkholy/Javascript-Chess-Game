class SimulationGame extends Game {

    startNewGame(pieces, turn) {
		this._setPieces(pieces);
		this.turn = turn;
		this.clickedPiece = null;
	}

	saveHistory() {}

	addToHistory(move) {}

    triggerEvent(eventName, params) {}

    clearEvents() {}

	undo() {}

    getPieceAllowedMoves(pieceName){
        const piece = this.getPieceByName(pieceName);
        if(piece && this.turn === piece.color){
            this.setClickedPiece(piece);

            let pieceAllowedMoves = getAllowedMoves(piece);
            if (piece.rank === 'king') {
                pieceAllowedMoves = this.getCastlingSquares(piece, pieceAllowedMoves);
            }

            return this.unblockedPositions(piece, pieceAllowedMoves, true);
        }
        else{
            return [];
        }
    }

    movePiece(pieceName, position) {
        const piece = this.getPieceByName(pieceName);

        /*if (!piece) {
            return false;
        }*/

        const prevPosition = piece.position;
        const existedPiece = this.getPieceByPos(position)

        if (existedPiece) {
            this.kill(existedPiece);
        }

        const castling = !existedPiece && piece.rank === 'king' && piece.ableToCastle === true;

        if (castling) {
            if (position - prevPosition === 2) {
                this.castleRook(piece.color + 'Rook2');
            }
            else if (position - prevPosition === -2) {
                this.castleRook(piece.color + 'Rook1');
            }
            changePosition(piece, position, true);
        }
        else {
            changePosition(piece, position);
        }

        if (piece.rank === 'pawn' && (position > 80 || position < 20)) {
            this.promote(piece);
        }

        // this.history.add({ from: prevPosition, to: position, piece: piece, castling });
        this.changeTurn();

        return true;
    }

    king_checked(color) {
        const piece = this.clickedPiece;
        const king = this.getPieceByName(color + 'King');
        if (!king) {
            return true;
        }
        const enemyColor = (color === 'white') ? 'black' : 'white';
        const enemyPieces = this.getPiecesByColor(enemyColor);
        for (const enemyPiece of enemyPieces) {
            this.setClickedPiece(enemyPiece);
            const allowedMoves = this.unblockedPositions(enemyPiece, getAllowedMoves(enemyPiece), false);
            if (allowedMoves.indexOf(king.position) !== -1) {
                this.setClickedPiece(piece);
                return 1;
            }
        }
        this.setClickedPiece(piece);
        return 0;
    }

    checkmate(color){}
}