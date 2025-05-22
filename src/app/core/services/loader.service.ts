import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingCountSubject = new BehaviorSubject<number>(0);
  
  /**
   * Observable que emite el estado de carga actual
   */
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();
  
  /**
   * Observable que emite el contador de procesos de carga activos
   */
  public loadingCount$: Observable<number> = this.loadingCountSubject.asObservable();
  
  private loadingCount = 0;

  constructor() {}

  /**
   * Muestra el indicador de carga
   */
  show(): void {
    this.loadingCount++;
    this.loadingCountSubject.next(this.loadingCount);
    
    if (!this.loadingSubject.value) {
      this.loadingSubject.next(true);
    }
  }

  /**
   * Oculta el indicador de carga
   */
  hide(): void {
    if (this.loadingCount > 0) {
      this.loadingCount--;
      this.loadingCountSubject.next(this.loadingCount);
    }
    
    if (this.loadingCount === 0) {
      this.loadingSubject.next(false);
    }
  }

  /**
   * Fuerza el ocultamiento del indicador de carga
   */
  forceHide(): void {
    this.loadingCount = 0;
    this.loadingCountSubject.next(0);
    this.loadingSubject.next(false);
  }

  /**
   * Obtiene el estado actual de carga
   */
  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  /**
   * Obtiene el número de procesos de carga activos
   */
  getLoadingCount(): number {
    return this.loadingCount;
  }
}