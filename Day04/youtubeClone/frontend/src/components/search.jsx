import { ArrowLeft, Search, X } from "lucide-react";
import SpeechSearchButton from "./SpeechSearchButton.jsx";

const SearchPage = ({ open, query, setQuery, onClose, onSubmit, onSearch }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 bg-white/30 backdrop-blur-xl dark:bg-black/35">
      <div className="flex items-center gap-3 border-b border-black/10 bg-transparent px-4 py-3 dark:border-white/10">
        <button
          type="button"
          onClick={onClose}
          className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Close search"
        >
          <ArrowLeft size={18} />
        </button>

        <form onSubmit={onSubmit} className="search-glass relative flex-1">
          <Search
            className="absolute left-3 top-3 text-black/40 dark:text-white/40"
            size={17}
          />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            className="input search-glass__input relative z-10 w-full rounded-full border-0 bg-transparent pl-9 pr-12 shadow-none focus:border-transparent focus:ring-0"
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
