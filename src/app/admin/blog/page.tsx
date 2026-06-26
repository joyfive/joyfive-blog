import { redirect } from "next/navigation";

interface Props {
  searchParams: { key?: string };
}

export default function BlogAdminRoot({ searchParams }: Props) {
  const key = searchParams.key ?? "";
  redirect(`/admin/blog/intro?key=${key}`);
}
