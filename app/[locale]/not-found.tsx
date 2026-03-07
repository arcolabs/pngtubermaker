import { Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
      <div className="text-center">
        <p className="text-sm font-mono text-base-content/50 mb-2">404</p>
        <h1 className="text-2xl font-bold text-base-content mb-4">
          Page Not Found
        </h1>
        <p className="text-base-content/60 mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/" className="btn btn-primary">
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
