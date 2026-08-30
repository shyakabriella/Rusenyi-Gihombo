import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ModuleLink = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

type ModulePageProps = {
  eyebrow?: string;
  title: string;
  description: string;
  links?: ModuleLink[];
};

export default function ModulePage({
  eyebrow = "Gihombo Coffee Washing Station",
  title,
  description,
  links = [],
}: ModulePageProps) {
  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold text-amber-700">
          {eyebrow}
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
          {title}
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      </section>

      {links.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {links.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                    <Icon size={21} />
                  </div>

                  <ArrowRight
                    size={18}
                    className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-amber-700"
                  />
                </div>

                <h2 className="mt-5 font-bold text-slate-900">
                  {item.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {item.description}
                </p>
              </Link>
            );
          })}
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">
            This module is ready for API integration and interface implementation.
          </p>
        </section>
      )}
    </div>
  );
}
