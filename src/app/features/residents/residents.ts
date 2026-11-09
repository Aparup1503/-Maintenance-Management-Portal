import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MaintenanceDataService } from '../../core/services/maintenance-data.service';
import type { Resident, ResidentStatus } from '../../shared/models/resident.model';
import { notBlankValidator } from '../../shared/validators/not-blank.validator';

type ResidentStatusFilter = 'All' | ResidentStatus;

@Component({
  selector: 'app-residents',
  imports: [CurrencyPipe, ReactiveFormsModule],
  templateUrl: './residents.html',
  styleUrl: './residents.scss',
})
export class ResidentsComponent {
  readonly data = inject(MaintenanceDataService);
  private readonly fb = inject(FormBuilder);

  readonly searchTerm = signal('');
  readonly selectedStatus = signal<ResidentStatusFilter>('All');
  readonly editingResidentId = signal<number | null>(null);
  readonly showForm = signal(false);
  readonly formError = signal('');

  readonly residentForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, notBlankValidator()]],
    flatNumber: ['', [Validators.required, notBlankValidator()]],
    phone: ['', [Validators.required, notBlankValidator(), Validators.pattern(/^[0-9+()\-\s]{7,20}$/)]],
    email: ['', Validators.email],
    monthlyMaintenance: [3000, [Validators.required, Validators.min(0)]],
    status: ['Active' as ResidentStatus, Validators.required],
  });

  readonly activeResidents = computed(
    () => this.data.residents().filter((resident) => (resident.status ?? 'Active') === 'Active').length,
  );

  readonly monthlyMaintenanceTotal = computed(() =>
    this.data
      .residents()
      .filter((resident) => (resident.status ?? 'Active') === 'Active')
      .reduce((total, resident) => total + resident.monthlyMaintenance, 0),
  );

  readonly filteredResidents = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const status = this.selectedStatus();

    return this.data.residents().filter((resident) => {
      const matchesSearch =
        !search ||
        resident.name.toLowerCase().includes(search) ||
        resident.flatNumber.toLowerCase().includes(search) ||
        resident.phone.toLowerCase().includes(search) ||
        resident.email?.toLowerCase().includes(search);
      const matchesStatus = status === 'All' || (resident.status ?? 'Active') === status;

      return matchesSearch && matchesStatus;
    });
  });

  onSearchChange(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  onStatusChange(event: Event): void {
    this.selectedStatus.set((event.target as HTMLSelectElement).value as ResidentStatusFilter);
  }

  openAddForm(): void {
    this.editingResidentId.set(null);
    this.formError.set('');
    this.residentForm.reset({
      name: '',
      flatNumber: '',
      phone: '',
      email: '',
      monthlyMaintenance: 3000,
      status: 'Active',
    });
    this.showForm.set(true);
  }

  editResident(resident: Resident): void {
    this.editingResidentId.set(resident.id);
    this.formError.set('');
    this.residentForm.reset({
      name: resident.name,
      flatNumber: resident.flatNumber,
      phone: resident.phone,
      email: resident.email ?? '',
      monthlyMaintenance: resident.monthlyMaintenance,
      status: resident.status ?? 'Active',
    });
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.formError.set('');
    this.residentForm.reset();
  }

  saveResident(): void {
    this.residentForm.markAllAsTouched();
    this.formError.set('');

    if (this.residentForm.invalid) {
      return;
    }

    const values = this.residentForm.getRawValue();
    const flatNumber = values.flatNumber.trim();
    const editingId = this.editingResidentId();
    const duplicateFlat = this.data.residents().some(
      (resident) =>
        resident.id !== editingId &&
        resident.flatNumber.trim().toLowerCase() === flatNumber.toLowerCase(),
    );

    if (duplicateFlat) {
      this.formError.set('That flat number is already assigned to a resident.');
      return;
    }

    const residentData: Omit<Resident, 'id'> = {
      name: values.name.trim(),
      flatNumber,
      phone: values.phone.trim(),
      email: values.email.trim(),
      monthlyMaintenance: values.monthlyMaintenance,
      status: values.status,
    };

    if (editingId === null) {
      this.data.addResident(residentData);
    } else {
      this.data.updateResident(editingId, residentData);
    }

    this.closeForm();
  }
}
