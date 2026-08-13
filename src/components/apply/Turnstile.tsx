"use client";

import { useEffect, useId, useRef } from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  siteKey: string;
  onVerify: (token: string | null) => void;
}

export function TurnstileWidget({ siteKey, onVerify }: TurnstileWidgetProps) {
  const containerId = useId().replace(/:/g, "");
  const widgetIdRef = useRef<string | null>(null);
  const renderedRef = useRef(false);

  useEffect(() => {
    function renderWidget() {
      if (renderedRef.current) return;
      const container = document.getElementById(containerId);
      if (!container || !window.turnstile) return;

      widgetIdRef.current = window.turnstile.render(container, {
        sitekey: siteKey,
        theme: "dark",
        callback: (token) => onVerify(token),
        "expired-callback": () => onVerify(null),
        "error-callback": () => onVerify(null),
      });
      renderedRef.current = true;
    }

    if (window.turnstile) {
      renderWidget();
    } else {
      const interval = setInterval(() => {
        if (window.turnstile) {
          renderWidget();
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId, siteKey]);

  return (
    <div>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" async defer />
      <div id={containerId} />
    </div>
  );
}
