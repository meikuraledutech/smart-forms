"use client"

import { useState } from "react"
import { Plus, ChevronRight, ChevronDown, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Block = {
  id: string
  type: "question" | "option"
  question: string
  children: Block[]
}

export default function EditorPage() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const addBlock = () => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type: "question",
      question: "",
      children: [],
    }
    setBlocks([...blocks, newBlock])
  }

  const updateBlockQuestion = (blockId: string, question: string) => {
    const updateQuestion = (blocks: Block[]): Block[] => {
      return blocks.map((block) => {
        if (block.id === blockId) {
          return { ...block, question }
        }
        if (block.children.length > 0) {
          return { ...block, children: updateQuestion(block.children) }
        }
        return block
      })
    }

    setBlocks(updateQuestion(blocks))
  }

  const findBlock = (blockId: string, blocksList: Block[]): Block | null => {
    for (const block of blocksList) {
      if (block.id === blockId) return block
      if (block.children.length > 0) {
        const found = findBlock(blockId, block.children)
        if (found) return found
      }
    }
    return null
  }

  const addChild = (parentId: string) => {
    const parentBlock = findBlock(parentId, blocks)
    if (!parentBlock || !parentBlock.question.trim()) {
      toast.error("Please add content before creating a child")
      return
    }

    const newChild: Block = {
      id: Date.now().toString(),
      type: "question",
      question: "",
      children: [],
    }

    const addChildToBlock = (blocks: Block[]): Block[] => {
      return blocks.map((block) => {
        if (block.id === parentId) {
          return { ...block, children: [...block.children, newChild] }
        }
        if (block.children.length > 0) {
          return { ...block, children: addChildToBlock(block.children) }
        }
        return block
      })
    }

    setBlocks(addChildToBlock(blocks))
  }

  const addOption = (parentId: string) => {
    const parentBlock = findBlock(parentId, blocks)
    if (!parentBlock || !parentBlock.question.trim()) {
      toast.error("Please add content before creating an option")
      return
    }

    const newOption: Block = {
      id: Date.now().toString(),
      type: "option",
      question: "",
      children: [],
    }

    const addOptionToBlock = (blocks: Block[]): Block[] => {
      return blocks.map((block) => {
        if (block.id === parentId) {
          return { ...block, children: [...block.children, newOption] }
        }
        if (block.children.length > 0) {
          return { ...block, children: addOptionToBlock(block.children) }
        }
        return block
      })
    }

    setBlocks(addOptionToBlock(blocks))
  }

  const deleteBlock = (blockId: string) => {
    const removeBlock = (blocks: Block[]): Block[] => {
      return blocks
        .filter((block) => block.id !== blockId)
        .map((block) => ({
          ...block,
          children: removeBlock(block.children),
        }))
    }

    setBlocks(removeBlock(blocks))
  }

  const renderBlock = (block: Block, depth = 0): React.ReactNode => {
    const isCollapsed = collapsed.has(block.id)
    const hasChildren = block.children.length > 0

    if (block.type === "option") {
      return (
        <div key={block.id}>
          <div className="flex items-center gap-2" style={{ marginLeft: `${depth * 24}px` }}>
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
            <div className="relative flex-1">
              <input
                type="radio"
                disabled
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 shrink-0"
              />
              <Input
                placeholder="Type option text..."
                className="pl-10"
                value={block.question}
                onChange={(e) => updateBlockQuestion(block.id, e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => addChild(block.id)}>
                    Text
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addOption(block.id)}>
                    Options
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
            <div className="mt-3 space-y-3" style={{ marginLeft: '24px' }}>
              {block.children.map((child) => renderBlock(child, depth + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <div key={block.id}>
        <div className="flex items-center gap-2" style={{ marginLeft: `${depth * 24}px` }}>
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
          <Input
            placeholder="Type your question..."
            value={block.question}
            onChange={(e) => updateBlockQuestion(block.id, e.target.value)}
          />
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => addChild(block.id)}>
                  Text
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addOption(block.id)}>
                  Options
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
          <div className="mt-3 space-y-3">
            {block.children.map((child) => renderBlock(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Block Editor</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Build your form with nested questions
          </p>
        </div>

        <Card className="p-6 border-0 shadow-none">
          <div className="min-h-[400px] space-y-3">
            {blocks.map((block) => renderBlock(block))}

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={addBlock}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <div className="text-sm text-muted-foreground">
                Click + to add a question
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
