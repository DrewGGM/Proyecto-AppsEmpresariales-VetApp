// Environment para producción
export const environment = {
  production: true,
  apiUrl: 'https://api.vetapp.com/api',
  appName: 'VetApp',
  version: '1.0.0',
  
  // Configuraciones específicas de producción
  enableDebugMode: false,
  enableMockData: false,
  logLevel: 'error',
  
  // URLs de servicios
  authUrl: 'https://api.vetapp.com/api/auth',
  uploadUrl: 'https://api.vetapp.com/api/upload',
  
  // Configuraciones de features
  features: {
    enableAdvancedReports: true,
    enableNotifications: true,
    enableUserTracking: true
  },
  
  // Configuraciones de terceros
  analytics: {
    enabled: true,
    trackingId: 'GA-XXXX-X'
  },
  
  // Timeouts y límites
  httpTimeout: 15000, // 15 segundos
  maxFileSize: 5242880, // 5MB en bytes
  
  // Configuraciones de toast/notificaciones
  toast: {
    duration: 4000,
    position: 'top-right' as const,
    maxToasts: 3
  }
};