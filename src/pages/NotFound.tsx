import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="max-w-md w-full shadow-soft">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
            404
          </h1>
          
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Seite nicht gefunden
          </h2>
          
          <p className="text-muted-foreground mb-8">
            Die angeforderte Seite konnte nicht gefunden werden. 
            Möglicherweise wurde sie verschoben oder gelöscht.
          </p>
          
          <Button asChild className="bg-gradient-primary text-white shadow-glow">
            <Link to="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Zurück zum Dashboard
            </Link>
          </Button>
          
          <p className="text-xs text-muted-foreground mt-6">
            Route: {location.pathname}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
