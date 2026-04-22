// Cursor Tracker
const grid = document.querySelector(".xo");
document.addEventListener("mousemove", (e) => {
  if(grid) {
    grid.style.setProperty("--x", e.x + "px");
    grid.style.setProperty("--y", e.y + "px");
  }
});

// --- SEGURIDAD: Bloqueos de Copia e Inspección ---
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
    if(e.key === 'F12' || 
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || 
      (e.ctrlKey && e.key === 'U') || 
      (e.ctrlKey && e.key === 'S')) {
        e.preventDefault();
        return false;
    }
});
document.addEventListener('selectstart', e => e.preventDefault());
document.addEventListener('dragstart', e => e.preventDefault());
// --- FIN SEGURIDAD ---

// Setup Settings
let isPvE = false;
let p1Name = "Jugador 1";
let p2Name = "Jugador 2";
let p1Symbol = "<b>⨯</b>";
let p2Symbol = "<i>⭘</i>";
let currentTurn = 1; // 1 for P1, 2 for P2
let board = Array(9).fill("");
let isGameOver = false;

const modal = document.getElementById('setup-modal');
const btnPvP = document.getElementById('btn-pvp');
const btnPvE = document.getElementById('btn-pve');
const inputP1 = document.getElementById('p1-name');
const inputP2 = document.getElementById('p2-name');
const btnSymX = document.getElementById('btn-sym-x');
const btnSymO = document.getElementById('btn-sym-o');
const btnStart = document.getElementById('btn-start-game');

btnPvP.addEventListener('click', () => {
    isPvE = false;
    btnPvP.classList.add('active');
    btnPvE.classList.remove('active');
    inputP2.value = "Jugador 2";
    inputP2.disabled = false;
});
btnPvE.addEventListener('click', () => {
    isPvE = true;
    btnPvE.classList.add('active');
    btnPvP.classList.remove('active');
    inputP2.value = "AlexanderGames (IA)";
    inputP2.disabled = true;
});

btnSymX.addEventListener('click', () => {
    p1Symbol = "<b>⨯</b>";
    p2Symbol = "<i>⭘</i>";
    btnSymX.classList.add('active');
    btnSymO.classList.remove('active');
});
btnSymO.addEventListener('click', () => {
    p1Symbol = "<i>⭘</i>";
    p2Symbol = "<b>⨯</b>";
    btnSymO.classList.add('active');
    btnSymX.classList.remove('active');
});

// Update DOM turn display
const turnDisplay = document.getElementById('turn-display');
const turnText = turnDisplay.querySelector('span');

function updateTurnText() {
    if(isGameOver) return;
    if(currentTurn === 1) {
        turnText.innerHTML = `${p1Symbol} Turno de <strong>${p1Name}</strong>`;
        grid.classList.remove("player-2s-turn");
    } else {
        turnText.innerHTML = `${p2Symbol} Turno de <strong>${p2Name}</strong>`;
        grid.classList.add("player-2s-turn");
    }
}

btnStart.addEventListener('click', () => {
    p1Name = inputP1.value.trim() || "Jugador 1";
    p2Name = inputP2.value.trim() || (isPvE ? "AlexanderGames" : "Jugador 2");
    modal.style.display = "none";
    document.getElementById("game-subtitle").innerText = isPvE ? "(VS AlexanderGames)" : "(2 players)";
    currentTurn = 1;
    resetGame();
});

// Game Logic
const checkWin = (b) => {
    const lines = [
        [0,1,2], [3,4,5], [6,7,8], // Rows
        [0,3,6], [1,4,7], [2,5,8], // Cols
        [0,4,8], [2,4,6]           // Diags
    ];
    for (let line of lines) {
        if (b[line[0]] && b[line[0]] === b[line[1]] && b[line[0]] === b[line[2]]) {
            return b[line[0]];
        }
    }
    if (!b.includes("")) return "DRAW";
    return null;
};

// Simple Logic for AI
function getBestMove(b) {
    // Attempt to win
    for (let i = 0; i < 9; i++) {
        if (b[i] === "") {
            b[i] = p2Symbol;
            if (checkWin(b) === p2Symbol) { b[i] = ""; return i; }
            b[i] = "";
        }
    }
    // Block player 1
    for (let i = 0; i < 9; i++) {
        if (b[i] === "") {
            b[i] = p1Symbol;
            if (checkWin(b) === p1Symbol) { b[i] = ""; return i; }
            b[i] = "";
        }
    }
    // Play center
    if (b[4] === "") return 4;
    // Play corners
    const corners = [0,2,6,8];
    for(let c of corners) if(b[c] === "") return c;
    // Random fallback
    const available = b.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);
    return available[Math.floor(Math.random() * available.length)];
}

