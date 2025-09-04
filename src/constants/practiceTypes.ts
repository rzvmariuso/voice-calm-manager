export const PRACTICE_TYPES = {
  dentist: {
    id: 'dentist',
    name: 'Zahnarztpraxis',
    description: 'Zahnmedizinische Behandlungen und Prophylaxe',
    icon: '🦷',
    color: 'hsl(200, 95%, 45%)',
    defaultServices: [
      { name: 'Kontrolle & Beratung', description: 'Routineuntersuchung und Beratung', duration: 30 },
      { name: 'Prophylaxe', description: 'Professionelle Zahnreinigung', duration: 45 },
      { name: 'Füllungstherapie', description: 'Kariesbehandlung mit Füllungen', duration: 60 },
      { name: 'Wurzelbehandlung', description: 'Endodontische Behandlung', duration: 90 },
      { name: 'Zahnersatz', description: 'Kronen, Brücken und Prothesen', duration: 120 }
    ],
    aiPrompt: 'Sie sind ein freundlicher AI-Assistent für eine Zahnarztpraxis. Helfen Sie Patienten bei der Terminbuchung für zahnmedizinische Behandlungen. Sie können über Services wie Kontrollen, Prophylaxe, Füllungen, Wurzelbehandlungen und Zahnersatz informieren. Seien Sie einfühlsam, da viele Patienten Zahnarztangst haben.'
  },
  physiotherapy: {
    id: 'physiotherapy',
    name: 'Physiotherapie',
    description: 'Krankengymnastik und therapeutische Behandlungen',
    icon: '🤸‍♂️',
    color: 'hsl(120, 60%, 45%)',
    defaultServices: [
      { name: 'Krankengymnastik', description: 'Allgemeine Krankengymnastik', duration: 30 },
      { name: 'Manuelle Therapie', description: 'Gelenkmobilisation und Weichteiltechniken', duration: 30 },
      { name: 'Massage', description: 'Klassische medizinische Massage', duration: 30 },
      { name: 'Elektrotherapie', description: 'Behandlung mit Reizstrom', duration: 20 },
      { name: 'Lymphdrainage', description: 'Manuelle Lymphdrainage', duration: 45 }
    ],
    aiPrompt: 'Sie sind ein freundlicher AI-Assistent für eine Physiotherapiepraxis. Helfen Sie Patienten bei der Terminbuchung für physiotherapeutische Behandlungen. Sie können über Services wie Krankengymnastik, manuelle Therapie, Massagen und Elektrotherapie informieren. Seien Sie motivierend und unterstützend bei der Genesung.'
  },
  massage: {
    id: 'massage',
    name: 'Massage Studio',
    description: 'Entspannungs- und Wellnessmassagen',
    icon: '💆‍♀️', 
    color: 'hsl(280, 60%, 50%)',
    defaultServices: [
      { name: 'Entspannungsmassage', description: 'Klassische Entspannungsmassage', duration: 60 },
      { name: 'Sportmassage', description: 'Massage für Sportler und aktive Menschen', duration: 45 },
      { name: 'Hot Stone Massage', description: 'Warme Steinmassage für tiefe Entspannung', duration: 90 },
      { name: 'Aromatherapie', description: 'Massage mit ätherischen Ölen', duration: 75 },
      { name: 'Paarmassage', description: 'Massage für zwei Personen', duration: 60 }
    ],
    aiPrompt: 'Sie sind ein freundlicher AI-Assistent für ein Massage Studio. Helfen Sie Klienten bei der Terminbuchung für entspannende Massagen und Wellnessbehandlungen. Sie können über verschiedene Massagearten wie Entspannungsmassagen, Sportmassagen, Hot Stone und Aromatherapie informieren. Schaffen Sie eine entspannte, einladende Atmosphäre.'
  },
  general: {
    id: 'general',
    name: 'Allgemeine Praxis',
    description: 'Individuelle Praxis mit anpassbaren Services',
    icon: '🏥',
    color: 'hsl(210, 25%, 45%)',
    defaultServices: [
      { name: 'Beratung', description: 'Allgemeine Beratung und Behandlung', duration: 30 },
      { name: 'Behandlung', description: 'Individuelle Behandlung', duration: 45 },
      { name: 'Nachkontrolle', description: 'Kontrolle nach Behandlung', duration: 15 }
    ],
    aiPrompt: 'Sie sind ein freundlicher AI-Assistent für eine Praxis. Helfen Sie Patienten bei der Terminbuchung und beantworten Sie allgemeine Fragen zu den angebotenen Services. Seien Sie höflich, professionell und hilfsbereit.'
  }
} as const;

export type PracticeType = keyof typeof PRACTICE_TYPES;

export interface ServiceTemplate {
  name: string;
  description: string;
  duration: number;
  price?: number;
}

export interface PracticeTypeConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  defaultServices: ServiceTemplate[];
  aiPrompt: string;
}