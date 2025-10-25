/**
 * Demo Objects Configuration
 * 
 * Defines the 5 demo objects used in the Marvin AR Morning Assistant
 * Each object has specific detection parameters, AI context, and visual styling
 * 
 * Based on PRD Appendix A specification
 */

import { DemoObjectType, DemoObjectConfig, OverlayStyle } from '../types/core';

// ============================================================================
// Visual Styles
// ============================================================================

/**
 * Color palette for AR overlays
 * Based on PRD Section 6 Design Considerations
 */
const COLORS = {
  primary: [0.53, 0.91, 0.72, 1.0] as [number, number, number, number], // #6ee7b7
  health: [1.0, 0.4, 0.4, 1.0] as [number, number, number, number],     // Health red
  nutrition: [0.55, 0.8, 0.4, 1.0] as [number, number, number, number], // Nutrition green
  work: [0.33, 0.71, 0.83, 1.0] as [number, number, number, number],    // Work blue
  departure: [1.0, 0.8, 0.2, 1.0] as [number, number, number, number],  // Departure yellow
  tech: [0.55, 0.36, 0.96, 1.0] as [number, number, number, number],    // Tech purple
  background: [0.02, 0.03, 0.07, 0.8] as [number, number, number, number], // Dark glass
} as const;

/**
 * Default overlay style template
 */
const createOverlayStyle = (
  primaryColor: [number, number, number, number],
  icon?: string
): OverlayStyle => ({
  primaryColor,
  backgroundColor: COLORS.background,
  fontSize: 24,
  icon,
  animation: 'fade',
  animationDuration: 300,
});

// ============================================================================
// Demo Object Configurations
// ============================================================================

/**
 * Medicine Bottle Configuration
 * 
 * Purpose: Health reminders and medication tracking
 * Triggers: Medication reminders, health tracking, schedule alerts
 * FR Coverage: FR-022, FR-038
 */
const MEDICINE_BOTTLE_CONFIG: DemoObjectConfig = {
  type: 'medicine_bottle',
  displayName: 'Medicine Bottle',
  
  // ML model labels that map to medicine bottles
  mlLabels: [
    'bottle',
    'medicine_bottle',
    'pill_bottle',
    'prescription_bottle',
    'vitamin_bottle',
  ],
  
  // Confidence threshold (95% as per task 1.5 requirement)
  confidenceThreshold: 0.95,
  
  // Actions triggered when detected
  triggers: [
    'medication_reminder',
    'health_tracking',
    'schedule_alert',
    'dosage_confirmation',
  ],
  
  // AI context for Gemini processing
  aiContext: `
    You are assisting with health and medication management.
    When the user interacts with their medicine, provide:
    - Medication schedule reminders
    - Dosage confirmation
    - Health tracking updates
    - Time-based proactive reminders
    Focus on safety and clarity for health-critical actions.
  `.trim(),
  
  // Voice prompts
  voicePrompts: [
    'Medicine reminder',
    'Show health schedule',
    'Track medication',
    'When did I last take this?',
    'Set medication reminder',
  ],
  
  // Visual styling
  overlayStyle: createOverlayStyle(COLORS.health, 'health'),
  
  // Enable persistent location tracking
  enableSpatialMemory: true,
};

/**
 * Breakfast Bowl Configuration
 * 
 * Purpose: Nutrition tracking and recipe suggestions
 * Triggers: Nutrition analysis, recipe suggestions, calorie tracking
 * FR Coverage: FR-023, FR-039
 */
