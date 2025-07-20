import { test, expect } from '@playwright/test';

test.describe('Vue Tweet Component - Iframe Content Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174/');
  });

  test('should verify theme variations by examining iframe content styles', async ({ page }) => {
    await page.goto('http://localhost:5174/#themes');
    
    // Wait for tweets to load
    await page.waitForSelector('iframe', { timeout: 15000 });
    
    // Check Light Theme tweet
    const lightThemeIframe = page.locator('iframe').first();
    await expect(lightThemeIframe).toBeVisible();
    
    // Access iframe content and check background/theme
    const lightThemeFrame = page.frameLocator('iframe').first();
    const lightThemeArticle = lightThemeFrame.locator('article').first();
    await expect(lightThemeArticle).toBeVisible();
    
    // Check Dark Theme tweet  
    const darkThemeIframe = page.locator('iframe').nth(1);
    await expect(darkThemeIframe).toBeVisible();
    
    // Access iframe content and check background/theme
    const darkThemeFrame = page.frameLocator('iframe').nth(1);
    const darkThemeArticle = darkThemeFrame.locator('article').first();
    await expect(darkThemeArticle).toBeVisible();
    
    // Check that both themes load valid tweets
    await expect(lightThemeFrame.locator('article')).toHaveCount(2); // Main tweet + thread
    await expect(darkThemeFrame.locator('article')).toHaveCount(2); // Main tweet + thread
    
    // Check iframe src contains theme parameter
    const lightIframeSrc = await lightThemeIframe.getAttribute('src');
    const darkIframeSrc = await darkThemeIframe.getAttribute('src');
    
    expect(lightIframeSrc).toContain('theme=light');
    expect(darkIframeSrc).toContain('theme=dark');
  });

    test('should verify alignment variations by checking twitter-tweet element float styles', async ({ page }) => {
    await page.goto('http://localhost:5174/#alignment');
    await page.waitForSelector('iframe', { timeout: 15000 });
    
    const alignmentTests = [
      { name: 'Left Aligned', index: 0, expectedFloat: 'left' },
      { name: 'Center Aligned', index: 1, expectedFloat: 'center' },
      { name: 'Right Aligned', index: 2, expectedFloat: 'right' },
      { name: 'No Alignment', index: 3, expectedFloat: 'none' }
    ];
    
    for (const test of alignmentTests) {
      const twitterTweetElement = page.locator('.twitter-tweet.twitter-tweet-rendered').nth(test.index);
      await expect(twitterTweetElement).toBeVisible();
      
      const inlineStyle = await twitterTweetElement.getAttribute('style');
      const computedFloat = await twitterTweetElement.evaluate(el => window.getComputedStyle(el).float);
      
      if (test.expectedFloat === 'left') {
        expect(computedFloat === 'left' || inlineStyle?.includes('float: left')).toBe(true);
      } else if (test.expectedFloat === 'right') {
        expect(computedFloat === 'right' || inlineStyle?.includes('float: right')).toBe(true);
      } else if (test.expectedFloat === 'center') {
        expect(inlineStyle?.includes('margin: 10px auto')).toBe(true);
      } else {
        expect(computedFloat === 'none' || computedFloat === '').toBe(true);
      }
    }
  });

  test('should verify width variations by checking iframe dimensions', async ({ page }) => {
    await page.goto('http://localhost:5174/#width');
    
    // Wait for tweets to load
    await page.waitForSelector('iframe', { timeout: 15000 });
    
    const widthTests = [
      { name: 'Auto Width', index: 0, expectedWidth: 'auto' },
      { name: 'Minimum Width (250px)', index: 1, expectedWidth: 250 },
      { name: 'Medium Width (400px)', index: 2, expectedWidth: 400 },
      { name: 'Maximum Width (550px)', index: 3, expectedWidth: 550 }
    ];
    
    for (const test of widthTests) {
      const iframe = page.locator('iframe').nth(test.index);
      await expect(iframe).toBeVisible();
      
      // Check iframe width
      const iframeWidth = await iframe.evaluate((el) => {
        return el.getBoundingClientRect().width;
      });
      
      if (typeof test.expectedWidth === 'number') {
        // Allow for some margin of error (+/- 20px) due to styling
        expect(iframeWidth).toBeGreaterThan(test.expectedWidth - 20);
        expect(iframeWidth).toBeLessThan(test.expectedWidth + 20);
      } else {
        // Auto width should be reasonable (between 250-550px)
        expect(iframeWidth).toBeGreaterThan(200);
        expect(iframeWidth).toBeLessThan(600);
      }
      
      // Check that tweet content loads in iframe
      const frame = page.frameLocator('iframe').nth(test.index);
      const article = frame.locator('article').first();
      await expect(article).toBeVisible();
    }
  });

  test('should verify cards variations by checking image rendering vs links', async ({ page }) => {
    await page.goto('http://localhost:5174/#cards');
    await page.waitForSelector('iframe', { timeout: 15000 });
    
    // First tweet (Cards Visible) - should render the actual image
    const visibleCardsFrame = page.frameLocator('iframe').first();
    const imageElement = visibleCardsFrame.locator('img[alt="Image"]');
    await expect(imageElement).toBeVisible();
    
    // Second tweet (Cards Hidden) - should show a pic.x.com link instead of image
    const hiddenCardsFrame = page.frameLocator('iframe').nth(1);
    const picLinkElement = hiddenCardsFrame.locator('a:has-text("pic.x.com")');
    await expect(picLinkElement).toBeVisible();
    
    // Verify the link text contains pic.x.com (like pic.x.com/Vq3MneDKJp)
    const linkText = await picLinkElement.textContent();
    expect(linkText).toContain('pic.x.com');
    
    // Verify the second tweet does NOT have the image element
    const hiddenImageElement = hiddenCardsFrame.locator('img[alt="Image"]');
    await expect(hiddenImageElement).not.toBeVisible();
    
    // Check iframe src contains card parameter
    const visibleCardsIframe = page.locator('iframe').first();
    const hiddenCardsIframe = page.locator('iframe').nth(1);
    
    const visibleCardsSrc = await visibleCardsIframe.getAttribute('src');
    const hiddenCardsSrc = await hiddenCardsIframe.getAttribute('src');
    
    expect(visibleCardsSrc).toContain('hideCard=false');
    expect(hiddenCardsSrc).toContain('hideCard=true');
  });

  test('should verify conversation variations by checking thread visibility', async ({ page }) => {
    await page.goto('http://localhost:5174/#conversation');
    
    // Wait for tweets to load
    await page.waitForSelector('iframe', { timeout: 15000 });
    
    // Show All Conversations tweet
    const allConversationsFrame = page.frameLocator('iframe').first();
    const allConversationsArticles = allConversationsFrame.locator('article');
    await expect(allConversationsArticles.first()).toBeVisible();
    
    // Hide Conversations tweet
    const noConversationsFrame = page.frameLocator('iframe').nth(1);
    const noConversationsArticles = noConversationsFrame.locator('article');
    await expect(noConversationsArticles.first()).toBeVisible();
    
    // Check iframe src contains conversation parameter
    const allConversationsIframe = page.locator('iframe').first();
    const noConversationsIframe = page.locator('iframe').nth(1);
    
    const allConversationsSrc = await allConversationsIframe.getAttribute('src');
    const noConversationsSrc = await noConversationsIframe.getAttribute('src');
    
    expect(allConversationsSrc).toContain('hideThread=false');
    expect(noConversationsSrc).toContain('hideThread=true');
  });

  test('should verify language variations by checking tweet language attributes', async ({ page }) => {
    await page.goto('http://localhost:5174/#languages');
    
    // Wait for tweets to load
    await page.waitForSelector('iframe', { timeout: 15000 });
    
    // English tweet
    const englishFrame = page.frameLocator('iframe').first();
    const englishArticle = englishFrame.locator('article').first();
    await expect(englishArticle).toBeVisible();
    
    // Spanish tweet
    const spanishFrame = page.frameLocator('iframe').nth(1);
    const spanishArticle = spanishFrame.locator('article').first();
    await expect(spanishArticle).toBeVisible();
    
    // Check iframe src contains language parameter
    const englishIframe = page.locator('iframe').first();
    const spanishIframe = page.locator('iframe').nth(1);
    
    const englishSrc = await englishIframe.getAttribute('src');
    const spanishSrc = await spanishIframe.getAttribute('src');
    
    expect(englishSrc).toContain('lang=en');
    expect(spanishSrc).toContain('lang=es');
  });

  test('should verify tweetId variations load correct tweets', async ({ page }) => {
    await page.goto('http://localhost:5174/#tweetId');
    
    // Wait for tweet iframes to load (not just any iframe)
    await page.waitForSelector('iframe[src*="platform.twitter.com/embed/Tweet.html"]', { timeout: 15000 });
    
    const tweetIdTests = [
      { name: 'Vue.js Tweet by ID', index: 0, expectedId: '1753678159067881809' },
      { name: 'BabylonBee Tweet by ID', index: 1, expectedId: '1945287318044025338' },
      { name: 'Tweet ID with Theme', index: 2, expectedId: '1753678159067881809' },
      { name: 'Tweet ID with Alignment', index: 3, expectedId: '1945287318044025338' }
    ];
    
    for (const test of tweetIdTests) {
      const iframe = page.locator('iframe[src*="platform.twitter.com/embed/Tweet.html"]').nth(test.index);
      await expect(iframe).toBeVisible();
      
      // Check iframe src contains the expected tweet ID
      const iframeSrc = await iframe.getAttribute('src');
      expect(iframeSrc).toContain(`id=${test.expectedId}`);
      
      // Check tweet content loads correctly
      const frame = page.frameLocator('iframe[src*="platform.twitter.com/embed/Tweet.html"]').nth(test.index);
      const article = frame.locator('article').first();
      await expect(article).toBeVisible();
    }
  });

  test('should verify slot variations show custom content', async ({ page }) => {
    await page.goto('http://localhost:5174/#slots');
    
    // Check custom loading slot or loaded tweet
    const customLoadingSlot = page.locator('.custom-loading');
    const tweetIframe = page.locator('iframe').first();
    
    // Either custom loading is visible or tweet is loaded
    try {
      await expect(customLoadingSlot).toBeVisible({ timeout: 2000 });
      await expect(customLoadingSlot.locator('span')).toContainText('🔄 Custom Loading Slot...');
    } catch {
      // If loading slot not visible, tweet should be loaded
      await expect(tweetIframe).toBeVisible({ timeout: 15000 });
      const frame = page.frameLocator('iframe').first();
      await expect(frame.locator('article').first()).toBeVisible();
    }
    
    // Check custom error slot for invalid URL
    const customErrorSlot = page.locator('.custom-error');
    await expect(customErrorSlot).toBeVisible();
    await expect(customErrorSlot).toContainText('❌ Custom Error Slot:');
  });

  test('should verify callback variations trigger properly', async ({ page }) => {
    await page.goto('http://localhost:5174/#callbacks');
    
    // Monitor console for callback logs
    const consoleMessages: string[] = [];
    page.on('console', (msg) => {
      consoleMessages.push(msg.text());
    });
    
    // Wait for tweets to load
    await page.waitForSelector('iframe', { timeout: 15000 });
    
    // Check callback info is displayed
    const callbackInfo = page.locator('.callback-info');
    await expect(callbackInfo).toHaveCount(2);
    
    // Check success callback tweet loads
    const successIframe = page.locator('iframe').first();
    await expect(successIframe).toBeVisible();
    
    const successFrame = page.frameLocator('iframe').first();
    await expect(successFrame.locator('article').first()).toBeVisible();
    
    // Wait a bit for callbacks to potentially fire
    await page.waitForTimeout(2000);
    
    // Check if success callback was called (should see console log)
    const hasSuccessCallback = consoleMessages.some(msg => 
      msg.includes('onTweetLoadSuccess') || msg.includes('callback')
    );
    
    // At least one callback should have been triggered
    expect(hasSuccessCallback || consoleMessages.length > 0).toBeTruthy();
  });

  test('should verify combined variations work together', async ({ page }) => {
    await page.goto('http://localhost:5174/#combined');
    
    // Wait for tweet iframes to load
    await page.waitForSelector('iframe[src*="platform.twitter.com/embed/Tweet.html"]', { timeout: 15000 });
    
    const combinedTests = [
      { 
        name: 'Dark Theme + Right Aligned + 400px',
        index: 0,
        expectedProps: { theme: 'dark', align: 'right', width: 400 }
      },
      { 
        name: 'Light Theme + Center + Hidden Cards',
        index: 1,
        expectedProps: { theme: 'light', align: 'center', cards: 'hidden' }
      },
      { 
        name: 'Dark + No Conversation + Spanish',
        index: 2,
        expectedProps: { theme: 'dark', conversation: 'none', lang: 'es' }
      },
      { 
        name: 'Tweet ID + All Options Combined',
        index: 3,
        expectedProps: { 
          tweetId: '1753678159067881809',
          theme: 'dark', 
          align: 'center', 
          width: 450,
          cards: 'visible',
          conversation: 'all',
          lang: 'en'
        }
      }
    ];
    
    for (const test of combinedTests) {
      const iframe = page.locator('iframe[src*="platform.twitter.com/embed/Tweet.html"]').nth(test.index);
      await expect(iframe).toBeVisible();
      
      // Check iframe src contains expected parameters
      const iframeSrc = await iframe.getAttribute('src');
      
      // Check theme
      if (test.expectedProps.theme) {
        expect(iframeSrc).toContain(`theme=${test.expectedProps.theme}`);
      }
      
      // Check language if specified
      if (test.expectedProps.lang) {
        expect(iframeSrc).toContain(`lang=${test.expectedProps.lang}`);
      }
      
      // Check cards if specified
      if (test.expectedProps.cards) {
        if (test.expectedProps.cards === 'hidden') {
          expect(iframeSrc).toContain('hideCard=true');
        } else {
          expect(iframeSrc).toContain('hideCard=false');
        }
      }
      
      // Check conversation if specified
      if (test.expectedProps.conversation) {
        if (test.expectedProps.conversation === 'none') {
          expect(iframeSrc).toContain('hideThread=true');
        } else {
          expect(iframeSrc).toContain('hideThread=false');
        }
      }
      
      // Check tweetId if specified
      if (test.expectedProps.tweetId) {
        expect(iframeSrc).toContain(`id=${test.expectedProps.tweetId}`);
      }
      
      // Check iframe width if specified
      if (test.expectedProps.width) {
        const iframeWidth = await iframe.evaluate((el) => {
          return el.getBoundingClientRect().width;
        });
        expect(iframeWidth).toBeGreaterThan(test.expectedProps.width - 20);
        expect(iframeWidth).toBeLessThan(test.expectedProps.width + 20);
      }
      
      // Check tweet content loads
      const frame = page.frameLocator('iframe[src*="platform.twitter.com/embed/Tweet.html"]').nth(test.index);
      const article = frame.locator('article').first();
      await expect(article).toBeVisible();
    }
  });

  test('should verify tweet content structure is correct', async ({ page }) => {
    await page.goto('http://localhost:5174/#themes');
    
    // Wait for tweets to load
    await page.waitForSelector('iframe', { timeout: 15000 });
    
    // Check tweet structure in iframe
    const frame = page.frameLocator('iframe').first();
    
    // Should have main tweet article
    const mainArticle = frame.locator('article').first();
    await expect(mainArticle).toBeVisible();
    
    // Should have user info (Vue account) - check for visible links
    const userLinks = frame.locator('article').first().locator('a[href*="twitter.com/vuejs"]');
    await expect(userLinks).toHaveCount(13); // Should have multiple links to vuejs account
    
    // Check for visible user link (some links might be hidden)
    const visibleUserLinks = frame.locator('article').first().locator('a[href*="twitter.com/vuejs"]:visible');
    await expect(visibleUserLinks.first()).toBeVisible();
    
    // Should have tweet text content
    const tweetText = frame.locator('article').first().locator('div[data-testid="tweetText"], div[lang]');
    await expect(tweetText.first()).toBeVisible();
    
    // Should have timestamp
    const timestamp = frame.locator('article').first().locator('time');
    await expect(timestamp).toBeVisible();
    
    // Should have interaction buttons (like, reply, etc.)
    const interactionButtons = frame.locator('article').first().locator('div[role="group"], a[href*="intent"]');
    await expect(interactionButtons.first()).toBeVisible();
  });

  test('should verify props are correctly passed to iframe URLs', async ({ page }) => {
    // Test a few key variations to ensure props are correctly passed
    await page.goto('http://localhost:5174/#themes');
    await page.waitForSelector('iframe', { timeout: 15000 });
    
    // Light theme
    const lightIframe = page.locator('iframe').first();
    const lightSrc = await lightIframe.getAttribute('src');
    expect(lightSrc).toContain('theme=light');
    
    // Dark theme
    const darkIframe = page.locator('iframe').nth(1);
    const darkSrc = await darkIframe.getAttribute('src');
    expect(darkSrc).toContain('theme=dark');
    
    // Check width variations
    await page.goto('http://localhost:5174/#width');
    await page.waitForSelector('iframe', { timeout: 15000 });
    
    const widthIframe = page.locator('iframe').nth(1); // 250px width
    const widthSrc = await widthIframe.getAttribute('src');
    expect(widthSrc).toContain('width=250');
    
    // Check language variations
    await page.goto('http://localhost:5174/#languages');
    await page.waitForSelector('iframe', { timeout: 15000 });
    
    const spanishIframe = page.locator('iframe').nth(1);
    const spanishSrc = await spanishIframe.getAttribute('src');
    expect(spanishSrc).toContain('lang=es');
  });
}); 