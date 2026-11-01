const {test,expect}=require('@playwright/test');
test('minimal Chromium game startup',async({page,browser},info)=>{
 await page.setViewportSize({width:390,height:844});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const response=await page.goto('/games/furiko/');expect(response.status()).toBe(200);
 await expect(page.locator('#heroStartGame')).toBeVisible();await page.locator('#heroStartGame').click();
 await expect(page.locator('.exp22-apparatus')).toBeVisible();await expect(page.locator('.exp22-character')).toBeVisible();
 expect(errors).toEqual([]);await page.screenshot({path:info.outputPath('startup-390.png'),fullPage:true});
 await info.attach('startup',{body:JSON.stringify({browser:browser.version(),url:page.url(),errors}),contentType:'application/json'});
});
