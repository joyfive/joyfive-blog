"use client";

import { useState, useTransition } from "react";
import { updateProfileItem, type ItemData } from "../actions";
import type { ProfileItem } from "@/lib/notion/fetchProfileCms";
import type { CategoryConfig } from "../categoryConfig";

interface Props {
  category: string;
  config: CategoryConfig;
  logKey: string;
  initialItems: ProfileItem[];
}

function toFormData(item: ProfileItem): ItemData {
  return {
    title: item.title,
    content: item.content.join("\n"),
    description: item.description.join("\n"),
    start_date: item.start_date ? item.start_date.replace(/\./g, "-") : "",
    end_date: item.end_date ? item.end_date.replace(/\./g, "-") : "",
  };
}

// ── 이미지 URL 입력 ───────────────────────────────────────────

function ImageInput({
  currentImgUrl,
  onChange,
  onClear,
}: {
  currentImgUrl: string;
  onChange: (url: string) => void;
  onClear: () => void;
}) {
  const [inputUrl, setInputUrl] = useState("");
  const [preview, setPreview] = useState(currentImgUrl);

  const handleAdd = () => {
    const url = inputUrl.trim();
    if (!url) return;
    setPreview(url);
    onChange(url);
    setInputUrl("");
  };

  const handleClear = () => {
    setPreview("");
    setInputUrl("");
    onClear();
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">이미지</span>

      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="cover" className="w-16 h-20 object-cover border border-stone-200" />
      )}

      <div className="flex gap-2">
        <input
          type="url"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
          placeholder="이미지 URL 붙여넣기"
          className="flex-1 border border-stone-200 px-3 py-1.5 text-xs text-stone-700 focus:outline-none focus:border-stone-400 font-orbit"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!inputUrl.trim()}
          className="px-3 py-1.5 text-xs border border-stone-300 text-stone-600 hover:border-stone-600 disabled:opacity-40 shrink-0"
        >
          추가
        </button>
        {preview && (
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1.5 text-xs border border-stone-200 text-stone-400 hover:text-red-500 hover:border-red-300 shrink-0"
          >
            삭제
          </button>
        )}
      </div>
    </div>
  );
}

// ── 아이템 카드 (항상 수정 모드) ──────────────────────────────

function ItemCard({
  item,
  category,
  config,
  logKey,
}: {
  item: ProfileItem;
  category: string;
  config: CategoryConfig;
  logKey: string;
}) {
  const [data, setData] = useState<ItemData>(toFormData(item));
  const [imgState, setImgState] = useState<{ url?: string; clear?: boolean }>({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState("");
  const [, startTransition] = useTransition();

  const handleSave = () => {
    setStatus("saving");
    setSaveError("");
    startTransition(async () => {
      const result = await updateProfileItem(item.id, logKey, {
        ...data,
        imgUrl: imgState.url,
        clearImg: imgState.clear,
      });
      if (result.ok) {
        setImgState({});
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 1500);
      } else {
        setSaveError(result.error ?? "저장 실패");
        setStatus("error");
        setTimeout(() => setStatus("idle"), 4000);
      }
    });
  };

  return (
    <div className="relative p-4 bg-white">
      <span className="absolute inset-0 filter-rough border border-stone-200 pointer-events-none" />
      <div className="relative flex flex-col gap-3">
        {config.fields.map((f) => {
          const isDate = f.key === "start_date" || f.key === "end_date";
          return (
            <label key={f.key} className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
                {f.label}
              </span>
              {isDate ? (
                <input
                  type="date"
                  value={(data as any)[f.key]}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setData((d) => ({ ...d, [f.key]: e.target.value }))
                  }
                  className="border border-stone-200 px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-stone-400 font-orbit"
                />
              ) : (
                <textarea
                  value={(data as any)[f.key]}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setData((d) => ({ ...d, [f.key]: e.target.value }))
                  }
                  placeholder={f.placeholder}
                  rows={f.multiline ? 4 : 1}
                  className="resize-y border border-stone-200 px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-stone-400 font-orbit"
                />
              )}
            </label>
          );
        })}

        {config.hasImage && (
          <ImageInput
            currentImgUrl={item.img}
            onChange={(url) => setImgState({ url, clear: false })}
            onClear={() => setImgState({ url: undefined, clear: true })}
          />
        )}

        {saveError && (
          <p className="text-xs text-red-500 break-all">{saveError}</p>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={status === "saving"}
            className="relative px-5 py-2 text-sm font-semibold text-white bg-stone-800 disabled:opacity-50"
          >
            <span className="absolute inset-0 filter-rough border border-stone-800 pointer-events-none" />
            <span className="relative">
              {status === "saving" ? "저장 중..." : status === "saved" ? "저장됨 ✓" : status === "error" ? "실패" : "저장"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────

export default function BlogCmsEditor({ category, config, logKey, initialItems }: Props) {
  return (
    <div className="max-w-lg mx-auto px-4 py-10 pb-28 flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-orbit text-2xl font-bold text-stone-800 mb-1">{config.label}</h1>
        <p className="text-xs text-stone-400">{initialItems.length}개 항목</p>
      </div>

      <div className="flex flex-col gap-4">
        {initialItems.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            category={category}
            config={config}
            logKey={logKey}
          />
        ))}
        {initialItems.length === 0 && (
          <p className="text-center text-sm text-stone-400 py-6">항목이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
