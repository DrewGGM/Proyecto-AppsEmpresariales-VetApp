import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionsPanelComponent } from './permissions-panel.component';

describe('PermissionsPanelComponent', () => {
  let component: PermissionsPanelComponent;
  let fixture: ComponentFixture<PermissionsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PermissionsPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
