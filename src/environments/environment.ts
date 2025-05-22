// Environment para desarrollo
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  appName: 'VetApp',
  version: '1.0.0',
  
  // Configuraciones específicas de desarrollo
  enableDebugMode: true,
  enableMockData: false,
  logLevel: 'debug',
  
  // URLs de servicios
  authUrl: 'http://localhost:8080/api/auth',
  uploadUrl: 'http://localhost:8080/api/upload',
  
  // Configuraciones de features
  features: {
    enableAdvancedReports: true,
    enableNotifications: true,
    enableUserTracking: false
  },
  
  // Configuraciones de terceros
  analytics: {
    enabled: false,
    trackingId: ''
  },
  
  // Timeouts y límites
  httpTimeout: 30000, // 30 segundos
  maxFileSize: 10485760, // 10MB en bytes
  
  // Configuraciones de toast/notificaciones
  toast: {
    duration: 5000,
    position: 'top-right' as const,
    maxToasts: 5
  }
};