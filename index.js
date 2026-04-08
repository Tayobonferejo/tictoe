        let board = Array(9).fill(null);
        let currentPlayer = 'X';
        let gameActive = true;
        let scores = { X: 0, O: 0, draw: 0 };
        let gameMode = '2p'; // '2p' or 'ai'
        let winningCombination = null;

        const statusDiv = document.getElementById('status');
        const boardDiv = document.getElementById('board');
        const resetBtn = document.getElementById('resetBtn');
        const resetScoreBtn = document.getElementById('resetScoreBtn');
        const scoreXEl = document.getElementById('scoreX');
        const scoreOEl = document.getElementById('scoreO');
        const scoreDrawEl = document.getElementById('scoreDraw');

        // Winning combinations
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6]              // diagonals
        ];

        // Create the board UI
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

        // Check for winner
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

        // Check if board is full
        function isBoardFull() {
            return board.every(cell => cell !== null);
        }

        // Highlight winning cells
        function highlightWinningCells() {
            if (winningCombination) {
                const cells = document.querySelectorAll('.cell');
                winningCombination.forEach(index => {
                    cells[index].classList.add('winning-cell');
                });
            }
        }

        // Update scores display
        function updateScoresDisplay() {
            scoreXEl.textContent = scores.X;
            scoreOEl.textContent = scores.O;
            scoreDrawEl.textContent = scores.draw;
        }

        // End game
        function endGame(winner) {
            gameActive = false;
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

        // Reset game (keep scores)
        function resetGame() {
            board = Array(9).fill(null);
            currentPlayer = 'X';
            gameActive = true;
            winningCombination = null;
            statusDiv.textContent = `Player ${currentPlayer}'s turn`;
            createBoard();
            
            // If AI starts and it's AI's turn in AI mode
            if (gameMode === 'ai' && currentPlayer === 'O') {
                setTimeout(aiMove, 100);
            }
        }

        // Reset scores
        function resetScores() {
            scores = { X: 0, O: 0, draw: 0 };
            updateScoresDisplay();
            resetGame();
        }

        // Make a move
        function makeMove(index) {
            if (!gameActive || board[index] !== null) return;
            
            // In AI mode, prevent human from playing when it's AI's turn
            if (gameMode === 'ai' && currentPlayer === 'O') return;

            // Make the move
            board[index] = currentPlayer;
            createBoard();

            // Check win/draw
            const winner = checkWinner();
            if (winner) {
                endGame(winner);
                return;
            }
            
            if (isBoardFull()) {
                endGame(null);
                return;
            }

            // Switch player
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            statusDiv.textContent = `Player ${currentPlayer}'s turn`;

            // AI move if in AI mode and game still active
            if (gameMode === 'ai' && gameActive && currentPlayer === 'O') {
                setTimeout(aiMove, 300);
            }
        }

        // Simple AI: tries to win, block player, or pick random
        function aiMove() {
            if (!gameActive || currentPlayer !== 'O') return;
            
            // 1. Try to win
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = 'O';
                    if (checkWinner() === 'O') {
                        board[i] = null;
                        makeMove(i);
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
                        makeMove(i);
                        return;
                    }
                    board[i] = null;
                }
            }
            
            // 3. Take center if available
            if (board[4] === null) {
                makeMove(4);
                return;
            }
            
            // 4. Take corners
            const corners = [0, 2, 6, 8];
            const availableCorners = corners.filter(i => board[i] === null);
            if (availableCorners.length > 0) {
                const randomCorner = availableCorners[Math.floor(Math.random() * availableCorners.length)];
                makeMove(randomCorner);
                return;
            }
            
            // 5. Take any available edge
            const edges = [1, 3, 5, 7];
            const availableEdges = edges.filter(i => board[i] === null);
            if (availableEdges.length > 0) {
                const randomEdge = availableEdges[Math.floor(Math.random() * availableEdges.length)];
                makeMove(randomEdge);
                return;
            }
        }

        // Change game mode
        function setGameMode(mode) {
            gameMode = mode;
            resetGame();
            
            // Update active button style
            document.querySelectorAll('.mode-btn').forEach(btn => {
                if (btn.dataset.mode === mode) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            statusDiv.textContent = `Player X's turn`;
        }

        // Event listeners
        resetBtn.addEventListener('click', resetGame);
        resetScoreBtn.addEventListener('click', resetScores);
        
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                setGameMode(btn.dataset.mode);
            });
        });

        // Initialize game
        createBoard();
        updateScoresDisplay();