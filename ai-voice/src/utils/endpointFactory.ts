// Endpoint Factory - DRY utility for creating consistent API endpoints
// Eliminates repetitive validation, error handling, and response formatting

import { Request, Response } from 'express';

export interface EndpointRequest {
  body: any;
  params?: any;
  query?: any;
}

export interface EndpointResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

/**
 * Create a standardized endpoint handler with validation and error handling
 */
export function createEndpoint<R = any>(
  handler: (req: EndpointRequest) => Promise<R>,
  requiredFields: string[] = [],
  handlerName?: string
) {
  return async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();
    const endpointName = handlerName || handler.name || 'Unknown';
    
    try {
      // Validate required fields
      if (requiredFields.length > 0) {
        const missing = requiredFields.filter(field => {
          const value = req.body[field];
          return value === undefined || value === null || value === '';
        });
        
        if (missing.length > 0) {
          const response: EndpointResponse = {
            success: false,
            error: `Missing required fields: ${missing.join(', ')}`,
            timestamp: new Date().toISOString()
          };
          res.status(400).json(response);
          return;
        }
      }

      // Execute the handler
      const response = await handler({
        body: req.body,
        params: req.params,
        query: req.query
      });

      // Success response
      const successResponse: EndpointResponse<R> = {
        success: true,
        data: response,
        timestamp: new Date().toISOString()
      };

      res.json(successResponse);
      
      // Log successful request
      const duration = Date.now() - startTime;
      console.log(`✅ ${endpointName} completed in ${duration}ms`);
      
    } catch (error: any) {
      // Error response
      const errorResponse: EndpointResponse = {
        success: false,
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString()
      };

      console.error(`❌ ${endpointName} error:`, error);
      res.status(500).json(errorResponse);
    }
  };
}

/**
 * Create a GET endpoint handler (for endpoints that don't require body validation)
 */
export function createGetEndpoint<R = any>(
  handler: (req: EndpointRequest) => Promise<R>,
  handlerName?: string
) {
  return async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();
    const endpointName = handlerName || handler.name || 'Unknown';
    
    try {
      // Execute the handler
      const response = await handler({
        body: req.body,
        params: req.params,
        query: req.query
      });

      // Success response
      const successResponse: EndpointResponse<R> = {
        success: true,
        data: response,
        timestamp: new Date().toISOString()
      };

      res.json(successResponse);
      
      // Log successful request
      const duration = Date.now() - startTime;
      console.log(`✅ ${endpointName} completed in ${duration}ms`);
      
    } catch (error: any) {
      // Error response
      const errorResponse: EndpointResponse = {
        success: false,
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString()
      };

      console.error(`❌ ${endpointName} error:`, error);
      res.status(500).json(errorResponse);
    }
  };
}

/**
 * Create a health check endpoint handler
 */
export function createHealthEndpoint(
  healthCheckFn: () => Promise<any>,
  handlerName: string = 'Health Check'
) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const healthStatus = await healthCheckFn();
      
      const response: EndpointResponse = {
        success: true,
        data: {
          status: healthStatus.overall ? 'healthy' : 'degraded',
          services: healthStatus.services || healthStatus,
          stats: healthStatus.stats
        },
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error: any) {
      const errorResponse: EndpointResponse = {
        success: false,
        error: error.message || 'Health check failed',
        data: {
          status: 'unhealthy'
        },
        timestamp: new Date().toISOString()
      };

      console.error(`❌ ${handlerName} error:`, error);
      res.status(500).json(errorResponse);
    }
  };
}

/**
 * Create a demo data endpoint handler
 */
export function createDemoEndpoint<T = any>(
  dataGenerator: () => T,
  handlerName: string = 'Demo Data'
) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const data = dataGenerator();
      
      const response: EndpointResponse<T> = {
        success: true,
        data,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error: any) {
      const errorResponse: EndpointResponse = {
        success: false,
        error: error.message || 'Failed to generate demo data',
        timestamp: new Date().toISOString()
      };

      console.error(`❌ ${handlerName} error:`, error);
      res.status(500).json(errorResponse);
    }
  };
}

/**
 * Validate request body against a schema
 */
export function validateRequestBody(body: any, schema: Record<string, 'required' | 'optional'>): string[] {
  const errors: string[] = [];
  
  for (const [field, requirement] of Object.entries(schema)) {
    if (requirement === 'required') {
      const value = body[field];
      if (value === undefined || value === null || value === '') {
        errors.push(`${field} is required`);
      }
    }
  }
  
  return errors;
}

/**
 * Create an endpoint with custom validation
 */
export function createValidatedEndpoint<R = any>(
  handler: (req: EndpointRequest) => Promise<R>,
  validator: (body: any) => string[],
  handlerName?: string
) {
  return async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();
    const endpointName = handlerName || handler.name || 'Unknown';
    
    try {
      // Custom validation
      const validationErrors = validator(req.body);
      if (validationErrors.length > 0) {
        const response: EndpointResponse = {
          success: false,
          error: `Validation failed: ${validationErrors.join(', ')}`,
          timestamp: new Date().toISOString()
        };
        res.status(400).json(response);
        return;
      }

      // Execute the handler
      const response = await handler({
        body: req.body,
        params: req.params,
        query: req.query
      });

      // Success response
      const successResponse: EndpointResponse<R> = {
        success: true,
        data: response,
        timestamp: new Date().toISOString()
      };

      res.json(successResponse);
      
      // Log successful request
      const duration = Date.now() - startTime;
      console.log(`✅ ${endpointName} completed in ${duration}ms`);
      
    } catch (error: any) {
      // Error response
      const errorResponse: EndpointResponse = {
        success: false,
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString()
      };

      console.error(`❌ ${endpointName} error:`, error);
      res.status(500).json(errorResponse);
    }
  };
}
