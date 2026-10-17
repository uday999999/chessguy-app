import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Chess, Square, PieceSymbol, Color } from 'chess.js';
import { ChessPiece } from './ChessPiece';
import { BoardThemeId, GameMode, THEMES } from '../utils/types';
import {
  Sparkles,
  RotateCcw,
  Trash2,
  Copy,
  Check,
  Bot,
  Users,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Shield,
  Layers,
  HelpCircle,
  X,
  Play,
} from 'lucide-react';

interface CustomBoardSetupProps {
  themeId: BoardThemeId;
  initialFen?: string;
  onPlayVsAI: (fen: string) => void;
  onPlayWithCoach: (fen: string) => void;
  onPlayInPerson: (fen: string) => void;
  onExit: () => void;
}

type BoardSquareMap = Partial<Record<Square, { type: PieceSymbol; color: Color }>>;

interface SetupPreset {
  id: string;
  name: string;
  category: 'endgame' | 'tactics' | 'handicap';
  description: string;
  fen: string;
}

const PRESET_POSITIONS: SetupPreset[] = [
  // Endgames
  {
    id: 'lucena',
    name: 'Lucena Position',
    category: 'endgame',
    description: 'The fundamental winning rook & pawn endgame bridge-building technique.',
    fen: '1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1',
  },
  {
    id: 'philidor',
    name: 'Philidor Position',
    category: 'endgame',
    description: 'The golden drawing defense in rook and pawn endgames.',
    fen: '3k4/R7/8/3K4/8/8/8/5r2 b - - 0 1',
  },
  {
    id: 'kp_opposition',
    name: 'King & Pawn Opposition',
    category: 'endgame',
    description: 'Master key squares and direct vertical opposition.',
    fen: '8/8/4k3/8/4P3/4K3/8/8 w - - 0 1',
  },
  {
    id: 'queen_mate',
    name: 'Queen & King Checkmate',
    category: 'endgame',
    description: 'Practice boxing the lone enemy king into the edge of the board.',
    fen: '8/8/8/4k3/8/8/8/4K1Q1 w - - 0 1',
  },
  {
    id: 'rook_mate',
    name: 'Rook & King Checkmate',
    category: 'endgame',
    description: 'Practice the classic waiting move and cut-off with lone rook.',
    fen: '8/8/8/4k3/8/8/8/4K1R1 w - - 0 1',
  },
  {
    id: 'two_bishops',
    name: 'Two Bishops Checkmate',
    category: 'endgame',
    description: 'Guide two coordinated bishops to herd the enemy king to a corner.',
    fen: '8/8/8/4k3/8/8/8/2BBK3 w - - 0 1',
  },

  // Tactical / Traps
  {
    id: 'greek_gift',
    name: 'Greek Gift Sacrifice (Bxh7+)',
    category: 'tactics',
    description: 'Classic Bxh7+ kingside breakthrough attacking position.',
    fen: 'r1bq1rk1/ppp2ppp/2n1pn2/3p4/2PP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 1',
  },
  {
    id: 'smothered_mate',
    name: 'Smothered Mate Net',
    category: 'tactics',
    description: 'Trapped enemy king ready for a knight fork and smothered checkmate.',
    fen: '6k1/5ppp/8/8/8/8/4QPPP/5BNK w - - 0 1',
  },
  {
    id: 'fried_liver',
    name: 'Fried Liver Attack',
    category: 'tactics',
    description: 'Aggressive Nxf7 sacrifice position in the Two Knights Italian game.',
    fen: 'r1bqkb1r/ppp2ppp/2n5/3np1N1/2B5/8/PPPP1PPP/RNBQK2R w KQkq - 0 6',
  },
  {
    id: 'legals_mate',
    name: "Legal's Mate Trap",
    category: 'tactics',
    description: 'Queen sacrifice leading to checkmate by three minor pieces.',
    fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 5',
  },

  // Handicap
  {
    id: 'queen_odds',
    name: 'Queen Odds (White gives Queen)',
    category: 'handicap',
    description: 'Play without White Queen: ultimate handicap challenge!',
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR w KQkq - 0 1',
  },
  {
    id: 'rook_odds',
    name: 'Rook Odds (White gives a1 Rook)',
    category: 'handicap',
    description: 'Play without White a1 rook.',
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/1NBQKBNR w Kkq - 0 1',
  },
];

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'] as const;

