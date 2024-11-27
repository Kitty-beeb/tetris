const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
context.scale(20, 20);

// Tetrispalojen värit
const colors = [
    null,
    "red",
    "blue",
    "green",
    "purple",
    "orange",
    "cyan",
    "yellow",
];

// Suomalaiset kehut Delille
const compliments = [
    "Del, olet mahtava!",
    "Hienoa, Del! Olet loistava!",
    "Del, olet aivan upea!",
    "Jatka samaan malliin, Del!",
    "Del, tuot valoa maailmaan!",
    "Del, olet pysäyttämätön!",
    "Sinä olet tähti, Del!",
    "Del, olet nerokas!",
    "Olet inspiroiva, Del!",
    "Del, olet paras!"
];

// Luo pelialue
const arena = createMatrix(12, 20);

// Pelaajan tiedot
const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0,
};

// Luo tyhjä pelialue
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

// Luo Tetrispalat
function createPiece(type) {
    if (type === 'T') {
        return [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ];
    } else if (type === 'O') {
        return [
            [1, 1],
            [1, 1],
        ];
    } else if (type === 'L') {
        return [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0],
        ];
    } else if (type === 'J') {
        return [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0],
        ];
    } else if (type === 'I') {
        return [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0],
        ];
    } else if (type === 'Z') {
        return [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0],
        ];
    }
}

// Pyöritä palikkaa
function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

// Pelaajan palikan pyöritys
function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

// Piirrä palat ja tausta
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

// Piirrä koko pelialue ja pelaaja
function draw() {
    context.fillStyle = "#f0f0f0"; // Kevyempi taustaväri
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
}

// Yhdistä palat pelialueeseen
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

// Tarkista törmäykset
function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; y++) {
        for (let x = 0; x < m[y].length; x++) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] &&
                    arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

// Nollaa pelaaja, kun palikka pysähtyy
function playerReset() {
    const pieces = 'ILJOTSZ';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

// Pudota palikka alas
function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        giveCompliment();
    }
    dropCounter = 0;
}

// Liikuta pelaajaa vasemmalle tai oikealle
function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

// Poista täydet rivit ja päivitä pisteet
function arenaSweep() {
    outer: for (let y = arena.length - 1; y > 0; y--) {
        for (let x = 0; x < arena[y].length; x++) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        player.score += 10;
        updateScore();
    }
}

// Anna kehu Delille
function giveCompliment() {
    const compliment = compliments[Math.floor(Math.random() * compliments.length)];
    document.getElementById("compliment").innerText = compliment;
}

// Päivitä pisteet
function updateScore() {
    document.getElementById("compliment").innerText = `Pisteet: ${player.score}`;
}

// Päivitä peli
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

// Kuuntele näppäimistön tapahtumia
document.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") {
        playerMove(-1);
    } else if (event.key === "ArrowRight") {
        playerMove(1);
    } else if (event.key === "ArrowDown") {
        playerDrop();
    } else if (event.key === "q") {
        playerRotate(-1);
    } else if (event.key === "w") {
        playerRotate(1);
    }
});

// Aloita peli
playerReset();
updateScore();
update();
