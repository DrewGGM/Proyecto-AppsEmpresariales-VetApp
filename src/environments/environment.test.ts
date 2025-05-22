// Environment para testing
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appName: 'VetApp (Test)',
  version: '1.0.0-test',
  
  // Configuraciones específicas de testing
  enableDebugMode: true,
  enableMockData: true,
  logLevel: 'debug',
  
  // URLs de servicios
  authUrl: 'http://localhost:3000/api/auth',
  uploadUrl: 'http://localhost:3000/api/upload',
  
  // Configuraciones de features
  features: {
    enableAdvancedReports: false,
    enableNotifications: false,
    enableUserTracking: false
  },
  
  // Configuraciones de terceros
  analytics: {
    enabled: false,
    trackingId: ''
  },
  
  // Timeouts y límites
  httpTimeout: 5000, // 5 segundos
  maxFileSize: 1048576, // 1MB en bytes
  
  // Configuraciones de toast/notificaciones
  toast: {
    duration: 1000,
    position: 'top-right' as const,
    maxToasts: 1
  }
};