"use client";

import { useState } from "react";
import { FormEditor } from "@/components/form-editor";
import { JsonPreview } from "@/components/json-preview";
import { Block } from "@/types/form";

export default function EditorPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);

  return (
    <div className="min-h-screen p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Block Editor</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Build your form with nested questions
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <FormEditor onBlocksChange={setBlocks} />
        <JsonPreview blocks={blocks} />
      </div>
    </div>
  );
}
