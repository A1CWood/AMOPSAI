import { LogBrowser } from "@/components/log-browser";
import { LOG_TEMPLATES } from "@/data/log-templates";

export default function LogPage() {
  return <LogBrowser templates={LOG_TEMPLATES} />;
}
