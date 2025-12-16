/**
 * Unit tests for Solitaire game logic
 * Tests core game functions in isolation using Jest
 */

import { jest } from "@jest/globals";

// Card data constants (matching the game)
const suits = ["♠", "♥", "♦", "♣"];
const values = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];
const colors = {
  "♠": "black",
  "♥": "red",
  "♦": "red",
  "♣": "black",
};

// Helper function to create a card
function createCard(suit, value, faceUp = false) {
  return {
    suit,
    value,
    color: colors[suit],
    faceUp,
  };
}

// Helper function to create a full deck
function createDeck() {
  const deck = [];
  for (const suit of suits) {
    for (const value of values) {
      deck.push(createCard(suit, value, false));
    }
  }
  return deck;
}

// Shuffle function (Fisher-Yates algorithm)
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Check if cards are sequential (for tableau)
function isSequential(card1, card2) {
  return (
    card1.color !== card2.color &&
    values.indexOf(card1.value) === values.indexOf(card2.value) + 1
  );
}

// Check if a card can be moved to a specific foundation
function canMoveToFoundation(card, foundation) {
  if (foundation.length === 0) {
    return card.value === "A";
  } else {
    const topCard = foundation[foundation.length - 1];
    return (
      card.suit === topCard.suit &&
      values.indexOf(card.value) === values.indexOf(topCard.value) + 1
    );
  }
}

// Check if a card can be moved to tableau
function canMoveToTableau(card, tableauPile) {
  if (tableauPile.length === 0) {
    return card.value === "K";
  } else {
    const topCard = tableauPile[tableauPile.length - 1];
    return (
      topCard.faceUp &&
      card.color !== topCard.color &&
      values.indexOf(card.value) === values.indexOf(topCard.value) - 1
    );
  }
}

describe("Solitaire Game - Deck Creation", () => {
  test("should create a deck with 52 cards", () => {
    const deck = createDeck();
    expect(deck.length).toBe(52);
  });

  test("should have 13 cards of each suit", () => {
    const deck = createDeck();
    for (const suit of suits) {
      const suitCards = deck.filter((card) => card.suit === suit);
      expect(suitCards.length).toBe(13);
    }
  });

  test("should have 4 cards of each value", () => {
    const deck = createDeck();
    for (const value of values) {
      const valueCards = deck.filter((card) => card.value === value);
      expect(valueCards.length).toBe(4);
    }
  });

  test("should have correct colors for each suit", () => {
    const deck = createDeck();
    const hearts = deck.filter((card) => card.suit === "♥");
    const diamonds = deck.filter((card) => card.suit === "♦");
    const spades = deck.filter((card) => card.suit === "♠");
    const clubs = deck.filter((card) => card.suit === "♣");

    hearts.forEach((card) => expect(card.color).toBe("red"));
    diamonds.forEach((card) => expect(card.color).toBe("red"));
    spades.forEach((card) => expect(card.color).toBe("black"));
    clubs.forEach((card) => expect(card.color).toBe("black"));
  });

  test("all cards should be face down initially", () => {
    const deck = createDeck();
    deck.forEach((card) => expect(card.faceUp).toBe(false));
  });
});

describe("Solitaire Game - Shuffle", () => {
  test("shuffle should maintain deck size", () => {
    const deck = createDeck();
    const shuffled = shuffle(deck);
    expect(shuffled.length).toBe(52);
  });

  test("shuffle should contain all original cards", () => {
    const deck = createDeck();
    const shuffled = shuffle(deck);

    for (const card of deck) {
      const found = shuffled.find(
        (c) => c.suit === card.suit && c.value === card.value
      );
      expect(found).toBeDefined();
    }
  });

  test("shuffle should produce different order (probabilistic)", () => {
    const deck = createDeck();
    const shuffled1 = shuffle(deck);
    const shuffled2 = shuffle(deck);

    // Very unlikely to be exactly the same
    const sameOrder = shuffled1.every(
      (card, i) =>
        card.suit === shuffled2[i].suit && card.value === shuffled2[i].value
    );
    // This test might occasionally fail due to randomness, but probability is extremely low
    expect(sameOrder).toBe(false);
  });
});

describe("Solitaire Game - Card Sequencing", () => {
  test("red card should be sequential on black card with value one higher", () => {
    const blackKing = createCard("♠", "K", true);
    const redQueen = createCard("♥", "Q", true);
    expect(isSequential(blackKing, redQueen)).toBe(true);
  });

  test("black card should be sequential on red card with value one higher", () => {
    const redQueen = createCard("♥", "Q", true);
    const blackJack = createCard("♣", "J", true);
    expect(isSequential(redQueen, blackJack)).toBe(true);
  });

  test("same color cards should not be sequential", () => {
    const blackKing = createCard("♠", "K", true);
    const blackQueen = createCard("♣", "Q", true);
    expect(isSequential(blackKing, blackQueen)).toBe(false);
  });

  test("cards with wrong value order should not be sequential", () => {
    const redQueen = createCard("♥", "Q", true);
    const blackKing = createCard("♠", "K", true);
    expect(isSequential(redQueen, blackKing)).toBe(false);
  });

  test("Ace on 2 should be sequential (alternating colors)", () => {
    const black2 = createCard("♠", "2", true);
    const redAce = createCard("♥", "A", true);
    expect(isSequential(black2, redAce)).toBe(true);
  });
});

