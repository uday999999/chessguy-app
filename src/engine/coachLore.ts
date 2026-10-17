import { Chess, Move } from 'chess.js';
import { ChampionLore, CoachFeedback, MoveClassification, MoveRecord } from '../utils/types';

interface MoveContext {
  san: string;
  from: string;
  to: string;
  piece: string;
  captured?: string;
  color: 'w' | 'b';
  moveNumber: number;
  classification: MoveClassification;
  evalBefore: number;
  evalAfter: number;
  evalLoss: number;
  bestMoveSan?: string;
  fenBefore: string;
  fenAfter: string;
}

// Master collection of historical champion games & escape miracles
const CHAMPION_STORIES: Record<string, ChampionLore[]> = {
  blunder_escapes: [
    {
      championName: 'Ding Liren',
      championTitle: '17th World Chess Champion',
      avatar: '👑',
      gameEvent: '2023 World Championship, Game 18 Rapid Tiebreak vs Ian Nepomniachtchi',
      theme: 'escape',
      title: 'Ding’s Immortal Self-Pin (46...Rg6!!)',
      narrative:
        'Ding was under immense pressure and Nepomniachtchi offered a safe draw by threefold repetition. Instead of retreating, Ding boldly played 46...Rg6!!, deliberately pinning his own rook to his king! The self-pin kept the game alive, shocked Nepomniachtchi under time trouble, and steered Ding directly into becoming World Champion.',
      grandmasterLesson:
        'When facing defeat or conceding a draw, don’t play safe. An audacious, counter-intuitive self-pin or counter-threat gives your opponent an opportunity to crack under pressure.',
    },
    {
      championName: 'Mikhail Tal',
      championTitle: '8th World Chess Champion ("The Magician from Riga")',
      avatar: '🧙‍♂️',
      gameEvent: '1960 World Championship, Game 6 vs Mikhail Botvinnik',
      theme: 'counter-attack',
      title: 'Tal’s Chaos Counter-Sacrifice (21...Nf4!!)',
      narrative:
        'Botvinnik had cornered Tal’s pieces and looked poised to systematically crush him. Rather than defending passively, Tal uncorked the shocking knight sacrifice 21...Nf4!!. The board exploded into endless tactical branches. Botvinnik, known as the iron logician, couldn’t calculate every line over the board, blundered under clock panic, and resigned to thunderous applause!',
      grandmasterLesson:
        'Tal’s Golden Rule: When your position is bad, do not suffer in silence. Throw fire on the board with active complications—your opponent is human and can be overwhelmed by tactical chaos.',
    },
    {
      championName: 'Hikaru Nakamura',
      championTitle: '5-Time US Champion & Speed Chess World Champion',
      avatar: '⚡',
      gameEvent: '2014 FIDE Candidates Tournament vs Levon Aronian',
      theme: 'escape',
      title: 'Nakamura’s Miracle Perpetual Swindle',
      narrative:
        'Down a full piece and seemingly dead lost, Nakamura refused to throw in the towel. He deliberately left another pawn undefended to lure Aronian’s king into a tactical geometry, setting up a sudden perpetual check with his rook that forced an impossible half-point draw from the jaws of defeat.',
      grandmasterLesson:
        'Never resign prematurely. In lost positions, your job changes: stop playing standard chess and start laying psychological traps, stalemate nets, and perpetual check tricks.',
    },
    {
      championName: 'Tigran Petrosian',
      championTitle: '9th World Chess Champion ("Iron Tigran")',
      avatar: '🛡️',
      gameEvent: '1966 World Championship, Game 10 vs Boris Spassky',
      theme: 'fortress',
      title: 'Petrosian’s Impregnable Exchange Fortress',
      narrative:
        'Facing Spassky’s terrifying kingside attack, Petrosian gave up his rook for a knight. Instead of trying to defend every square, he blockaded the dark squares with his knight and pawns. Spassky had an extra heavy piece, yet couldn’t penetrate a single square. Petrosian slowly strangled Black’s queen and clinched the game!',
      grandmasterLesson:
        'The Petrosian Exchange: Sacrificing a rook for an active minor piece can build an impenetrable fortress. An opponent cannot win if their heavy pieces have no open files to invade.',
    },
    {
      championName: 'Viswanathan Anand',
      championTitle: '5-Time World Chess Champion ("The Tiger of Madras")',
      avatar: '🐯',
      gameEvent: '2010 World Championship, Final Game 12 vs Veselin Topalov',
      theme: 'escape',
      title: 'Anand’s Cold-Blooded Kingside Counter-Punch',
      narrative:
        'Tied in the final classical game of the World Championship in Sofia, Anand faced immense pressure with Black against Topalov’s aggressive assault. Instead of turtling up, Anand accurately defended with nerves of steel, counter-attacked down the open f-file with Queen and Rook, and scored a sensational win to keep the world crown!',
      grandmasterLesson:
        'Cold-blooded defense: Calculate forced moves calmly. When an aggressive attacker over-extends to deliver a knockout blow, their own back ranks and king are left fatally exposed.',
    },
  ],

  mistakes_and_inaccuracies: [
    {
      championName: 'Anatoly Karpov',
      championTitle: '12th World Chess Champion',
      avatar: '🐍',
      gameEvent: '1974 Candidates Final vs Boris Spassky',
      theme: 'master-squeeze',
      title: 'Karpov’s Boa Constrictor Outpost Punishment',
      narrative:
        'When Spassky made a slight positional inaccuracy with an early pawn advance, Karpov didn’t launch a wild attack. He quietly nestled his knight into the d5 hole created by that pawn move. Spassky spent the next 20 moves paralyzed, completely suffocated without a single active counter-chance.',
      grandmasterLesson:
        'Every pawn advance permanently weakens the squares behind it. When your opponent plays an inaccuracy, immediately identify the weakened outpost and occupy it with a minor piece.',
    },
    {
      championName: 'Judit Polgár',
      championTitle: 'Strongest Female Player in Chess History',
      avatar: '⚔️',
      gameEvent: '2002 Russia vs The World vs Garry Kasparov',
      theme: 'counter-attack',
      title: 'Polgár’s Rapid Line-Opening Break',
      narrative:
        'Kasparov played a passive inaccuracy in the Ruy Lopez Berlin. Rather than playing slow maneuvering chess, Judit Polgár immediately struck with a central pawn break, opened the d-file and f-file, and defeated the highest-rated player on earth in 42 ruthless moves.',
      grandmasterLesson:
        'Speed is everything when an opponent misplaces a piece. Crack open the center files immediately before they have the tempo to coordinate their defense.',
    },
    {
      championName: 'Paul Morphy',
      championTitle: 'The Pride and Sorrow of Chess (1837–1884)',
      avatar: '🎩',
      gameEvent: '1858 Paris Opera Game vs Duke of Brunswick & Count Isouard',
      theme: 'win',
      title: 'Morphy’s Principle: The Cost of Wasted Tempos',
      narrative:
        'The Duke and Count wasted tempos moving pieces twice and grabbing flank pawns. Morphy punished every wasted move by sacrificing pawns and pieces on d5 and b5 to strip open lines to the uncastled black king, executing the most famous checkmate in history.',
      grandmasterLesson:
        'Development is paramount: If your opponent moves the same piece twice or falls behind in piece development, blast open the central files to attack the uncastled king.',
    },
  ],

  brilliant_and_best: [
    {
      championName: 'Garry Kasparov',
      championTitle: '13th World Chess Champion ("The Beast from Baku")',
      avatar: '🔥',
      gameEvent: '1999 Wijk aan Zee vs Veselin Topalov ("The Pearl of Wijk aan Zee")',
      theme: 'brilliant-sacrifice',
      title: 'Kasparov’s Immortal Rook Sacrifice (24.Rxd4!!)',
      narrative:
        'Kasparov played 24.Rxd4!!, sacrificing his rook to drag Topalov’s king across the entire board all the way to a3! Kasparov admitted he couldn’t calculate every branch to the end, but intuitively understood that Topalov’s king would never find shelter. It is widely considered the greatest chess game ever played.',
      grandmasterLesson:
        'When your pieces are in peak harmony and the enemy king is unshielded, trust your dynamic instinct. A piece sacrifice that drags the opponent king into the center almost always wins.',
    },
    {
      championName: 'Bobby Fischer',
      championTitle: '11th World Chess Champion',
      avatar: '🌟',
      gameEvent: '1956 Rosenwald Memorial vs Donald Byrne ("The Game of the Century")',
      theme: 'brilliant-sacrifice',
      title: '13-Year-Old Fischer’s Queen Sacrifice (17...Be6!!)',
      narrative:
        'At just 13 years old, Bobby Fischer stunned the master Donald Byrne by leaving his Queen to be captured with 17...Be6!!. Byrne took the Queen, but Fischer’s minor pieces wove a devastating windmill mating net that completely destroyed White’s entire army.',
      grandmasterLesson:
        'The Queen is not sacred: A coordinated bishop, knight, and rook acting as a unified unit are far more powerful than an isolated enemy queen.',
    },
    {
      championName: 'Magnus Carlsen',
      championTitle: '5-Time World Chess Champion & Highest Rated Player in History (2882)',
      avatar: '🧊',
      gameEvent: '2016 World Championship Tiebreak vs Sergey Karjakin',
      theme: 'win',
      title: 'Carlsen’s Queen Sacrifice Walk-Off (50.Qh6+!!)',
      narrative:
        'Needing a win to clinch the World Championship match, Carlsen found the breathtaking finale 50.Qh6+!!, sacrificing his queen to force Karjakin’s king into an unavoidable checkmate by rook and bishop. It was a walk-off home run on the world stage.',
      grandmasterLesson:
        'Always look for the forcing finishing blow: Checks, captures, and mate threats leave your opponent with zero choices. Calculate every check first!',
    },
  ],

  openings_book: [
    {
      championName: 'Bobby Fischer & Garry Kasparov',
      championTitle: 'World Champions & Masters of Dynamic Openings',
      avatar: '📖',
      gameEvent: 'World Championship Opening Preparation',
      theme: 'win',
      title: 'The Razor-Sharp Sicilian Najdorf Philosophy',
      narrative:
        'Both Fischer and Kasparov championed the Sicilian Defense because it unbalances the game from move 1. White gets central space, but Black gets the half-open c-file and queenside counterplay. Grandmasters use this to fight for a win even with the Black pieces.',
      grandmasterLesson:
        'Play openings that match your fighting ambition. Asymmetrical pawn structures guarantee a sharp, decisive contest without boring draws.',
    },
    {
      championName: 'Jose Raul Capablanca & Magnus Carlsen',
      championTitle: 'Champions of Classical Perfection',
      avatar: '🏛️',
      gameEvent: 'Classical World Championship Matches',
      theme: 'master-squeeze',
      title: 'The Queen’s Gambit & Classical Space Control',
      narrative:
        'Capablanca and Carlsen dominated their eras using 1.d4 and the Queen’s Gambit. By controlling central squares (d4, e4, c4) and developing with tempo, they achieved risk-free small advantages that they converted into endgame wins with clockwork precision.',
      grandmasterLesson:
        'Control the center, control the game. When your center pawns control key squares, your opponent is forced to retreat pieces to cramped, awkward positions.',
    },
  ],
};

