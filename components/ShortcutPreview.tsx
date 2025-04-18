"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { WebSubURLShortcut } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatJSON5, formatShortcutKey } from "@/lib/utils";

interface ShortcutPreviewProps {
  shortcut: WebSubURLShortcut | null;
}

export function ShortcutPreview({ shortcut }: ShortcutPreviewProps) {
  const [formattedJson, setFormattedJson] = useState<string>("");

  useEffect(() => {
    if (shortcut) {
      setFormattedJson(formatJSON5(shortcut));
    } else {
      setFormattedJson("");
    }
  }, [shortcut]);

  if (!shortcut) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">Select or create a shortcut to preview</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle>Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">URL Pattern:</h3>
          <div className="p-2 bg-muted rounded text-sm font-mono">{shortcut.hrefRegex}</div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Scroll Container:</h3>
          <div className="p-2 bg-muted rounded text-sm font-mono">
            {shortcut.scrollBoxIdentifier || "None"}
          </div>
        </div>

        {shortcut.shortcuts.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Shortcuts:</h3>
            <ul className="space-y-2">
              {shortcut.shortcuts.map((sc, idx) => (
                <motion.li 
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex justify-between p-2 bg-muted rounded"
                >
                  <kbd className="px-2 py-1 bg-background rounded border font-mono text-xs">
                    {formatShortcutKey(sc)}
                  </kbd>
                  <span className="text-sm text-muted-foreground">{sc.uniqueIdentifier}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-sm font-medium">JSON5:</h3>
          <ScrollArea className="h-[200px] rounded border p-2">
            <pre className="text-xs font-mono">{formattedJson}</pre>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}