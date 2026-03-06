<template>
  <slot v-if="hasError" name="error" />
  <slot v-else-if="isLoading" name="loading" />
  <div ref="tweetContainerRef" v-bind="$attrs" />
</template>

<script lang="ts" setup>
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  nextTick,
  watch,
  toRef,
  type PropType,
} from 'vue'

export type TweetLang = 'ar' | 'bn' | 'cs' | 'da' | 'de' | 'el' | 'en' | 'es' | 'fa' | 'fi' | 'fil' | 'fr' | 'he' | 'hi' | 'hu' | 'id' | 'it' | 'ja' | 'ko' | 'msa' | 'nl' | 'no' | 'pl' | 'pt' | 'ro' | 'ru' | 'sv' | 'th' | 'tr' | 'uk' | 'ur' | 'vi' | 'zh-cn' | 'zh-tw'
export type TweetWidgetTheme = 'light' | 'dark'
export type TweetTheme = TweetWidgetTheme | 'system'

export interface TweetProps {
  tweetId?: string
  tweetUrl?: string
  conversation?: 'all' | 'none'
  cards?: 'visible' | 'hidden'
  width?: 'auto' | number
  align?: 'left' | 'right' | 'center'
  theme?: TweetTheme
  lang?: TweetLang
  dnt?: boolean
}

