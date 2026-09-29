import { Suspense } from "react";
import LiveViewPage from "./LiveViewPage";

export default function LivePage() {
  return (
    <Suspense fallback={<div className="p-6">Loading live streams...</div>}>
      <LiveViewPage />
    </Suspense>
  );
}