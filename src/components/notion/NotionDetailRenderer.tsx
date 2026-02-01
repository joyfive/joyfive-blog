"use client"; // 이 한 줄이 핵심입니다!

import { NotionRenderer } from "react-notion-x";
import Link from "next/link";
import Image from "next/image";
import dynamic from 'next/dynamic'
// Code 컴포넌트를 dynamic import로 불러오기 (성능 최적화)
const Code = dynamic(() =>
  import('react-notion-x/build/third-party/code').then((m) => m.Code)
)
// (참고) Collection이나 Equation도 필요하면 동일하게 추가
// const Collection = dynamic(() =>
//   import('react-notion-x/build/third-party/collection').then((m) => m.Collection)
// )
const Equation = dynamic(() =>
  import('react-notion-x/build/third-party/equation').then((m) => m.Equation)
)
// 스타일 임포트는 여기서 해도 되고 layout에서 해도 됩니다.
import "react-notion-x/src/styles.css";

export const NotionDetailRenderer = ({ recordMap }: { recordMap: any }) => {
  return (
    <NotionRenderer
      recordMap={recordMap}
      fullPage={false}
      components={{
        // 여기서 Code 블록을 매핑해줍니다.
        Code,
        Equation,
        nextImage: Image,
        nextLink: Link
      }}
      darkMode={false}

    />
  );
};