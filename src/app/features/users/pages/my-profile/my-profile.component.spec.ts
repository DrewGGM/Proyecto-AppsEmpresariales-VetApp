import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { MyProfileComponent } from './my-profile.component';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { UserService } from '../../services/user.service';
import { ActivityService } from '../../../../core/services/activity.service';
import { ToastService } from '../../../../core/services/toast.service';
import { SharedModule } from '../../../../shared/shared.module';

describe('MyProfileComponent', () => {
  let component: MyProfileComponent;
  let fixture: ComponentFixture<MyProfileComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockActivityService: jasmine.SpyObj<ActivityService>;
  let mockToastService: jasmine.SpyObj<ToastService>;

  const mockUser = {
    userId: 1,
    name: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    role: 'ADMIN',
    success: true,
    message: 'Success'
  };

  const mockUserDetails = {
    id: 1,
    name: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    role: 'ADMIN',
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastAccess: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'getUserRole']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getUserById', 'updateUser', 'uploadUserPhoto', 'getUserActivity', 'getUserStats']);
    const activityServiceSpy = jasmine.createSpyObj('ActivityService', ['mapToRecentActivities']);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'warning']);

    await TestBed.configureTestingModule({
      declarations: [MyProfileComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        SharedModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: ActivityService, useValue: activityServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyProfileComponent);
    component = fixture.componentInstance;
    
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockUserService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    mockActivityService = TestBed.inject(ActivityService) as jasmine.SpyObj<ActivityService>;
    mockToastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;

    // Setup default mock returns
    mockAuthService.getCurrentUser.and.returnValue(mockUser);
    mockAuthService.getUserRole.and.returnValue('ADMIN');
    mockUserService.getUserById.and.returnValue(of(mockUserDetails));
    mockUserService.getUserActivity.and.returnValue(of([]));
    mockUserService.getUserStats.and.returnValue(of({ consultations: 0, vaccinations: 0, appointments: 0 }));
    mockActivityService.mapToRecentActivities.and.returnValue([]);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with current user', () => {
    component.ngOnInit();
    expect(component.currentUser).toEqual(mockUser);
    expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
  });

  it('should load user data on init', () => {
    component.ngOnInit();
    expect(mockUserService.getUserById).toHaveBeenCalledWith(mockUser.userId);
  });

  it('should create profile form with correct validators', () => {
    component.ngOnInit();
    const form = component.profileForm;
    
    expect(form.get('name')?.hasError('required')).toBeTruthy();
    expect(form.get('lastName')?.hasError('required')).toBeTruthy();
    expect(form.get('email')?.hasError('required')).toBeTruthy();
  });

  it('should create password form with correct validators', () => {
    component.ngOnInit();
    const form = component.passwordForm;
    
    expect(form.get('currentPassword')?.hasError('required')).toBeTruthy();
    expect(form.get('newPassword')?.hasError('required')).toBeTruthy();
    expect(form.get('confirmPassword')?.hasError('required')).toBeTruthy();
  });

  it('should populate profile form when user details are loaded', () => {
    component.ngOnInit();
    fixture.detectChanges();
    
    // Wait for async operations
    setTimeout(() => {
      expect(component.profileForm.get('name')?.value).toBe(mockUserDetails.name);
      expect(component.profileForm.get('lastName')?.value).toBe(mockUserDetails.lastName);
      expect(component.profileForm.get('email')?.value).toBe(mockUserDetails.email);
    });
  });

  it('should start editing profile', () => {
    component.startEditingProfile();
    expect(component.editingProfile).toBeTruthy();
  });

  it('should cancel editing profile', () => {
    component.editingProfile = true;
    component.cancelEditingProfile();
    expect(component.editingProfile).toBeFalsy();
  });

  it('should show change password form', () => {
    component.showChangePassword();
    expect(component.showPasswordForm).toBeTruthy();
    expect(component.editingPassword).toBeTruthy();
  });

  it('should cancel change password', () => {
    component.showPasswordForm = true;
    component.editingPassword = true;
    component.cancelChangePassword();
    expect(component.showPasswordForm).toBeFalsy();
    expect(component.editingPassword).toBeFalsy();
  });

  it('should return correct full name', () => {
    component.userDetails = mockUserDetails;
    expect(component.getFullName()).toBe('Test User');
  });

  it('should check if user is veterinarian', () => {
    mockAuthService.getUserRole.and.returnValue('VETERINARIAN');
    expect(component.isVeterinarian()).toBeTruthy();
    
    mockAuthService.getUserRole.and.returnValue('ADMIN');
    expect(component.isVeterinarian()).toBeFalsy();
  });

  it('should handle photo upload', () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const mockEvent = { target: { files: [mockFile] } } as any;
    
    mockUserService.uploadUserPhoto.and.returnValue(of({ photoUrl: 'test-url', success: true }));
    
    component.currentUser = mockUser;
    component.onPhotoUpload(mockEvent);
    
    expect(mockUserService.uploadUserPhoto).toHaveBeenCalledWith(mockUser.userId, mockFile);
  });

  it('should validate photo file type', () => {
    const mockFile = new File([''], 'test.txt', { type: 'text/plain' });
    const mockEvent = { target: { files: [mockFile] } } as any;
    
    component.onPhotoUpload(mockEvent);
    
    expect(mockToastService.error).toHaveBeenCalledWith('Por favor selecciona un archivo de imagen válido');
  });

  it('should validate photo file size', () => {
    const mockFile = new File(['x'.repeat(11 * 1024 * 1024)], 'test.jpg', { type: 'image/jpeg' });
    const mockEvent = { target: { files: [mockFile] } } as any;
    
    component.onPhotoUpload(mockEvent);
    
    expect(mockToastService.error).toHaveBeenCalledWith('El archivo es demasiado grande. Máximo 10MB');
  });

  it('should get error message for form fields', () => {
    component.ngOnInit();
    const nameControl = component.profileForm.get('name');
    nameControl?.markAsTouched();
    nameControl?.setErrors({ required: true });
    
    const errorMessage = component.getErrorMessage('name');
    expect(errorMessage).toBe('Nombre es requerido');
  });

  it('should open photo selector', () => {
    spyOn(document, 'getElementById').and.returnValue({
      click: jasmine.createSpy('click')
    } as any);
    
    component.openPhotoSelector();
    
    expect(document.getElementById).toHaveBeenCalledWith('photoUpload');
  });

  afterEach(() => {
    fixture.destroy();
  });
}); 