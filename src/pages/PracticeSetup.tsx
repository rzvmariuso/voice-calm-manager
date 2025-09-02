import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Building2 } from "lucide-react";

interface BusinessHours {
  [key: string]: {
    open?: string;
    close?: string;
    closed?: boolean;
  };
}

export default function PracticeSetup() {
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    aiPrompt: "Sie sind ein freundlicher AI-Assistent für Terminbuchungen. Helfen Sie Patienten dabei, Termine zu buchen und allgemeine Fragen zu beantworten."
  });

  const [businessHours, setBusinessHours] = useState<BusinessHours>({
    monday: { open: "09:00", close: "17:00" },
    tuesday: { open: "09:00", close: "17:00" },
    wednesday: { open: "09:00", close: "17:00" },
    thursday: { open: "09:00", close: "17:00" },
    friday: { open: "09:00", close: "17:00" },
    saturday: { closed: true },
    sunday: { closed: true }
  });

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Check if user already has a practice
    const checkExistingPractice = async () => {
      try {
        const { data, error } = await supabase
          .from('practices')
          .select('id')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking practice:', error);
        } else if (data) {
          // User already has a practice, redirect to dashboard
          navigate("/");
          return;
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setCheckingExisting(false);
      }
    };

    checkExistingPractice();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('practices')
        .insert({
          owner_id: user.id,
          name: formData.name,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          business_hours: businessHours,
          ai_prompt: formData.aiPrompt
        });

      if (error) throw error;

      toast({
        title: "Praxis erfolgreich eingerichtet!",
        description: "Sie können jetzt Ihr Dashboard nutzen.",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Fehler beim Einrichten",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessHourChange = (day: string, field: string, value: string | boolean) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  if (checkingExisting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-elegant">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Praxis einrichten</CardTitle>
            <CardDescription>
              Richten Sie Ihre Praxis für den AI-TerminAgent ein
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Praxisname *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="space-y-4">
                <Label>Öffnungszeiten</Label>
                {Object.entries(businessHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center space-x-4">
                    <div className="w-20 text-sm capitalize">{day === 'monday' ? 'Montag' : 
                      day === 'tuesday' ? 'Dienstag' :
                      day === 'wednesday' ? 'Mittwoch' :
                      day === 'thursday' ? 'Donnerstag' :
                      day === 'friday' ? 'Freitag' :
                      day === 'saturday' ? 'Samstag' : 'Sonntag'}</div>
                    <input
                      type="checkbox"
                      checked={!hours.closed}
                      onChange={(e) => handleBusinessHourChange(day, 'closed', !e.target.checked)}
                      className="mr-2"
                    />
                    {!hours.closed && (
                      <>
                        <Input
                          type="time"
                          value={hours.open || "09:00"}
                          onChange={(e) => handleBusinessHourChange(day, 'open', e.target.value)}
                          className="w-24"
                        />
                        <span>bis</span>
                        <Input
                          type="time"
                          value={hours.close || "17:00"}
                          onChange={(e) => handleBusinessHourChange(day, 'close', e.target.value)}
                          className="w-24"
                        />
                      </>
                    )}
                    {hours.closed && <span className="text-muted-foreground">Geschlossen</span>}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="aiPrompt">AI-Assistent Anweisungen</Label>
                <Textarea
                  id="aiPrompt"
                  value={formData.aiPrompt}
                  onChange={(e) => setFormData({...formData, aiPrompt: e.target.value})}
                  rows={4}
                  placeholder="Anweisungen für den AI-Assistenten..."
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Praxis einrichten
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}