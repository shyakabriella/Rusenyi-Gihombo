type DashboardPageProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
};

export default function DashboardPage({
  title,
  description,
  children,
}: DashboardPageProps) {
  return (
    <div className="w-full space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[#101828] sm:text-2xl">
          {title}
        </h1>

        <p className="mt-1 max-w-3xl text-sm leading-6 text-[#475467]">
          {description}
        </p>
      </div>

      {children ?? (
        <div className="rounded-xl border border-[#eee4d6] bg-white p-5 sm:p-6">
          <p className="text-sm text-[#475467]">
            {title} module is ready.
          </p>
        </div>
      )}
    </div>
  );
}
