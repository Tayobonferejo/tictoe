
        let board = Array(9).fill(null);
        let currentPlayer = 'X';
        let gameActive = true;
        let scores = { X: 0, O: 0, draw: 0 };
        let gameMode = '2p';
        let winningCombination = null;
        let aiTimeout = null;

        const statusDiv = document.getElementById('status');
        const boardDiv = document.getElementById('board');
        const resetBtn = document.getElementById('resetBtn');
        const resetScoreBtn = document.getElementById('resetScoreBtn');
        const scoreXEl = document.getElementById('scoreX');
        const scoreOEl = document.getElementById('scoreO');
        const scoreDrawEl = document.getElementById('scoreDraw');

        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        function createBoard() {
            boardDiv.innerHTML = '';
            for (let i = 0; i < 9; i++) {
                const cell = document.createElement('button');
                cell.classList.add('cell');
                if (board[i]) {
                    cell.classList.add(board[i]);
                    cell.classList.add('disabled');
                }
                cell.textContent = board[i] || '';
                cell.addEventListener('click', () => makeMove(i));
                boardDiv.appendChild(cell);
            }
        }

        function checkWinner() {
            for (const pattern of winPatterns) {
                const [a, b, c] = pattern;
                if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                    winningCombination = pattern;
                    return board[a];
                }
            }
            return null;
        }

        function isBoardFull() {
            return board.every(cell => cell !== null);
        }

        function highlightWinningCells() {
            if (winningCombination) {
                const cells = document.querySelectorAll('.cell');
                winningCombination.forEach(index => {
                    cells[index].classList.add('winning-cell');
                });
            }
        }

        function updateScoresDisplay() {
            scoreXEl.textContent = scores.X;
            scoreOEl.textContent = scores.O;
            scoreDrawEl.textContent = scores.draw;
        }

        function endGame(winner) {
            gameActive = false;
            if (aiTimeout) {
                clearTimeout(aiTimeout);
                aiTimeout = null;
            }
            if (winner) {
                statusDiv.textContent = `🎉 Player ${winner} wins! 🎉`;
                scores[winner]++;
                updateScoresDisplay();
                highlightWinningCells();
            } else {
                statusDiv.textContent = "🤝 It's a draw! 🤝";
                scores.draw++;
                updateScoresDisplay();
            }
        }

        function resetGame() {
            if (aiTimeout) {
                clearTimeout(aiTimeout);
                aiTimeout = null;
            }
            board = Array(9).fill(null);
            currentPlayer = 'X';
            gameActive = true;
            winningCombination = null;
            statusDiv.textContent = `Player ${currentPlayer}'s turn`;
            createBoard();
            
            if (gameMode === 'ai' && gameActive && currentPlayer === 'O') {
                aiTimeout = setTimeout(aiMove, 200);
            }
        }

        function resetScores() {
            scores = { X: 0, O: 0, draw: 0 };
            updateScoresDisplay();
            resetGame();
        }

        // This is the key fix - separate function for making a move without AI blocking
        function executeMove(index, player) {
            board[index] = player;
            createBoard();
            
            const winner = checkWinner();
            if (winner) {
                endGame(winner);
                return true;
            }
            
            if (isBoardFull()) {
                endGame(null);
                return true;
            }
            
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            statusDiv.textContent = `Player ${currentPlayer}'s turn`;
            return false;
        }

        function makeMove(index) {
            if (!gameActive || board[index] !== null) return;
            
            // Block human from playing during AI's turn
            if (gameMode === 'ai' && currentPlayer === 'O') return;
            
            const gameEnded = executeMove(index, currentPlayer);
            if (gameEnded) return;
            
            // Trigger AI move if it's AI's turn
            if (gameMode === 'ai' && gameActive && currentPlayer === 'O') {
                if (aiTimeout) clearTimeout(aiTimeout);
                aiTimeout = setTimeout(aiMove, 200);
            }
        }

        function aiMove() {
            if (!gameActive || currentPlayer !== 'O') return;
            
            // 1. Try to win
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = 'O';
                    if (checkWinner() === 'O') {
                        board[i] = null;
                        executeMove(i, 'O');
                        return;
                    }
                    board[i] = null;
                }
            }
            
            // 2. Try to block player X
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = 'X';
                    if (checkWinner() === 'X') {
                        board[i] = null;
                        executeMove(i, 'O');
                        return;
                    }
                    board[i] = null;
                }
            }
            
            // 3. Take center
            if (board[4] === null) {
                executeMove(4, 'O');
                return;
            }
            
            // 4. Take corners
            const corners = [0, 2, 6, 8];
            const availableCorners = corners.filter(i => board[i] === null);
            if (availableCorners.length > 0) {
                const randomCorner = availableCorners[Math.floor(Math.random() * availableCorners.length)];
                executeMove(randomCorner, 'O');
                return;
            }
            
            // 5. Take edges
            const edges = [1, 3, 5, 7];
            const availableEdges = edges.filter(i => board[i] === null);
            if (availableEdges.length > 0) {
                const randomEdge = availableEdges[Math.floor(Math.random() * availableEdges.length)];
                executeMove(randomEdge, 'O');
                return;
            }
        }

        function setGameMode(mode) {
            gameMode = mode;
            if (aiTimeout) {
                clearTimeout(aiTimeout);
                aiTimeout = null;
            }
            resetGame();
            
            document.querySelectorAll('.mode-btn').forEach(btn => {
                if (btn.dataset.mode === mode) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }

        resetBtn.addEventListener('click', resetGame);
        resetScoreBtn.addEventListener('click', resetScores);
        
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                setGameMode(btn.dataset.mode);
            });
        });

        createBoard();
        updateScoresDisplay();