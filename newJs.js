 
canvas = this.document.getElementById("idée");
var ctx = canvas.getContext("2d");
window.addEventListener('DOMContentLoaded', function() {
    draw_all();
});

var turn = 1;
var chosed;
var last_elem = [];

document.getElementById("idée").addEventListener("click", function() {
    draw_all();
    size = 100;
    coord =[~~((event.pageY - 100) / 100), ~~((event.pageX - 550) / 100)];
    var this_pos = [];
    if (last_elem.length > 0) {
        last_elem.forEach(elem => {
            if (elem[0] == coord[0] && elem[1] == coord[1]) {
                map[coord[0]][coord[1]] = chosed;
                map[chosed.position[0]][chosed.position[1]] = null;
                chosed.position[0] = coord[0];
                chosed.position[1] = coord[1];
                draw_all();
                if (chosed.constructor.name == "Pawn") {
                    chosed.nb_mvt = 1;
                }
                turn *= -1
            }
        });
        last_elem = [];
    } else {
        if (map[coord[0]][coord[1]] != null && map[coord[0]][coord[1]].color == turn) {
            this_pos = map[coord[0]][coord[1]].findAllMvt();
            this_pos = map[coord[0]][coord[1]].check_fine(this_pos);
        }
        if (this_pos.length > 0) {
            chosed = map[coord[0]][coord[1]];
            this_pos.forEach(elem => {
                ctx = canvas.getContext("2d");
                ctx.fillStyle = "#ee1111aa";
                ctx.fillRect(elem[1] * size, elem[0] * size, size, size);
            });
        }
        last_elem = this_pos;
    }
});


var map = [[null, null, null, null, null, null, null, null],
[null, null, null, null, null, null, null, null],
[null, null, null, null, null, null, null, null],
[null, null, null, null, null, null, null, null],
[null, null, null, null, null, null, null, null],
[null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null]];
const indexes = [0, 1, 2, 3, 4, 5, 6, 7];

function in_check(pos, color, t_map) {
    var allPos = [];
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            if (t_map[x][y] != null && t_map[x][y].color != color) {
                allPos = t_map[x][y].findAllMvt();
            }
            for (var i = 0; i < allPos.length; i++) {
                if (allPos[i][0] == pos[0] && allPos[i][1] == pos[1]) {
                    return true;
                }
            }
        }
    }
    return false;
}

function find_king(map, color) {
    for (let i= 0; i < map.length; i++) {
        for (let j = 0; j < map.length; j++) {
            if (map[i][j] && map[i][j].constructor.name == "King" && map[i][j].color == color) {
                return (map[i][j].position);
            }
        }
    }
}

function draw_all() {
    var size = 100;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            if (x % 2 == y % 2)
                ctx.fillStyle = "#aaaaeebb";
            else 
                ctx.fillStyle = "#1111ddbb";
            ctx.fillRect(x * size, y * size, size, size);
        }
    }
    for (var i = 0; i != 8; i++) {
        for (var j = 0; j != 8; j++) {
            if (map[i][j] == null)
                continue;
            map[i][j].show_img(ctx);
        }
    }
}


class Pieces {
    constructor (position, color, img) {
        this.position = position;
        this.color = color;
        this.img = img;
    }

    findAllMvt() {
        return 0;
    }

    show_img(ctx) {
        var img = new Image();
        img.src = this.img;
        ctx.drawImage(img, this.position[1] * 100, this.position[0] * 100, 95, 95);
    }

    check_fine(allPos) {
        var new_map;
    
        for (let i = 0; i < allPos.length; i++) {
            new_map = copy_map(map);
            map[allPos[i][0]][allPos[i][1]] = Object.assign({}, this);
            Object.setPrototypeOf(map[allPos[i][0]][allPos[i][1]], this.constructor.prototype);
            map[allPos[i][0]][allPos[i][1]].position = allPos[i];
            map[this.position[0]][this.position[1]] = null;
            if (in_check(find_king(map, this.color), this.color, map)) {
                allPos.splice(i, 1);
                --i;
            }
            map = new_map;
        }
        return(allPos);
    }

    move_piece(pos) {

    } 
}

