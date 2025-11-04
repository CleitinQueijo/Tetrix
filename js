let isPaused = false; // Variável global que controla se o jogo está pausado
let timerInterval;
let startTime;
let elapsedBeforePause = 0; // tempo acumulado antes da pausa

function startTimer() {
    startTime = Date.now();
    const timerEl = document.getElementById("game-timer");

    timerInterval = setInterval(() => {
        if (!game || game.paused) return; // não atualiza se jogo pausado

        const elapsed = elapsedBeforePause + (Date.now() - startTime);

        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        const milliseconds = Math.floor((elapsed % 1000) / 10);

        const minStr = String(minutes).padStart(2, '0');
        const secStr = String(seconds).padStart(2, '0');
        const msStr = String(milliseconds).padStart(2, '0');

        timerEl.textContent = `Tempo: ${minStr}:${secStr}:${msStr}`;
    }, 10);
}

// Para o cronômetro (quando sair do jogo ou reiniciar)
function stopTimer() {
    clearInterval(timerInterval);
}

// Chamada quando o jogador pausa ou despausa com P
function pauseTimer() {
    if (!game) return;
    if (game.paused) {
        // Acumula tempo até o momento da pausa
        elapsedBeforePause += Date.now() - startTime;
    } else {
        // Reinicia contagem sem zerar o acumulado
        startTime = Date.now();
    }
}


// Evento de teclado para pausar/despausar com "P"
document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "p") { // Verifica se a tecla pressionada é 'P'
        isPaused = !isPaused; // Alterna estado de pausa
        document.getElementById("pause-screen").style.display = isPaused ? "flex" : "none"; // Mostra/oculta overlay de pausa

        if (isPaused) {
            // Quando pausa
            console.log("Jogo pausado"); // Debug
        } else {
            // Quando retoma
            console.log("Jogo retomado"); // Debug
        }
    }
});




// Botão "Retomar" do menu de pausa
document.getElementById("btn-resume").addEventListener("click", () => {
    if (!game) return; // Evita erro se o jogo ainda não começou
    game.paused = false; // Despausa o jogo
    isPaused = false; // Atualiza variável global
    document.getElementById("pause-screen").style.display = "none"; // Oculta overlay de pausa
    game.lastTime = 0; // Reseta temporizador
    game.loopId = requestAnimationFrame(game.update.bind(game)); // Retoma loop de atualização
});

// Botão "Reiniciar" do menu de pausa
document.getElementById("btn-restart").addEventListener("click", () => {
    showScreen('jogo'); // Garante que a tela do jogo esteja ativa
    startGame(); // Reinicia o Tetris
    isPaused = false; // Remove pausa
    document.getElementById("pause-screen").style.display = "none"; // Oculta overlay
    console.log("Jogo reiniciado"); // Debug
});

// Botão "Menu" do menu de pausa
document.getElementById("btn-menu").addEventListener("click", () => {
    isPaused = false; // Remove pausa
    document.getElementById("pause-screen").style.display = "none"; // Oculta overlay
    showScreen('menu'); // Mostra tela de menu
});

// Botão de retorno da tela INSANE
document.getElementById("btn-return").addEventListener("click", () => {
    if (game) {
        showScreen("jogo"); // ativa a tela do jogo
        game.paused = false;
        game.gameOver = false; // desbloqueia game over
        game.lastTime = 0;

        // redesenha imediatamente
        game.drawAll();

        // retoma loop
        game.loopId = requestAnimationFrame(game.update.bind(game));

        // reativa controles
        document.addEventListener("keydown", game.handleKeyDown);

        // retoma cronômetro
        startTimer();
    }
});


// Função para exibir notificações temporárias
function showNotification(text, duration = 2000) {
    const notif = document.getElementById('custom-notification'); // Seleciona elemento
    notif.textContent = text; // Define mensagem
    notif.style.display = 'block'; // Mostra notificacao
    setTimeout(() => { notif.style.display = 'none'; }, duration); // Oculta após duração
}

/* ========= Navegação entre telas / Login ========= */

// Mostra tela especificada e oculta as outras
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); // Remove classe 'active' de todas as telas
    document.getElementById(screenId).classList.add('active'); // Adiciona classe 'active' à tela desejada
}

