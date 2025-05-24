import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-form-field',
  standalone: false,
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormFieldComponent),
      multi: true
    }
  ]
})
export class FormFieldComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() type: 'text' | 'email' | 'password' | 'number' = 'text';
  @Input() placeholder: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() icon: string = '';
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() showPasswordToggle: boolean = false;
  @Input() hint: string = '';
  @Input() errorMessage: string = '';
  @Input() control: AbstractControl | null = null;

  @Output() blur = new EventEmitter<Event>();
  @Output() focus = new EventEmitter<Event>();
  @Output() input = new EventEmitter<Event>();

  value: string = '';
  
  private onChange = (value: string) => {};
  private onTouched = () => {};

  /**
   * ControlValueAccessor implementation
   */
  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /**
   * Event handlers
   */
  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.input.emit(event);
  }

  onBlur(event: Event): void {
    this.onTouched();
    this.blur.emit(event);
  }

  onFocus(event: Event): void {
    this.focus.emit(event);
  }

  /**
   * Get input state based on validation
   */
  get inputState(): 'default' | 'error' | 'success' {
    if (!this.control) return 'default';
    
    if (this.control.invalid && this.control.touched) {
      return 'error';
    }
    
    if (this.control.valid && this.control.touched && this.control.value) {
      return 'success';
    }
    
    return 'default';
  }

  /**
   * Get error message from control or custom message
   */
  get displayErrorMessage(): string {
    if (this.errorMessage) return this.errorMessage;
    
    if (!this.control || !this.control.errors || !this.control.touched) {
      return '';
    }

    const errors = this.control.errors;
    
    if (errors['required']) {
      return `${this.label || 'Este campo'} es obligatorio`;
    }
    
    if (errors['email']) {
      return 'Formato de correo electrónico inválido';
    }
    
    if (errors['minlength']) {
      return `Debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
    }
    
    if (errors['maxlength']) {
      return `No puede tener más de ${errors['maxlength'].requiredLength} caracteres`;
    }
    
    if (errors['pattern']) {
      return 'Formato inválido';
    }

    return 'Campo inválido';
  }

  /**
   * Check if field has error
   */
  get hasError(): boolean {
    return this.inputState === 'error' || !!this.errorMessage;
  }

  /**
   * Get unique ID for the input
   */
  get fieldId(): string {
    return `field-${Math.random().toString(36).substr(2, 9)}`;
  }
}