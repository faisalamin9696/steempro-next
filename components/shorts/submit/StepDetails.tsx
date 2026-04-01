"use client";

import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import TagsInput from "@/components/submit/TagsInput";
import { Info, Layout, Hash, Type } from "lucide-react";

interface Props {
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  tags: string[];
  setTags: (v: string[]) => void;
  tagInput: string;
  setTagInput: (v: string) => void;
  canEditDetails: boolean;
  canOpenStep3: boolean;
  onNext: () => void;
}

export function StepDetails({
  title,
  setTitle,
  description,
  setDescription,
  tags,
  setTags,
  tagInput,
  setTagInput,
  canEditDetails,
  canOpenStep3,
  onNext,
}: Props) {
  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Layout size={20} />
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.24em] text-primary">
            Step 02
          </p>
          <h3 className="text-lg font-black tracking-tight text-foreground leading-tight">
            Content Details
          </h3>
          <p className="text-xs font-medium text-default-500">
            Add a title and tags for better discovery.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 px-1">
            <Type size={12} className="text-primary/70" />
            <span className="text-[10px] font-black uppercase tracking-widest text-default-400">
              Heading
            </span>
          </div>
          <Input
            type="text"
            placeholder="Give your short a catchy title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            isDisabled={!canEditDetails}
            variant="faded"
            size="md"
            classNames={{
              input: "font-bold",
              inputWrapper: "rounded-xl border-default-200/50",
            }}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 px-1">
            <Info size={12} className="text-primary/70" />
            <span className="text-[10px] font-black uppercase tracking-widest text-default-400">
              Context
            </span>
          </div>
          <Textarea
            placeholder="What's happening in this clip?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            isDisabled={!canEditDetails}
            variant="faded"
            size="md"
            classNames={{
              inputWrapper: "rounded-xl border-default-200/50",
            }}
            minRows={3}
            maxLength={500}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 px-1">
            <Hash size={12} className="text-primary/70" />
            <span className="text-[10px] font-black uppercase tracking-widest text-default-400">
              Network Tags
            </span>
          </div>
          <TagsInput
            tags={tags}
            onChange={setTags}
            inputValue={tagInput}
            onInputValueChange={setTagInput}
            isDisabled={!canEditDetails}
            variant="faded"
            size="md"
          />
          <p className="px-1 text-[9px] font-medium text-default-400 italic">
            Pro tip: Standard tags help your short reach more viewers.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          size="md"
          color="primary"
          variant="shadow"
          onPress={onNext}
          isDisabled={!canOpenStep3}
          className="h-10 px-8 rounded-xl font-black uppercase tracking-widest text-[10px]"
        >
          Visual Optimization →
        </Button>
      </div>
    </div>
  );
}
