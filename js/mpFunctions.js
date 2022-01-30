/**
 * CONFIGURAÇÕES DO TABULEIRO
 */
 const config = {
  cellSize            : 12,         // Tamanho da célula
  cellColorLive       : 'yellow',   // Cor da célula viva
  cellColorDead       : 'gray',     // Cor da célula morta
  cellBorderColor     : 'silver',   // Cor das bordas da célula
  row                 : 41,         // Quantidade de Linhas que terá no tabuleiro
  col                 : 41,         // Quantidade de Colunas que terá no tabuleiro
  fps                 : 10,         // Taxa de atualização por segundo
  boardWidth          : 500,        // Largura do tabuleiro (ajuste de acordo com o tamanho do campo no CSS)
  boardHeight         : 500,        // Altura do tabuleiro (ajuste de acordo com o tamanho do campo no CSS)
  lineWidth           : 2           // Tamanho da linha
}

var interval = 1000 / config.fps;                 // Calcula a taxa de atualização por segundo (frames per second)

var canvas = document.getElementById("board");    // Captura o elemento canva (que é onde será desenhado o tabuleiro)
var context = canvas.getContext("2d");            // puxa o context em 2D

canvas.width = config.boardWidth;                 // Determina a largura do tabuleiro
canvas.height = config.boardHeight;               // Determina a altura do tabuleiro 


context.lineWidth = config.lineWidth;             // Determina o tamanho da linha
context.strokeStyle = config.cellBorderColor;     // Determina a cor das bordas

/**
* FUNÇÃO PARA CRIAR A CÉLULA
*/
function cell(rows, cols) {
// Guarda fileira e coluna para o desenho
this.rows = rows;
this.cols = cols;

// inicia com todas as células mortas
this.live = false;  

// estado da proxima geração
this.aliveNextGen = false;
}

/**
* FUNÇÃO QUE HERDA A ESTRUTURA DA CÉLULA E DESENHA
*/
cell.prototype.draw = function() {
var posX = config.cellSize * this.cols;  
var posY = config.cellSize * this.rows;

var cellColor;
if (this.live) {
  cellColor = config.cellColorLive;
} else {
  cellColor = config.cellColorDead;
}

// Preenche o interior da célula com a cor
context.fillStyle = cellColor;
context.fillRect(posX, posY, config.cellSize, config.cellSize);

// Cria as bordas da célula
context.strokeRect(posX, posY, config.cellSize, config.cellSize);
};

/**
* FUNÇÃO PARA A CRIAÇÃO DO TABULEIRO
*/
function createBoard(row, col) {
this.row = row;
this.col = col;


// Lista de informações da célula, posição, estado (vivo ou morto)
this.cellArray = [];

for (var rows = 0; rows < this.row; rows++) {
  this.cellArray[rows] = []; // inicia a inserção de células na lista
  for (var cols = 0; cols < this.col; cols++) {
    this.cellArray[rows][cols] = new cell(rows, cols);
  }
}
this.draw();
}

/**
* FUNÇÃO PARA DESENHAR O TABULEIRO HERDANDO A ESTRUTURA DA FUNÇÃO createBoard
*/
createBoard.prototype.draw = function() {
for (var rows = 0; rows < this.row; rows++) {
  for (var cols = 0; cols < this.col; cols++) {
    this.cellArray[rows][cols].draw();
  }
}
};

/**
* Inicia o tabuleiro com a função createBoard
*/
var board = new createBoard(config.row, config.col);


/** 
* CRIA UMA ESCUTA NO DISPARO DE EVENTO (CLICK) DENTRO DO CANVA 
* PARA A INTERATIVIDADE
*/
canvas.addEventListener('click', function(event) {

var boundingRect = this.getBoundingClientRect(); // Capturo a posição relativa ao viewport

/**
 * CAPTURA A POSIÇÃO DO CLICK DENTRO DO CANVA
 */
var x = event.clientX - boundingRect.left;
var y = event.clientY - boundingRect.top;

var rows = Math.floor(y / config.cellSize);
var cols = Math.floor(x / config.cellSize);

/**
 * VERIFICA SE ESTÁ VIVO E MUDA PARA MORTO E VICE-VERSA
 */
if (rows < board.row && cols < board.col) {
  board.cellArray[rows][cols].live = !board.cellArray[rows][cols].live;
  board.cellArray[rows][cols].draw();
}
});

/**
* FUNÇÃO HERDADA PARA VERIFICAR QUANTIDADE DE VIZINHOS VIVOS
* PARA A PROGREÇÃO DAS NOVAS GERAÇÕES
*/
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

