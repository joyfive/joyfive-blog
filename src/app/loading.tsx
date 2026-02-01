export default function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex h-full w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="animate-pulse text-center text-gray-500">
          Loading...
        </div>
      </main>
    </div>
  );
}