// Função de cadastro de usuário
function cadastrar() {
    let user = document.getElementById("cad-username").value.trim(); // Pega nome de usuário
    let senha = document.getElementById("cad-senha").value; // Pega senha
    let confirma = document.getElementById("cad-confirma").value; // Pega confirmação de senha

    if (!user || !senha || !confirma) { 
        showNotification("Preencha todos os campos!"); // Mensagem de erro
        return; 
    }
    if (senha !== confirma) { 
        showNotification("As senhas não coincidem!"); // Mensagem de erro
        return; 
    }

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || []; // Recupera usuários do localStorage
    if (usuarios.find(u => u.username === user)) { 
        showNotification("Usuário já cadastrado!"); // Mensagem de erro
        return; 
    }

    usuarios.push({ username: user, senha: senha }); // Adiciona novo usuário
    localStorage.setItem("usuarios", JSON.stringify(usuarios)); // Salva no localStorage
    showNotification("Cadastro realizado com sucesso!"); // Mensagem de sucesso
    showScreen('login'); // Mostra tela de login após cadastro
}

// Botão "Entrar como Convidado"
document.getElementById('guestBtn').addEventListener('click', () => {
    currentUser = 'Convidado'; // Define usuário atual como convidado
    const hudUsername = document.getElementById("hud-username");
    hudUsername.textContent = currentUser; // Mostra nome na HUD
    hudUsername.style.display = "block";

    showNotification("Entrou como convidado!"); // Mensagem de sucesso
    showScreen('menu'); // Vai para menu
});

// Função de login de usuário
function logar() {
    let userInput = document.getElementById("login-username"); // Input usuário
    let senhaInput = document.getElementById("login-senha"); // Input senha
    let errorMsg = document.getElementById("login-error"); // Mensagem de erro

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || []; // Recupera usuários
    let usuarioValido = usuarios.find(u => u.username === userInput.value.trim() && u.senha === senhaInput.value); // Verifica credenciais

    if (usuarioValido) {
        errorMsg.style.display = "none"; // Oculta erro
        userInput.classList.remove("error"); // Remove estilo de erro
        senhaInput.classList.remove("error");

        const hudUsername = document.getElementById("hud-username");
        hudUsername.textContent = usuarioValido.username; // Mostra usuário
        hudUsername.style.display = "block";

        currentUser = usuarioValido.username; // Atualiza usuário atual
        showScreen('menu'); // Vai para menu
    } else {
        errorMsg.style.display = "block"; // Mostra erro
        userInput.classList.add("error"); // Adiciona estilo de erro
        senhaInput.classList.add("error");
        setTimeout(() => { userInput.classList.remove("error"); senhaInput.classList.remove("error"); }, 400); // Remove erro após 400ms
    }
}

// Inicia jogo a partir do menu
function startFromMenu() {
    // Efeito visual "boom"
    boom.classList.remove("boom-active");
    void boom.offsetWidth; // Força reflow
    boom.classList.add("boom-active");

    showScreen('jogo'); // Mostra tela do jogo
    startGame(); // Inicia partida
}

/* ========= JOGO ========= */
const COLS = 10, ROWS = 20; // Número de colunas e linhas do tabuleiro
const EMPTY = 0; // Valor que representa célula vazia
// Cores das peças (alteradas para não serem iguais às originais)
const COLORS = { I:'#ff69b4', J:'#8a2be2', L:'#ffa500', O:'#00ced1', S:'#adff2f', T:'#ff4500', Z:'#7fff00' };
// Formatos das peças (matriz 2D)
const SHAPES = {
    I:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    J:[[1,0,0],[1,1,1],[0,0,0]],
    L:[[0,0,1],[1,1,1],[0,0,0]],
    O:[[1,1],[1,1]],
    S:[[0,1,1],[1,1,0],[0,0,0]],
    T:[[0,1,0],[1,1,1],[0,0,0]],
    Z:[[1,1,0],[0,1,1],[0,0,0]]
};
const PIECES = Object.keys(SHAPES); // Tipos de peças disponíveis

let currentUser = null; // Usuário atual
let game = null; // Instância do jogo

// Classe principal do jogo
class Game {
    constructor() {
        this.freezeUses = 3; // Número de congelamentos disponíveis
        this.isFrozen = false; // Flag de congelamento
        this.bombUses = 3; // Número de bombas disponíveis

        // Canvas do tabuleiro principal
        this.boardCanvas = document.getElementById('board');
        this.bctx = this.boardCanvas.getContext('2d');

        // Canvas da próxima peça
        this.nextCanvas = document.getElementById('next');
        this.nctx = this.nextCanvas.getContext('2d');

        // Canvas da peça em hold
        this.holdCanvas = document.getElementById('hold');
        this.hctx = this.holdCanvas.getContext('2d');

        // Elementos de HUD
        this.scoreEl = document.querySelector('.info-box.score');
        this.levelEl = document.querySelector('.info-box.level');
        this.linesEl = document.querySelector('.info-box.lines');

        this.handleKeyDown = this.onKeyDown.bind(this); // Bind do evento de teclado

        this.reset(); // Inicializa o jogo
    }

