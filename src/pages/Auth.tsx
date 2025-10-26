import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Bot, Loader2, Eye, EyeOff, Shield } from "lucide-react";
import { validatePasswordStrength, getPasswordStrengthLabel, getPasswordStrengthColor } from "@/lib/passwordValidation";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [], isValid: false });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Validate password on change
  useEffect(() => {
    if (password) {
      const strength = validatePasswordStrength(password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ score: 0, feedback: [], isValid: false });
    }
  }, [password]);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate privacy consent
    if (!privacyConsent) {
      toast({
        title: "Datenschutz-Zustimmung erforderlich",
        description: "Bitte stimmen Sie der Datenschutzerklärung zu.",
        variant: "destructive",
      });
      return;
    }

    // Validate password strength
    if (!passwordStrength.isValid) {
      toast({
        title: "Passwort zu schwach",
        description: passwordStrength.feedback.join('. '),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            privacy_consent: true,
            consent_date: new Date().toISOString()
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Registrierung erfolgreich!",
        description: "Bitte überprüfen Sie Ihre E-Mail für den Bestätigungslink.",
      });
    } catch (error: any) {
      toast({
        title: "Registrierung fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Anmeldung erfolgreich!",
        description: "Willkommen zurück!",
      });
    } catch (error: any) {
      toast({
        title: "Anmeldung fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      toast({
        title: "E-Mail erforderlich",
        description: "Bitte geben Sie Ihre E-Mail ein.",
        variant: "destructive",
      });
      return;
    }
    setResending(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: redirectUrl },
      });
      if (error) throw error;
      toast({
        title: "E-Mail gesendet",
        description: "Bitte prüfen Sie Ihren Posteingang (und Spam).",
      });
    } catch (error: any) {
      toast({
        title: "Senden fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle px-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-background border-2 border-primary/20 rounded-xl flex items-center justify-center overflow-hidden">
              <img 
                src="/lovable-uploads/f8bf1ba1-4dee-42dd-9c1d-543ca3de4a53.png" 
                alt="Voxcal Logo" 
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Voxcal</CardTitle>
          <CardDescription>
            AI-gestützte Terminbuchung für Ihre Praxis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Anmelden</TabsTrigger>
              <TabsTrigger value="signup">Registrieren</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">E-Mail</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Passwort</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Anmelden
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">E-Mail</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Passwort</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Passwortstärke:
                        </span>
                        <span className={`text-xs font-medium ${getPasswordStrengthColor(passwordStrength.score)}`}>
                          {getPasswordStrengthLabel(passwordStrength.score)}
                        </span>
                      </div>
                      <Progress value={(passwordStrength.score / 4) * 100} className="h-1.5" />
                      {passwordStrength.feedback.length > 0 && (
                        <div className="space-y-1">
                          {passwordStrength.feedback.map((feedback, idx) => (
                            <p key={idx} className={`text-xs ${passwordStrength.isValid ? 'text-green-600' : 'text-muted-foreground'}`}>
                              {feedback}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="privacy"
                      checked={privacyConsent}
                      onCheckedChange={(checked) => setPrivacyConsent(!!checked)}
                    />
                    <Label htmlFor="privacy" className="text-sm leading-tight">
                      Ich stimme der{" "}
                      <Link to="/privacy" className="text-primary hover:underline">
                        Datenschutzerklärung
                      </Link>{" "}
                      zu (DSGVO-konform)
                    </Label>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
                    <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Alle Daten werden verschlüsselt in der EU gespeichert.{" "}
                      <Link to="/compliance" className="text-primary hover:underline">
                        Mehr zur Sicherheit
                      </Link>
                    </p>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading || !privacyConsent || !passwordStrength.isValid}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Registrieren
                </Button>
                <div className="pt-2">
                  <Button type="button" variant="secondary" className="w-full" onClick={handleResendConfirmation} disabled={resending || !email}>
                    {resending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Bestätigungs-E-Mail erneut senden
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}