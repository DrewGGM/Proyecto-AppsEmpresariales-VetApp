import { Directive } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: false
})
export class ClickOutsideDirective {

  constructor() { }

}