    reset() {
        this.grid = Array.from({length: ROWS}, () => Array(COLS).fill(EMPTY)); // Cria grid vazia
        this.score = 0; // Reseta pontuação
        this.level = 1; // Reseta nível
        this.lines = 0; // Reseta linhas
        this.dropCounter = 0; // Contador de queda
        this.dropInterval = this.levelToInterval(this.level); // Intervalo de queda
        this.lastTime = 0; // Último timestamp
        this.paused = false; // Pausa inicial
        this.gameOver = false; // Flag de fim de jogo

        this.holdPiece = null; // Peça em hold
        this.holdLocked = false; // Bloqueio de hold

        this.bag = []; // Sacola de peças
        this.queue = []; // Fila de próximas peças
        this.fillBag(); this.fillBag(); // Preenche a fila de peças

        this.spawn(); // Gera primeira peça

        this.updatePanels(); // Atualiza HUD
        this.drawAll(); // Desenha tudo

        document.addEventListener('keydown', this.handleKeyDown); // Ativa controle de teclado
        this.loopId = requestAnimationFrame(this.update.bind(this)); // Inicia loop principal
    }

    levelToInterval(level) {
        // Retorna intervalo de queda em ms baseado no nível
        const table = [1000, 793, 618, 473, 355, 262, 190, 135, 94, 64];
        return level <= 10 ? table[level-1] : Math.max(64 - (level-10)*3, 30);
    }

    fillBag() {
        // Método 7-bag randomizado
        let bag = [...PIECES]; // Copia tipos de peças
        for (let i = bag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [bag[i], bag[j]] = [bag[j], bag[i]]; // Embaralha
        }
        this.bag.push(...bag); // Adiciona à sacola
        while (this.queue.length < 5 && this.bag.length) { 
            this.queue.push(this.bag.shift()); // Preenche fila de próximas
        }
    }

    spawn() {
        if (this.queue.length < 3) this.fillBag(); // Garante fila mínima
        const type = this.queue.shift(); // Pega primeira peça da fila
        if (this.bag.length) this.queue.push(this.bag.shift()); // Reabastece fila
        const matrix = this.cloneMatrix(SHAPES[type]); // Matriz da peça
        const color = COLORS[type]; // Cor da peça
        const x = Math.floor((COLS - matrix[0].length)/2); // Posição X central
        const y = -this.spawnOffset(matrix); // Posição Y considerando linhas vazias no topo
        this.active = { type, matrix, color, x, y }; // Define peça ativa
        this.holdLocked = false; // Desbloqueia hold

        if (this.collides(this.active, this.grid)) { // Checa colisão inicial
            this.finish(); // Se colidir, fim de jogo
        }

        this.updatePanels(); // Atualiza HUD
    }

    spawnOffset(matrix) {
        // Remove linhas vazias no topo da peça
        let empty = 0;
        for (let r=0; r<matrix.length; r++) {
            if (matrix[r].every(v => v===0)) empty++;
            else break;
        }
        return empty; // Retorna número de linhas vazias
    }

    cloneMatrix(m) { return m.map(row => row.slice()); } // Copia matriz sem referência

    rotate(matrix, dir) {
        // Rotaciona matriz: CW ou CCW
        const M = matrix.length, N = matrix[0].length;
        let res = Array.from({length: N}, () => Array(M).fill(0)); // Nova matriz
        for (let r=0; r<M; r++) for (let c=0; c<N; c++) res[c][M-1-r] = matrix[r][c]; // Transposta + reverso
        return dir > 0 ? res : this.rotate(this.rotate(this.rotate(matrix, 1), 1), 1); // CCW = 3x CW
    }

    collides(piece, grid) {
        // Verifica colisão da peça com grid ou bordas
        const {matrix, x, y} = piece;
        for (let r=0; r<matrix.length; r++) {
            for (let c=0; c<matrix[0].length; c++) {
                if (!matrix[r][c]) continue;
                const nx = x + c;
                const ny = y + r;
                if (nx < 0 || nx >= COLS || ny >= ROWS) return true; // Colisão com borda
                if (ny >= 0 && grid[ny][nx] !== EMPTY) return true; // Colisão com outra peça
            }
        }
        return false; // Sem colisão
    }

