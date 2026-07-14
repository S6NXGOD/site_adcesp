export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="container py-12 md:py-16">
        <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
        {description && (
          <p className="mt-3 max-w-2xl text-primary-foreground/80">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
