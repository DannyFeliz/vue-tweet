import { test, expect, type Page, type Locator } from '@playwright/test';

/**
 * Hybrid strategy:
 * - Deterministic tests block all Twitter/X hosts so they never depend on live
 *   network: playground navigation, prop wiring, URL/ID validation, loading
 *   slot, and script-failure handling.
 * - A small set of live smoke tests verifies real embeds still work and that
 *   props (theme, conversation, lang, dnt) actually reach the Twitter widget
 *   via its iframe URL.
 */

const LIVE_TIMEOUT = 20000;

async function blockTwitterNetwork(page: Page) {
  for (const pattern of ['**://*.twitter.com/**', '**://*.x.com/**', '**://*.twimg.com/**']) {
    await page.route(pattern, (route) => route.abort());
  }
}

function card(page: Page, name: string): Locator {
  return page.locator(`.test-item:has(h3:text-is("${name}"))`);
}

/**
 * Average RGB channel of the rendered tweet's background, to assert the theme
 * visually took effect without depending on Twitter's exact palette.
 */
async function articleLuminance(item: Locator): Promise<number> {
  const bg = await item.frameLocator('iframe').locator('article').first().evaluate(
    (el) => getComputedStyle(el).backgroundColor
  );
  const [r, g, b] = (bg.match(/\d+/g) ?? []).map(Number);
  return (r + g + b) / 3;
}

