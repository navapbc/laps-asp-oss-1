"use client";

import { SparklesIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { MultimodalInput } from "@/components/chat/multimodal-input";
import { Button } from "@/components/ui/button";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import type { Attachment } from "@/lib/types";
import { generateUUID } from "@/lib/utils";
import { ThemeToggle } from "../landing/theme-toggle";

export default function HomePage() {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const chatIdRef = useRef(generateUUID());

  const sendMessage = useCallback(
    (msg: { role: string; parts?: { type: string; text?: string; url?: string; name?: string; mediaType?: string }[] }) => {
      // Store the message for ChatShell to pick up and send through the real useActiveChat flow
      sessionStorage.setItem(
        "homepage-init-message",
        JSON.stringify({ role: msg.role, parts: msg.parts })
      );

      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      window.location.href = `${basePath}/`;
    },
    []
  );

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-2.5" href="/landing">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <span className="font-serif text-sm font-bold text-primary-foreground">
                N
              </span>
            </div>
            <span className="font-serif text-lg font-semibold text-foreground">
              Form-Filling Assistant
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button asChild className="rounded-lg" size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">
          {/* Welcome */}
          <div className="mb-10 text-center">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
              <SparklesIcon className="size-8 text-primary" />
            </div>
            <h1 className="font-serif text-3xl font-bold sm:text-4xl">
              How can I help you today?
            </h1>
            <p className="mt-3 font-sans text-base leading-relaxed text-muted-foreground sm:text-lg">
              Describe the benefit application you need to complete, or upload
              client documents to get started.
            </p>
          </div>

          {/* ─── Multimodal Input (includes suggestions + composer) ─── */}
          <MultimodalInput
            attachments={attachments}
            chatId={chatIdRef.current}
            input={input}
            messages={[]}
            selectedModelId={DEFAULT_CHAT_MODEL}
            selectedVisibilityType="private"
            sendMessage={sendMessage as any}
            setAttachments={setAttachments}
            setInput={setInput}
            setMessages={() => {}}
            status="ready"
            stop={() => {}}
          />
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border/40 bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
          <p className="font-sans text-sm text-muted-foreground">
            Built by{" "}
            <a
              className="text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
              href="https://www.navapbc.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              Nava PBC
            </a>{" "}
            &middot; Open Source &middot; Public Interest Technology
          </p>
        </div>
      </footer>
    </div>
  );
}
