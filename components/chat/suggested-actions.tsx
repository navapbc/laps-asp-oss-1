"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { motion } from "framer-motion";
import { memo } from "react";
import { suggestions } from "@/lib/constants";
import type { ChatMessage } from "@/lib/types";
import type { VisibilityType } from "./visibility-selector";

type SuggestedActionsProps = {
  chatId: string;
  sendMessage:
    | UseChatHelpers<ChatMessage>["sendMessage"]
    | ((msg: { role: "user"; parts: { type: "text"; text: string }[] }) => void);
  selectedVisibilityType: VisibilityType;
};

function PureSuggestedActions({ chatId, sendMessage }: SuggestedActionsProps) {
  return (
    <div
      className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2"
      data-testid="suggested-actions"
    >
      {suggestions.map((item, index) => (
        <motion.button
          animate={{ opacity: 1, y: 0 }}
          className="group rounded-xl border border-border/40 bg-background p-4 text-left transition-all hover:border-border hover:shadow-md"
          exit={{ opacity: 0, y: 16 }}
          initial={{ opacity: 0, y: 16 }}
          key={item.title}
          onClick={() => {
            window.history.pushState(
              {},
              "",
              `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/chat/${chatId}`
            );
            sendMessage({
              role: "user",
              parts: [{ type: "text", text: item.prompt }],
            });
          }}
          transition={{
            delay: 0.06 * index,
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
          type="button"
        >
          <h3 className="font-serif text-sm font-semibold text-foreground group-hover:text-primary">
            {item.title}
          </h3>
          <p className="mt-1 font-sans text-xs text-muted-foreground">
            {item.description}
          </p>
        </motion.button>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) {
      return false;
    }
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType) {
      return false;
    }

    return true;
  }
);
