import { redirect } from "next/navigation";

interface Props {
  searchParams: { key?: string };
}

export default function AdminRoot({ searchParams }: Props) {
  const key = searchParams.key ?? "";
  redirect(`/admin/jandi?key=${key}`);
}
