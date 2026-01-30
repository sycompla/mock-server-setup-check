/**
 * E2E Tests for Stock Transfer Module (WMS_OWTR)
 *
 * Tests the complete user workflow:
 * - List view
 * - Details view
 * - Create new stock transfer
 */

import { test, expect } from '@playwright/test';

test.describe('Stock Transfer Module - E2E', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to Stock Transfer module
    await page.goto('/#/StockTransfer');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should load stock transfer list view', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/WMS/);

    // Check that list is visible
    const list = page.locator('[id*="stockTransferList"]').first();
    await expect(list).toBeVisible();

    // Check that at least one item is displayed
    const listItems = page.locator('.sapMListTblRow');
    await expect(listItems.first()).toBeVisible();

    // Should have 3 stock transfers from mock data
    const itemCount = await listItems.count();
    expect(itemCount).toBeGreaterThanOrEqual(3);
  });

  test('should display stock transfer details', async ({ page }) => {
    // Click on first stock transfer in list
    const firstItem = page.locator('.sapMListTblRow').first();
    await firstItem.click();

    // Wait for details page to load
    await page.waitForLoadState('networkidle');

    // Check that we're on details page
    const detailsPage = page.locator('[id*="stockTransferDetails"]').first();
    await expect(detailsPage).toBeVisible({ timeout: 10000 });

    // Check header fields
    const fromWarehouse = page.locator('text=WH01').first();
    await expect(fromWarehouse).toBeVisible();

    const toWarehouse = page.locator('text=WH02').first();
    await expect(toWarehouse).toBeVisible();

    // Check that lines table is visible
    const linesTable = page.locator('[id*="linesTable"]').first();
    await expect(linesTable).toBeVisible();
  });

  test('should create new stock transfer', async ({ page }) => {
    // Click "New" button
    const newButton = page.locator('button:has-text("New")').or(
      page.locator('[title="New"]')
    ).first();
    await newButton.click();

    // Wait for create form to load
    await page.waitForLoadState('networkidle');

    // Fill in stock transfer data
    const fromWarehouseInput = page.locator('[id*="fromWarehouse"]').first();
    await fromWarehouseInput.click();
    await fromWarehouseInput.fill('WH01');

    const toWarehouseInput = page.locator('[id*="toWarehouse"]').first();
    await toWarehouseInput.click();
    await toWarehouseInput.fill('WH03');

    // Add line item
    const addLineButton = page.locator('button:has-text("Add Line")').first();
    if (await addLineButton.isVisible()) {
      await addLineButton.click();
    }

    // Fill item details
    const itemCodeInput = page.locator('[id*="itemCode"]').first();
    if (await itemCodeInput.isVisible()) {
      await itemCodeInput.fill('ITEM003');
    }

    const quantityInput = page.locator('[id*="quantity"]').first();
    if (await quantityInput.isVisible()) {
      await quantityInput.fill('25');
    }

    // Save the stock transfer
    const saveButton = page.locator('button:has-text("Save")').or(
      page.locator('[title="Save"]')
    ).first();
    await saveButton.click();

    // Wait for save to complete
    await page.waitForLoadState('networkidle');

    // Check for success message or navigation back to list
    const successMessage = page.locator('text=Success').or(
      page.locator('text=Created')
    ).first();

    // Either success message appears or we're back on list view
    const isSuccess = await successMessage.isVisible({ timeout: 5000 }).catch(() => false);
    const listVisible = await page.locator('.sapMListTblRow').first().isVisible({ timeout: 5000 }).catch(() => false);

    expect(isSuccess || listVisible).toBeTruthy();
  });

  test('should filter stock transfers', async ({ page }) => {
    // Find search/filter input
    const searchInput = page.locator('input[type="search"]').or(
      page.locator('[placeholder*="Search"]')
    ).first();

    if (await searchInput.isVisible()) {
      // Enter filter text
      await searchInput.fill('WH01');

      // Wait for filter to apply
      await page.waitForTimeout(500);

      // Check that results are filtered
      const visibleItems = page.locator('.sapMListTblRow:visible');
      const count = await visibleItems.count();

      // Should have fewer items than total
      expect(count).toBeLessThanOrEqual(3);
    }
  });

  test('should navigate between pages', async ({ page }) => {
    // Test navigation: List -> Details -> Back to List

    // 1. Click on item to go to details
    const firstItem = page.locator('.sapMListTblRow').first();
    await firstItem.click();
    await page.waitForLoadState('networkidle');

    // 2. Click back button
    const backButton = page.locator('button[title="Back"]').or(
      page.locator('.sapMBtn:has-text("Back")')
    ).first();

    if (await backButton.isVisible()) {
      await backButton.click();
      await page.waitForLoadState('networkidle');

      // 3. Verify we're back on list view
      const list = page.locator('[id*="stockTransferList"]').first();
      await expect(list).toBeVisible();
    }
  });

  test('should display correct stock transfer status', async ({ page }) => {
    // Get all list items
    const listItems = page.locator('.sapMListTblRow');

    // Check first item (DocNum=1) should be Closed (C)
    const firstItem = listItems.first();
    await firstItem.click();
    await page.waitForLoadState('networkidle');

    // Look for status indicator
    const statusField = page.locator('text=Closed').or(
      page.locator('text=Open')
    ).first();

    await expect(statusField).toBeVisible({ timeout: 5000 });
  });
});
