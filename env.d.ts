/// <reference types="vite/client" />

declare global {
  interface Window {
    twttr?: {
      ready(): Promise<{
        widgets: {
          createTweet(
            tweetId: string,
            container: HTMLElement,
            options?: Record<string, unknown>
          ): Promise<HTMLDivElement | undefined>;
        };
      }>;
    };
    ___$twitterScriptLoaded___?: boolean;
    ___$twitterScriptLoading___?: boolean;
  }
}

export {}
