import { TestBed } from '@angular/core/testing';
import { LoaderService } from './loader.service';

describe('LoaderService', () => {
  let service: LoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show loading', () => {
    service.show();
    expect(service.isLoading()).toBeTruthy();
    expect(service.getLoadingCount()).toBe(1);
  });

  it('should hide loading', () => {
    service.show();
    service.hide();
    expect(service.isLoading()).toBeFalsy();
    expect(service.getLoadingCount()).toBe(0);
  });

  it('should handle multiple show/hide calls', () => {
    service.show();
    service.show();
    expect(service.isLoading()).toBeTruthy();
    expect(service.getLoadingCount()).toBe(2);

    service.hide();
    expect(service.isLoading()).toBeTruthy();
    expect(service.getLoadingCount()).toBe(1);

    service.hide();
    expect(service.isLoading()).toBeFalsy();
    expect(service.getLoadingCount()).toBe(0);
  });

  it('should force hide loading', () => {
    service.show();
    service.show();
    service.forceHide();
    expect(service.isLoading()).toBeFalsy();
    expect(service.getLoadingCount()).toBe(0);
  });
});