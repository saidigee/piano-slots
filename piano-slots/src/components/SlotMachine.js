import React, { useState, useEffect, useRef } from 'react';

const SYMBOLS = [
  { id: 'piano', color: '#FFD700', text: '🎹' },
  { id: 'violin', color: '#FFD700', text: '🎻' },
  { id: 'saxophone', color: '#FFD700', text: '🎷' },
  { id: 'electric-guitar', color: '#FFD700', text: '🎸' },
  { id: 'drums', color: '#FFD700', text: '🥁' },
  { id: 'trumpet', color: '#FFD700', text: '🎺' },
  { id: 'microphone', color: '#FFD700', text: '🎤' }
];

const GRID_CONFIG = {
  cellSize: 80,
  padding: 10,
  rows: 3,
  cols: 3,
  spinDuration: 3000
};

const SlotMachine = () => {
  const canvasRef = useRef(null);
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(10);
  const [spinning, setSpinning] = useState(false);
  const [winningLine, setWinningLine] = useState(null);
  const gridRef = useRef(Array(9).fill(SYMBOLS[0]));
  const startTimeRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const drawCell = (x, y, symbol, highlight = false) => {
      const cellX = x * GRID_CONFIG.cellSize + GRID_CONFIG.padding;
      const cellY = y * GRID_CONFIG.cellSize + GRID_CONFIG.padding;
      
      // Draw cell background
      ctx.fillStyle = highlight ? '#4B5563' : '#374151';
      ctx.fillRect(cellX, cellY, GRID_CONFIG.cellSize - 2 * GRID_CONFIG.padding, 
                  GRID_CONFIG.cellSize - 2 * GRID_CONFIG.padding);
      
      // Draw symbol
      ctx.fillStyle = symbol.color;
      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        symbol.text, 
        cellX + (GRID_CONFIG.cellSize - 2 * GRID_CONFIG.padding) / 2, 
        cellY + (GRID_CONFIG.cellSize - 2 * GRID_CONFIG.padding) / 2
      );
    };

    const animate = (timestamp) => {
      if (!startTimeRef.current && spinning) {
        startTimeRef.current = timestamp;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      for (let row = 0; row < GRID_CONFIG.rows; row++) {
        for (let col = 0; col < GRID_CONFIG.cols; col++) {
          const index = row * GRID_CONFIG.cols + col;
          const highlight = winningLine === row;
          
          if (spinning) {
            const elapsed = timestamp - startTimeRef.current;
            const progress = Math.min(elapsed / GRID_CONFIG.spinDuration, 1);
            const delayOffset = col * 0.2;
            const colProgress = Math.max(0, Math.min(1, (progress - delayOffset) / 0.8));
            
            if (colProgress < 1) {
              const randomSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
              drawCell(col, row, randomSymbol, false);
            } else {
              drawCell(col, row, gridRef.current[index], highlight);
            }
          } else {
            drawCell(col, row, gridRef.current[index], highlight);
          }
        }
      }

      // Draw winning line
      if (winningLine !== null && !spinning) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        const y = winningLine * GRID_CONFIG.cellSize + GRID_CONFIG.cellSize / 2;
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      if (spinning && timestamp - startTimeRef.current < GRID_CONFIG.spinDuration) {
        requestAnimationFrame(animate);
      } else if (spinning) {
        setSpinning(false);
        startTimeRef.current = null;
        checkWin();
      } else {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [spinning, winningLine]);

  const spin = () => {
    if (spinning || balance < bet) return;
    
    setSpinning(true);
    setWinningLine(null);
    setBalance(prev => prev - bet);

    gridRef.current = Array(9).fill().map((_, index) => {
      const row = Math.floor(index / 3);
      if (index % 3 !== 0 && Math.random() < 0.8) {
        return gridRef.current[row * 3];
      }
      return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    });
  };

  const checkWin = () => {
    // Check only middle row (row 1) for wins
    const middleRowSymbols = gridRef.current.slice(3, 6);
    if (middleRowSymbols.every(s => s.id === middleRowSymbols[0].id)) {
      setWinningLine(1);
      setBalance(prev => prev + bet * 3);
    }
  };

  return (
    <div className="flex flex-col items-center bg-gray-900 p-8 rounded-lg gap-6">
      <div className="text-yellow-400 text-xl">Balance: ${balance}</div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <button 
          onClick={() => setBet(prev => Math.max(prev - 10, 10))}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-500"
          disabled={spinning}
        >
          Bet -
        </button>
        <button 
          onClick={() => setBet(prev => Math.min(prev + 10, 100))}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-500"
          disabled={spinning}
        >
          Bet +
        </button>
      </div>
      
      <div className="text-yellow-400 mb-4">Current Bet: ${bet}</div>

      <canvas 
        ref={canvasRef}
        width={240}
        height={240}
        className="bg-gray-800 rounded-lg border-2 border-yellow-600"
      />

      <button
        onClick={spin}
        disabled={spinning || balance < bet}
        className={`px-8 py-3 rounded-full text-white text-lg font-bold
          ${spinning || balance < bet ? 'bg-gray-600' : 'bg-yellow-600 hover:bg-yellow-500'}`}
      >
        {spinning ? 'Spinning...' : 'Spin'}
      </button>

      <div className="relative flex mt-8">
        {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map((note, i) => (
          <div
            key={i}
            className="relative bg-white h-32 w-8 border border-gray-300 hover:bg-gray-100"
          />
        ))}
        {['C#', 'D#', 'F#', 'G#', 'A#'].map((note, i) => (
          <div
            key={`black-${i}`}
            className="absolute bg-gray-900 h-24 w-6 hover:bg-gray-800"
            style={{ left: `${24 + (i < 2 ? i * 32 : (i + 1) * 32)}px` }}
          />
        ))}
      </div>
    </div>
  );
};

export default SlotMachine;