test.describe('Playground navigation (no network)', () => {
  test.beforeEach(async ({ page }) => {
    await blockTwitterNetwork(page);
    await page.goto('/');
  });

  test('displays the header and all navigation items', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Vue Tweet Component Playground');
    await expect(page.locator('header p')).toHaveText('Select a variation to test different props and features');

    const navItems = [
      'Themes', 'Alignment', 'Width', 'Cards', 'Conversation',
      'Languages', 'Dnt', 'TweetId', 'Slots', 'Callbacks', 'Errors', 'Combined'
    ];

    for (const item of navItems) {
      await expect(page.locator(`nav a:has-text("${item}")`)).toBeVisible();
    }
  });

  test('shows the themes variation by default', async ({ page }) => {
    await expect(page.locator('h2')).toHaveText('Theme Variations');
    await expect(page.locator('main p')).toContainText('Test light and dark themes');
  });

  test('navigates between all variations and updates the URL hash', async ({ page }) => {
    const variations = [
      { name: 'Alignment', hash: '#alignment', title: 'Alignment Variations' },
      { name: 'Width', hash: '#width', title: 'Width Variations' },
      { name: 'Cards', hash: '#cards', title: 'Cards Variations' },
      { name: 'Conversation', hash: '#conversation', title: 'Conversation Variations' },
      { name: 'Languages', hash: '#languages', title: 'Language Variations' },
      { name: 'Dnt', hash: '#dnt', title: 'DNT Variations' },
      { name: 'TweetId', hash: '#tweetId', title: 'Tweet ID Variations' },
      { name: 'Slots', hash: '#slots', title: 'Slot Variations' },
      { name: 'Callbacks', hash: '#callbacks', title: 'Callback Variations' },
      { name: 'Errors', hash: '#errors', title: 'Error Handling' },
      { name: 'Combined', hash: '#combined', title: 'Combined Variations' },
      { name: 'Themes', hash: '#themes', title: 'Theme Variations' }
    ];

    for (const variation of variations) {
      await page.click(`nav a[href="${variation.hash}"]`);

      expect(page.url()).toContain(variation.hash);
      await expect(page.locator(`nav a[href="${variation.hash}"]`)).toHaveClass(/active/);
      await expect(page.locator('h2')).toHaveText(variation.title);
    }
  });

  test('displays each variation card with the configured props', async ({ page }) => {
    const variations: Record<string, Array<{ name: string; props: string }>> = {
      themes: [
        { name: 'Light Theme', props: '{"theme":"light"}' },
        { name: 'Dark Theme', props: '{"theme":"dark"}' },
        { name: 'System Theme', props: '{"theme":"system"}' },
      ],
      alignment: [
        { name: 'Left Aligned', props: '{"align":"left"}' },
        { name: 'Center Aligned', props: '{"align":"center"}' },
        { name: 'Right Aligned', props: '{"align":"right"}' },
        { name: 'No Alignment (undefined)', props: 'Default props' },
      ],
      width: [
        { name: 'Auto Width', props: '{"width":"auto"}' },
        { name: 'Minimum Width (250px)', props: '{"width":250}' },
        { name: 'Medium Width (400px)', props: '{"width":400}' },
        { name: 'Maximum Width (550px)', props: '{"width":550}' },
      ],
      cards: [
        { name: 'Cards Visible', props: '{"cards":"visible"' },
        { name: 'Cards Hidden', props: '{"cards":"hidden"' },
      ],
      conversation: [
        { name: 'Show All Conversations', props: '{"conversation":"all"}' },
        { name: 'Hide Conversations', props: '{"conversation":"none"}' },
      ],
      languages: [
        { name: 'English', props: '{"lang":"en"}' },
        { name: 'Spanish', props: '{"lang":"es"}' },
      ],
      dnt: [
        { name: 'DNT Enabled', props: '{"dnt":true}' },
      ],
      tweetId: [
        { name: 'Vue.js Tweet by ID', props: '{"tweetId":"1753678159067881809"}' },
        { name: 'BabylonBee Tweet by ID', props: '{"tweetId":"1945287318044025338"}' },
        { name: 'Tweet ID with Theme', props: '{"tweetId":"1753678159067881809","theme":"dark"}' },
        { name: 'Tweet ID with Alignment', props: '{"tweetId":"1945287318044025338","align":"center"}' },
      ],
      slots: [
        { name: 'Custom Loading Slot', props: 'Default props' },
        { name: 'Custom Error Slot (use invalid URL)', props: '{"tweetUrl":"https://invalid-url"}' },
      ],
      callbacks: [
        { name: 'Success Callback', props: 'Default props' },
        { name: 'Error Callback (invalid URL)', props: '{"tweetUrl":"https://invalid-url"}' },
      ],
      errors: [
        { name: 'Invalid URL', props: '{"tweetUrl":"https://invalid-url"}' },
        { name: 'Both ID and URL', props: '{"tweetId":"1753678159067881809","tweetUrl":"https://x.com/vuejs/status/1753678159067881809"}' },
        { name: 'Non-numeric ID', props: '{"tweetId":"not-a-number"}' },
        { name: 'URL with Query String', props: '{"tweetUrl":"https://x.com/vuejs/status/1753678159067881809?s=20&t=abc123"}' },
      ],
      combined: [
        { name: 'Dark Theme + Right Aligned + 400px', props: '{"theme":"dark","align":"right","width":400}' },
        { name: 'Light Theme + Center + Hidden Cards', props: '{"theme":"light","align":"center","cards":"hidden"}' },
        { name: 'Dark + No Conversation + Spanish', props: '{"theme":"dark","conversation":"none","lang":"es"}' },
        { name: 'Tweet ID + All Options Combined', props: '{"tweetId":"1753678159067881809","theme":"dark","align":"center","width":450,"cards":"visible","conversation":"all","lang":"en"}' },
      ],
    };

    for (const [hash, cards] of Object.entries(variations)) {
      await page.goto(`/#${hash}`);

      for (let i = 0; i < cards.length; i++) {
        await expect(page.locator('h3').nth(i)).toHaveText(cards[i].name);
        await expect(page.locator('.test-props').nth(i)).toContainText(cards[i].props);
      }
    }
  });
});

