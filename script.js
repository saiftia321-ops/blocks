// ======================================
// SCENE
// ======================================

const scene = new THREE.Scene();


// ======================================
// CAMERA
// ======================================

const camera = new THREE.OrthographicCamera(
    -20,
    20,
    20,
    -20,
    0.1,
    1000
);

camera.position.set(
    20,
    20,
    20
);

camera.lookAt(
    0,
    5,
    0
);


// ======================================
// RENDERER
// ======================================

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.setClearColor(
    0xd0cbc7
);

document
    .getElementById("game")
    .appendChild(renderer.domElement);


// ======================================
// LIGHTING
// ======================================

const directionalLight =
    new THREE.DirectionalLight(
        0xffffff,
        1
    );

directionalLight.position.set(
    10,
    20,
    10
);

scene.add(directionalLight);


const ambientLight =
    new THREE.AmbientLight(
        0xffffff,
        0.5
    );

scene.add(ambientLight);


// ======================================
// GAME VARIABLES
// ======================================

let blocks = [];

let currentBlock = null;

let score = 0;

let gameRunning = false;

let speed = 0.12;

let direction = 1;

let axis = "x";

const blockSize = 8;

const blockHeight = 2;


// ======================================
// CREATE BLOCK
// ======================================

function createBlock(
    x,
    y,
    z,
    width,
    depth,
    color
) {

    const geometry =
        new THREE.BoxGeometry(
            width,
            blockHeight,
            depth
        );


    const material =
        new THREE.MeshToonMaterial({
            color: color
        });


    const block =
        new THREE.Mesh(
            geometry,
            material
        );


    block.position.set(
        x,
        y,
        z
    );


    scene.add(block);


    return block;
}


// ======================================
// DELETE BLOCK
// ======================================

function deleteBlock(block) {

    if (!block) {
        return;
    }


    scene.remove(block);


    if (block.geometry) {

        block.geometry.dispose();
    }


    if (block.material) {

        block.material.dispose();
    }
}


// ======================================
// CLEAR ENTIRE GAME
// ======================================

function clearGame() {

    // Delete every old block

    for (let i = 0; i < blocks.length; i++) {

        deleteBlock(
            blocks[i]
        );
    }


    // Delete moving block

    if (currentBlock) {

        deleteBlock(
            currentBlock
        );
    }


    // Empty array

    blocks = [];


    // Remove reference

    currentBlock = null;
}


// ======================================
// START / RESTART GAME
// ======================================

function startGame() {

    // IMPORTANT:
    // Delete everything from previous game

    clearGame();


    // Reset variables

    score = 0;

    speed = 0.12;

    direction = 1;

    axis = "x";

    gameRunning = true;


    // Reset score

    document
        .getElementById("score")
        .textContent = "0";


    // Hide screens

    document
        .getElementById("startScreen")
        .style.display = "none";


    document
        .getElementById("gameOver")
        .style.display = "none";


    // Reset camera

    camera.position.set(
        20,
        20,
        20
    );

    camera.lookAt(
        0,
        5,
        0
    );


    // Create first block

    const firstBlock =
        createBlock(
            0,
            0,
            0,
            blockSize,
            blockSize,
            0x333344
        );


    blocks.push(
        firstBlock
    );


    // Create moving block

    createMovingBlock();
}


// ======================================
// CREATE MOVING BLOCK
// ======================================

function createMovingBlock() {

    const previous =
        blocks[
            blocks.length - 1
        ];


    const color =
        new THREE.Color();


    color.setHSL(
        Math.random(),
        0.55,
        0.65
    );


    let x =
        previous.position.x;

    let z =
        previous.position.z;


    if (axis === "x") {

        x = -12;

    } else {

        z = -12;
    }


    currentBlock =
        createBlock(
            x,
            blocks.length * blockHeight,
            z,

            previous.geometry.parameters.width,

            previous.geometry.parameters.depth,

            color
        );
}


// ======================================
// PLACE BLOCK
// ======================================