class Tower extends Pieces {
    constructor (position, color, nb_mvt, img) {
        super(position, color, img);
        this.nb_mvt = nb_mvt;
        
    }

    findAllMvt() {
        var allPos = [];
        const all_elt = [[this.position[0] + 1, this.position[1], 0, 1],
                    [this.position[0] - 1, this.position[1], 0, -1],
                    [this.position[0], this.position[1] + 1, 1, 1],
                    [this.position[0], this.position[1] - 1, 1, -1]];

        for (var j = 0; j != 4; j++) {
            let test = indexes.includes(all_elt[j][all_elt[j][2]]);
            while (test && map[all_elt[j][0]][all_elt[j][1]] == null) {
                allPos[allPos.length] = [all_elt[j][0], all_elt[j][1]];
                all_elt[j][all_elt[j][2]] += all_elt[j][3];
                test = indexes.includes(all_elt[j][all_elt[j][2]]);
            }
            if (test && map[all_elt[j][0]][all_elt[j][1]] != null && map[all_elt[j][0]][all_elt[j][1]].color == this.color * -1) {
                allPos[allPos.length] = map[all_elt[j][0]][all_elt[j][1]].position;
            }
        }
        return allPos;
    }
}

class Bishop extends Pieces {
    constructor (position, color, img) {
        super(position, color, img);
    }

    findAllMvt() {
        var allPos = [];
        let test = 0;
        let test2 = 0;
        const all_elt = [[this.position[0], this.position[1], 1, 1],
                    [this.position[0], this.position[1], -1, 1],
                    [this.position[0], this.position[1], -1, -1],
                    [this.position[0], this.position[1], 1, -1]];
        for (var j = 0; j != 4; j++) {
            while (true) {
                test = indexes.includes(all_elt[j][0] + all_elt[j][2]);
                test2 = indexes.includes(all_elt[j][1] + all_elt[j][3]);
                if (test && test2 && map[all_elt[j][0] + all_elt[j][2]][all_elt[j][1] + all_elt[j][3]] == null) {
                    allPos.push([all_elt[j][0] + all_elt[j][2], all_elt[j][1] + all_elt[j][3]]);
                    all_elt[j][0] += all_elt[j][2];
                    all_elt[j][1] += all_elt[j][3];
                    continue;
                }
                break;
            }
            if (test && test2 && map[all_elt[j][0] + all_elt[j][2]][all_elt[j][1] + all_elt[j][3]] && map[all_elt[j][0] + all_elt[j][2]][all_elt[j][1] + all_elt[j][3]].color != this.color)
                allPos.push([all_elt[j][0] + all_elt[j][2], all_elt[j][1] + all_elt[j][3]]);
        }
        return allPos;
    }
}

class Queen extends Pieces {
    constructor (position, color, img) {
        super(position, color, img);
    }

    findAllMvt() {
        var allPos = [];
        let test = 0;
        let test2 = 0;
        const all_elt_diag = [[this.position[0], this.position[1], 1, 1],
                    [this.position[0], this.position[1], -1, 1],
                    [this.position[0], this.position[1], -1, -1],
                    [this.position[0], this.position[1], 1, -1]];
        const all_elt = [[this.position[0] + 1, this.position[1], 0, 1],
                    [this.position[0] - 1, this.position[1], 0, -1],
                    [this.position[0], this.position[1] + 1, 1, 1],
                    [this.position[0], this.position[1] - 1, 1, -1]];

        for (var j = 0; j != 4; j++) {
            let test = indexes.includes(all_elt[j][all_elt[j][2]]);
            while (test && map[all_elt[j][0]][all_elt[j][1]] == null) {
                allPos[allPos.length] = [all_elt[j][0], all_elt[j][1]];
                all_elt[j][all_elt[j][2]] += all_elt[j][3];
                test = indexes.includes(all_elt[j][all_elt[j][2]]);
            }
            if (test && map[all_elt[j][0]][all_elt[j][1]] != null && map[all_elt[j][0]][all_elt[j][1]].color == this.color * -1) {
                allPos[allPos.length] = map[all_elt[j][0]][all_elt[j][1]].position;
            }
        }
        for (var j = 0; j != 4; j++) {
            while (true) {
                test = indexes.includes(all_elt_diag[j][0] + all_elt_diag[j][2]);
                test2 = indexes.includes(all_elt_diag[j][1] + all_elt_diag[j][3]);
                if (test && test2 && map[all_elt_diag[j][0] + all_elt_diag[j][2]][all_elt_diag[j][1] + all_elt_diag[j][3]] == null) {
                    allPos[allPos.length] = [all_elt_diag[j][0] + all_elt_diag[j][2], all_elt_diag[j][1] + all_elt_diag[j][3]];
                    all_elt_diag[j][0] += all_elt_diag[j][2];
                    all_elt_diag[j][1] += all_elt_diag[j][3];
                    continue;
                }
                break;
            }
            if (test && test2 && map[all_elt_diag[j][0] + all_elt_diag[j][2]][all_elt_diag[j][1] + all_elt_diag[j][3]] && map[all_elt_diag[j][0] + all_elt_diag[j][2]][all_elt_diag[j][1] + all_elt_diag[j][3]].color == this.color * -1)
                allPos[allPos.length] = [all_elt_diag[j][0] + all_elt_diag[j][2], all_elt_diag[j][1] + all_elt_diag[j][3]];
        }
        return allPos;
    }
}

