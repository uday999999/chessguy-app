import { ChessPuzzle } from './types';

export const CHESS_PUZZLES: ChessPuzzle[] = [
  {
    id: 'mate-1-scholars',
    title: "Scholar's Checkmate",
    fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 4',
    turn: 'w',
    rating: 650,
    theme: 'mate-in-1',
    themeName: 'Mate in 1',
    moves: ['Qxf7#'],
    description: 'White to move. Strike on the weak f7 square to deliver an immediate checkmate!',
    hint: 'Your Queen and Bishop on c4 are both trained on the f7 pawn.',
    progressiveHints: {
      level1: 'Look at Black’s king. The f7 pawn has only one protector: the King himself.',
      level2: 'Combine your Queen on f3 and Bishop on c4 to strike the f7 square with checkmate.',
      level3: 'Play 1. Qxf7# directly taking the pawn on f7.',
      highlightSquares: ['f3', 'c4', 'f7', 'e8'],
    },
    tacticalExplanation:
      'The f7 square (and f2 for White) is the most vulnerable point in the opening. Because the Queen is supported by the Bishop on c4, the King cannot capture her, and has no legal escape squares.',
    refutationAdvice:
      'Playing Qxf4 captures a knight but lets Black defend f7 with ...Qe7 or ...Qf6, completely missing immediate victory.',
    solutionWalkthrough: [
      {
        move: 'Qxf7#',
        explanation: 'Queen captures on f7 with checkmate! Defended by the c4 bishop.',
      },
    ],
    championLore: {
      championName: 'Classical Chess Principle',
      event: 'Fundamental King Safety',
      quote: 'f7 is the weakest square in the opening because only the King defends it.',
    },
  },
  {
    id: 'mate-1-backrank',
    title: 'Back-Rank Corridor Mate',
    fen: '6k1/5ppp/8/8/8/8/5PPP/1R4K1 w - - 0 1',
    turn: 'w',
    rating: 700,
    theme: 'back-rank',
    themeName: 'Back Rank Mate',
    moves: ['Rb8#'],
    description: 'White to move. Exploit the black king trapped behind its own defensive pawn shield!',
    hint: 'Slide your Rook all the way down the b-file to the 8th rank.',
    progressiveHints: {
      level1: 'Notice the pawns on f7, g7, and h7. They form an inescapable wall in front of Black’s King.',
      level2: 'Your Rook on b1 can infiltrate the undefended 8th rank to attack the King.',
      level3: 'Play 1. Rb8# to trap the King on the corridor.',
      highlightSquares: ['b1', 'b8', 'g8', 'f7', 'g7', 'h7'],
    },
    tacticalExplanation:
      'When pawns on the castled side have not moved forward (no "luft" or breathing room), any heavy piece sliding to the back rank delivers an inescapable mate along the corridor.',
    refutationAdvice:
      'Pushing pawns like h3 or g3 wastes the tempo and gives Black time to play ...h6 and escape the corridor forever.',
    solutionWalkthrough: [
      {
        move: 'Rb8#',
        explanation: 'Rook penetrates to b8 on the 8th rank delivering back-rank checkmate!',
      },
    ],
    championLore: {
      championName: 'Jose Raul Capablanca',
      event: 'Back-Rank Defense Masterclass',
      quote: 'Always create luft before launching your attack, or the back rank will collapse.',
    },
  },
  {
    id: 'fork-royal-knight',
    title: 'The Royal Knight Fork',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 5',
    turn: 'w',
    rating: 850,
    theme: 'fork',
    themeName: 'Knight Fork',
    moves: ['Bxf7+', 'Kxf7', 'Ng5+'],
    description: 'White to move. Dislodge the black king with a tactical sacrifice followed by a fork!',
    hint: 'Start with a bishop sacrifice on f7, then jump the knight into action with check.',
    progressiveHints: {
      level1: 'Tactical sequence: Sacrifice material to draw the Black King to an exposed square.',
      level2: 'Your Bishop on c4 can sacrifice itself on f7 to lure the King forward.',
      level3: 'Play 1. Bxf7+! Kxf7, then follow up with 2. Ng5+ checking the King.',
      highlightSquares: ['c4', 'f7', 'e8', 'f3', 'g5'],
    },
    tacticalExplanation:
      'The sacrifice 1. Bxf7+ draws the Black King into the open, removing Black’s right to castle and opening up the g5 square for a multi-target knight jump.',
    refutationAdvice:
      'Jumping Ng5 immediately without the sacrifice allows Black to simply castle (O-O) or defend with d5.',
    solutionWalkthrough: [
      {
        move: 'Bxf7+',
        explanation: 'Bishop crashes through on f7 with check, forcing the King to step out.',
      },
      {
        move: 'Kxf7',
        explanation: 'Black is forced to capture the bishop with the King.',
      },
      {
        move: 'Ng5+',
        explanation: 'Knight leaps to g5 with check, seizing dynamic initiative and king control.',
      },
    ],
    championLore: {
      championName: 'Paul Morphy',
      event: 'Tactical Geometry',
      quote: 'A knight fork attacks two pieces at once because the knight jumps over defenders.',
    },
  },
  {
    id: 'mate-2-opera',
    title: "Morphy's Opera House Queen Sacrifice",
    fen: '4kb1r/p2n1ppp/4q3/4p1B1/4P3/1Q6/PPP2PPP/2KR4 w k - 0 1',
    turn: 'w',
    rating: 1350,
    theme: 'sacrifice',
    themeName: 'Queen Sacrifice',
    moves: ['Qb8+', 'Nxb8', 'Rd8#'],
    description: 'White to move. Play the legendary Opera Game finish played by Paul Morphy in 1858!',
    hint: 'Sacrifice your Queen on b8 to deflect the knight, opening up a devastating back-rank mate with your Rook.',
    progressiveHints: {
      level1: 'The Black knight on d7 is the only defender guarding the fatal d8 square.',
      level2: 'Find a way to deflect that knight away from defending d8 using your Queen.',
      level3: 'Play 1. Qb8+! forcing 1... Nxb8, then strike with 2. Rd8#!',
      highlightSquares: ['b3', 'b8', 'd7', 'd1', 'd8'],
    },
    tacticalExplanation:
      'Deflection sacrifice! The Queen on b3 offers herself on b8. Black must capture with the knight (1... Nxb8), leaving the d8 square unguarded for the rook on d1 to deliver checkmate supported by the bishop on g5.',
    refutationAdvice:
      'Playing Rd8+ immediately fails because the knight on d7 simply captures the rook (1... Nxd8). Deflection is mandatory!',
    solutionWalkthrough: [
      {
        move: 'Qb8+',
        explanation: 'Morphy sacrifices his Queen on b8! Checks the king and deflects the d7 knight.',
      },
      {
        move: 'Nxb8',
        explanation: 'Black has only one legal response: 1... Nxb8, abandoning defense of d8.',
      },
      {
        move: 'Rd8#',
        explanation: 'Rook delivers checkmate on d8, protected by the dark-squared bishop on g5!',
      },
    ],
    championLore: {
      championName: 'Paul Morphy',
      event: '1858 Paris Opera House vs Duke of Brunswick',
      quote: 'Morphy sacrificed his Queen with Qb8+! Nxb8 Rd8# to deliver the most iconic checkmate in history.',
    },
  },
  {
    id: 'mate-2-smothered',
    title: 'Philidor’s Smothered Mate',
    fen: '5r1k/6pp/7N/8/2Q5/8/6PP/6K1 w - - 0 1',
    turn: 'w',
    rating: 1200,
    theme: 'sacrifice',
    themeName: 'Smothered Mate',
    moves: ['Qg8+', 'Rxg8', 'Nf7#'],
    description: 'White to move. Execute the immortal Philidor’s Smothered Mate with a queen sacrifice!',
    hint: 'Force Black’s rook to trap its own king on g8 with a queen sacrifice, followed by Nf7#!',
    progressiveHints: {
      level1: 'The Black King is trapped in the corner. If a friendly piece blocks g8, the King has zero escape squares.',
      level2: 'Sacrifice your Queen on g8 right next to the King, forcing the Black Rook to capture.',
      level3: 'Play 1. Qg8+! Rxg8, then 2. Nf7# for a textbook smothered mate!',
      highlightSquares: ['c4', 'g8', 'f8', 'h8', 'h6', 'f7'],
    },
    tacticalExplanation:
      'A smothered mate is delivered by a jumping knight against a king that is completely suffocated by its own pieces. 1. Qg8+ forces 1... Rxg8, sealing the king into a 1x1 cage, perfectly set up for 2. Nf7#.',
    refutationAdvice:
      'Playing Nf7+ immediately allows 1... Rxf7, and Black trades off your attacking knight without danger.',
    solutionWalkthrough: [
      {
        move: 'Qg8+',
        explanation: 'White sacrifices the Queen on g8! Protected by the knight on h6, so the king cannot take.',
      },
      {
        move: 'Rxg8',
        explanation: 'Black must capture with 1... Rxg8, completely trapping the king on h8.',
      },
      {
        move: 'Nf7#',
        explanation: 'Knight leaps to f7 delivering smothered checkmate! King cannot move.',
      },
    ],
    championLore: {
      championName: 'Francois-Andre Philidor',
      event: 'Immortal Smothered Combinations',
      quote: 'A smothered mate occurs when a king cannot escape check because it is completely boxed in by its own army.',
    },
  },
  {
    id: 'pin-queen-skewer',
    title: 'Absolute Pin on the Queen',
    fen: 'r1b1k2r/ppppqppp/2n5/8/1bBP4/5N2/PP1B1PPP/R2QK2R w KQkq - 0 9',
    turn: 'w',
    rating: 1100,
    theme: 'pin',
    themeName: 'Defensive Pin',
    moves: ['Be2'],
    description: 'White to move. Safely parry the check while maintaining king protection and piece development!',
    hint: 'Block the check on the e-file with your light-squared Bishop.',
    progressiveHints: {
      level1: 'White is under check from the Queen on e7. Look for an interposition that develops a piece.',
      level2: 'Moving the King loses castling rights. Blocking with the Bishop preserves harmony.',
      level3: 'Play 1. Be2 to block the e-file and prepare to castle kingside.',
      highlightSquares: ['e7', 'e1', 'c4', 'e2'],
    },
    tacticalExplanation:
      'Interposing with 1. Be2 is active prophylaxis. It blocks the check, unpins the White King, preserves White’s right to castle on the next move, and avoids giving Black easy piece exchanges.',
    refutationAdvice:
      'Moving the King with Kf1 or Kd1 destroys castling rights forever and permanently traps the h1 rook.',
    solutionWalkthrough: [
      {
        move: 'Be2',
        explanation: 'Bishop blocks the check cleanly on e2, completing kingside development.',
      },
    ],
    championLore: {
      championName: 'Anatoly Karpov',
      event: 'Solid Prophylaxis',
      quote: 'When pinned, neutralize the threat by interposing pieces that complete your development.',
    },
  },
  {
    id: 'mate-1-anastasia',
    title: 'Anastasia’s Checkmate',
    fen: '5r1k/4N1pp/8/7Q/8/3R4/5PPP/6K1 w - - 0 1',
    turn: 'w',
    rating: 1350,
    theme: 'sacrifice',
    themeName: 'Anastasia Mate',
    moves: ['Qxh7+', 'Kxh7', 'Rh3#'],
    description: 'White to move. Execute Anastasia’s Mate with a stunning Queen sacrifice and Rook checkmate!',
    hint: 'Crash through on h7 with Qxh7+ to expose the black king to a decisive rook strike on h3.',
    progressiveHints: {
      level1: 'Black’s rook on f8 guards the back rank. The key is opening the h-file where Black has no protection.',
      level2: 'Blow open the h-file by sacrificing the Queen directly on h7.',
      level3: 'Play 1. Qxh7+! Kxh7, followed by 2. Rh3# sweeping down the file.',
      highlightSquares: ['f8', 'e7', 'g6', 'g8', 'h5', 'h7', 'd3', 'h3'],
    },
    tacticalExplanation:
      'Anastasia’s Mate geometry: The knight on e7 walls off g8 and g6, while Black’s rook on f8 blocks the 8th rank. The sacrifice 1. Qxh7+ drags the king onto h7. Then 2. Rh3# attacks down the entire open h-file with no escape possible.',
    refutationAdvice:
      'Playing 1. Rd8 or 1. Qe8 fails because Black’s rook on f8 simply captures (1... Rxd8 or 1... Rxe8). The only winning sequence is the queen sacrifice 1. Qxh7+! Kxh7 2. Rh3#!',
    solutionWalkthrough: [
      {
        move: 'Qxh7+',
        explanation: 'Queen sacrifice on h7! Destroys the pawn shield and forces the king to h7.',
      },
      {
        move: 'Kxh7',
        explanation: 'King takes back on h7, opening the h-file completely.',
      },
      {
        move: 'Rh3#',
        explanation: 'Rook swings to h3 delivering Anastasia’s checkmate! Knight covers g8 and g6.',
      },
    ],
    championLore: {
      championName: 'Alexander Alekhine',
      event: 'Classic Geometric Checkmates',
      quote: 'The knight on e7 walls off g6 and g8, while the rook delivers the lethal blow down the h-file.',
    },
  },
  {
    id: 'mate-1-fools-revenge',
    title: 'Fool’s Mate Diagonal Strike',
    fen: 'rnbqkbnr/ppppp2p/5p2/6p1/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3',
    turn: 'w',
    rating: 600,
    theme: 'mate-in-1',
    themeName: 'Mate in 1',
    moves: ['Qh5#'],
    description: 'White to move. Black has fatally weakened the e8-h5 diagonal by advancing their f-pawn and g-pawn. Deliver an immediate checkmate!',
    hint: 'Your Queen on d1 has an open highway straight to h5.',
    progressiveHints: {
      level1: 'Notice how Black pushed both the f-pawn and g-pawn, leaving the e8-h5 diagonal completely exposed.',
      level2: 'Your Queen on d1 can zoom down the diagonal to attack the unshielded King.',
      level3: 'Play 1. Qh5# to deliver the fastest checkmate in chess.',
      highlightSquares: ['d1', 'h5', 'e8'],
    },
    tacticalExplanation:
      'Advancing the f-pawn and g-pawn early in the game fatally exposes the king along the e8-h5 diagonal (the classic Fool’s Mate pattern). The Queen on d1 leaps to h5, and with no piece able to block or capture her, Black is checkmated in 1 move.',
    refutationAdvice:
      'Playing Bxg5+ or Qh4 allows Black to escape with ...Kf7 or block with ...Nf6, completely missing the instant mate.',
    solutionWalkthrough: [
      {
        move: 'Qh5#',
        explanation: 'Queen leaps from d1 to h5 delivering the legendary Fool’s checkmate along the open diagonal!',
      },
    ],
    championLore: {
      championName: 'Opening Rule',
      event: 'Avoid f-pawn weakness',
      quote: 'Never push your f-pawn in the opening unless you are 100% prepared to protect your king diagonal.',
    },
  },
  {
    id: 'mate-2-bishops',
    title: 'Boden’s Criss-Cross Mate',
    fen: '2kr1b1r/pp1n1ppp/2p1p3/8/Q3NB2/3B4/PPP2PPP/2KR4 w - - 0 1',
    turn: 'w',
    rating: 1300,
    theme: 'sacrifice',
    themeName: 'Boden Mate',
    moves: ['Qxc6+', 'bxc6', 'Ba6#'],
    description: 'White to move. Sacrifice your Queen to trigger the iconic Boden’s Criss-Cross mate with intersecting bishops!',
    hint: 'Sacrifice your Queen on c6 with check to strip Black’s king defenses, then strike with Ba6#!',
    progressiveHints: {
      level1: 'Look at White’s two powerful bishops aiming across intersecting diagonals at the queenside.',
      level2: 'Sacrifice the Queen on c6 to pry open the dark-squared diagonal leading to the king.',
      level3: 'Play 1. Qxc6+! bxc6, followed by 2. Ba6# delivering Boden’s criss-cross mate!',
      highlightSquares: ['a4', 'c6', 'b7', 'd3', 'a6', 'f4'],
    },
    tacticalExplanation:
      'Boden’s Mate utilizes two bishops slicing across intersecting diagonals. 1. Qxc6+ forces 1... bxc6, opening the a6-c8 diagonal so 2. Ba6# delivers an inescapable criss-cross checkmate.',
    refutationAdvice:
      'Playing Ba6 immediately allows Black to defend with ...Qb6 or ...e5, keeping the king shielded.',
    solutionWalkthrough: [
      {
        move: 'Qxc6+',
        explanation: 'White sacrifices the Queen on c6 with check, breaking Black’s pawn shield.',
      },
      {
        move: 'bxc6',
        explanation: 'Black is forced to capture 1... bxc6 with the pawn.',
      },
      {
        move: 'Ba6#',
        explanation: 'Bishop strikes on a6! Crosses with the f4 bishop for Boden’s criss-cross checkmate!',
      },
    ],
    championLore: {
      championName: 'Samuel Boden',
      event: '1853 Classic vs Schulder',
      quote: 'Boden sacrificed his Queen with Qxc6+! to deliver mate using two criss-crossing bishops on opposite diagonals.',
    },
  },
  {
    id: 'fischer-brilliancy',
    title: 'Fischer’s Discovered Attack',
    fen: 'r3kb1r/pp1n1ppp/2p1p3/8/3P4/2N1BB2/PPP2PPP/R2Q1RK1 w kq - 0 1',
    turn: 'w',
    rating: 1400,
    theme: 'discovery',
    themeName: 'Discovered Attack',
    moves: ['Ne4'],
    description: 'White to move. Reposition your central knight to unmask your bishop and control key central squares!',
    hint: 'Centralize your knight to e4.',
    progressiveHints: {
      level1: 'White has a powerful light-squared bishop on f3. Look for a knight leap that opens its path.',
      level2: 'Moving the knight from c3 to e4 centralizes it and increases tension against Black’s kingside.',
      level3: 'Play 1. Ne4 taking firm control of d6, f6, and c5.',
      highlightSquares: ['c3', 'e4', 'f3'],
    },
    tacticalExplanation:
      'Centralizing the knight to e4 establishes supreme outpost dominance while unmasking the long diagonal for the f3 bishop. Black’s pieces are cramped and unable to challenge the center.',
    refutationAdvice:
      'Playing d5 prematurely allows Black to trade pawns with ...exd5 and free their light-squared bishop.',
    solutionWalkthrough: [
      {
        move: 'Ne4',
        explanation: 'Knight leaps to e4, commanding the center and unleashing the bishop on f3.',
      },
    ],
    championLore: {
      championName: 'Bobby Fischer',
      event: '1972 World Championship',
      quote: 'Fischer always sought the most energetic square for his knights.',
    },
  },
  {
    id: 'tal-knight-strike',
    title: 'Mikhail Tal’s Central Knight Sacrifice',
    fen: 'r1bq1rk1/pp1nbppp/2p1p3/3pP3/3P4/2NBB3/PPP2PPP/R2Q1RK1 w - - 0 10',
    turn: 'w',
    rating: 1650,
    theme: 'sacrifice',
    themeName: 'Greek Gift Attack',
    moves: ['Bxh7+', 'Kxh7', 'Qh5+'],
    description: 'White to move. Unleash the legendary Greek Gift sacrifice against the castled king!',
    hint: 'Crash through on h7 with your light-squared Bishop with check!',
    progressiveHints: {
      level1: 'The classic Greek Gift motif: Black’s castled king has only the h7 pawn as its outer shield.',
      level2: 'Sacrifice the Bishop on h7 to rip open the h-file for the Queen and Knight follow-up.',
      level3: 'Play 1. Bxh7+! Kxh7, followed by 2. Qh5+ bringing the heavy artillery.',
      highlightSquares: ['d3', 'h7', 'g8', 'd1', 'h5'],
    },
    tacticalExplanation:
      'The Greek Gift sacrifice 1. Bxh7+ strips the castled king of its defensive shelter. After 1... Kxh7 2. Qh5+ Kg8, White follows with Ng5 and Qd3, generating unstoppable mating threats on h7.',
    refutationAdvice:
      'Playing Qh5 immediately without the bishop sacrifice allows Black to play ...h6 or ...g6 and cement the defense.',
    solutionWalkthrough: [
      {
        move: 'Bxh7+',
        explanation: 'Tal launches the Greek Gift bishop sacrifice on h7 with check!',
      },
      {
        move: 'Kxh7',
        explanation: 'King is forced to capture the bishop on h7.',
      },
      {
        move: 'Qh5+',
        explanation: 'Queen joins the attack on h5 with check, setting up a crushing assault.',
      },
    ],
    championLore: {
      championName: 'Mikhail Tal',
      event: '1960 World Championship vs Botvinnik',
      quote: 'You must take your opponent into a deep dark forest where 2+2=5, and the path out is only wide enough for one.',
    },
  },
  {
    id: 'kasparov-rook-hunt',
    title: 'Kasparov’s Open File Breakthrough',
    fen: 'r4rk1/1pp2ppp/p7/4N3/1b1q4/8/PP3PPP/1R1Q1RK1 w - - 0 15',
    turn: 'w',
    rating: 1500,
    theme: 'discovery',
    themeName: 'Queen Deflection',
    moves: ['Qxd4'],
    description: 'White to move. Win the loose enemy queen on d4!',
    hint: 'Your Queen can simply capture Black’s queen on d4.',
    progressiveHints: {
      level1: 'Look for an undefended heavy piece in the center of the board.',
      level2: 'Black’s Queen on d4 is completely loose with zero protectors.',
      level3: 'Play 1. Qxd4 to capture the queen cleanly.',
      highlightSquares: ['d1', 'd4'],
    },
    tacticalExplanation:
      'Tactics flow from loose pieces. Black left their Queen unguarded on d4. White simply captures with 1. Qxd4, converting a full queen advantage into an easy win.',
    refutationAdvice:
      'Moving the knight on e5 lets Black save their queen with ...Qd6 or ...Qe4.',
    solutionWalkthrough: [
      {
        move: 'Qxd4',
        explanation: 'White captures the undefended Queen on d4, winning decisive material.',
      },
    ],
    championLore: {
      championName: 'Garry Kasparov',
      event: '1999 Immortal Game vs Topalov',
      quote: 'When your opponent leaves a heavy piece undefended in the center, execute immediately.',
    },
  },
  {
    id: 'reti-double-check',
    title: 'Reti’s Double Check Checkmate',
    fen: 'rnb1kb1r/pp3ppp/2p5/4q3/4n3/3Q4/PPPB1PPP/2KR1BNR w kq - 0 9',
    turn: 'w',
    rating: 1550,
    theme: 'double-check',
    themeName: 'Double Check',
    moves: ['Qd8+', 'Kxd8', 'Bg5+', 'Ke8', 'Rd8#'],
    description: 'White to move. Unleash Richard Reti’s legendary 1910 Queen sacrifice followed by a double check mate!',
    hint: 'Sacrifice your Queen on d8 to draw the King forward, then deliver double check with Bg5+!',
    progressiveHints: {
      level1: 'Double check is the most powerful weapon in chess: the King MUST move because no piece can block two checks at once.',
      level2: 'Sacrifice your Queen on d8 to draw the Black King directly into the line of fire.',
      level3: 'Play 1. Qd8+! Kxd8 2. Bg5+! Ke8 3. Rd8#!',
      highlightSquares: ['d3', 'd8', 'e8', 'd2', 'g5', 'd1'],
    },
    tacticalExplanation:
      'Richard Reti vs Tartakower (1910): 1. Qd8+! forces the King to d8. Then 2. Bg5+! delivers a devastating double check (Bishop on g5 and Rook on d1). Because both pieces check simultaneously, Black cannot interpose and must flee to e8. Then 3. Rd8# delivers mate!',
    refutationAdvice:
      'Playing Bg5 immediately without the queen sacrifice allows Black to trade queens or escape with ...f6.',
    solutionWalkthrough: [
      {
        move: 'Qd8+',
        explanation: 'Reti sacrifices the Queen on d8! Forces the Black King onto the open d-file.',
      },
      {
        move: 'Kxd8',
        explanation: 'King takes back on d8, stepping into the crosshairs.',
      },
      {
        move: 'Bg5+',
        explanation: 'Double check! Bishop on g5 and Rook on d1 both attack the king simultaneously.',
      },
      {
        move: 'Ke8',
        explanation: 'King has only one legal escape: 2... Ke8 (or 2... Kc7 3. Bd8#).',
      },
      {
        move: 'Rd8#',
        explanation: 'Rook slides to d8 delivering pure checkmate, protected by the bishop!',
      },
    ],
    championLore: {
      championName: 'Richard Reti',
      event: '1910 Vienna vs Tartakower',
      quote: 'Double check cannot be parried by capturing or blocking; the King must run, and here there is nowhere to hide.',
    },
  },
  {
    id: 'pawn-breakthrough-capablanca',
    title: 'Capablanca’s 3-Pawn Breakthrough',
    fen: '8/pp5p/8/PPP4k/8/8/8/4K3 w - - 0 1',
    turn: 'w',
    rating: 1600,
    theme: 'endgame',
    themeName: 'Pawn Breakthrough',
    moves: ['b6', 'axb6', 'c6', 'bxc6', 'a6'],
    description: 'White to move. Execute the classic pawn breakthrough sacrifice to queen a pawn ahead of Black!',
    hint: 'Push your middle pawn b6! When Black captures, sacrifice a second pawn to create an unstoppable runner.',
    progressiveHints: {
      level1: 'White has 3 connected passed pawns on the 5th rank (a5, b5, c5) against Black’s a7 and b7 pawns.',
      level2: 'Break open the center file with 1. b6! to deflect one of Black’s defensive pawns.',
      level3: 'Play 1. b6! axb6 2. c6! bxc6 3. a6! guaranteeing a new Queen.',
      highlightSquares: ['b5', 'b6', 'c5', 'c6', 'a5', 'a6'],
    },
    tacticalExplanation:
      'The classic 3 vs 2 pawn breakthrough geometry: 1. b6 forces Black to capture. If 1... axb6, White plays 2. c6! bxc6 3. a6! and the a-pawn cannot be caught by the distant king. If 1... cxb6, White plays 2. a6! bxa6 3. c6! with the same outcome.',
    refutationAdvice:
      'Pushing a6 or c6 first allows Black to lock up the pawns with ...b6, ruining your promotion chances.',
    solutionWalkthrough: [
      {
        move: 'b6',
        explanation: 'White thrusts the middle pawn 1. b6! threatening to capture on either a7 or c7.',
      },
      {
        move: 'axb6',
        explanation: 'Black captures 1... axb6 with the a-pawn.',
      },
      {
        move: 'c6',
        explanation: 'White sacrifices the c-pawn with 2. c6! deflecting Black’s remaining defender.',
      },
      {
        move: 'bxc6',
        explanation: 'Black is forced to take 2... bxc6.',
      },
      {
        move: 'a6',
        explanation: 'White pushes 3. a6! An unstoppable passed pawn marches to promotion!',
      },
    ],
    championLore: {
      championName: 'Jose Raul Capablanca',
      event: 'Endgame Geometry Masterclass',
      quote: 'Pawn breakthroughs rely on geometric calculation: one pawn sacrifices itself so its neighbor can queen.',
    },
  },
  {
    id: 'fischer-game-of-century',
    title: 'Fischer’s Game of the Century Queen Sacrifice',
    fen: 'r3r1k1/pp3pbp/1qp3p1/2B5/2BP2b1/Q1n2N2/P4PPP/3R1K1R b - - 3 17',
    turn: 'b',
    rating: 1850,
    theme: 'sacrifice',
    themeName: 'Queen Sacrifice',
    moves: ['Be6', 'Bxb6', 'Bxc4+'],
    description: 'Black to move. Play 13-year-old Bobby Fischer’s immortal move 17... Be6!! against Donald Byrne!',
    hint: 'Sacrifice your Queen by playing 17... Be6!!, setting up an irresistible windmill discovery against the White King.',
    progressiveHints: {
      level1: 'White has just attacked your Queen on b6 with Bc5. Instead of retreating, look for a counter-attack on c4.',
      level2: 'Fischer offered his Queen with 17... Be6!! challenging White’s powerful light-squared bishop.',
      level3: 'Play 17... Be6!! allowing 18. Bxb6, then recapture 18... Bxc4+ with devastating check.',
      highlightSquares: ['b6', 'c5', 'g4', 'e6', 'c4'],
    },
    tacticalExplanation:
      'Donald Byrne vs Robert James Fischer (1956): 13-year-old Fischer shocked the world with 17... Be6!! Rather than save his queen, he offered it so his dark-squared bishop could capture on c4 with check. White’s king was chased into the corner and dismantled by Fischer’s knight and rooks.',
    refutationAdvice:
      'Retreating the queen with ...Qc7 or ...Qa6 loses the initiative and allows White to consolidate with king safety.',
    solutionWalkthrough: [
      {
        move: 'Be6',
        explanation: 'Fischer plays 17... Be6!! The immortal queen sacrifice that stunned the chess world!',
      },
      {
        move: 'Bxb6',
        explanation: 'Byrne accepts the Queen on b6.',
      },
      {
        move: 'Bxc4+',
        explanation: 'Fischer recaptures on c4 with check! Drives the White King into an inescapable tactical vise.',
      },
    ],
    championLore: {
      championName: 'Bobby Fischer',
      event: '1956 Game of the Century vs Donald Byrne',
      quote: 'At age 13, Fischer conceived 17... Be6!!, heralded by GM Hans Kmoch as the Game of the Century.',
    },
  },
  {
    id: 'caro-kann-smothered',
    title: 'The Caro-Kann Smothered Trap',
    fen: 'r1bqkb1r/pp1npppp/2p2n2/8/3PN3/8/PPP1QPPP/R1B1KBNR w KQkq - 3 6',
    turn: 'w',
    rating: 900,
    theme: 'smothered-mate' as any,
    themeName: 'Smothered Mate',
    moves: ['Nd6#'],
    description: 'White to move. Exploit the absolute pin on the e7 pawn to deliver a 1-move smothered checkmate!',
    hint: 'Jump your knight into d6 with checkmate. Black’s e7 pawn is completely pinned by your Queen on e2.',
    progressiveHints: {
      level1: 'Look closely at the e-file: White’s Queen on e2 pins the Black e7 pawn against the King on e8.',
      level2: 'Because the e7 pawn cannot legally move, the d6 square is completely unguardable.',
      level3: 'Play 1. Nd6# jumping into the hole to deliver smothered mate.',
      highlightSquares: ['e4', 'd6', 'e2', 'e7', 'e8'],
    },
    tacticalExplanation:
      'The absolute pin prevents the e7 pawn from capturing the knight (moving the pawn would expose the king to check from the e2 Queen). With the King boxed in by its own army, 1. Nd6# ends the game instantly on move 6.',
    refutationAdvice:
      'Playing Nxf6+ allows Black to recapture with ...Nxf6 and continue playing normally, missing an immediate win.',
    solutionWalkthrough: [
      {
        move: 'Nd6#',
        explanation: 'Knight lands on d6 delivering smothered checkmate! The e7 pawn is pinned by the Queen.',
      },
    ],
    championLore: {
      championName: 'Opening Trap Lore',
      event: 'Caro-Kann Defense Hazard',
      quote: 'Beware of the Queen on the open e-file. An absolute pin turns a defending pawn into a ghost.',
    },
  },
];