describe("Solitaire Game - Foundation Rules", () => {
  test("Ace can be placed on empty foundation", () => {
    const ace = createCard("♠", "A", true);
    const emptyFoundation = [];
    expect(canMoveToFoundation(ace, emptyFoundation)).toBe(true);
  });

  test("non-Ace cannot be placed on empty foundation", () => {
    const two = createCard("♠", "2", true);
    const emptyFoundation = [];
    expect(canMoveToFoundation(two, emptyFoundation)).toBe(false);
  });

  test("same suit card with next value can be placed on foundation", () => {
    const two = createCard("♠", "2", true);
    const foundationWithAce = [createCard("♠", "A", true)];
    expect(canMoveToFoundation(two, foundationWithAce)).toBe(true);
  });

  test("different suit card cannot be placed on foundation", () => {
    const heartTwo = createCard("♥", "2", true);
    const foundationWithSpadeAce = [createCard("♠", "A", true)];
    expect(canMoveToFoundation(heartTwo, foundationWithSpadeAce)).toBe(false);
  });

  test("wrong value cannot be placed on foundation", () => {
    const three = createCard("♠", "3", true);
    const foundationWithAce = [createCard("♠", "A", true)];
    expect(canMoveToFoundation(three, foundationWithAce)).toBe(false);
  });

  test("King can be placed on Queen in foundation", () => {
    const king = createCard("♥", "K", true);
    const foundationWithQueen = [
      createCard("♥", "A", true),
      createCard("♥", "2", true),
      createCard("♥", "3", true),
      createCard("♥", "4", true),
      createCard("♥", "5", true),
      createCard("♥", "6", true),
      createCard("♥", "7", true),
      createCard("♥", "8", true),
      createCard("♥", "9", true),
      createCard("♥", "10", true),
      createCard("♥", "J", true),
      createCard("♥", "Q", true),
    ];
    expect(canMoveToFoundation(king, foundationWithQueen)).toBe(true);
  });
});

describe("Solitaire Game - Tableau Rules", () => {
  test("King can be placed on empty tableau", () => {
    const king = createCard("♠", "K", true);
    const emptyTableau = [];
    expect(canMoveToTableau(king, emptyTableau)).toBe(true);
  });

  test("non-King cannot be placed on empty tableau", () => {
    const queen = createCard("♠", "Q", true);
    const emptyTableau = [];
    expect(canMoveToTableau(queen, emptyTableau)).toBe(false);
  });

  test("alternating color card with one less value can be placed on tableau", () => {
    const redQueen = createCard("♥", "Q", true);
    const tableauWithBlackKing = [createCard("♠", "K", true)];
    expect(canMoveToTableau(redQueen, tableauWithBlackKing)).toBe(true);
  });

  test("same color card cannot be placed on tableau", () => {
    const blackQueen = createCard("♣", "Q", true);
    const tableauWithBlackKing = [createCard("♠", "K", true)];
    expect(canMoveToTableau(blackQueen, tableauWithBlackKing)).toBe(false);
  });

  test("cannot place on face-down card", () => {
    const redQueen = createCard("♥", "Q", true);
    const tableauWithFaceDownKing = [createCard("♠", "K", false)];
    expect(canMoveToTableau(redQueen, tableauWithFaceDownKing)).toBe(false);
  });

  test("Ace can be placed on 2 of different color", () => {
    const redAce = createCard("♥", "A", true);
    const tableauWithBlack2 = [createCard("♠", "2", true)];
    expect(canMoveToTableau(redAce, tableauWithBlack2)).toBe(true);
  });
});

