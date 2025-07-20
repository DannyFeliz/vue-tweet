<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import VueTweet, { type TweetProps } from './vue-tweet.vue'

// Define test configuration interface
interface TestConfig {
  name: string
  props: Partial<TweetProps>
  hasCustomSlots?: boolean
  hasCallbacks?: boolean
}

interface VariationConfig {
  title: string
  description: string
  tests: TestConfig[]
}

const currentHash = ref(window.location.hash.slice(1) || 'themes')

function onTweetLoadSuccess(embedNode: HTMLDivElement) {
  console.log('onTweetLoadSuccess callback', embedNode)
}

const tweetError = ref<Error | null>(null)
function onTweetLoadError(error: Error) {
  tweetError.value = error
  console.log('onTweetLoadError callback', error)
}

function updateHash() {
  currentHash.value = window.location.hash.slice(1) || 'themes'
}

onMounted(() => {
  window.addEventListener('hashchange', updateHash)
})

onUnmounted(() => {
  window.removeEventListener('hashchange', updateHash)
})

const tweetUrl = 'https://x.com/vuejs/status/1753678159067881809'

const variations = computed((): Record<string, VariationConfig> => {
  return {
    themes: {
      title: 'Theme Variations',
      description: 'Test light and dark themes',
      tests: [
        { name: 'Light Theme', props: { theme: 'light' } },
        { name: 'Dark Theme', props: { theme: 'dark' } },
      ]
    },
    alignment: {
      title: 'Alignment Variations',
      description: 'Test different alignment options',
      tests: [
        { name: 'Left Aligned', props: { align: 'left' } },
        { name: 'Center Aligned', props: { align: 'center' } },
        { name: 'Right Aligned', props: { align: 'right' } },
        { name: 'No Alignment (undefined)', props: {} },
      ]
    },
    width: {
      title: 'Width Variations',
      description: 'Test different width settings',
      tests: [
        { name: 'Auto Width', props: { width: 'auto' } },
        { name: 'Minimum Width (250px)', props: { width: 250 } },
        { name: 'Medium Width (400px)', props: { width: 400 } },
        { name: 'Maximum Width (550px)', props: { width: 550 } },
      ]
    },
    cards: {
      title: 'Cards Variations',
      description: 'Test card visibility options',
      tests: [
        { name: 'Cards Visible', props: { cards: 'visible', tweetUrl: "https://x.com/TheBabylonBee/status/1945287318044025338" } },
        { name: 'Cards Hidden', props: { cards: 'hidden', tweetUrl: "https://x.com/TheBabylonBee/status/1945287318044025338" } },
      ]
    },
    conversation: {
      title: 'Conversation Variations',
      description: 'Test conversation thread options',
      tests: [
        { name: 'Show All Conversations', props: { conversation: 'all' } },
        { name: 'Hide Conversations', props: { conversation: 'none' } },
      ]
    },
    languages: {
      title: 'Language Variations',
      description: 'Test different language settings',
      tests: [
        { name: 'English', props: { lang: 'en' } },
        { name: 'Spanish', props: { lang: 'es' } },
      ]
    },
    tweetId: {
      title: 'Tweet ID Variations',
      description: 'Test using tweetId prop instead of tweetUrl',
      tests: [
        { name: 'Vue.js Tweet by ID', props: { tweetId: '1753678159067881809' } },
        { name: 'BabylonBee Tweet by ID', props: { tweetId: '1945287318044025338' } },
        { name: 'Tweet ID with Theme', props: { tweetId: '1753678159067881809', theme: 'dark' } },
        { name: 'Tweet ID with Alignment', props: { tweetId: '1945287318044025338', align: 'center' } },
      ]
    },
    slots: {
      title: 'Slot Variations',
      description: 'Test custom loading and error slots',
      tests: [
        { name: 'Custom Loading Slot', props: {}, hasCustomSlots: true },
        { name: 'Custom Error Slot (use invalid URL)', props: { tweetUrl: 'https://invalid-url' }, hasCustomSlots: true },
      ]
    },
    callbacks: {
      title: 'Callback Variations',
      description: 'Test success and error callbacks',
      tests: [
        { name: 'Success Callback', props: {}, hasCallbacks: true },
        { name: 'Error Callback (invalid URL)', props: { tweetUrl: 'https://invalid-url' }, hasCallbacks: true },
      ]
    },
    combined: {
      title: 'Combined Variations',
      description: 'Test combinations of multiple props',
      tests: [
        { 
          name: 'Dark Theme + Right Aligned + 400px', 
          props: { theme: 'dark', align: 'right', width: 400 } 
        },
        { 
          name: 'Light Theme + Center + Hidden Cards', 
          props: { theme: 'light', align: 'center', cards: 'hidden' } 
        },
        { 
          name: 'Dark + No Conversation + Spanish', 
          props: { theme: 'dark', conversation: 'none', lang: 'es' } 
        },
        { 
          name: 'Tweet ID + All Options Combined', 
          props: { 
            tweetId: '1753678159067881809',
            theme: 'dark', 
            align: 'center', 
            width: 450, 
            cards: 'visible', 
            conversation: 'all', 
            lang: 'en'
          } 
        },
      ]
    }
  }
})

