import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type LogEntryWithAuthor = {
  id: string;
  template_code: string;
  template_title: string;
  body: string;
  created_at: string;
  profiles: { display_name: string | null; email: string } | null;
};

export function LogEntryCard({ entry }: { entry: LogEntryWithAuthor }) {
  const author = entry.profiles?.display_name || entry.profiles?.email || "Unknown";

  return (
    <Card>
      <CardContent className="flex flex-col gap-2 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono">
              {entry.template_code}
            </Badge>
            <span className="text-sm font-medium">{entry.template_title}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(entry.created_at).toLocaleString()} · {author}
          </span>
        </div>
        <pre className="text-wrap font-sans text-sm whitespace-pre-wrap">{entry.body}</pre>
      </CardContent>
    </Card>
  );
}
