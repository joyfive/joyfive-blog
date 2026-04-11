"use client";

import { useEffect, useRef } from "react";

export default function MermaidChart({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !code) return;

    import("mermaid").then(async ({ default: mermaid }) => {
      try {
        mermaid.initialize({ startOnLoad: false, theme: "neutral" });
        const id = `mermaid-${Math.random().toString(36).slice(2)}`;
        const { svg } = await mermaid.render(id, code);
        if (ref.current) ref.current.innerHTML = svg;
      } catch (err) {
        console.error("Mermaid render error:", err);
        if (ref.current) {
          ref.current.innerHTML = `<pre style="overflow:auto;padding:1rem">${code}</pre>`;
        }
      }
    });
  }, [code]);

  return <div ref={ref} className="my-6 flex justify-center overflow-x-auto" />;
}
