class GameAnimation {
    constructor(gameGridElement) {
        this.gameGridElement = gameGridElement;
        this.size = 4;
        
        // パステルカラーの星の色定義
        this.starColors = [
            'linear-gradient(45deg, #ff69b4, #ff91a4)',
            'linear-gradient(45deg, #dda0dd, #e6b3e6)',
            'linear-gradient(45deg, #87ceeb, #a4d4f0)',
            'linear-gradient(45deg, #ffd700, #ffe066)',
            'linear-gradient(45deg, #ff8c94, #ffa8a8)',
            'linear-gradient(45deg, #c7ceea, #d9dcf2)',
            'linear-gradient(45deg, #ffd3a5, #fddd9b)',
            'linear-gradient(45deg, #a8e6cf, #b8f0d6)'
        ];
    }

    calculateTilePosition(row, col) {
        const cellSize = (100 - (3 * 3)) / 4;
        return {
            left: col * (cellSize + 3),
            top: row * (cellSize + 3)
        };
    }

    showMergeEffects(mergedPositions) {
        mergedPositions.forEach(pos => {
            this.addMergeAnimation(pos.row, pos.col, pos.value);
            this.showScorePopup(pos.row, pos.col, pos.value);
            this.showSparkles(pos.row, pos.col);
            this.showGlowEffect(pos.row, pos.col);
        });
    }

