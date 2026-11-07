import { Compass } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="surface mx-auto my-12 max-w-md p-10 text-center shadow-sm">
    <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
      <Compass size={32} />
    </div>
    <h1 className="text-4xl font-bold text-slateDark dark:text-white">404</h1>
    <p className="mt-2 text-base text-slateDark/65 dark:text-white/65">
      The page you're looking for doesn't exist or has moved.
    </p>
    <Link
      to="/"
      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover active:scale-95"
    >
      Return to Home
    </Link>
  </div>
);

export default NotFound;
