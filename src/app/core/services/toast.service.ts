import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { Toast, ToastType, ToastConfig, CreateToastOptions, ToastPosition } from '../models/toast.interface';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  private defaultConfig: ToastConfig = {
    duration: 5000, // 5 segundos
    showCloseButton: true,
    position: 'top-right',
    maxToasts: 5
  };

  /**
   * Observable que emite la lista actual de toasts
   */
  public toasts$: Observable<Toast[]> = this.toastsSubject.asObservable();

  constructor() {}

  /**
   * Muestra un toast de éxito
   * @param message Mensaje a mostrar
   * @param options Opciones adicionales
   * @returns ID del toast creado
   */
  success(message: string, options?: CreateToastOptions): string {
    return this.show('success', message, options);
  }

  /**
   * Muestra un toast de error
   * @param message Mensaje a mostrar
   * @param options Opciones adicionales
   * @returns ID del toast creado
   */
  error(message: string, options?: CreateToastOptions): string {
    return this.show('error', message, {
      ...options,
      duration: options?.duration || 8000 // Los errores duran más tiempo
    });
  }

  /**
   * Muestra un toast de advertencia
   * @param message Mensaje a mostrar
   * @param options Opciones adicionales
   * @returns ID del toast creado
   */
  warning(message: string, options?: CreateToastOptions): string {
    return this.show('warning', message, options);
  }

  /**
   * Muestra un toast de información
   * @param message Mensaje a mostrar
   * @param options Opciones adicionales
   * @returns ID del toast creado
   */
  info(message: string, options?: CreateToastOptions): string {
    return this.show('info', message, options);
  }

  /**
   * Muestra un toast genérico
   * @param type Tipo de toast
   * @param message Mensaje a mostrar
   * @param options Opciones adicionales
   * @returns ID del toast creado
   */
  show(type: ToastType, message: string, options?: CreateToastOptions): string {
    const toast: Toast = {
      id: this.generateId(),
      type,
      message,
      title: options?.title,
      duration: options?.duration || this.defaultConfig.duration,
      showCloseButton: options?.showCloseButton ?? this.defaultConfig.showCloseButton,
      position: options?.position || this.defaultConfig.position,
      createdAt: new Date()
    };

    this.addToast(toast);
    
    // Programar eliminación automática si tiene duración
    if (toast.duration && toast.duration > 0) {
      this.scheduleRemoval(toast);
    }

    return toast.id;
  }

  /**
   * Elimina un toast específico por su ID
   * @param toastId ID del toast a eliminar
   */
  remove(toastId: string): void {
    const currentToasts = this.toastsSubject.value;
    const updatedToasts = currentToasts.filter(toast => toast.id !== toastId);
    this.toastsSubject.next(updatedToasts);
  }

  /**
   * Elimina todos los toasts
   */
  clear(): void {
    this.toastsSubject.next([]);
  }

  /**
   * Elimina todos los toasts de un tipo específico
   * @param type Tipo de toast a eliminar
   */
  clearByType(type: ToastType): void {
    const currentToasts = this.toastsSubject.value;
    const updatedToasts = currentToasts.filter(toast => toast.type !== type);
    this.toastsSubject.next(updatedToasts);
  }

  /**
   * Obtiene los toasts filtrados por posición
   * @param position Posición de los toasts
   * @returns Observable con los toasts de esa posición
   */
  getToastsByPosition(position: ToastPosition): Observable<Toast[]> {
    return new Observable(observer => {
      this.toasts$.subscribe(toasts => {
        const filteredToasts = toasts.filter(toast => 
          (toast.position || this.defaultConfig.position) === position
        );
        observer.next(filteredToasts);
      });
    });
  }

  /**
   * Actualiza la configuración por defecto del servicio
   * @param config Nueva configuración
   */
  updateConfig(config: Partial<ToastConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }

  /**
   * Obtiene la configuración actual del servicio
   * @returns Configuración actual
   */
  getConfig(): ToastConfig {
    return { ...this.defaultConfig };
  }

  /**
   * Obtiene el número total de toasts activos
   * @returns Número de toasts
   */
  getToastCount(): number {
    return this.toastsSubject.value.length;
  }

  /**
   * Verifica si existe un toast con un ID específico
   * @param toastId ID del toast
   * @returns True si existe el toast
   */
  hasToast(toastId: string): boolean {
    return this.toastsSubject.value.some(toast => toast.id === toastId);
  }

  /**
   * Obtiene un toast específico por su ID
   * @param toastId ID del toast
   * @returns Toast encontrado o undefined
   */
  getToast(toastId: string): Toast | undefined {
    return this.toastsSubject.value.find(toast => toast.id === toastId);
  }

  /**
   * Actualiza un toast existente
   * @param toastId ID del toast a actualizar
   * @param updates Propiedades a actualizar
   */
  updateToast(toastId: string, updates: Partial<Toast>): void {
    const currentToasts = this.toastsSubject.value;
    const updatedToasts = currentToasts.map(toast => 
      toast.id === toastId ? { ...toast, ...updates } : toast
    );
    this.toastsSubject.next(updatedToasts);
  }

  /**
   * Pausa la eliminación automática de un toast
   * @param toastId ID del toast
   */
  pauseToast(toastId: string): void {
    // En una implementación más avanzada, aquí se podría pausar el timer
    // Por ahora, removemos la duración para evitar la eliminación automática
    this.updateToast(toastId, { duration: 0 });
  }

  /**
   * Reanuda la eliminación automática de un toast
   * @param toastId ID del toast
   * @param duration Nueva duración (opcional)
   */
  resumeToast(toastId: string, duration?: number): void {
    const toast = this.getToast(toastId);
    if (toast) {
      const newDuration = duration || this.defaultConfig.duration || 5000;
      this.updateToast(toastId, { duration: newDuration });
      this.scheduleRemoval(toast);
    }
  }

  /**
   * Añade un toast a la lista, respetando el límite máximo
   * @param toast Toast a añadir
   */
  private addToast(toast: Toast): void {
    const currentToasts = this.toastsSubject.value;
    let updatedToasts = [...currentToasts, toast];

    // Limitar el número máximo de toasts
    const maxToasts = this.defaultConfig.maxToasts || 5;
    if (updatedToasts.length > maxToasts) {
      // Eliminar los toasts más antiguos
      updatedToasts = updatedToasts.slice(-maxToasts);
    }

    this.toastsSubject.next(updatedToasts);
  }

  /**
   * Programa la eliminación automática de un toast
   * @param toast Toast a programar para eliminación
   */
  private scheduleRemoval(toast: Toast): void {
    if (toast.duration && toast.duration > 0) {
      timer(toast.duration).subscribe(() => {
        // Verificar que el toast aún existe antes de eliminarlo
        if (this.hasToast(toast.id)) {
          this.remove(toast.id);
        }
      });
    }
  }

  /**
   * Genera un ID único para un toast
   * @returns ID único
   */
  private generateId(): string {
    return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Métodos de conveniencia para casos de uso comunes
   */

  /**
   * Muestra un toast de éxito simple
   * @param message Mensaje
   */
  showSuccess(message: string): void {
    this.success(message);
  }

  /**
   * Muestra un toast de error simple
   * @param message Mensaje
   */
  showError(message: string): void {
    this.error(message);
  }

  /**
   * Muestra un toast de información simple
   * @param message Mensaje
   */
  showInfo(message: string): void {
    this.info(message);
  }

  /**
   * Muestra un toast de advertencia simple
   * @param message Mensaje
   */
  showWarning(message: string): void {
    this.warning(message);
  }

  /**
   * Muestra un toast persistente (sin auto-eliminación)
   * @param type Tipo de toast
   * @param message Mensaje
   * @param title Título opcional
   */
  showPersistent(type: ToastType, message: string, title?: string): string {
    return this.show(type, message, {
      title,
      duration: 0, // Sin eliminación automática
      showCloseButton: true
    });
  }

  /**
   * Muestra un toast con acción personalizada
   * @param type Tipo de toast
   * @param message Mensaje
   * @param actionText Texto del botón de acción
   * @param actionCallback Función a ejecutar al hacer clic
   */
  showWithAction(
    type: ToastType, 
    message: string, 
    actionText: string, 
    actionCallback: () => void
  ): string {
    // Esta implementación requeriría extender la interfaz Toast
    // para incluir acciones personalizadas
    return this.show(type, message, {
      duration: 10000, // Más tiempo para permitir la acción
      showCloseButton: true
    });
  }
}