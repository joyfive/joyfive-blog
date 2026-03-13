interface Props {
  title: string;
  description: string;
}

export default function PageHeader({ title, description }: Props) {
  return (
    <section className="mb-16">
      <h1 className="text-4xl font-bold mb-2">{title}</h1>
      <p className="text-stone-400 text-sm">{description}</p>
    </section>
  );
}
