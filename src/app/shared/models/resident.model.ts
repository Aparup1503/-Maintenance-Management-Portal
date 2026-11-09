export type ResidentStatus = 'Active' | 'Inactive';

export interface Resident {
  id: number;
  flatNumber: string;
  name: string;
  phone: string;
  email?: string;
  monthlyMaintenance: number;
  status?: ResidentStatus;
}