test.describe('Validation errors (no network)', () => {
  test.beforeEach(async ({ page }) => {
    await blockTwitterNetwork(page);
    await page.goto('/#errors');
  });

  test('shows a specific error message and emits tweet-load-error for each invalid input', async ({ page }) => {
    const cases = [
      { name: 'Invalid URL', message: 'Invalid tweet-url.' },
      { name: 'Both ID and URL', message: 'Cannot provide both tweet-id and tweet-url.' },
      { name: 'Non-numeric ID', message: 'Invalid tweet-id, please provide a valid numerical tweet-id.' },
    ];

    for (const { name, message } of cases) {
      const item = card(page, name);
      // The error slot proves hasError is set; the callback status proves the event was emitted
      await expect(item.locator('.custom-error')).toContainText(`❌ Custom Error Slot: ${message}`);
      await expect(item.locator('.callback-status')).toHaveText(`❌ Error: ${message}`);
    }
  });

  test('accepts a share URL with a query string', async ({ page }) => {
    // With the network blocked the only possible failure is the script load —
    // if URL parsing rejected the query string we'd see "Invalid tweet-url." instead.
    const item = card(page, 'URL with Query String');
    await expect(item.locator('.custom-error')).toContainText('Failed to load the Twitter widgets script.');
  });
});

test.describe('Loading and script-failure states (no network)', () => {
  test('shows the loading slot while the Twitter script is pending', async ({ page }) => {
    await blockTwitterNetwork(page);
    // Hold widgets.js open forever so the component stays in its loading state
    await page.route('**/widgets.js*', () => { /* never fulfill */ });

    // The held script request keeps the window 'load' event from firing,
    // so only wait for DOMContentLoaded
    await page.goto('/#slots', { waitUntil: 'domcontentloaded' });

    const loading = card(page, 'Custom Loading Slot').locator('.custom-loading');
    await expect(loading).toBeVisible();
    await expect(loading).toContainText('🔄 Custom Loading Slot...');
  });

  test('shows the error slot when the Twitter script fails to load', async ({ page }) => {
    await blockTwitterNetwork(page);
    await page.goto('/#slots');

    const item = card(page, 'Custom Loading Slot');
    await expect(item.locator('.custom-error')).toContainText('Failed to load the Twitter widgets script.');
  });
});

