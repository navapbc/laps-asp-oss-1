"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Artifact } from "@/components/chat/create-artifact";
import {
  GlobeIcon,
  LoaderIcon,
  PlayIcon,
  RedoIcon,
} from "@/components/chat/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Metadata = {
  sessionId: string | null;
  liveViewUrl: string | null;
  isConnecting: boolean;
  currentUrl: string;
  error: string | null;
};

function BrowserContent({
  metadata,
  setMetadata,
  content,
}: {
  metadata: Metadata;
  setMetadata: (metadata: Metadata | ((prev: Metadata) => Metadata)) => void;
  content: string;
  title: string;
  mode: "edit" | "diff";
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  status: "streaming" | "idle";
  onSaveContent: (updatedContent: string, debounce: boolean) => void;
  isInline: boolean;
  getDocumentContentById: (index: number) => string;
  isLoading: boolean;
  suggestions: any[];
}) {
  const [urlInput, setUrlInput] = useState(
    metadata?.currentUrl || content || ""
  );
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hasAutoNavigated = useRef(false);

  useEffect(() => {
    if (metadata?.currentUrl) {
      setUrlInput(metadata.currentUrl);
    }
  }, [metadata?.currentUrl]);

  // Auto-navigate when opened from preview with a URL
  useEffect(() => {
    if (
      content &&
      !metadata?.liveViewUrl &&
      !metadata?.isConnecting &&
      !hasAutoNavigated.current
    ) {
      hasAutoNavigated.current = true;
      let url = content.trim();
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = `https://${url}`;
      }
      setUrlInput(url);

      // Trigger navigation
      setMetadata((prev) => ({
        ...prev,
        currentUrl: url,
        isConnecting: true,
        error: null,
      }));

      fetch("/api/browser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to create browser session");
          }
          return response.json();
        })
        .then((data) => {
          setMetadata((prev) => ({
            ...prev,
            sessionId: data.sessionId,
            liveViewUrl: data.liveViewUrl,
            isConnecting: false,
          }));
        })
        .catch((error) => {
          setMetadata((prev) => ({
            ...prev,
            isConnecting: false,
            error: error.message || "Failed to connect",
          }));
        });
    }
  }, [content, metadata?.liveViewUrl, metadata?.isConnecting, setMetadata]);

  const handleNavigate = async () => {
    if (!urlInput.trim()) {
      return;
    }

    let url = urlInput.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }

    setMetadata((prev) => ({
      ...prev,
      currentUrl: url,
      isConnecting: true,
      error: null,
    }));

    try {
      const response = await fetch("/api/browser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to create browser session");
      }

      const data = await response.json();

      setMetadata((prev) => ({
        ...prev,
        sessionId: data.sessionId,
        liveViewUrl: data.liveViewUrl,
        isConnecting: false,
      }));
    } catch (error: any) {
      setMetadata((prev) => ({
        ...prev,
        isConnecting: false,
        error: error.message || "Failed to connect",
      }));
      toast.error("Failed to create browser session");
    }
  };

  const handleRefresh = () => {
    if (metadata?.liveViewUrl && iframeRef.current) {
      iframeRef.current.src = metadata.liveViewUrl;
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b p-2">
        <Button
          disabled={metadata?.isConnecting}
          onClick={handleRefresh}
          size="icon"
          variant="ghost"
        >
          <RedoIcon size={16} />
        </Button>
        <div className="relative flex-1">
          <span className="-translate-y-1/2 absolute top-1/2 left-3 text-muted-foreground">
            <GlobeIcon size={14} />
          </span>
          <Input
            className="h-9 pr-4 pl-9 text-sm"
            disabled={metadata?.isConnecting}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleNavigate()}
            placeholder="Enter URL to browse..."
            value={urlInput}
          />
        </div>
        <Button
          disabled={metadata?.isConnecting || !urlInput.trim()}
          onClick={handleNavigate}
          size="sm"
        >
          {metadata?.isConnecting ? (
            <span className="animate-spin">
              <LoaderIcon size={16} />
            </span>
          ) : (
            "Go"
          )}
        </Button>
      </div>

      <div className="relative flex-1 bg-white">
        {metadata?.isConnecting && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
            <div className="flex flex-col items-center gap-2">
              <span className="animate-spin">
                <LoaderIcon size={24} />
              </span>
              <span className="text-muted-foreground text-sm">
                Connecting to browser...
              </span>
            </div>
          </div>
        )}

        {metadata?.error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="text-destructive text-sm">{metadata.error}</span>
              <Button onClick={handleNavigate} size="sm" variant="outline">
                Retry
              </Button>
            </div>
          </div>
        )}

        {metadata?.liveViewUrl ? (
          <iframe
            className="size-full border-0"
            ref={iframeRef}
            src={metadata.liveViewUrl}
            title="Browser View"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="flex flex-col items-center gap-4">
              <GlobeIcon size={48} />
              <p className="text-sm">Enter a URL above to start browsing</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const browserArtifact = new Artifact<"browser", Metadata>({
  kind: "browser",
  description:
    "A browser artifact for navigating websites using Kernel cloud browsers. Use this when the user wants to browse, view, or interact with a website.",
  initialize: ({ setMetadata }) => {
    setMetadata({
      sessionId: null,
      liveViewUrl: null,
      isConnecting: false,
      currentUrl: "",
      error: null,
    });
  },
  onStreamPart: ({ streamPart, setArtifact, setMetadata }) => {
    if (streamPart.type === "data-browserUrl") {
      const url = streamPart.data as string;
      setMetadata((prev) => ({
        ...prev,
        currentUrl: url,
      }));
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: url,
        isVisible: true,
        status: "streaming",
      }));
    }
  },
  content: BrowserContent,
  actions: [
    {
      icon: <PlayIcon size={18} />,
      label: "Navigate",
      description: "Navigate to URL",
      onClick: async ({ content, setMetadata }) => {
        if (!content.trim()) {
          return;
        }

        let url = content.trim();
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          url = `https://${url}`;
        }

        setMetadata((prev) => ({
          ...prev,
          currentUrl: url,
          isConnecting: true,
          error: null,
        }));

        try {
          const response = await fetch("/api/browser", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
          });

          if (!response.ok) {
            throw new Error("Failed to create browser session");
          }

          const data = await response.json();

          setMetadata((prev) => ({
            ...prev,
            sessionId: data.sessionId,
            liveViewUrl: data.liveViewUrl,
            isConnecting: false,
          }));
        } catch (error: any) {
          setMetadata((prev) => ({
            ...prev,
            isConnecting: false,
            error: error.message || "Failed to connect",
          }));
          toast.error("Failed to create browser session");
        }
      },
    },
  ],
  toolbar: [],
});
