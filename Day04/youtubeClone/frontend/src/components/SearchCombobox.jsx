import { useEffect, useId, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { videoService } from "../api/services.ts";

export default function SearchCombobox({
  query,
  setQuery,
  onSearch,
  className,
  placeholder = "Search videos or creators",
  autoFocus = false,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const listboxId = useId();
  const normalizedQuery = query.trim();

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedQuery(normalizedQuery),
      200,
    );
    return () => window.clearTimeout(timeout);
  }, [normalizedQuery]);

  const suggestionsQuery = useQuery({
    queryKey: ["search-suggestions", debouncedQuery],
    queryFn: () => videoService.list({ query: debouncedQuery, limit: 5 }),
    enabled: isFocused && debouncedQuery.length >= 2,
    staleTime: 30_000,
  });
  const videos =
    debouncedQuery === normalizedQuery
      ? suggestionsQuery.data?.data?.videos || []
      : [];
  const options = normalizedQuery.length >= 2
    ? [
        {
          id: "search-query",
          label: `Search for "${normalizedQuery}"`,
          value: normalizedQuery,
        },
        ...videos
          .filter((video) => video.title?.trim())
          .map((video) => ({
            id: video._id,
            label: video.title,
            detail:
              video.owner?.fullName ||
              (video.owner?.username ? `@${video.owner.username}` : undefined),
            value: video.title,
          })),
      ]
    : [];
  const isListboxOpen = isFocused && options.length > 0;

  const selectOption = (option) => {
    setQuery(option.value);
    setIsFocused(false);
    setActiveIndex(-1);
    onSearch(option.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown" && options.length) {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % options.length);
    } else if (event.key === "ArrowUp" && options.length) {
      event.preventDefault();
      setActiveIndex((index) =>
        index <= 0 || index >= options.length ? options.length - 1 : index - 1,
      );
    } else if (
      event.key === "Enter" &&
      activeIndex >= 0 &&
      activeIndex < options.length
    ) {
      event.preventDefault();
      selectOption(options[activeIndex]);
    } else if (event.key === "Escape" && isListboxOpen) {
      event.preventDefault();
      setIsFocused(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="relative w-full">
      <input
        role="combobox"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-expanded={isListboxOpen}
        aria-controls={isListboxOpen ? listboxId : undefined}
        aria-activedescendant={
          activeIndex >= 0 && activeIndex < options.length
            ? `${listboxId}-option-${activeIndex}`
            : undefined
        }
        className={className}
        autoFocus={autoFocus}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(-1);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          setActiveIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
      />
      {isListboxOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Search suggestions"
          className="absolute left-0 right-0 top-full z-[70] mt-2 max-h-80 overflow-y-auto rounded-2xl border border-[#22333B]/10 bg-white py-1 shadow-xl dark:border-white/10 dark:bg-[#141C1E]"
        >
          {options.map((option, index) => (
            <div
              id={`${listboxId}-option-${index}`}
              key={option.id}
              role="option"
              aria-selected={index === activeIndex}
              onPointerDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => selectOption(option)}
              className={`cursor-pointer px-4 py-2.5 text-sm text-slateDark dark:text-white ${
                index === activeIndex
                  ? "bg-primary/10 dark:bg-white/10"
                  : "hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <span className="block truncate">{option.label}</span>
              {option.detail && (
                <span className="mt-0.5 block truncate text-xs text-slateDark/55 dark:text-white/55">
                  {option.detail}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
