// for playfield grid
 const CELL_SIZE = 32;
 const FIELD_WIDTH = 10;
 const FIELD_HEIGHT = 20;
 
 // for loop
 const gameLoopState = {
     intervalMs: 500,
     id: null,
     running: false,
 };
 
 // for debug
 const debugInfo = {
     x: 4,
     y: 0,
     key: 'none',
 };
 
 // for graphics
 const playfieldCanvas = document.getElementById('playfield');
 const playfieldContext = playfieldCanvas.getContext('2d');
 
 // テトロミノ
 let tetromino = createTetromino();
 
  // フィールドの状態を保持する配列
 let playfield = Array(FIELD_HEIGHT).fill(null).map(() => Array(FIELD_WIDTH).fill(null));
 // ゲームオーバー状態を管理するフラグ
let isGameOver = false;
 ///////////////////////////////////////////////////////////////////////////////
 // main
 ///////////////////////////////////////////////////////////////////////////////
 
 // windowがloadされたらrenderFrame()を呼ぶ
 window.addEventListener("load", renderFrame);
 
 
 // キーが押されたら送出されるkeydownイベントを監視する。
 // event.keyには押されたキーの名前が入っている。
 document.addEventListener("keydown", handleKeyDown);
 
 ///////////////////////////////////////////////////////////////////////////////
 // other functions
 ///////////////////////////////////////////////////////////////////////////////
 
 function handleKeyDown(event) {
     debugInfo.key = event.key;
 
     if (handleSystemKey(event.key)) {
         return;
     }
 
     if (!gameLoopState.running) {
         return;
     }
 
     handleMovementKey(event.key);
 }
 
 function handleSystemKey(key) {
     if (key === 'Enter') {
         if (!gameLoopState.running) {
             startGameLoop();
         } else {
             pauseGameLoop();
         }
         return true;
     }
 
     if (key === 'r' || key === 'R') {
         pauseGameLoop();
         resetGameState();
         return true;
     }
 
     return false;
 }
 
 function handleMovementKey(key) {
     switch (key) {
         case 'ArrowRight':
             moveTetromino(1, 0);
             break;
         case 'ArrowLeft':
             moveTetromino(-1, 0);
             break;
         case 'ArrowDown':
             moveTetromino(0, 1);
             break;
        case ' ':
            hardDropTetromino();
             break;
         case 'N':
         case 'n':
             rotateTetromino(-1);
             break;
         case 'M':
         case 'm':
             rotateTetromino(1); // 右回転
             break;
         default:
             break;
     }
 }

// テトロミノを回転させる
function rotateTetromino(direction) {
    const originalShape = tetromino.shape;
    const rotatedShape = rotateMatrix(tetromino.shape, direction);

    tetromino.shape = rotatedShape;
    if (!isValidPosition(tetromino, 0, 0)) {
        tetromino.shape = originalShape;
    }
}

// 行列を回転させる
function rotateMatrix(matrix, direction) {
    const size = matrix.length;
    const rotated = Array.from({ length: size }, () => Array(size).fill(0));

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (direction === 1) {
                // 右回転（時計回り）
                rotated[col][size - 1 - row] = matrix[row][col];
            } else if (direction === -1) {
                // 左回転（反時計回り）
                rotated[size - 1 - col][row] = matrix[row][col];
            }
        }
    }
    return rotated;
}

