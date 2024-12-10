let levels = [];
let currentLevel = 0;
let playerQueens = [];
let timerInterval;
let elapsedTime = 0;
let isDragging = false; 
let dragStartCell = null;

const tab20Colors = ['#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5']

// Load levels
fetch('assets/levels.json')
    .then(response => response.json())
    .then(data => {
        levels = data;
        startGame(currentLevel);
    })
    .catch(error => console.error('Error loading levels:', error));

function startGame(levelIndex) {
    const level = levels[levelIndex];
    if (!level) return;

    playerQueens = new Array(level.grid.length).fill(null); 
    renderChessBoard(level.grid);
    document.getElementById('pre-game').style.display = 'flex';
    updateLevelText();
}

function updateLevelText() {
    document.getElementById('level').textContent = `Level ${currentLevel + 1}`;
}

function startTimer() {
    elapsedTime = 0;
    updateTimerDisplay();

    // Clear any existing timer
    if (timerInterval) clearInterval(timerInterval);

    // Start a new timer
    timerInterval = setInterval(() => {
        elapsedTime++;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    // Stop the timer
    if (timerInterval) clearInterval(timerInterval);
}

function updateTimerDisplay() {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('timer').textContent = formattedTime;
}

function resetTimer() {
    stopTimer();
    elapsedTime = 0;
    updateTimerDisplay();
}

function startGameButton() {
    document.getElementById('pre-game').style.display = 'none';
}

function endGameButton() {
    document.getElementById('pre-game').style.display = 'flex';

    resetTimer(); // Reset timer
}

function renderChessBoard(grid) {
    const chessboard = document.getElementById('chessboard');

    // Set cell size based on overall 450px grid size
    const cellSize = 450 / grid.length;

    chessboard.style.gridTemplateColumns = `repeat(${grid.length},${cellSize}px)`;
    chessboard.style.gridTemplateRows = `repeat(${grid.length},${cellSize}px)`;
    chessboard.innerHTML = ''; // Clear the board
    chessboard.addEventListener('mouseleave', endDrag); // Stop dragging when mouse leaves the board
  
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = i;
        cell.dataset.col = j;
        cell.style.backgroundColor = getColorForQueen(grid[i][j]);
  
        // Add thicker borders where there is a color change
        if (i > 0 && grid[i][j] !== grid[i - 1][j]) {
          cell.classList.add('cell-thicker-top');
        }
        if (j > 0 && grid[i][j] !== grid[i][j - 1]) {
          cell.classList.add('cell-thicker-left');
        }
  
        // For the next cell in the row
        if (i < grid.length - 1 && grid[i][j] !== grid[i + 1][j]) {
          cell.classList.add('cell-thicker-bottom');
        }
        if (j < grid[i].length - 1 && grid[i][j] !== grid[i][j + 1]) {
          cell.classList.add('cell-thicker-right');
        }
  
        // Attach event listeners
        cell.addEventListener('mousedown', (e) => startDrag(i, j, cell));
        cell.addEventListener('mousemove', (e) => dragOver(i, j, cell));
        cell.addEventListener('mouseup', endDrag);
        cell.addEventListener('click', () => toggleQueen(i, j, cell));

        chessboard.appendChild(cell);
      }
    }
  }
  
function getColorForQueen(value) {
    return tab20Colors[value % tab20Colors.length];
}

function checkForQueen(row, col) {
    const index = playerQueens.findIndex((coord) => coord !== null && coord[0] === row && coord[1] === col);
    return [index !== -1, index];
}

