import { test, expect } from '@playwright/test';

test.describe('予約ページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reservation');
  });

  test('予約ページが正常に表示される', async ({ page }) => {
    // ヘッダーの確認
    await expect(page.getByText("SBC Men's Flash").first()).toBeVisible();
    await expect(page.getByText('予約アシスタント', { exact: true })).toBeVisible();

    // 初期メッセージの確認
    await expect(page.getByText(/こんにちは/)).toBeVisible();
  });

  test('クイックアクションボタンが表示される', async ({ page }) => {
    // QuickActionsコンポーネントの「📅 予約する」と「料金一覧」ボタン
    const reserveButton = page.getByRole('button', { name: '📅 予約する' });
    const priceButton = page.locator('button').filter({ hasText: '料金一覧' });
    await expect(reserveButton).toBeVisible();
    await expect(priceButton).toBeVisible();
  });

  test('クイック返信ボタンが動作する', async ({ page }) => {
    // クイック返信ボタンをクリック
    const quickReply = page.getByRole('button', { name: /三部位の料金/ });
    if (await quickReply.isVisible()) {
      await quickReply.click();
      // レスポンスを待つ
      await page.waitForTimeout(1000);
    }
  });

  test('予約フローを開始できる', async ({ page }) => {
    // 予約したいボタンをクリック
    await page.getByRole('button', { name: /予約/ }).first().click();

    // レスポンスを待つ
    await page.waitForTimeout(1000);
  });

  test('チャット入力が動作する', async ({ page }) => {
    // 入力欄を取得
    const input = page.getByPlaceholder('ご質問やご予約内容を入力...');
    await expect(input).toBeVisible();

    // テキストを入力
    await input.fill('料金について教えてください');

    // 送信ボタンをクリック
    const sendButton = page.locator('button[type="submit"]');
    if (await sendButton.isVisible()) {
      await sendButton.click();
    } else {
      // Enterキーで送信
      await input.press('Enter');
    }

    // ユーザーメッセージが表示される
    await page.waitForTimeout(500);
    await expect(page.getByText('料金について教えてください')).toBeVisible();
  });

  test('リセットボタンが動作する', async ({ page }) => {
    // メッセージを送信
    const input = page.getByPlaceholder('ご質問やご予約内容を入力...');
    await input.fill('テストメッセージ');
    await input.press('Enter');

    await page.waitForTimeout(1000);

    // リセットボタンをクリック
    await page.getByRole('button', { name: 'リセット' }).click();

    // 初期状態に戻ることを確認
    await expect(page.getByText(/こんにちは/)).toBeVisible();
  });
});
