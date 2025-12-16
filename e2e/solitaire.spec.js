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
      await expect(newGameBtn).toHaveText("New Game");
    });

    test("should display Undo button", async ({ page }) => {
      const undoBtn = page.locator("#undo");
      await expect(undoBtn).toBeVisible();
      await expect(undoBtn).toHaveText("Undo");
    });

    test("should display initial stats", async ({ page }) => {
      await expect(page.locator(".moves")).toContainText("Moves: 0");
      await expect(page.locator(".score")).toContainText("Score: 0");
      await expect(page.locator(".time")).toContainText("Time: 0:00");
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

      await expect(page.locator(".moves")).toContainText("Moves: 1");
    });

    test("clicking stock multiple times should work", async ({ page }) => {
      const stock = page.locator("#stock");

      for (let i = 0; i < 3; i++) {
        await stock.click();
        await page.waitForTimeout(50);
      }

      await expect(page.locator(".moves")).toContainText("Moves: 3");
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

      await expect(page.locator(".moves")).toContainText("Moves: 0");
    });

    test("clicking New Game should reset score to 0", async ({ page }) => {
      // Click New Game
      await page.locator("#new-game").click();
      await page.waitForTimeout(100);

      await expect(page.locator(".score")).toContainText("Score: 0");
    });

    test("clicking New Game should reset time", async ({ page }) => {
      // Wait for some time to pass
      await page.waitForTimeout(1500);

      // Click New Game
      await page.locator("#new-game").click();

      // Time should reset - check immediately after click (within 1 second margin)
      const timeText = await page.locator(".time").textContent();
      expect(timeText).toMatch(/Time: 0:0[0-1]/);
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

      await expect(page.locator(".moves")).toContainText("Moves: 1");

      await page.locator("#undo").click();
      await page.waitForTimeout(100);

      await expect(page.locator(".moves")).toContainText("Moves: 0");
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
      expect(timeText).toMatch(/Time: 0:0[1-9]|Time: 0:[1-5]\d/);
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
  });

  test.describe("Game State Persistence", () => {
    test("game state should persist across renders", async ({ page }) => {
      // Click stock to make a move
      await page.locator("#stock").click();
      await page.waitForTimeout(100);

      const movesAfterClick = await page.locator(".moves").textContent();

      // The moves should be 1
      expect(movesAfterClick).toBe("Moves: 1");

      // Click stock again
      await page.locator("#stock").click();
      await page.waitForTimeout(100);

      const movesAfterSecondClick = await page.locator(".moves").textContent();
      expect(movesAfterSecondClick).toBe("Moves: 2");
    });
  });
});