const BREAKFAST_BOWL_CONFIG: DemoObjectConfig = {
  type: 'breakfast_bowl',
  displayName: 'Breakfast Bowl',
  
  mlLabels: [
    'bowl',
    'food_bowl',
    'cereal_bowl',
    'breakfast_bowl',
    'dish',
  ],
  
  confidenceThreshold: 0.92,
  
  triggers: [
    'nutrition_analysis',
    'recipe_suggestions',
    'calorie_tracking',
    'meal_logging',
    'dietary_guidance',
  ],
  
  aiContext: `
    You are assisting with nutrition and healthy eating.
    When the user interacts with their breakfast, provide:
    - Nutrition information and calorie estimates
    - Healthy recipe suggestions
    - Dietary guidance based on preferences
    - Meal tracking and logging
    Be encouraging and focus on practical, healthy choices.
  `.trim(),
  
  voicePrompts: [
    'What\'s for breakfast?',
    'Show nutrition info',
    'Suggest healthy options',
    'How many calories?',
    'Recipe suggestions',
  ],
  
  overlayStyle: createOverlayStyle(COLORS.nutrition, 'food'),
  
  enableSpatialMemory: false, // Breakfast location doesn't need persistent tracking
};

/**
 * Laptop Configuration
 * 
 * Purpose: Calendar integration and work briefing
 * Triggers: Calendar briefing, meeting prep, day overview
 * FR Coverage: FR-024, FR-036, FR-037
 */
const LAPTOP_CONFIG: DemoObjectConfig = {
  type: 'laptop',
  displayName: 'Laptop',
  
  mlLabels: [
    'laptop',
    'computer',
    'notebook_computer',
    'macbook',
  ],
  
  confidenceThreshold: 0.94,
  
  triggers: [
    'calendar_briefing',
    'meeting_preparation',
    'day_overview',
    'schedule_check',
    'work_mode_activation',
  ],
  
  aiContext: `
    You are assisting with work and productivity.
    When the user sits down at their laptop, provide:
    - Day overview with calendar briefing
    - Meeting preparation and context
    - Priority tasks for the day
    - Schedule conflict alerts
    Be concise and focus on actionable information.
  `.trim(),
  
  voicePrompts: [
    'What\'s on my schedule?',
    'Brief me on today',
    'Show my meetings',
    'Any conflicts?',
    'Prepare for next meeting',
  ],
  
  overlayStyle: createOverlayStyle(COLORS.work, 'calendar'),
  
  enableSpatialMemory: true, // Remember work station location
};

/**
 * Keys Configuration
 * 
 * Purpose: Location tracking and departure checklist
 * Triggers: Departure checklist, location tracking, reminder alerts
 * FR Coverage: FR-025, FR-031
 */
const KEYS_CONFIG: DemoObjectConfig = {
  type: 'keys',
  displayName: 'Keys',
  
  mlLabels: [
    'keys',
    'key_ring',
    'car_keys',
    'house_keys',
  ],
  
  confidenceThreshold: 0.93,
  
  triggers: [
    'departure_checklist',
    'location_tracking',
    'reminder_alert',
    'navigation_guidance',
  ],
  
  aiContext: `
    You are assisting with departure preparation and item location.
    When the user looks for their keys, provide:
    - Last known location with AR guidance arrow
    - Departure checklist (keys, wallet, phone, etc.)
    - Commute time and weather briefing
    - Any items they might be forgetting
    Be helpful for reducing morning stress.
  `.trim(),
  
  voicePrompts: [
    'Where are my keys?',
    'Ready to leave',
    'Show departure checklist',
    'Find my keys',
    'What should I bring?',
  ],
  
  overlayStyle: createOverlayStyle(COLORS.departure, 'location'),
  
  enableSpatialMemory: true, // Critical for "where are my keys" feature
};

/**
 * Phone Configuration
 * 
 * Purpose: Connectivity status and backup interface
 * Triggers: Connectivity check, backup interface, device sync
 * FR Coverage: FR-026, FR-058, FR-059
 */
const PHONE_CONFIG: DemoObjectConfig = {
  type: 'phone',
  displayName: 'Phone',
  
  mlLabels: [
    'phone',
    'smartphone',
    'mobile_phone',
    'cell_phone',
    'iphone',
    'android',
  ],
  
  confidenceThreshold: 0.94,
  
  triggers: [
    'connectivity_check',
    'backup_interface',
    'device_sync',
    'notification_summary',
  ],
  
  aiContext: `
    You are assisting with device connectivity and notifications.
    When the user interacts with their phone, provide:
    - Connectivity status for AR glasses
    - Backup interface availability
    - Device synchronization status
    - Summary of important notifications
    Be brief and technical when appropriate.
  `.trim(),
  
  voicePrompts: [
    'Check connectivity',
    'Sync devices',
    'Backup mode',
    'Show notifications',
    'Connection status',
  ],
  
  overlayStyle: createOverlayStyle(COLORS.tech, 'phone'),
  
  enableSpatialMemory: false, // Phone moves frequently
};

