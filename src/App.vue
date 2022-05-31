<template>
  <TweetEmbed
    tweet-url="https://twitter.com/DannyFeliz08/status/1530240085807054848"
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
      <span>Sorry, that tweet doesn't exist!</span>
    </template>
  </TweetEmbed>
</template>

<script setup lang="ts">
import TweetEmbed from "./components/vue-tweet.vue"

function onTweetLoadSuccess(embedNode: HTMLDivElement) {
  console.log("onTweetLoadSuccess callback", embedNode);
}

function onTweetLoadError() {
  console.log("onTweetLoadError callback");
}
</script>
