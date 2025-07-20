import { test, expect } from '@playwright/test';

test.describe('Vue Tweet Playground - Navigation & Variations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display playground header and navigation', async ({ page }) => {
    // Check page title and header
    await expect(page.locator('h1')).toHaveText('Vue Tweet Component Playground');
    await expect(page.locator('header p')).toHaveText('Select a variation to test different props and features');
    
    // Check all navigation items are present
    const navItems = [
      'Themes', 'Alignment', 'Width', 'Cards', 'Conversation', 
      'Languages', 'TweetId', 'Slots', 'Callbacks', 'Combined'
    ];
    
    for (const item of navItems) {
      await expect(page.locator(`nav a:has-text("${item}")`)).toBeVisible();
    }
  });

  test('should navigate to themes variation by default', async ({ page }) => {
    // Check themes variation content is shown by default
    await expect(page.locator('h2')).toHaveText('Theme Variations');
    await expect(page.locator('main p')).toContainText('Test light and dark themes');
  });

  test('should navigate between all variations and update URL hash', async ({ page }) => {
    const variations = [
      { name: 'Alignment', hash: '#alignment', title: 'Alignment Variations' },
      { name: 'Width', hash: '#width', title: 'Width Variations' },
      { name: 'Cards', hash: '#cards', title: 'Cards Variations' },
      { name: 'Conversation', hash: '#conversation', title: 'Conversation Variations' },
      { name: 'Languages', hash: '#languages', title: 'Language Variations' },
      { name: 'TweetId', hash: '#tweetId', title: 'Tweet ID Variations' },
      { name: 'Slots', hash: '#slots', title: 'Slot Variations' },
      { name: 'Callbacks', hash: '#callbacks', title: 'Callback Variations' },
      { name: 'Combined', hash: '#combined', title: 'Combined Variations' },
      { name: 'Themes', hash: '#themes', title: 'Theme Variations' }
    ];

    for (const variation of variations) {
      await page.click(`nav a:has-text("${variation.name}")`);
      
      // Check URL hash changed
      expect(page.url()).toContain(variation.hash);
      
      // Check active navigation item
      await expect(page.locator(`nav a[href="${variation.hash}"]`)).toHaveClass(/active/);
      
      // Check variation content loaded
      await expect(page.locator('h2')).toHaveText(variation.title);
      
      // Wait a bit for content to load
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Vue Tweet Playground - Theme Variations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#themes');
  });

  test('should display theme variations with correct props', async ({ page }) => {
    // Check Light Theme test
    await expect(page.locator('h3').first()).toHaveText('Light Theme');
    await expect(page.locator('.test-props').first()).toContainText('{"theme":"light"}');
    
    // Check Dark Theme test
    await expect(page.locator('h3').nth(1)).toHaveText('Dark Theme');
    await expect(page.locator('.test-props').nth(1)).toContainText('{"theme":"dark"}');
  });

  test('should render tweets for theme variations', async ({ page }) => {
    // Wait for tweets to load
    await page.waitForSelector('iframe', { timeout: 15000 });
    
    // Should have 2 tweets (light and dark theme)
    const iframes = await page.locator('iframe').count();
    expect(iframes).toBeGreaterThanOrEqual(2);
    
    // Check tweets are rendered
    const firstIframe = page.frameLocator('iframe').first();
    await expect(firstIframe.locator('article').first()).toBeVisible();
    
    const secondIframe = page.frameLocator('iframe').nth(1);
    await expect(secondIframe.locator('article').first()).toBeVisible();
  });
});

test.describe('Vue Tweet Playground - Alignment Variations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#alignment');
  });

  test('should display alignment variations with correct props', async ({ page }) => {
    const alignments = [
      { name: 'Left Aligned', props: '{"align":"left"}' },
      { name: 'Center Aligned', props: '{"align":"center"}' },
      { name: 'Right Aligned', props: '{"align":"right"}' },
      { name: 'No Alignment (undefined)', props: 'Default props' }
    ];

    for (let i = 0; i < alignments.length; i++) {
      await expect(page.locator('h3').nth(i)).toHaveText(alignments[i].name);
      await expect(page.locator('.test-props').nth(i)).toContainText(alignments[i].props);
    }
  });

  test('should render tweets for alignment variations', async ({ page }) => {
    // Wait for tweets to load
    await page.waitForSelector('iframe', { timeout: 15000 });
    
    // Should have 4 tweets (left, center, right, none)
    const iframes = await page.locator('iframe').count();
    expect(iframes).toBeGreaterThanOrEqual(4);
    
    // Check first 4 tweets are rendered
    for (let i = 0; i < 4; i++) {
      const iframe = page.frameLocator('iframe').nth(i);
      await expect(iframe.locator('article').first()).toBeVisible();
    }
  });
});

