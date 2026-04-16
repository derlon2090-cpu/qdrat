"use client";

import { Search } from "lucide-react";

export function SearchTrigger() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("miyaar:open-search"))}
      className="search-btn-header group"
      aria-label="افتح البحث"
    >
      <Search className="h-5 w-5 text-[#123B7A] transition group-hover:scale-110" />
    </button>
  );
}
