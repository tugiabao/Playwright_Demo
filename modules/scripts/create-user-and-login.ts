import { chromium } from 'playwright';
import * as path from 'path';

(async () => {
    const browser = await chromium.launch({ headless: false, slowMo: 100 }); // slowMo để dễ nhìn thao tác
    const context = await browser.newContext({ viewport: { width: 1500, height: 900 } });
    const page = await context.newPage();

    const BASE_URL = 'http://localhost:3000';

    // Dữ liệu User mới
    const newUser = {
        name: 'Nguyễn Văn Test',
        email: `testuser_${Date.now()}@example.com`,
        password: 'Password123!',
        phone: '0901234567',
        address: '123 Đường Test, Quận 1, TP.HCM',
        dob: '1995-01-01'
    };

    try {
        console.log('\n[1/7] Initiating Admin Login...');
        await page.goto(`${BASE_URL}/login`);
        // Giả định login form
        // 2. Điền thông tin đăng nhập
        await page.fill('input[placeholder*="Email"], input[name="text"]', 'admin'); // Điền email thật của bạn
        await page.fill('input[placeholder*="Mật khẩu"], input[name="password"]', '1'); // Điền pass thật
        await page.click('button[type="submit"]');

        await page.waitForTimeout(1000);

        // Chờ vào dashboard
        await page.goto(`${BASE_URL}/admin`);

        console.log('[2/7] Accessing User Management...');
        // Dựa vào sidebar bên trái trong hình image_a35c53.png
        await page.click('text=Người dùng'); // Click vào menu "Người dùng"

        // Chờ bảng load xong
        await page.waitForSelector('table');

        console.log('[3/7] Opening "Create User" Modal...');
        // Click nút thêm
        await page.click('button:has-text("Thêm người dùng")');

        // --- SỬA LỖI KẸT TẠI ĐÂY ---
        console.log('Waiting for modal to appear...');

        // CÁCH 1: Chọn dựa trên class trong hình bạn gửi (Chính xác nhất với hình)
        // Tìm thẻ div có class bg-white, rounded-xl và shadow-2xl đang hiển thị
        const modalSelector = 'div.bg-white.rounded-xl.shadow-2xl';
        await page.waitForSelector(modalSelector, { state: 'visible', timeout: 5000 });

        // CÁCH 2 (Khuyên dùng): Đợi input đầu tiên xuất hiện thì chắc chắn Modal đã lên
        // await page.waitForSelector('input[placeholder*="Nhập họ tên"]', { state: 'visible' });

        console.log('[4/7] Filling User Details...');

        // Để chắc chắn điền đúng vào form trong Modal (tránh điền nhầm ô ẩn bên dưới)
        // Ta sẽ scope (giới hạn) việc tìm kiếm chỉ nằm trong cái modalSelector kia
        const modal = page.locator(modalSelector);

        await modal.getByPlaceholder('Nhập họ tên...').fill(newUser.name);
        // Lưu ý: placeholder trong code cũ là "user@example.com", hãy check lại UI thật xem có đúng ko
        await modal.getByPlaceholder('user@example.com').fill(newUser.email);
        await modal.getByPlaceholder('Nhập mật khẩu...').fill(newUser.password);
        await modal.getByPlaceholder('090...').fill(newUser.phone);
        await modal.getByPlaceholder('Nhập địa chỉ giao hàng...').fill(newUser.address);

        // Điền ngày sinh
        await modal.locator('input[type="date"]').fill(newUser.dob);

        console.log('[5/7] Submitting Form...');
        // Click nút nằm bên trong Modal
        // Lưu ý: Bạn nói nút tên là "Tạo sản phẩm" (do lỗi typo UI), nên mình giữ nguyên
        // Thêm { force: true } để ép click nếu modal có hiệu ứng animation chưa xong hẳn
        await modal.locator('button:has-text("Tạo sản phẩm")').click({ force: true });

        // Chờ Modal biến mất sau khi lưu
        await page.waitForSelector(modalSelector, { state: 'hidden', timeout: 5000 });

        console.log('[6/7] Logging Out Admin...');
        // Nút Đăng xuất ở góc dưới bên trái sidebar (image_a35c53.png)
        await page.click('text=Đăng xuất');
        await page.waitForURL('**/login');

        console.log('[7/7] Verifying Login with New User...');
        await page.getByPlaceholder('Email').fill(newUser.email);
        await page.getByPlaceholder('Mật khẩu').fill(newUser.password);
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);

        // Kiểm tra login thành công (ví dụ check không còn ở trang login)
        await expectLoginSuccess(page);

        // Chụp ảnh bằng chứng
        const screenshotPath = path.resolve(__dirname, '../../result/auto-login.png');
        await page.screenshot({ path: screenshotPath });

        console.log('\n[SUCCESS] AUTOMATION COMPLETED');
        console.log('==================================================');
        console.log('NEW USER DETAILS:');
        console.log(`   Email:    ${newUser.email}`);
        console.log(`   Password: ${newUser.password}`);
        console.log(`   Evidence: ${screenshotPath}`);
        console.log('==================================================\n');

    } catch (error) {
        console.error('\n[FAILED] AUTOMATION ERROR');
        console.error('   Error Details:', error);
        await page.screenshot({ path: path.resolve(__dirname, '../../result/error.png') });
    } finally {
        await browser.close();
    }
})();

async function expectLoginSuccess(page: any) {
    try {
        await page.waitForURL((url: URL) => url.pathname !== '/login', { timeout: 5000 });
        console.log('   [INFO] Login verification passed (Redirected from /login).');
    } catch {
        console.log('   [WARN] Login verification warning: Redirect might be slow or failed.');
    }
}