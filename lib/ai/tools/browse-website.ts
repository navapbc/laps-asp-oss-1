import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import type { ChatMessage } from "@/lib/types";
import { generateUUID } from "@/lib/utils";

type BrowseWebsiteProps = {
  dataStream: UIMessageStreamWriter<ChatMessage>;
};

export const browseWebsite = ({ dataStream }: BrowseWebsiteProps) =>
  tool({
    description:
      "Browse a website using a cloud browser. Use this tool when the user wants to view, navigate to, or interact with a website. This will open a live browser view where the user can see and interact with the webpage.",
    inputSchema: z.object({
      url: z
        .string()
        .describe(
          "The URL of the website to browse. Can be a full URL (https://example.com) or just the domain (example.com)"
        ),
      title: z
        .string()
        .describe("A short title describing what the user wants to view"),
    }),
    execute: ({ url, title }) => {
      const id = generateUUID();

      // Ensure URL has protocol
      let fullUrl = url.trim();
      if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
        fullUrl = `https://${fullUrl}`;
      }

      dataStream.write({
        type: "data-kind",
        data: "browser",
        transient: true,
      });

      dataStream.write({
        type: "data-id",
        data: id,
        transient: true,
      });

      dataStream.write({
        type: "data-title",
        data: title,
        transient: true,
      });

      dataStream.write({
        type: "data-clear",
        data: null,
        transient: true,
      });

      dataStream.write({
        type: "data-browserUrl",
        data: fullUrl,
      });

      dataStream.write({ type: "data-finish", data: null, transient: true });

      return {
        id,
        title,
        url: fullUrl,
        content: `Opening browser to view ${fullUrl}. The user can now see and interact with the website.`,
      };
    },
  });
