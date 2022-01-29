const config = {
    cellSize: 12,
    cellColorLive       : 'yellow',
    cellColorDead       : 'gray',
    cellBorderColor     : 'silver',
    row                 : 41,
    col                 : 41,
    fps                 : 10,
    boardWidth          : 500, // dont change this value
    boardHeight         : 500, // dont change this value
    lineWidth           : 2
}

var interval = 1000 / config.fps;  

var canvas = document.getElementById("board");
var context = canvas.getContext("2d"); 

canvas.width = config.boardWidth;  
canvas.height = config.boardHeight; 


context.lineWidth = config.lineWidth;
context.strokeStyle = config.cellBorderColor;

function cell(rows, cols) {
 
  this.rows = rows;
  this.cols = cols;
  
  this.live = false;  

  
  this.aliveNextGen = false;
}

cell.prototype.draw = function() {
  var posX = config.cellSize * this.cols;  
  var posY = config.cellSize * this.rows;

  var cellColor;
  if (this.live) {
    cellColor = config.cellColorLive;
  } else {
    cellColor = config.cellColorDead;
  }
  
  context.fillStyle = cellColor;
  context.fillRect(posX, posY, config.cellSize, config.cellSize);

  context.strokeRect(posX, posY, config.cellSize, config.cellSize);
};

function createBoard(row, col) {
  this.row = row;
  this.col = col;

 
  this.cellArray = [];

  for (var rows = 0; rows < this.row; rows++) {
    this.cellArray[rows] = [];
    for (var cols = 0; cols < this.col; cols++) {
      this.cellArray[rows][cols] = new cell(rows, cols);
    }
  }
  this.draw();
}

createBoard.prototype.draw = function() {
  for (var rows = 0; rows < this.row; rows++) {
    for (var cols = 0; cols < this.col; cols++) {
      this.cellArray[rows][cols].draw();
    }
  }
};


var board = new createBoard(config.row, config.col);


canvas.addEventListener('click', function(event) {

  var boundingRect = this.getBoundingClientRect();

  var x = event.clientX - boundingRect.left;
  var y = event.clientY - boundingRect.top;
  
  var rows = Math.floor(y / config.cellSize);
  var cols = Math.floor(x / config.cellSize);

  if (rows < board.row && cols < board.col) {
   
    board.cellArray[rows][cols].live = !board.cellArray[rows][cols].live;
    board.cellArray[rows][cols].draw();
  }
});

createBoard.prototype.countNextAlive = function(rows, cols) {
  var nextAlive = 0;
  for (var f = rows - 1; f <= rows + 1; f++) {
    for (var c = cols - 1; c <= cols + 1; c++) {
      
     
      if (!(f == rows && c == cols)) {
        
     
        if (f >= 0 && f < this.row && c >= 0 && c < this.col) {
          if (this.cellArray[f][c].live) {
            nextAlive++;
          }
        }
      }
    }
  }
  return nextAlive;
};


createBoard.prototype.cellNextGen = function(rows, cols) {
  var nextAlive = this.countNextAlive(rows, cols);
  var celula = this.cellArray[rows][cols];
  var aliveNextGen;
  
  if (this.cellArray[rows][cols].live) {
    if (nextAlive == 2 || nextAlive == 3) {
      aliveNextGen = true;
    } else {
      aliveNextGen = false;
    }
  } else {
   
    if (nextAlive == 3) {
      aliveNextGen = true;
    } else {
      aliveNextGen = false;
    }
  }
  celula.aliveNextGen = aliveNextGen;
  return aliveNextGen;
};

createBoard.prototype.boardNextGen = function() {
  var nRow;
  var nCol;
  
  for (nRow = 0; nRow < this.row; nRow++) {
    for (nCol = 0; nCol < this.col; nCol++) {
      this.cellNextGen(nRow, nCol);
    }
  }

 
  for (nRow = 0; nRow < this.row; nRow++) {
    for (nCol = 0; nCol < this.col; nCol++) {
      this.cellArray[nRow][nCol].live = this.cellArray[nRow][nCol].aliveNextGen;
    }
  }

  this.draw();
};

createBoard.prototype.boardCleaner = function() {
  for (var nRow = 0; nRow < this.row; nRow++) {
    for (var nCol = 0; nCol < this.col; nCol++) {
      this.cellArray[nRow][nCol].live = false;
    }
  }
  this.draw();
};


var animation = false;
var animationActive;
function setAnimation() {
 
  setTimeout(function() {
    if (animation) {
        animationActive = requestAnimationFrame(setAnimation);
        board.boardNextGen();
    }
  }, interval);
}

$("#next").click(function () {
  board.boardNextGen();
});

$("#start").click(function () {
  animation = true;
  setAnimation();
  $(this).attr("disabled", true);
  $("#next").attr("disabled", true);
});

$("#stop").click(function () {
  animation = false;
  cancelAnimationFrame(animation);
  $("#start").removeAttr("disabled");
  $("#next").removeAttr("disabled");
});

$("#clean").click(function () {
  $("#stop").click(); 
  board.boardCleaner();
});


createBoard.prototype.createLive = function(rows, cols) {
  this.cellArray[rows][cols].live = true;
};

createBoard.prototype.createAnyDraw = function(coordinates) {
  coordinates.forEach(function (point) {
    this.createLive.apply(this, point);
  }, this);
};

var anyDraw =   [[15, 1],
                [15, 2],
                [15, 3],
                [16, 3],
                [17, 2]];
board.createAnyDraw(anyDraw);
board.draw();
$("#start").click();
