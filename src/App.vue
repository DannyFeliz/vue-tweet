<script setup lang="ts">
import VueTweet from "./vue-tweet.vue";

function onTweetLoadSuccess(embedNode: HTMLDivElement) {
  console.log("onTweetLoadSuccess callback", embedNode);
}
function onTweetLoadError(error: Error) {
  console.log("onTweetLoadError callback", error);
}
</script>

<template>
    <vue-tweet
    tweet-url="https://twitter.com/DannyFeliz08/status/15302400858070548448"
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
  </vue-tweet>
</template>
