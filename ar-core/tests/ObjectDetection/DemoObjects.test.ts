/**
 * Unit tests for DemoObjects configuration
 */

import {
  DEMO_OBJECTS_CONFIG,
  DEMO_OBJECT_TYPES,
  getDemoObjectConfig,
  getObjectTypeFromLabel,
  meetsConfidenceThreshold,
  getAllMLLabels,
} from '../../src/ObjectDetection/DemoObjects';

describe('DemoObjects Configuration', () => {
  describe('DEMO_OBJECTS_CONFIG', () => {
    it('should contain all 5 demo objects', () => {
      expect(Object.keys(DEMO_OBJECTS_CONFIG)).toHaveLength(5);
      expect(DEMO_OBJECTS_CONFIG).toHaveProperty('medicine_bottle');
      expect(DEMO_OBJECTS_CONFIG).toHaveProperty('breakfast_bowl');
      expect(DEMO_OBJECTS_CONFIG).toHaveProperty('laptop');
      expect(DEMO_OBJECTS_CONFIG).toHaveProperty('keys');
      expect(DEMO_OBJECTS_CONFIG).toHaveProperty('phone');
    });
    
    it('should have valid confidence thresholds (>= 0.9)', () => {
      for (const config of Object.values(DEMO_OBJECTS_CONFIG)) {
        expect(config.confidenceThreshold).toBeGreaterThanOrEqual(0.9);
        expect(config.confidenceThreshold).toBeLessThanOrEqual(1.0);
      }
    });
    
    it('should have ML labels for each object', () => {
      for (const config of Object.values(DEMO_OBJECTS_CONFIG)) {
        expect(config.mlLabels).toBeDefined();
        expect(config.mlLabels.length).toBeGreaterThan(0);
      }
    });
    
    it('should have triggers for each object', () => {
      for (const config of Object.values(DEMO_OBJECTS_CONFIG)) {
        expect(config.triggers).toBeDefined();
        expect(config.triggers.length).toBeGreaterThan(0);
      }
    });
  });
  
  describe('getDemoObjectConfig', () => {
    it('should return config for valid object type', () => {
      const config = getDemoObjectConfig('medicine_bottle');
      expect(config).toBeDefined();
      expect(config.type).toBe('medicine_bottle');
      expect(config.displayName).toBe('Medicine Bottle');
    });
    
    it('should throw error for invalid object type', () => {
      expect(() => {
        getDemoObjectConfig('invalid_type' as any);
      }).toThrow();
    });
  });
  
  describe('getObjectTypeFromLabel', () => {
    it('should return correct type for valid ML label', () => {
      expect(getObjectTypeFromLabel('medicine_bottle')).toBe('medicine_bottle');
      expect(getObjectTypeFromLabel('bowl')).toBe('breakfast_bowl');
      expect(getObjectTypeFromLabel('laptop')).toBe('laptop');
      expect(getObjectTypeFromLabel('keys')).toBe('keys');
      expect(getObjectTypeFromLabel('phone')).toBe('phone');
    });
    
    it('should be case insensitive', () => {
      expect(getObjectTypeFromLabel('MEDICINE_BOTTLE')).toBe('medicine_bottle');
      expect(getObjectTypeFromLabel('Bowl')).toBe('breakfast_bowl');
    });
    
    it('should return null for unknown label', () => {
      expect(getObjectTypeFromLabel('unknown_object')).toBeNull();
    });
  });
  
  describe('meetsConfidenceThreshold', () => {
    it('should return true when confidence meets threshold', () => {
      expect(meetsConfidenceThreshold('medicine_bottle', 0.96)).toBe(true);
      expect(meetsConfidenceThreshold('breakfast_bowl', 0.92)).toBe(true);
    });
    
    it('should return false when confidence below threshold', () => {
      expect(meetsConfidenceThreshold('medicine_bottle', 0.94)).toBe(false);
      expect(meetsConfidenceThreshold('breakfast_bowl', 0.90)).toBe(false);
    });
    
    it('should handle exact threshold value', () => {
      expect(meetsConfidenceThreshold('medicine_bottle', 0.95)).toBe(true);
    });
  });
  
  describe('getAllMLLabels', () => {
    it('should return all ML labels', () => {
      const labels = getAllMLLabels();
      expect(labels.length).toBeGreaterThan(5);
      expect(labels).toContain('bottle');
      expect(labels).toContain('bowl');
      expect(labels).toContain('laptop');
      expect(labels).toContain('keys');
      expect(labels).toContain('phone');
    });
    
    it('should not contain duplicates', () => {
      const labels = getAllMLLabels();
      const uniqueLabels = new Set(labels);
      expect(labels.length).toBe(uniqueLabels.size);
    });
  });
  
  describe('Object-Specific Configurations', () => {
    describe('Medicine Bottle', () => {
      const config = DEMO_OBJECTS_CONFIG.medicine_bottle;
      
      it('should have correct configuration', () => {
        expect(config.type).toBe('medicine_bottle');
        expect(config.displayName).toBe('Medicine Bottle');
        expect(config.confidenceThreshold).toBe(0.95);
        expect(config.enableSpatialMemory).toBe(true);
      });
      
      it('should have health-related triggers', () => {
        expect(config.triggers).toContain('medication_reminder');
        expect(config.triggers).toContain('health_tracking');
      });
    });
    
    describe('Breakfast Bowl', () => {
      const config = DEMO_OBJECTS_CONFIG.breakfast_bowl;
      
      it('should have correct configuration', () => {
        expect(config.type).toBe('breakfast_bowl');
        expect(config.displayName).toBe('Breakfast Bowl');
        expect(config.confidenceThreshold).toBe(0.92);
        expect(config.enableSpatialMemory).toBe(false);
      });
      
      it('should have nutrition-related triggers', () => {
        expect(config.triggers).toContain('nutrition_analysis');
        expect(config.triggers).toContain('recipe_suggestions');
      });
    });
    
    describe('Laptop', () => {
      const config = DEMO_OBJECTS_CONFIG.laptop;
      
      it('should have correct configuration', () => {
        expect(config.type).toBe('laptop');
        expect(config.displayName).toBe('Laptop');
        expect(config.confidenceThreshold).toBe(0.94);
        expect(config.enableSpatialMemory).toBe(true);
      });
      
      it('should have work-related triggers', () => {
        expect(config.triggers).toContain('calendar_briefing');
        expect(config.triggers).toContain('meeting_preparation');
      });
    });
    
    describe('Keys', () => {
      const config = DEMO_OBJECTS_CONFIG.keys;
      
      it('should have correct configuration', () => {
        expect(config.type).toBe('keys');
        expect(config.displayName).toBe('Keys');
        expect(config.confidenceThreshold).toBe(0.93);
        expect(config.enableSpatialMemory).toBe(true);
      });
      
      it('should have location-related triggers', () => {
        expect(config.triggers).toContain('departure_checklist');
        expect(config.triggers).toContain('location_tracking');
      });
    });
    
    describe('Phone', () => {
      const config = DEMO_OBJECTS_CONFIG.phone;
      
      it('should have correct configuration', () => {
        expect(config.type).toBe('phone');
        expect(config.displayName).toBe('Phone');
        expect(config.confidenceThreshold).toBe(0.94);
        expect(config.enableSpatialMemory).toBe(false);
      });
      
      it('should have connectivity-related triggers', () => {
        expect(config.triggers).toContain('connectivity_check');
        expect(config.triggers).toContain('device_sync');
      });
    });
  });
  
  describe('Visual Styling', () => {
    it('should have overlay style for each object', () => {
      for (const config of Object.values(DEMO_OBJECTS_CONFIG)) {
        expect(config.overlayStyle).toBeDefined();
        expect(config.overlayStyle.primaryColor).toHaveLength(4);
        expect(config.overlayStyle.backgroundColor).toHaveLength(4);
        expect(config.overlayStyle.fontSize).toBeGreaterThan(0);
      }
    });
    
    it('should have valid RGBA color values (0-1)', () => {
      for (const config of Object.values(DEMO_OBJECTS_CONFIG)) {
        const { primaryColor, backgroundColor } = config.overlayStyle;
        
        for (const component of primaryColor) {
          expect(component).toBeGreaterThanOrEqual(0);
          expect(component).toBeLessThanOrEqual(1);
        }
        
        for (const component of backgroundColor) {
          expect(component).toBeGreaterThanOrEqual(0);
          expect(component).toBeLessThanOrEqual(1);
        }
      }
    });
  });
});