test.describe('Vue Tweet Playground - Width Variations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#width');
  });

  test('should display width variations with correct props', async ({ page }) => {
    const widths = [
      { name: 'Auto Width', props: '{"width":"auto"}' },
      { name: 'Minimum Width (250px)', props: '{"width":250}' },
      { name: 'Medium Width (400px)', props: '{"width":400}' },
      { name: 'Maximum Width (550px)', props: '{"width":550}' }
    ];

    for (let i = 0; i < widths.length; i++) {
      await expect(page.locator('h3').nth(i)).toHaveText(widths[i].name);
      await expect(page.locator('.test-props').nth(i)).toContainText(widths[i].props);
    }
  });

  test('should render tweets for width variations', async ({ page }) => {
    // Wait for tweets to load
    await page.waitForSelector('iframe', { timeout: 15000 });
    
    // Should have 4 tweets for different widths
    const iframes = await page.locator('iframe').count();
    expect(iframes).toBeGreaterThanOrEqual(4);
    
    // Check first 4 tweets are rendered
    for (let i = 0; i < 4; i++) {
      const iframe = page.frameLocator('iframe').nth(i);
      await expect(iframe.locator('article').first()).toBeVisible();
    }
  });
});

test.describe('Vue Tweet Playground - Cards Variations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#cards');
  });

  test('should display cards variations with correct props', async ({ page }) => {
    await expect(page.locator('h3').first()).toHaveText('Cards Visible');
    await expect(page.locator('.test-props').first()).toContainText('{"cards":"visible"');
    
    await expect(page.locator('h3').nth(1)).toHaveText('Cards Hidden');
    await expect(page.locator('.test-props').nth(1)).toContainText('{"cards":"hidden"');
  });

  test('should render tweets for cards variations', async ({ page }) => {
    // Wait for tweets to load
    await page.waitForSelector('iframe', { timeout: 15000 });
    
    // Should have 2 tweets (visible and hidden cards)
    const iframes = await page.locator('iframe').count();
    expect(iframes).toBeGreaterThanOrEqual(2);
    
    // Check first 2 tweets are rendered
    for (let i = 0; i < 2; i++) {
      const iframe = page.frameLocator('iframe').nth(i);
      await expect(iframe.locator('article').first()).toBeVisible();
    }
  });
});

