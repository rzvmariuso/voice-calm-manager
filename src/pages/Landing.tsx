import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Calendar, 
  Users, 
  Shield, 
  Zap, 
  Check, 
  Star, 
  ArrowRight,
  Phone,
  Clock,
  Crown,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Landing() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: "Starter",
      price: { monthly: 29, yearly: 290 },
      description: "Perfekt für kleine Praxen",
      features: [
        "Bis zu 100 Patienten",
        "Grundlegende Terminverwaltung", 
        "DSGVO-konforme Datenspeicherung",
        "Email-Support",
        "Sichere Cloud-Speicherung"
      ],
      popular: false
    },
    {
      name: "Professional", 
      price: { monthly: 59, yearly: 590 },
      description: "Ideal für wachsende Praxen",
      features: [
        "Bis zu 500 Patienten",
        "Erweiterte Terminverwaltung",
        "KI-gestützte Terminbuchung",
        "Prioritäts-Support",
        "Erweiterte Berichte",
        "API-Zugang"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: { monthly: 99, yearly: 990 },
      description: "Für große Praxen und Kliniken", 
      features: [
        "Unbegrenzte Patienten",
        "Mehrere Praxisstandorte",
        "Premium KI-Features", 
        "Persönlicher Support-Manager",
        "Custom Integrationen",
        "Individuelle Anpassungen"
      ],
      popular: false
    }
  ];

  const features = [
    {
      icon: Bot,
      title: "KI-gestützte Terminbuchung",
      description: "Lassen Sie Ihre Patienten rund um die Uhr automatisch Termine buchen - mit fortschrittlicher KI-Technologie."
    },
    {
      icon: Calendar,
      title: "Intelligente Terminverwaltung", 
      description: "Optimieren Sie Ihre Praxisabläufe mit smarter Terminplanung und automatischen Erinnerungen."
    },
    {
      icon: Shield,
      title: "DSGVO-konforme Sicherheit",
      description: "Höchste Datenschutzstandards und sichere Verschlüsselung für alle Patientendaten."
    },
    {
      icon: Users,
      title: "Patientenverwaltung",
      description: "Verwalten Sie alle Patientendaten zentral und sicher mit automatischen Backup-Systemen."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">PraxisFlow</h1>
                <p className="text-xs text-muted-foreground">KI-Praxisverwaltung</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link to="/auth">
                <Button variant="ghost">Anmelden</Button>
              </Link>
              <Link to="/auth">
                <Button className="button-gradient">
                  Kostenlos testen
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-fade-in">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-4 h-4 mr-2" />
              Revolutionäre KI-Technologie
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gradient mb-6 leading-tight">
              Die Zukunft der<br />
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                Praxisverwaltung
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Automatisieren Sie Ihre Terminbuchung mit KI, verwalten Sie Patienten DSGVO-konform 
              und optimieren Sie Ihre Praxisabläufe - alles in einer intelligenten Cloud-Lösung.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/auth">
                <Button size="lg" className="button-gradient text-lg px-8 py-6 hover:scale-105 transition-transform duration-200">
                  <Crown className="w-5 h-5 mr-2" />
                  Jetzt kostenlos starten
                </Button>
              </Link>
              
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 hover:scale-105 transition-transform duration-200">
                <Phone className="w-5 h-5 mr-2" />
                Demo vereinbaren
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-success" />
                <span>DSGVO-konform</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-success" />
                <span>In 2 Min. einsatzbereit</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-success" />
                <span>30 Tage Geld-zurück-Garantie</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Warum über 1.000 Praxen auf PraxisFlow vertrauen
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Modernste Technologie trifft auf bewährte Praxisabläufe - 
              für mehr Effizienz und zufriedene Patienten.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-interactive shadow-soft hover:shadow-elegant transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Transparente Preise für jede Praxisgröße
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Starten Sie kostenfrei und skalieren Sie nach Bedarf. Keine versteckten Kosten.
            </p>
            
            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-muted rounded-lg p-1 mb-8">
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
                <Badge variant="secondary" className="ml-2 text-xs bg-success/20 text-success">
                  2 Monate gratis
                </Badge>
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative shadow-soft hover:shadow-elegant transition-all duration-300 ${
                  plan.popular ? 'border-2 border-primary shadow-glow scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="w-3 h-3 mr-1" />
                      Beliebtester Plan
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <div className="text-4xl font-bold">
                      €{plan.price[billingPeriod]}
                      <span className="text-lg font-normal text-muted-foreground">
                        /{billingPeriod === 'yearly' ? 'Jahr' : 'Monat'}
                      </span>
                    </div>
                    {billingPeriod === 'yearly' && (
                      <p className="text-sm text-success mt-1">
                        Sparen Sie €{(plan.price.monthly * 12) - plan.price.yearly} pro Jahr
                      </p>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-success" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link to="/auth" className="block">
                    <Button 
                      className={`w-full ${plan.popular ? 'button-gradient' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.popular ? 'Jetzt starten' : 'Plan wählen'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-primary to-secondary text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Bereit für die digitale Transformation?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Schließen Sie sich über 1.000 zufriedenen Praxen an und revolutionieren Sie 
            Ihre Patientenverwaltung noch heute.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90">
                <Crown className="w-5 h-5 mr-2" />
                Kostenlos starten
              </Button>
            </Link>
            
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-primary">
              <Phone className="w-5 h-5 mr-2" />
              Persönliche Demo
            </Button>
          </div>
          
          <p className="text-sm mt-6 opacity-75">
            Keine Kreditkarte erforderlich • 30 Tage Geld-zurück-Garantie • DSGVO-konform
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">PraxisFlow</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Die intelligente Praxisverwaltung für moderne Arztpraxen.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Produkt</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Features</a></li>
                <li><a href="#" className="hover:text-primary">Preise</a></li>
                <li><a href="#" className="hover:text-primary">API</a></li>
                <li><a href="#" className="hover:text-primary">Integrationen</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Hilfe-Center</a></li>
                <li><a href="#" className="hover:text-primary">Kontakt</a></li>
                <li><a href="#" className="hover:text-primary">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Rechtliches</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/data-protection" className="hover:text-primary">Datenschutz</Link></li>
                <li><Link to="/terms" className="hover:text-primary">AGB</Link></li>
                <li><Link to="/imprint" className="hover:text-primary">Impressum</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 PraxisFlow GmbH. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}