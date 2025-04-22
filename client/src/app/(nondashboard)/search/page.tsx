// app/(nondashboard)/search/page.tsx
"use client";

import { Suspense } from "react";
import SearchContent from "./SearchContent";

export default function SearchPageWrapper() {
  return (
    <Suspense fallback={<div>Loading search results...</div>}>
      <SearchContent />
    </Suspense>
  );
}