function toggleQueen(row, col, cell) {
    const level = levels[currentLevel];

    // Only toggle queen if not currently in drag mode
    if (!isDragging) {
        if (checkForQueen(row, col)[0]) {
        
            const index = checkForQueen(row, col)[1];
            playerQueens[index] = null;

            cell.classList.remove('queen');
            removeQueenSymbol(cell);
            clearInvalidMarks(); 
            updateInvalidCells();
        
        } else if (!cell.classList.contains('invalid')) {
            markInvalidCell(row, col); 

        } else {
            // Get index of the first null element in playerQueens
            const index = playerQueens.findIndex((queenCol) => queenCol === null);
            playerQueens[index] = [row, col];
            
            cell.classList.add('queen');
            addQueenSymbol(cell); 
            updateInvalidCells();
        }
        const conflicts = detectConflicts();
        if (conflicts.length > 0) {
            conflicts.forEach(([conflictRow, conflictCol]) => {
                markConflict(conflictRow, conflictCol);
            });
        } else {
            clearConflicts(); 
        }

        if (checkWin(level.queens)) {
            playerQueens.forEach((coord, index) => {
                if (coord === null) return;
                const cellIndex = coord[0] * level.grid.length + coord[1];
                chessboard.children[cellIndex].querySelector('.queen-symbol').style.filter = 'invert(42%) sepia(93%) saturate(1352%) hue-rotate(20deg) brightness(159%) contrast(119%) drop-shadow(1px 1px 0px rgba(0, 0, 0, 0.4))';
                chessboard.children[cellIndex].querySelector('.queen-symbol').style.rotate = '360deg';
            });
            stopTimer();
            displayPostMessage();
        }
    }
}

function displayPostMessage() {
    document.getElementById('post-game').style.visibility = 'visible';
    document.getElementById('final-time').textContent = 'Completed in ' + document.getElementById('timer').textContent + '!';
}

function removePostMessage() {
    document.getElementById('post-game').style.visibility = 'hidden';
}

function detectConflicts() {
    const conflicts = [];
    const grid = levels[currentLevel].grid;

    playerQueens.forEach((coord, index) => {
        if (coord === null) return;

        const queenRow = coord[0];
        const queenCol = coord[1];

        playerQueens.forEach((otherCoord, otherIndex) => {
            if (otherCoord === null || index === otherIndex) return;
            if (queenRow === otherCoord[0] || queenCol === otherCoord[1]) {
                conflicts.push(otherCoord);
            }
        });

        // Check to see if any queens in immediate diagonals
        const diagonals = [
            [queenRow - 1, queenCol - 1], 
            [queenRow - 1, queenCol + 1], 
            [queenRow + 1, queenCol - 1], 
            [queenRow + 1, queenCol + 1], 
        ];
        diagonals.forEach(([diagonalRow, diagonalCol]) => {
            if (diagonalRow >= 0 && diagonalRow < grid.length && diagonalCol >= 0 && diagonalCol < grid.length) {
                playerQueens.forEach((otherCoord, otherIndex) => {
                    if (otherCoord === null || index === otherIndex) return;
                    if (diagonalRow === otherCoord[0] && diagonalCol === otherCoord[1]) {
                        conflicts.push(otherCoord);
                    }
                });
            }
        });
        
        // Check to see if more than one queen in same color cell
        const queenColor = grid[queenRow][queenCol];
        playerQueens.forEach((otherCoord, otherIndex) => {
            if (otherCoord === null || index === otherIndex) return;
            if (grid[otherCoord[0]][otherCoord[1]] === queenColor) {
                conflicts.push(otherCoord);
            }
        });
    });

    return conflicts;
}

function markConflict(row, col) {
    const chessboard = document.getElementById('chessboard');
    const cellIndex = row * levels[currentLevel].grid.length + col;
    chessboard.children[cellIndex].classList.remove('invalid');
    chessboard.children[cellIndex].classList.add('conflict');
}

function clearConflicts() {
    const chessboard = document.getElementById('chessboard');
    Array.from(chessboard.children).forEach((cell) => cell.classList.remove('conflict'));
}

function startDrag(row, col, cell) {
    isDragging = true;
    dragStartCell = { row, col }; // Save the start position of the drag
    addCross(row, col, cell); // Add a cross to the starting cell
}

function dragOver(row, col, cell) {
    if (isDragging) {
        // Only add cross if the cell is not invalid and doesn't already have a cross
        if (!cell.classList.contains('invalid') && !cell.querySelector('i')) {
            addCross(row, col, cell);
        }
    }
}

