import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Mehfil - End-to-End Core Flow & Accessibility Audit', () => {
  test('completes full event planning flow on desktop and passes axe checks in light and dark', async ({
    page,
  }, testInfo) => {
    test.setTimeout(60000);
    await page.goto('/');

    // 1. Initial Axe scan on Intake screen (Light mode)
    const initialAxe = await new AxeBuilder({ page }).analyze();
    expect(initialAxe.violations).toEqual([]);

    // Capture Intake Hero screenshot for README on Desktop
    if (testInfo.project.name.includes('Desktop')) {
      await page.screenshot({ path: 'docs/screenshots/01-intake-hero.png', fullPage: true });
    }

    // 2. Toggle to Dark mode and verify Axe scan
    const themeButton = page.locator('button[aria-label*="Switch to dark theme"]');
    if (await themeButton.isVisible()) {
      await themeButton.click();
      // Allow CSS transitions to settle before contrast sampling
      await page.waitForTimeout(400);
      const darkAxe = await new AxeBuilder({ page }).analyze();
      expect(darkAxe.violations).toEqual([]);
      // Switch back
      await page.locator('button[aria-label*="Switch to light theme"]').click();
      await page.waitForTimeout(400);
    }

    // 3. Click sample prompt
    const samplePrompt = page.locator('button:has-text("Birthday for 40 kids in Bengaluru")');
    await samplePrompt.click();

    // 4. Click Generate Event Plan button
    const generateButton = page.locator('button:has-text("Generate Event Plan")');
    await generateButton.click();

    // 5. Verify Plan Loaded & Heading Visible
    await expect(page.locator('h1')).toContainText('Bengaluru Birthday Celebration');

    // 6. Verify Budget Section
    await expect(page.getByText('Total Budget', { exact: true })).toBeVisible();
    await expect(page.locator('text=₹60,000').first()).toBeVisible();

    // Capture Event Dashboard screenshot on Desktop
    if (testInfo.project.name.includes('Desktop')) {
      await page.screenshot({ path: 'docs/screenshots/02-budget-timeline.png', fullPage: true });
    }

    // 7. Verify Timeline Navigation
    const timelineTab = page.locator('button[role="tab"]:has-text("Timeline & Delays")');
    await timelineTab.click();
    await expect(page.locator('text=Backward-Planned Master Timeline').first()).toBeVisible();

    // 8. Verify RSVP Navigation
    const rsvpTab = page.locator('button[role="tab"]:has-text("RSVP & Catering")');
    await rsvpTab.click();
    await expect(page.locator('text=RSVP & Catering Dietary Engine').first()).toBeVisible();
    await expect(page.locator('text=Dietary Portions for Caterer').first()).toBeVisible();

    // 9. Verify Scenario B Modal (Desktop view)
    if (testInfo.project.name.includes('Desktop')) {
      const scenarioButton = page.locator('button:has-text("Scenario B")');
      if (await scenarioButton.isVisible()) {
        await scenarioButton.click();
        await expect(
          page.locator('text=Scenario Comparison & What-If Analysis').first()
        ).toBeVisible();

        // Capture Scenario Comparison screenshot on Desktop
        await page.screenshot({ path: 'docs/screenshots/03-scenario-diff.png' });

        const closeScenario = page.locator('button[aria-label="Close scenario compare dialog"]');
        if (await closeScenario.isVisible()) {
          await closeScenario.click();
        } else {
          await page.locator('button:has-text("Keep Plan A")').click({ force: true });
        }
      }

      // 10. Verify Export & Share Modal (Desktop view)
      const shareButton = page.locator('button[aria-label*="Export or share"]');
      if (await shareButton.isVisible()) {
        await shareButton.click();
        await expect(page.locator('text=Download .ics Calendar').first()).toBeVisible();
        await page.locator('button[aria-label="Close export dialog"]').click({ force: true });
      }
    }

    // 11. Final Axe check on active celebration dashboard
    const finalAxe = await new AxeBuilder({ page }).analyze();
    expect(finalAxe.violations).toEqual([]);
  });

  test('responsive viewport down to 320px with zero horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 600 });
    await page.goto('/');

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
  });
});
