"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { renderLogTemplate, type LogTemplate } from "@/data/log-templates";
import { copyToClipboard } from "@/lib/clipboard";

export function LogBrowser({ templates }: { templates: LogTemplate[] }) {
  const [query, setQuery] = useState("");

  const rendered = useMemo(
    () => templates.map((template) => ({ template, text: renderLogTemplate(template, {}) })),
    [templates],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return rendered;
    return rendered.filter(
      ({ template, text }) =>
        template.code.toLowerCase().includes(term) ||
        template.title.toLowerCase().includes(term) ||
        text.toLowerCase().includes(term),
    );
  }, [rendered, query]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter log templates..."
          className="h-11 border-[#555] bg-[#222] pl-9 text-white placeholder:text-gray-400"
        />
      </div>
      <div className="flex flex-col gap-3">
        {filtered.map(({ template, text }) => (
          <button key={template.code} type="button" onClick={() => copyToClipboard(text)} className="text-left">
            <Card className="border-[#444] bg-[#333] text-white transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-2 py-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono">
                    {template.code}
                  </Badge>
                  <span className="text-sm font-medium">{template.title}</span>
                </div>
                <pre className="text-wrap font-sans text-sm whitespace-pre-wrap text-muted-foreground">
                  {text}
                </pre>
              </CardContent>
            </Card>
          </button>
        ))}
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No matching templates.</p>
        ) : null}
      </div>
    </div>
  );
}
