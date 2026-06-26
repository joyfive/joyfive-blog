"use client";

import { useState, useTransition } from "react";
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
              onChange={(e) => onChange({ ...data, [f.key]: e.target.value })}
              placeholder={f.placeholder}
              rows={3}
              className="resize-y border border-stone-200 px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-stone-400 font-orbit"
            />
          ) : (
            <input
              type={f.key.includes("date") ? "date" : "text"}
              value={(data as any)[f.key]}
              onChange={(e) => onChange({ ...data, [f.key]: e.target.value })}
              placeholder={f.placeholder}
              className="border border-stone-200 px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-stone-400 font-orbit"
            />
          )}
        </label>
      ))}
    </div>
  );
}

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
        const newItem: ProfileItem = {
          id: result.id,
          img: "",
          ...data,
          content: data.content.split("\n").filter(Boolean),
          description: data.description.split("\n").filter(Boolean),
        };
        onCreated(newItem);
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

function ItemCard({
  item,
  config,
  logKey,
  onUpdated,
  onDeleted,
}: {
  item: ProfileItem;
  config: CategoryConfig;
  logKey: string;
  onUpdated: (item: ProfileItem) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [data, setData] = useState<ItemData>(toFormData(item));
  const [status, setStatus] = useState<"idle" | "saving" | "deleting" | "error">("idle");
  const [, startTransition] = useTransition();

  const handleSave = () => {
    setStatus("saving");
    startTransition(async () => {
      const result = await updateProfileItem(item.id, logKey, data);
      if (result.ok) {
        onUpdated({
          ...item,
          ...data,
          content: data.content.split("\n").filter(Boolean),
          description: data.description.split("\n").filter(Boolean),
        });
        setEditing(false);
        setStatus("idle");
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 2500);
      }
    });
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
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setEditing(false); setData(toFormData(item)); setStatus("idle"); }}
                className="px-3 py-1.5 text-xs text-stone-400 hover:text-stone-600"
              >
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
              <p className="font-semibold text-stone-800 text-sm leading-snug">{item.title}</p>
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
            {item.description.length > 0 && (
              <p className="text-xs text-stone-500">{item.description.join(" · ")}</p>
            )}
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