const currentVariation = computed(() => {
  return variations.value[currentHash.value]
})

const navigationItems = computed(() => {
  return Object.keys(variations.value)
})
</script>

<template>
  <div class="playground">
    <header class="header">
      <h1>Vue Tweet Component Playground</h1>
      <p>Select a variation to test different props and features</p>
    </header>

    <nav class="navigation">
      <a 
        v-for="item in navigationItems" 
        :key="item"
        :href="`#${item}`"
        :class="{ active: currentHash === item }"
      >
        {{ item.charAt(0).toUpperCase() + item.slice(1) }}
      </a>
    </nav>

    <main class="content" v-if="currentVariation">
      <div class="variation-header">
        <h2>{{ currentVariation.title }}</h2>
        <p>{{ currentVariation.description }}</p>
      </div>

      <div class="tests-grid">
        <div 
          v-for="test in currentVariation.tests" 
          :key="test.name"
          class="test-item"
        >
          <h3>{{ test.name }}</h3>
          <div class="test-props">
            <strong>Props:</strong> {{ Object.keys(test.props).length ? JSON.stringify(test.props) : 'Default props' }}
          </div>
          
          <div class="tweet-container">
            <vue-tweet
              :tweet-id="test.props.tweetId"
              :tweet-url="test.props.tweetId ? undefined : (test.props.tweetUrl || tweetUrl)"
              :theme="test.props.theme"
              :align="test.props.align"
              :width="test.props.width"
              :cards="test.props.cards"
              :conversation="test.props.conversation"
              :lang="test.props.lang"
              :dnt="test.props.dnt"
              @tweet-load-error="onTweetLoadError"
              @tweet-load-success="onTweetLoadSuccess"
            >
              <template #loading v-if="test.hasCustomSlots">
                <div class="custom-loading">
                  <span>🔄 Custom Loading Slot...</span>
                </div>
              </template>

              <template #error v-if="test.hasCustomSlots">
                <div class="custom-error">
                  <span>❌ Custom Error Slot: {{ tweetError?.message }}</span>
                </div>
              </template>
            </vue-tweet>
          </div>

          <div v-if="test.hasCallbacks" class="callback-info">
            <strong>Callbacks:</strong> Check console for callback logs
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.playground {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, -apple-system, sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  color: #333;
  margin-bottom: 10px;
}

.header p {
  color: #666;
  font-size: 1.1em;
}

.navigation {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-bottom: 30px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.navigation a {
  padding: 8px 16px;
  background: white;
  text-decoration: none;
  color: #333;
  border-radius: 4px;
  border: 1px solid #ddd;
  transition: all 0.2s;
}

.navigation a:hover {
  background: #e3f2fd;
  border-color: #1976d2;
}

.navigation a.active {
  background: #1976d2;
  color: white;
  border-color: #1976d2;
}

.content {
  margin-top: 30px;
}

.variation-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.variation-header h2 {
  color: #333;
  margin-bottom: 10px;
}

.variation-header p {
  color: #666;
  font-size: 1.1em;
}

.tests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
}

.test-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.test-item h3 {
  color: #333;
  margin-bottom: 10px;
  font-size: 1.2em;
}

.test-props {
  margin-bottom: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 0.9em;
  color: #666;
}

.tweet-container {
  margin: 20px 0;
  min-height: 200px;
}

.custom-loading {
  padding: 20px;
  text-align: center;
  background: #e3f2fd;
  border-radius: 4px;
  color: #1976d2;
}

.custom-error {
  padding: 20px;
  text-align: center;
  background: #ffebee;
  border-radius: 4px;
  color: #c62828;
}

.callback-info {
  margin-top: 15px;
  padding: 10px;
  background: #fff3e0;
  border-radius: 4px;
  font-size: 0.9em;
  color: #f57c00;
}

@media (max-width: 768px) {
  .tests-grid {
    grid-template-columns: 1fr;
  }
  
  .navigation {
    flex-direction: column;
    align-items: center;
  }
  
  .playground {
    padding: 10px;
  }
}
</style>