class Knight extends Pieces {
    constructor (position, color, img) {
        super(position, color, img);
    }

    findAllMvt() {
        var allPos = [];
        const possiblePos = [[this.position[0] - 2, this.position[1] - 1],
        [this.position[0] - 2, this.position[1] + 1],
        [this.position[0] + 2, this.position[1] - 1],
        [this.position[0] + 2, this.position[1] + 1],
        [this.position[0] - 1, this.position[1] - 2],
        [this.position[0] - 1, this.position[1] + 2],
        [this.position[0] + 1, this.position[1] - 2],
        [this.position[0] + 1, this.position[1] + 2]];
        for (let i = 0; i != possiblePos.length; i++) {
            let test = indexes.includes(possiblePos[i][0]);
            let test2 = indexes.includes(possiblePos[i][1]);
            if (test && test2 && (map[possiblePos[i][0]][possiblePos[i][1]] == null || map[possiblePos[i][0]][possiblePos[i][1]].color != this.color))
                allPos[allPos.length] = [possiblePos[i][0], possiblePos[i][1]];
        }
        return (allPos);
    }
}

class Pawn extends Pieces {
    constructor (position, color, nb_mvt, img) {
        super(position, color, img);
        this.nb_mvt = nb_mvt;
    }
    findAllMvt() {
        var allPos = [];
        var test = indexes.includes(this.position[0] + this.color * 2 * -1);
        var test2 = indexes.includes(this.position[1] + this.color * -1);

        if (test && this.nb_mvt == 0 && map[this.position[0] + this.color * 2 * -1][this.position[1]] == null)
            allPos[0] = [this.position[0] + this.color * 2 * -1, this.position[1]];
        test = indexes.includes(this.position[0] + this.color * -1);

        if (test && map[this.position[0] + this.color * -1][this.position[1]] == null)
            allPos[allPos.length] = [this.position[0] + this.color * -1, this.position[1]];
        test = indexes.includes(this.position[0] + this.color * -1);
        if (test && test2 && map[this.position[0] + this.color * -1][this.position[1] + this.color * -1] && map[this.position[0] + this.color * -1][this.position[1] + this.color * -1].color != this.color)
            allPos[allPos.length] = [this.position[0] + this.color * -1, this.position[1] + this.color * -1];
        test2 = indexes.includes(this.position[1] - this.color * -1);
        if (test && test2 && map[this.position[0] + this.color * -1][this.position[1] - this.color * -1] && map[this.position[0] + this.color * -1][this.position[1] - this.color * -1].color != this.color)
            allPos[allPos.length] = [this.position[0] + this.color * -1, this.position[1] - this.color* -1];
        return allPos;
    }
}

class King extends Pieces {
    constructor (position, color, nb_mvt, img) {
        super(position, color, img);
        this.nb_mvt = nb_mvt;
    }

