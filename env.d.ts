/// <reference types="vite/client" />

declare module '*.vue' {
  const component: Record<string, unknown>
  export default component
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $attrs: Record<string, unknown>
  }
  
  interface ComponentInternalInstance {
    setupState: Record<string, any>
  }
}

declare global {
  interface Window {
    twttr?: {
      ready(): Promise<{
        widgets: {
          createTweet(
            tweetId: string,
            container: HTMLElement,
            options?: Record<string, any>
          ): Promise<HTMLDivElement | undefined>;
        };
      }>;
    };
    ___$twitterScriptLoaded___?: boolean;
    ___$twitterScriptLoading___?: boolean;
  }
}

export {}