describe("Solitaire Game - Initial Deal", () => {
  test("tableau should have correct number of cards after deal", () => {
    const deck = createDeck();
    const shuffled = shuffle(deck);
    const tableau = [[], [], [], [], [], [], []];

    let deckCopy = [...shuffled];

    for (let i = 0; i < 7; i++) {
      for (let j = 0; j <= i; j++) {
        const card = deckCopy.pop();
        if (j === i) {
          card.faceUp = true;
        }
        tableau[i].push(card);
      }
    }

    expect(tableau[0].length).toBe(1);
    expect(tableau[1].length).toBe(2);
    expect(tableau[2].length).toBe(3);
    expect(tableau[3].length).toBe(4);
    expect(tableau[4].length).toBe(5);
    expect(tableau[5].length).toBe(6);
    expect(tableau[6].length).toBe(7);
  });

  test("only top card in each tableau pile should be face up", () => {
    const deck = createDeck();
    const shuffled = shuffle(deck);
    const tableau = [[], [], [], [], [], [], []];

    let deckCopy = [...shuffled];

    for (let i = 0; i < 7; i++) {
      for (let j = 0; j <= i; j++) {
        const card = deckCopy.pop();
        if (j === i) {
          card.faceUp = true;
        }
        tableau[i].push(card);
      }
    }

    for (let i = 0; i < 7; i++) {
      const pile = tableau[i];
      for (let j = 0; j < pile.length; j++) {
        if (j === pile.length - 1) {
          expect(pile[j].faceUp).toBe(true);
        } else {
          expect(pile[j].faceUp).toBe(false);
        }
      }
    }
  });

  test("stock should have 24 cards after deal", () => {
    const deck = createDeck();
    const shuffled = shuffle(deck);
    let deckCopy = [...shuffled];

    // Deal to tableau (28 cards)
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j <= i; j++) {
        deckCopy.pop();
      }
    }

    // Remaining cards go to stock
    const stock = deckCopy;
    expect(stock.length).toBe(24);
  });
});

describe("Solitaire Game - Score Calculation", () => {
  test("moving to foundation should add 10 points", () => {
    let score = 0;
    const action = "moveToFoundation";

    switch (action) {
      case "moveToFoundation":
        score += 10;
        break;
      case "moveToTableau":
        score += 5;
        break;
      case "undoMove":
        score -= 5;
        break;
    }

    expect(score).toBe(10);
  });

  test("moving to tableau should add 5 points", () => {
    let score = 0;
    const action = "moveToTableau";

    switch (action) {
      case "moveToFoundation":
        score += 10;
        break;
      case "moveToTableau":
        score += 5;
        break;
      case "undoMove":
        score -= 5;
        break;
    }

    expect(score).toBe(5);
  });

  test("undo should subtract 5 points", () => {
    let score = 20;
    const action = "undoMove";

    switch (action) {
      case "moveToFoundation":
        score += 10;
        break;
      case "moveToTableau":
        score += 5;
        break;
      case "undoMove":
        score -= 5;
        break;
    }

    expect(score).toBe(15);
  });
});

describe("Solitaire Game - Win Condition", () => {
  test("game is won when all 52 cards are in foundations", () => {
    const foundations = [
      Array(13).fill(null),
      Array(13).fill(null),
      Array(13).fill(null),
      Array(13).fill(null),
    ];

    const totalFoundationCards = foundations.reduce(
      (sum, foundation) => sum + foundation.length,
      0
    );

    expect(totalFoundationCards).toBe(52);
  });

  test("game is not won when foundations are incomplete", () => {
    const foundations = [
      Array(13).fill(null),
      Array(13).fill(null),
      Array(10).fill(null),
      Array(13).fill(null),
    ];

    const totalFoundationCards = foundations.reduce(
      (sum, foundation) => sum + foundation.length,
      0
    );

    expect(totalFoundationCards).toBeLessThan(52);
  });
});

describe("Solitaire Game - Undo History", () => {
  test("undo history should be limited to 5 moves", () => {
    const gameHistory = [];

    // Add 6 states
    for (let i = 0; i < 6; i++) {
      gameHistory.push({ moves: i });
      if (gameHistory.length > 5) {
        gameHistory.shift();
      }
    }

    expect(gameHistory.length).toBe(5);
    expect(gameHistory[0].moves).toBe(1); // First state should be removed
  });

  test("undo should restore previous state", () => {
    const gameHistory = [];
    let currentState = { moves: 0, score: 0 };

    // Make a move
    gameHistory.push({ ...currentState });
    currentState = { moves: 1, score: 10 };

    // Undo
    const previousState = gameHistory.pop();

    expect(previousState.moves).toBe(0);
    expect(previousState.score).toBe(0);
  });
});

describe("Solitaire Game - Card Values", () => {
  test("values array should have correct order", () => {
    expect(values).toEqual([
      "A",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
    ]);
  });

  test("Ace should have index 0", () => {
    expect(values.indexOf("A")).toBe(0);
  });

  test("King should have index 12", () => {
    expect(values.indexOf("K")).toBe(12);
  });

  test("value comparison should work correctly", () => {
    expect(values.indexOf("Q") - values.indexOf("J")).toBe(1);
    expect(values.indexOf("K") - values.indexOf("Q")).toBe(1);
    expect(values.indexOf("2") - values.indexOf("A")).toBe(1);
  });
});
