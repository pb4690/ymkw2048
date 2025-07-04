class GameEngine {
    constructor(size = GameConfig.GRID_SIZE) {
        this.size = size;
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem(GameConfig.STORAGE_KEYS.BEST_SCORE)) || 0;
        this.moveHistory = [];
        this.mergedPositions = [];
        this.init();
    }

    init() {
        this.createEmptyGrid();
        this.addRandomTile();
        this.addRandomTile();
    }

    createEmptyGrid() {
        this.grid = [];
        for (let i = 0; i < this.size; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.size; j++) {
                this.grid[i][j] = 0;
            }
        }
    }

    addRandomTile() {
        const emptyCells = this.getEmptyPositions();
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const newValue = Math.random() < GameConfig.NEW_TILE_PROBABILITY_2 ? 2 : 4;
            this.grid[randomCell.row][randomCell.col] = newValue;
            return {row: randomCell.row, col: randomCell.col, value: newValue};
        }
        return null;
    }

    getEmptyPositions() {
        const emptyPositions = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    emptyPositions.push({row: i, col: j});
                }
            }
        }
        return emptyPositions;
    }

    // 修正された移動ロジック - 実際の動きのみを記録
    move(direction) {
        this.moveHistory = [];
        this.mergedPositions = [];
        
        const originalGrid = JSON.parse(JSON.stringify(this.grid));
        let moved = false;

        switch(direction) {
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
        }

        // 実際に移動が発生した場合のみ新しいタイルを追加
        if (moved && !this.gridsEqual(originalGrid, this.grid)) {
            const newTile = this.addRandomTile();
            this.updateBestScore();
            
            return {
                moved: true,
                moveHistory: this.moveHistory,
                mergedPositions: this.mergedPositions,
                newGrid: this.grid,
                newTile: newTile,
                score: this.score,
                bestScore: this.bestScore
            };
        }

        return {
            moved: false,
            moveHistory: [],
            mergedPositions: [],
            newGrid: this.grid,
            newTile: null,
            score: this.score,
            bestScore: this.bestScore
        };
    }

    moveLeft() {
        let moved = false;
        
        for (let i = 0; i < this.size; i++) {
            const originalRow = [...this.grid[i]];
            const { newRow, rowMoved, moves, merges } = this.processRow(originalRow, 'left');
            
            if (rowMoved) {
                this.grid[i] = newRow;
                moved = true;
                
                // 移動履歴を記録
                moves.forEach(move => {
                    this.moveHistory.push({
                        fromRow: i,
                        fromCol: move.from,
                        toRow: i,
                        toCol: move.to,
                        value: move.value,
                        type: 'move'
                    });
                });
                
                // マージ履歴を記録
                merges.forEach(merge => {
                    this.mergedPositions.push({
                        row: i,
                        col: merge.position,
                        value: merge.value
                    });
                    this.score += merge.value;
                });
            }
        }
        
        return moved;
    }

    moveRight() {
        let moved = false;
        
        for (let i = 0; i < this.size; i++) {
            const originalRow = [...this.grid[i]];
            const { newRow, rowMoved, moves, merges } = this.processRow(originalRow, 'right');
            
            if (rowMoved) {
                this.grid[i] = newRow;
                moved = true;
                
                // 移動履歴を記録
                moves.forEach(move => {
                    this.moveHistory.push({
                        fromRow: i,
                        fromCol: move.from,
                        toRow: i,
                        toCol: move.to,
                        value: move.value,
                        type: 'move'
                    });
                });
                
                // マージ履歴を記録
                merges.forEach(merge => {
                    this.mergedPositions.push({
                        row: i,
                        col: merge.position,
                        value: merge.value
                    });
                    this.score += merge.value;
                });
            }
        }
        
        return moved;
    }

    moveUp() {
        let moved = false;
        
        for (let j = 0; j < this.size; j++) {
            const originalCol = [];
            for (let i = 0; i < this.size; i++) {
                originalCol.push(this.grid[i][j]);
            }
            
            const { newRow: newCol, rowMoved, moves, merges } = this.processRow(originalCol, 'left');
            
            if (rowMoved) {
                for (let i = 0; i < this.size; i++) {
                    this.grid[i][j] = newCol[i];
                }
                moved = true;
                
                // 移動履歴を記録
                moves.forEach(move => {
                    this.moveHistory.push({
                        fromRow: move.from,
                        fromCol: j,
                        toRow: move.to,
                        toCol: j,
                        value: move.value,
                        type: 'move'
                    });
                });
                
                // マージ履歴を記録
                merges.forEach(merge => {
                    this.mergedPositions.push({
                        row: merge.position,
                        col: j,
                        value: merge.value
                    });
                    this.score += merge.value;
                });
            }
        }
        
        return moved;
    }

    moveDown() {
        let moved = false;
        
        for (let j = 0; j < this.size; j++) {
            const originalCol = [];
            for (let i = 0; i < this.size; i++) {
                originalCol.push(this.grid[i][j]);
            }
            
            const { newRow: newCol, rowMoved, moves, merges } = this.processRow(originalCol, 'right');
            
            if (rowMoved) {
                for (let i = 0; i < this.size; i++) {
                    this.grid[i][j] = newCol[i];
                }
                moved = true;
                
                // 移動履歴を記録
                moves.forEach(move => {
                    this.moveHistory.push({
                        fromRow: move.from,
                        fromCol: j,
                        toRow: move.to,
                        toCol: j,
                        value: move.value,
                        type: 'move'
                    });
                });
                
                // マージ履歴を記録
                merges.forEach(merge => {
                    this.mergedPositions.push({
                        row: merge.position,
                        col: j,
                        value: merge.value
                    });
                    this.score += merge.value;
                });
            }
        }
        
        return moved;
    }

    // 1つの行/列を処理する共通メソッド
    processRow(row, direction) {
        const moves = [];
        const merges = [];
        let rowMoved = false;
        
        // 元の位置を記録
        const originalPositions = row.map((value, index) => ({ value, originalIndex: index }))
                                    .filter(item => item.value !== 0);
        
        // 空でない要素を方向に応じて並べる
        const values = originalPositions.map(item => item.value);
        if (direction === 'right') {
            values.reverse();
            originalPositions.reverse();
        }
        
        // マージ処理
        const mergedValues = [];
        const mergedOriginalPositions = [];
        let i = 0;
        
        while (i < values.length) {
            if (i < values.length - 1 && values[i] === values[i + 1]) {
                // マージ
                const mergedValue = values[i] * 2;
                mergedValues.push(mergedValue);
                mergedOriginalPositions.push([originalPositions[i], originalPositions[i + 1]]);
                i += 2;
            } else {
                // マージしない
                mergedValues.push(values[i]);
                mergedOriginalPositions.push([originalPositions[i]]);
                i++;
            }
        }
        
        // 新しい行を作成
        const newRow = new Array(this.size).fill(0);
        
        for (let i = 0; i < mergedValues.length; i++) {
            const targetIndex = direction === 'right' ? this.size - 1 - i : i;
            newRow[targetIndex] = mergedValues[i];
            
            const originalItems = mergedOriginalPositions[i];
            
            // 移動履歴を記録
            originalItems.forEach(item => {
                if (item.originalIndex !== targetIndex) {
                    moves.push({
                        from: item.originalIndex,
                        to: targetIndex,
                        value: item.value
                    });
                    rowMoved = true;
                }
            });
            
            // マージの場合
            if (originalItems.length === 2) {
                merges.push({
                    position: targetIndex,
                    value: mergedValues[i]
                });
                rowMoved = true;
            }
        }
        
        // 行が実際に変化したかチェック
        if (!rowMoved) {
            for (let i = 0; i < this.size; i++) {
                if (row[i] !== newRow[i]) {
                    rowMoved = true;
                    break;
                }
            }
        }
        
        return { newRow, rowMoved, moves, merges };
    }

    canMove(direction) {
        switch(direction) {
            case 'up':
                return this.canMoveUp();
            case 'down':
                return this.canMoveDown();
            case 'left':
                return this.canMoveLeft();
            case 'right':
                return this.canMoveRight();
            default:
                return false;
        }
    }

    canMoveUp() {
        for (let i = 1; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== 0) {
                    if (this.grid[i-1][j] === 0 || this.grid[i-1][j] === this.grid[i][j]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    canMoveDown() {
        for (let i = 0; i < this.size - 1; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== 0) {
                    if (this.grid[i+1][j] === 0 || this.grid[i+1][j] === this.grid[i][j]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    canMoveLeft() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 1; j < this.size; j++) {
                if (this.grid[i][j] !== 0) {
                    if (this.grid[i][j-1] === 0 || this.grid[i][j-1] === this.grid[i][j]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    canMoveRight() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size - 1; j++) {
                if (this.grid[i][j] !== 0) {
                    if (this.grid[i][j+1] === 0 || this.grid[i][j+1] === this.grid[i][j]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    gridsEqual(grid1, grid2) {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (grid1[i][j] !== grid2[i][j]) {
                    return false;
                }
            }
        }
        return true;
    }

    isGameOver() {
        // 空きセルがあるかチェック
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    return false;
                }
            }
        }
        
        // 移動可能な方向があるかチェック
        return !['up', 'down', 'left', 'right'].some(direction => this.canMove(direction));
    }

    updateBestScore() {
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem(GameConfig.STORAGE_KEYS.BEST_SCORE, this.bestScore.toString());
        }
    }

    restart() {
        this.score = 0;
        this.moveHistory = [];
        this.mergedPositions = [];
        this.init();
    }

    getGameState() {
        return {
            grid: JSON.parse(JSON.stringify(this.grid)),
            score: this.score,
            bestScore: this.bestScore,
            isGameOver: this.isGameOver()
        };
    }
}