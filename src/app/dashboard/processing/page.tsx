import ModulePage from "@/components/shared/module-page";
import { processingLinks } from "@/lib/admin-modules";

export default function ProcessingPage() {
  return (
    <ModulePage
      eyebrow="Processing"
      title="Coffee Processing"
      description="Follow coffee batches through processing stages, output, loss and yield."
      links={processingLinks}
    />
  );
}
