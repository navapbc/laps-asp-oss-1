"use client";

import { type MouseEvent, memo, useCallback, useEffect, useRef } from "react";
import { useArtifact } from "@/hooks/use-artifact";
import type { UIArtifact } from "./artifact";
import { FullscreenIcon, GlobeIcon, LoaderIcon } from "./icons";

type BrowserPreviewProps = {
  isReadonly: boolean;
  result?: {
    id: string;
    title: string;
    url: string;
  };
};

export function BrowserPreview({ isReadonly, result }: BrowserPreviewProps) {
  const { artifact, setArtifact } = useArtifact();
  const hitboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const boundingBox = hitboxRef.current?.getBoundingClientRect();

    if (artifact.documentId && boundingBox) {
      setArtifact((currentArtifact) => ({
        ...currentArtifact,
        boundingBox: {
          left: boundingBox.x,
          top: boundingBox.y,
          width: boundingBox.width,
          height: boundingBox.height,
        },
      }));
    }
  }, [artifact.documentId, setArtifact]);

  // If the artifact is visible and it's the browser, don't show the preview
  if (artifact.isVisible && artifact.kind === "browser") {
    if (result) {
      return (
        <BrowserToolResult
          isReadonly={isReadonly}
          result={result}
          setArtifact={setArtifact}
        />
      );
    }
    return null;
  }

  if (!result) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="relative w-full max-w-[450px] cursor-pointer">
      <HitboxLayer
        hitboxRef={hitboxRef}
        result={result}
        setArtifact={setArtifact}
      />
      <BrowserHeader
        isStreaming={
          artifact.status === "streaming" && artifact.kind === "browser"
        }
        title={result.title}
        url={result.url}
      />
      <BrowserContent url={result.url} />
    </div>
  );
}

const LoadingSkeleton = () => (
  <div className="w-full max-w-[450px]">
    <div className="flex h-[57px] flex-row items-center justify-between gap-2 rounded-t-2xl border border-b-0 p-4 dark:border-zinc-700 dark:bg-muted">
      <div className="flex flex-row items-center gap-3">
        <div className="text-muted-foreground">
          <div className="size-4 animate-pulse rounded-md bg-muted-foreground/20" />
        </div>
        <div className="h-4 w-24 animate-pulse rounded-lg bg-muted-foreground/20" />
      </div>
      <div>
        <FullscreenIcon />
      </div>
    </div>
    <div className="h-[200px] overflow-hidden rounded-b-2xl border border-t-0 bg-muted dark:border-zinc-700">
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin">
          <LoaderIcon size={24} />
        </div>
      </div>
    </div>
  </div>
);

const PureHitboxLayer = ({
  hitboxRef,
  result,
  setArtifact,
}: {
  hitboxRef: React.RefObject<HTMLDivElement>;
  result: { id: string; title: string; url: string };
  setArtifact: (
    updaterFn: UIArtifact | ((currentArtifact: UIArtifact) => UIArtifact)
  ) => void;
}) => {
  const handleClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      const boundingBox = event.currentTarget.getBoundingClientRect();

      setArtifact((artifact) => ({
        ...artifact,
        title: result.title,
        documentId: result.id,
        kind: "browser",
        content: result.url,
        isVisible: true,
        boundingBox: {
          left: boundingBox.x,
          top: boundingBox.y,
          width: boundingBox.width,
          height: boundingBox.height,
        },
      }));
    },
    [setArtifact, result]
  );

  return (
    <div
      aria-hidden="true"
      className="absolute top-0 left-0 z-10 size-full rounded-xl"
      onClick={handleClick}
      ref={hitboxRef}
      role="presentation"
    >
      <div className="flex w-full items-center justify-end p-4">
        <div className="absolute top-[13px] right-[9px] rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700">
          <FullscreenIcon />
        </div>
      </div>
    </div>
  );
};

const HitboxLayer = memo(PureHitboxLayer);

const PureBrowserHeader = ({
  title,
  url,
  isStreaming,
}: {
  title: string;
  url: string;
  isStreaming: boolean;
}) => {
  // Extract domain from URL for display
  let displayUrl = url;
  try {
    const urlObj = new URL(url);
    displayUrl = urlObj.hostname;
  } catch {
    // Keep original URL if parsing fails
  }

  return (
    <div className="flex flex-row items-start justify-between gap-2 rounded-t-2xl border border-b-0 p-4 sm:items-center dark:border-zinc-700 dark:bg-muted">
      <div className="flex flex-row items-start gap-3 sm:items-center">
        <div className="text-muted-foreground">
          {isStreaming ? (
            <div className="animate-spin">
              <LoaderIcon />
            </div>
          ) : (
            <GlobeIcon />
          )}
        </div>
        <div className="flex flex-col">
          <div className="-translate-y-1 font-medium sm:translate-y-0">
            {title}
          </div>
          <div className="text-muted-foreground text-xs">{displayUrl}</div>
        </div>
      </div>
      <div className="w-8" />
    </div>
  );
};

const BrowserHeader = memo(PureBrowserHeader, (prevProps, nextProps) => {
  if (prevProps.title !== nextProps.title) {
    return false;
  }
  if (prevProps.url !== nextProps.url) {
    return false;
  }
  if (prevProps.isStreaming !== nextProps.isStreaming) {
    return false;
  }
  return true;
});

const BrowserContent = ({ url }: { url: string }) => {
  // Extract domain from URL for display
  let displayUrl = url;
  try {
    const urlObj = new URL(url);
    displayUrl = urlObj.hostname;
  } catch {
    // Keep original URL if parsing fails
  }

  return (
    <div className="flex h-[200px] flex-col items-center justify-center overflow-hidden rounded-b-2xl border border-t-0 bg-gradient-to-b from-zinc-50 to-zinc-100 dark:border-zinc-700 dark:from-zinc-900 dark:to-zinc-800">
      <div className="mb-2 text-muted-foreground">
        <GlobeIcon size={32} />
      </div>
      <div className="text-muted-foreground text-sm">Click to open browser</div>
      <div className="mt-1 max-w-[90%] truncate text-muted-foreground/60 text-xs">
        {displayUrl}
      </div>
    </div>
  );
};

// Simple button version for when artifact is visible
const BrowserToolResult = memo(
  ({
    result,
    setArtifact,
  }: {
    result: { id: string; title: string; url: string };
    isReadonly: boolean;
    setArtifact: (
      updaterFn: UIArtifact | ((currentArtifact: UIArtifact) => UIArtifact)
    ) => void;
  }) => {
    return (
      <button
        className="flex w-fit cursor-pointer flex-row items-start gap-3 rounded-xl border bg-background px-3 py-2"
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();

          const boundingBox = {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          };

          setArtifact(() => ({
            documentId: result.id,
            kind: "browser",
            content: result.url,
            title: result.title,
            isVisible: true,
            status: "idle",
            boundingBox,
          }));
        }}
        type="button"
      >
        <div className="mt-1 text-muted-foreground">
          <GlobeIcon />
        </div>
        <div className="text-left">{`Browsing "${result.title}"`}</div>
      </button>
    );
  }
);

BrowserToolResult.displayName = "BrowserToolResult";