const cells = document.querySelectorAll(".xo td");

function handleMove(index, symbol) {
    if(board[index] !== "" || isGameOver) return;
    board[index] = symbol;
    cells[index].innerHTML = symbol;
    
    let winner = checkWin(board);
    if(winner) {
        endGame(winner);
        return;
    }
    
    currentTurn = currentTurn === 1 ? 2 : 1;
    updateTurnText();

    if(isPvE && currentTurn === 2) {
        setTimeout(() => {
            const aiMove = getBestMove(board);
            if(aiMove !== undefined) handleMove(aiMove, p2Symbol);
        }, 500); // slight delay for feel
    }
}

/* Synth Sound Generator for the Win */
function playWinSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const frequencies = [523.25, 659.25, 783.99, 1046.50]; // Acorde C Major ascendente
        let startTime = audioCtx.currentTime;
        
        frequencies.forEach((freq) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle'; 
            osc.frequency.setValueAtTime(freq, startTime);
            
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start(startTime);
            osc.stop(startTime + 0.3);
            startTime += 0.1;
        });
    } catch(e) { console.log("Sonido bloqueado temporalmente por el navegador"); }
}

function endGame(winner) {
    isGameOver = true;
    grid.classList.add("disabled");
    const winDisplay = document.getElementById("win-display");
    const winText = document.getElementById("win-text");
    const pyro = document.querySelector(".pyro");
    
    turnDisplay.style.display = "none";
    winDisplay.style.display = "block";

    if(winner === "DRAW") {
        winText.innerHTML = "🤝 ¡Fue un Empate!";
        document.querySelector(".reset-btn .reset").style.display = "inline";
    } else {
        const winName = winner === p1Symbol ? p1Name : p2Name;
        winText.innerHTML = `🎉 ¡${winName} gana!`;
        if(pyro) pyro.classList.add("active");
        
        // Pantalla Flotante
        const overlay = document.getElementById("winner-overlay");
        if(overlay) {
            document.getElementById("winner-name-big").innerText = `¡${winName.toUpperCase()} GANA!`;
            overlay.classList.add("active");
            playWinSound(); // 🎶 Arpegio de victoria
            
            // Ocultar a los 3 segundos
            setTimeout(() => {
                overlay.classList.remove("active");
            }, 3000);
        }

        document.querySelector(".reset-btn .new-game").style.display = "inline";
        document.querySelector(".reset-btn .reset").style.display = "none";
    }
}

function resetGame() {
    board = Array(9).fill("");
    isGameOver = false;
    currentTurn = 1;
    cells.forEach(c => c.innerHTML = ""); // remove all content (no &nbsp; needed)
    grid.classList.remove("disabled");
    grid.classList.remove("player-2s-turn");
    document.getElementById("win-display").style.display = "none";
    turnDisplay.style.display = "flex";
    const pyro = document.querySelector(".pyro");
    if(pyro) pyro.classList.remove("active");
    
    document.querySelector(".reset-btn .new-game").style.display = "none";
    document.querySelector(".reset-btn .reset").style.display = "inline";
    
    updateTurnText();
}

cells.forEach((cell, index) => {
    cell.addEventListener("click", () => {
        if(currentTurn === 1) {
            handleMove(index, p1Symbol);
        } else if (!isPvE) {
            handleMove(index, p2Symbol);
        }
    });
});

document.querySelector(".reset-btn")?.addEventListener("click", resetGame);

// init theme picker
const initialTheme = localStorage.getItem('theme') ?? "dark"; 
if (initialTheme) {
  const el = document.documentElement;
  if (initialTheme === "light dark") el.style.colorScheme = "light dark";
  else if (initialTheme === "light") el.style.colorScheme = "light";
  else el.style.colorScheme = "dark";
}

const checkbox = document.getElementById('checkbox');
if (checkbox) {
    if (initialTheme === "light") checkbox.checked = true;
    checkbox.addEventListener('change', (e) => {
        const el = document.documentElement;
        if (e.target.checked) {
            el.style.colorScheme = "light";
            localStorage.setItem('theme', 'light');
        } else {
            el.style.colorScheme = "dark";
            localStorage.setItem('theme', 'dark');
        }
    });
}
