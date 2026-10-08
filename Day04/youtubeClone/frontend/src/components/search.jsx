import { ArrowLeft, Search, X } from "lucide-react";
import SpeechSearchButton from "./SpeechSearchButton.jsx";

const SearchPage = ({ open, query, setQuery, onClose, onSubmit, onSearch }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-white dark:bg-black">
      <div className="flex items-center gap-3 border-b border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-black">
        <button
          type="button"
          onClick={onClose}
          className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Close search"
        >
          <ArrowLeft size={18} />
        </button>

        <form onSubmit={onSubmit} className="relative flex-1">
          <Search
            className="absolute left-3 top-3 text-black/40 dark:text-white/40"
            size={17}
          />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            className="input w-full rounded-full border border-black/10 bg-white pl-9 pr-12 dark:border-white/10 dark:bg-[#111111]"
          />
          <SpeechSearchButton onSearch={onSearch} />
        </form>

        <button
          type="button"
          onClick={() => setQuery("")}
          className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Clear search"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default SearchPage;
