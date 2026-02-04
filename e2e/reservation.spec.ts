import { test, expect } from '@playwright/test';

// テスト用の診察券番号
const TEST_PATIENT_NUMBER = 'SBC-123456';

// 認証をスキップしてゲストとして続行するヘルパー
async function skipAuthAsGuest(page: import('@playwright/test').Page) {
  // 「初めての方・診察券をお持ちでない方」ボタンをクリック
  const skipButton = page.getByRole('button', { name: /初めての方/ });
  await expect(skipButton).toBeVisible();
  await skipButton.click();
  await page.waitForTimeout(500);
}

// 診察券番号で認証するヘルパー
async function authenticateWithPatientNumber(page: import('@playwright/test').Page, patientNumber: string) {
  // 診察券番号入力欄が表示されるまで待つ
  const input = page.getByPlaceholder('SBC-123456');
  await expect(input).toBeVisible();

  // 診察券番号を入力
  await input.fill(patientNumber);

  // ログインボタンをクリック
  await page.getByRole('button', { name: 'ログイン' }).click();
  await page.waitForTimeout(500);
}

test.describe('予約ページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reservation');
  });

  test('予約ページが正常に表示される（認証画面）', async ({ page }) => {
    // ヘッダーの確認
    await expect(page.getByText("SBC Men's Flash").first()).toBeVisible();
    await expect(page.getByText('予約アシスタント', { exact: true })).toBeVisible();

    // 認証画面のメッセージ確認
    await expect(page.getByText(/診察券番号をご入力ください/)).toBeVisible();
    await expect(page.getByPlaceholder('SBC-123456')).toBeVisible();
  });

  test('診察券番号で認証できる', async ({ page }) => {
    // 診察券番号を入力して認証
    await authenticateWithPatientNumber(page, TEST_PATIENT_NUMBER);

    // 認証後の挨拶を確認
    await expect(page.getByText(/SBC太郎様、こんにちは/)).toBeVisible();
  });

  test('ゲストとして続行できる', async ({ page }) => {
    // ゲストとして続行
    await skipAuthAsGuest(page);

    // ゲスト用メッセージを確認
    await expect(page.getByText(/初めてのご来院ですね/)).toBeVisible();
  });

  test('クイックアクションボタンが表示される（認証後）', async ({ page }) => {
    // ゲストとして続行
    await skipAuthAsGuest(page);

    // QuickActionsコンポーネントの「📅 予約する」と「料金一覧」ボタン
    const reserveButton = page.getByRole('button', { name: '📅 予約する' });
    const priceButton = page.locator('button').filter({ hasText: '料金一覧' });
    await expect(reserveButton).toBeVisible();
    await expect(priceButton).toBeVisible();
  });

  test('クイック返信ボタンが動作する', async ({ page }) => {
    // ゲストとして続行
    await skipAuthAsGuest(page);

    // クイック返信ボタンをクリック
    const quickReply = page.getByRole('button', { name: /三部位の料金/ });
    if (await quickReply.isVisible()) {
      await quickReply.click();
      // レスポンスを待つ
      await page.waitForTimeout(1000);
    }
  });

  test('予約フローを開始できる', async ({ page }) => {
    // ゲストとして続行
    await skipAuthAsGuest(page);

    // 予約したいボタンをクリック
    await page.getByRole('button', { name: '📅 予約する' }).click();

    // レスポンスを待つ
    await page.waitForTimeout(1000);

    // メニュー選択が表示される
    await expect(page.getByText(/メニューをお選びください/)).toBeVisible();
  });

  test('チャット入力が動作する', async ({ page }) => {
    // ゲストとして続行
    await skipAuthAsGuest(page);

    // 入力欄を取得
    const input = page.getByPlaceholder('ご質問やご予約内容を入力...');
    await expect(input).toBeVisible();

    // テキストを入力
    await input.fill('料金について教えてください');

    // Enterキーで送信
    await input.press('Enter');

    // ユーザーメッセージが表示される
    await page.waitForTimeout(1000);
    await expect(page.getByText('料金について教えてください')).toBeVisible();
  });

  test('会話リセットボタンが動作する', async ({ page }) => {
    // ゲストとして続行
    await skipAuthAsGuest(page);

    // メッセージを送信
    const input = page.getByPlaceholder('ご質問やご予約内容を入力...');
    await input.fill('テストメッセージ');
    await input.press('Enter');

    await page.waitForTimeout(1000);

    // 会話リセットボタンをクリック（ゲストの場合、会話リセットのみ表示）
    await page.getByRole('button', { name: '会話リセット' }).click();

    // ゲストメッセージに戻ることを確認（ログイン画面には戻らない）
    await expect(page.getByText(/初めてのご来院ですね/)).toBeVisible();
  });

  test('無効な診察券番号でエラーが表示される', async ({ page }) => {
    // 無効な診察券番号を入力
    const input = page.getByPlaceholder('SBC-123456');
    await input.fill('SBC-999999');
    await page.getByRole('button', { name: 'ログイン' }).click();

    // エラーメッセージを確認
    await expect(page.getByText(/診察券番号が見つかりません/)).toBeVisible();
  });
});
