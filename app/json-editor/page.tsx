"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { FormEditor } from "@/components/form-editor";
import { Block } from "@/types/form";

export default function JsonEditorPage() {
  const [jsonInput, setJsonInput] = useState("");

  const parsedBlocks = useMemo(() => {
    if (!jsonInput.trim()) return [];

    try {
      const parsed = JSON.parse(jsonInput);
      return parsed.blocks as Block[];
    } catch (error) {
      return [];
    }
  }, [jsonInput]);

  const isValidJson = useMemo(() => {
    if (!jsonInput.trim()) return true;
    try {
      JSON.parse(jsonInput);
      return true;
    } catch {
      return false;
    }
  }, [jsonInput]);

  return (
    <div className="min-h-screen p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">JSON to Form Builder</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Paste JSON to build and edit your form
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left: JSON Input */}
        <Card className="p-6 rounded-none">
          <h2 className="text-lg font-semibold mb-4">JSON Input</h2>
          <textarea
            className="w-full h-[calc(100vh-200px)] bg-muted p-4 rounded text-xs font-mono resize-none focus:outline-none"
            placeholder='Paste your JSON here...'
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
          />
          {!isValidJson && (
            <p className="text-sm text-destructive mt-2">Invalid JSON format</p>
          )}
        </Card>

        {/* Right: Editable Form Editor */}
        {isValidJson && parsedBlocks.length > 0 ? (
          <FormEditor
            key={JSON.stringify(parsedBlocks)}
            initialBlocks={parsedBlocks}
          />
        ) : (
          <Card className="p-6 pt-8 rounded-none">
            <div className="min-h-[400px] flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                {!isValidJson ? "Fix JSON errors to see builder" : "Paste JSON to start building"}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
