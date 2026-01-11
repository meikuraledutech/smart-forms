"use client";

import { useState } from "react";
import { Plus, ChevronRight, ChevronDown, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Block } from "@/types/form";

type FormEditorProps = {
  initialBlocks?: Block[];
  onBlocksChange?: (blocks: Block[]) => void;
};

type DialogMode = "add-root" | "add-child" | "edit";

export function FormEditor({ initialBlocks = [], onBlocksChange }: FormEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("add-root");
  const [dialogParentId, setDialogParentId] = useState<string | null>(null);
  const [editBlockId, setEditBlockId] = useState<string | null>(null);

  // Form state
  const [questionText, setQuestionText] = useState("");
  const [fieldType, setFieldType] = useState<"options" | "text">("options");
  const [optionTexts, setOptionTexts] = useState(["Option 1", "Option 2", "Option 3", "Option 4", "Others"]);
  const [textInputLabel, setTextInputLabel] = useState("Text Input");
  const [enableTextInput, setEnableTextInput] = useState(false);
  const [optionTextInputLabel, setOptionTextInputLabel] = useState("Please specify");

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateBlocks = (newBlocks: Block[]) => {
    setBlocks(newBlocks);
    onBlocksChange?.(newBlocks);
  };

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const findBlock = (blockId: string, blocksList: Block[]): Block | null => {
    for (const block of blocksList) {
      if (block.id === blockId) return block;
      if (block.children.length > 0) {
        const found = findBlock(blockId, block.children);
        if (found) return found;
      }
    }
    return null;
  };

  const resetForm = () => {
    setQuestionText("");
    setFieldType("options");
    setOptionTexts(["Option 1", "Option 2"]);
    setTextInputLabel("Text Input");
    setEnableTextInput(false);
    setOptionTextInputLabel("Please specify");
    setErrors({});
    setDialogParentId(null);
    setEditBlockId(null);
  };

  const addOptionField = () => {
    setOptionTexts([...optionTexts, `Option ${optionTexts.length + 1}`]);
  };

  const removeOptionField = (index: number) => {
    if (optionTexts.length <= 2) {
      toast.error("At least 2 options are required");
      return;
    }
    const newOptions = optionTexts.filter((_, i) => i !== index);
    setOptionTexts(newOptions);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!questionText.trim()) {
      newErrors.question = "Question is required";
    }

    if (fieldType === "options") {
      optionTexts.forEach((text, index) => {
        if (!text.trim()) {
          newErrors[`option${index}`] = `Option ${index + 1} is required`;
        }
      });
      if (enableTextInput && !optionTextInputLabel.trim()) {
        newErrors.optionTextInput = "Text input label is required";
      }
    } else {
      if (!textInputLabel.trim()) {
        newErrors.textInput = "Text input label is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const openAddRootDialog = () => {
    resetForm();
    setDialogMode("add-root");
    setDialogOpen(true);
  };

  const openAddChildDialog = (parentId: string) => {
    resetForm();
    setDialogMode("add-child");
    setDialogParentId(parentId);
    setDialogOpen(true);
  };

  const openEditDialog = (blockId: string) => {
    const block = findBlock(blockId, blocks);
    if (!block) return;

    setQuestionText(block.question);
    setEditBlockId(blockId);
    setDialogMode("edit");

    // Determine field type based on children
    if (block.children.length > 0) {
      const firstChild = block.children[0];
      if (firstChild.type === "input") {
        setFieldType("text");
        setTextInputLabel(firstChild.question);
      } else if (firstChild.type === "option") {
        setFieldType("options");
        // Separate options and text input
        const optionChildren = block.children.filter(c => c.type === "option");
        const textInputChild = block.children.find(c => c.type === "input");

        const optTexts = optionChildren.map((c) => c.question);
        setOptionTexts(optTexts);

        if (textInputChild) {
          setEnableTextInput(true);
          setOptionTextInputLabel(textInputChild.question);
        }
      }
    }

    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }

    const baseBlock: Block = {
      id: editBlockId || Date.now().toString(),
      type: "question",
      question: questionText,
      children: [],
    };

    if (fieldType === "options") {
      baseBlock.children = optionTexts.map((text, index) => ({
        id: `${baseBlock.id}_opt_${index}`,
        type: "option",
        question: text,
        children: [],
      }));

      // Add text input if enabled
      if (enableTextInput) {
        baseBlock.children.push({
          id: `${baseBlock.id}_text`,
          type: "input",
          question: optionTextInputLabel,
          children: [],
        });
      }
    } else {
      baseBlock.children = [{
        id: `${baseBlock.id}_text`,
        type: "input",
        question: textInputLabel,
        children: [],
      }];
    }

    if (dialogMode === "add-root") {
      updateBlocks([...blocks, baseBlock]);
    } else if (dialogMode === "add-child" && dialogParentId) {
      const addChildToBlock = (blocks: Block[]): Block[] => {
        return blocks.map((block) => {
          if (block.id === dialogParentId) {
            return { ...block, children: [...block.children, baseBlock] };
          }
          if (block.children.length > 0) {
            return { ...block, children: addChildToBlock(block.children) };
          }
          return block;
        });
      };
      updateBlocks(addChildToBlock(blocks));
    } else if (dialogMode === "edit" && editBlockId) {
      const updateBlockData = (blocks: Block[]): Block[] => {
        return blocks.map((block) => {
          if (block.id === editBlockId) {
            return baseBlock;
          }
          if (block.children.length > 0) {
            return { ...block, children: updateBlockData(block.children) };
          }
          return block;
        });
      };
      updateBlocks(updateBlockData(blocks));
    }

    setDialogOpen(false);
    resetForm();
    toast.success(dialogMode === "edit" ? "Question updated" : "Question added");
  };

  const deleteBlock = (blockId: string) => {
    const removeBlock = (blocks: Block[]): Block[] => {
      return blocks
        .filter((block) => block.id !== blockId)
        .map((block) => ({
          ...block,
          children: removeBlock(block.children),
        }));
    };

    updateBlocks(removeBlock(blocks));
    toast.success("Question deleted");
  };

  const renderBlock = (block: Block, depth = 0, index = 0): React.ReactNode => {
    const isCollapsed = collapsed.has(block.id);
    const children = block.children || [];
    const hasChildren = children.length > 0;
    const hasTextInputChild = children.some((child) => child.type === "input");

    // Text Input display component
    if (block.type === "input") {
      return (
        <div key={block.id}>
          <div
            className="flex items-center gap-2 py-2 px-3 rounded"
            style={{ marginLeft: `${depth * 24}px` }}
          >
            <div className="w-8 shrink-0" />
            <div className="flex-1 text-sm">
              {block.question}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => deleteBlock(block.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    }

    if (block.type === "option") {
      return (
        <div key={block.id}>
          <div
            className="flex items-center gap-2 py-2 px-3 rounded hover:bg-accent/50"
            style={{ marginLeft: `${depth * 24}px` }}
          >
            {hasChildren ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => toggleCollapse(block.id)}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <div className="w-8 shrink-0" />
            )}
            <div className="relative flex-1 flex items-center gap-3">
              <input
                type="radio"
                disabled
                className="h-4 w-4 shrink-0"
              />
              <span className="text-sm">{block.question}</span>
            </div>
            <div className="flex items-center gap-1">
              {!hasTextInputChild && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => openAddChildDialog(block.id)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => deleteBlock(block.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {hasChildren && !isCollapsed && (
            <div className="mt-2 space-y-2" style={{ marginLeft: "24px" }}>
              {children.map((child, idx) => renderBlock(child, depth + 1, idx))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={block.id} className={depth === 0 ? "pb-4 mb-4 border-b" : ""}>
        <div
          className={`flex items-center gap-2 py-3 px-3 rounded hover:bg-accent/50 ${
            depth === 0 && index % 2 === 0 ? "bg-muted/30" : ""
          }`}
          style={{ marginLeft: `${depth * 24}px` }}
        >
          {hasChildren ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => toggleCollapse(block.id)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="w-8 shrink-0" />
          )}
          <div className="flex-1 flex items-center gap-2">
            {depth === 0 && (
              <span className="text-muted-foreground font-medium">{index + 1}.</span>
            )}
            <span className="text-sm font-medium">{block.question}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => openEditDialog(block.id)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => deleteBlock(block.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {hasChildren && !isCollapsed && (
          <div className="mt-2 space-y-2 pl-3">
            {children.map((child, idx) => renderBlock(child, depth + 1, idx))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Card className="p-6 pt-8 rounded-none">
        <div className="min-h-[400px] space-y-3">
          {blocks.map((block, index) => renderBlock(block, 0, index))}

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={openAddRootDialog}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <div className="text-sm text-muted-foreground">
              Click + to add a question
            </div>
          </div>
        </div>
      </Card>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogMode === "edit" ? "Edit Question" : "Add Question"}
            </AlertDialogTitle>
          </AlertDialogHeader>

          <div className="space-y-6 py-4">
            {/* Question Text */}
            <div className="space-y-2">
              <Label htmlFor="question">
                Question <span className="text-destructive">*</span>
              </Label>
              <Input
                id="question"
                placeholder="Enter your question..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className={errors.question ? "border-destructive" : ""}
              />
              {errors.question && (
                <p className="text-sm text-destructive">{errors.question}</p>
              )}
            </div>

            {/* Field Type Selector */}
            <div className="space-y-2">
              <Label>
                Field Type <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFieldType("options")}
                  className={`p-4 border-2 rounded-lg transition-colors text-left ${
                    fieldType === "options"
                      ? "border-primary bg-accent"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="font-semibold mb-1">Options</div>
                  <div className="text-xs text-muted-foreground">
                    Multiple choice (add/remove options)
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFieldType("text")}
                  className={`p-4 border-2 rounded-lg transition-colors text-left ${
                    fieldType === "text"
                      ? "border-primary bg-accent"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="font-semibold mb-1">Text Input</div>
                  <div className="text-xs text-muted-foreground">
                    Single text input field
                  </div>
                </button>
              </div>
            </div>

            {/* Dynamic Fields */}
            {fieldType === "options" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>
                    Options <span className="text-destructive">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOptionField}
                    className="h-8"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </Button>
                </div>
                {optionTexts.map((text, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={text}
                        onChange={(e) => {
                          const newOptions = [...optionTexts];
                          newOptions[index] = e.target.value;
                          setOptionTexts(newOptions);
                        }}
                        className={errors[`option${index}`] ? "border-destructive" : ""}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOptionField(index)}
                        className="h-10 w-10 shrink-0"
                        disabled={optionTexts.length <= 2}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {errors[`option${index}`] && (
                      <p className="text-sm text-destructive">
                        {errors[`option${index}`]}
                      </p>
                    )}
                  </div>
                ))}

                {/* Text Input Toggle */}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <div className="space-y-0.5">
                      <Label htmlFor="enable-text-input" className="text-base">
                        Add text input field
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Allow users to enter custom text (e.g., "Others - please specify")
                      </p>
                    </div>
                    <Switch
                      id="enable-text-input"
                      checked={enableTextInput}
                      onCheckedChange={setEnableTextInput}
                    />
                  </div>
                  {enableTextInput && (
                    <div className="space-y-1">
                      <Input
                        placeholder="Enter text input label..."
                        value={optionTextInputLabel}
                        onChange={(e) => setOptionTextInputLabel(e.target.value)}
                        className={errors.optionTextInput ? "border-destructive" : ""}
                      />
                      {errors.optionTextInput && (
                        <p className="text-sm text-destructive">
                          {errors.optionTextInput}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="textInput">
                  Text Input Label <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="textInput"
                  placeholder="Enter label for text input..."
                  value={textInputLabel}
                  onChange={(e) => setTextInputLabel(e.target.value)}
                  className={errors.textInput ? "border-destructive" : ""}
                />
                {errors.textInput && (
                  <p className="text-sm text-destructive">{errors.textInput}</p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {dialogMode === "edit" ? "Update" : "Add"} Question
              </Button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
