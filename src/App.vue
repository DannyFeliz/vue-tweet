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

const list = ref([
  { id: "1753678159067881809", lang: 'en', theme: 'light' },
  { id: "1773610951993950668", lang: 'en', theme: 'light' },
  { id: "1773606396501623093", lang: 'en', theme: 'light' },
  { id: "1773411988179210750", lang: 'en', theme: 'light' },
  { id: "1773379914567188605", lang: 'en', theme: 'light' },
]);
</script>

<template>
  <input style="display: block;" v-for="tweet in list" :key="tweet.id" type="text" :value="tweet.theme" @input="tweet.theme = $event.target.value" />

  <vue-tweet
    v-for="{ id, lang, theme } in list"
    :key="id"
    :tweet-id="`${id}`"
    cards="visible"
    conversation="all"
    :lang="lang"
    :theme="theme"
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