test.describe('Vue Tweet Playground - Conversation Variations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#conversation');
  });

  test('should display conversation variations with correct props', async ({ page }) => {
    await expect(page.locator('h3').first()).toHaveText('Show All Conversations');
    await expect(page.locator('.test-props').first()).toContainText('{"conversation":"all"}');
    
    await expect(page.locator('h3').nth(1)).toHaveText('Hide Conversations');
    await expect(page.locator('.test-props').nth(1)).toContainText('{"conversation":"none"}');
  });

  test('should render tweets for conversation variations', async ({ page }) => {
    // Wait for tweets to load
    await page.waitForSelector('iframe', { timeout: 15000 });
    
    // Should have 2 tweets (all and none conversation)
    const iframes = await page.locator('iframe').count();
    expect(iframes).toBeGreaterThanOrEqual(2);
    
    // Check first 2 tweets are rendered
    for (let i = 0; i < 2; i++) {
      const iframe = page.frameLocator('iframe').nth(i);
      await expect(iframe.locator('article').first()).toBeVisible();
    }
  });

  test('should verify conversation behavior - show all vs hide conversations', async ({ page }) => {
    // Wait for tweets to load
    await page.waitForSelector('iframe', { timeout: 15000 });
    
    // Get both iframes
    const showAllIframe = page.frameLocator('iframe').first(); // Show All Conversations
    const hideConversationIframe = page.frameLocator('iframe').nth(1); // Hide Conversations
    
    // Wait for content to load in both iframes
    await expect(showAllIframe.locator('article').first()).toBeVisible();
    await expect(hideConversationIframe.locator('article').first()).toBeVisible();
    
    // Count articles (tweets) in each iframe
    const showAllArticleCount = await showAllIframe.locator('article').count();
    const hideConversationArticleCount = await hideConversationIframe.locator('article').count();
    
    // When showing all conversations, there should be more articles (original + replies)
    // When hiding conversations, there should be fewer articles (just the reply)
    expect(showAllArticleCount).toBeGreaterThan(hideConversationArticleCount);
    
    // Verify the "Show All Conversations" iframe has multiple tweets (conversation thread)
    expect(showAllArticleCount).toBeGreaterThan(hideConversationArticleCount);
    
    // For tweets with replies, Show All should typically have 2+ tweets (original + replies)
    expect(showAllArticleCount).toBeGreaterThanOrEqual(2);
    
    // Hide Conversations should typically have 1 tweet (just the reply)
    expect(hideConversationArticleCount).toBeGreaterThanOrEqual(1);
    
    // Additional verification: check that both iframes have tweet content
    await expect(showAllIframe.locator('article').first()).toBeVisible();
    await expect(hideConversationIframe.locator('article').first()).toBeVisible();
  });
});

test.describe('Vue Tweet Playground - Language Variations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#languages');
  });

  test('should display language variations with correct props', async ({ page }) => {
    await expect(page.locator('h3').first()).toHaveText('English');
    await expect(page.locator('.test-props').first()).toContainText('{"lang":"en"}');
    
    await expect(page.locator('h3').nth(1)).toHaveText('Spanish');
    await expect(page.locator('.test-props').nth(1)).toContainText('{"lang":"es"}');
  });

  test('should render tweets for language variations', async ({ page }) => {
    // Wait for tweets to load
    await page.waitForSelector('iframe', { timeout: 15000 });
    
    // Should have 2 tweets (English and Spanish)
    const iframes = await page.locator('iframe').count();
    expect(iframes).toBeGreaterThanOrEqual(2);
    
    // Check first 2 tweets are rendered
    for (let i = 0; i < 2; i++) {
      const iframe = page.frameLocator('iframe').nth(i);
      await expect(iframe.locator('article').first()).toBeVisible();
    }
  });
});

test.describe('Vue Tweet Playground - Tweet ID Variations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#tweetId');
  });

  test('should display tweet ID variations with correct props', async ({ page }) => {
    const tweetIds = [
      { name: 'Vue.js Tweet by ID', props: '{"tweetId":"1753678159067881809"}' },
      { name: 'BabylonBee Tweet by ID', props: '{"tweetId":"1945287318044025338"}' },
      { name: 'Tweet ID with Theme', props: '{"tweetId":"1753678159067881809","theme":"dark"}' },
      { name: 'Tweet ID with Alignment', props: '{"tweetId":"1945287318044025338","align":"center"}' }
    ];

    for (let i = 0; i < tweetIds.length; i++) {
      await expect(page.locator('h3').nth(i)).toHaveText(tweetIds[i].name);
      await expect(page.locator('.test-props').nth(i)).toContainText(tweetIds[i].props);
    }
  });

  test('should render tweets for tweet ID variations', async ({ page }) => {
    // Wait for tweets to load
    await page.waitForSelector('iframe', { timeout: 15000 });
    
    // Should have 4 tweets for different tweet IDs
    const iframes = await page.locator('iframe').count();
    expect(iframes).toBeGreaterThanOrEqual(4);
    
    // Check first 4 tweets are rendered
    for (let i = 0; i < 4; i++) {
      const iframe = page.frameLocator('iframe').nth(i);
      await expect(iframe.locator('article').first()).toBeVisible();
    }
  });
});

