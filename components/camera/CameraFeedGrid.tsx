"use client";

import { useState } from "react";
import { CameraFeedPlayer } from "./CameraFeedPlayer";

type FeedItem = {
  pathName: string;
  label: string;
  hasFeed: boolean;
};

export function CameraFeedGrid({ items }: { items: FeedItem[] }) {
  const withFeeds = items.filter((i) => i.hasFeed);
  const [focusedPathName, setFocusedPathName] = useState<string | null>(null);
  const [startedPathNames, setStartedPathNames] = useState<string[]>([]);
  const focusedFeed = withFeeds.find((item) => item.pathName === focusedPathName);

  const markFeedStarted = (pathName: string) => {
    setStartedPathNames((currentPaths) =>
      currentPaths.includes(pathName) ? currentPaths : [...currentPaths, pathName]
    );
  };

  const stopFeed = (pathName: string, closeFocusedFeed = false) => {
    setStartedPathNames((currentPaths) =>
      currentPaths.filter((currentPath) => currentPath !== pathName)
    );
    if (closeFocusedFeed) setFocusedPathName(null);
  };

  if (withFeeds.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        No camera feeds configured yet.
      </div>
    );
  }

  return (
    <>
      {!focusedFeed && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {withFeeds.map((item) => (
            <div
              key={item.pathName}
              role="button"
              tabIndex={0}
              aria-label={`Expand ${item.label} feed`}
              className="cursor-zoom-in rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => setFocusedPathName(item.pathName)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setFocusedPathName(item.pathName);
                }
              }}
            >
              <CameraFeedPlayer
                pathName={item.pathName}
                label={item.label}
                autoConnect={startedPathNames.includes(item.pathName)}
                onStart={() => markFeedStarted(item.pathName)}
                onStop={() => stopFeed(item.pathName)}
                onExpand={() => setFocusedPathName(item.pathName)}
              />
            </div>
          ))}
        </div>
      )}

      {focusedFeed && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Exit expanded live feed"
          className="fixed inset-0 z-[10001] flex cursor-zoom-out items-center justify-center bg-black/95 p-4 outline-none"
          onClick={() => setFocusedPathName(null)}
          onKeyDown={(event) => {
            if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setFocusedPathName(null);
            }
          }}
        >
          <div className="w-full max-w-[calc((100vh-2rem)*16/9)]">
            <CameraFeedPlayer
              pathName={focusedFeed.pathName}
              label={focusedFeed.label}
              autoConnect={startedPathNames.includes(focusedFeed.pathName)}
              onStart={() => markFeedStarted(focusedFeed.pathName)}
              onStop={() => stopFeed(focusedFeed.pathName, true)}
            />
            <p className="mt-3 text-center text-sm text-white/75">
              Click anywhere or press Escape to return to all feeds.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