// ハードドロップ
function hardDropTetromino() {
    while (isValidPosition(tetromino, 0, 1)) {
        tetromino.y += 1;
    }
    lockTetromino(); 
    tetromino = createTetromino();
}
 
 /**
  * loadの後に呼ばれる。その後、描画を妨げないタイミングで繰り返し呼び出される。
  */
 function renderFrame() {
    if (isGameOver) {
        return; // ゲームオーバー時は描画を停止
    }

     // 画面をクリアしてから格子を描画する
     renderPlayfieldGrids();
 
     // ここに描画処理を追加していく
     renderDebugInfo();

     renderLockedBlocks();  
     renderTetromino(tetromino);
 
     // 再描画のタイミングでrenderFrame()が呼ばれるようにする。
     requestAnimationFrame(renderFrame);
 }
 
 // 画面左上にデバッグ情報を表示する
 function renderDebugInfo() {
     playfieldContext.font = '16px arial';
     playfieldContext.fillStyle = 'blue';
 
     const text = `(${tetromino.x}, ${tetromino.y}), ${gameLoopState.running}, ${debugInfo.key}`;
     playfieldContext.fillText(text, CELL_SIZE / 4, CELL_SIZE / 2);
 }
 
 // ゲームループを開始する
 function startGameLoop() {
     gameLoopState.id = setInterval(updateGameState, gameLoopState.intervalMs); // call updateGameState() every 500 ms
     gameLoopState.running = true;
 }
 
 // ゲームループを一時停止する
 function pauseGameLoop() {
     clearInterval(gameLoopState.id);  // suspend
     gameLoopState.id = null;
     gameLoopState.running = false;
 }
 
 // ゲームの状態を更新する
 function updateGameState() {
    if (isGameOver) {
        return; // ゲームオーバー中は更新しない
    }

    if (!isValidPosition(tetromino, 0, 1)) {
        lockTetromino();
        if (isGameOverCondition()) {
            triggerGameOver();
        } else {
            tetromino = createTetromino();
        }
    } else {
        moveTetromino(0, 1);
    }
}

// ゲームオーバー条件を判定する
function isGameOverCondition() {
    let gameOver = false;
    forEachTetrominoCell(tetromino, 0, 0, (x, y) => {
        if (y <= 0) { // y <= 0 の場合にゲームオーバーと判定
            gameOver = true;
        }
    });
    return gameOver;
}

// テトロミノの各セルに対して処理を実行する共通関数
function forEachTetrominoCell(tetromino, offsetX, offsetY, callback) {
    for (let row = 0; row < tetromino.shape.length; row++) {
        for (let col = 0; col < tetromino.shape[row].length; col++) {
            if (tetromino.shape[row][col]) {
                const x = tetromino.x + col + offsetX;
                const y = tetromino.y + row + offsetY;
                callback(x, y);
            }
        }
    }
}

// テトロミノをフィールドに固定する
function lockTetromino() {
    let gameOver = false; // ゲームオーバー判定用フラグ

    forEachTetrominoCell(tetromino, 0, 0, (x, y) => {
        if (y >= 0) {
            playfield[y][x] = tetromino.color;
        }
        if (y < 0) {
            gameOver = true; // y < 0 のセルがあればゲームオーバー
        }
    });

    if (gameOver) {
        triggerGameOver();
    }
}

// ゲームオーバー時の処理
function triggerGameOver() {
    isGameOver = true;
    pauseGameLoop(); // ゲームループを停止
    renderGameOverText(); // ゲームオーバーの表示
}

// ゲームオーバーのテキストを描画する
function renderGameOverText() {
    playfieldContext.clearRect(0, 0, playfieldCanvas.width, playfieldCanvas.height); // 画面をクリア
    playfieldContext.font = '64px Arial'; // フォントサイズを大きく設定
    playfieldContext.fillStyle = 'red';
    playfieldContext.textAlign = 'center';
    playfieldContext.textBaseline = 'middle'; // テキストの基準線を中央に設定
    playfieldContext.fillText('Game Over', playfieldCanvas.width / 2, playfieldCanvas.height / 2);
}

// 有効な位置かどうかを判定する
function isValidPosition(tetromino, offsetX, offsetY) {
    let isValid = true;

    forEachTetrominoCell(tetromino, offsetX, offsetY, (x, y) => {
        if (x < 0 || x >= FIELD_WIDTH) {
            isValid = false;
            return;
        }
        if (y >= FIELD_HEIGHT) {
            isValid = false;
            return;
        }
        if (y < 0) {
            return; // y < 0 の場合はスキップ
        }
        if (playfield[y][x] !== null) {
            isValid = false;
        }        
    });

    return isValid;
}

function isTetrominoLocked() {
    return !isValidPosition(tetromino, 0, 1);
}

// tetorominoを移動する
function moveTetromino(deltaX, deltaY) {
    if (isValidPosition(tetromino, deltaX, deltaY)) {
        tetromino.x += deltaX;
        tetromino.y += deltaY;
    }
}

