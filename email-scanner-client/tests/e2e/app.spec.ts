import { test, expect } from '@playwright/test';

test('frontend e2e: page loads and shows converted output', async ({ page, baseURL }) => {
    await page.goto(baseURL || 'http://localhost:5173');

    const submitBtn = page.getByTestId('submit-button');
    expect(submitBtn.first()).toBeVisible();

    const textarea = page.locator('textarea');
    await textarea.fill('some fun text that contains only the total <total>9000</total>');
    await submitBtn.first().click();
    await page.waitForTimeout(800);

    const resultContainer = page.getByTestId('json');
    expect(resultContainer).toBeVisible();
    const jsonContent = await resultContainer.innerText();
    expect(jsonContent).toContain('"totalExcludingTax": 7826.09');

});