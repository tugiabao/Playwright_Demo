import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

(async () => {
  const browser = await chromium.launch({ headless: false }); 
  const context = await browser.newContext();
  const page = await context.newPage();

  const BASE_URL = 'http://localhost:3000';
  
  const outputDir = path.resolve(__dirname, '../../result');
  if (!fs.existsSync(outputDir)){
      fs.mkdirSync(outputDir);
  }
  const OUTPUT_FILE = path.join(outputDir, 'products.json');

  console.log('\n[START] PRODUCT SCRAPER');
  console.log(`   Target URL: ${BASE_URL}/products`);
  console.log('==================================================');

  await page.goto(`${BASE_URL}/products`);
  
  const allProducts: any[] = [];
  let pageIndex = 1;
  let isScraping = true;

  while (isScraping) {
    console.log(`\n[PAGE ${pageIndex}] Processing...`);

    // --- CÀO DỮ LIỆU ---
    const productsOnPage = await page.evaluate(() => {
      const data: any[] = [];
      const heartBtns = document.querySelectorAll('button[title="Yêu thích"]');
      
      heartBtns.forEach((btn) => {
        const card = btn.closest('div.bg-white') || btn.parentElement?.parentElement?.parentElement;
        if (card) {
            const titleEl = card.querySelector('h3, a, .text-blue-600');
            const priceEl = card.querySelector('.text-red-600, div:has(text), span');
            const imgEl = card.querySelector('img');
            const rawPrice = priceEl?.textContent?.trim() || '';

            data.push({
                title: titleEl?.textContent?.trim(),
                price: rawPrice,
                image: imgEl?.src,
                crawledAt: new Date().toISOString()
            });
        }
      });
      return data;
    });

    console.log(`   [INFO] Extracted ${productsOnPage.length} products.`);
    allProducts.push(...productsOnPage);
    // --- CUỘN XUỐNG TÌM NÚT PHÂN TRANG ---
    console.log('   [SCROLL] Scrolling to find pagination...');
    const nextBtnLocator = page.locator('button[title="Trang sau"]').first();

    // Cuộn trang xuống từ từ để tìm nút Next
    for (let i = 0; i < 20; i++) {
        // Kiểm tra xem nút đã hiện trong viewport chưa
        if (await nextBtnLocator.isVisible()) {
            break;
        }

        // Nếu chưa thấy thì lăn chuột xuống 500px
        await page.mouse.wheel(0, 500);
        // Đợi 0.5s cho giống người thật và để UI kịp load
        await page.waitForTimeout(500);
    }
    
    // Đợi thêm 1 chút cho chắc chắn
    await page.waitForTimeout(1000);


    // --- XỬ LÝ PHÂN TRANG ---
    // Lúc này nút Next chắc chắn đã hiện (nếu có)
    const nextButton = page.locator('button[title="Trang sau"]:visible').first();

    if (await nextButton.count() > 0) {
        
        const isDisabledAttr = await nextButton.isDisabled();
        
        if (!isDisabledAttr) {
            console.log('   [NAV] Navigating to next page...');
            await nextButton.click();

            // Delay cứng 0.5s đợi trang mới load xong
            await page.waitForTimeout(500); 
            
            pageIndex++;
        } else {
            console.log('   [STOP] Pagination end reached (Next button disabled).');
            isScraping = false;
        }
    } else {
        console.log('   [STOP] Pagination end reached (No Next button found).');
        isScraping = false;
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allProducts, null, 2));
  
  console.log('\n[SUCCESS] SCRAPING COMPLETED');
  console.log('==================================================');
  console.log(`Total Products: ${allProducts.length}`);
  console.log(`Output File:    ${OUTPUT_FILE}`);
  console.log('==================================================\n');

  await browser.close();
})();