    merge(piece) {
        // Mescla peça na grade
        const {matrix, x, y, color} = piece;
        for (let r=0; r<matrix.length; r++) {
            for (let c=0; c<matrix[0].length; c++) {
                if (matrix[r][c]) {
                    const ny = y + r;
                    if (ny >= 0) this.grid[ny][x + c] = color; // Coloca cor no grid
                }
            }
        }
    }

    sweep() {
        // Remove linhas completas
        let cleared = 0;
        outer: for (let r = ROWS - 1; r >= 0; r--) {
            for (let c=0; c<COLS; c++) if (this.grid[r][c] === EMPTY) { continue outer; } // Se célula vazia, continua
            const row = this.grid.splice(r, 1)[0].fill(EMPTY); // Remove linha cheia
            this.grid.unshift(row); // Adiciona no topo
            cleared++;
            r++; // Recheca linha após unshift
        }
        if (cleared) {
            this.lines += cleared; // Atualiza linhas
            const base = [0, 100, 300, 500, 800][cleared]; // Pontuação base
            this.score += base * this.level; // Aplica pontuação

            const newLevel = 1 + Math.floor(this.lines / 10); // Calcula novo nível
            if (newLevel !== this.level) {
                this.level = newLevel; // Atualiza nível
                this.dropInterval = this.levelToInterval(this.level); // Atualiza intervalo
            }
            this.updatePanels(); // Atualiza HUD
        }
    }

        hardDrop() {
        // Queda instantânea da peça
        let cells = 0;
        while (!this.collides({...this.active, y: this.active.y + 1}, this.grid)) {
            this.active.y++; cells++; // Move pra baixo até colidir
        }
        this.score += cells * 2; // Bonus de hard drop
        this.lockPiece(); // Trava peça na grade
    }

    softDrop() {
        // Queda suave da peça
        if (!this.collides({...this.active, y: this.active.y + 1}, this.grid)) {
            this.active.y++; this.score += 1; // Move e pontua
        } else {
            this.lockPiece(); // Trava peça se colidir
        }
        this.updatePanels(); // Atualiza HUD
    }

    move(dir) {
        // Move horizontalmente (-1=esq, 1=dir)
        const nx = this.active.x + dir;
        if (!this.collides({...this.active, x: nx}, this.grid)) {
            this.active.x = nx; // Aplica movimento se sem colisão
        }
    }

    rotateActive(dir) {
        // Rotaciona peça ativa
        const rotated = this.rotate(this.active.matrix, dir);
        let test = {...this.active, matrix: rotated};
        const kicks = [0, -1, 1, -2, 2]; // Tentativas de "wall kick"
        for (let dx of kicks) {
            if (!this.collides({...test, x: this.active.x + dx}, this.grid)) {
                this.active.matrix = rotated;
                this.active.x += dx; // Aplica rotação
                return;
            }
        }
    }

    hold() {
        // Guarda peça em hold
        if (this.holdLocked) return; // Só 1 hold por peça
        this.holdLocked = true;
        const currentType = this.active.type;
        if (!this.holdPiece) {
            this.holdPiece = currentType; // Guarda peça e gera nova
            this.spawn();
        } else {
            const temp = this.holdPiece;
            this.holdPiece = currentType;
            this.active = { type: temp, matrix: this.cloneMatrix(SHAPES[temp]), color: COLORS[temp],
                            x: Math.floor((COLS - SHAPES[temp][0].length)/2), y: -this.spawnOffset(SHAPES[temp]) };
            if (this.collides(this.active, this.grid)) this.finish(); // Fim se colidir
        }
        this.drawHold(); // Atualiza canvas hold
    }

    lockPiece() {
        // Trava peça ativa na grade
        this.merge(this.active);
        this.sweep(); // Limpa linhas completas
        this.spawn(); // Gera nova peça
    }

    pauseToMenu() {
        // Para o loop de animação do jogo
        cancelAnimationFrame(this.loopId);

        // Remove os controles do jogo, para que Espaço, Setas, etc. não funcionem fora da tela de jogo
        document.removeEventListener("keydown", this.handleKeyDown);

        // Mostra a tela de menu
        showScreen("menu");
    }

