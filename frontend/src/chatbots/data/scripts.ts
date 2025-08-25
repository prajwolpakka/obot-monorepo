export const htmlScript = (chatbotId: string) => `<!-- Add this script tag to your website -->
<script src="https://your-domain.com/api/chatbot/integrate"></script>
<div id="chat-interface"></div>
<script>
  // Initialize chatbot once script loads
  if (typeof Chatbot !== 'undefined') {
    Chatbot.init({
      chatbotId: "${chatbotId}"
    });
  } else {
    console.error('Chatbot script failed to load. Check if your domain is in the allowed domains list.');
  }
</script>`;

export const vueIntegration = (chatbotId: string) => `<!-- Vue.js Integration -->
<template>
  <div>
    <div id="chat-interface"></div>
    <!-- Your app content -->
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    // Load chatbot script
    const script = document.createElement('script');
    script.src = 'https://your-domain.com/api/chatbot/integrate';
    script.onload = () => {
      if (window.Chatbot) {
        window.Chatbot.init({
          chatbotId: "${chatbotId}"
        });
      } else {
        console.error('Chatbot object not available after script load');
      }
    };
    script.onerror = () => {
      console.error('Failed to load chatbot script. Check if your domain is in the allowed domains list.');
    };
    document.head.appendChild(script);
  },
  beforeUnmount() {
    // Cleanup if needed
    const script = document.querySelector('script[src*="chatbot.js"]');
    if (script) {
      document.head.removeChild(script);
    }
  }
}
</script>`;

export const reactIntegration = (chatbotId: string) => `// React Integration
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Load chatbot script
    const script = document.createElement('script');
    script.src = 'https://your-domain.com/api/chatbot/integrate';
    script.onload = () => {
      if (window.Chatbot) {
        window.Chatbot.init({
          chatbotId: "${chatbotId}"
        });
      } else {
        console.error('Chatbot object not available after script load');
      }
    };
    script.onerror = () => {
      console.error('Failed to load chatbot script. Check if your domain is in the allowed domains list.');
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
      const scriptEl = document.querySelector('script[src*="chatbot.js"]');
      if (scriptEl) {
        document.head.removeChild(scriptEl);
      }
    };
  }, []);

  return (
    <div>
      <div id="chat-interface"></div>
      {/* Your app content */}
    </div>
  );
}`;

export const nextjsIntegration = (chatbotId: string) => `// Next.js Integration (pages/_app.js or app/layout.js)
import { useEffect } from 'react';
import Script from 'next/script';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Script
        src="https://your-domain.com/api/chatbot/integrate"
        onLoad={() => {
          if (window.Chatbot) {
            window.Chatbot.init({
              chatbotId: "${chatbotId}"
            });
          } else {
            console.error('Chatbot object not available after script load');
          }
        }}
        onError={() => {
          console.error('Failed to load chatbot script. Check if your domain is in the allowed domains list.');
        }}
      />
      <div id="chat-interface" />
      <Component {...pageProps} />
    </>
  );
}`;
