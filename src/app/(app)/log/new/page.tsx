import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { LogEntryForm } from "@/components/log-entry-form";
import { LogTemplatePicker } from "@/components/log-template-picker";
import { LOG_TEMPLATES } from "@/data/log-templates";

export default async function NewLogEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template: templateCode } = await searchParams;
  const template = LOG_TEMPLATES.find((candidate) => candidate.code === templateCode);

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4 p-4">
      {template ? (
        <>
          <Link
            href="/log/new"
            className="flex min-h-11 w-fit items-center gap-1 text-sm text-muted-foreground"
          >
            <ArrowLeft className="size-4" />
            Choose a different template
          </Link>
          <div>
            <p className="font-mono text-xs text-muted-foreground">{template.code}</p>
            <h1 className="text-lg font-semibold">{template.title}</h1>
          </div>
          <LogEntryForm template={template} />
        </>
      ) : (
        <>
          <h1 className="text-lg font-semibold">New log entry</h1>
          <LogTemplatePicker />
        </>
      )}
    </div>
  );
}
