class GameRenderer {
    constructor(gameGridId = 'game-grid', scoreId = 'score', bestId = 'best') {
        this.gameGridElement = document.getElementById(gameGridId);
        this.scoreElement = document.getElementById(scoreId);
        this.bestElement = document.getElementById(bestId);
        this.size = GameConfig.GRID_SIZE;
        this.newTilePosition = null;
        
        if (!this.gameGridElement) {
            throw new Error(`Game grid element with id '${gameGridId}' not found`);
        }
        
        this.initializeGrid();
    }

    initializeGrid() {
        this.gameGridElement.innerHTML = '';
        
        // 背景グリッドセルを作成
        for (let i = 0; i < this.size * this.size; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';  // 元のCSS記法を使用
            cell.id = `cell-${i}`;
            this.gameGridElement.appendChild(cell);
        }
    }

    render(gameState) {
        this.updateGrid(gameState.grid);
        this.updateScore(gameState.score, gameState.bestScore);
    }

    updateGrid(grid) {
        // 既存のタイルを削除（アニメーション中のものは除く）
        const existingTiles = this.gameGridElement.querySelectorAll('.tile:not(.tile-sliding)');
        existingTiles.forEach(tile => tile.remove());

        // 新しいタイルを作成
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (grid[i][j] !== 0) {
                    this.createTile(i, j, grid[i][j]);
                }
            }
        }
    }

    createTile(row, col, value) {
        const tile = document.createElement('div');
        // 元のCSS記法を使用してタイルの色を正常に表示
        tile.className = `tile tile-${value}`;
        tile.textContent = value;
        
        // 位置を計算
        const position = this.calculateTilePosition(row, col);
        tile.style.left = `${position.left}%`;
        tile.style.top = `${position.top}%`;
        
        // 新しいタイルアニメーションの適用
        if (this.newTilePosition && 
            this.newTilePosition.row === row && 
            this.newTilePosition.col === col) {
            tile.classList.add('tile-new');
            this.newTilePosition = null;
        }
        
        this.gameGridElement.appendChild(tile);
        return tile;
    }

    calculateTilePosition(row, col) {
        const cellSize = (100 - (3 * 3)) / 4; // 元の計算式を使用
        return {
            left: col * (cellSize + 3),
            top: row * (cellSize + 3)
        };
    }

    updateScore(score, bestScore) {
        if (this.scoreElement) {
            this.scoreElement.textContent = score;
        }
        if (this.bestElement) {
            this.bestElement.textContent = bestScore;
        }
    }

    setNewTilePosition(position) {
        this.newTilePosition = position;
    }

    animateMove(moveHistory, onComplete) {
        // moveHistoryが空または無効な場合は即座に完了
        if (!moveHistory || moveHistory.length === 0) {
            if (onComplete) onComplete();
            return;
        }

        // 実際に移動したタイルのみを対象とする
        const validMoves = moveHistory.filter(move => {
            return move.fromRow !== move.toRow || move.fromCol !== move.toCol;
        });

        if (validMoves.length === 0) {
            if (onComplete) onComplete();
            return;
        }

        // 移動したタイルの元位置を記録
        const movedFromPositions = new Set();
        validMoves.forEach(moveInfo => {
            movedFromPositions.add(`${moveInfo.fromRow}-${moveInfo.fromCol}`);
        });

        // 移動したタイルのみを削除
        const existingTiles = this.gameGridElement.querySelectorAll('.tile');
        existingTiles.forEach(tile => {
            const position = this.getTileGridPosition(tile);
            const posKey = `${position.row}-${position.col}`;
            
            if (movedFromPositions.has(posKey)) {
                tile.remove();
            }
        });

        // アニメーション用タイルを作成
        validMoves.forEach(moveInfo => {
            this.createAnimatedTile(moveInfo);
        });

        // アニメーション完了後の処理
        setTimeout(() => {
            // アニメーション用タイルを削除
            const animatedTiles = this.gameGridElement.querySelectorAll('.tile-sliding');
            animatedTiles.forEach(tile => tile.remove());
            
            if (onComplete) onComplete();
        }, 200);
    }

    createAnimatedTile(moveInfo) {
        const tile = document.createElement('div');
        tile.className = `tile tile-${moveInfo.value} tile-sliding`;
        tile.textContent = moveInfo.value;

        // 初期位置設定
        const fromPos = this.calculateTilePosition(moveInfo.fromRow, moveInfo.fromCol);
        const toPos = this.calculateTilePosition(moveInfo.toRow, moveInfo.toCol);
        
        tile.style.left = `${fromPos.left}%`;
        tile.style.top = `${fromPos.top}%`;

        this.gameGridElement.appendChild(tile);

        // 距離に応じたアニメーション時間計算
        const distance = Math.sqrt(
            Math.pow(toPos.left - fromPos.left, 2) + 
            Math.pow(toPos.top - fromPos.top, 2)
        );
        const animationDuration = Math.max(150, distance * 1.5);
        
        tile.style.transition = `all ${animationDuration}ms cubic-bezier(0.23, 1, 0.32, 1)`;

        // アニメーション開始
        setTimeout(() => {
            tile.style.left = `${toPos.left}%`;
            tile.style.top = `${toPos.top}%`;
        }, 20);
    }

    getTileGridPosition(tile) {
        const tileLeft = parseFloat(tile.style.left);
        const tileTop = parseFloat(tile.style.top);
        const cellSize = (100 - (3 * 3)) / 4;
        
        return {
            col: Math.round(tileLeft / (cellSize + 3)),
            row: Math.round(tileTop / (cellSize + 3))
        };
    }

    addMergeEffectToTile(row, col, value) {
        const tiles = this.gameGridElement.querySelectorAll('.tile');
        const targetPosition = this.calculateTilePosition(row, col);
        
        tiles.forEach(tile => {
            const tileLeft = parseFloat(tile.style.left);
            const tileTop = parseFloat(tile.style.top);
            
            if (Math.abs(tileLeft - targetPosition.left) < 1 && 
                Math.abs(tileTop - targetPosition.top) < 1 && 
                parseInt(tile.textContent) === value) {
                
                tile.classList.add('tile-merged');
                
                setTimeout(() => {
                    tile.classList.remove('tile-merged');
                }, 500);
            }
        });
    }

    showGameOverMessage() {
        // ゲームオーバーメッセージの表示
        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-message">
                <h2>ゲームオーバー！</h2>
                <button onclick="game.restart()">再開</button>
            </div>
        `;
        
        // スタイリング
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            backdrop-filter: blur(5px);
        `;
        
        this.gameGridElement.parentElement.style.position = 'relative';
        this.gameGridElement.parentElement.appendChild(overlay);
        
        // 自動削除
        setTimeout(() => {
            if (overlay.parentElement) {
                overlay.parentElement.removeChild(overlay);
            }
        }, 3000);
    }

    clear() {
        this.gameGridElement.innerHTML = '';
        this.initializeGrid();
        this.newTilePosition = null;
    }
}