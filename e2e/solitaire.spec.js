/**
 * End-to-end tests for Solitaire game using Playwright
 * Tests game UI interactions and visual elements
 */

import { expect, test } from "@playwright/test";

test.describe("Solitaire Game E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`file://${process.cwd()}/solitaire.html`);
    // Wait for game to initialize
    await page.waitForSelector(".card");
  });

  test.describe("Game Initialization", () => {
    test("should display the game title", async ({ page }) => {
      await expect(page).toHaveTitle("Solitaire");
    });

    test("should display New Game button", async ({ page }) => {
      const newGameBtn = page.locator("#new-game");
      await expect(newGameBtn).toBeVisible();
      await expect(newGameBtn).toContainText("New Game");
    });

    test("should display Undo button", async ({ page }) => {
      const undoBtn = page.locator("#undo");
      await expect(undoBtn).toBeVisible();
      await expect(undoBtn).toContainText("Undo");
    });

    test("should display initial stats", async ({ page }) => {
      await expect(page.locator(".moves")).toContainText("0");
      await expect(page.locator(".score")).toContainText("0");
      await expect(page.locator(".time")).toContainText("0:00");
    });

    test("should display 7 tableau piles", async ({ page }) => {
      for (let i = 0; i < 7; i++) {
        await expect(page.locator(`#tableau-${i}`)).toBeVisible();
      }
    });

    test("should display 4 foundation slots", async ({ page }) => {
      for (let i = 0; i < 4; i++) {
        await expect(page.locator(`#foundation-${i}`)).toBeVisible();
      }
    });

    test("should display stock pile", async ({ page }) => {
      await expect(page.locator("#stock")).toBeVisible();
    });

    test("should display waste pile", async ({ page }) => {
      await expect(page.locator("#waste")).toBeVisible();
    });

    test("Undo button should be disabled initially", async ({ page }) => {
      const undoBtn = page.locator("#undo");
      await expect(undoBtn).toBeDisabled();
    });
  });

  test.describe("Card Display", () => {
    test("should have cards in the stock pile", async ({ page }) => {
      const stockCard = page.locator("#stock .card");
      await expect(stockCard).toBeVisible();
    });

    test("stock card should be face down (have back class)", async ({
      page,
    }) => {
      const stockCard = page.locator("#stock .card");
      await expect(stockCard).toHaveClass(/back/);
    });

    test("tableau should have face-up cards on top", async ({ page }) => {
      // At least one tableau pile should have a face-up card
      const faceUpCards = page.locator(".tableau-pile .card:not(.back)");
      const count = await faceUpCards.count();
      expect(count).toBeGreaterThan(0);
    });

    test("face-up cards should display suit and value", async ({ page }) => {
      const faceUpCard = page.locator(".tableau-pile .card:not(.back)").first();
      const cardValue = faceUpCard.locator(".card-value").first();
      const cardSuit = faceUpCard.locator(".card-suit").first();

      await expect(cardValue).toBeVisible();
      await expect(cardSuit).toBeVisible();
    });
  });

  test.describe("Stock Pile Interaction", () => {
    test("clicking stock should move card to waste", async ({ page }) => {
      const stock = page.locator("#stock");
      await stock.click();

      // Wait for move animation
      await page.waitForTimeout(100);

      // Waste should now have a card
      const wasteCard = page.locator("#waste .card");
      await expect(wasteCard).toBeVisible();
    });

    test("clicking stock should increment moves", async ({ page }) => {
      const stock = page.locator("#stock");
      await stock.click();

      await expect(page.locator(".moves")).toContainText("1");
    });

    test("clicking stock multiple times should work", async ({ page }) => {
      const stock = page.locator("#stock");

      for (let i = 0; i < 3; i++) {
        await stock.click();
        await page.waitForTimeout(50);
      }

      await expect(page.locator(".moves")).toContainText("3");
    });
  });

  test.describe("New Game Button", () => {
    test("clicking New Game should reset moves to 0", async ({ page }) => {
      // Make some moves first
      const stock = page.locator("#stock");
      await stock.click();
      await page.waitForTimeout(50);

      // Click New Game
      await page.locator("#new-game").click();
      await page.waitForTimeout(100);

      await expect(page.locator(".moves")).toContainText("0");
    });

    test("clicking New Game should reset score to 0", async ({ page }) => {
      // Click New Game
      await page.locator("#new-game").click();
      await page.waitForTimeout(100);

      await expect(page.locator(".score")).toContainText("0");
    });

    test("clicking New Game should reset time", async ({ page }) => {
      // Wait for some time to pass
      await page.waitForTimeout(1500);

      // Click New Game
      await page.locator("#new-game").click();

      // Time should reset - check immediately after click (within 1 second margin)
      const timeText = await page.locator(".time").textContent();
      expect(timeText).toMatch(/0:0[0-1]/);
    });
  });

  test.describe("Undo Functionality", () => {
    test("Undo button should be enabled after a move", async ({ page }) => {
      const stock = page.locator("#stock");
      await stock.click();
      await page.waitForTimeout(100);

      const undoBtn = page.locator("#undo");
      await expect(undoBtn).toBeEnabled();
    });

    test("clicking Undo should decrement moves", async ({ page }) => {
      const stock = page.locator("#stock");
      await stock.click();
      await page.waitForTimeout(100);

      await expect(page.locator(".moves")).toContainText("1");

      await page.locator("#undo").click();
      await page.waitForTimeout(100);

      await expect(page.locator(".moves")).toContainText("0");
    });

    test("Undo button should be disabled after undoing all moves", async ({
      page,
    }) => {
      const stock = page.locator("#stock");
      await stock.click();
      await page.waitForTimeout(100);

      await page.locator("#undo").click();
      await page.waitForTimeout(100);

      const undoBtn = page.locator("#undo");
      await expect(undoBtn).toBeDisabled();
    });
  });

  test.describe("Timer", () => {
    test("timer should increment", async ({ page }) => {
      // Wait for 2 seconds
      await page.waitForTimeout(2000);

      const timeText = await page.locator(".time").textContent();
      // Time should be at least 0:01 or 0:02
      expect(timeText).toMatch(/0:0[1-9]|0:[1-5]\d/);
    });
  });

  test.describe("Win Message", () => {
    test("win message should be hidden initially", async ({ page }) => {
      const winMessage = page.locator("#win-message");
      await expect(winMessage).toBeHidden();
    });
  });

  test.describe("Card Styling", () => {
    test("red cards should have card-red class", async ({ page }) => {
      // Find a face-up card with red suit (♥ or ♦)
      const redCard = page
        .locator('.card[data-suit="♥"], .card[data-suit="♦"]')
        .first();

      if ((await redCard.count()) > 0) {
        await expect(redCard).toHaveClass(/card-red/);
      }
    });

    test("black cards should have card-black class", async ({ page }) => {
      // Find a face-up card with black suit (♠ or ♣)
      const blackCard = page
        .locator('.card[data-suit="♠"], .card[data-suit="♣"]')
        .first();

      if ((await blackCard.count()) > 0) {
        await expect(blackCard).toHaveClass(/card-black/);
      }
    });
  });

  test.describe("Responsive Design", () => {
    test("game should be visible on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(100);

      await expect(page.locator(".container")).toBeVisible();
      await expect(page.locator("#new-game")).toBeVisible();
    });

    test("cards should resize on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(100);

      const card = page.locator(".card").first();
      const box = await card.boundingBox();

      // Cards should be smaller on mobile (40px width based on CSS)
      expect(box.width).toBeLessThanOrEqual(50);
    });
  });

  test.describe("Accessibility", () => {
    test("buttons should be focusable", async ({ page }) => {
      const newGameBtn = page.locator("#new-game");
      await newGameBtn.focus();
      await expect(newGameBtn).toBeFocused();
    });

    test("game container should be visible", async ({ page }) => {
      const container = page.locator(".container");
      await expect(container).toBeVisible();
    });
  });

  test.describe("Card Dragging", () => {
    test("face-up cards should have draggable attribute", async ({ page }) => {
      const draggableCard = page
        .locator('.tableau-pile .card[draggable="true"]')
        .first();
      await expect(draggableCard).toHaveAttribute("draggable", "true");
    });

    test("face-down cards should not be draggable", async ({ page }) => {
      const faceDownCard = page.locator(".card.back").first();
      if ((await faceDownCard.count()) > 0) {
        const isDraggable = await faceDownCard.getAttribute("draggable");
        expect(isDraggable).not.toBe("true");
      }
    });

    test("should not allow dropping cards in gaps between foundations", async ({
      page,
    }) => {
      // First, get an Ace from waste pile by clicking stock until we find one
      // or use a card from tableau
      const stock = page.locator("#stock");

      // Click stock to get a card in waste
      await stock.click();
      await page.waitForTimeout(100);

      // Get the waste card
      const wasteCard = page.locator("#waste .card").first();
      if ((await wasteCard.count()) === 0) {
        return; // Skip if no waste card available
      }

      // Get initial moves count
      const initialMoves = await page.locator(".moves").textContent();

      // Get positions of foundation slots to find the gap between them
      const foundation0 = page.locator("#foundation-0");
      const foundation1 = page.locator("#foundation-1");

      const box0 = await foundation0.boundingBox();
      const box1 = await foundation1.boundingBox();

      if (!box0 || !box1) return;

      // Calculate the gap position (between foundation 0 and 1)
      const gapX = box0.x + box0.width + (box1.x - (box0.x + box0.width)) / 2;
      const gapY = box0.y + box0.height / 2;

      // Try to drag the waste card to the gap
      const wasteBox = await wasteCard.boundingBox();
      if (!wasteBox) return;

      await page.mouse.move(
        wasteBox.x + wasteBox.width / 2,
        wasteBox.y + wasteBox.height / 2
      );
      await page.mouse.down();
      await page.mouse.move(gapX, gapY);
      await page.mouse.up();

      await page.waitForTimeout(100);

      // Moves should not have increased (drop in gap should be rejected)
      // The card should still be in waste, not moved to foundation
      const finalMoves = await page.locator(".moves").textContent();

      // If card was an Ace and got moved to foundation, moves would increase by 1
      // But dropping in the gap should not work, so moves should stay the same
      // (Note: moves increased by 1 from initial stock click, so we compare to that)
      expect(finalMoves).toBe(initialMoves);
    });

    test("should not allow moving cards between foundations (score farming)", async ({
      page,
    }) => {
      // This test verifies that cards cannot be moved from one foundation to another
      // which would allow score farming by repeatedly moving cards between foundations

      // We need to use page.evaluate to directly manipulate the game state
      // to set up a scenario where we have cards on foundations
      await page.evaluate(() => {
        // Access game state and add an Ace to foundation 0
        window.foundations = window.foundations || [[], [], [], []];
        window.foundations[0] = [
          { suit: "♠", value: "A", color: "black", faceUp: true },
        ];
        window.foundations[1] = []; // Empty foundation 1
        window.renderGame();
      });

      await page.waitForTimeout(100);

      // Get the card on foundation 0
      const foundationCard = page.locator("#foundation-0 .card").first();
      const cardExists = (await foundationCard.count()) > 0;

      if (!cardExists) {
        // Skip if setup failed
        return;
      }

      // Get initial score
      const initialScore = await page.locator(".score").textContent();

      // Get positions
      const cardBox = await foundationCard.boundingBox();
      const foundation1 = page.locator("#foundation-1");
      const targetBox = await foundation1.boundingBox();

      if (!cardBox || !targetBox) return;

      // Try to drag from foundation 0 to foundation 1
      await page.mouse.move(
        cardBox.x + cardBox.width / 2,
        cardBox.y + cardBox.height / 2
      );
      await page.mouse.down();
      await page.mouse.move(
        targetBox.x + targetBox.width / 2,
        targetBox.y + targetBox.height / 2
      );
      await page.mouse.up();

      await page.waitForTimeout(100);

      // Score should not have changed (move should be rejected)
      const finalScore = await page.locator(".score").textContent();
      expect(finalScore).toBe(initialScore);

      // Card should still be on foundation 0
      const cardStillOnF0 = await page.locator("#foundation-0 .card").count();
      expect(cardStillOnF0).toBe(1);
    });
  });

  test.describe("Game State Persistence", () => {
    test("game state should persist across renders", async ({ page }) => {
      // Click stock to make a move
      await page.locator("#stock").click();
      await page.waitForTimeout(100);

      const movesAfterClick = await page.locator(".moves").textContent();

      // The moves should be 1
      expect(movesAfterClick).toBe("1");

      // Click stock again
      await page.locator("#stock").click();
      await page.waitForTimeout(100);

      const movesAfterSecondClick = await page.locator(".moves").textContent();
      expect(movesAfterSecondClick).toBe("2");
    });
  });
});
