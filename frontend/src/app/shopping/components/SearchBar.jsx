"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Search } from "lucide-react";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { generateSlug } from "@/utils/slug";

export default function SearchBar({ onQuery, onSearch }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const timeoutRef = useRef(null);
  const containerRef = useRef(null);
  const listRef = useRef([]);

  // --- Debounce search ---
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    setLoading(true);

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      const data = await onQuery(query);
      setResults(data["products"]);
      setLoading(false);
      setActiveIndex(0);
      console.log(data);
    }, 400);
  }, [query]);

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Keyboard Navigation ---
  const handleKeyDown = (e) => {
    if (!showDropdown) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    }
    if (e.key === "Enter") {
      // const item = results[activeIndex];
      // if (item) window.location.href = `/product/${item.slug}`;
      onSearch(query);
      setShowDropdown(false);
    }
    if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <InputGroup>
        <InputGroupInput
          placeholder="Type to search..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onKeyDown={handleKeyDown}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            variant="secondary"
            className={"bg-primary text-white"}
            onClick={() => onSearch(query)}
          >
            <Search className="text-white" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {/* <Input
        placeholder="Search products..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        onKeyDown={handleKeyDown}
        className="w-full rounded-xl"
      /> */}

      <AnimatePresence>
        {showDropdown && query && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute mt-2 w-full z-50"
          >
            <Card className="p-3 shadow-lg rounded-xl overflow-hidden border bg-white dark:bg-neutral-900">
              {/* Skeletons */}
              {loading && (
                <div className="flex w-full items-center justify-center">
                  <Spinner className="size-8 text-blue-500" />
                </div>
              )}

              {!loading && results?.length === 0 && (
                <div className="p-3 text-sm text-muted-foreground">
                  No results found.
                </div>
              )}

              {/* Results List */}
              <div className="flex flex-col divide-y max-h-96 overflow-y-scroll">
                {!loading &&
                  results?.map((item, index) => (
                    <Link
                      key={item.id}
                      href={`/shopping/product/${generateSlug(item.name)}-${
                        item.id
                      }`}
                      ref={(el) => (listRef.current[index] = el)}
                      className={`py-2 px-2 text-sm rounded-lg transition flex items-center gap-3 ${
                        index === activeIndex ? "bg-accent" : "hover:bg-accent"
                      }`}
                      onClick={() => setShowDropdown(false)}
                    >
                      {/* {item.thumbnail ? (
                      <img src={item.thumbnail} className="w-10 h-10 rounded-md object-cover" alt={item.name} />
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded-md" />
                    )} */}

                      <div className="flex flex-col">
                        <span className="font-medium line-clamp-1">
                          {item.name}
                        </span>
                        {/* <span className="text-xs text-muted-foreground">${item.price}</span> */}
                      </div>
                    </Link>
                  ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Example usage:
// <SearchBarWithDropdown onSearch={async (q) => fetch(`/api/search?q=${q}`).then(r=>r.json())} />:
// <SearchBarWithDropdown onSearch={async (q) => fetch(`/api/search?q=${q}`).then(r=>r.json())} />

// export default function SearchBar() {
//   return (
//     <div>
//       <InputGroup>
//         <InputGroupInput placeholder="Type to search..." />
//         <InputGroupAddon align="inline-end">
//           <InputGroupButton variant="secondary"  className={"bg-primary text-white"}><Search className="text-white"/></InputGroupButton>
//         </InputGroupAddon>
//       </InputGroup>
//     </div>
//   );
// }
