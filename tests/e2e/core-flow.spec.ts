import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Mehfil - End-to-End Core Flow & Accessibility Audit', () => {
  test('completes full event planning flow on desktop and passes axe checks in light and dark', async ({
    page,
  }) => {
    await page.goto('/');

    // 1. Initial Axe scan on Intake screen (Light mode)
    const initialAxe = await new AxeBuilder({ page }).analyze();
    expect(initialAxe.violations).toEqual([]);

    // 2. Toggle to Dark mode and verify Axe scan
    const themeButton = page.locator('button[aria-label*="Switch to dark theme"]');
    if (await themeButton.isVisible()) {
      await themeButton.click();
      const darkAxe = await new AxeBuilder({ page }).analyze();
      expect(darkAxe.violations).toEqual([]);
      // Switch back
      await page.locator('button[aria-label*="Switch to light theme"]').click();
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
    await expect(page.locator('text=Total Budget')).toBeVisible();
    await expect(page.locator('text=₹60,000')).toBeVisible();

    // 7. Verify Timeline Navigation
    const timelineTab = page.locator('button[role="tab"]:has-text("Timeline & Delays")');
    await timelineTab.click();
    await expect(page.locator('text=Backward-Planned Master Timeline')).toBeVisible();

    // 8. Verify RSVP Navigation
    const rsvpTab = page.locator('button[role="tab"]:has-text("RSVP & Catering")');
    await rsvpTab.click();
    await expect(page.locator('text=RSVP & Catering Dietary Engine')).toBeVisible();
    await expect(page.locator('text=Dietary Portions for Caterer')).toBeVisible();

    // 9. Verify Scenario B Modal
    const scenarioButton = page.locator('button:has-text("Scenario B")');
    if (await scenarioButton.isVisible()) {
      await scenarioButton.click();
      await expect(page.locator('text=Scenario Comparison & What-If Analysis')).toBeVisible();
      await page.locator('button:has-text("Keep Plan A")').click();
    }

    // 10. Verify Export & Share Modal
    const shareButton = page.locator('button[aria-label*="Export or share"]');
    await shareButton.click();
    await expect(page.locator('text=Download .ics Calendar')).toBeVisible();
    await page.locator('button[aria-label="Close export dialog"]').click();

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
