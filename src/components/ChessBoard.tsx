import React, { useState } from 'react';
import { Chess, Square, PieceSymbol, Color } from 'chess.js';
import { ChessPiece } from './ChessPiece';
import { BoardTheme, PromotionState, MoveClassification, CLASSIFICATION_META } from '../utils/types';

interface ChessBoardProps {
  game: Chess;
  boardTheme: BoardTheme;
  flipped: boolean;
  disabled: boolean;
  lastMove: { from: Square; to: Square } | null;
  lastMoveClassification?: MoveClassification;
  highlightSquares?: Square[];
  onMakeMove: (from: Square, to: Square, promotion?: PieceSymbol) => boolean;
  onInitiatePromotion: (promo: PromotionState) => void;
  showAllSquareLabels?: boolean;
  targetStars?: Square[];
  onSquareClickOverride?: (sq: Square) => void;
  onSquareHover?: (sq: Square | null) => void;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  game,
  boardTheme,
  flipped,
  disabled,
  lastMove,
  lastMoveClassification,
  highlightSquares = [],
  onMakeMove,
  onInitiatePromotion,
  showAllSquareLabels = false,
  targetStars = [],
  onSquareClickOverride,
  onSquareHover,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [draggedSquare, setDraggedSquare] = useState<Square | null>(null);
  const [rightClickedSquares, setRightClickedSquares] = useState<Square[]>([]);

  const handleRightClick = (squareName: Square) => {
    setRightClickedSquares((prev) =>
      prev.includes(squareName) ? prev.filter((s) => s !== squareName) : [...prev, squareName]
    );
  };

  const board = game.board();

