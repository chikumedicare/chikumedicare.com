import type { Division, HeadOfficeProfile } from '../domain/hr/headOffice.types';

export type { Division, HeadOfficeProfile };

export interface IHeadOfficeGateway {
  getDivisions(): Promise<Division[]>;
  saveDivision(div: Partial<Division>): Promise<Division>;
  deleteDivision(id: string): Promise<void>;
  getHeadOfficeProfile(): Promise<HeadOfficeProfile>;
  updateHeadOfficeProfile(profile: Partial<HeadOfficeProfile>): Promise<HeadOfficeProfile>;
}
