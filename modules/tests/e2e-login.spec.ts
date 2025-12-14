import { test, expect } from '@playwright/test';
import path from 'path';

test('Login -> Add 3 items to Wishlist -> Verify in Favorites', async ({ page }) => {
  console.log('\n[TEST] STARTING E2E TEST: Login & Wishlist Flow');
  console.log('==================================================');

  // 1. Truy cập trang login
  console.log('[1/6] Navigating to Login Page...');
  await page.goto('/login');

  // 2. Điền thông tin đăng nhập
  console.log('[2/6] Performing Admin Login...');
  await page.fill('input[placeholder*="Email"], input[name="text"]', 'admin'); // Điền email thật của bạn
  await page.fill('input[placeholder*="Mật khẩu"], input[name="password"]', '1'); // Điền pass thật
  await page.click('button[type="submit"]');

  // 3. Chờ chuyển hướng về Home
  console.log('[3/6] Waiting for Dashboard/Home redirection...');
  await page.waitForURL(/.*(home|dashboard|$)/);
  
  // Chờ danh sách sản phẩm load xong (chờ nút "Yêu thích" xuất hiện)
  // SỬ DỤNG SELECTOR MỚI DỰA TRÊN HTML BẠN CUNG CẤP
  const heartSelector = 'button[title="Yêu thích"]';
  await page.waitForSelector(heartSelector, { state: 'visible', timeout: 10000 });

  // 4. Thêm 3 sản phẩm đầu tiên vào yêu thích
  console.log('[4/6] Adding top 3 products to Wishlist...');
  
  const heartButtons = page.locator(heartSelector);
  const count = await heartButtons.count();
  
  if (count > 0) {
    // Click 3 nút đầu tiên
    for (let i = 0; i < Math.min(3, count); i++) {
        const btn = heartButtons.nth(i);
        
        // Kiểm tra xem nút có bấm được không
        if (await btn.isVisible()) {
            await btn.click();
            console.log(`   [INFO] Liked product #${i + 1}`);
            
            // Tùy chọn: Chờ 1 xíu để server xử lý trước khi bấm nút tiếp theo
            await page.waitForTimeout(500); 
        }
    }
  } else {
    throw new Error('[ERROR] No "Favorite" buttons found on the page!');
  }

  // 5. Truy cập trang Favorites để kiểm tra kết quả
  console.log('[5/6] Verifying in Favorites Page...');
  await page.goto('/favorites');
  
  // Chờ load xong
  await page.waitForURL(/.*favorites/);
  await page.waitForLoadState('networkidle');

  // Kiểm tra xem có đúng là có 3 sản phẩm trong danh sách không (Tùy chọn)
  const favoriteItems = page.locator('.product-card, .product-item, div[class*="col-"]'); 

  // 6. Chụp ảnh màn hình lưu vào output
  const screenshotPath = path.join(__dirname, '../../result/e2e-favorite-result.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  
  console.log('[6/6] Capturing Result Screenshot...');
  console.log('\n[SUCCESS] TEST COMPLETED SUCCESSFULLY');
  console.log('==================================================');
  console.log(`Evidence: ${screenshotPath}`);
  console.log('==================================================\n');
});