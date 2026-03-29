"use client";

import { useEffect } from "react";

type Props = {
  baseUrl: string;
  token: string;
};

export function ChatwootWidget({ baseUrl, token }: Props) {
  useEffect(() => {
    if (!baseUrl || !token) return;
    if ((window as any).chatwootSDK) return; // already loaded

    (window as any).chatwootSettings = {
      hideMessageBubble: false,
      position: "right",
      locale: document.documentElement.lang || "en",
      type: "standard",
    };

    const script = document.createElement("script");
    script.src = `${baseUrl}/packs/js/sdk.js`;
    script.defer = true;
    script.async = true;
    script.onload = () => {
      (window as any).chatwootSDK?.run({ websiteToken: token, baseUrl });
    };
    document.head.appendChild(script);
  }, [baseUrl, token]);

  return null;
}
