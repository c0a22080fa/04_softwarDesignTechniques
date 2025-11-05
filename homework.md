第4回課題
先ほども使った以下のテンプレート app.js は以下の点で不十分である。
　テトロミノの種類が3種類（I、J、L）しかない
　テトロミノがフィールドの左右の端を超えて移動してしまう
　テトロミノがフィールドの最下部を超えて移動してしまう（床まで達したミノをフィールドに固定できない）
　テトロミノを一気に落下させるハードドロップができない
　テトロミノがフィールド最上部を超えてもゲームオーバーにならない
　テトロミノが回転しない
　フィールドの横方向にテトロミノが隙間なく固定されていた場合にその行が消えない

これらを解決するため以下の機能を作成しなさい。[! 要するに、テトリスを一通り完成させなさい。]
　7種類のテトロミノが出現する
　テトロミノをフィールド最下部から積み上げられる
　テトロミノがフィールドの左右の端を超えて移動しない
　テトロミノをハードドロップできる
　ゲームオーバーの判定と、そこからゲームを最初からスタートできる
　テトロミノが回転する
　フィールドの行がすべてテトロミノで埋まった場合、その行が消える

ただし、以下のルールに従うこと。
　コードの基本構造は変更しない（全体のリファクタリングは不要）
　	既存のグローバル変数は変更しない
　	新しい変数や関数は作成しても良い
　	既存の関数は必要に応じて動作を変更しても良い
　今回の内容にあるモジュールやテストは必要ない
　[# コーディングAIを用いても良い。その場合、各機能の作成に際して入力したプロンプトを記録し、教員が照合できるようにしておくこと。]
　どの順番で機能を追加したかがわかるようにする。ソース中に変更順をコメントで入れる、Gitのコミットログを残して別ファイルとして添付する、のように皆さんの考えや取り組みが追跡できるようにしておくこと。　
　期日：11/6の授業開始時点
　提出：Moodle、js+html+css+その他(プロンプトや着手順など)をzipにまとめたもの


```javascript
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
    moveTetromino(0, 1);
}

function moveTetromino(deltaX, deltaY) {
    tetromino.x += deltaX;
    tetromino.y += deltaY;
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
```
