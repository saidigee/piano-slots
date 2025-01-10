const SYMBOLS = [
    { id: 'piano', text: '🎹' },
    { id: 'violin', text: '🎻' },
    { id: 'saxophone', text: '🎷' },
    { id: 'electric-guitar', text: '🎸' },
    { id: 'drums', text: '🥁' },
    { id: 'trumpet', text: '🎺' },
    { id: 'microphone', text: '🎤' }
  ];
  
  const SOUNDS = {
    background: new Audio('./sound/background-music.mp3'),
    spin: new Audio('./sound/spin-sound.mp3'),
    win: new Audio('./sound/win-sound.mp3')
  };
  
  // Setup background music to loop
  SOUNDS.background.loop = true;
  
  class SlotMachine {
    constructor() {
      this.canvas = document.createElement('canvas');
      this.canvas.width = 240;
      this.canvas.height = 240;
      this.canvas.className = 'bg-gray-800 rounded-lg border-2 border-yellow-600';
      this.ctx = this.canvas.getContext('2d');
      
      this.balance = 1000;
      this.bet = 10;
      this.spinning = false;
      this.winningLine = null;
      this.grid = Array(9).fill(SYMBOLS[0]);
      this.soundOn = false;
  
      // Setup sounds
      SOUNDS.background.volume = 0.3;
      SOUNDS.spin.volume = 0.5;
      SOUNDS.win.volume = 0.5;
      
      this.setupUI();
      this.draw();
    }
  
    setupUI() {
      const container = document.createElement('div');
      container.className = 'flex flex-col items-center p-8 gap-6';
  
      // Balance display
      const balanceText = document.createElement('div');
      balanceText.className = 'text-yellow-400 text-xl';
      this.updateBalance = () => {
        balanceText.textContent = `Balance: $${this.balance}`;
      };
      this.updateBalance();
      container.appendChild(balanceText);
  
      // Bet controls
      const betControls = document.createElement('div');
      betControls.className = 'grid grid-cols-2 gap-4 mb-4';
      
      const betDisplay = document.createElement('div');
      betDisplay.className = 'text-yellow-400 mb-4 col-span-2';
      this.updateBet = () => {
        betDisplay.textContent = `Current Bet: $${this.bet}`;
      };
      this.updateBet();
  
      const decreaseBet = document.createElement('button');
      decreaseBet.textContent = 'Bet -';
      decreaseBet.className = 'px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-500';
      decreaseBet.onclick = () => {
        if (!this.spinning) {
          this.bet = Math.max(this.bet - 10, 10);
          this.updateBet();
        }
      };
  
      const increaseBet = document.createElement('button');
      increaseBet.textContent = 'Bet +';
      increaseBet.className = 'px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-500';
      increaseBet.onclick = () => {
        if (!this.spinning) {
          this.bet = Math.min(this.bet + 10, 100);
          this.updateBet();
        }
      };
  
      betControls.appendChild(decreaseBet);
      betControls.appendChild(increaseBet);
      betControls.appendChild(betDisplay);
      container.appendChild(betControls);
  
      // Canvas
      container.appendChild(this.canvas);
  
      // Spin button
      const spinButton = document.createElement('button');
      spinButton.className = 'px-8 py-3 rounded-full text-white text-lg font-bold bg-yellow-600 hover:bg-yellow-500';
      this.updateSpinButton = () => {
        spinButton.textContent = this.spinning ? 'Spinning...' : 'Spin';
        spinButton.disabled = this.spinning || this.balance < this.bet;
        spinButton.className = `px-8 py-3 rounded-full text-white text-lg font-bold ${
          this.spinning || this.balance < this.bet ? 'bg-gray-600' : 'bg-yellow-600 hover:bg-yellow-500'
        }`;
      };
      spinButton.onclick = () => this.spin();
      this.updateSpinButton();
      container.appendChild(spinButton);
  
      // Sound toggle button
      const soundButton = document.createElement('button');
      soundButton.className = 'px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-500 mt-4';
      soundButton.textContent = '🔈 Sound Off';
      
      soundButton.onclick = () => {
        this.soundOn = !this.soundOn;
        soundButton.textContent = this.soundOn ? '🔊 Sound On' : '🔈 Sound Off';
        if (this.soundOn) {
          SOUNDS.background.play();
        } else {
          SOUNDS.background.pause();
          SOUNDS.background.currentTime = 0;
        }
      };
      container.appendChild(soundButton);
  
      // Piano keyboard
      const piano = document.createElement('div');
      piano.className = 'relative flex mt-8';
      
      ['C', 'D', 'E', 'F', 'G', 'A', 'B'].forEach((note, i) => {
        const whiteKey = document.createElement('div');
        whiteKey.className = 'relative bg-white h-32 w-8 border border-gray-300 hover:bg-gray-100';
        piano.appendChild(whiteKey);
      });
  
      ['C#', 'D#', 'F#', 'G#', 'A#'].forEach((note, i) => {
        const blackKey = document.createElement('div');
        blackKey.className = 'absolute bg-gray-900 h-24 w-6 hover:bg-gray-800';
        blackKey.style.left = `${24 + (i < 2 ? i * 32 : (i + 1) * 32)}px`;
        piano.appendChild(blackKey);
      });
  
      container.appendChild(piano);
      document.getElementById('app').appendChild(container);
    }
  
    draw() {
      const cellSize = 80;
      const padding = 10;
  
      this.ctx.fillStyle = '#1F2937';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const index = row * 3 + col;
          const x = col * cellSize + padding;
          const y = row * cellSize + padding;
          
          // Cell background
          this.ctx.fillStyle = row === 1 ? '#4B5563' : '#374151';
          this.ctx.fillRect(x, y, cellSize - 2 * padding, cellSize - 2 * padding);
          
          // Symbol
          this.ctx.fillStyle = '#FFD700';
          this.ctx.font = '40px Arial';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText(
            this.grid[index].text,
            x + (cellSize - 2 * padding) / 2,
            y + (cellSize - 2 * padding) / 2
          );
        }
      }
  
      // Draw winning line
      if (this.winningLine !== null && !this.spinning) {
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        const y = this.winningLine * cellSize + cellSize / 2;
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.canvas.width, y);
        this.ctx.stroke();
      }
  
      requestAnimationFrame(() => this.draw());
    }
  
    spin() {
      if (this.spinning || this.balance < this.bet) return;
      
      this.spinning = true;
      this.winningLine = null;
      this.balance -= this.bet;
      this.updateBalance();
      this.updateSpinButton();
  
      if (this.soundOn) {
        SOUNDS.spin.currentTime = 0;
        SOUNDS.spin.play();
      }
  
      let spins = 0;
      const maxSpins = 20;
      const spinInterval = setInterval(() => {
        // During spinning animation, show random symbols
        if (spins < maxSpins - 1) {
          this.grid = Array(9).fill().map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
        } else {
          // For the final result
          // First, randomly select a symbol for the middle row's first position
          const winningSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          
          // 80% chance of winning
          const willWin = Math.random() < 0.8;
  
          this.grid = Array(9).fill().map((_, index) => {
            const row = Math.floor(index / 3);
            const col = index % 3;
            
            // If it's the middle row (row 1)
            if (row === 1) {
              // If we're set to win, make all middle row symbols match
              if (willWin) {
                return winningSymbol;
              }
              // If not winning, only first symbol is guaranteed
              return col === 0 ? winningSymbol : SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            }
            // Other rows are random
            return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          });
        }
  
        spins++;
        if (spins >= maxSpins) {
          clearInterval(spinInterval);
          this.spinning = false;
          this.checkWin();
          this.updateSpinButton();
        }
      }, 100);
    }
  
    checkWin() {
      const middleRow = this.grid.slice(3, 6);
      if (middleRow.every(s => s.id === middleRow[0].id)) {
        this.winningLine = 1;
        this.balance += this.bet * 3;
        this.updateBalance();
        
        if (this.soundOn) {
          SOUNDS.win.currentTime = 0;
          SOUNDS.win.play();
        }
      }
    }
  }
  
  // Start the game
  new SlotMachine();