test.describe('Live Twitter embeds (network)', () => {
  test('renders a tweet and fires tweet-load-success', async ({ page }) => {
    await page.goto('/#callbacks');

    const item = card(page, 'Success Callback');
    await expect(item.locator('.callback-status')).toHaveText('✅ Loaded', { timeout: LIVE_TIMEOUT });
    await expect(item.frameLocator('iframe').locator('article').first()).toBeVisible({ timeout: LIVE_TIMEOUT });
    // dnt defaults to false; asserted here because no embed on this page enables
    // DNT (widgets.js applies DNT page-globally once one embed opts in)
    await expect(item.locator('iframe')).toHaveAttribute('src', /dnt=false/);
  });

  test('applies light, dark, and system themes', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/#themes');

    await expect(card(page, 'Light Theme').locator('iframe')).toHaveAttribute('src', /theme=light/, { timeout: LIVE_TIMEOUT });
    await expect(card(page, 'Dark Theme').locator('iframe')).toHaveAttribute('src', /theme=dark/, { timeout: LIVE_TIMEOUT });
    await expect(card(page, 'System Theme').locator('iframe')).toHaveAttribute('src', /theme=dark/, { timeout: LIVE_TIMEOUT });

    // The theme visibly affects the rendered tweet, not just the embed URL
    expect(await articleLuminance(card(page, 'Dark Theme'))).toBeLessThan(100);
    expect(await articleLuminance(card(page, 'Light Theme'))).toBeGreaterThan(200);

    // Flipping the OS color scheme re-renders only the system-theme tweet
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(card(page, 'System Theme').locator('iframe')).toHaveAttribute('src', /theme=light/, { timeout: LIVE_TIMEOUT });
    await expect(card(page, 'Dark Theme').locator('iframe')).toHaveAttribute('src', /theme=dark/);
  });

  test('passes the conversation option to the embed', async ({ page }) => {
    await page.goto('/#conversation');

    await expect(card(page, 'Show All Conversations').locator('iframe')).toHaveAttribute('src', /hideThread=false/, { timeout: LIVE_TIMEOUT });
    await expect(card(page, 'Hide Conversations').locator('iframe')).toHaveAttribute('src', /hideThread=true/, { timeout: LIVE_TIMEOUT });
  });

  test('passes the language option to the embed', async ({ page }) => {
    await page.goto('/#languages');

    await expect(card(page, 'English').locator('iframe')).toHaveAttribute('src', /lang=en/, { timeout: LIVE_TIMEOUT });
    await expect(card(page, 'Spanish').locator('iframe')).toHaveAttribute('src', /lang=es/, { timeout: LIVE_TIMEOUT });

    // The embed document is actually localized (we assert the document language,
    // not Twitter's translated copy, which can change)
    await expect(card(page, 'English').frameLocator('iframe').locator('html')).toHaveAttribute('lang', 'en', { timeout: LIVE_TIMEOUT });
    await expect(card(page, 'Spanish').frameLocator('iframe').locator('html')).toHaveAttribute('lang', 'es', { timeout: LIVE_TIMEOUT });
  });

  test('shows or hides the link-preview card', async ({ page }) => {
    await page.goto('/#cards');

    const visible = card(page, 'Cards Visible');
    const hidden = card(page, 'Cards Hidden');
    await expect(visible.locator('iframe')).toHaveAttribute('src', /hideCard=false/, { timeout: LIVE_TIMEOUT });
    await expect(hidden.locator('iframe')).toHaveAttribute('src', /hideCard=true/, { timeout: LIVE_TIMEOUT });

    // Same tweet rendered twice: the link-preview card adds an extra image
    await expect(visible.frameLocator('iframe').locator('article').first()).toBeVisible({ timeout: LIVE_TIMEOUT });
    await expect(hidden.frameLocator('iframe').locator('article').first()).toBeVisible({ timeout: LIVE_TIMEOUT });
    await expect
      .poll(async () => {
        const visibleImages = await visible.frameLocator('iframe').locator('img').count();
        const hiddenImages = await hidden.frameLocator('iframe').locator('img').count();
        return visibleImages - hiddenImages;
      }, { timeout: LIVE_TIMEOUT })
      .toBeGreaterThan(0);
  });

  test('applies the requested width to the embed', async ({ page }) => {
    await page.goto('/#width');

    const iframe = card(page, 'Minimum Width (250px)').locator('iframe');
    await expect(iframe).toBeVisible({ timeout: LIVE_TIMEOUT });
    await expect.poll(async () => (await iframe.boundingBox())?.width, { timeout: LIVE_TIMEOUT }).toBe(250);
  });

  test('passes the dnt option to the embed', async ({ page }) => {
    await page.goto('/#dnt');

    await expect(card(page, 'DNT Enabled').locator('iframe')).toHaveAttribute('src', /dnt=true/, { timeout: LIVE_TIMEOUT });
  });

  test('renders a tweet from a share URL with a query string', async ({ page }) => {
    await page.goto('/#errors');

    const item = card(page, 'URL with Query String');
    await expect(item.frameLocator('iframe').locator('article').first()).toBeVisible({ timeout: LIVE_TIMEOUT });
    await expect(item.locator('.callback-status')).toHaveText('✅ Loaded', { timeout: LIVE_TIMEOUT });
  });

  test('renders a tweet with combined props', async ({ page }) => {
    await page.goto('/#combined');

    const item = card(page, 'Dark Theme + Right Aligned + 400px');
    await expect(item.locator('iframe')).toHaveAttribute('src', /theme=dark/, { timeout: LIVE_TIMEOUT });
    await expect(item.frameLocator('iframe').locator('article').first()).toBeVisible({ timeout: LIVE_TIMEOUT });
  });
});