// ゲームを最初の状態に戻す
 function resetGameState() {
     tetromino = createTetromino();
     playfield = Array(FIELD_HEIGHT).fill(null).map(() => Array(FIELD_WIDTH).fill(null));
     isGameOver = false; 
     debugInfo.key = 'reset';
 }
 
 // 図形を描く
 function renderFigure() {
     playfieldContext.fillStyle = "red";
     playfieldContext.fillRect(debugInfo.x * CELL_SIZE, debugInfo.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
 }
 
 // プレイフィールドのグリッドを描く
 function renderPlayfieldGrids() {
     playfieldContext.clearRect(0, 0, playfieldCanvas.width, playfieldCanvas.height);
 
     // canvasにCELL_SIZEの正方形をFIELD_WIDTH x FIELD_HEIGHT個描く
     for (let y = 0; y < FIELD_HEIGHT; y++) {
         for (let x = 0; x < FIELD_WIDTH; x++) {
             playfieldContext.strokeStyle = 'white';
             playfieldContext.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
         }
     }
 }
 
 function renderLockedBlocks() {
     playfieldContext.strokeStyle = 'black';
     for (let y = 0; y < FIELD_HEIGHT; y++) {
         for (let x = 0; x < FIELD_WIDTH; x++) {
             if (playfield[y][x] !== null) {
                 playfieldContext.fillStyle = playfield[y][x];  
                 playfieldContext.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                 playfieldContext.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
             }
         }
     }
 }
 
 // テトロミノをランダムに生成する
 function createTetromino() {
     const minoes = [
         {
             shape: [
                 [0, 0, 0, 0],
                 [1, 1, 1, 1],
                 [0, 0, 0, 0],
                 [0, 0, 0, 0]
             ],
             color: 'cyan',
             name: 'I',
             x: 3,
             y: -1
         },
         {
             shape: [
                 [1, 0, 0],
                 [1, 1, 1],
                 [0, 0, 0]
             ],
             color: 'blue',
             name: 'J',
             x: 4,
             y: 0
         },
         {
             shape: [
                 [0, 0, 1],
                 [1, 1, 1],
                 [0, 0, 0]
             ],
             color: 'orange',
             name: 'L',
             x: 4,
             y: 0
         },
         {
             shape: [
                 [0, 1, 0],
                 [1, 1, 1],
                 [0, 0, 0]
             ],
             color: 'purple',
             name: 'T',
             x: 4,
             y: 0
         },
         {
             shape: [
                 [0, 1, 0],
                 [0, 1, 1],
                 [0, 0, 1]
             ],
             color: 'green',
             name: 'S',
             x: 4,
             y: 0
         },   
         {
             shape: [
                 [0, 1, 0],
                 [1, 1, 0],
                 [1, 0, 0]
             ],
             color: 'red',
             name: 'Z',
             x: 4,
             y: 0
         },
         {
             shape: [
                 [0, 1, 1],
                 [0, 1, 1],
                 [0, 0, 0]
             ],
             color: 'yellow',
             name: 'O',
             x: 4,
             y: 0
         }           
     ];
 
     const selected = minoes[Math.floor(Math.random() * minoes.length)];
     return {
         shape: selected.shape.map(row => [...row]),
         color: selected.color,
         name: selected.name,
         x: selected.x,
         y: selected.y
     };
 }
 
 // テトロミノを描画する
 function renderTetromino(tetromino) {
     playfieldContext.fillStyle = tetromino.color;
     playfieldContext.strokeStyle = 'black';
     for (let row = 0; row < tetromino.shape.length; row++) {
         for (let col = 0; col < tetromino.shape[row].length; col++) {
             if (tetromino.shape[row][col]) {
                 drawTetrominoCell(tetromino, col, row);
             }
         }
     }
 }
 
 // テトロミノのセルを描画する
 function drawTetrominoCell(tetromino, col, row) {
     const x = (tetromino.x + col) * CELL_SIZE;
     const y = (tetromino.y + row) * CELL_SIZE;
     playfieldContext.fillRect(x, y, CELL_SIZE, CELL_SIZE);
     playfieldContext.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
 }
