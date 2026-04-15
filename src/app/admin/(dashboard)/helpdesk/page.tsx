"use client";

import { useEffect, useState } from "react";

export default function HelpdeskPage() {
  const [iframeUrl, setIframeUrl] = useState("");

  useEffect(() => {
    async function getToken() {
      const embedSecret = process.env.NEXT_PUBLIC_EMBED_JWT_SECRET;
      if (!embedSecret) {
        setIframeUrl("https://support.joinbodygood.com/login");
        return;
      }

      try {
        const res = await fetch(
          `https://support.joinbodygood.com/api/embed/token?email=admin@bodygoodstudio.com&name=Admin`,
          { headers: { Authorization: `Bearer ${embedSecret}` } }
        );
        const { token } = await res.json();
        setIframeUrl(`https://support.joinbodygood.com/embed?token=${token}`);
      } catch {
        setIframeUrl("https://support.joinbodygood.com/login");
      }
    }

    getToken();
  }, []);

  if (!iframeUrl) {
    return <div className="flex h-full items-center justify-center text-sm text-gray-400">Loading helpdesk...</div>;
  }

  return (
    <iframe
      src={iframeUrl}
      className="h-full w-full border-0"
      allow="microphone"
      title="Body Good Helpdesk"
    />
  );
}
