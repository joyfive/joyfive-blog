import RoughCard from "@/components/layout/RoughCard";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex items-center justify-center">
      <main className="mx-auto w-auto flex h-auto flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <RoughCard tapes={["lt"]}>
          <h1 className="mb-8 text-5xl font-bold text-stone-900 dark:text-white sm:text-6xl leading-snug">
            오기쁨.
          </h1>
          <p className="text-stone-700 dark:text-stone-300 text-lg">
            Product Manager
          </p>
          <p className="text-stone-700 dark:text-stone-300 text-lg">
            때로는 개발도 하고, 가끔은 글도 씁니다.
          </p>
        </RoughCard>
        <section className="flex mt-12 gap-8 w-full">
          <RoughCard tapes={["t"]} className="p-8 flex flex-col gap-4 w-full h-full">
            <h2>Career</h2>
            <div className="flex gap-4"><h3>샌드박스 네트워크</h3><p>2025.01 ~ 재직중</p></div>
            <div className="flex gap-4"><h3>스펙터</h3><p>2023.01 ~ 2025.01</p></div>
            <div className="flex gap-4"><h3>뮤자인</h3><p>2019.03 ~ 2022.08</p></div>
          </RoughCard>
          <RoughCard tapes={["rt"]} className="p-8 flex flex-col gap-4 w-full h-full">
            <h2>Side-Project</h2>
            <div><h3>개인 블로그</h3><p>노션을 CMS로 활용한 개인 블로그 개발</p></div>
            <div><h3>오늘의 SLIP.</h3><p>Slack-Obsidian을 활용한 개인 기록용 포맷팅 App 개발</p></div>
          </RoughCard>
        </section>
      </main >
    </div >
  );
}
