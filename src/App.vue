<script setup lang="ts">
import { ref } from "vue";
import VueTweet from "./vue-tweet.vue";

function onTweetLoadSuccess(embedNode: HTMLDivElement) {
  console.log("onTweetLoadSuccess callback", embedNode);
}

const tweetError = ref<Error | null>(null);
function onTweetLoadError(error: Error) {
  tweetError.value = error;
  console.log("onTweetLoadError callback", error);
}
</script>

<template>
    <vue-tweet
      tweet-url="https://twitter.com/vuejs/status/1753678159067881809"
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
        <span>{{ tweetError?.message }}</span>
      </template>
    </vue-tweet>
</template>
