# vue-tweet

Vue 3 component that let you embed tweets in your App by only giving the tweet id

[<img src="https://img.shields.io/npm/dt/vue-tweet.svg">](https://www.npmjs.com/package/vue-tweet)
[<img src="https://img.shields.io/npm/v/vue-tweet.svg">](https://www.npmjs.com/package/vue-tweet)

This project was developed using Vue 3 + Typescript + Vite 🚀

## Demo

[![Edit Demo vue-tweet](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/vue-tweet-embed-demo-sue23?file=/src/App.vue)

## Installation

```bash
npm install vue-tweet --save

# or with yarn

yarn add vue-tweet
```

## Usage

```vue
<template>
  <Tweet
    tweet-id="1370027087818461184"
    cards="visible"
    conversation="all"
    lang="en"
    theme="light"
    align="left"
    :width="400"
    :dnt="false"
    @tweet-load-error="onTweetLoadError"
    @tweet-load-success="onTweetLoadSuccess"
  >
    <template v-slot:loading>
      <span>Loading...</span>
    </template>

    <template v-slot:error>
      <span>Sorry, that tweet doesn’t exist!</span>
    </template>
  </Tweet>
</template>

<script>
import { defineComponent } from 'vue'
import Tweet from 'vue-tweet'

export default defineComponent({
  components: {
    Tweet
  },
  setup() {
    function onTweetLoadSuccess(embedNode) {
      console.log(embedNode)
    }

    function onTweetLoadError() {
      console.log("Ops... an error has occurred")
    }

    return { onTweetLoadSuccess, onTweetLoadError }
  }
})
</script>

```

# Props - [Embedded Tweet parameter reference](https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-parameter-reference)
<hr>

**tweet-id**

Type: `string`

`Required`

The numerical ID of the desired Tweet.

<hr>

**cards**

Type: `string`

Default: `"visible"`

Values: `"visible" | "hidden"`

When set to hidden, links in a Tweet are not expanded to photo, video, or link previews.

<hr>

**conversation**

Type: `string`

Default: `"all"`

Values: `"all" | "none"`

When set to none, only the cited Tweet will be displayed even if it is in reply to another Tweet.

<hr>

**theme**

Type: `string`

Default: `"light"`

Values: `"light" | "dark"`

When set to dark, displays Tweet with light text over a dark background.

<hr>

**width**

Type: `string | number`

Default: `"auto"`

Values: `"auto" | number`

The maximum width of the rendered Tweet in whole pixels. This value should be between `250` and `550` pixels.

<hr>

**align**

Type: `string | undefined`

Default: `undefined`

Values: `"left" | "right" | "center" | undefined`

Float the Tweet left, right, or center relative to its container. Typically set to allow text or other content to wrap around the Tweet.

<hr>

**lang**

Type: `string`

Default: `en`

Values: `"ar" | "bn" | "cs" | "da" | "de" | "el" | "en" | "es" | "fa" | "fi" | "fil" | "fr" | "he" | "hi" | "hu" | "id" | "it" | "ja" | "ko" | "msa" | "nl" | "no" | "pl" | "pt" | "ro" | "ru" | "sv" | "th" | "tr" | "uk" | "ur" | "vi" | "zh-cn" | "zh-tw"`

A supported Twitter language code. Loads text components in the specified language. Note: does not affect the text of the cited Tweet.

<hr>

**dnt**

Type: `boolean`

Default: `false`

When set to true, the Tweet and its embedded page on your site are not used for purposes that include personalized suggestions and personalized ads.

# Events
**tweet-load-success**

Type: `HTMLElement`

Attributes: `(embedHtmlNode)`

Emitted after successfully load the tweet.

<hr>

**tweet-load-error**

Emitted after an error occurs while trying to get the tweet
# Slots

**loading**

Slot for custom loading state.
```vue
<Tweet tweetId="20">
    <template v-slot:loading>
      <span>Loading...</span>
    </template>
</Tweet>
```

<hr>

**error**

Slot for custom error state.
```vue
<Tweet tweetId="20">
    <template v-slot:error>
      <span>Sorry, that tweet doesn't exist!</span>
    </template>
</Tweet>
```

## Development setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run dev
```

### Compiles and minifies for production

```
npm run build
```
### Locally preview production build

```
npm run serve
```

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Vetur](https://marketplace.visualstudio.com/items?itemName=octref.vetur). Make sure to enable `vetur.experimental.templateInterpolationService` in settings!

### If Using `<script setup>`

[`<script setup>`](https://github.com/vuejs/rfcs/pull/227) is a feature that is currently in RFC stage. To get proper IDE support for the syntax, use [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar) instead of Vetur (and disable Vetur).

## Type Support For `.vue` Imports in TS

Since TypeScript cannot handle type information for `.vue` imports, they are shimmed to be a generic Vue component type by default. In most cases this is fine if you don't really care about component prop types outside of templates. However, if you wish to get actual prop types in `.vue` imports (for example to get props validation when using manual `h(...)` calls), you can use the following:

### If Using Volar

Run `Volar: Switch TS Plugin on/off` from VSCode command palette.

### If Using Vetur

1. Install and add `@vuedx/typescript-plugin-vue` to the [plugins section](https://www.typescriptlang.org/tsconfig#plugins) in `tsconfig.json`
2. Delete `src/shims-vue.d.ts` as it is no longer needed to provide module info to Typescript
3. Open `src/main.ts` in VSCode
4. Open the VSCode command palette 5. Search and run "Select TypeScript version" -> "Use workspace version"

### Customize configuration

See [Configuration Reference](https://vitejs.dev/guide/#command-line-interface).

# Contributing

1. Fork it (<https://github.com/dannyfeliz/vue-tweet/fork>)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am "Add some fooBar"`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request

