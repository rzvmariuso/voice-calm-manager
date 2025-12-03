import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileOptimizedContent, MobileCard } from "@/components/common/MobileOptimizedContent";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { Check, Crown, Zap, Shield, ArrowLeft, Loader2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";
import { usePatientCount } from "@/hooks/usePatientCount";

export default function Billing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const { totalPatients } = usePatientCount();
  
  const {
    subscription,
    plans,
    loading,
    refreshing,
    isSubscribed,
    currentPlan,
    createCheckout,
    openCustomerPortal,
    checkSubscription
  } = useSubscription();

  // Handle success/cancel messages from Stripe
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success) {
      toast({
        title: "Subscription erfolgreich!",
        description: "Ihre Zahlung wurde verarbeitet. Ihre Subscription ist jetzt aktiv.",
      });
      // Refresh subscription status after success
      setTimeout(() => {
        checkSubscription();
      }, 2000);
    } else if (canceled) {
      toast({
        title: "Zahlung abgebrochen",
        description: "Sie haben die Zahlung abgebrochen. Sie können es jederzeit erneut versuchen.",
        variant: "destructive",
      });
    }
  }, [searchParams, toast, checkSubscription]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4">Anmeldung erforderlich</h1>
          <p className="text-muted-foreground mb-4">
            Bitte melden Sie sich an, um Ihre Subscription zu verwalten.
          </p>
          <Link to="/auth">
            <Button className="w-full">Zur Anmeldung</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-gradient-subtle">
          <AppSidebar />
          <MobileHeader 
            title="Abrechnung"
            subtitle="Pläne werden geladen..."
            showUpgradeButton={false}
          />
          <main className="flex-1 lg:overflow-auto">
            <MobileOptimizedContent>
              <Loading text="Pläne werden geladen..." />
            </MobileOptimizedContent>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  const formatPrice = (price: number) => {
    return (price / 100).toFixed(2).replace('.', ',');
  };

  const getYearlyDiscount = (monthly: number, yearly: number) => {
    const yearlyMonthly = yearly / 12;
    const discount = ((monthly - yearlyMonthly) / monthly) * 100;
    return Math.round(discount);
  };

  // Feature translation function
  const translateFeature = (feature: string): string => {
    const translations: Record<string, string> = {
      'Basic Support': 'Basis-Support',
      'Up to 50 Patients': 'Bis zu 50 Patienten',
      'Up to 200 Patients': 'Bis zu 200 Patienten',
      'Up to 1000 Patients': 'Bis zu 1000 Patienten',
      'Unlimited Patients': 'Unbegrenzte Patienten',
      '1 Practice': '1 Praxis',
      '3 Practices': '3 Praxen',
      '10 Practices': '10 Praxen',
      'Unlimited Practices': 'Unbegrenzte Praxen',
      'AI Features': 'KI-Features',
      'All AI Features': 'Alle KI-Features',
      'Advanced AI Features': 'Erweiterte KI-Features',
      'Priority Support': 'Prioritäts-Support',
      '24/7 Support': '24/7 Support',
      'Premium Support': 'Premium-Support',
      'Custom Branding': 'Individuelle Markengestaltung',
      'Advanced Analytics': 'Erweiterte Analysen',
      'Custom Integration': 'Individuelle Integration',
      'Dedicated Account Manager': 'Persönlicher Kundenbetreuer',
      'White Label Solution': 'White-Label-Lösung',
      'API Access': 'API-Zugang',
      'SMS Reminders': 'SMS-Erinnerungen',
      'Email Notifications': 'E-Mail-Benachrichtigungen',
      'Calendar Integration': 'Kalender-Integration',
      'Patient Portal': 'Patientenportal',
      'Online Booking': 'Online-Terminbuchung',
      'Automated Workflows': 'Automatisierte Arbeitsabläufe',
      'Data Export': 'Datenexport',
      'Backup & Recovery': 'Sicherung & Wiederherstellung',
      'GDPR Compliance': 'DSGVO-Konformität',
      'Multi-language Support': 'Mehrsprachiger Support'
    };
    
    return translations[feature] || feature;
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-subtle">
        <AppSidebar />
        <MobileHeader 
          title="Abrechnung"
          subtitle="Abonnement verwalten"
          showUpgradeButton={false}
        />
        
        <main className="flex-1 lg:overflow-auto">
          <MobileOptimizedContent>
            <div className="max-w-6xl mx-auto">
              <div className="hidden lg:flex items-center gap-4 mb-8">
                <SidebarTrigger />
                <div>
                  <h1 className="text-3xl font-bold text-gradient">
                    Abonnement & Abrechnung
                  </h1>
                  <p className="text-muted-foreground">
                    Verwalten Sie Ihr Abonnement und Rechnungen
                  </p>
                </div>
              </div>

              {/* Current Subscription Status */}
              {isSubscribed && currentPlan && (
                <MobileCard className="mb-6 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <Crown className="w-6 h-6 text-primary flex-shrink-0" />
                        <div>
                          <h3 className="text-lg font-semibold">Aktives Abonnement</h3>
                          <p className="text-sm text-muted-foreground">
                            Sie haben ein aktives {currentPlan.name} Abonnement
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-success text-success-foreground">
                        Aktiv
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Plan</p>
                        <p className="font-semibold">{currentPlan.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Patienten</p>
                        <p className="font-semibold">
                          {totalPatients} / {currentPlan.max_patients === -1 ? "∞" : currentPlan.max_patients}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Verlängerung</p>
                        <p className="font-semibold">
                          {subscription?.subscription_end 
                            ? new Date(subscription.subscription_end).toLocaleDateString('de-DE')
                            : 'Unbekannt'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        onClick={openCustomerPortal}
                        disabled={loading}
                        className="button-gradient flex-1"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Shield className="w-4 h-4 mr-2" />
                        )}
                        Abonnement verwalten
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={checkSubscription}
                        disabled={refreshing}
                        className="flex-1 sm:flex-initial"
                      >
                        {refreshing ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        Status aktualisieren
                      </Button>
                    </div>
                  </div>
                </MobileCard>
              )}

              {/* Billing Period Toggle */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center bg-muted rounded-lg p-1 w-full max-w-sm mx-auto">
                  <Button
                    variant={billingPeriod === 'monthly' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setBillingPeriod('monthly')}
                    className="rounded-md flex-1 text-sm"
                  >
                    Monatlich
                  </Button>
                  <Button
                    variant={billingPeriod === 'yearly' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setBillingPeriod('yearly')}
                    className="rounded-md flex-1 text-sm"
                  >
                    <span className="truncate">Jährlich</span>
                    <Badge variant="secondary" className="ml-1 text-xs hidden sm:inline-flex">
                      17% sparen
                    </Badge>
                  </Button>
                </div>
                {billingPeriod === 'yearly' && (
                  <p className="text-xs text-muted-foreground mt-2 sm:hidden">
                    17% Ersparnis bei jährlicher Zahlung
                  </p>
                )}
              </div>

              {/* Pricing Plans */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
                {plans.map((plan, index) => {
                  const isCurrentPlan = currentPlan?.id === plan.id;
                  const price = billingPeriod === 'yearly' ? plan.price_yearly : plan.price_monthly;
                  const yearlyDiscount = getYearlyDiscount(plan.price_monthly, plan.price_yearly);
                  const isProfessional = plan.name === 'Professional';

                  return (
                    <MobileCard 
                      key={plan.id} 
                      className={`relative overflow-visible ${isProfessional ? 'border-2 border-primary shadow-glow mt-4' : ''} ${isCurrentPlan ? 'border-success bg-success/5' : ''} transition-all duration-200 hover:shadow-lg`}
                    >
                      {isProfessional && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                          <Badge className="bg-primary text-primary-foreground whitespace-nowrap px-3 py-1 shadow-sm text-xs">
                            <Zap className="w-3 h-3 mr-1" />
                            Beliebt
                          </Badge>
                        </div>
                      )}
                      
                      <div className="text-center mb-4 pt-2">
                        <h3 className="text-xl lg:text-2xl font-bold mb-2">{plan.name}</h3>
                        <div className="space-y-2">
                          <div className="text-2xl lg:text-3xl font-bold">
                            €{formatPrice(price)}
                            <span className="text-base lg:text-lg font-normal text-muted-foreground ml-1">
                              /{billingPeriod === 'yearly' ? 'Jahr' : 'Monat'}
                            </span>
                          </div>
                          {billingPeriod === 'yearly' && (
                            <Badge variant="outline" className="text-success border-success">
                              {yearlyDiscount}% Ersparnis
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-6 min-h-[120px]">
                        {(plan.features as string[]).map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                            <span className="text-sm leading-relaxed">{translateFeature(feature)}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-auto">
                        {isCurrentPlan ? (
                          <Button variant="outline" className="w-full h-11" disabled>
                            <Crown className="w-4 h-4 mr-2" />
                            Aktueller Plan
                          </Button>
                        ) : (
                          <Button
                            onClick={() => createCheckout(plan.id, billingPeriod)}
                            disabled={loading}
                            className={`w-full h-11 ${isProfessional ? 'button-gradient' : ''}`}
                            variant={isProfessional ? 'default' : 'outline'}
                          >
                            {loading ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : null}
                            Plan wählen
                          </Button>
                        )}
                      </div>
                    </MobileCard>
                  );
                })}
              </div>

              {/* User Overview */}
              <MobileCard className="mb-6 bg-muted/10">
                <div className="text-sm space-y-2">
                  <h4 className="font-semibold">Konto-Übersicht</h4>
                  <p><span className="text-muted-foreground">E-Mail:</span> {user?.email}</p>
                  <p><span className="text-muted-foreground">Plan:</span> {isSubscribed ? currentPlan?.name || 'Unbekannt' : 'Kein aktives Abonnement'}</p>
                </div>
              </MobileCard>

              {/* Back to Dashboard */}
              <div className="text-center">
                <Link to="/">
                  <Button variant="ghost" className="w-full sm:w-auto">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Zurück zum Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </MobileOptimizedContent>
        </main>
      </div>
    </SidebarProvider>
  );
}