"use client";

import { useState, useTransition, useRef } from "react";
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

// ── 이미지 업로드 ─────────────────────────────────────────────

function ImageUpload({
  currentImgUrl,
  logKey,
  onUploaded,
  onClear,
}: {
  currentImgUrl: string;
  logKey: string;
  onUploaded: (fileId: string) => void;
  onClear: () => void;
}) {
  const [preview, setPreview] = useState(currentImgUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError("");
    setPreview(URL.createObjectURL(file));

    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/admin/upload?key=${logKey}`, { method: "POST", body: fd });
    setUploading(false);

    if (!res.ok) {
      setError("업로드 실패");
      setPreview(currentImgUrl);
      return;
    }
    const { fileId } = await res.json();
    onUploaded(fileId);
  };

  const handleClear = () => {
    setPreview("");
    onClear();
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">표지 이미지</span>
      {preview ? (
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="cover" className="w-16 h-20 object-cover border border-stone-200" />
          <div className="flex flex-col gap-2 pt-1">
            <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
              className="px-3 py-1 text-xs border border-stone-300 text-stone-600 hover:border-stone-500 disabled:opacity-40">
              {uploading ? "업로드 중..." : "변경"}
            </button>
            <button type="button" onClick={handleClear}
              className="px-3 py-1 text-xs border border-stone-200 text-stone-400 hover:text-red-500 hover:border-red-300">
              삭제
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="relative w-full py-4 text-xs text-stone-400 hover:text-stone-600 disabled:opacity-40">
          <span className="absolute inset-0 filter-rough border border-dashed border-stone-300 pointer-events-none" />
          <span className="relative">{uploading ? "업로드 중..." : "+ 이미지 추가"}</span>
        </button>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
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
  const [imgState, setImgState] = useState<{ fileId?: string; clear?: boolean }>({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [, startTransition] = useTransition();

  const handleSave = () => {
    setStatus("saving");
    startTransition(async () => {
      const result = await updateProfileItem(item.id, logKey, {
        ...data,
        imgFileId: imgState.fileId,
        clearImg: imgState.clear,
      });
      if (result.ok) {
        setImgState({});
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 1500);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 2500);
      }
    });
  };

  return (
    <div className="relative p-4 bg-white">
      <span className="absolute inset-0 filter-rough border border-stone-200 pointer-events-none" />
      <div className="relative flex flex-col gap-3">
        {config.fields.map((f) => (
          <label key={f.key} className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              {f.label}
            </span>
            <textarea
              value={(data as any)[f.key]}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setData((d) => ({ ...d, [f.key]: e.target.value }))
              }
              placeholder={f.placeholder}
              rows={f.multiline ? 4 : 1}
              className="resize-y border border-stone-200 px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-stone-400 font-orbit"
            />
          </label>
        ))}

        {category === "book" && (
          <ImageUpload
            currentImgUrl={item.img}
            logKey={logKey}
            onUploaded={(fileId) => setImgState({ fileId, clear: false })}
            onClear={() => setImgState({ fileId: undefined, clear: true })}
          />
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