  // Find king square if in check
  let checkSquare: Square | null = null;
  if (game.inCheck()) {
    const turn = game.turn();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === turn) {
          const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
          checkSquare = `${files[c]}${8 - r}` as Square;
        }
      }
    }
  }

  // Get legal move targets for a given square
  const getMovesForSquare = (sq: Square): Square[] => {
    const moves = game.moves({ square: sq, verbose: true });
    return moves.map((m) => m.to as Square);
  };

  const handleSquareClick = (squareName: Square) => {
    if (disabled) return;

    if (rightClickedSquares.length > 0) {
      setRightClickedSquares([]);
    }

    if (onSquareClickOverride) {
      onSquareClickOverride(squareName);
      return;
    }

    // If already selected, try to move to clicked square
    if (selectedSquare) {
      if (selectedSquare === squareName) {
        // Deselect
        setSelectedSquare(null);
        setValidMoves([]);
        return;
      }

      if (validMoves.includes(squareName)) {
        // Check for promotion
        const piece = game.get(selectedSquare);
        if (
          piece &&
          piece.type === 'p' &&
          ((piece.color === 'w' && squareName.endsWith('8')) ||
            (piece.color === 'b' && squareName.endsWith('1')))
        ) {
          onInitiatePromotion({
            isOpen: true,
            from: selectedSquare,
            to: squareName,
            color: piece.color,
          });
          setSelectedSquare(null);
          setValidMoves([]);
          return;
        }

        // Regular move
        const moved = onMakeMove(selectedSquare, squareName);
        if (moved) {
          setSelectedSquare(null);
          setValidMoves([]);
          return;
        }
      }
    }

    // Try selecting piece on clicked square
    const piece = game.get(squareName);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(squareName);
      setValidMoves(getMovesForSquare(squareName));
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, sq: Square) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    const piece = game.get(sq);
    if (!piece || piece.color !== game.turn()) {
      e.preventDefault();
      return;
    }

    setDraggedSquare(sq);
    setSelectedSquare(sq);
    setValidMoves(getMovesForSquare(sq));
    e.dataTransfer.setData('text/plain', sq);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetSquare: Square) => {
    e.preventDefault();
    if (disabled || !draggedSquare) return;

    if (validMoves.includes(targetSquare)) {
      const piece = game.get(draggedSquare);
      if (
        piece &&
        piece.type === 'p' &&
        ((piece.color === 'w' && targetSquare.endsWith('8')) ||
          (piece.color === 'b' && targetSquare.endsWith('1')))
      ) {
        onInitiatePromotion({
          isOpen: true,
          from: draggedSquare,
          to: targetSquare,
          color: piece.color,
        });
      } else {
        onMakeMove(draggedSquare, targetSquare);
      }
    }

    setDraggedSquare(null);
    setSelectedSquare(null);
    setValidMoves([]);
  };

  // Ranks (0-7 for White top to bottom, files 0-7)
  const ranks = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const files = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const fileChars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  const isNeon = boardTheme.id === 'neon';
  const isChessGuy = boardTheme.id === 'chessguy';

  return (
    <div
      className={`relative select-none aspect-square w-full mx-auto transition-all duration-300 ${
        isNeon
          ? 'p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-cyan-400/90 shadow-[0_0_35px_rgba(6,182,212,0.65),0_0_80px_rgba(217,70,239,0.35)] ring-2 sm:ring-4 ring-fuchsia-500/50 bg-slate-950'
          : isChessGuy
          ? 'p-[3px] sm:p-1 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#9B7530] via-[#F6E6B8] to-[#8F6826] shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_20px_rgba(212,175,55,0.25)]'
          : 'p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-slate-800/80 bg-slate-900 shadow-2xl'
      }`}
    >
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded-[9px] sm:rounded-[12px] overflow-hidden">
        {ranks.map((r, rowIdx) =>
          files.map((c, colIdx) => {
            const squareName = `${fileChars[c]}${8 - r}` as Square;
            const piece = board[r][c];
            const isLightSquare = (r + c) % 2 === 0;

            const isSelected = selectedSquare === squareName;
            const isValidMove = validMoves.includes(squareName);
            const isLastMoveSquare =
              lastMove && (lastMove.from === squareName || lastMove.to === squareName);
            const isCheckSquare = checkSquare === squareName;

            // Background color logic
            let bgStyle = isLightSquare ? boardTheme.lightSquare : boardTheme.darkSquare;
            if (isLastMoveSquare) {
              bgStyle = boardTheme.highlightLastMove;
            }
            if (isSelected) {
              bgStyle = boardTheme.highlightSelect;
            }

            // Coordinate labels
            const showRank = colIdx === 0;
            const showFile = rowIdx === 7;

            const isRightClicked = rightClickedSquares.includes(squareName);

            return (
              <div
                key={squareName}
                onClick={() => handleSquareClick(squareName)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleRightClick(squareName);
                }}
                onMouseEnter={() => onSquareHover?.(squareName)}
                onMouseLeave={() => onSquareHover?.(null)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, squareName)}
                style={{ backgroundColor: bgStyle }}
                className={`relative flex items-center justify-center transition-colors duration-150 cursor-pointer ${
                  isNeon ? 'border-[0.5px] border-cyan-500/10' : ''
                } ${
                  isCheckSquare
                    ? isNeon
                      ? 'ring-4 ring-inset ring-rose-500 shadow-[inset_0_0_25px_#f43f5e,0_0_25px_#f43f5e] animate-pulse'
                      : 'ring-4 ring-inset ring-rose-600/90 shadow-[inset_0_0_20px_rgba(225,29,72,0.6)] animate-pulse'
                    : isSelected && isNeon
                    ? 'ring-2 ring-inset ring-fuchsia-400 shadow-[inset_0_0_20px_rgba(217,70,239,0.5),0_0_15px_rgba(217,70,239,0.4)]'
                    : isLastMoveSquare && isNeon
                    ? 'ring-2 ring-inset ring-cyan-400/70 shadow-[inset_0_0_15px_rgba(6,182,212,0.4)]'
                    : ''
                }`}
              >
                {/* Right-click Tactical Highlight */}
                {isRightClicked && (
                  <div className="absolute inset-0 bg-amber-500/35 border-2 border-amber-400/80 pointer-events-none z-10 animate-fade-in" />
                )}
                {/* File & Rank labels */}
                {showRank && (
                  <span
                    className={`absolute top-0.5 left-1 text-[10px] sm:text-[11px] font-bold pointer-events-none select-none z-10 ${
                      isNeon
                        ? 'text-cyan-300 font-mono drop-shadow-[0_0_6px_rgba(6,182,212,0.9)]'
                        : isChessGuy
                        ? isLightSquare
                          ? 'text-[#4A3B2C] font-bold drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]'
                          : 'text-[#D4AF37] font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]'
                        : isLightSquare
                        ? 'text-slate-700/75'
                        : 'text-slate-100/75'
                    }`}
                  >
                    {8 - r}
                  </span>
                )}
                {showFile && (
                  <span
                    className={`absolute bottom-0.5 right-1 text-[10px] sm:text-[11px] font-bold pointer-events-none select-none z-10 ${
                      isNeon
                        ? 'text-fuchsia-300 font-mono drop-shadow-[0_0_6px_rgba(217,70,239,0.9)]'
                        : isChessGuy
                        ? isLightSquare
                          ? 'text-[#4A3B2C] font-bold drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]'
                          : 'text-[#D4AF37] font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]'
                        : isLightSquare
                        ? 'text-slate-700/75'
                        : 'text-slate-100/75'
                    }`}
                  >
                    {fileChars[c]}
                  </span>
                )}

                {/* Kid's Learning: Show All Square Labels (e.g. a7, b2, c8) */}
                {showAllSquareLabels && (
                  <span
                    className={`absolute top-0.5 right-1 text-[10px] font-mono font-black pointer-events-none select-none tracking-tight ${
                      isNeon
                        ? 'text-cyan-300/80 drop-shadow-[0_0_4px_#06b6d4]'
                        : isLightSquare
                        ? 'text-slate-700/70'
                        : 'text-amber-200/80'
                    }`}
                  >
                    {squareName}
                  </span>
                )}

                {/* Target Stars for Practice / Coordinate Drill */}
                {targetStars.includes(squareName) && !piece && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none animate-bounce z-10">
                    <span className={`text-2xl select-none ${isNeon ? 'drop-shadow-[0_0_15px_rgba(251,191,36,0.9)]' : 'drop-shadow-md'}`}>⭐</span>
                    <span className="text-[9px] font-mono font-black text-amber-300 bg-slate-950/90 px-1 py-0.5 rounded border border-amber-400/50 shadow">
                      {squareName}
                    </span>
                  </div>
                )}
                {targetStars.includes(squareName) && piece && (
                  <div className="absolute inset-1 rounded-xl border-2 border-dashed border-amber-400 pointer-events-none animate-pulse z-10" />
                )}

                {/* Piece */}
                {piece && (
                  <div
                    draggable={!disabled && piece.color === game.turn()}
                    onDragStart={(e) => handleDragStart(e, squareName)}
                    className={`w-[86%] h-[86%] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-0 ${
                      piece.color === game.turn() && !disabled ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                    } ${
                      isNeon
                        ? piece.color === 'w'
                          ? 'filter drop-shadow-[0_0_6px_rgba(6,182,212,0.95)] drop-shadow-[0_0_16px_rgba(34,211,238,0.5)]'
                          : 'filter drop-shadow-[0_0_6px_rgba(217,70,239,0.95)] drop-shadow-[0_0_16px_rgba(168,85,247,0.5)]'
                        : ''
                    }`}
                  >
                    <ChessPiece type={piece.type} color={piece.color} isGolden={isChessGuy} />
                  </div>
                )}

                {/* Legal move marker */}
                {isValidMove && !piece && (
                  <div
                    className={`absolute rounded-full pointer-events-none transition-all duration-200 ${
                      isNeon
                        ? 'w-4 h-4 bg-cyan-400 ring-2 ring-white shadow-[0_0_15px_#06b6d4,0_0_25px_#22d3ee] animate-pulse'
                        : isChessGuy
                        ? 'w-3.5 h-3.5 sm:w-4 sm:h-4 bg-gradient-to-tr from-[#9B7A38] via-[#FDF5D2] to-[#D4AF37] ring-2 ring-black/70 shadow-[0_2px_6px_rgba(0,0,0,0.8)]'
                        : 'w-3.5 h-3.5 sm:w-4 sm:h-4 bg-slate-900/40 ring-2 ring-white/60 shadow-sm'
                    }`}
                  />
                )}

                {/* Capture marker */}
                {isValidMove && piece && (
                  <div
                    className={`absolute inset-1 rounded-full pointer-events-none transition-transform duration-200 animate-pulse ${
                      isNeon
                        ? 'border-4 border-fuchsia-500 shadow-[0_0_15px_#d946ef,inset_0_0_12px_#d946ef] ring-2 ring-cyan-400/60'
                        : isChessGuy
                        ? 'border-4 border-[#D4AF37] shadow-[0_0_14px_rgba(212,175,55,0.7)] ring-2 ring-black/70'
                        : 'border-4 border-rose-500/80 bg-rose-500/10'
                    }`}
                  />
                )}

                {/* Smart Tactical Highlight / Hint Squares */}
                {highlightSquares && highlightSquares.includes(squareName) && (
                  <div className="absolute inset-0.5 rounded-lg ring-4 ring-amber-400 bg-amber-400/25 pointer-events-none animate-pulse z-15 shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
                )}

                {/* Step / Move Status Badge on last moved piece square */}
                {lastMove && lastMove.to === squareName && lastMoveClassification && (
                  <div
                    className={`absolute -top-1.5 -right-1.5 z-20 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full shadow-lg border text-[10px] font-bold pointer-events-none select-none transition-all ${
                      CLASSIFICATION_META[lastMoveClassification]?.badge || 'bg-slate-900 text-white'
                    }`}
                  >
                    <span className="text-xs leading-none">{CLASSIFICATION_META[lastMoveClassification]?.icon}</span>
                    <span className="text-[8.5px] uppercase font-mono font-black tracking-tight leading-none hidden sm:inline">
                      {CLASSIFICATION_META[lastMoveClassification]?.shortLabel || CLASSIFICATION_META[lastMoveClassification]?.label}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