/**
 * Returns dynamic Grandmaster Coach feedback and an international champion lore story for any move.
 */
export function generateCoachFeedback(ctx: MoveContext): CoachFeedback {
  const { classification, san, piece, captured, evalLoss, bestMoveSan, moveNumber } = ctx;

  switch (classification) {
    case 'brilliant': {
      const story =
        CHAMPION_STORIES.brilliant_and_best[
          Math.floor(Math.random() * CHAMPION_STORIES.brilliant_and_best.length)
        ];
      return {
        coachName: 'GM Viktor',
        avatar: '🧙‍♂️',
        mood: 'astonished',
        reaction: 'Astounding! Pure Grandmaster genius!',
        tacticalBreakdown: `You played ${san}, an exceptional, creative tactical breakthrough! Even computer engines had to calculate deeply to realize why your sacrifice or combination works. You took command of the initiative.`,
        threatAnalysis: 'Your pieces now coordinate with laser precision, threatening unstoppable invasion lines.',
        championLore: story,
      };
    }

    case 'best': {
      const story =
        CHAMPION_STORIES.brilliant_and_best[
          Math.floor(Math.random() * CHAMPION_STORIES.brilliant_and_best.length)
        ];
      return {
        coachName: 'GM Viktor',
        avatar: '😎',
        mood: 'proud',
        reaction: 'Magnus Carlsen would nod in approval!',
        tacticalBreakdown: `Playing ${san} was the absolute top engine choice. It maximizes your piece activity, secures key outposts, and keeps optimal pressure without conceding any weaknesses.`,
        threatAnalysis: `Your position is rock solid. ${san} maintains total positional mastery.`,
        championLore: story,
      };
    }

    case 'excellent':
    case 'good': {
      const story =
        moveNumber < 8
          ? CHAMPION_STORIES.openings_book[0]
          : CHAMPION_STORIES.brilliant_and_best[2];
      return {
        coachName: 'GM Viktor',
        avatar: '😊',
        mood: 'approving',
        reaction: 'Very solid, purposeful chess.',
        tacticalBreakdown: `Good move with ${san}! You are adhering to core chess fundamentals: developing your pieces, activating the heavy artillery, and maintaining king safety.`,
        threatAnalysis: 'Keeps the balance firmly in your hands with healthy piece harmony.',
        championLore: story,
      };
    }

    case 'book': {
      const story =
        CHAMPION_STORIES.openings_book[
          Math.floor(Math.random() * CHAMPION_STORIES.openings_book.length)
        ];
      return {
        coachName: 'GM Viktor',
        avatar: '📚',
        mood: 'approving',
        reaction: 'Grandmaster opening preparation!',
        tacticalBreakdown: `${san} is known opening book theory! Thousands of international master and world championship games have reached this exact setup. You are setting up healthy pawn chains and king protection.`,
        threatAnalysis: 'Establishing central claims and preparing king castling.',
        championLore: story,
      };
    }

    case 'inaccuracy': {
      const story =
        CHAMPION_STORIES.mistakes_and_inaccuracies[
          Math.floor(Math.random() * CHAMPION_STORIES.mistakes_and_inaccuracies.length)
        ];
      return {
        coachName: 'GM Viktor',
        avatar: '🧐',
        mood: 'thoughtful',
        reaction: 'A slight slip. Let’s tighten up our technique.',
        tacticalBreakdown: `You played ${san}, which is slightly inaccurate (-${(evalLoss / 100).toFixed(1)} pawns). While it doesn't lose the game outright, it gave up a sliver of your advantage. The engine preferred ${bestMoveSan || 'a more active piece maneuver'}.`,
        threatAnalysis: `Watch out: ${san} gives your opponent a tempo to reorganize their pieces.`,
        championLore: story,
      };
    }

    case 'mistake': {
      const story =
        CHAMPION_STORIES.mistakes_and_inaccuracies[
          Math.floor(Math.random() * CHAMPION_STORIES.mistakes_and_inaccuracies.length)
        ];
      return {
        coachName: 'GM Viktor',
        avatar: '😬',
        mood: 'concerned',
        reaction: 'Warning! You let your opponent off the hook.',
        tacticalBreakdown: `Playing ${san} was a noticeable mistake (-${(evalLoss / 100).toFixed(1)} pawns). You gave away central control or opened lines against yourself. The grandmaster solution was ${bestMoveSan || 're-routing your pieces'}.`,
        threatAnalysis: `Your opponent can now seize the initiative or win key central squares.`,
        championLore: story,
      };
    }

    case 'blunder': {
      const story =
        CHAMPION_STORIES.blunder_escapes[
          Math.floor(Math.random() * CHAMPION_STORIES.blunder_escapes.length)
        ];
      return {
        coachName: 'GM Viktor',
        avatar: '🤦‍♂️',
        mood: 'facepalm',
        reaction: 'Ouch! A critical blunder. But here is how champions escape!',
        tacticalBreakdown: `Playing ${san} was a severe blunder (-${(evalLoss / 100).toFixed(1)} pawns). This hung material or walked into a deadly tactic. The engine urgently wanted ${bestMoveSan || 'a defensive block'}. But don’t despair—even World Champions blunder in high-stakes matches!`,
        threatAnalysis: `Immediate tactical danger! Look for counter-attacks or stalemate tricks to escape.`,
        championLore: story,
      };
    }

    case 'missed_win': {
      const story =
        CHAMPION_STORIES.blunder_escapes[0];
      return {
        coachName: 'GM Viktor',
        avatar: '😱',
        mood: 'alarmed',
        reaction: 'Oh no! A World Championship knockout blow was right there!',
        tacticalBreakdown: `You had a completely decisive winning position, but played ${san} instead of ${bestMoveSan}. The engine had a lethal winning sequence that would have finished the game immediately!`,
        threatAnalysis: `Your opponent was given a second life. Next time, look for forceful checks and Queen/Rook combinations!`,
        championLore: story,
      };
    }

    default: {
      const story = CHAMPION_STORIES.brilliant_and_best[0];
      return {
        coachName: 'GM Viktor',
        avatar: '😊',
        mood: 'approving',
        reaction: 'Solid moves on the board.',
        tacticalBreakdown: `You played ${san}. Keep calculating checks, captures, and threats on every single move.`,
        championLore: story,
      };
    }
  }
}
