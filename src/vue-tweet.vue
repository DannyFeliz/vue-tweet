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
    type: String as PropType<'left' | 'right' | 'center'>,
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

const TWITTER_SCRIPT_URL = 'https://platform.twitter.com/widgets.js'
const SCRIPT_LOAD_TIMEOUT_MS = 30000
const SCRIPT_POLL_INTERVAL_MS = 100
const TWEET_URL_REGEX = /^(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/.+?\/status(?:es)?\/(\d+)(?:[/?#]|$)/i

const isLoading = ref(true)
const hasError = ref(false)
const tweetContainerRef = ref<HTMLDivElement>()
const activeTimers: ReturnType<typeof setInterval>[] = []

// Created in onMounted so importing/rendering the component doesn't touch `window` (SSR-safe)
let darkModeMediaQuery: MediaQueryList | undefined
const lastSystemTheme = ref<TweetWidgetTheme>('light')

function getSystemTheme(): TweetWidgetTheme {
  return darkModeMediaQuery?.matches ? 'dark' : 'light'
}

const resolvedTheme = computed<TweetWidgetTheme>(() =>
  props.theme === 'system' ? lastSystemTheme.value : props.theme
)

function onSystemThemeChange(): void {
  const newTheme = getSystemTheme()
  if (newTheme !== lastSystemTheme.value) {
    lastSystemTheme.value = newTheme
    // Re-render the tweet with the updated OS theme
    renderTweet()
  }
}

function startListeningToSystemTheme(): void {
  darkModeMediaQuery?.addEventListener('change', onSystemThemeChange)
}

function stopListeningToSystemTheme(): void {
  darkModeMediaQuery?.removeEventListener('change', onSystemThemeChange)
}

onMounted(() => {
  darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  lastSystemTheme.value = getSystemTheme()
  if (props.theme === 'system') {
    startListeningToSystemTheme()
  }
  renderTweet()
})

onUnmounted(() => {
  stopListeningToSystemTheme()
  activeTimers.forEach(clearInterval)
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

function setError(error: Error): void {
  hasError.value = true
  isLoading.value = false
  emit('tweet-load-error', error)
}

function renderTweet(): void {
  const params = getTweetParams()
  if (!params) {
    return
  }

  loadTwitterScript()
    .then(() => renderTweetContent(params))
    .catch((error: Error) => {
      console.error('Error loading Twitter widget:', error)
      setError(error)
    })
}

function renderTweetContent(params: { tweetId: string; tweetOptions: Record<string, unknown> }): Promise<void> {
  isLoading.value = true
  hasError.value = false

  if (!window.twttr) {
    return Promise.reject(new Error('Failed to load the Twitter widgets script.'))
  }

  return window.twttr.ready().then(({ widgets }) => {
    const container = tweetContainerRef.value
    if (!container) {
      // The component was unmounted while the script was loading
      return
    }

    // Clear previously rendered tweet before rendering the updated tweet
    container.innerHTML = ''

    return widgets
      .createTweet(params.tweetId, container, params.tweetOptions)
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
  }).finally(() => {
    isLoading.value = false
  })
}

function getTweetParams(): { tweetId: string; tweetOptions: Record<string, unknown> } | null {
  const { tweetId: rawTweetId, tweetUrl, ...tweetOptions } = props
  let tweetId = rawTweetId

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
    const match = tweetUrl.trim().match(TWEET_URL_REGEX)
    if (match) {
      tweetId = match[1]
    } else {
      error = new Error('Invalid tweet-url.')
    }
  } else {
    error = new Error('Must provide either tweet-id or tweet-url.')
  }

  if (error) {
    setError(error)
    return null
  }

  return {
    tweetId,
    tweetOptions: {
      ...tweetOptions,
      // Always pass the resolved theme ('dark' | 'light') to the Twitter widget, never 'system'
      theme: resolvedTheme.value,
    },
  }
}

function loadTwitterScript(): Promise<void> {
  if (window.twttr || window.___$twitterScriptLoaded___) {
    return Promise.resolve()
  }

  if (!window.___$twitterScriptLoading___) {
    window.___$twitterScriptLoading___ = true

    const script = document.createElement('script')
    script.src = TWITTER_SCRIPT_URL
    script.async = true
    script.addEventListener('load', () => {
      window.___$twitterScriptLoaded___ = true
      window.___$twitterScriptLoading___ = false
    }, false)
    script.addEventListener('error', () => {
      // Reset so a later render can retry; the poll below reports the failure
      window.___$twitterScriptLoading___ = false
    }, false)
    document.body.appendChild(script)
  }

  // Poll until the script — possibly requested by another component instance — is ready
  return new Promise((resolve, reject) => {
    const startedAt = Date.now()
    const waitInterval = setInterval(() => {
      if (window.twttr || window.___$twitterScriptLoaded___) {
        clearInterval(waitInterval)
        resolve()
      } else if (!window.___$twitterScriptLoading___ || Date.now() - startedAt >= SCRIPT_LOAD_TIMEOUT_MS) {
        clearInterval(waitInterval)
        reject(new Error('Failed to load the Twitter widgets script.'))
      }
    }, SCRIPT_POLL_INTERVAL_MS)
    activeTimers.push(waitInterval)
  })
}
</script>
