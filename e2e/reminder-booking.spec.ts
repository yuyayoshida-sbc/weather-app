import { test, expect } from '@playwright/test';

// 診察券番号で認証するヘルパー
async function authenticateWithPatientNumber(page: import('@playwright/test').Page, patientNumber: string) {
  const input = page.getByPlaceholder('SBC-123456');
  await expect(input).toBeVisible();
  await input.fill(patientNumber);
  await page.getByRole('button', { name: '確認する' }).click();
  await page.waitForTimeout(500);
}

test.describe('リマインダーからの予約フロー', () => {
  test('リマインダーの「予約する」ボタンを押すと、お礼を言ってメニュー選択に移行する', async ({ page }) => {
    await page.goto('/reservation');

    // 既存顧客（SBC太郎、残り2回のコース持ち）として認証
    await authenticateWithPatientNumber(page, 'SBC-123456');

    // リマインダーが表示されるのを待つ
    await expect(page.getByText(/施術から約.*ヶ月が経過しました/)).toBeVisible();

    // 「予約する」ボタンをクリック
    await page.getByRole('button', { name: '予約する', exact: true }).click();
    await page.waitForTimeout(1000);

    // お礼メッセージが表示される
    await expect(page.getByText('ありがとうございます！')).toBeVisible();

    // メニュー選択肢が表示される
    await expect(page.getByText('メニューをお選びください')).toBeVisible();

    // 未消化コースが表示される（おすすめとして）
    await expect(page.getByText(/🎫.*残り.*回/)).toBeVisible();

    // キャンセルポリシーメッセージが表示されないことを確認
    await expect(page.getByText(/キャンセル料として/)).not.toBeVisible();
  });

  test('リマインダーの「後で検討する」ボタンを押すと適切なメッセージが表示される', async ({ page }) => {
    await page.goto('/reservation');

    // 既存顧客として認証
    await authenticateWithPatientNumber(page, 'SBC-123456');

    // リマインダーが表示されるのを待つ
    await expect(page.getByText(/施術から約.*ヶ月が経過しました/)).toBeVisible();

    // 「後で検討する」ボタンをクリック
    await page.getByRole('button', { name: '後で検討する', exact: true }).click();
    await page.waitForTimeout(1000);

    // 適切なメッセージが表示される
    await expect(page.getByText('かしこまりました')).toBeVisible();

    // クイック返信が表示される（複数の場合はfirst()を使用）
    await expect(page.getByRole('button', { name: '予約したい' }).first()).toBeVisible();
  });
});
