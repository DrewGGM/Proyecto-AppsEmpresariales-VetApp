import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { DashboardMainComponent } from './dashboard-main.component';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { UserService } from '../../../users/services/user.service';
import { HealthService } from '../../../../core/services/health.service';
import { ActivityService } from '../../../../core/services/activity.service';
import { SharedModule } from '../../../../shared/shared.module';
import { UserRole } from '../../../users/models/role.enum';

describe('DashboardMainComponent', () => {
  let component: DashboardMainComponent;
  let fixture: ComponentFixture<DashboardMainComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockHealthService: jasmine.SpyObj<HealthService>;
  let mockActivityService: jasmine.SpyObj<ActivityService>;

  const mockUser = {
    userId: 1,
    name: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    role: 'ADMIN',
    success: true,
    message: 'Success'
  };

  const mockUsers = [
    {
      id: 1,
      name: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: UserRole.ADMIN,
      active: true,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      lastAccess: new Date('2024-01-02T00:00:00Z'),
      updatedAt: new Date('2024-01-02T00:00:00Z')
    }
  ];

  const mockSystemHealth = [
    {
      icon: 'check_circle',
      title: 'API Backend',
      description: 'Operativo',
      status: 'Operativo',
      type: 'success' as const
    }
  ];

  const mockActivityResponse = {
    status: 'success',
    message: 'OK',
    timestamp: '2024-01-01T00:00:00Z',
    limit: 10,
    data: {
      recent_consultations: [],
      recent_appointments: [],
      new_users: [],
      new_pets: [],
      recent_vaccinations: [],
      statistics: {
        total_consultations: 0,
        total_appointments: 0,
        today_consultations: 0,
        today_appointments: 0,
        total_users: 1,
        total_pets: 0,
        total_vaccinations: 0
      }
    }
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'getUserRole', 'hasPermission']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getAllUsers', 'getActiveUsers', 'getUsersByRole']);
    const healthServiceSpy = jasmine.createSpyObj('HealthService', ['getAllServicesHealth']);
    const activityServiceSpy = jasmine.createSpyObj('ActivityService', ['getRecentActivities', 'mapToRecentActivities']);

    await TestBed.configureTestingModule({
      declarations: [DashboardMainComponent],
      imports: [
        RouterTestingModule,
        SharedModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: HealthService, useValue: healthServiceSpy },
        { provide: ActivityService, useValue: activityServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardMainComponent);
    component = fixture.componentInstance;
    
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockUserService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    mockHealthService = TestBed.inject(HealthService) as jasmine.SpyObj<HealthService>;
    mockActivityService = TestBed.inject(ActivityService) as jasmine.SpyObj<ActivityService>;

    // Setup default mock returns
    mockAuthService.getCurrentUser.and.returnValue(mockUser);
    mockAuthService.getUserRole.and.returnValue('ADMIN');
    mockAuthService.hasPermission.and.returnValue(true);
    mockUserService.getAllUsers.and.returnValue(of(mockUsers));
    mockUserService.getActiveUsers.and.returnValue(of(mockUsers));
    mockUserService.getUsersByRole.and.returnValue(of(mockUsers));
    mockHealthService.getAllServicesHealth.and.returnValue(of(mockSystemHealth));
    mockActivityService.getRecentActivities.and.returnValue(of(mockActivityResponse));
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

  it('should load dashboard data on init', () => {
    component.ngOnInit();
    expect(mockUserService.getAllUsers).toHaveBeenCalled();
    expect(mockUserService.getActiveUsers).toHaveBeenCalled();
    expect(mockUserService.getUsersByRole).toHaveBeenCalledWith('VETERINARIAN');
    expect(mockHealthService.getAllServicesHealth).toHaveBeenCalled();
    expect(mockActivityService.getRecentActivities).toHaveBeenCalledWith(10);
  });

  it('should filter actions by role', () => {
    component.ngOnInit();
    expect(component.quickActions.length).toBeGreaterThan(0);
  });

  it('should return correct greeting based on time', () => {
    const originalDate = Date;
    
    // Mock morning time
    spyOn(window, 'Date').and.returnValue(new originalDate('2024-01-01T08:00:00Z') as any);
    expect(component.getGreeting()).toBe('Buenos días');
    
    // Mock afternoon time
    (window.Date as any).and.returnValue(new originalDate('2024-01-01T14:00:00Z'));
    expect(component.getGreeting()).toBe('Buenas tardes');
    
    // Mock evening time
    (window.Date as any).and.returnValue(new originalDate('2024-01-01T20:00:00Z'));
    expect(component.getGreeting()).toBe('Buenas noches');
  });

  it('should return correct user display name', () => {
    component.currentUser = mockUser;
    expect(component.getUserDisplayName()).toBe('Test User');
    
    component.currentUser = null;
    expect(component.getUserDisplayName()).toBe('Usuario');
  });

  it('should refresh data', () => {
    spyOn(component as any, 'loadDashboardData');
    component.refreshData();
    expect((component as any).loadDashboardData).toHaveBeenCalled();
    expect(component.currentDate).toBeInstanceOf(Date);
  });

  it('should stop auto refresh', () => {
    component.stopAutoRefresh();
    expect(component.autoRefreshEnabled).toBeFalsy();
  });

  it('should start manual refresh', () => {
    component.autoRefreshEnabled = false;
    component.startManualRefresh();
    expect(component.autoRefreshEnabled).toBeTruthy();
  });

  it('should get correct action color class', () => {
    expect(component.getActionColorClass('primary')).toBe('action-primary');
    expect(component.getActionColorClass('secondary')).toBe('action-secondary');
  });

  it('should return role specific welcome message', () => {
    mockAuthService.getUserRole.and.returnValue('ADMIN');
    expect(component.getRoleSpecificWelcome()).toContain('resumen completo del sistema');
    
    mockAuthService.getUserRole.and.returnValue('VETERINARIAN');
    expect(component.getRoleSpecificWelcome()).toContain('consultas, citas y pacientes');
    
    mockAuthService.getUserRole.and.returnValue('RECEPTIONIST');
    expect(component.getRoleSpecificWelcome()).toContain('citas y clientes del día');
  });

  it('should handle loading state', () => {
    expect(component.loading).toBeTruthy();
    
    component.ngOnInit();
    fixture.detectChanges();
    
    // After data loads, loading should be false
    setTimeout(() => {
      expect(component.loading).toBeFalsy();
    });
  });

  it('should handle error state gracefully', () => {
    mockUserService.getAllUsers.and.returnValue(of([]));
    mockUserService.getActiveUsers.and.returnValue(of([]));
    mockUserService.getUsersByRole.and.returnValue(of([]));
    
    component.ngOnInit();
    fixture.detectChanges();
    
    expect(component.loading).toBeFalsy();
  });

  it('should update quick stats for admin', () => {
    mockAuthService.getUserRole.and.returnValue('ADMIN');
    component.ngOnInit();
    
    expect(component.quickStats.length).toBeGreaterThan(0);
  });

  it('should update quick stats for veterinarian', () => {
    mockAuthService.getUserRole.and.returnValue('VETERINARIAN');
    component.ngOnInit();
    
    expect(component.quickStats.length).toBeGreaterThan(0);
  });

  it('should update quick stats for receptionist', () => {
    mockAuthService.getUserRole.and.returnValue('RECEPTIONIST');
    component.ngOnInit();
    
    expect(component.quickStats.length).toBeGreaterThan(0);
  });

  afterEach(() => {
    fixture.destroy();
  });
}); 