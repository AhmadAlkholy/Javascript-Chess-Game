class History {

    constructor() {
        this._lastStep = [];
        this._history = [];
    }

    add(step) {
        this._lastStep.push(step);
    }

    save() {
        this._history.push(this._lastStep);
        this._lastStep = [];
    }

    pop() {
        return this._history.pop();
    }

    lastMove() {
        return this._history[ this._history.length - 1 ];
    }
}