// ============================================================================
// Exported Configuration
// ============================================================================

/**
 * Complete demo objects configuration map
 * Maps object type to its configuration
 */
export const DEMO_OBJECTS_CONFIG: Record<DemoObjectType, DemoObjectConfig> = {
  medicine_bottle: MEDICINE_BOTTLE_CONFIG,
  breakfast_bowl: BREAKFAST_BOWL_CONFIG,
  laptop: LAPTOP_CONFIG,
  keys: KEYS_CONFIG,
  phone: PHONE_CONFIG,
};

/**
 * Array of all demo object types for iteration
 */
export const DEMO_OBJECT_TYPES: DemoObjectType[] = [
  'medicine_bottle',
  'breakfast_bowl',
  'laptop',
  'keys',
  'phone',
];

/**
 * Get configuration for a specific object type
 */
export function getDemoObjectConfig(type: DemoObjectType): DemoObjectConfig {
  const config = DEMO_OBJECTS_CONFIG[type];
  if (!config) {
    throw new Error(`No configuration found for demo object type: ${type}`);
  }
  return config;
}

/**
 * Get object type from ML model label
 * Returns null if label doesn't match any configured object
 */
export function getObjectTypeFromLabel(label: string): DemoObjectType | null {
  const normalizedLabel = label.toLowerCase().trim();
  
  for (const [type, config] of Object.entries(DEMO_OBJECTS_CONFIG)) {
    if (config.mlLabels.some(mlLabel => 
      mlLabel.toLowerCase() === normalizedLabel
    )) {
      return type as DemoObjectType;
    }
  }
  
  return null;
}

/**
 * Validate if confidence meets threshold for object type
 */
export function meetsConfidenceThreshold(
  type: DemoObjectType,
  confidence: number
): boolean {
  const config = getDemoObjectConfig(type);
  return confidence >= config.confidenceThreshold;
}

/**
 * Get all ML labels across all demo objects
 * Useful for configuring ML component
 */
export function getAllMLLabels(): string[] {
  const labels = new Set<string>();
  
  for (const config of Object.values(DEMO_OBJECTS_CONFIG)) {
    config.mlLabels.forEach(label => labels.add(label));
  }
  
  return Array.from(labels);
}

// ============================================================================
// Demo Mode Configuration
// ============================================================================

/**
 * Demo environment setup configuration
 * Based on PRD Appendix E
 */
export interface DemoEnvironmentSetup {
  /** Physical desk dimensions */
  deskDimensions: { width: number; depth: number };
  
  /** Lighting configuration */
  lighting: {
    temperature: number; // Kelvin
    brightness: number;  // Lux
  };
  
  /** Object placement positions (relative to desk center) */
  objectPlacements: Record<DemoObjectType, { x: number; y: number; z: number }>;
}

/**
 * Standard demo environment configuration
 */
export const DEMO_ENVIRONMENT: DemoEnvironmentSetup = {
  deskDimensions: {
    width: 1.83,  // 6 feet in meters
    depth: 0.91,  // 3 feet in meters
  },
  
  lighting: {
    temperature: 5000, // 5000K LED panels
    brightness: 800,   // 800 lux
  },
  
  objectPlacements: {
    medicine_bottle: { x: -0.6, y: 0.05, z: -0.3 },  // Back-left
    breakfast_bowl: { x: -0.3, y: 0.05, z: 0.3 },    // Center-left, 12 inches from edge
    laptop: { x: 0.3, y: 0.05, z: 0.2 },             // Center-right
    keys: { x: -0.8, y: 0.05, z: 0.4 },              // Far left corner
    phone: { x: 0.7, y: 0.05, z: 0.3 },              // Right side
  },
};

/**
 * Export for easy access
 */
export default DEMO_OBJECTS_CONFIG;

