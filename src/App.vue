<template>
  <TweetEmbed
    tweetId="1370027087818461184"
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
  </TweetEmbed>
</template>

<script lang="ts" setup>
import TweetEmbed from "./components/vue-tweet.vue"

function onTweetLoadSuccess(embedNode: HTMLElement) {
  console.log(embedNode);
}

function onTweetLoadError() {
  console.log("Ops... an error has occurred");
}
</script>
