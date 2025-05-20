import { Directive } from '@angular/core';

@Directive({
  selector: '[appHasPermission]',
  standalone: false
})
export class HasPermissionDirective {

  constructor() { }

}
