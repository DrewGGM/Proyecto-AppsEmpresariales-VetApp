import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HomePageComponent } from './home-page.component';
import { SharedModule } from '../../../../shared/shared.module';

describe('HomePageComponent', () => {
  let component: HomePageComponent;
  let fixture: ComponentFixture<HomePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomePageComponent],
      imports: [
        RouterTestingModule,
        SharedModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have faqs array', () => {
    expect(component.faqs).toBeDefined();
    expect(Array.isArray(component.faqs)).toBeTruthy();
    expect(component.faqs.length).toBeGreaterThan(0);
  });

  it('should initialize faqs with expanded false', () => {
    component.faqs.forEach(faq => {
      expect(faq.expanded).toBeFalsy();
    });
  });

  it('should toggle faq expansion', () => {
    const initialExpanded = component.faqs[0].expanded;
    component.toggleFaq(0);
    expect(component.faqs[0].expanded).toBe(!initialExpanded);
    
    // Toggle again
    component.toggleFaq(0);
    expect(component.faqs[0].expanded).toBe(initialExpanded);
  });

  it('should scroll to section', () => {
    const mockElement = {
      scrollIntoView: jasmine.createSpy('scrollIntoView')
    };
    spyOn(document, 'getElementById').and.returnValue(mockElement as any);
    
    component.scrollToSection('features');
    
    expect(document.getElementById).toHaveBeenCalledWith('features');
    expect(mockElement.scrollIntoView).toHaveBeenCalledWith({ 
      behavior: 'smooth',
      block: 'start'
    });
  });

  it('should handle scroll to non-existent section', () => {
    spyOn(document, 'getElementById').and.returnValue(null);
    
    expect(() => component.scrollToSection('nonexistent')).not.toThrow();
    expect(document.getElementById).toHaveBeenCalledWith('nonexistent');
  });

  it('should render hero section', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const heroSection = compiled.querySelector('.hero-section');
    expect(heroSection).toBeTruthy();
  });

  it('should render features section', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const featuresSection = compiled.querySelector('.features-section');
    expect(featuresSection).toBeTruthy();
  });

  it('should render FAQ section', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const faqSection = compiled.querySelector('.faq-section');
    expect(faqSection).toBeTruthy();
  });

  it('should display correct number of FAQs', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const faqItems = compiled.querySelectorAll('.faq-item');
    expect(faqItems.length).toBe(component.faqs.length);
  });

  it('should have all required FAQ properties', () => {
    component.faqs.forEach(faq => {
      expect(faq.question).toBeDefined();
      expect(faq.answer).toBeDefined();
      expect(typeof faq.expanded).toBe('boolean');
    });
  });

  it('should toggle only the specified FAQ', () => {
    const initialStates = component.faqs.map(faq => faq.expanded);
    
    component.toggleFaq(1);
    
    component.faqs.forEach((faq, index) => {
      if (index === 1) {
        expect(faq.expanded).toBe(!initialStates[index]);
      } else {
        expect(faq.expanded).toBe(initialStates[index]);
      }
    });
  });

  afterEach(() => {
    fixture.destroy();
  });
}); 