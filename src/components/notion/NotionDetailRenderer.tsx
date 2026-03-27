"use client";

import { NotionRenderer } from "react-notion-x";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import MermaidChart from "./MermaidChart";

const Code = dynamic(() =>
  import("react-notion-x/build/third-party/code").then((m) => m.Code)
);
const Equation = dynamic(() =>
  import("react-notion-x/build/third-party/equation").then((m) => m.Equation)
);

import "react-notion-x/src/styles.css";

function CodeBlock(props: any) {
  const language = props.block?.properties?.language?.[0]?.[0]?.toLowerCase();
  const code = props.block?.properties?.title?.[0]?.[0] ?? "";

  if (language === "mermaid") {
    return <MermaidChart code={code} />;
  }
  return <Code {...props} />;
}

export const NotionDetailRenderer = ({ recordMap }: { recordMap: any }) => {
  return (
    <NotionRenderer
      recordMap={recordMap}
      fullPage={false}
      components={{
        Code: CodeBlock,
        Equation,
        nextImage: Image,
        nextLink: Link,
      }}
      darkMode={false}
    />
  );
};