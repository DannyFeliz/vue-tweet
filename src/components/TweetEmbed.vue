<template>
  <slot v-if="isLoading" name="loading"></slot>
  <slot v-else-if="hasError" name="error"></slot>
  <div ref="tweetContainer" v-bind="attrs"></div>
</template>


<script lang="ts">
import { defineComponent, ref, onMounted, watch, PropType, toRefs, computed, watchEffect, nextTick } from "vue"

interface TweetEmbedProps {
  tweetId: string
  options?: object
  onTweetLoadSuccess?: (twitterWidgetElement: HTMLElement) => any
  onTweetLoadError?: () => any
}

interface EmbedOptions {
  conversation?: "none" | "all";
  cards?: "hidden" | "visible";
  width?: number | 'auto';
  align?: "left" | "right" | "center" | undefined;
  theme?: "dark" | "light";
  lang?: "en" | "ar" | "bn" | "cs" | "da" | "de" | "el" | "es" | "fa" | "fi" | "fil" | "fr" | "he" | "hi" | "hu" | "id" | "it" | "ja" | "ko" | "msa" | "nl" | "no" | "pl" | "pt" | "ro" | "ru" | "sv" | "th" | "tr" | "uk" | "ur" | "vi" | "zh-cn" | "zh-tw";
  dnt?: boolean
}

export default defineComponent({
  props: {
    tweetId: {
      type: String,
      required: true
    },
    options: {
      type: Object as PropType<EmbedOptions>,
      default() {
        return {}
      }
    },
    onTweetLoadSuccess: {
      type: Function as PropType<(twitterWidgetElement: HTMLElement) => any>
    },
    onTweetLoadError: {
      type: Function as PropType<(err: Error) => any>
    }
  },
  setup(props: TweetEmbedProps, { attrs }) {
    const { tweetId, options, onTweetLoadSuccess, onTweetLoadError } = toRefs(props);
    const isLoading = ref<boolean>(true);
    const hasError = ref<boolean>(false);
    const tweetContainer = ref<HTMLDivElement>();
    const defaultOptions = ref<EmbedOptions>({
      conversation: "all",
      cards: "visible",
      width: "auto",
      align: undefined,
      theme: "light",
      lang: "en",
      dnt: false
    })

    onMounted(() => {
      loadTweet();
    })

    watch([tweetId, options], () => {
      loadTweet();
    })

    function addScript(src: string, cb: () => any) {
      const s = document.createElement('script');
      s.setAttribute('src', src);
      s.addEventListener('load', () => cb(), false);
      document.body.appendChild(s);
    }

    function loadTweet() {
      if (!(window['twttr'] && window['twttr'].ready)) {
        addScript(`https://platform.twitter.com/widgets.js`, renderTweet);
      } else {
        renderTweet();
      }
    }

    function renderTweet() {
      window['twttr'].ready().then(({ widgets }: any) => {
        isLoading.value = true;
        hasError.value = false;
        // Clear previously rendered tweet before rendering the updated tweet id
        if (tweetContainer.value) {
          tweetContainer.value.innerHTML = ''
        }

        widgets
          .createTweet(tweetId.value, tweetContainer.value, Object.assign(defaultOptions.value, options?.value))
          .then(async (twitterWidgetElement: HTMLElement | undefined) => {
            // Since we're mutating the DOM directly with the embed we need to tell Vue wait until the DOM update
            await nextTick()

            if (twitterWidgetElement) {
              onTweetLoadSuccess?.value && onTweetLoadSuccess.value(twitterWidgetElement);
            } else {
              hasError.value = true;
              onTweetLoadError?.value && onTweetLoadError.value();
            }
            isLoading.value = false;
          })
      })
    }

    return { tweetContainer, isLoading, hasError, attrs }
  }
})
</script>
