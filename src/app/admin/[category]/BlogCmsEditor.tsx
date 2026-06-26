"use client";

import { useState, useTransition, useRef } from "react";
import {
  createProfileItem,
  updateProfileItem,
  deleteProfileItem,
  type ItemData,
} from "../actions";
import type { ProfileItem } from "@/lib/notion/fetchProfileCms";
import type { CategoryConfig } from "../categoryConfig";

interface Props {
  category: string;
  config: CategoryConfig;
  logKey: string;
  initialItems: ProfileItem[];
}

const EMPTY: ItemData = {
  title: "",
  content: "",
  description: "",
  start_date: "",
  end_date: "",
};

function toFormData(item: ProfileItem): ItemData {
  return {
    title: item.title,
    content: item.content.join("\n"),
    description: item.description.join("\n"),
    start_date: item.start_date ? item.start_date.replace(/\./g, "-") : "",
    end_date: item.end_date ? item.end_date.replace(/\./g, "-") : "",
  };
}

// ── 이미지 업로드 컴포넌트 ──────────────────────────────────────

interface ImageUploadProps {
  currentImgUrl: string;
  logKey: string;
  onUploaded: (fileId: string) => void;
  onClear: () => void;
}

function ImageUpload({ currentImgUrl, logKey, onUploaded, onClear }: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(currentImgUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError("");
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch(`/api/admin/upload?key=${logKey}`, {
      method: "POST",
      body: fd,
    });
    setUploading(false);

    if (!res.ok) {
      setError("업로드 실패");
      setPreview(currentImgUrl);
      return;
    }
    const { fileId } = await res.json();
    onUploaded(fileId);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    setPreview("");
    onClear();
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
        표지 이미지
      </span>
      {preview ? (
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="cover"
            className="w-16 h-20 object-cover border border-stone-200"
          />
          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="px-3 py-1 text-xs border border-stone-300 text-stone-600 hover:border-stone-500 disabled:opacity-40"
            >
              {uploading ? "업로드 중..." : "변경"}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1 text-xs border border-stone-200 text-stone-400 hover:text-red-500 hover:border-red-300"
            >
              삭제
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="relative w-full py-4 text-xs text-stone-400 hover:text-stone-600 disabled:opacity-40"
        >
          <span className="absolute inset-0 filter-rough border border-dashed border-stone-300 pointer-events-none" />
          <span className="relative">{uploading ? "업로드 중..." : "+ 이미지 추가"}</span>
        </button>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}

// ── 텍스트 필드 폼 ────────────────────────────────────────────

function ItemForm({
  config,
  data,
  onChange,
}: {
  config: CategoryConfig;
  data: ItemData;
  onChange: (d: ItemData) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {config.fields.map((f) => (
        <label key={f.key} className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
            {f.label}
          </span>
          {f.multiline ? (
            <textarea
              value={(data as any)[f.key]}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                onChange({ ...data, [f.key]: e.target.value })
              }
              placeholder={f.placeholder}
              rows={3}
              className="resize-y border border-stone-200 px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-stone-400 font-orbit"
            />
          ) : (
            <input
              type={f.key.includes("date") ? "date" : "text"}
              value={(data as any)[f.key]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange({ ...data, [f.key]: e.target.value })
              }
              placeholder={f.placeholder}
              className="border border-stone-200 px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-stone-400 font-orbit"
            />
          )}
        </label>
      ))}
    </div>
  );
}

// ── 새 항목 추가 패널 ─────────────────────────────────────────

function NewItemPanel({
  category,
  config,
  logKey,
  onCreated,
}: {
  category: string;
  config: CategoryConfig;
  logKey: string;
  onCreated: (item: ProfileItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<ItemData>(EMPTY);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [, startTransition] = useTransition();

  const handleCreate = () => {
    if (!data.title.trim()) return;
    setStatus("loading");
    startTransition(async () => {
      const result = await createProfileItem(category, logKey, data);
      if (result.ok && result.id) {
        onCreated({
          id: result.id,
          img: "",
          ...data,
          content: data.content.split("\n").filter(Boolean),
          description: data.description.split("\n").filter(Boolean),
        });
        setData(EMPTY);
        setOpen(false);
        setStatus("idle");
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 2500);
      }
    });
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="relative w-full py-3 text-sm font-semibold text-stone-500 hover:text-stone-800 transition-colors"
      >
        <span className="absolute inset-0 filter-rough border border-dashed border-stone-300 pointer-events-none" />
        <span className="relative">+ 새 항목 추가</span>
      </button>
    );
  }

  return (
    <div className="relative p-4 bg-stone-50">
      <span className="absolute inset-0 filter-rough border border-stone-300 pointer-events-none" />
      <div className="relative flex flex-col gap-4">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">새 항목</p>
        <ItemForm config={config} data={data} onChange={setData} />
        {category === "book" && (
          <ImageUpload
            currentImgUrl=""
            logKey={logKey}
            onUploaded={(fileId) => setData((d) => ({ ...d, imgFileId: fileId, clearImg: false }))}
            onClear={() => setData((d) => ({ ...d, imgFileId: undefined, clearImg: true }))}
          />
        )}
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => { setOpen(false); setData(EMPTY); setStatus("idle"); }}
            className="px-4 py-2 text-sm text-stone-500 hover:text-stone-700"
          >
            취소
          </button>
          <button
            onClick={handleCreate}
            disabled={status === "loading" || !data.title.trim()}
            className="relative px-5 py-2 text-sm font-semibold text-white bg-stone-800 disabled:opacity-50"
          >
            <span className="absolute inset-0 filter-rough border border-stone-800 pointer-events-none" />
            <span className="relative">
              {status === "loading" ? "저장 중..." : status === "error" ? "실패" : "저장"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 개별 아이템 카드 ──────────────────────────────────────────

function ItemCard({
  item,
  category,
  config,
  logKey,
  onUpdated,
  onDeleted,
}: {
  item: ProfileItem;
  category: string;
  config: CategoryConfig;
  logKey: string;
  onUpdated: (item: ProfileItem) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [data, setData] = useState<ItemData>(toFormData(item));
  const [imgState, setImgState] = useState<{ fileId?: string; clear?: boolean }>({});
  const [status, setStatus] = useState<"idle" | "saving" | "deleting" | "error">("idle");
  const [, startTransition] = useTransition();

  const handleSave = () => {
    setStatus("saving");
    const saveData: ItemData = {
      ...data,
      imgFileId: imgState.fileId,
      clearImg: imgState.clear,
    };
    startTransition(async () => {
      const result = await updateProfileItem(item.id, logKey, saveData);
      if (result.ok) {
        onUpdated({
          ...item,
          ...data,
          img: imgState.clear ? "" : imgState.fileId ? item.img : item.img,
          content: data.content.split("\n").filter(Boolean),
          description: data.description.split("\n").filter(Boolean),
        });
        setEditing(false);
        setImgState({});
        setStatus("idle");
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 2500);
      }
    });
  };

  const handleCancel = () => {
    setEditing(false);
    setData(toFormData(item));
    setImgState({});
    setStatus("idle");
  };

  const handleDelete = () => {
    if (!confirm(`"${item.title}" 항목을 삭제할까요?`)) return;
    setStatus("deleting");
    startTransition(async () => {
      const result = await deleteProfileItem(item.id, logKey);
      if (result.ok) {
        onDeleted(item.id);
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
        {editing ? (
          <>
            <ItemForm config={config} data={data} onChange={setData} />
            {category === "book" && (
              <ImageUpload
                currentImgUrl={item.img}
                logKey={logKey}
                onUploaded={(fileId) => setImgState({ fileId, clear: false })}
                onClear={() => setImgState({ fileId: undefined, clear: true })}
              />
            )}
            <div className="flex gap-2 justify-end">
              <button onClick={handleCancel} className="px-3 py-1.5 text-xs text-stone-400 hover:text-stone-600">
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={status === "saving"}
                className="relative px-4 py-1.5 text-xs font-semibold text-white bg-stone-800 disabled:opacity-50"
              >
                <span className="absolute inset-0 filter-rough border border-stone-800 pointer-events-none" />
                <span className="relative">
                  {status === "saving" ? "저장 중..." : status === "error" ? "실패" : "저장"}
                </span>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3 min-w-0">
                {category === "book" && item.img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-10 h-14 object-cover border border-stone-200 shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-stone-800 text-sm leading-snug">{item.title}</p>
                  {item.description.length > 0 && (
                    <p className="text-xs text-stone-500 mt-0.5">{item.description.join(" · ")}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => setEditing(true)}
                  className="px-3 py-1 text-xs text-stone-400 hover:text-stone-700 border border-stone-200 hover:border-stone-400 transition-colors"
                >
                  수정
                </button>
                <button
                  onClick={handleDelete}
                  disabled={status === "deleting"}
                  className="px-3 py-1 text-xs text-stone-400 hover:text-red-500 border border-stone-200 hover:border-red-300 transition-colors disabled:opacity-40"
                >
                  {status === "deleting" ? "..." : "삭제"}
                </button>
              </div>
            </div>
            {item.content.length > 0 && (
              <p className="text-xs text-stone-400 line-clamp-2">{item.content.join(" ")}</p>
            )}
            {(item.start_date || item.end_date) && (
              <p className="text-xs text-stone-400 font-orbit">
                {item.start_date}{item.end_date ? ` → ${item.end_date}` : ""}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────

export default function BlogCmsEditor({ category, config, logKey, initialItems }: Props) {
  const [items, setItems] = useState<ProfileItem[]>(initialItems);

  const handleCreated = (item: ProfileItem) => setItems((prev) => [...prev, item]);
  const handleUpdated = (updated: ProfileItem) =>
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  const handleDeleted = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  return (
    <div className="max-w-lg mx-auto px-4 py-10 pb-28 flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-orbit text-2xl font-bold text-stone-800 mb-1">
          {config.label}
        </h1>
        <p className="text-xs text-stone-400">{items.length}개 항목</p>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            category={category}
            config={config}
            logKey={logKey}
            onUpdated={handleUpdated}
            onDeleted={handleDeleted}
          />
        ))}
        {items.length === 0 && (
          <p className="text-center text-sm text-stone-400 py-6">항목이 없습니다.</p>
        )}
      </div>

      <NewItemPanel
        category={category}
        config={config}
        logKey={logKey}
        onCreated={handleCreated}
      />
    </div>
  );
}
