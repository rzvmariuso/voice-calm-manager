/**
 * Industry-specific configurations and recommendations
 * Used throughout the app to customize UX based on practice type
 */

export interface IndustryConfig {
  dashboardMetrics: string[];
  recommendedReminders: {
    type: string;
    interval: string;
    description: string;
  }[];
  appointmentDurations: {
    service: string;
    duration: number;
  }[];
  aiPromptEnhancements: string;
  quickFilters: string[];
}

export const INDUSTRY_CONFIGS: Record<string, IndustryConfig> = {
  dentist: {
    dashboardMetrics: [
      'Prophylaxe-Quote',
      'Durchschnittliche Behandlungsdauer',
      'Rückkehr-Rate (6 Monate)',
      'Notfall-Termine'
    ],
    recommendedReminders: [
      {
        type: 'Prophylaxe',
        interval: '6 Monate',
        description: 'Automatische Erinnerung für Kontrolltermine'
      },
      {
        type: 'Zahnreinigung',
        interval: '6 Monate',
        description: 'Professionelle Zahnreinigung'
      }
    ],
    appointmentDurations: [
      { service: 'Kontrolle', duration: 30 },
      { service: 'Prophylaxe', duration: 60 },
      { service: 'Zahnreinigung', duration: 45 },
      { service: 'Füllungen', duration: 60 },
      { service: 'Wurzelbehandlung', duration: 90 }
    ],
    aiPromptEnhancements: 'Betone Prävention und regelmäßige Kontrollen. Erkläre Behandlungen verständlich. Frage nach Schmerzempfinden.',
    quickFilters: ['Heute', 'Prophylaxe fällig', 'Notfälle', 'Neue Patienten']
  },
  
  physiotherapy: {
    dashboardMetrics: [
      'Rezept-Tracking',
      'Behandlungsserien',
      'Erfolgsquote nach Behandlung',
      'Durchschnittliche Sitzungen pro Patient'
    ],
    recommendedReminders: [
      {
        type: 'Folgebehandlung',
        interval: '1 Woche',
        description: 'Nächste Therapiesitzung'
      },
      {
        type: 'Rezept abgelaufen',
        interval: 'Bei Ablauf',
        description: 'Neue Verordnung benötigt'
      }
    ],
    appointmentDurations: [
      { service: 'Erstbehandlung', duration: 60 },
      { service: 'Krankengymnastik', duration: 30 },
      { service: 'Manuelle Therapie', duration: 30 },
      { service: 'Massage', duration: 30 },
      { service: 'Lymphdrainage', duration: 45 }
    ],
    aiPromptEnhancements: 'Frage nach bestehenden Beschwerden und Vorerkrankungen. Erkläre Übungen klar. Motiviere zur Mitarbeit.',
    quickFilters: ['Heute', 'Rezepte', 'Behandlungsserien', 'Erstpatienten']
  },

  massage: {
    dashboardMetrics: [
      'Stammkunden-Quote',
      'Beliebte Zeitfenster',
      'Paket-Buchungen',
      'Durchschnittliche Behandlungsdauer'
    ],
    recommendedReminders: [
      {
        type: 'Wellness-Termin',
        interval: '4 Wochen',
        description: 'Regelmäßige Entspannung'
      },
      {
        type: 'Paket-Ablauf',
        interval: 'Bei Ablauf',
        description: 'Restguthaben nutzen'
      }
    ],
    appointmentDurations: [
      { service: 'Rückenmassage', duration: 30 },
      { service: 'Ganzkörpermassage', duration: 60 },
      { service: 'Hot-Stone', duration: 75 },
      { service: 'Aromatherapie', duration: 60 },
      { service: 'Sportmassage', duration: 45 }
    ],
    aiPromptEnhancements: 'Schaffe eine entspannte Atmosphäre. Frage nach Präferenzen (Druck, Öl). Betone Wellbeing.',
    quickFilters: ['Heute', 'Stammkunden', 'Neue Kunden', 'Pakete']
  },

  general: {
    dashboardMetrics: [
      'Gesamtzahl Patienten',
      'Termine heute',
      'Auslastung',
      'No-Show Rate'
    ],
    recommendedReminders: [
      {
        type: 'Folgetermin',
        interval: 'Individuell',
        description: 'Nächster Termin'
      },
      {
        type: 'Jahres-Checkup',
        interval: '1 Jahr',
        description: 'Jährliche Kontrolle'
      }
    ],
    appointmentDurations: [
      { service: 'Erstgespräch', duration: 30 },
      { service: 'Behandlung', duration: 45 },
      { service: 'Kontrolle', duration: 15 },
      { service: 'Beratung', duration: 30 }
    ],
    aiPromptEnhancements: 'Sei professionell und freundlich. Frage nach dem Anliegen. Biete Hilfe an.',
    quickFilters: ['Heute', 'Diese Woche', 'Neue Patienten', 'Folgethermine']
  }
};

/**
 * Get industry-specific configuration
 */
export function getIndustryConfig(practiceType: string): IndustryConfig {
  return INDUSTRY_CONFIGS[practiceType] || INDUSTRY_CONFIGS.general;
}

/**
 * Get industry-specific AI prompt enhancements
 */
export function getEnhancedAIPrompt(basePrompt: string, practiceType: string): string {
  const config = getIndustryConfig(practiceType);
  return `${basePrompt}\n\nBranchenspezifische Anweisungen: ${config.aiPromptEnhancements}`;
}

/**
 * Get recommended appointment duration for a service
 */
export function getRecommendedDuration(service: string, practiceType: string): number {
  const config = getIndustryConfig(practiceType);
  const match = config.appointmentDurations.find(
    s => s.service.toLowerCase() === service.toLowerCase()
  );
  return match?.duration || 30; // Default 30 minutes
}