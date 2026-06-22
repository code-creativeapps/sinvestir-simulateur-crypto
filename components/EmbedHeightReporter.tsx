"use client";

import { useEffect } from "react";

/**
 * Posts the document height to the parent window so a host page can auto-size
 * the iframe: window.addEventListener("message", e => { if (e.data?.type ===
 * "sinvestir:height") iframe.style.height = e.data.height + "px" }).
 */
export function EmbedHeightReporter() {
  useEffect(() => {
    const post = () => {
      const height = document.documentElement.scrollHeight;
      window.parent?.postMessage({ type: "sinvestir:height", height }, "*");
    };
    post();
    const ro = new ResizeObserver(post);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, []);
  return null;
}
