"use client";

import { useState } from "react";
import { Download, Upload, FileJson } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatJSON5, parseJSON5 } from "@/lib/utils";
import { WebSubURLShortcut } from "@/lib/types";
import { WebSubURLShortcutSchema } from "@/lib/schema";

interface ImportExportProps {
  shortcuts: WebSubURLShortcut[];
  onImport: (shortcuts: WebSubURLShortcut[]) => void;
}

export function ImportExport({ shortcuts, onImport }: ImportExportProps) {
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [importData, setImportData] = useState("");
  const [importError, setImportError] = useState("");
  
  const handleExport = () => {
    try {
      const json = formatJSON5(shortcuts);
      navigator.clipboard.writeText(json)
        .then(() => {
          console.log("JSON copied to clipboard");
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    } catch (error) {
      console.error("Export error:", error);
    }
  };
  
  const handleImport = () => {
    try {
      setImportError("");
      const parsed = parseJSON5(importData);
      
      // Check if it's an array
      if (!Array.isArray(parsed)) {
        throw new Error("Imported data must be an array of shortcuts");
      }
      
      // Validate each shortcut
      const validated = parsed.map(item => {
        const result = WebSubURLShortcutSchema.safeParse(item);
        if (!result.success) {
          throw new Error(`Invalid shortcut data: ${result.error.message}`);
        }
        return result.data;
      });
      
      onImport(validated);
      setImportOpen(false);
      setImportData("");
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Invalid import data");
    }
  };

  return (
    <div className="flex space-x-2">
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-1">
            <Upload className="h-4 w-4" />
            <span>Import</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Shortcuts</DialogTitle>
            <DialogDescription>
              Paste your JSON5 formatted shortcuts data below.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste JSON5 data here..."
              className="font-mono h-[300px]"
            />
            {importError && (
              <p className="text-destructive text-sm mt-2">{importError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Export Shortcuts</DialogTitle>
            <DialogDescription>
              Copy the JSON5 formatted shortcuts data.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={formatJSON5(shortcuts)}
              readOnly
              className="font-mono h-[300px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportOpen(false)}>
              Close
            </Button>
            <Button onClick={handleExport} className="flex items-center gap-1">
              <FileJson className="h-4 w-4" />
              <span>Copy to Clipboard</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}