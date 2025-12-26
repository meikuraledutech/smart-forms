"use client";

import { Card } from "@/components/ui/card";
import { Block } from "@/types/form";

type JsonPreviewProps = {
  blocks: Block[];
};

const cleanJsonOutput = (blocks: Block[], depth = 0): any[] => {
  return blocks.map((block) => {
    const isTextInput = block.type === "question" && depth > 0;

    if (isTextInput) {
      const { children, ...rest } = block;
      return rest;
    }

    return {
      ...block,
      children: cleanJsonOutput(block.children || [], depth + 1),
    };
  });
};

export function JsonPreview({ blocks }: JsonPreviewProps) {
  return (
    <Card className="p-6 rounded-none">
      <h2 className="text-lg font-semibold mb-4">JSON Preview</h2>
      <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-[calc(100vh-200px)]">
        {JSON.stringify({ blocks: cleanJsonOutput(blocks) }, null, 2)}
      </pre>
    </Card>
  );
}