export const CustomBoardSetup: React.FC<CustomBoardSetupProps> = ({
  themeId,
  initialFen,
  onPlayVsAI,
  onPlayWithCoach,
  onPlayInPerson,
  onExit,
}) => {
  // Board state as square-to-piece map
  const [boardMap, setBoardMap] = useState<BoardSquareMap>(() => {
    const map: BoardSquareMap = {};
    try {
      const chess = new Chess(initialFen || undefined);
      for (const file of FILES) {
        for (const rank of RANKS) {
          const sq = `${file}${rank}` as Square;
          const piece = chess.get(sq);
          if (piece) {
            map[sq] = { type: piece.type, color: piece.color };
          }
        }
      }
    } catch {
      // default starting board
      const chess = new Chess();
      for (const file of FILES) {
        for (const rank of RANKS) {
          const sq = `${file}${rank}` as Square;
          const piece = chess.get(sq);
          if (piece) {
            map[sq] = { type: piece.type, color: piece.color };
          }
        }
      }
    }
    return map;
  });

  // Turn to move: 'w' or 'b'
  const [turn, setTurn] = useState<Color>('w');

  // Castling rights
  const [whiteKingsideCastle, setWhiteKingsideCastle] = useState<boolean>(true);
  const [whiteQueensideCastle, setWhiteQueensideCastle] = useState<boolean>(true);
  const [blackKingsideCastle, setBlackKingsideCastle] = useState<boolean>(true);
  const [blackQueensideCastle, setBlackQueensideCastle] = useState<boolean>(true);

  // Selected tool from palette: piece or 'eraser' or null (pointer)
  const [selectedTool, setSelectedTool] = useState<{ type: PieceSymbol; color: Color } | 'eraser' | null>(null);

  // Dragging state
  const [draggedPiece, setDraggedPiece] = useState<{ type: PieceSymbol; color: Color } | null>(null);

  // FEN input box state
  const [inputFen, setInputFen] = useState<string>('');
  const [fenError, setFenError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Selected preset tab
  const [presetCategory, setPresetCategory] = useState<'endgame' | 'tactics' | 'handicap'>('endgame');

  // Generate FEN from boardMap + settings
  const generatedFen = useMemo(() => {
    let piecePlacement = '';
    for (let r = 0; r < 8; r++) {
      const rank = RANKS[r];
      let emptyCount = 0;
      for (let f = 0; f < 8; f++) {
        const file = FILES[f];
        const sq = `${file}${rank}` as Square;
        const p = boardMap[sq];
        if (p) {
          if (emptyCount > 0) {
            piecePlacement += emptyCount;
            emptyCount = 0;
          }
          const letter = p.color === 'w' ? p.type.toUpperCase() : p.type.toLowerCase();
          piecePlacement += letter;
        } else {
          emptyCount++;
        }
      }
      if (emptyCount > 0) {
        piecePlacement += emptyCount;
      }
      if (r < 7) {
        piecePlacement += '/';
      }
    }

    // Castling part
    let castling = '';
    if (whiteKingsideCastle) castling += 'K';
    if (whiteQueensideCastle) castling += 'Q';
    if (blackKingsideCastle) castling += 'k';
    if (blackQueensideCastle) castling += 'q';
    if (!castling) castling = '-';

    return `${piecePlacement} ${turn} ${castling} - 0 1`;
  }, [boardMap, turn, whiteKingsideCastle, whiteQueensideCastle, blackKingsideCastle, blackQueensideCastle]);

  // Sync inputFen when generatedFen changes
  useEffect(() => {
    setInputFen(generatedFen);
  }, [generatedFen]);

  // Validate current position with chess.js
  const validation = useMemo(() => {
    // Count kings
    let whiteKings = 0;
    let blackKings = 0;
    let invalidPawns = 0;

    for (const [sq, piece] of Object.entries(boardMap)) {
      if (piece) {
        if (piece.type === 'k') {
          if (piece.color === 'w') whiteKings++;
          else blackKings++;
        }
        if (piece.type === 'p') {
          const rank = sq[1];
          if (rank === '1' || rank === '8') {
            invalidPawns++;
          }
        }
      }
    }

    if (whiteKings !== 1) {
      return {
        isValid: false,
        message: whiteKings === 0 ? 'Position requires 1 White King' : 'Position has too many White Kings',
      };
    }
    if (blackKings !== 1) {
      return {
        isValid: false,
        message: blackKings === 0 ? 'Position requires 1 Black King' : 'Position has too many Black Kings',
      };
    }
    if (invalidPawns > 0) {
      return {
        isValid: false,
        message: 'Pawns cannot be placed on the 1st or 8th rank',
      };
    }

    try {
      const testChess = new Chess(generatedFen);
      // Check if side NOT to move is in check (illegal in chess)
      return {
        isValid: true,
        message: 'Legal position ready to play!',
      };
    } catch (err: any) {
      return {
        isValid: false,
        message: err?.message || 'Invalid position according to chess rules',
      };
    }
  }, [boardMap, generatedFen]);

  // Square Click Handler
  const handleSquareClick = (sq: Square) => {
    setFenError(null);
    if (selectedTool === 'eraser') {
      setBoardMap((prev) => {
        const next = { ...prev };
        delete next[sq];
        return next;
      });
    } else if (selectedTool) {
      // Stamp selected piece
      setBoardMap((prev) => ({
        ...prev,
        [sq]: { type: selectedTool.type, color: selectedTool.color },
      }));
    } else {
      // If square has piece and no tool is active, pick it up or remove it
      if (boardMap[sq]) {
        setSelectedTool({ type: boardMap[sq]!.type, color: boardMap[sq]!.color });
        setBoardMap((prev) => {
          const next = { ...prev };
          delete next[sq];
          return next;
        });
      }
    }
  };

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, piece: { type: PieceSymbol; color: Color }, originSq?: Square) => {
    setDraggedPiece(piece);
    e.dataTransfer.setData('text/plain', JSON.stringify({ piece, originSq }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnSquare = (e: React.DragEvent, targetSq: Square) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;
    try {
      const parsed = JSON.parse(data);
      const piece = parsed.piece;
      const originSq = parsed.originSq;

      setBoardMap((prev) => {
        const next = { ...prev };
        if (originSq && originSq !== targetSq) {
          delete next[originSq as Square];
        }
        next[targetSq] = piece;
        return next;
      });
    } catch {
      // ignore
    }
    setDraggedPiece(null);
  };

  // Clear Board Action
  const handleClearBoard = () => {
    setBoardMap({});
    setWhiteKingsideCastle(false);
    setWhiteQueensideCastle(false);
    setBlackKingsideCastle(false);
    setBlackQueensideCastle(false);
  };

  // Reset to Standard Start
  const handleResetStandard = () => {
    const chess = new Chess();
    const map: BoardSquareMap = {};
    for (const file of FILES) {
      for (const rank of RANKS) {
        const sq = `${file}${rank}` as Square;
        const piece = chess.get(sq);
        if (piece) {
          map[sq] = { type: piece.type, color: piece.color };
        }
      }
    }
    setBoardMap(map);
    setTurn('w');
    setWhiteKingsideCastle(true);
    setWhiteQueensideCastle(true);
    setBlackKingsideCastle(true);
    setBlackQueensideCastle(true);
  };

  // Clear except kings
  const handleOnlyKings = () => {
    setBoardMap({
      e1: { type: 'k', color: 'w' },
      e8: { type: 'k', color: 'b' },
    });
    setWhiteKingsideCastle(false);
    setWhiteQueensideCastle(false);
    setBlackKingsideCastle(false);
    setBlackQueensideCastle(false);
  };

  // Load Preset
  const handleLoadPreset = (preset: SetupPreset) => {
    try {
      const chess = new Chess(preset.fen);
      const map: BoardSquareMap = {};
      for (const file of FILES) {
        for (const rank of RANKS) {
          const sq = `${file}${rank}` as Square;
          const piece = chess.get(sq);
          if (piece) {
            map[sq] = { type: piece.type, color: piece.color };
          }
        }
      }
      setBoardMap(map);
      setTurn(chess.turn());
      // Check castling flags from FEN
      const parts = preset.fen.split(' ');
      const castlingStr = parts[2] || '-';
      setWhiteKingsideCastle(castlingStr.includes('K'));
      setWhiteQueensideCastle(castlingStr.includes('Q'));
      setBlackKingsideCastle(castlingStr.includes('k'));
      setBlackQueensideCastle(castlingStr.includes('q'));
      setFenError(null);
    } catch (err: any) {
      setFenError('Could not load preset: ' + err.message);
    }
  };

  // Load custom FEN typed or pasted
  const handleLoadCustomFen = () => {
    try {
      const trimmed = inputFen.trim();
      const chess = new Chess(trimmed);
      const map: BoardSquareMap = {};
      for (const file of FILES) {
        for (const rank of RANKS) {
          const sq = `${file}${rank}` as Square;
          const piece = chess.get(sq);
          if (piece) {
            map[sq] = { type: piece.type, color: piece.color };
          }
        }
      }
      setBoardMap(map);
      setTurn(chess.turn());
      const parts = trimmed.split(' ');
      const castlingStr = parts[2] || '-';
      setWhiteKingsideCastle(castlingStr.includes('K'));
      setWhiteQueensideCastle(castlingStr.includes('Q'));
      setBlackKingsideCastle(castlingStr.includes('k'));
      setBlackQueensideCastle(castlingStr.includes('q'));
      setFenError(null);
    } catch (err: any) {
      setFenError('Invalid FEN format: ' + err.message);
    }
  };

  // Copy FEN to clipboard
  const handleCopyFen = () => {
    navigator.clipboard.writeText(generatedFen);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTheme = THEMES[themeId] || THEMES.classic;

  return (
    <div className="w-full max-w-6xl mx-auto p-2 sm:p-4 space-y-4 animate-fade-in">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20 text-white font-bold">
            🛠️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white">Custom Board Setup</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Position Editor
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Set up any custom position, pick endgame presets, paste FEN, and play against AI or Coach Viktor.
            </p>
          </div>
        </div>

        <button
          onClick={onExit}
          className="self-end sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer"
        >
          <X className="w-4 h-4" />
          <span>Exit Setup</span>
        </button>
      </div>

      {/* Unified Centered Studio Layout: Board at top -> Piece Palette -> Setup Controls & Play -> Presets & FEN */}
      <div className="w-full max-w-[500px] mx-auto flex flex-col items-center gap-3.5">
        {/* Interactive Chess Board (Top) */}
        <div className="w-full aspect-square rounded-2xl overflow-hidden border-2 border-slate-800 p-1 bg-slate-900 shadow-2xl relative select-none">
            <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded-xl overflow-hidden">
              {RANKS.map((rank, rIdx) =>
                FILES.map((file, fIdx) => {
                  const sq = `${file}${rank}` as Square;
                  const piece = boardMap[sq];
                  const isLight = (rIdx + fIdx) % 2 === 0;
                  const sqColor = isLight ? currentTheme.lightSquare : currentTheme.darkSquare;

                  return (
                    <div
                      key={sq}
                      onClick={() => handleSquareClick(sq)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDropOnSquare(e, sq)}
                      style={{ backgroundColor: sqColor }}
                      className="relative flex items-center justify-center cursor-pointer transition hover:brightness-110 active:brightness-95"
                    >
                      {/* Rank Label on first file (a) */}
                      {fIdx === 0 && (
                        <span
                          className={`absolute top-0.5 left-1 text-[9px] font-bold font-mono select-none pointer-events-none ${
                            isLight ? 'text-slate-600' : 'text-slate-300'
                          }`}
                        >
                          {rank}
                        </span>
                      )}

                      {/* File Label on bottom rank (1) */}
                      {rIdx === 7 && (
                        <span
                          className={`absolute bottom-0.5 right-1 text-[9px] font-bold font-mono select-none pointer-events-none ${
                            isLight ? 'text-slate-600' : 'text-slate-300'
                          }`}
                        >
                          {file}
                        </span>
                      )}

                      {/* Piece Icon */}
                      {piece && (
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, piece, sq)}
                          className="w-full h-full p-1 flex items-center justify-center"
                        >
                          <ChessPiece type={piece.type} color={piece.color} className="w-full h-full" isGolden={themeId === 'chessguy'} />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Piece Palette Under the Chess Board */}
          <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-lg space-y-2">
            <div className="flex items-center justify-between px-1 text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                Piece Palette:
              </span>
              <span className="text-[11px] text-slate-400">
                {selectedTool === 'eraser'
                  ? '🗑️ Eraser Active (Tap square to delete)'
                  : selectedTool
                  ? `Selected: ${selectedTool.color === 'w' ? 'White' : 'Black'} ${selectedTool.type.toUpperCase()}`
                  : 'Tap piece to stamp, or drag directly onto board'}
              </span>
            </div>

            {/* White Pieces */}
            <div className="flex items-center justify-between gap-1 p-1 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 px-1.5">White</span>
              <div className="flex gap-1">
                {(['k', 'q', 'r', 'b', 'n', 'p'] as PieceSymbol[]).map((type) => {
                  const isSelected = selectedTool && selectedTool !== 'eraser' && selectedTool.type === type && selectedTool.color === 'w';
                  return (
                    <button
                      key={'w-' + type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, { type, color: 'w' })}
                      onClick={() => setSelectedTool(isSelected ? null : { type, color: 'w' })}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center p-1 transition cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/25 border-2 border-amber-400 ring-2 ring-amber-400/40 shadow-md scale-105'
                          : 'bg-slate-900 border border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                      title={`Select White ${type.toUpperCase()}`}
                    >
                      <ChessPiece type={type} color="w" className="w-7 h-7 sm:w-8 sm:h-8" isGolden={themeId === 'chessguy'} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Black Pieces */}
            <div className="flex items-center justify-between gap-1 p-1 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 px-1.5">Black</span>
              <div className="flex gap-1">
                {(['k', 'q', 'r', 'b', 'n', 'p'] as PieceSymbol[]).map((type) => {
                  const isSelected = selectedTool && selectedTool !== 'eraser' && selectedTool.type === type && selectedTool.color === 'b';
                  return (
                    <button
                      key={'b-' + type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, { type, color: 'b' })}
                      onClick={() => setSelectedTool(isSelected ? null : { type, color: 'b' })}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center p-1 transition cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/25 border-2 border-amber-400 ring-2 ring-amber-400/40 shadow-md scale-105'
                          : 'bg-slate-900 border border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                      title={`Select Black ${type.toUpperCase()}`}
                    >
                      <ChessPiece type={type} color="b" className="w-7 h-7 sm:w-8 sm:h-8" isGolden={themeId === 'chessguy'} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Board Quick Clean Actions */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              <button
                onClick={() => setSelectedTool(selectedTool === 'eraser' ? null : 'eraser')}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1 cursor-pointer ${
                  selectedTool === 'eraser'
                    ? 'bg-rose-500/30 border-rose-400 text-rose-200 ring-1 ring-rose-400'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-rose-300 hover:border-rose-800/60'
                }`}
                title="Tap squares to remove pieces"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eraser</span>
              </button>

              <button
                onClick={handleResetStandard}
                className="py-1.5 px-2 rounded-xl text-xs font-bold bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition flex items-center justify-center gap-1 cursor-pointer"
                title="Reset to initial 32-piece starting position"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Start Pos</span>
              </button>

              <button
                onClick={handleOnlyKings}
                className="py-1.5 px-2 rounded-xl text-xs font-bold bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition flex items-center justify-center gap-1 cursor-pointer"
                title="Keep only Kings on e1 and e8"
              >
                <span>👑 Kings Only</span>
              </button>

              <button
                onClick={handleClearBoard}
                className="py-1.5 px-2 rounded-xl text-xs font-bold bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-rose-400 hover:border-rose-800/60 transition flex items-center justify-center gap-1 cursor-pointer"
                title="Clear all pieces from the board"
              >
                <span>🧹 Clear</span>
              </button>
            </div>
          </div>

        {/* Setup Controls & Play Panel (Shifted directly below chessboard and piece palette) */}
        <div className="w-full flex flex-col gap-3">
          {/* 1. Validation Banner & Play Buttons */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-3">
            {/* Status Indicator */}
            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
                validation.isValid
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
              }`}
            >
              {validation.isValid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{validation.message}</span>
            </div>

            {/* Launch Game Actions */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Play From This Position:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => validation.isValid && onPlayVsAI(generatedFen)}
                  disabled={!validation.isValid}
                  className="py-2.5 px-1.5 sm:px-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:pointer-events-none text-slate-950 text-xs font-black transition-all shadow-md shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Bot className="w-4 h-4 shrink-0" />
                  <span className="truncate">Play vs AI</span>
                </button>

                <button
                  onClick={() => validation.isValid && onPlayWithCoach(generatedFen)}
                  disabled={!validation.isValid}
                  className="py-2.5 px-1.5 sm:px-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-bold transition-all shadow-md shadow-purple-500/20 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="shrink-0 text-sm">🧙‍♂️</span>
                  <span className="truncate">Play Coach</span>
                </button>

                <button
                  onClick={() => validation.isValid && onPlayInPerson(generatedFen)}
                  disabled={!validation.isValid}
                  className="py-2.5 px-1.5 sm:px-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-200 text-xs font-bold transition-all border border-slate-700 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Users className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="truncate">In Person</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. Turn to Move & Castling Rights */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-3 text-xs">
            {/* Side to Move */}
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300">Turn to Move:</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setTurn('w')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border font-bold transition cursor-pointer ${
                    turn === 'w'
                      ? 'bg-slate-100 text-slate-900 border-white shadow-sm ring-2 ring-emerald-400/30'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400" />
                  <span>White</span>
                </button>
                <button
                  onClick={() => setTurn('b')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border font-bold transition cursor-pointer ${
                    turn === 'b'
                      ? 'bg-slate-950 text-slate-100 border-slate-600 shadow-sm ring-2 ring-emerald-400/30'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-600" />
                  <span>Black</span>
                </button>
              </div>
            </div>

            {/* Castling Rights */}
            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">
                Castling Availability:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <label className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer hover:bg-slate-800/50">
                  <input
                    type="checkbox"
                    checked={whiteKingsideCastle}
                    onChange={(e) => setWhiteKingsideCastle(e.target.checked)}
                    className="accent-emerald-500 rounded"
                  />
                  <span className="text-[11px] text-slate-300 font-medium whitespace-nowrap">White O-O</span>
                </label>
                <label className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer hover:bg-slate-800/50">
                  <input
                    type="checkbox"
                    checked={whiteQueensideCastle}
                    onChange={(e) => setWhiteQueensideCastle(e.target.checked)}
                    className="accent-emerald-500 rounded"
                  />
                  <span className="text-[11px] text-slate-300 font-medium whitespace-nowrap">White O-O-O</span>
                </label>
                <label className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer hover:bg-slate-800/50">
                  <input
                    type="checkbox"
                    checked={blackKingsideCastle}
                    onChange={(e) => setBlackKingsideCastle(e.target.checked)}
                    className="accent-emerald-500 rounded"
                  />
                  <span className="text-[11px] text-slate-300 font-medium whitespace-nowrap">Black O-O</span>
                </label>
                <label className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer hover:bg-slate-800/50">
                  <input
                    type="checkbox"
                    checked={blackQueensideCastle}
                    onChange={(e) => setBlackQueensideCastle(e.target.checked)}
                    className="accent-emerald-500 rounded"
                  />
                  <span className="text-[11px] text-slate-300 font-medium whitespace-nowrap">Black O-O-O</span>
                </label>
              </div>
            </div>
          </div>

          {/* 3. Preset Positions Library */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                Setup Presets Library
              </span>
              {/* Category tabs */}
              <div className="flex gap-1">
                {(['endgame', 'tactics', 'handicap'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPresetCategory(cat)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize transition cursor-pointer ${
                      presetCategory === cat
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar pr-1">
              {PRESET_POSITIONS.filter((p) => p.category === presetCategory).map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleLoadPreset(preset)}
                  className="p-2 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-white text-xs group-hover:text-cyan-300 transition">
                      {preset.name}
                    </div>
                    <div className="text-[10px] text-slate-400 leading-tight truncate">
                      {preset.description}
                    </div>
                  </div>
                  <button className="px-2 py-1 rounded-lg bg-slate-800 group-hover:bg-cyan-500 group-hover:text-slate-950 text-slate-300 text-[10px] font-bold transition shrink-0">
                    Load
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 4. FEN Import & Export Bar */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300">FEN String:</span>
              <button
                onClick={handleCopyFen}
                className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-bold transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy FEN'}</span>
              </button>
            </div>

            <div className="flex gap-1.5">
              <input
                type="text"
                value={inputFen}
                onChange={(e) => setInputFen(e.target.value)}
                placeholder="Paste any FEN string..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleLoadCustomFen}
                className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold transition shadow-sm active:scale-95 cursor-pointer shrink-0"
              >
                Load
              </button>
            </div>

            {fenError && (
              <div className="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 rounded-lg">
                {fenError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
