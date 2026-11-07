import { ArrowLeft, Search, X } from "lucide-react";
import SpeechSearchButton from "./SpeechSearchButton.jsx";

const SearchPage = ({ open, query, setQuery, onClose, onSubmit, onSearch }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 bg-[#EFF3F1]/90 backdrop-blur-xl dark:bg-black/75">
      <div className="flex items-center gap-3 border-b border-[#22333B]/10 bg-transparent px-4 py-3 dark:border-white/10">
        <button
          type="button"
          onClick={onClose}
          className="grid h-10 w-10 place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Close search"
        >
          <ArrowLeft size={18} className="text-slateDark dark:text-white" />
        </button>

        <form onSubmit={onSubmit} className="search-glass relative flex-1">
          <Search
            className="absolute left-3 top-3 text-slateDark/40 dark:text-white/40"
            size={17}
          />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search videos or creators"
            className="input search-glass__input relative z-10 w-full rounded-full border-0 bg-transparent pl-9 pr-12 shadow-none focus:border-transparent focus:ring-0 text-slateDark dark:text-white"
          />
          <SpeechSearchButton onSearch={onSearch} />
        </form>

        <button
          type="button"
          onClick={() => setQuery("")}
          className="grid h-10 w-10 place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Clear search"
        >
          <X size={18} className="text-slateDark dark:text-white" />
        </button>
      </div>
    </div>
  );
};

export default SearchPage;
