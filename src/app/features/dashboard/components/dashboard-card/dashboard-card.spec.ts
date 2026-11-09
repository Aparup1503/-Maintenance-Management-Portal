import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardCardComponent } from './dashboard-card';

describe('DashboardCardComponent', () => {
  let component: DashboardCardComponent;
  let fixture: ComponentFixture<DashboardCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    // Arrange
    fixture.componentRef.setInput('title', 'Monthly Collection');

    // Act
    fixture.detectChanges();

    // Assert
    expect(component).toBeTruthy();
  });

  it('should receive the required title input', () => {
    // Arrange
    const title = 'Monthly Collection';

    // Act
    fixture.componentRef.setInput('title', title);
    fixture.detectChanges();

    // Assert
    expect(component.title()).toBe(title);
  });

  it('should receive an optional subtitle input', () => {
    // Arrange
    const subtitle = 'Current month collection';

    fixture.componentRef.setInput('title', 'Monthly Collection');

    // Act
    fixture.componentRef.setInput('subtitle', subtitle);
    fixture.detectChanges();

    // Assert
    expect(component.subtitle()).toBe(subtitle);
  });
});