function placeBlock() {

    if (
        !gameRunning ||
        !currentBlock
    ) {
        return;
    }


    const previous =
        blocks[
            blocks.length - 1
        ];


    let overlap;


    // X AXIS

    if (axis === "x") {

        overlap =
            previous.geometry.parameters.width
            -
            Math.abs(
                currentBlock.position.x
                -
                previous.position.x
            );

    }


    // Z AXIS

    else {

        overlap =
            previous.geometry.parameters.depth
            -
            Math.abs(
                currentBlock.position.z
                -
                previous.position.z
            );
    }


    // ==================================
    // MISSED
    // ==================================

    if (overlap <= 0) {

        gameOver();

        return;
    }


    // ==================================
    // SCORE
    // ==================================

    score++;


    document
        .getElementById("score")
        .textContent = score;


    // ==================================
    // OLD MOVING BLOCK DATA
    // ==================================

    const oldX =
        currentBlock.position.x;

    const oldY =
        currentBlock.position.y;

    const oldZ =
        currentBlock.position.z;

    const oldColor =
        currentBlock.material.color.clone();


    // ==================================
    // NEW SIZE
    // ==================================

    let newWidth =
        previous.geometry.parameters.width;

    let newDepth =
        previous.geometry.parameters.depth;


    if (axis === "x") {

        newWidth = overlap;

    } else {

        newDepth = overlap;
    }


    // ==================================
    // DELETE MOVING BLOCK
    // ==================================

    deleteBlock(
        currentBlock
    );


    currentBlock = null;


    // ==================================
    // CREATE CUT BLOCK
    // ==================================

    const newBlock =
        createBlock(
            oldX,
            oldY,
            oldZ,
            newWidth,
            newDepth,
            oldColor
        );


    // ==================================
    // CENTER BLOCK
    // ==================================

    if (axis === "x") {

        const difference =
            oldX -
            previous.position.x;


        newBlock.position.x =
            previous.position.x
            +
            difference / 2;

    } else {

        const difference =
            oldZ -
            previous.position.z;


        newBlock.position.z =
            previous.position.z
            +
            difference / 2;
    }


    // Add to tower

    blocks.push(
        newBlock
    );


    // ==================================
    // INCREASE DIFFICULTY
    // ==================================

    speed += 0.01;


    if (speed > 0.45) {

        speed = 0.45;
    }


    // ==================================
    // CHANGE AXIS
    // ==================================

    if (axis === "x") {

        axis = "z";

    } else {

        axis = "x";
    }


    direction = 1;


    // Create next block

    createMovingBlock();
}


// ======================================
// GAME OVER
// ======================================

function gameOver() {

    gameRunning = false;


    // Delete moving block

    if (currentBlock) {

        deleteBlock(
            currentBlock
        );

        currentBlock = null;
    }


    document
        .getElementById("gameOver")
        .style.display = "flex";
}


// ======================================
// START BUTTON
// ======================================

document
    .getElementById("startButton")
    .addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            startGame();
        }
    );


// ======================================
// RESTART BUTTON
// ======================================

document
    .getElementById("restartButton")
    .addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            startGame();
        }
    );


// ======================================
// MOUSE / TOUCH
// ======================================

document
    .getElementById("game")
    .addEventListener(
        "click",
        function() {

            if (gameRunning) {

                placeBlock();
            }
        }
    );


// ======================================
// KEYBOARD
// ======================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.code === "Space"
        ) {

            event.preventDefault();


            if (gameRunning) {

                placeBlock();

            } else {

                startGame();
            }
        }
    }
);


// ======================================
// ANIMATION
// ======================================

function animate() {

    requestAnimationFrame(
        animate
    );


    // ==================================
    // MOVE CURRENT BLOCK
    // ==================================

    if (
        gameRunning &&
        currentBlock
    ) {

        if (axis === "x") {

            currentBlock.position.x
                +=
                speed * direction;


            if (
                currentBlock.position.x > 12 ||
                currentBlock.position.x < -12
            ) {

                direction *= -1;
            }

        } else {

            currentBlock.position.z
                +=
                speed * direction;


            if (
                currentBlock.position.z > 12 ||
                currentBlock.position.z < -12
            ) {

                direction *= -1;
            }
        }
    }


    // ==================================
    // CAMERA FOLLOW
    // ==================================

    if (
        blocks.length > 3
    ) {

        const targetY =
            blocks.length *
            blockHeight;


        camera.position.y +=
            (
                targetY +
                18 -
                camera.position.y
            )
            *
            0.03;


        camera.lookAt(
            0,
            targetY / 2,
            0
        );
    }


    // ==================================
    // RENDER
    // ==================================

    renderer.render(
        scene,
        camera
    );
}


// ======================================
// RESIZE
// ======================================

window.addEventListener(
    "resize",
    function() {

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);


// ======================================
// START ANIMATION
// ======================================

animate();