
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HomeIcon } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-farm-green-light dark:from-gray-900 dark:to-gray-800">
      <div className="text-center p-8 max-w-md mx-auto bg-background/80 backdrop-blur-sm rounded-lg shadow-lg border border-border">
        <h1 className="text-6xl font-bold mb-4 text-primary">404</h1>
        <p className="text-xl text-foreground mb-6">Oops! The page you're looking for cannot be found.</p>
        <p className="text-muted-foreground mb-8">The URL <code className="bg-muted px-1 py-0.5 rounded">{location.pathname}</code> doesn't exist.</p>
        <Button asChild size="lg" className="gap-2">
          <Link to="/">
            <HomeIcon className="h-4 w-4" />
            Return to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
