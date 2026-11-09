import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResidentsComponent } from './residents';

describe('ResidentsComponent', () => {
  let component: ResidentsComponent;
  let fixture: ComponentFixture<ResidentsComponent>;

  beforeEach(async () => {
    localStorage.removeItem('maintenance-portal-data');

    await TestBed.configureTestingModule({
      imports: [ResidentsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ResidentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and show the seeded residents', () => {
    expect(component).toBeTruthy();
    expect(component.filteredResidents().length).toBe(4);
    expect(component.activeResidents()).toBe(4);
  });

  it('should filter residents by flat number', () => {
    component.searchTerm.set('b-201');

    expect(component.filteredResidents().map((resident) => resident.name)).toEqual(['Amit Kumar']);
  });

  it('should add a resident with a new numeric id', () => {
    component.openAddForm();
    component.residentForm.setValue({
      name: 'Morgan Lee',
      flatNumber: 'C-301',
      phone: '9876543214',
      email: 'morgan.lee@example.com',
      monthlyMaintenance: 3200,
      status: 'Active',
    });

    component.saveResident();

    expect(component.data.residents().length).toBe(5);
    expect(component.data.residents()[4]).toEqual(
      jasmine.objectContaining({ id: 5, name: 'Morgan Lee', flatNumber: 'C-301' }),
    );
    expect(component.showForm()).toBeFalse();
  });

  it('should reject a duplicate flat number', () => {
    component.openAddForm();
    component.residentForm.setValue({
      name: 'Another Resident',
      flatNumber: 'a-101',
      phone: '9876543214',
      email: '',
      monthlyMaintenance: 3000,
      status: 'Active',
    });

    component.saveResident();

    expect(component.data.residents().length).toBe(4);
    expect(component.formError()).toContain('already assigned');
  });
});