/**
* FUNÇÃO HERDADA PARA DETERMINAR O ESTADO DA CÉLULA NA PROXIMA GERAÇÃO
*/
createBoard.prototype.cellNextGen = function(rows, cols) {
var nextAlive = this.countNextAlive(rows, cols);
var celula = this.cellArray[rows][cols];
var aliveNextGen;
// VERIFICA SE A CÉLULA ESTÁ VIVA
if (this.cellArray[rows][cols].live) {
  // SE A CÉLULA TIVER 2 OU 3 VIZINHOS
  if (nextAlive == 2 || nextAlive == 3) {
    aliveNextGen = true; // CONTINUA VIVA
  } else {
    // CASO CONTRARIO A CÉLULA MORRE
    aliveNextGen = false;
  }
} else {
  // CASO ELA ESTEJA MORTA COM EXATAMENTE 3 VIZINHAS ELA NASCERÁ NA PROXIMA GERAÇÃO
  if (nextAlive == 3) {
    aliveNextGen = true;
  } else {
    aliveNextGen = false;
  }
}
celula.aliveNextGen = aliveNextGen;
return aliveNextGen;
};

/**
* PASSA PARA A PROXIMA GERAÇÃO
*/
createBoard.prototype.boardNextGen = function() {
var nRow;
var nCol;

/**
 * VERIFICAÇÃO UNITÁRIA DE STATUS (VIVO OU MORTO)
 */
for (nRow = 0; nRow < this.row; nRow++) {
  for (nCol = 0; nCol < this.col; nCol++) {
    this.cellNextGen(nRow, nCol);
  }
}

/**
* ATUALIZO O STATUS (VIVO OU MORTO) DE CADA CÉLULA
*/
for (nRow = 0; nRow < this.row; nRow++) {
  for (nCol = 0; nCol < this.col; nCol++) {
    this.cellArray[nRow][nCol].live = this.cellArray[nRow][nCol].aliveNextGen;
  }
}

this.draw();
};

/**
* FUNÇÃO PARA LIMPAR O TABULEIRO (MATAR TODAS AS CÉLULAS PARA COMEÇAR O JOGO NOVAMENTE)
*/
createBoard.prototype.boardCleaner = function() {
for (var nRow = 0; nRow < this.row; nRow++) {
  for (var nCol = 0; nCol < this.col; nCol++) {
    this.cellArray[nRow][nCol].live = false;
  }
}
this.draw();
};

/**
* CRIO UM TEMPORIZADOR PARA A ANIMAÇÃO 
* DEIXANDO ELE EM LOOP ATÉ A SUA PARALIZAÇÃO POR MEIO DA VARIAVEL animationActive
*/
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

/**
* CAPTURO O CLICK DE PROXIMA GERAÇÃO E CHAMO A FUNÇÃO
*/
$("#next").click(function () {
board.boardNextGen();
});

/**
* CAPTURO O CLICK DE INICIAR O JOGO E CHAMO A FUNÇÃO
*/
$("#start").click(function () {
animation = true; // ATIVO O LOOP DO TIMER
setAnimation();   // INICIO O TIMER
$(this).attr("disabled", true); // DESABILITO O BOTÃO DE INICIAR O JOGO
$("#next").attr("disabled", true); // DESABILITO O BOTÃO DE PROXIMA GERAÇÃO
});

/**
* CAPTURO O CLICK DO BOTÃO PARAR
*/
$("#stop").click(function () {
animation = false; // DESATIVO O LOOP DO TIMER 
cancelAnimationFrame(animation); // CANCELO A ANIMAÇÃO
$("#start").removeAttr("disabled"); // REABILITO O BOTÃO INICIAR O JOGO
$("#next").removeAttr("disabled"); // REABILITO O BOTÃO PROXIMA GERAÇÃO
});

/**
* CAPTURO O CLICK DO BOTÃO LIMPAR E CHAMO A FUNÇÃO
*/
$("#clean").click(function () {
$("#stop").click(); // SIMULO O CLICK NO BOTÃO STOP, PARA PARAR A ANIMAÇÃO E O TIMER DO LOOP
board.boardCleaner(); // CHAMO A FUNÇÃO DE LIMPEZA DO TABULEIRO
});


/**
* DEFINO AS CÉLULAS VIVA DO TABULEIRO
*/
createBoard.prototype.createLive = function(rows, cols) {
this.cellArray[rows][cols].live = true;
};

/**
* CRIO UM DESENHO NAS CELULAS PARA FAZER A ANIMAÇÃO MAIS PROGRESSIVA
*/

createBoard.prototype.createAnyDraw = function(coordinates) {
coordinates.forEach(function (point) {
  this.createLive.apply(this, point);
}, this);
};
/**
* COORDENADAS PARA O DESENHO DE UMA AERONAVE
*/
var anyDraw =   [[15, 1],
              [15, 2],
              [15, 3],
              [16, 3],
              [17, 2]];
/** CHAMO A FUNÇÃO PARA CRIAR O DESENHO DA AERONAVE */
board.createAnyDraw(anyDraw);
board.draw(); // DESENHO O TABULEIRO
$("#start").click(); // SIMULO O CLICK NO BOTÃO START PARA ABRIR JÁ COM A ANIMAÇÃO ATIVA
