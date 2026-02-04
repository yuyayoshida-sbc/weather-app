import { test, expect } from '@playwright/test';

// 認証をスキップしてゲストとして続行するヘルパー
async function skipAuthAsGuest(page: import('@playwright/test').Page) {
  const skipButton = page.getByRole('button', { name: /初めての方/ });
  await expect(skipButton).toBeVisible();
  await skipButton.click();
  await page.waitForTimeout(500);
}

test.describe('当日予約機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reservation');
  });

  test('予約フローで「今日」を選択すると住所入力フォームが表示される', async ({ page }) => {
    // ゲストとして続行
    await skipAuthAsGuest(page);

    // 予約するボタンをクリック（QuickActionsの「📅 予約する」を使用）
    await page.getByRole('button', { name: '📅 予約する' }).click();
    await page.waitForTimeout(1000);

    // 三部位を選択
    await page.locator('button').filter({ hasText: '三部位' }).first().click();
    await page.waitForTimeout(1000);

    // 1回を選択
    await page.locator('button').filter({ hasText: '1回' }).first().click();
    await page.waitForTimeout(1000);

    // 「今日」を選択
    await page.locator('button').filter({ hasText: '今日' }).click();
    await page.waitForTimeout(1000);

    // 住所入力フォームまたは近隣クリニック表示が出ることを確認
    const addressForm = page.getByText('最寄り駅を教えてください');
    const nearbyClinic = page.getByText('本日空きのあるクリニック');

    // どちらかが表示されればOK（初回は住所入力、2回目以降は近隣クリニック表示）
    const addressFormVisible = await addressForm.isVisible().catch(() => false);
    const nearbyClinicVisible = await nearbyClinic.isVisible().catch(() => false);

    expect(addressFormVisible || nearbyClinicVisible).toBe(true);
  });

  test('住所入力後に近隣クリニックの空き状況が表示される', async ({ page }) => {
    // ゲストとして続行
    await skipAuthAsGuest(page);

    // チャット入力で直接テスト
    const input = page.getByPlaceholder('ご質問やご予約内容を入力...');
    await input.fill('今日の空き時間を見たい');
    await input.press('Enter');
    await page.waitForTimeout(1500);

    // 住所入力フォームが表示されるか確認
    const addressForm = page.getByText('最寄り駅を教えてください');
    if (await addressForm.isVisible()) {
      // 自宅最寄り駅を入力
      const homeInput = page.getByPlaceholder('例：池袋');
      await homeInput.fill('新宿');

      // 職場最寄り駅を入力
      const workInput = page.getByPlaceholder('例：品川');
      await workInput.fill('渋谷');

      // 検索ボタンをクリック
      await page.locator('button').filter({ hasText: '近くのクリニックを探す' }).click();
      await page.waitForTimeout(1500);
    }

    // 近隣クリニックの空き状況が表示されることを確認
    await expect(page.getByText(/本日空きのあるクリニック|本日の予約ですね/).first()).toBeVisible();
  });
});
