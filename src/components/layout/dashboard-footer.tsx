export default function DashboardFooter() {
  return (
    <footer className="border-t border-[#eadfce] bg-[#fffdf9]">
      <div className="flex min-h-[58px] items-center justify-center px-6">
        <div className="flex w-full max-w-[900px] items-center gap-5">
          <div className="h-px flex-1 bg-[#c98b20]" />

          <p className="whitespace-nowrap text-[11px] font-bold uppercase tracking-wide text-[#176344]">
            Rusenyi High Lands Speciality Coffee Limited
          </p>

          <span className="h-3 w-3 rounded-full border border-[#c98b20] p-[2px]">
            <span className="block h-full w-full rounded-full bg-[#c98b20]" />
          </span>

          <p className="hidden whitespace-nowrap text-[11px] font-medium text-[#91651e] md:block">
            Coffee Washing Station Management System
          </p>

          <div className="hidden h-px flex-1 bg-[#c98b20] md:block" />
        </div>
      </div>
    </footer>
  );
}
