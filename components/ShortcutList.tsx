"use client";

import { useState } from "react";
import { Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatShortcutKey } from "@/lib/utils";
import { WebSubURLShortcut } from "@/lib/types";

interface ShortcutListProps {
  shortcuts: WebSubURLShortcut[];
  onEdit: (shortcut: WebSubURLShortcut) => void;
  onDelete: (uuid: string) => void;
}

export function ShortcutList({ shortcuts, onEdit, onDelete }: ShortcutListProps) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (uuid: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [uuid]: !prev[uuid],
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Shortcuts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {shortcuts.length === 0 ? (
          <div className="text-center p-4 border border-dashed rounded-lg">
            <p className="text-muted-foreground">No shortcuts saved yet</p>
          </div>
        ) : (
          <AnimatePresence>
            {shortcuts.map((shortcut) => (
              <motion.div
                key={shortcut.uuid}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Collapsible
                  open={openItems[shortcut.uuid]}
                  onOpenChange={() => toggleItem(shortcut.uuid)}
                  className="border rounded-lg mb-2"
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="flex-1 mr-4">
                      <h3 className="font-medium truncate">{shortcut.hrefRegex}</h3>
                      <p className="text-sm text-muted-foreground">
                        {shortcut.shortcuts.length} shortcut(s)
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(shortcut);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(shortcut.uuid);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon">
                          {openItems[shortcut.uuid] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                  <CollapsibleContent>
                    <div className="p-4 pt-0 border-t">
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium">Scroll Box:</span>
                          <span className="text-sm ml-2">{shortcut.scrollBoxIdentifier || 'None'}</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">Shortcuts:</h4>
                          <ul className="space-y-1">
                            {shortcut.shortcuts.map((sc, idx) => (
                              <li key={idx} className="text-sm flex justify-between">
                                <span>{formatShortcutKey(sc)}</span>
                                <span className="text-muted-foreground">{sc.uniqueIdentifier}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}