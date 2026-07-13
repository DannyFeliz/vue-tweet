# vue-tweet

Vue 3 component that lets you embed tweets in your app by only providing the tweet ID.

[<img src="https://img.shields.io/npm/dt/vue-tweet.svg">](https://www.npmjs.com/package/vue-tweet)
[<img src="https://img.shields.io/npm/v/vue-tweet.svg">](https://www.npmjs.com/package/vue-tweet)
[<img src="https://github.com/DannyFeliz/vue-tweet/actions/workflows/playwright.yml/badge.svg">](https://github.com/DannyFeliz/vue-tweet/actions/workflows/playwright.yml)
[<img src="https://img.shields.io/bundlephobia/minzip/vue-tweet">](https://bundlephobia.com/package/vue-tweet)
[<img src="https://img.shields.io/npm/l/vue-tweet.svg">](https://github.com/DannyFeliz/vue-tweet/blob/main/LICENSE)

## Demo

[![Edit Vue Tweet](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/devbox/vue-tweet-demo-r2rvr8?file=%2Fsrc%2FApp.vue%3A6%2C41)

[![Preview](https://github.com/DannyFeliz/vue-tweet/assets/5460365/ec8116cb-9c9f-49a0-bd01-33419907b239)](https://codesandbox.io/p/devbox/vue-tweet-demo-r2rvr8?file=%2Fsrc%2FApp.vue%3A6%2C41)

## Installation

```bash
npm install vue-tweet

# or with yarn
yarn add vue-tweet

# or with pnpm
pnpm add vue-tweet
```

## Usage

### Basic Usage with Tweet ID

```vue
<script setup>
import VueTweet from 'vue-tweet'
</script>

<template>
  <VueTweet tweet-id="1530240085807054848" />
</template>
```

### Using Tweet URL

```vue
<script setup>
import VueTweet from 'vue-tweet'
</script>

<template>
  <VueTweet tweet-url="https://x.com/DannyFeliz08/status/1530240085807054848" />
</template>
```

### Using Named Import

```vue
<script setup>
import { VueTweet } from 'vue-tweet'
</script>

<template>
  <VueTweet tweet-id="1530240085807054848" />
</template>
```

## Props

> **Note:** You must provide either `tweet-id` or `tweet-url`.

For detailed information about embedded tweet parameters, see the [Embedded Tweet parameter reference](https://developer.x.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-parameter-reference).

### `tweet-id`

- **Type:** `string`
- **Default:** `''`
- **Description:** The numerical ID of the desired tweet.

### `tweet-url`

- **Type:** `string`
- **Default:** `''`
- **Description:** The tweet URL. Share links copied from X work as-is, including query parameters (e.g. `https://x.com/user/status/123?s=20`). Both `twitter.com` and `x.com` URLs are supported.

### `cards`

- **Type:** `'visible' | 'hidden'`
- **Default:** `'visible'`
- **Description:** When set to `'hidden'`, links in a tweet are not expanded to photo, video, or link previews.

### `conversation`

- **Type:** `'all' | 'none'`
- **Default:** `'all'`
- **Description:** When set to `'none'`, only the cited tweet will be displayed even if it is in reply to another tweet.

### `theme`

- **Type:** `'light' | 'dark' | 'system'`
- **Default:** `'light'`
- **Description:** When set to `'dark'`, displays tweet with light text over a dark background. When set to `'system'`, automatically matches the user's operating system color scheme and updates the tweet when the preference changes.

> [!NOTE]
> The `'system'` value is a custom implementation provided by this library. It is not part of the official Twitter widget API. Under the hood, it uses `prefers-color-scheme` to detect the OS theme and passes the resolved `'dark'` or `'light'` value to the widget.

### `width`

- **Type:** `'auto' | number`
- **Default:** `'auto'`
- **Description:** The maximum width of the rendered tweet in whole pixels. This value should be between `250` and `550` pixels.

### `align`

- **Type:** `'left' | 'right' | 'center' | undefined`
- **Default:** `undefined`
- **Description:** Float the tweet left, right, or center relative to its container. Typically set to allow text or other content to wrap around the tweet.

### `lang`

- **Type:** `TweetLang`
- **Default:** `'en'`
- **Values:** `'ar' | 'bn' | 'cs' | 'da' | 'de' | 'el' | 'en' | 'es' | 'fa' | 'fi' | 'fil' | 'fr' | 'he' | 'hi' | 'hu' | 'id' | 'it' | 'ja' | 'ko' | 'msa' | 'nl' | 'no' | 'pl' | 'pt' | 'ro' | 'ru' | 'sv' | 'th' | 'tr' | 'uk' | 'ur' | 'vi' | 'zh-cn' | 'zh-tw'`
- **Description:** A supported Twitter language code. Loads text components in the specified language. Note: does not affect the text of the cited tweet.

### `dnt`

- **Type:** `boolean`
- **Default:** `false`
- **Description:** When set to `true`, the tweet and its embedded page on your site are not used for purposes that include personalized suggestions and personalized ads.

## Events

### `tweet-load-success`

- **Type:** `(embedHtmlNode: HTMLDivElement) => void`
- **Description:** Emitted after successfully loading the tweet.

### `tweet-load-error`

- **Type:** `(error: Error) => void`
- **Description:** Emitted when an error occurs while trying to load the tweet — invalid props, a tweet that doesn't exist, or a failure to load Twitter's `widgets.js` script itself (e.g. blocked by the network).

## Slots

### `loading`

Slot for custom loading state.

```vue
<VueTweet tweet-id="20">
  <template #loading>
    <span>Loading tweet...</span>
  </template>
</VueTweet>
```

### `error`

Slot for custom error state. It receives the `error` as a slot prop.

```vue
<VueTweet tweet-id="20">
  <template #error="{ error }">
    <span>Failed to load the tweet: {{ error?.message }}</span>
  </template>
</VueTweet>
```

## Exposed Methods

### `reload()`

Re-runs tweet rendering. Useful for a "Retry" button in the error slot:

```vue
<script setup>
import { useTemplateRef } from 'vue'
import VueTweet from 'vue-tweet'

const tweetRef = useTemplateRef('tweet')
</script>

<template>
  <VueTweet ref="tweet" tweet-id="1530240085807054848">
    <template #error="{ error }">
      <p>{{ error?.message }}</p>
      <button @click="tweetRef?.reload()">Retry</button>
    </template>
  </VueTweet>
</template>
```

## Complete Example

```vue
<script setup>
import VueTweet from 'vue-tweet'

function onTweetLoaded(embedHtmlNode) {
  console.log('Tweet loaded successfully:', embedHtmlNode)
}

function onTweetError(error) {
  console.error('Failed to load tweet:', error)
}
</script>

<template>
  <VueTweet
    tweet-id="1530240085807054848"
    theme="dark"
    cards="hidden"
    conversation="none"
    :width="400"
    align="center"
    lang="en"
    :dnt="true"
    @tweet-load-success="onTweetLoaded"
    @tweet-load-error="onTweetError"
  >
    <template #loading>
      <div class="loading-spinner">Loading tweet...</div>
    </template>
    <template #error>
      <div class="error-message">Failed to load tweet</div>
    </template>
  </VueTweet>
</template>
```

## Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Lint files
npm run lint

# Run end-to-end tests (Playwright)
npm test
```

## Nuxt / SSR

The component is safe to import in SSR apps (it doesn't touch `window` until it's mounted), but the tweet itself renders client-side. In Nuxt, wrap it in `<ClientOnly>`:

```vue
<template>
  <ClientOnly>
    <VueTweet tweet-id="1530240085807054848" />
  </ClientOnly>
</template>
```

## TypeScript Support

This package includes TypeScript definitions. You can import the component and types:

```typescript
import VueTweet, {
  type TweetProps,
  type TweetLang,
  type TweetTheme,       // 'light' | 'dark' | 'system'
  type TweetWidgetTheme, // 'light' | 'dark'
} from 'vue-tweet'
```

## Contributing

1. Fork it (<https://github.com/dannyfeliz/vue-tweet/fork>)
2. Create your feature branch (`git checkout -b feature/awesome-feature`)
3. Commit your changes (`git commit -am 'Add some awesome feature'`)
4. Push to the branch (`git push origin feature/awesome-feature`)
5. Create a new Pull Request

## License

MIT
