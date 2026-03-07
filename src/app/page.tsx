import RoughCard from "@/components/layout/RoughCard";

export default function Home() {
  return (
    <main className="max-w-2xl w-full mx-auto py-16 px-6">
      {/* Hero */}
      <RoughCard tapes={["lt"]}>
        <h1 className="mb-6 text-5xl font-bold text-stone-800 leading-snug">
          오기쁨.
        </h1>
        <p className="text-stone-700 text-lg">Product Manager</p>
        <p className="text-stone-500 text-base mt-1">
          때로는 개발도 하고, 가끔은 글도 씁니다.
        </p>
      </RoughCard>

      {/* Info cards */}
      <section className="flex flex-col md:flex-row mt-16 gap-10">
        <RoughCard tapes={["t"]} className="flex flex-col gap-3 w-full">
          <h2 className="mb-2">Career</h2>
          <div className="flex justify-between items-baseline">
            <h3>샌드박스 네트워크</h3>
            <p className="text-sm text-stone-400 shrink-0 ml-4">2025.01 ~ 재직중</p>
          </div>
          <div className="flex justify-between items-baseline">
            <h3>스펙터</h3>
            <p className="text-sm text-stone-400 shrink-0 ml-4">2023.01 ~ 2025.01</p>
          </div>
          <div className="flex justify-between items-baseline">
            <h3>뮤자인</h3>
            <p className="text-sm text-stone-400 shrink-0 ml-4">2019.03 ~ 2022.08</p>
          </div>
        </RoughCard>

        <RoughCard tapes={["rt"]} className="flex flex-col gap-4 w-full">
          <h2 className="mb-2">Side-Project</h2>
          <div>
            <h3>개인 블로그</h3>
            <p className="text-sm text-stone-500 mt-1">노션을 CMS로 활용한 개인 블로그 개발</p>
          </div>
          <div>
            <h3>오늘의 SLIP.</h3>
            <p className="text-sm text-stone-500 mt-1">Slack-Obsidian을 활용한 개인 기록용 포맷팅 App 개발</p>
          </div>
        </RoughCard>
      </section>
    </main>
  );
}
