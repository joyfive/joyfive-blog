"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class NotionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("NotionRenderer error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="py-12 text-center text-stone-400 text-sm">
          콘텐츠를 불러오는 중 문제가 발생했습니다.
          <br />
          잠시 후 다시 시도해 주세요.
        </div>
      );
    }
    return this.props.children;
  }
}
