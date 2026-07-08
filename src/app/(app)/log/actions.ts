"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { LOG_TEMPLATES, renderLogTemplate } from "@/data/log-templates";
import { createClient } from "@/lib/supabase/server";

export async function createLogEntry(formData: FormData) {
  const templateCode = formData.get("templateCode");
  const template = LOG_TEMPLATES.find((candidate) => candidate.code === templateCode);
  if (!template) {
    throw new Error(`Unknown log template: ${String(templateCode)}`);
  }

  const values: Record<string, string> = {};
  for (const field of template.fields) {
    values[field.key] = String(formData.get(field.key) ?? "");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("log_entries").insert({
    template_code: template.code,
    template_title: template.title,
    body: renderLogTemplate(template, values),
    fields: values,
    author_id: user.id,
  });

  if (error) {
    throw new Error(`Failed to save log entry: ${error.message}`);
  }

  revalidatePath("/log");
  redirect("/log");
}