test.describe('Vue Tweet Playground - Slots Variations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#slots');
  });

  test('should display slots variations with correct props', async ({ page }) => {
    await expect(page.locator('h3').first()).toHaveText('Custom Loading Slot');
    await expect(page.locator('.test-props').first()).toContainText('Default props');
    
    await expect(page.locator('h3').nth(1)).toHaveText('Custom Error Slot (use invalid URL)');
    await expect(page.locator('.test-props').nth(1)).toContainText('{"tweetUrl":"https://invalid-url"}');
  });

  test('should show custom loading slot or tweet loaded', async ({ page }) => {
    // Either custom loading slot is visible (if tweet loads slowly) or tweet is loaded
    const customLoading = page.locator('.custom-loading');
    const tweetIframe = page.locator('iframe[title="X Post"]');
    
    // Check if custom loading slot appears or tweet loads directly
    try {
      await expect(customLoading).toBeVisible({ timeout: 1000 });
      await expect(customLoading.locator('span')).toContainText('🔄 Custom Loading Slot...');
    } catch {
      // If custom loading slot is not visible, check that tweet loaded
      await expect(tweetIframe).toBeVisible({ timeout: 15000 });
    }
  });

  test('should show custom error slot for invalid URL', async ({ page }) => {
    // Check for custom error slot
    await expect(page.locator('.custom-error')).toBeVisible();
    await expect(page.locator('.custom-error')).toContainText('❌ Custom Error Slot:');
  });
});

test.describe('Vue Tweet Playground - Callbacks Variations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#callbacks');
  });

  test('should display callbacks variations with correct props', async ({ page }) => {
    await expect(page.locator('h3').first()).toHaveText('Success Callback');
    await expect(page.locator('.test-props').first()).toContainText('Default props');
    
    await expect(page.locator('h3').nth(1)).toHaveText('Error Callback (invalid URL)');
    await expect(page.locator('.test-props').nth(1)).toContainText('{"tweetUrl":"https://invalid-url"}');
  });

  test('should show callback info for both variations', async ({ page }) => {
    // Check callback info is displayed
    const callbackInfoElements = page.locator('.callback-info');
    await expect(callbackInfoElements).toHaveCount(2);
    
    for (let i = 0; i < 2; i++) {
      await expect(callbackInfoElements.nth(i)).toContainText('Check console for callback logs');
    }
  });

  test('should render tweet for success callback', async ({ page }) => {
    // Wait for tweet to load
    await page.waitForSelector('iframe', { timeout: 15000 });
    
    // Should have at least 1 tweet for success callback
    const iframes = await page.locator('iframe').count();
    expect(iframes).toBeGreaterThanOrEqual(1);
    
    // Check first tweet is rendered
    const firstIframe = page.frameLocator('iframe').first();
    await expect(firstIframe.locator('article').first()).toBeVisible();
  });
});

test.describe('Vue Tweet Playground - Combined Variations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#combined');
  });

  test('should display combined variations with correct props', async ({ page }) => {
    const combined = [
      { name: 'Dark Theme + Right Aligned + 400px', props: '{"theme":"dark","align":"right","width":400}' },
      { name: 'Light Theme + Center + Hidden Cards', props: '{"theme":"light","align":"center","cards":"hidden"}' },
      { name: 'Dark + No Conversation + Spanish', props: '{"theme":"dark","conversation":"none","lang":"es"}' },
      { name: 'Tweet ID + All Options Combined', props: '{"tweetId":"1753678159067881809","theme":"dark","align":"center","width":450,"cards":"visible","conversation":"all","lang":"en"}' }
    ];

    for (let i = 0; i < combined.length; i++) {
      await expect(page.locator('h3').nth(i)).toHaveText(combined[i].name);
      await expect(page.locator('.test-props').nth(i)).toContainText(combined[i].props);
    }
  });

  test('should render tweets for combined variations', async ({ page }) => {
    // Wait for tweets to load
    await page.waitForSelector('iframe', { timeout: 15000 });
    
    // Should have 4 tweets for combined variations
    const iframes = await page.locator('iframe').count();
    expect(iframes).toBeGreaterThanOrEqual(4);
    
    // Check first 4 tweets are rendered
    for (let i = 0; i < 4; i++) {
      const iframe = page.frameLocator('iframe').nth(i);
      await expect(iframe.locator('article').first()).toBeVisible();
    }
  });
}); 