    finish() {
        // Finaliza jogo
        this.gameOver = true;
        cancelAnimationFrame(this.loopId);
        document.removeEventListener('keydown', this.handleKeyDown);
        const key = `tetris_highscore_${currentUser || 'guest'}`;
        const prev = parseInt(localStorage.getItem(key) || '0', 10);
        if (this.score > prev) localStorage.setItem(key, String(this.score));

        document.getElementById('score-user').textContent = currentUser ? `Player: ${currentUser}` : 'Player: Guest';
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('high-score').textContent = localStorage.getItem(key) || '0';

        showScreen('score-screen'); // Mostra tela de pontuação final
    }

onKeyDown(e) {
    // Só deixa rodar controles do jogo se a tela de jogo estiver ativa
    const jogoAtivo = document.getElementById("jogo").classList.contains("active");
    if (!jogoAtivo) return;

    if (this.gameOver) return; 

    switch(e.key) {
        case 'ArrowLeft': if(!this.paused) this.move(-1); break;
        case 'ArrowRight': if(!this.paused) this.move(1); break;
        case 'ArrowDown': if(!this.paused) this.softDrop(); break;
        case 'ArrowUp': if(!this.paused) this.rotateActive(1); break;
        case 'x': case 'X': if(!this.paused) this.rotateActive(1); break;
        case 'z': case 'Z': if(!this.paused) this.rotateActive(-1); break;
        case ' ': e.preventDefault(); if(!this.paused) this.hardDrop(); break;
        case 'c': case 'C': if(!this.paused) this.hold(); break;
        case 'p': case 'P':
            this.paused = !this.paused;
            document.getElementById("pause-screen").style.display = this.paused ? "flex" : "none";
            if (!this.paused) { 
                this.lastTime = 0; 
                this.loopId = requestAnimationFrame(this.update.bind(this)); 
            } else { 
                cancelAnimationFrame(this.loopId); 
            }
            break;
        case 'Escape': this.pauseToMenu(); break;
    }
    this.drawAll();
}

    updatePanels() {
        // Atualiza HUD e miniaturas
        this.scoreEl.textContent = `SCORE: ${this.score}`;
        this.levelEl.textContent = `LEVEL: ${this.level}`;
        this.linesEl.textContent = `LINES: ${this.lines}`;
        this.drawNext(); this.drawHold();
    }

    update(time = 0) {
        const delta = time - this.lastTime;
        this.lastTime = time;

        if (!this.paused && !this.gameOver) {
            this.dropCounter += delta;
            if (this.dropCounter > this.dropInterval) {
                this.dropCounter = 0;
                if (!this.collides({ ...this.active, y: this.active.y + 1 }, this.grid)) {
                    this.active.y++;
                } else {
                    this.lockPiece();
                }
            }

            // ======= CHECAGEM INSANE =======
            const elapsed = elapsedBeforePause + (Date.now() - startTime);
            const minutes = Math.floor(elapsed / 60000);
            if (this.score >= 200000 || minutes >= 40) {
                cancelAnimationFrame(this.loopId);
                document.removeEventListener("keydown", this.handleKeyDown);
                stopTimer(); // pausa o cronômetro
                showScreen("insane-screen");
                return; // Sai do update
            }
            // ===============================

            this.drawAll();
            this.loopId = requestAnimationFrame(this.update.bind(this));
        }
    }



    /* ======= Desenho ======= */
    clearBoard() {
        // Limpa canvas principal
        this.bctx.fillStyle = '#111';
        this.bctx.fillRect(0,0,this.boardCanvas.width, this.boardCanvas.height);
    }

