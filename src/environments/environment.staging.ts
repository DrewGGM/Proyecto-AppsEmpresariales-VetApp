// Environment para staging/pre-producción
export const environment = {
  production: false,
  apiUrl: 'https://staging-api.vetapp.com/api',
  appName: 'VetApp (Staging)',
  version: '1.0.0-staging',
  
  // Configuraciones específicas de staging
  enableDebugMode: true,
  enableMockData: false,
  logLevel: 'warn',
  
  // URLs de servicios
  authUrl: 'https://staging-api.vetapp.com/api/auth',
  uploadUrl: 'https://staging-api.vetapp.com/api/upload',
  
  // Configuraciones de features
  features: {
    enableAdvancedReports: true,
    enableNotifications: true,
    enableUserTracking: true
  },
  
  // Configuraciones de terceros
  analytics: {
    enabled: false,
    trackingId: 'GA-TEST-X'
  },
  
  // Timeouts y límites
  httpTimeout: 20000, // 20 segundos
  maxFileSize: 8388608, // 8MB en bytes
  
  // Configuraciones de toast/notificaciones
  toast: {
    duration: 5000,
    position: 'top-right' as const,
    maxToasts: 5
  }
};