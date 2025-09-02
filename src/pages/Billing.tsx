import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { Check, Crown, Zap, Shield, ArrowLeft, Loader2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";

export default function Billing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Anmeldung erforderlich</h1>
          <p className="text-muted-foreground mb-4">
            Bitte melden Sie sich an, um Ihre Subscription zu verwalten.
          </p>
          <Link to="/auth">
            <Button>Zur Anmeldung</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1 p-6 bg-background">
            <Loading text="Pläne werden geladen..." />
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

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 p-6 bg-background">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <SidebarTrigger />
              <div>
                <h1 className="text-3xl font-bold text-gradient">
                  Abonnement & Billing
                </h1>
                <p className="text-muted-foreground">
                  Verwalten Sie Ihr Abonnement und Rechnungen
                </p>
              </div>
            </div>

            {/* Current Subscription Status */}
            {isSubscribed && currentPlan && (
              <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Crown className="w-6 h-6 text-primary" />
                      <div>
                        <CardTitle className="text-xl">Aktives Abonnement</CardTitle>
                        <CardDescription>
                          Sie haben ein aktives {currentPlan.name} Abonnement
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-success text-success-foreground">
                      Aktiv
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Plan</p>
                      <p className="font-semibold">{currentPlan.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Max. Patienten</p>
                      <p className="font-semibold">
                        {currentPlan.max_patients === -1 ? "Unbegrenzt" : currentPlan.max_patients}
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
                  <div className="flex gap-4">
                    <Button 
                      onClick={openCustomerPortal}
                      disabled={loading}
                      className="button-gradient"
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
                    >
                      {refreshing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Status aktualisieren
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Billing Period Toggle */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center bg-muted rounded-lg p-1">
                <Button
                  variant={billingPeriod === 'monthly' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setBillingPeriod('monthly')}
                  className="rounded-md"
                >
                  Monatlich
                </Button>
                <Button
                  variant={billingPeriod === 'yearly' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setBillingPeriod('yearly')}
                  className="rounded-md"
                >
                  Jährlich
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Bis zu 17% sparen
                  </Badge>
                </Button>
              </div>
            </div>

            {/* Pricing Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {plans.map((plan, index) => {
                const isCurrentPlan = currentPlan?.id === plan.id;
                const price = billingPeriod === 'yearly' ? plan.price_yearly : plan.price_monthly;
                const yearlyDiscount = getYearlyDiscount(plan.price_monthly, plan.price_yearly);
                const isProfessional = plan.name === 'Professional';

                return (
                  <Card 
                    key={plan.id} 
                    className={`relative ${isProfessional ? 'border-2 border-primary shadow-glow' : ''} ${isCurrentPlan ? 'border-success bg-success/5' : ''}`}
                  >
                    {isProfessional && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">
                          <Zap className="w-3 h-3 mr-1" />
                          Beliebtester Plan
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center">
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <div className="space-y-2">
                        <div className="text-3xl font-bold">
                          €{formatPrice(price)}
                          <span className="text-lg font-normal text-muted-foreground">
                            /{billingPeriod === 'yearly' ? 'Jahr' : 'Monat'}
                          </span>
                        </div>
                        {billingPeriod === 'yearly' && (
                          <Badge variant="outline" className="text-success border-success">
                            {yearlyDiscount}% Ersparnis
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {(plan.features as string[]).map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-success" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="pt-4">
                        {isCurrentPlan ? (
                          <Button variant="outline" className="w-full" disabled>
                            Aktueller Plan
                          </Button>
                        ) : (
                          <Button
                            onClick={() => createCheckout(plan.id, billingPeriod)}
                            disabled={loading}
                            className={`w-full ${isProfessional ? 'button-gradient' : ''}`}
                            variant={isProfessional ? 'default' : 'outline'}
                          >
                            {loading ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : null}
                            Plan wählen
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Back to Dashboard */}
            <div className="text-center">
              <Link to="/">
                <Button variant="ghost">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Zurück zum Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}