    drawCell(ctx, x, y, size, color) {
        // Desenha célula
        ctx.fillStyle = color;
        ctx.fillRect(x, y, size, size);
        // Borda/shine
        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x+1, y+1, size-2, size-2);
    }

    drawGrid() {
        // Desenha todas as células do tabuleiro
        const size = this.boardCanvas.width / COLS;
        for (let r=0; r<ROWS; r++) {
            for (let c=0; c<COLS; c++) {
                const val = this.grid[r][c];
                if (val !== EMPTY) this.drawCell(this.bctx, c*size, r*size, size, val);
            }
        }
    }

    drawPiece(piece, ghost=false) {
        // Desenha peça ativa
        const size = this.boardCanvas.width / COLS;
        let {matrix, x, y, color} = piece;

        if (ghost) { // Desenha sombra
            let gy = y;
            while (!this.collides({...piece, y: gy + 1}, this.grid)) gy++;
            this.bctx.globalAlpha = 0.25;
            for (let r=0; r<matrix.length; r++)
                for (let c=0; c<matrix[0].length; c++)
                    if (matrix[r][c]) this.drawCell(this.bctx, (x+c)*size, (gy+r)*size, size, color);
            this.bctx.globalAlpha = 1;
        }

        for (let r=0; r<matrix.length; r++) {
            for (let c=0; c<matrix[0].length; c++) {
                if (matrix[r][c]) this.drawCell(this.bctx, (x+c)*size, (y+r)*size, size, color);
            }
        }
    }

    drawNext() {
        // Desenha miniatura da próxima peça
        this.nctx.fillStyle = '#111'; this.nctx.fillRect(0,0,this.nextCanvas.width,this.nextCanvas.height);
        const nextType = this.queue[0];
        if (!nextType) return;
        this.drawMini(this.nctx, SHAPES[nextType], COLORS[nextType]);
    }

    drawHold() {
        // Desenha miniatura da peça em hold
        this.hctx.fillStyle = '#111'; this.hctx.fillRect(0,0,this.holdCanvas.width,this.holdCanvas.height);
        if (!this.holdPiece) return;
        this.drawMini(this.hctx, SHAPES[this.holdPiece], COLORS[this.holdPiece]);
    }

    drawMini(ctx, matrix, color) {
        // Desenha miniatura centralizada
        const cell = 28;
        const offsetX = (this.nextCanvas.width - (cell * matrix[0].length)) / 2;
        const offsetY = (this.nextCanvas.height - (cell * matrix.length)) / 2;
        for (let r=0; r<matrix.length; r++) {
            for (let c=0; c<matrix[0].length; c++) {
                if (matrix[r][c]) this.drawCell(ctx, offsetX + c*cell, offsetY + r*cell, cell, color);
            }
        }
    }

    drawAll() {
        // Desenha tudo no tabuleiro
        this.clearBoard();
        this.drawGrid();
        if (this.active) {
            this.drawPiece(this.active, true); // Sombra
            this.drawPiece(this.active, false); // Peça ativa
        }
    }
}


function startGame() {
    if (game) {
        cancelAnimationFrame(game.loopId);
        document.removeEventListener("keydown", game.handleKeyDown);
    }

    game = new Game();
    document.addEventListener("keydown", game.handleKeyDown);

    // Inicia o cronômetro
    stopTimer();
    startTimer();
}

Game.prototype.pauseToMenu = function() {
    cancelAnimationFrame(this.loopId);
    document.removeEventListener("keydown", this.handleKeyDown);
    stopTimer(); // Para cronômetro
    showScreen("menu");
    }


function restartGame() {
    // Reinicia o jogo
    showScreen('jogo'); // Mostra tela do jogo
    startGame();         // Chama startGame() para reiniciar
}

/* Ajuste responsivo do canvas principal (mantém proporção 10x20) */
function resizeBoard() {
    const board = document.getElementById('board');
    // Define altura máxima como 80% da tela ou 800px
    const maxH = Math.min(window.innerHeight * 0.8, 800);
    const h = Math.floor(maxH / 20) * 20; // Ajusta múltiplo de 20 linhas
    const w = Math.floor(h / 2);          // Mantém proporção 10x20
    board.height = h;
    board.width = w;
    document.documentElement.style.setProperty('--cell', (w/10) + 'px'); // Atualiza variável CSS
    if (game) game.drawAll(); // Redesenha tabuleiro se jogo ativo
}
window.addEventListener('resize', resizeBoard); // Chama ao redimensionar janela
resizeBoard(); // Inicializa tamanho correto

// Tecla ESCAPE para voltar ao login
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        const menuScreen = document.getElementById("menu");
        if (menuScreen.classList.contains("active")) { // Se estiver no menu
            showScreen("login"); // Volta para tela de login
            currentUser = null; // Limpa usuário atual
            document.getElementById("hud-username").style.display = "none"; // Esconde nome no topo
            showNotification("Você voltou para a tela de login!"); // Notificação
        }
    }
});

// Tecla ENTER para confirmar ações nas telas
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const cadastroAtivo = document.getElementById("cadastro").classList.contains("active");
        const loginAtivo = document.getElementById("login").classList.contains("active");
        const menuAtivo = document.getElementById("menu").classList.contains("active");

        if (cadastroAtivo) {
            cadastrar(); // Chama função de cadastro
        } else if (loginAtivo) {
            logar(); // Chama função de login
        } else if (menuAtivo) {
            startFromMenu(); // Inicia o jogo a partir do menu
        }
    }
});
