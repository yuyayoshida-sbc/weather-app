import { test, expect } from '@playwright/test';

test.describe('履歴機能拡充', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/history');
  });

  test('施術履歴に院名・レーザー種類・担当看護師が表示される', async ({ page }) => {
    // 院名が表示される
    await expect(page.getByText('新宿院').first()).toBeVisible();

    // レーザー種類が表示される
    await expect(page.getByText('YAG').first()).toBeVisible();

    // 担当看護師名が表示される
    await expect(page.getByText('田中 美咲').first()).toBeVisible();
  });

  test('フィードバック済みの履歴に星評価と照射漏れ情報が表示される', async ({ page }) => {
    // 星評価が表示される（★マーク）
    await expect(page.locator('text=★').first()).toBeVisible();

    // 照射漏れ情報が表示される
    await expect(page.getByText(/照射漏れ:/).first()).toBeVisible();
  });

  test('履歴をクリックして展開できる', async ({ page }) => {
    // 最初の履歴カードをクリック
    await page.locator('[role="button"]').first().click();

    // 備考メモセクションが表示される
    await expect(page.getByText('備考メモ')).toBeVisible();

    // フィードバックセクションが表示される
    await expect(page.getByText('フィードバック').first()).toBeVisible();
  });

  test('フィードバック未入力の履歴で追加ボタンが表示される', async ({ page }) => {
    // 最新の履歴（フィードバック未入力）をクリック
    await page.locator('[role="button"]').first().click();

    // 「➕ 追加」ボタンが表示される
    await expect(page.getByText('➕ 追加')).toBeVisible();
  });

  test('フィードバック入力フォームが開ける', async ({ page }) => {
    // 最新の履歴をクリック
    await page.locator('[role="button"]').first().click();

    // 追加ボタンをクリック
    await page.getByText('➕ 追加').click();

    // 満足度入力が表示される
    await expect(page.getByText('満足度')).toBeVisible();

    // 照射漏れ選択が表示される
    await expect(page.getByText('照射漏れ').last()).toBeVisible();

    // コメント入力が表示される
    await expect(page.getByText('コメント')).toBeVisible();
  });

  test('照射漏れ「あり」を選択すると詳細入力欄が表示される', async ({ page }) => {
    // 最新の履歴をクリック
    await page.locator('[role="button"]').first().click();

    // 追加ボタンをクリック
    await page.getByText('➕ 追加').click();

    // 「あり」を選択
    await page.getByLabel('あり').click();

    // 詳細入力欄が表示される
    await expect(page.getByPlaceholder('照射漏れの詳細を入力...')).toBeVisible();
  });
});

// 診察券番号で認証するヘルパー
async function authenticateWithPatientNumber(page: import('@playwright/test').Page, patientNumber: string) {
  const input = page.getByPlaceholder('SBC-123456');
  await expect(input).toBeVisible();
  await input.fill(patientNumber);
  await page.getByRole('button', { name: 'ログイン' }).click();
  await page.waitForTimeout(500);
}

test.describe('コース消化リマインダー', () => {
  test('3ヶ月経過したコースがある場合、チャットにリマインダーが表示される', async ({ page }) => {
    await page.goto('/reservation');

    // 既存顧客（SBC太郎、残り2回のコース持ち）として認証
    await authenticateWithPatientNumber(page, 'SBC-123456');

    // リマインダーメッセージが表示される
    await expect(page.getByText(/施術から約.*ヶ月が経過しました/)).toBeVisible();

    // 残り回数の案内が表示される
    await expect(page.getByText(/残り.*回の施術がございます/)).toBeVisible();
  });

  test('リマインダーに「予約する」クイック返信が表示される', async ({ page }) => {
    await page.goto('/reservation');

    // 既存顧客として認証
    await authenticateWithPatientNumber(page, 'SBC-123456');

    // 「予約する」ボタンが表示される（exact: trueで完全一致）
    await expect(page.getByRole('button', { name: '予約する', exact: true })).toBeVisible();

    // 「後で検討する」ボタンが表示される
    await expect(page.getByRole('button', { name: '後で検討する', exact: true })).toBeVisible();
  });
});