const props = defineProps({
  tweetId: {
    type: String,
    default: '',
  },
  tweetUrl: {
    type: String,
    default: '',
  },
  conversation: {
    type: String as PropType<'all' | 'none'>,
    default: 'all',
    validator: (value: string) => ['all', 'none'].includes(value),
  },
  cards: {
    type: String as PropType<'visible' | 'hidden'>,
    default: 'visible',
    validator: (value: string) => ['visible', 'hidden'].includes(value),
  },
  width: {
    type: [String, Number] as PropType<'auto' | number>,
    default: 'auto',
    validator: (value: string | number) => {
      if (typeof value === 'string') {
        return value === 'auto'
      }
      if (typeof value === 'number') {
        return value >= 250 && value <= 550
      }
      return false
    },
  },
  align: {
    type: [String, undefined] as PropType<'left' | 'right' | 'center' | undefined>,
    default: undefined,
    validator: (value: string | undefined) =>
      ['left', 'right', 'center', undefined].includes(value),
  },
  theme: {
    type: String as PropType<TweetTheme>,
    default: 'light',
    validator: (value: string) => ['light', 'dark', 'system'].includes(value),
  },
  lang: {
    type: String as PropType<TweetLang>,
    default: 'en',
  },
  dnt: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['tweet-load-success', 'tweet-load-error'])

const isLoading = ref(true)
const hasError = ref(false)
const tweetContainerRef = ref<HTMLDivElement>()
const activeTimers: ReturnType<typeof setTimeout | typeof setInterval>[] = []

const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

function getSystemTheme(): TweetWidgetTheme {
  return darkModeMediaQuery.matches ? 'dark' : 'light'
}

// Tracks the last known system theme so we can detect actual changes
const lastSystemTheme = ref<TweetWidgetTheme>(getSystemTheme())

const resolvedTheme = computed<TweetWidgetTheme>(() =>
  props.theme === 'system' ? lastSystemTheme.value : props.theme
)

function onSystemThemeChange(event: MediaQueryListEvent): void {
  const newTheme: TweetWidgetTheme = event.matches ? 'dark' : 'light'
  if (newTheme !== lastSystemTheme.value) {
    lastSystemTheme.value = newTheme
    // Re-render the tweet with the updated OS theme
    renderTweet()
  }
}

function startListeningToSystemTheme(): void {
  darkModeMediaQuery.addEventListener('change', onSystemThemeChange)
}

function stopListeningToSystemTheme(): void {
  darkModeMediaQuery.removeEventListener('change', onSystemThemeChange)
}

onMounted(() => {
  if (props.theme === 'system') {
    startListeningToSystemTheme()
  }
  renderTweet()
})

onUnmounted(() => {
  stopListeningToSystemTheme()
  activeTimers.forEach(clearTimeout)
  activeTimers.length = 0
})

// Re-render when any prop changes
watch(toRef(props), renderTweet, {
  deep: true,
})

// Manage the matchMedia listener when theme prop toggles to/from 'system'
watch(() => props.theme, (newTheme, oldTheme) => {
  if (newTheme === 'system' && oldTheme !== 'system') {
    startListeningToSystemTheme()
  } else if (newTheme !== 'system' && oldTheme === 'system') {
    stopListeningToSystemTheme()
  }
})

function renderTweet(): void {
  // If script is not loaded and not currently loading, load it
  if (!window.twttr && !window.___$twitterScriptLoaded___ && !window.___$twitterScriptLoading___) {
    addScript('https://platform.twitter.com/widgets.js', renderTweet);
    return
  }

  // If script is loaded or available, proceed with rendering
  if (window.twttr) {
    renderTweetContent()
  } else {
    // If script is loading, wait for it to be ready
    const waitForScript = () => {
      if (window.twttr) {
        renderTweetContent()
      } else {
        activeTimers.push(setTimeout(waitForScript, 150))
      }
    }
    waitForScript()
  }
}

function renderTweetContent(): void {
  // Only called after verifying window.twttr exists in renderTweet()
  window.twttr?.ready().then(({ widgets }) => {
    isLoading.value = true
    hasError.value = false
    // Clear previously rendered tweet before rendering the updated tweet id
    if (tweetContainerRef.value) {
      tweetContainerRef.value.innerHTML = ''
    } else {
      console.error('tweetContainerRef is null')
      return
    }

    const { tweetId, tweetOptions } = getTweetParams()
    widgets
      .createTweet(tweetId, tweetContainerRef.value, tweetOptions)
      .then(async (twitterWidgetElement: HTMLDivElement | undefined) => {
        // Since we're mutating the DOM directly with the embed we need to tell Vue wait until the DOM update
        await nextTick()

        if (twitterWidgetElement) {
          emit('tweet-load-success', twitterWidgetElement)
        } else {
          hasError.value = true
          emit('tweet-load-error', new Error('Failed to load tweet.'))
        }
      })
      .finally(() => {
        isLoading.value = false
      })
  }).catch((error: Error) => {
    console.error('Error loading Twitter widget:', error)
    hasError.value = true
  }).finally(() => {
    isLoading.value = false
  })
}

function getTweetParams() {
  const { tweetId: rawTweetId, tweetUrl: rawTweetUrl, ...tweetOptions } = props
  let tweetId = rawTweetId
  let tweetUrl = rawTweetUrl

  // Always pass the resolved theme ('dark' | 'light') to the Twitter widget, never 'system'
  tweetOptions.theme = resolvedTheme.value

  let error: Error | null = null
  if (tweetId && tweetUrl) {
    error = new Error('Cannot provide both tweet-id and tweet-url.')
  } else if (tweetId) {
    if (!/^\d+$/.test(tweetId)) {
      error = new Error(
        'Invalid tweet-id, please provide a valid numerical tweet-id.'
      )
    }
  } else if (tweetUrl) {
    const TWEET_URL_REGEX = /^(https?:\/\/)?(www\.)?(twitter|x)\.com\/.*\/status(?:es)?\/([^/?]\d+)$/i

    const match = tweetUrl.trim().match(TWEET_URL_REGEX)
    if (match && match[4]) {
      tweetId = match[4]
    } else {
      error = new Error('Invalid tweet-url.')
    }
  } else {
    error = new Error('Must provide either tweet-id or tweet-url.')
  }

  if (error) {
    hasError.value = true
    isLoading.value = false
    emit('tweet-load-error', error)
    throw error
  }

  return {
    tweetId: tweetId as string,
    tweetOptions,
  }
}

function addScript(src: string, cb: () => void): void {
  if (window.___$twitterScriptLoaded___ === undefined) {
    window.___$twitterScriptLoaded___ = false
  }
  if (window.___$twitterScriptLoading___ === undefined) {
    window.___$twitterScriptLoading___ = false
  }

  // If script is already loaded, execute callback immediately
  if (window.___$twitterScriptLoaded___) {
    cb();
    return;
  }

  // If script is currently loading, wait for it to complete
  if (window.___$twitterScriptLoading___) {
    const waitInterval = setInterval(() => {
      if (window.___$twitterScriptLoaded___) {
        clearInterval(waitInterval)
        cb()
      }
    }, 100)
    activeTimers.push(waitInterval)
    return
  }

  // Set loading state immediately to prevent race conditions
  window.___$twitterScriptLoading___ = true
  
  const s = document.createElement('script')
  s.setAttribute('src', src)
  s.async = true
  s.addEventListener('load', () => {
    window.___$twitterScriptLoaded___ = true
    window.___$twitterScriptLoading___ = false
    cb()
  }, false)
  
  // Handle script load errors
  s.addEventListener('error', () => {
    console.error('Failed to load Twitter script')
    window.___$twitterScriptLoading___ = false
  }, false)
  
  document.body.appendChild(s)
}
</script>
