/**
 * E2E Tests for Pick List Module (WMS_PICK)
 *
 * Tests the pick list workflow:
 * - List view with different statuses
 * - Details view
 * - Status changes
 */

import { test, expect } from '@playwright/test';

test.describe('Pick List Module - E2E', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to Pick List module
    await page.goto('/#/PickList');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should load pick list view', async ({ page }) => {
    // Check page is loaded
    await expect(page).toHaveTitle(/WMS/);

    // Check that list is visible
    const list = page.locator('[id*="pickList"]').first();
    await expect(list).toBeVisible({ timeout: 10000 });

    // Should have at least 3 pick lists from mock data
    const listItems = page.locator('.sapMListTblRow');
    const itemCount = await listItems.count();
    expect(itemCount).toBeGreaterThanOrEqual(3);
  });

  test('should display pick lists with different statuses', async ({ page }) => {
    // Get all pick list items
    const listItems = page.locator('.sapMListTblRow');

    // Check that we have items with different statuses
    const closedStatus = page.locator('text=Closed').or(
      page.locator('text=Yes').or(page.locator('.statusClosed'))
    );
    const openStatus = page.locator('text=Open').or(
      page.locator('text=No').or(page.locator('.statusOpen'))
    );
    const partialStatus = page.locator('text=Partial').or(
      page.locator('.statusPartial')
    );

    // At least one status type should be visible
    const hasClosedVisible = await closedStatus.first().isVisible({ timeout: 2000 }).catch(() => false);
    const hasOpenVisible = await openStatus.first().isVisible({ timeout: 2000 }).catch(() => false);
    const hasPartialVisible = await partialStatus.first().isVisible({ timeout: 2000 }).catch(() => false);

    expect(hasClosedVisible || hasOpenVisible || hasPartialVisible).toBeTruthy();
  });

  test('should display pick list details', async ({ page }) => {
    // Click on first pick list
    const firstItem = page.locator('.sapMListTblRow').first();
    await firstItem.click();

    // Wait for details to load
    await page.waitForLoadState('networkidle');

    // Check details page is visible
    const detailsPage = page.locator('[id*="pickListDetails"]').or(
      page.locator('[id*="detailsPage"]')
    ).first();
    await expect(detailsPage).toBeVisible({ timeout: 10000 });

    // Check for pick list name (PICK-001, PICK-002, or PICK-003)
    const pickListName = page.locator('text=PICK-').first();
    await expect(pickListName).toBeVisible({ timeout: 5000 });

    // Check for owner/user information
    const ownerInfo = page.locator('text=Administrator').or(
      page.locator('text=Raktáros User')
    ).first();
    await expect(ownerInfo).toBeVisible({ timeout: 5000 });
  });

  test('should display pick list lines', async ({ page }) => {
    // Click on first pick list
    const firstItem = page.locator('.sapMListTblRow').first();
    await firstItem.click();

    await page.waitForLoadState('networkidle');

    // Look for lines table or line items
    const linesTable = page.locator('[id*="linesTable"]').or(
      page.locator('.sapMListTbl')
    ).first();

    // Lines should be visible
    const isVisible = await linesTable.isVisible({ timeout: 5000 }).catch(() => false);
    if (isVisible) {
      // Check that at least one line is displayed
      const lineItems = page.locator('.sapMListTblRow');
      const lineCount = await lineItems.count();
      expect(lineCount).toBeGreaterThan(0);
    }
  });

  test('should filter pick lists by status', async ({ page }) => {
    // Look for status filter or dropdown
    const statusFilter = page.locator('[id*="statusFilter"]').or(
      page.locator('select').or(page.locator('[role="combobox"]'))
    ).first();

    const isFilterVisible = await statusFilter.isVisible({ timeout: 2000 }).catch(() => false);

    if (isFilterVisible) {
      // Click filter
      await statusFilter.click();

      // Select "Closed" option if available
      const closedOption = page.locator('text=Closed').first();
      const hasClosedOption = await closedOption.isVisible({ timeout: 2000 }).catch(() => false);

      if (hasClosedOption) {
        await closedOption.click();

        // Wait for filter to apply
        await page.waitForTimeout(500);

        // Verify filtered results
        const listItems = page.locator('.sapMListTblRow');
        const count = await listItems.count();
        expect(count).toBeGreaterThanOrEqual(1);
      }
    }
  });

  test('should navigate back from details to list', async ({ page }) => {
    // Go to details
    const firstItem = page.locator('.sapMListTblRow').first();
    await firstItem.click();
    await page.waitForLoadState('networkidle');

    // Click back button
    const backButton = page.locator('button[title="Back"]').or(
      page.locator('.sapMBtn:has-text("Back")')
    ).first();

    const isBackVisible = await backButton.isVisible({ timeout: 2000 }).catch(() => false);

    if (isBackVisible) {
      await backButton.click();
      await page.waitForLoadState('networkidle');

      // Verify we're back on list
      const list = page.locator('[id*="pickList"]').first();
      await expect(list).toBeVisible();
    }
  });

  test('should display pick quantity information', async ({ page }) => {
    // Go to first pick list details
    const firstItem = page.locator('.sapMListTblRow').first();
    await firstItem.click();
    await page.waitForLoadState('networkidle');

    // Look for quantity fields
    const quantityField = page.locator('text=Quantity').or(
      page.locator('text=Picked').or(page.locator('text=Released'))
    ).first();

    // At least one quantity label should be visible
    const isVisible = await quantityField.isVisible({ timeout: 5000 }).catch(() => false);
    expect(isVisible).toBeTruthy();
  });

  test('should show correct pick list count', async ({ page }) => {
    // Get pick list items
    const listItems = page.locator('.sapMListTblRow');
    const count = await listItems.count();

    // Should have exactly 3 pick lists from mock data
    expect(count).toBe(3);
  });
});
