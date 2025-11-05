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
 let playfield = Array(FIELD_HEIGHT).fill(null).map(() => Array(FIELD_WIDTH).fill(0));
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
         return; // pause中は以下の処理をしない
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
         default:
             break;
     }
 }
 
 /**
  * loadの後に呼ばれる。その後、描画を妨げないタイミングで繰り返し呼び出される。
  */
 function renderFrame() {
     // 画面をクリアしてから格子を描画する
     renderPlayfieldGrids();
 
     // ここに描画処理を追加していく
     renderDebugInfo();
     // renderFigure();
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
    if (isTetrominoLocked()) {
        tetromino = createTetromino();
    } else {
        moveTetromino(0, 1);
    }
}

// テトロミノが指定位置に移動可能かチェックする
function isValidPosition(tetromino, offsetX, offsetY) {
    for (let row = 0; row < tetromino.shape.length; row++) {
        for (let col = 0; col < tetromino.shape[row].length; col++) {
            if (tetromino.shape[row][col]) {
                const targetX = tetromino.x + col + offsetX;
                const targetY = tetromino.y + row + offsetY;

                // フィールド左右端
                if (targetX < 0 || targetX >= FIELD_WIDTH) {
                    return false;
                }
                // フィールド最下部
                if (targetY >= FIELD_HEIGHT) {
                    return false;
                }
            }
        }
    }
    return true;
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
             color: 'perple',
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
             color: 'Green',
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
 
     // ランダムに1つ選んで返す。ただしTetrisのルールではない。
     return minoes[Math.floor(Math.random() * minoes.length)];
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
 