    addMergeAnimation(row, col, value) {
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

    showScorePopup(row, col, score) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${score}`;
        
        const position = this.calculateTilePosition(row, col);
        const cellSize = (100 - (3 * 3)) / 4;
        
        popup.style.left = `${position.left + cellSize / 2}%`;
        popup.style.top = `${position.top + cellSize / 2}%`;
        
        this.gameGridElement.appendChild(popup);
        
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 1500);
    }

    showSparkles(row, col) {
        const starCount = 16;
        
        for (let i = 0; i < starCount; i++) {
            setTimeout(() => {
                this.createStar(row, col, i);
            }, i * 30);
        }
    }

    createStar(row, col, index) {
        const star = document.createElement('div');
        star.className = 'merge-star';
        
        const position = this.calculateTilePosition(row, col);
        const cellSize = (100 - (3 * 3)) / 4;
        const centerLeft = position.left + cellSize / 2;
        const centerTop = position.top + cellSize / 2;
        
        // 同心円状に配置
        const ring = Math.floor(index / 4);
        const angleInRing = (index % 4) * 90 + Math.random() * 30 - 15;
        const angle = angleInRing * Math.PI / 180;
        
        const baseRadius = 50 + ring * 25;
        const randomRadius = baseRadius + Math.random() * 15 - 7;
        const randomX = Math.cos(angle) * randomRadius;
        const randomY = Math.sin(angle) * randomRadius;
        
        // ランダムな星の色
        const colorIndex = Math.floor(Math.random() * this.starColors.length);
        star.style.setProperty('--star-color', this.starColors[colorIndex]);
        star.style.setProperty('--scale', 0.8 + Math.random() * 0.4);
        
        star.style.left = `calc(${centerLeft}% - 10px)`;
        star.style.top = `calc(${centerTop}% - 10px)`;
        star.style.setProperty('--random-x', `${randomX}px`);
        star.style.setProperty('--random-y', `${randomY}px`);
        star.style.animationDelay = `${index * 30}ms`;
        
        this.gameGridElement.appendChild(star);
        
        setTimeout(() => {
            if (star.parentNode) {
                star.parentNode.removeChild(star);
            }
        }, 1200 + index * 30);
    }

    showGlowEffect(row, col) {
        const glow = document.createElement('div');
        glow.className = 'merge-glow';
        
        const position = this.calculateTilePosition(row, col);
        const cellSize = (100 - (3 * 3)) / 4;
        
        glow.style.left = `${position.left}%`;
        glow.style.top = `${position.top}%`;
        glow.style.width = `${cellSize}%`;
        glow.style.height = `${cellSize}%`;
        
        this.gameGridElement.appendChild(glow);
        
        setTimeout(() => {
            if (glow.parentNode) {
                glow.parentNode.removeChild(glow);
            }
        }, 500);
    }

    animateNewTile(row, col) {
        const tiles = this.gameGridElement.querySelectorAll('.tile');
        const targetPosition = this.calculateTilePosition(row, col);
        
        tiles.forEach(tile => {
            const tileLeft = parseFloat(tile.style.left);
            const tileTop = parseFloat(tile.style.top);
            
            if (Math.abs(tileLeft - targetPosition.left) < 1 && 
                Math.abs(tileTop - targetPosition.top) < 1) {
                
                tile.classList.add('tile-new');
                
                setTimeout(() => {
                    tile.classList.remove('tile-new');
                }, 400);
            }
        });
    }

    createFloatingText(text, row, col, duration = 2000, color = '#9b59b6') {
        const floatingText = document.createElement('div');
        floatingText.textContent = text;
        floatingText.style.cssText = `
            position: absolute;
            font-weight: bold;
            font-size: 20px;
            color: ${color};
            pointer-events: none;
            z-index: 1000;
            animation: float-up ${duration}ms ease-out forwards;
        `;
        
        const position = this.calculateTilePosition(row, col);
        const cellSize = (100 - (3 * 3)) / 4;
        
        floatingText.style.left = `${position.left + cellSize / 2}%`;
        floatingText.style.top = `${position.top + cellSize / 2}%`;
        
        this.gameGridElement.appendChild(floatingText);
        
        setTimeout(() => {
            if (floatingText.parentNode) {
                floatingText.parentNode.removeChild(floatingText);
            }
        }, duration);
    }

    createRippleEffect(row, col, size = 100) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        
        const position = this.calculateTilePosition(row, col);
        const cellSize = (100 - (3 * 3)) / 4;
        
        ripple.style.cssText = `
            position: absolute;
            left: ${position.left + cellSize / 2}%;
            top: ${position.top + cellSize / 2}%;
            width: ${size}px;
            height: ${size}px;
            margin: -${size/2}px 0 0 -${size/2}px;
            background: radial-gradient(circle, rgba(155, 89, 182, 0.3) 0%, transparent 70%);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out forwards;
            pointer-events: none;
            z-index: 5;
        `;
        
        this.gameGridElement.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    clearAllAnimations() {
        // 全てのアニメーション要素を削除
        const animationElements = this.gameGridElement.querySelectorAll(
            '.score-popup, .merge-star, .merge-glow, .ripple-effect'
        );
        
        animationElements.forEach(element => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        
        // アニメーションクラスを削除
        const animatedTiles = this.gameGridElement.querySelectorAll('.tile-merged, .tile-new');
        animatedTiles.forEach(tile => {
            tile.classList.remove('tile-merged', 'tile-new');
        });
    }

    // 2048達成時の特別エフェクト
    show2048Achievement() {
        this.createFloatingText('🎉 2048達成！', 1.5, 1.5, 3000, '#ffd700');
        
        // 全体に光るエフェクト
        const celebration = document.createElement('div');
        celebration.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, 
                transparent 0%, 
                rgba(255, 215, 0, 0.1) 25%, 
                rgba(255, 215, 0, 0.2) 50%, 
                rgba(255, 215, 0, 0.1) 75%, 
                transparent 100%);
            animation: celebration-glow 2s ease-in-out;
            pointer-events: none;
            z-index: 100;
        `;
        
        this.gameGridElement.appendChild(celebration);
        
        // 複数の星エフェクト
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                setTimeout(() => {
                    this.showSparkles(i, j);
                }, (i + j) * 100);
            }
        }
        
        setTimeout(() => {
            if (celebration.parentNode) {
                celebration.parentNode.removeChild(celebration);
            }
        }, 2000);
    }
}