<template>
  <TweetEmbed
    class="my-custom-class"
    tweetId="20"
    :options="{ lang: 'es', theme: 'dark' }"
    :onTweetLoadError="onTweetLoadError"
    :onTweetLoadSuccess="onTweetLoadSuccess"
  >
    <template v-slot:loading>
      <span>Loading...</span>
    </template>

    <template v-slot:error>
      <span>Sorry, that tweet doesn’t exist!</span>
    </template>
  </TweetEmbed>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import TweetEmbed from './components/TweetEmbed.vue'

export default defineComponent({
  name: 'App',
  components: {
    TweetEmbed
  },
  methods: {
    onTweetLoadSuccess(element: HTMLElement) {
      console.log(element)
    },
    onTweetLoadError() {
      console.log("Ops... an error has occurred.")
    }
  }
})
</script>
