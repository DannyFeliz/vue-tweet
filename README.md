# vue-tweet

Vue 3 component that lets you embed tweets in your App by only giving the tweet id

[<img src="https://img.shields.io/npm/dt/vue-tweet.svg">](https://www.npmjs.com/package/vue-tweet)
[<img src="https://img.shields.io/npm/v/vue-tweet.svg">](https://www.npmjs.com/package/vue-tweet)

This project was developed using Vue 3 + Typescript + Vite 🚀

## Demo

[![Edit Demo vue-tweet](https://user-images.githubusercontent.com/5460365/161323040-d73231f8-db73-48ef-adab-433558502585.png)](https://stackblitz.com/edit/vitejs-vite-c5qu9k?file=src/App.vue)

[![Preview](https://user-images.githubusercontent.com/5460365/171073819-e6e97952-a851-48cd-80f8-d72489efd57b.png)](https://stackblitz.com/edit/vitejs-vite-c5qu9k?file=src/App.vue)

## Installation

```bash
npm install vue-tweet --save

# or with yarn

yarn add vue-tweet
```

## Usage

```vue
<script setup>
import Tweet from "vue-tweet";
</script>

<template>
  <Tweet tweet-id="1530240085807054848" />
</template>
```

Or using a tweet URL

```vue
<script setup>
import Tweet from "vue-tweet";
</script>

<template>
  <Tweet
    tweet-url="https://twitter.com/DannyFeliz08/status/1530240085807054848"
  />
</template>
```

# Props - [Embedded Tweet parameter reference](https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-parameter-reference)

### Note: You must provide either `tweet-id` or `tweet-url`.

**tweet-id**

Type: `string`

Default: `''`

The numerical ID of the desired Tweet.

<hr />

**tweet-url**

Type: `string`

Default: `''`

The Tweet URL.

<hr />

**cards**

Type: `string`

Default: `"visible"`

Values: `"visible" | "hidden"`

When set to hidden, links in a Tweet are not expanded to photo, video, or link previews.

<hr />

**conversation**

Type: `string`

Default: `"all"`

Values: `"all" | "none"`

When set to none, only the cited Tweet will be displayed even if it is in reply to another Tweet.

<hr />

**theme**

Type: `string`

Default: `"light"`

Values: `"light" | "dark"`

When set to dark, displays Tweet with light text over a dark background.

<hr />

**width**

Type: `string | number`

Default: `"auto"`

Values: `"auto" | number`

The maximum width of the rendered Tweet in whole pixels. This value should be between `250` and `550` pixels.

<hr />

**align**

Type: `string | undefined`

Default: `undefined`

Values: `"left" | "right" | "center" | undefined`

Float the Tweet left, right, or center relative to its container. Typically set to allow text or other content to wrap around the Tweet.

<hr />

**lang**

Type: `string`

Default: `en`

Values: `"ar" | "bn" | "cs" | "da" | "de" | "el" | "en" | "es" | "fa" | "fi" | "fil" | "fr" | "he" | "hi" | "hu" | "id" | "it" | "ja" | "ko" | "msa" | "nl" | "no" | "pl" | "pt" | "ro" | "ru" | "sv" | "th" | "tr" | "uk" | "ur" | "vi" | "zh-cn" | "zh-tw"`

A supported Twitter language code. Loads text components in the specified language. Note: does not affect the text of the cited Tweet.

<hr />

**dnt**

Type: `boolean`

Default: `false`

When set to true, the Tweet and its embedded page on your site are not used for purposes that include personalized suggestions and personalized ads.

# Events

**tweet-load-success**

Type: `HTMLElement`

Attributes: `(embedHtmlNode)`

Emitted after successfully load the tweet.

<hr />

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

<hr />

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

### Customize configuration

See [Configuration Reference](https://vitejs.dev/guide/#command-line-interface).

# Contributing

1. Fork it (<https://github.com/dannyfeliz/vue-tweet/fork>)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am "Add some fooBar"`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request
