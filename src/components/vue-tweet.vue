<template>
  <slot v-if="isLoading" name="loading"></slot>
  <slot v-else-if="hasError" name="error"></slot>
  <div ref="tweetContainer" v-bind="attrs"></div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, PropType, nextTick, watch } from "vue";

export default defineComponent({
  props: {
    /**
     * The numerical ID of the desired Tweet.
     */
    tweetId: {
      type: String,
      required: true
    },
    /**
     * When set to none, only the cited Tweet will be displayed even if it is in reply to another Tweet.
     * @default "all"
     */
    conversation: {
      type: String as PropType<"all" | "none">,
      default: "all"
    },
    /**
     * When set to hidden, links in a Tweet are not expanded to photo, video, or link previews.
     * @default "visible"
     */
    cards: {
      type: String as PropType<"visible" | "hidden">,
      default: "visible"
    },
    /**
     * The maximum width of the rendered Tweet in whole pixels. This value should be between 250 and 550 pixels.
     * @default "auto"
     */
    width: {
      type: [String, Number] as PropType<"auto" | number>,
      default: "auto"
    },
    /**
     * Float the Tweet left, right, or center relative to its container. Typically set to allow text or other content to wrap around the Tweet.
     * @default undefined
     */
    align: {
      type: [String, undefined] as PropType<"left" | "right" | "center" | undefined>,
      default: undefined
    },
    /**
     * When set to dark, displays Tweet with light text over a dark background.
     * @default "light"
     */
    theme: {
      type: String as PropType<"light" | "dark">,
      default: "light"
    },
    /**
     * A supported Twitter language code. Loads text components in the specified language. Note: does not affect the text of the cited Tweet.
     * @default "en"
     */
    lang: {
      type: String as PropType<"ar" | "bn" | "cs" | "da" | "de" | "el" | "en" | "es" | "fa" | "fi" | "fil" | "fr" | "he" | "hi" | "hu" | "id" | "it" | "ja" | "ko" | "msa" | "nl" | "no" | "pl" | "pt" | "ro" | "ru" | "sv" | "th" | "tr" | "uk" | "ur" | "vi" | "zh-cn" | "zh-tw">,
      default: "en"
    },
    /**
     * When set to true, the Tweet and its embedded page on your site are not used for purposes that include personalized suggestions and personalized ads.
     * @default false
     */
    dnt: {
      type: Boolean,
      default: false
    }
  },
  emits: ["tweet-load-success", "tweet-load-error"],
  setup(props, { attrs, emit }) {
    const isLoading = ref<boolean>(true);
    const hasError = ref<boolean>(false);
    const tweetContainer = ref<HTMLDivElement>();

    onMounted(() => {
      renderTweet();
    })

    watch(props, () => {
      renderTweet();
    })

    function renderTweet() {
      if (!(window["twttr"] && window["twttr"].ready)) {
        addScript("https://platform.twitter.com/widgets.js", renderTweet);
        return;
      }

      window["twttr"].ready().then(({ widgets }: any) => {
        isLoading.value = true;
        hasError.value = false;
        // Clear previously rendered tweet before rendering the updated tweet id
        if (tweetContainer.value) {
          tweetContainer.value.innerHTML = "";
        }

        const { tweetId, ...options } = props;
        widgets
          .createTweet(tweetId, tweetContainer.value, options)
          .then(async (twitterWidgetElement: HTMLElement | undefined) => {
            // Since we're mutating the DOM directly with the embed we need to tell Vue wait until the DOM update
            await nextTick();

            if (twitterWidgetElement) {
              emit("tweet-load-success", twitterWidgetElement);
            } else {
              hasError.value = true;
              emit("tweet-load-error");
            }

            isLoading.value = false;
          })
      })
    }

    function addScript(src: string, cb: () => void): void {
      const s = document.createElement("script");
      s.setAttribute("src", src);
      s.addEventListener("load", () => cb(), false);
      document.body.appendChild(s);
    }

    return { tweetContainer, isLoading, hasError, attrs }
  }
})
</script>
