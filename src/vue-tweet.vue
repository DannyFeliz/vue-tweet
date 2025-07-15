<template>
  <slot v-if="hasError" name="error" />
  <slot v-else-if="isLoading" name="loading" />
  <div ref="tweetContainerRef" v-bind="$attrs" />
</template>

<script lang="ts" setup>
import "../env.d.ts"
import {
  ref,
  onMounted,
  nextTick,
  watch,
  toRef,
  type PropType,
} from 'vue'

export type TweetLang = 'ar' | 'bn' | 'cs' | 'da' | 'de' | 'el' | 'en' | 'es' | 'fa' | 'fi' | 'fil' | 'fr' | 'he' | 'hi' | 'hu' | 'id' | 'it' | 'ja' | 'ko' | 'msa' | 'nl' | 'no' | 'pl' | 'pt' | 'ro' | 'ru' | 'sv' | 'th' | 'tr' | 'uk' | 'ur' | 'vi' | 'zh-cn' | 'zh-tw'

export interface TweetProps {
  tweetId?: string
  tweetUrl?: string
  conversation?: 'all' | 'none'
  cards?: 'visible' | 'hidden'
  width?: 'auto' | number
  align?: 'left' | 'right' | 'center'
  theme?: 'light' | 'dark'
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
    type: String as PropType<'light' | 'dark'>,
    default: 'light',
    validator: (value: string) => ['light', 'dark'].includes(value),
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

onMounted(() => {
  renderTweet()
})

watch(toRef(props), renderTweet, {
  deep: true,
})

function renderTweet(): void {
  if (!(window.twttr && window.twttr.ready)) {
    addScript('https://platform.twitter.com/widgets.js', renderTweet)
    return
  }

  window.twttr.ready().then(({ widgets }) => {
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
  let { tweetId, tweetUrl, ...tweetOptions } = props

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

  if (window.___$twitterScriptLoaded___) {
    cb();
    return;
  }

  if (window.___$twitterScriptLoading___ === undefined) {
    window.___$twitterScriptLoading___ = false
  }

  if (window.___$twitterScriptLoading___) {
    const waitInterval = setInterval(() => {
      if (window.___$twitterScriptLoaded___) {
        clearInterval(waitInterval)
        cb()
      }
    }, 100)
    return
  }

  window.___$twitterScriptLoading___ = true
  const s = document.createElement('script')
  s.setAttribute('src', src)
  s.async = true
  s.addEventListener('load', () => {
    window.___$twitterScriptLoaded___ = true
    window.___$twitterScriptLoading___ = false
    cb()
  }, false)
  document.body.appendChild(s)
}
</script>