function endDrag() {
    isDragging = false; // Reset dragging flag
    dragStartCell = null; // Clear the starting position
}

function addCross(row, col, cell) {
    if (!cell.querySelector('.queen-symbol') && !cell.classList.contains('invalid')) {
        cell.classList.add('invalid-manual');
    }
}

function addQueenSymbol(cell) {
    if (!cell.querySelector('.queen-symbol')) {
       
        // Add icon with crown.svg
        const icon = document.createElement('img');
        icon.src = 'assets/crown.svg';

        icon.style.userSelect = 'none'; 
        icon.style.MozUserSelect = 'none';
        icon.style.msUserSelect = 'none';

        icon.style.width = '80%';
        icon.style.height = '80%';
        icon.classList.add('queen-symbol');

        cell.appendChild(icon);
    }
}

function removeQueenSymbol(cell) {
    const icon = cell.querySelector('.queen-symbol');
    if (icon) {
        icon.remove();
    }
}

function updateInvalidCells() {
    clearInvalidMarks(); // Reset all invalid marks
    const grid = levels[currentLevel].grid;

    playerQueens.forEach((coord, index) => {
        if (coord === null) return;

        const queenRow = coord[0];
        const queenCol = coord[1];

        for (let i = 0; i < grid.length; i++) {
            markInvalidCell(queenRow, i); // Row
            markInvalidCell(i, queenCol); // Column
        }

        // Immediate diagonals
        markInvalidCell(queenRow - 1, queenCol - 1); 
        markInvalidCell(queenRow - 1, queenCol + 1); 
        markInvalidCell(queenRow + 1, queenCol - 1); 
        markInvalidCell(queenRow + 1, queenCol + 1); 

        // Same-color cells
        const queenColor = grid[queenRow][queenCol];
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[row].length; col++) {
                if (grid[row][col] === queenColor) {
                    markInvalidCell(row, col);
                }
            }
        }
        removeInvalidCell(queenRow, queenCol);
    });
}

function removeInvalidCell(row, col) {
    const chessboard = document.getElementById('chessboard');
    const cellIndex = row * levels[currentLevel].grid.length + col;
    chessboard.children[cellIndex].classList.remove('invalid');
    chessboard.children[cellIndex].classList.remove('invalid-manual');
}

function markInvalidCell(row, col) {
    const chessboard = document.getElementById('chessboard');
    const cellIndex = row * levels[currentLevel].grid.length + col;

    if (
        row >= 0 &&
        col >= 0 &&
        row < levels[currentLevel].grid.length &&
        col < levels[currentLevel].grid.length &&
        playerQueens[row] !== col
    ) {
        chessboard.children[cellIndex].classList.add('invalid');
    }
}

function clearInvalidMarks() {
    const chessboard = document.getElementById('chessboard');
    Array.from(chessboard.children).forEach((cell) =>
        cell.classList.remove('invalid')
    );
}

function checkWin(solution) {
    return playerQueens.every((coord, index) => {
        if (coord === null) return false;
        const [row, col] = coord;
        return solution[row] === col;
    });
}

function setTimerWidth() {
    const timer = document.getElementById('timer');
    timer.style.minWidth = `${timer.scrollWidth}px`;
}
setTimerWidth();

document.getElementById('prev-level').addEventListener('click', () => {
    endGameButton();
    removePostMessage();
    if (currentLevel !== 0) {
        currentLevel = (currentLevel - 1) % levels.length;
    }
    startGame(currentLevel);
});

document.getElementById('next-level').addEventListener('click', () => {
    endGameButton();
    removePostMessage();
    
    if (currentLevel !== levels.length - 1) {
        currentLevel = (currentLevel + 1) % levels.length;
    }

    startGame(currentLevel);
});

document.getElementById('start').addEventListener('click', () => {
    if (document.getElementById('pre-game').style.display === 'flex') {
        startGameButton();
        startTimer();
    }
});