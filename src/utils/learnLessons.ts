import { Square, PieceSymbol } from 'chess.js';

export type LessonCategory = 'coordinates' | 'pieces' | 'special';

export interface PracticeLesson {
  id: string;
  category: LessonCategory;
  categoryTitle: string;
  title: string;
  subtitle: string;
  avatar: string;
  pieceType?: PieceSymbol;
  piecePoints?: number;
  description: string;
  ruleExplanation: string;
  howItMoves: string[];
  coachTip: string;
  fen: string;
  targetSquares: Square[]; // Stars to collect or destinations to reach
  userColor: 'w' | 'b';
  activePieceSquare?: Square;
  goalText: string;
  isCoordinateDrill?: boolean;
  sampleSquareNames?: string[];
}

export const PRACTICE_LESSONS: PracticeLesson[] = [
  // 1. Coordinates & Square Names Drill
  {
    id: 'coords_intro',
    category: 'coordinates',
    categoryTitle: 'The Board & Coordinates',
    title: 'Square Names & Coordinates',
    subtitle: 'Learn addresses like a7, b2, and c8',
    avatar: '📍',
    description:
      'Every square on the chessboard has an exact address! Just like a street address, each chess square is named with a letter (File) and a number (Rank).',
    ruleExplanation:
      'Files are columns (a, b, c, d, e, f, g, h). Ranks are rows (1, 2, 3, 4, 5, 6, 7, 8). Combine them: File + Rank = Square Name (like a7, b2, c8)!',
    howItMoves: [
      'Look at the bottom letters: a, b, c, d, e, f, g, h (Files / Columns)',
      'Look at the side numbers: 1, 2, 3, 4, 5, 6, 7, 8 (Ranks / Rows)',
      'Find where they cross: Column "c" + Row "8" = Square c8!',
      'Column "a" + Row "7" = Square a7!',
      'Column "b" + Row "2" = Square b2!',
    ],
    coachTip:
      'Always pronounce the letter first, then the number: "a7", "b2", "c8". White starts at ranks 1 & 2, Black at ranks 7 & 8!',
    fen: '8/7k/8/8/8/8/8/K7 w - - 0 1',
    targetSquares: ['a7', 'b2', 'c8', 'e4', 'd5', 'g1', 'h8', 'f3'],
    userColor: 'w',
    goalText: 'Click the highlighted star squares to learn square addresses like a7, b2, and c8!',
    isCoordinateDrill: true,
    sampleSquareNames: ['a7', 'b2', 'c8', 'e4', 'd5', 'g1', 'h8', 'f3'],
  },

  // 2. The Rook
  {
    id: 'rook_basics',
    category: 'pieces',
    categoryTitle: 'Piece Movements',
    title: 'The Rook (The Castle Tower)',
    subtitle: 'Straight lines along files and ranks',
    avatar: '♜',
    pieceType: 'r',
    piecePoints: 5,
    description:
      'The Rook looks like a sturdy castle tower. It is a powerful heavy piece worth 5 points!',
    ruleExplanation:
      'The Rook moves straight: Forward, backward, left, or right as many squares as it wants along open files and ranks!',
    howItMoves: [
      'Moves straight along Ranks (horizontally side to side)',
      'Moves straight along Files (vertically up and down)',
      'Cannot jump over other pieces—it stops when blocked',
      'Captures by landing directly on an enemy square',
    ],
    coachTip:
      'Think of a plus sign (+)! The Rook can zoom all the way across the board in 1 move.',
    fen: '8/5k2/8/8/3R4/8/8/6K1 w - - 0 1',
    activePieceSquare: 'd4',
    targetSquares: ['d8', 'h8', 'h4', 'a4', 'a1'],
    userColor: 'w',
    goalText: 'Move your White Rook straight along the ranks and files to collect the stars!',
  },

  // 3. The Bishop
  {
    id: 'bishop_basics',
    category: 'pieces',
    categoryTitle: 'Piece Movements',
    title: 'The Bishop (The Diagonal Laser)',
    subtitle: 'Zooming across light & dark diagonals',
    avatar: '♝',
    pieceType: 'b',
    piecePoints: 3,
    description:
      'The Bishop has a pointed mitre hat. You start with two Bishops: one on light squares and one on dark squares!',
    ruleExplanation:
      'The Bishop moves diagonally like an "X". A light-squared bishop never leaves light squares, and a dark-squared bishop never leaves dark squares!',
    howItMoves: [
      'Moves diagonally as far as it wants',
      'Never changes square colors (stays on its home color forever)',
      'Cannot jump over any pieces',
      'A pair of bishops working together controls the whole board!',
    ],
    coachTip:
      'Follow the diagonal track! If you start on a light square, you can only visit light squares.',
    fen: '1k6/8/8/8/3B4/8/8/7K w - - 0 1',
    activePieceSquare: 'd4',
    targetSquares: ['g7', 'b2', 'a1', 'f6'],
    userColor: 'w',
    goalText: 'Glide diagonally with your Bishop to collect all the light-square stars!',
  },

  // 4. The Queen
  {
    id: 'queen_basics',
    category: 'pieces',
    categoryTitle: 'Piece Movements',
    title: 'The Queen (The Superhero)',
    subtitle: 'Rook + Bishop Combined Superpower!',
    avatar: '♛',
    pieceType: 'q',
    piecePoints: 9,
    description:
      'The Queen wears a crown and is the most powerful piece in the entire game of chess, worth 9 points!',
    ruleExplanation:
      'The Queen combines the powers of the Rook and Bishop: She can move straight OR diagonally as far as she wants!',
    howItMoves: [
      'Moves straight (up, down, left, right) like a Rook',
      'Moves diagonally like a Bishop',
      'Can zoom anywhere along open paths',
      'Cannot jump over pieces, but attacks in 8 directions!',
    ],
    coachTip:
      'The Queen is your superstar! Use her to swoop across the board and conquer key squares.',
    fen: '1k6/8/8/8/3Q4/8/8/7K w - - 0 1',
    activePieceSquare: 'd4',
    targetSquares: ['d8', 'h8', 'h4', 'e3', 'a7'],
    userColor: 'w',
    goalText: 'Use straight lines and diagonals to collect all the stars with your Queen!',
  },

  // 5. The King
  {
    id: 'king_basics',
    category: 'pieces',
    categoryTitle: 'Piece Movements',
    title: 'The King (The Royal Leader)',
    subtitle: 'One step at a time in any direction',
    avatar: '♚',
    pieceType: 'k',
    piecePoints: 100,
    description:
      'The King is the leader of your army with a cross on his crown. If your King is trapped, you lose the game!',
    ruleExplanation:
      'The King moves only ONE square in any direction (straight or diagonal). Protect him at all times!',
    howItMoves: [
      '1 step forward, backward, left, or right',
      '1 step diagonally in any direction',
      'Can never step into danger (check)',
      'Two Kings can never stand directly next to each other!',
    ],
    coachTip:
      'Slow and steady! The King takes royal steps. Keep your King safe behind pawns.',
    fen: 'k7/8/8/8/8/8/8/4K3 w - - 0 1',
    activePieceSquare: 'e1',
    targetSquares: ['e2', 'f3', 'e4', 'd5'],
    userColor: 'w',
    goalText: 'Step by step, march your King forward to collect the royal stars!',
  },

  // 6. The Knight
  {
    id: 'knight_basics',
    category: 'pieces',
    categoryTitle: 'Piece Movements',
    title: 'The Knight (The Jumping Horse)',
    subtitle: 'The magic L-shape and jumping over pieces',
    avatar: '♞',
    pieceType: 'n',
    piecePoints: 3,
    description:
      'The Knight is a spirited war horse. It is the trickiest piece on the board and has a superpower no other piece has!',
    ruleExplanation:
      'The Knight moves in an "L" shape (2 squares straight, then 1 square to the side). It can JUMP over other pieces!',
    howItMoves: [
      'Count: 2 steps straight, and 1 step to the side (L-shape)',
      'Can jump right over friendly and enemy pieces!',
      'Always lands on the opposite color (light to dark, or dark to light)',
      'Controls up to 8 different squares from the center of the board!',
    ],
    coachTip:
      'Say out loud: "Two steps forward, one step to the side!" Every jump flips the square color.',
    fen: '7k/8/8/8/8/8/8/KN6 w - - 0 1',
    activePieceSquare: 'b1',
    targetSquares: ['c3', 'e4', 'f6', 'd7'],
    userColor: 'w',
    goalText: 'Jump the Knight in L-shapes to collect all the stars!',
  },

  // 7. Knight Jumping Barrier
  {
    id: 'knight_jump_barrier',
    category: 'pieces',
    categoryTitle: 'Piece Movements',
    title: 'Knight Superpower: Jump the Wall!',
    subtitle: 'Other pieces get blocked, but Knights leap right over!',
    avatar: '♞',
    pieceType: 'n',
    piecePoints: 3,
    description:
      'When pawns or pieces build a wall, Rooks and Queens get blocked. But the Knight leaps right over the barricade!',
    ruleExplanation:
      'The Knight does not care if pieces are in between—it jumps straight over their heads!',
    howItMoves: [
      'Ignores any pieces standing between start and destination',
      'Only captures the piece on the final landing square',
    ],
    coachTip:
      'Watch your Knight fly over the pawn wall! A Knight is never trapped by pieces in front of it.',
    fen: '7k/8/8/8/8/8/2ppp3/3N3K w - - 0 1',
    activePieceSquare: 'd1',
    targetSquares: ['c3', 'd5', 'e7'],
    userColor: 'w',
    goalText: 'Jump right over the enemy pawns to grab the stars on the other side!',
  },

  // 8. The Pawn
  {
    id: 'pawn_basics',
    category: 'pieces',
    categoryTitle: 'Piece Movements',
    title: 'The Pawn (The Brave Soldier)',
    subtitle: 'Forward march & first move boost',
    avatar: '♟',
    pieceType: 'p',
    piecePoints: 1,
    description:
      'You have 8 brave Pawns standing on rank 2. They march forward to control the center and protect your army!',
    ruleExplanation:
      'Pawns move forward 1 step. On their very first move from rank 2, they have the superpower to jump 2 steps forward!',
    howItMoves: [
      'Moves straight forward 1 square at a time',
      'Can move 2 squares forward on its very first move',
      'Never moves backward—pawns only march forward!',
      'Cannot jump over pieces in front of them',
    ],
    coachTip:
      'Pawns are the soul of chess! Push your center pawns (e4 and d4) early to control the middle of the board.',
    fen: 'k7/8/8/8/8/8/4P3/K7 w - - 0 1',
    activePieceSquare: 'e2',
    targetSquares: ['e4', 'e5', 'e6'],
    userColor: 'w',
    goalText: 'Take the 2-step leap on move 1, then march forward step by step!',
  },

  // 9. Pawn Diagonal Capture
  {
    id: 'pawn_capture',
    category: 'pieces',
    categoryTitle: 'Piece Movements',
    title: 'Pawn Capture: Diagonal Attack!',
    subtitle: 'Pawns capture differently than they walk!',
    avatar: '⚔️',
    pieceType: 'p',
    piecePoints: 1,
    description:
      'Pawns have a special secret: They walk straight forward, but they CAPTURE diagonally 1 square forward!',
    ruleExplanation:
      'Pawns attack diagonally forward! If an enemy is straight ahead, the pawn is blocked. But if an enemy is 1 step diagonal, you can capture it!',
    howItMoves: [
      'Walk forward, strike diagonal!',
      'Diagonal capture is always 1 square diagonally forward',
      'Cannot capture backward',
    ],
    coachTip:
      'Remember: Pawns walk straight, but bite diagonal! Like two swords crossing in an "X".',
    fen: '7k/8/5p2/4p3/3P4/8/8/K7 w - - 0 1',
    activePieceSquare: 'd4',
    targetSquares: ['e5', 'f6'],
    userColor: 'w',
    goalText: 'Use your pawn on d4 to capture diagonally on e5, then capture diagonally again on f6!',
  },

  // 10. Pawn Promotion
  {
    id: 'pawn_promotion',
    category: 'special',
    categoryTitle: 'Special Rules',
    title: 'Pawn Promotion: Turn into a Queen!',
    subtitle: 'The greatest reward in chess',
    avatar: '👑',
    pieceType: 'p',
    description:
      'If a little brave pawn marches all the way to the other end of the board (rank 8), magic happens: It promotes into a Queen!',
    ruleExplanation:
      'When your pawn touches rank 8, it transforms into any piece you want (Queen, Rook, Bishop, Knight). Always choose the Queen!',
    howItMoves: [
      'March pawn from rank 7 to rank 8',
      'Instantly replace the pawn with a brand new Queen!',
      'You can have multiple Queens on the board at the same time!',
    ],
    coachTip:
      'A passed pawn is a future Queen! Push it all the way to the end and celebrate.',
    fen: '7k/4P3/8/8/8/8/8/K7 w - - 0 1',
    activePieceSquare: 'e7',
    targetSquares: ['e8'],
    userColor: 'w',
    goalText: 'Push the pawn onto e8 and promote it into a shiny new Queen!',
  },

  // 11. Check & Escape
  {
    id: 'check_and_escape',
    category: 'special',
    categoryTitle: 'Special Rules',
    title: 'Check! How to Escape',
    subtitle: 'When the King is under attack',
    avatar: '🛡️',
    description:
      'When an enemy piece aims at your King, that is CHECK! Your King is in danger and you MUST escape immediately!',
    ruleExplanation:
      'Remember the C.P.R. rule to escape check: 1) C - Capture the attacker, 2) P - Protect by blocking, or 3) R - Run away with the King!',
    howItMoves: [
      'Step the King to a safe square not under attack',
      'Block the attack with another friendly piece',
      'Capture the attacking enemy piece directly',
    ],
    coachTip:
      'Don’t panic! Check is just a warning. Look for a safe neighboring square and step away.',
    fen: 'k3r3/8/8/8/8/8/8/4K3 w - - 0 1',
    activePieceSquare: 'e1',
    targetSquares: ['d2', 'f2', 'd1', 'f1'],
    userColor: 'w',
    goalText: 'The black rook is checking your King on e1! Step your King to any safe square!',
  },

  // 12. Checkmate
  {
    id: 'checkmate_win',
    category: 'special',
    categoryTitle: 'Special Rules',
    title: 'Checkmate: Winning the Game!',
    subtitle: 'The King is trapped and cannot escape!',
    avatar: '🏆',
    description:
      'Checkmate is the ultimate goal in chess! It happens when the enemy King is under attack (in check) and has NO WAY to escape, block, or capture.',
    ruleExplanation:
      'Checkmate = Game Over, You Win! The King cannot run, cannot block, and cannot capture the attacker.',
    howItMoves: [
      'Attack the enemy King with a piece protected by another piece',
      'Cover all escape squares around the King',
      'The King cannot be captured off the board—the game ends immediately on checkmate!',
    ],
    coachTip:
      'Scholar’s Mate! Queen on h5 supported by Bishop on c4 delivers checkmate on f7. Black’s king is trapped!',
    fen: 'r1bqkb1r/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1',
    activePieceSquare: 'h5',
    targetSquares: ['f7'],
    userColor: 'w',
    goalText: 'Deliver checkmate in 1 move by playing Queen to f7 (Qxf7#)!',
  },
];

/**
 * Returns detailed coordinate information for any square (e.g. 'a7' or 'c8').
 */
export function getSquareDetails(square: Square): {
  name: Square;
  file: string;
  rank: number;
  isLight: boolean;
  colorName: string;
  description: string;
} {
  const file = square[0];
  const rank = parseInt(square[1], 10);
  const fileIdx = file.charCodeAt(0) - 'a'.charCodeAt(0);
  const isLight = (fileIdx + rank) % 2 === 0;

  return {
    name: square,
    file,
    rank,
    isLight,
    colorName: isLight ? 'Light Square' : 'Dark Square',
    description: `File "${file}" (Column) + Rank "${rank}" (Row) ➔ Square ${square} (${
      isLight ? 'Light' : 'Dark'
    })`,
  };
}
