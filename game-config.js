// ゲーム設定とデザイン定数
const GameConfig = {
    // ゲーム基本設定
    GRID_SIZE: 4,
    NEW_TILE_PROBABILITY_2: 0.9, // 2が出る確率（0.9 = 90%）
    NEW_TILE_PROBABILITY_4: 0.1, // 4が出る確率（0.1 = 10%）
    
    // アニメーション設定
    ANIMATION: {
        TILE_MOVE_DURATION: 150, // ミリ秒
        TILE_MERGE_DURATION: 500,
        TILE_APPEAR_DURATION: 400,
        SCORE_POPUP_DURATION: 1500,
        GLOW_EFFECT_DURATION: 500,
        STAR_EFFECT_DURATION: 1200,
        CELEBRATION_DURATION: 2000,
        
        // アニメーション遅延
        MERGE_EFFECT_DELAY: 100,
        GAME_OVER_DELAY: 500,
        ACHIEVEMENT_DELAY: 500,
        
        // 星エフェクト設定
        STAR_COUNT: 16,
        STAR_DELAY_PER_ITEM: 30,
        STAR_BASE_RADIUS: 50,
        STAR_RING_SPACING: 25,
        STAR_RANDOM_RANGE: 15,
    },
    
    // 入力設定
    INPUT: {
        MIN_SWIPE_DISTANCE: 30,
        MIN_DRAG_DISTANCE: 30,
        GAME_OVER_MESSAGE_DURATION: 3000,
    },
    
    // グリッドレイアウト設定
    LAYOUT: {
        GRID_GAP: 3, // パーセント
        CELL_COUNT_PER_ROW: 4,
        CELL_COUNT_PER_COL: 4,
    },
    
    // ローカルストレージキー
    STORAGE_KEYS: {
        BEST_SCORE: 'best2048',
        SAVED_GAME: 'game2048_save',
    },
    
    // 色設定
    COLORS: {
        PRIMARY: '#9b59b6',
        SECONDARY: '#8e44ad', 
        TEXT_SHADOW: 'rgba(255, 255, 255, 0.8)',
        TILE_BORDER: 'rgba(255, 255, 255, 0.6)',
        GRID_CELL_BORDER: 'rgba(221, 160, 221, 0.2)',
        
        // パステルカラーの星
        STAR_COLORS: [
            'linear-gradient(45deg, #ff69b4, #ff91a4)',
            'linear-gradient(45deg, #dda0dd, #e6b3e6)',
            'linear-gradient(45deg, #87ceeb, #a4d4f0)',
            'linear-gradient(45deg, #ffd700, #ffe066)',
            'linear-gradient(45deg, #ff8c94, #ffa8a8)',
            'linear-gradient(45deg, #c7ceea, #d9dcf2)',
            'linear-gradient(45deg, #ffd3a5, #fddd9b)',
            'linear-gradient(45deg, #a8e6cf, #b8f0d6)'
        ],
    },
    
    // タイル値別設定
    TILES: {
        // 達成目標
        WIN_TILE_VALUE: 2048,
        
        // フォントサイズ調整
        FONT_SIZE_ADJUSTMENTS: {
            128: 'clamp(18px, 3.5vw, 30px)',
            256: 'clamp(18px, 3.5vw, 30px)',
            512: 'clamp(18px, 3.5vw, 30px)',
            1024: 'clamp(16px, 3vw, 25px)',
            2048: 'clamp(16px, 3vw, 25px)',
            4096: 'clamp(14px, 2.5vw, 22px)',
            8192: 'clamp(14px, 2.5vw, 22px)',
        },
    },
    
    // ゲームメッセージ
    MESSAGES: {
        GAME_OVER: 'ゲームオーバー！',
        ACHIEVEMENT_2048: '🎉 2048達成！',
        NEW_GAME: '新しいゲーム',
        RESTART: '再開',
        SCORE_LABEL: 'スコア',
        BEST_LABEL: 'ベスト',
        
        INSTRUCTIONS: {
            TITLE: '🎮 操作方法',
            CONTROLS: '矢印キー・WASDキー・スワイプ でタイルを移動',
            OBJECTIVE: '同じ数字のタイルを合体させて高得点を目指そう！'
        }
    },
    
    // キーマッピング
    KEY_MAPPINGS: {
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
    },
    
    // CSS クラス名
    CSS_CLASSES: {
        TILE: 'tile',
        TILE_NEW: 'tile-new',
        TILE_MERGED: 'tile-merged',
        TILE_SLIDING: 'tile-sliding',
        GRID_CELL: 'grid-cell',
        SCORE_POPUP: 'score-popup',
        MERGE_STAR: 'merge-star',
        MERGE_GLOW: 'merge-glow',
        RIPPLE_EFFECT: 'ripple-effect',
    },
    
    // デバッグ設定
    DEBUG: {
        ENABLED: false, // 本番環境では false にする
        LOG_MOVES: false,
        LOG_ANIMATIONS: false,
        SHOW_GRID_COORDINATES: false,
    },
    
    // パフォーマンス設定
    PERFORMANCE: {
        MAX_CONCURRENT_ANIMATIONS: 20,
        THROTTLE_INPUT_MS: 50,
        CLEANUP_INTERVAL_MS: 5000,
    }
};

// 設定の計算値を生成する関数
GameConfig.calculateDerivedValues = function() {
    // セルサイズ計算
    const gridGap = this.LAYOUT.GRID_GAP;
    const cellCount = this.LAYOUT.CELL_COUNT_PER_ROW;
    this.DERIVED = {
        CELL_SIZE_PERCENT: (100 - (gridGap * (cellCount - 1))) / cellCount,
        TOTAL_CELLS: cellCount * cellCount,
    };
    
    return this.DERIVED;
};

// 初期化時に計算値を設定
GameConfig.calculateDerivedValues();

// 設定のバリデーション
GameConfig.validate = function() {
    const errors = [];
    
    if (this.GRID_SIZE <= 0) {
        errors.push('GRID_SIZE must be positive');
    }
    
    if (this.NEW_TILE_PROBABILITY_2 + this.NEW_TILE_PROBABILITY_4 !== 1.0) {
        errors.push('Tile probabilities must sum to 1.0');
    }
    
    if (this.ANIMATION.TILE_MOVE_DURATION <= 0) {
        errors.push('Animation duration must be positive');
    }
    
    if (errors.length > 0) {
        console.warn('GameConfig validation errors:', errors);
        return false;
    }
    
    return true;
};

// 設定の検証を実行
if (!GameConfig.validate()) {
    console.error('GameConfig validation failed');
}

// フリーズして不正な変更を防ぐ
Object.freeze(GameConfig.COLORS);
Object.freeze(GameConfig.ANIMATION);
Object.freeze(GameConfig.INPUT);
Object.freeze(GameConfig.LAYOUT);
Object.freeze(GameConfig.STORAGE_KEYS);
Object.freeze(GameConfig.MESSAGES);
Object.freeze(GameConfig.KEY_MAPPINGS);
Object.freeze(GameConfig.CSS_CLASSES);
Object.freeze(GameConfig.DEBUG);
Object.freeze(GameConfig.PERFORMANCE);
Object.freeze(GameConfig);