    findAllMvt() {
        var allPos = [];
        const possiblePos_i = [-1, 0, 1];
        const possiblePos_j = [-1, 0, 1];

        for (let i = 0; i != possiblePos_i.length; i++) {
            for (let j = 0; j != possiblePos_j.length; j++) {
                if (i == 1 && j == 1)
                    continue;
                let test = indexes.includes(this.position[0] + possiblePos_i[i]);
                let test2 = indexes.includes(this.position[1] + possiblePos_j[j]);
                if (test && test2 && map[this.position[0] + possiblePos_i[i]][this.position[1] + possiblePos_j[j]] && map[this.position[0] + possiblePos_i[i]][this.position[1] + possiblePos_j[j]].color != this.color)
                    allPos[allPos.length] = [this.position[0] + possiblePos_i[i], this.position[1] + possiblePos_j[j]];
                if (test && test2 && map[this.position[0] + possiblePos_i[i]][this.position[1] + possiblePos_j[j]] == null)
                    allPos[allPos.length] = [this.position[0] + possiblePos_i[i], this.position[1] + possiblePos_j[j]];   
            }
        }
        return (allPos);
    }
}

const all_init = [[[0, 0], -1, 0, "pieces/tour_n.svg"], [[0, 1], -1, 1, "pieces/cavalier_n.svg"], [[0, 2], -1, 2, "pieces/fou_n.svg"], [[0, 3], -1, 3, "pieces/dame_n.svg"], [[0, 4], -1, 4, "pieces/roi_n.svg"], [[0, 5], -1, 2, "pieces/fou_n.svg"], [[0, 6], -1, 1, "pieces/cavalier_n.svg"], [[0, 7], -1, 0, "pieces/tour_n.svg"],
[[7, 0], 1, 0, "pieces/tour_b.svg"], [[7, 1], 1, 1, "pieces/cavalier_b.svg"], [[7, 2], 1, 2, "pieces/fou_b.svg"], [[7, 3], 1, 3, "pieces/dame_b.svg"], [[7, 4], 1, 4, "pieces/roi_b.svg"], [[7, 5], 1, 2, "pieces/fou_b.svg"], [[7, 6], 1, 1, "pieces/cavalier_b.svg"], [[7, 7], 1, 0, "pieces/tour_b.svg"]]

all_init.forEach(element => {
    if (element[2] == 0)
        map[element[0][0]][element[0][1]] = new Tower(element[0], element[1], 0, element[3]);
    if (element[2] == 1)
        map[element[0][0]][element[0][1]] = new Knight(element[0], element[1], element[3]);
    if (element[2] == 2)
        map[element[0][0]][element[0][1]] = new Bishop(element[0], element[1], element[3]);
    if (element[2] == 3)
        map[element[0][0]][element[0][1]]= new Queen(element[0], element[1], element[3]);
    if (element[2] == 4)
        map[element[0][0]][element[0][1]] = new King(element[0], element[1], 0, element[3]);
});

for (var i = 0; i != 8; i++) {
    map[1][i] = new Pawn([1, i], -1, 0, "pieces/pion_n.svg");
    map[6][i] = new Pawn([6, i], 1, 0, "pieces/pion_b.svg");
}

function copy_map(map) {
    var new_map = [[null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null]];
    for (var i = 0; i != map.length; i++) {
        for (var j = 0; j != map.length; j++) {
            new_map[i][j] = map[i][j];
        }
    }
    return (new_map);
}
/*map[1][3] = new Bishop([1, 3], -1, "pieces/fou_n.svg");
map[4][1] = new Bishop([4, 1], -1, "pieces/fou_n.svg");
map[4][0] = new Bishop([4, 0], 1, "pieces/fou_b.svg");
map[6][4] = new Tower([6, 4], 1, 0, "pieces/tour_b.svg");
*/

//console.log(in_check([0,4], -1, map));


/*
for (var i = 0; i != 8; i++) {
    for (var j = 0; j != 8; j++) {
        if (map[i][j] == null)
            continue;
        var all_pos = map[i][j].findAllMvt();
        console.log("l'élément à la posotion", map[i][j].position, "à", all_pos.length, "mouvement possible", all_pos);
    }
}*/
