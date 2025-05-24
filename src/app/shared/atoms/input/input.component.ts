import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: false,
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor {
  @Input() type: 'text' | 'email' | 'password' | 'number' = 'text';
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() required: boolean = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() state: 'default' | 'error' | 'success' = 'default';
  @Input() icon: string = '';
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() showPasswordToggle: boolean = false;
  @Input() value: string = '';

  @Output() blur = new EventEmitter<Event>();
  @Output() focus = new EventEmitter<Event>();
  @Output() input = new EventEmitter<Event>();

  showPassword: boolean = false;
  
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
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Get input type considering password toggle
   */
  get inputType(): string {
    if (this.type === 'password' && this.showPasswordToggle) {
      return this.showPassword ? 'text' : 'password';
    }
    return this.type;
  }

  /**
   * Get CSS classes for the input wrapper
   */
  get wrapperClasses(): string {
    const classes = ['input-wrapper', `input-${this.size}`, `input-${this.state}`];
    
    if (this.disabled) classes.push('input-disabled');
    if (this.readonly) classes.push('input-readonly');
    if (this.icon) classes.push(`input-icon-${this.iconPosition}`);
    
    return classes.join(' ');
  }

  /**
   * Get CSS classes for the input element
   */
  get inputClasses(): string {
    const classes = ['input-field'];
    
    if (this.icon) classes.push('input-with-icon');
    if (this.showPasswordToggle && this.type === 'password') classes.push('input-with-toggle');
    
    return classes.join(' ');
  }
}