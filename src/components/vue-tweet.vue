<template>
  <slot v-if="isLoading" name="loading"></slot>
  <slot v-else-if="hasError" name="error"></slot>
  <div ref="tweetContainerRef" v-bind="attrs"></div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  onMounted,
  PropType,
  nextTick,
  watch,
} from "vue";
const langs = [
  "ar",
  "bn",
  "cs",
  "da",
  "de",
  "el",
  "en",
  "es",
  "fa",
  "fi",
  "fil",
  "fr",
  "he",
  "hi",
  "hu",
  "id",
  "it",
  "ja",
  "ko",
  "msa",
  "nl",
  "no",
  "pl",
  "pt",
  "ro",
  "ru",
  "sv",
  "th",
  "tr",
  "uk",
  "ur",
  "vi",
  "zh-cn",
  "zh-tw",
] as const;
const TWEET_URL_REGEX =
  /^(https?:\/\/)?(www\.)?twitter\.com\/.*\/status(?:es)?\/(?<tweetId>[^\/\?]\d+)$/i;

export default defineComponent({
  props: {
    /**
     The numerical ID of the desired Tweet.
     
     @example
       <TweetEmbed tweetId="20" />
     */
    tweetId: {
      type: String,
      default: "",
    },
    /**
     The Tweet URL.

     @example
       <TweetEmbed tweetId="https://twitter.com/jack/status/20" />
     */
    tweetUrl: {
      type: String,
      default: "",
    },
    /**
     * When set to none, only the cited Tweet will be displayed even if it is in reply to another Tweet.
     * @default "all"
     */
    conversation: {
      type: String as PropType<"all" | "none">,
      default: "all",
      validator: (value: string) => ["all", "none"].includes(value),
    },
    /**
     * When set to hidden, links in a Tweet are not expanded to photo, video, or link previews.
     * @default "visible"
     */
    cards: {
      type: String as PropType<"visible" | "hidden">,
      default: "visible",
      validator: (value: string) => ["visible", "hidden"].includes(value),
    },
    /**
     * The maximum width of the rendered Tweet in whole pixels. This value should be between 250 and 550 pixels.
     * @default "auto"
     */
    width: {
      type: [String, Number] as PropType<"auto" | number>,
      default: "auto",
      validator: (value: string | number) => {
        if (typeof value === "string") {
          return value === "auto";
        }

        if (typeof value === "number") {
          return value >= 250 && value <= 550;
        }

        return false;
      },
    },
    /**
     * Float the Tweet left, right, or center relative to its container. Typically set to allow text or other content to wrap around the Tweet.
     * @default undefined
     */
    align: {
      type: [String, undefined] as PropType<
        "left" | "right" | "center" | undefined
      >,
      default: undefined,
      validator: (value: string | undefined) =>
        ["left", "right", "center", undefined].includes(value),
    },
    /**
     * When set to dark, displays Tweet with light text over a dark background.
     * @default "light"
     */
    theme: {
      type: String as PropType<"light" | "dark">,
      default: "light",
      validator: (value: string) => ["light", "dark"].includes(value),
    },
    /**
     * A supported Twitter language code. Loads text components in the specified language. Note: does not affect the text of the cited Tweet.
     * @default "en"
     */
    lang: {
      type: String as PropType<typeof langs[number]>,
      default: "en",
      validator: (value: typeof langs[number]) => langs.includes(value),
    },
    /**
     * When set to true, the Tweet and its embedded page on your site are not used for purposes that include personalized suggestions and personalized ads.
     * @default false
     */
    dnt: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    "tweet-load-success": (twitterWidgetElement: HTMLDivElement) =>
      !!twitterWidgetElement,
    "tweet-load-error": () => true,
  },
  setup(props, { attrs, emit }) {
    const isLoading = ref<boolean>(true);
    const hasError = ref<boolean>(false);
    const tweetContainerRef = ref<HTMLDivElement>();

    onMounted(() => {
      renderTweet();
    });

    watch(props, () => {
      renderTweet();
    });

    function renderTweet(): void {
      if (!(window["twttr"] && window["twttr"].ready)) {
        addScript("https://platform.twitter.com/widgets.js", renderTweet);
        return;
      }

      window["twttr"].ready().then(({ widgets }: any) => {
        isLoading.value = true;
        hasError.value = false;
        // Clear previously rendered tweet before rendering the updated tweet id
        if (tweetContainerRef.value) {
          tweetContainerRef.value.innerHTML = "";
        }

        const { tweetId, tweetOptions } = getTweetParams();

        widgets
          .createTweet(tweetId, tweetContainerRef.value, tweetOptions)
          .then(async (twitterWidgetElement: HTMLDivElement | undefined) => {
            // Since we're mutating the DOM directly with the embed we need to tell Vue wait until the DOM update
            await nextTick();

            if (twitterWidgetElement) {
              emit("tweet-load-success", twitterWidgetElement);
            } else {
              hasError.value = true;
              emit("tweet-load-error");
            }
          })
          .finally(() => {
            isLoading.value = false;
          });
      });
    }

    function getTweetParams() {
      let { tweetId, tweetUrl, ...tweetOptions } = props;

      if (tweetId && tweetUrl) {
        throw new Error("Cannot provide both tweet-id and tweet-url.");
      } else if (tweetId) {
        if (!/^\d+$/.test(tweetId)) {
          throw new Error(
            "Invalid tweet-id, please provide a valid numerical tweet-id."
          );
        }
      } else if (tweetUrl) {
        const match = tweetUrl.trim().match(TWEET_URL_REGEX);
        if (match) {
          tweetId = match.groups?.tweetId as string;
        } else {
          throw new Error("Invalid tweet-url.");
        }
      } else {
        throw new Error("Must provide either tweet-id or tweet-url.");
      }

      return {
        tweetId,
        tweetOptions,
      };
    }

    function addScript(src: string, cb: () => void): void {
      const s = document.createElement("script");
      s.setAttribute("src", src);
      s.addEventListener("load", () => cb(), false);
      document.body.appendChild(s);
    }

    return { tweetContainerRef, isLoading, hasError, attrs };
  },
});
</script>
