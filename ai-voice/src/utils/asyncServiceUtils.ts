// Async Service Initialization Utilities
// Provides patterns for proper async service initialization

/**
 * Base class for services that require async initialization
 */
export abstract class AsyncService {
  protected isInitialized: boolean = false;

  /**
   * Check if the service is initialized
   */
  public isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Ensure the service is initialized before use
   */
  protected ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error(`${this.constructor.name} must be initialized before use. Call initialize() or use the factory method.`);
    }
  }

  /**
   * Initialize the service (to be implemented by subclasses)
   */
  public abstract initialize(): Promise<void>;
}

/**
 * Factory function for creating async services
 */
export async function createAsyncService<T extends AsyncService>(
  ServiceClass: new () => T
): Promise<T> {
  const service = new ServiceClass();
  await service.initialize();
  return service;
}

/**
 * Service registry for managing async services
 */
export class ServiceRegistry {
  private services: Map<string, AsyncService> = new Map();
  private initializationPromises: Map<string, Promise<void>> = new Map();

  /**
   * Register a service
   */
  public register(name: string, service: AsyncService): void {
    this.services.set(name, service);
  }

  /**
   * Get a service by name
   */
  public get<T extends AsyncService>(name: string): T | undefined {
    return this.services.get(name) as T | undefined;
  }

  /**
   * Initialize all registered services
   */
  public async initializeAll(): Promise<void> {
    const initPromises = Array.from(this.services.entries()).map(async ([name, service]) => {
      try {
        await service.initialize();
        console.log(`✅ Service ${name} initialized successfully`);
      } catch (error) {
        console.error(`❌ Failed to initialize service ${name}:`, error);
        throw error;
      }
    });

    await Promise.all(initPromises);
  }

  /**
   * Initialize a specific service
   */
  public async initializeService(name: string): Promise<void> {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }

    if (this.initializationPromises.has(name)) {
      return this.initializationPromises.get(name)!;
    }

    const initPromise = service.initialize();
    this.initializationPromises.set(name, initPromise);
    
    try {
      await initPromise;
      console.log(`✅ Service ${name} initialized successfully`);
    } catch (error) {
      this.initializationPromises.delete(name);
      throw error;
    }
  }

  /**
   * Check if all services are ready
   */
  public areAllServicesReady(): boolean {
    return Array.from(this.services.values()).every(service => service.isReady());
  }

  /**
   * Get service readiness status
   */
  public getServiceStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    for (const [name, service] of this.services.entries()) {
      status[name] = service.isReady();
    }
    return status;
  }
}

/**
 * Decorator for methods that require service initialization
 */
export function requiresInitialization(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function(...args: any[]) {
    if (!this.isInitialized) {
      throw new Error(`${this.constructor.name}.${propertyKey} requires the service to be initialized first`);
    }
    return originalMethod.apply(this, args);
  };

  return descriptor;
}

/**
 * Utility for creating service factories
 */
export function createServiceFactory<T extends AsyncService>(
  ServiceClass: new () => T
) {
  return async (): Promise<T> => {
    return createAsyncService(ServiceClass);
  };
}
