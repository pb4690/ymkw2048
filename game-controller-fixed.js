class GameController {
    constructor(gameEngine, gameRenderer, gameAnimation) {
        this.engine = gameEngine;
        this.renderer = gameRenderer;
        this.animation = gameAnimation;
        this.isProcessing = false;
        
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        this.setupKeyboardControls();
        this.setupTouchControls();
        this.setupMouseControls();
    }

    setupKeyboardControls() {
        const keyMappings = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'KeyW': 'up',
            'KeyS': 'down',
            'KeyA': 'left',
            'KeyD': 'right',
            'w': 'up',
            's': 'down',
            'a': 'left',
            'd': 'right'
        };

        document.addEventListener('keydown', (e) => {
            const direction = keyMappings[e.key] || keyMappings[e.code];
            
            if (direction) {
                e.preventDefault();
                this.handleMove(direction);
            }
        });
    }

    setupTouchControls() {
        const gameContainer = document.querySelector('.game-container');
        let touchStartX = 0;
        let touchStartY = 0;
        const minSwipeDistance = 30;

        gameContainer.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }, { passive: false });

        gameContainer.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        gameContainer.addEventListener('touchend', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            const touchEndX = touch.clientX;
            const touchEndY = touch.clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const absDeltaX = Math.abs(deltaX);
            const absDeltaY = Math.abs(deltaY);
            
            if (Math.max(absDeltaX, absDeltaY) < minSwipeDistance) {
                return;
            }
            
            let direction;
            if (absDeltaX > absDeltaY) {
                direction = deltaX > 0 ? 'right' : 'left';
            } else {
                direction = deltaY > 0 ? 'down' : 'up';
            }
            
            this.handleMove(direction);
        }, { passive: false });

        gameContainer.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    setupMouseControls() {
        const gameContainer = document.querySelector('.game-container');
        let mouseStartX = 0;
        let mouseStartY = 0;
        let isDragging = false;
        const minDragDistance = 30;

        gameContainer.addEventListener('mousedown', (e) => {
            mouseStartX = e.clientX;
            mouseStartY = e.clientY;
            isDragging = true;
        });

        gameContainer.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
        });

        gameContainer.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            isDragging = false;
            
            const deltaX = e.clientX - mouseStartX;
            const deltaY = e.clientY - mouseStartY;
            const absDeltaX = Math.abs(deltaX);
            const absDeltaY = Math.abs(deltaY);
            
            if (Math.max(absDeltaX, absDeltaY) < minDragDistance) {
                return;
            }
            
            let direction;
            if (absDeltaX > absDeltaY) {
                direction = deltaX > 0 ? 'right' : 'left';
            } else {
                direction = deltaY > 0 ? 'down' : 'up';
            }
            
            this.handleMove(direction);
        });
    }

    handleMove(direction) {
        if (this.isProcessing) {
            return;
        }

        // 移動可能性をチェック
        if (!this.engine.canMove(direction)) {
            return; // 移動不可能な場合は何もしない
        }

        this.isProcessing = true;
        
        // エンジンでの移動処理
        const moveResult = this.engine.move(direction);
        
        // 実際に移動が発生した場合のみ処理
        if (moveResult.moved && moveResult.moveHistory.length > 0) {
            // 新しいタイル位置をレンダラーに設定
            if (moveResult.newTile) {
                this.renderer.setNewTilePosition(moveResult.newTile);
            }

            // 移動アニメーション実行
            this.renderer.animateMove(moveResult.moveHistory, () => {
                // アニメーション完了後の処理
                this.renderer.render(this.engine.getGameState());
                
                // マージエフェクト表示
                if (moveResult.mergedPositions.length > 0) {
                    setTimeout(() => {
                        this.animation.showMergeEffects(moveResult.mergedPositions);
                        
                        // 2048達成チェック
                        if (this.check2048Achievement(moveResult.mergedPositions)) {
                            setTimeout(() => {
                                this.animation.show2048Achievement();
                            }, 500);
                        }
                    }, 100);
                }
                
                // ゲームオーバーチェック
                if (this.engine.isGameOver()) {
                    setTimeout(() => {
                        this.renderer.showGameOverMessage();
                    }, 500);
                }
                
                this.isProcessing = false;
            });
        } else {
            // 移動が発生しなかった場合、即座に処理を終了
            this.renderer.render(this.engine.getGameState());
            this.isProcessing = false;
        }
    }

    check2048Achievement(mergedPositions) {
        return mergedPositions.some(pos => pos.value === 2048);
    }

    render() {
        this.renderer.render(this.engine.getGameState());
    }

    restart() {
        this.isProcessing = false;
        this.animation.clearAllAnimations();
        this.engine.restart();
        this.renderer.clear();
        this.render();
    }

    getScore() {
        return this.engine.score;
    }

    getBestScore() {
        return this.engine.bestScore;
    }

    getGameState() {
        return this.engine.getGameState();
    }

    // デバッグ用メソッド
    printGrid() {
        console.table(this.engine.grid);
    }

    // チート用メソッド（開発時のみ）
    addTile(row, col, value) {
        if (this.engine.grid[row][col] === 0) {
            this.engine.grid[row][col] = value;
            this.render();
        }
    }

    // ゲーム状態の保存
    saveGame() {
        const gameState = {
            grid: this.engine.grid,
            score: this.engine.score,
            bestScore: this.engine.bestScore
        };
        localStorage.setItem(GameConfig.STORAGE_KEYS.SAVED_GAME, JSON.stringify(gameState));
    }

    // ゲーム状態の読み込み
    loadGame() {
        const savedGame = localStorage.getItem(GameConfig.STORAGE_KEYS.SAVED_GAME);
        if (savedGame) {
            const gameState = JSON.parse(savedGame);
            this.engine.grid = gameState.grid;
            this.engine.score = gameState.score;
            this.engine.bestScore = gameState.bestScore;
            this.render();
            return true;
        }
        return false;
    }

    // 統計情報の取得
    getGameStatistics() {
        const grid = this.engine.grid;
        let maxTile = 0;
        let tileCount = 0;
        let emptyCount = 0;

        for (let i = 0; i < this.engine.size; i++) {
            for (let j = 0; j < this.engine.size; j++) {
                const value = grid[i][j];
                if (value === 0) {
                    emptyCount++;
                } else {
                    tileCount++;
                    maxTile = Math.max(maxTile, value);
                }
            }
        }

        return {
            score: this.engine.score,
            bestScore: this.engine.bestScore,
            maxTile,
            tileCount,
            emptyCount,
            completionPercentage: (maxTile >= 2048) ? 100 : (Math.log2(maxTile) / 11) * 100
        };
    }
}