import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationsBadgeComponent } from './notifications-badge.component';
import { IconComponent } from '../icon/icon.component';

describe('NotificationsBadgeComponent', () => {
  let component: NotificationsBadgeComponent;
  let fixture: ComponentFixture<NotificationsBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ 
        NotificationsBadgeComponent,
        IconComponent 
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationsBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not show badge when count is 0', () => {
    component.count = 0;
    expect(component.shouldShowBadge).toBeFalsy();
  });

  it('should show badge when count is greater than 0', () => {
    component.count = 5;
    expect(component.shouldShowBadge).toBeTruthy();
    expect(component.displayCount).toBe('5');
  });

  it('should show badge when count is 0 and showZero is true', () => {
    component.count = 0;
    component.showZero = true;
    expect(component.shouldShowBadge).toBeTruthy();
    expect(component.displayCount).toBe('0');
  });

  it('should show max count when count exceeds maximum', () => {
    component.count = 150;
    component.maxCount = 99;
    expect(component.displayCount).toBe('99+');
  });

  it('should emit click event when clicked', () => {
    spyOn(component.click, 'emit');
    component.onClick();
    expect(component.click.emit).toHaveBeenCalled();
  });

  it('should emit badgeClick event when badge is clicked', () => {
    spyOn(component.badgeClick, 'emit');
    const mockEvent = { stopPropagation: jasmine.createSpy() } as any;
    
    component.count = 5;
    component.onBadgeClick(mockEvent);
    
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(component.badgeClick.emit).toHaveBeenCalledWith(5);
  });

  it('should not emit events when disabled', () => {
    spyOn(component.click, 'emit');
    spyOn(component.badgeClick, 'emit');
    
    component.disabled = true;
    component.onClick();
    component.onBadgeClick({ stopPropagation: () => {} } as any);
    
    expect(component.click.emit).not.toHaveBeenCalled();
    expect(component.badgeClick.emit).not.toHaveBeenCalled();
  });

  it('should apply correct classes', () => {
    component.size = 'large';
    component.variant = 'primary';
    component.disabled = true;
    component.animated = true;
    component.count = 5;
    
    const classes = component.getClasses();
    expect(classes).toContain('notifications-badge');
    expect(classes).toContain('large');
    expect(classes).toContain('primary');
    expect(classes).toContain('disabled');
    expect(classes).toContain('animated');
  });

  it('should render badge with correct content', () => {
    component.count = 10;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    const badge = compiled.querySelector('.badge');
    expect(badge).toBeTruthy();
    expect(badge.textContent.trim()).toBe('10');
  });
});