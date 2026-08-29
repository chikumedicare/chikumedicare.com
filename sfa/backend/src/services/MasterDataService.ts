import { DataService } from './DataService';
import { Env } from '../types';
import { MasterDataRepository } from '../repositories/MasterDataRepository';

export class MasterDataService extends DataService {
	protected async preSaveCheck(env: Env, validData: any, existingData: any, id: string, action: 'CREATE' | 'UPDATE') {
		if (this.collection === 'states' && !validData.zone_id && (!existingData || !existingData.zone_id)) throw new Error('State requires a Zone');
		if (this.collection === 'hqs' && validData.hq_type !== 'HO' && !validData.is_super_hq && !validData.state_id && (!existingData || !existingData.state_id)) throw new Error('HQ requires a State');
		if (this.collection === 'areas' && !validData.hq_id && (!existingData || !existingData.hq_id)) throw new Error('Area requires an HQ');

		if (this.collection === 'zones') {
			if (validData.zone_code && validData.zone_code !== existingData?.zone_code) {
				const repo = new MasterDataRepository(env);
				const existingCode = await repo.checkZoneCodeExists(validData.zone_code, id);
				if (existingCode) throw new Error(`Zone Code '${validData.zone_code}' already exists`);
			}
			if (validData.name && validData.name !== existingData?.name) {
				const repo = new MasterDataRepository(env);
				const existingName = await repo.checkZoneNameExists(validData.name, id);
				if (existingName) throw new Error(`Zone Name '${validData.name}' already exists`);
			}
		}

		if (this.collection === 'states') {
			if (validData.state_code && validData.state_code !== existingData?.state_code) {
				const repo = new MasterDataRepository(env);
				const existingCode = await repo.checkStateCodeExists(validData.state_code, id);
				if (existingCode) throw new Error(`State Code '${validData.state_code}' already exists`);
			}
			if (validData.state_name && validData.state_name !== existingData?.state_name) {
				const repo = new MasterDataRepository(env);
				const existingName = await repo.checkStateNameExists(validData.state_name, validData.zone_id, id);
				if (existingName) throw new Error(`State Name '${validData.state_name}' already exists in this Zone`);
			}
			
			if (validData.is_active === false && (!existingData || existingData.is_active !== 0)) {
				const repo = new MasterDataRepository(env);
				const activeHqs = await repo.checkActiveHqsInState(id);
				if (activeHqs) throw new Error(`Cannot deactivate State because it has active HQs`);
			}
		}

		if (this.collection === 'hqs') {
			if (validData.hq_code && validData.hq_code !== existingData?.hq_code) {
				const repo = new MasterDataRepository(env);
				const existingCode = await repo.checkHqCodeExists(validData.hq_code, id);
				if (existingCode) throw new Error(`HQ Code '${validData.hq_code}' already exists`);
			}
			if (validData.hq_name && validData.hq_name !== existingData?.hq_name) {
				const repo = new MasterDataRepository(env);
				const existingName = await repo.checkHqNameExists(validData.hq_name, validData.state_id, id);
				if (existingName) throw new Error(`HQ Name '${validData.hq_name}' already exists in this State`);
			}
			
			if (validData.is_active === false && (!existingData || existingData.is_active !== 0)) {
				const repo = new MasterDataRepository(env);
				const activeDeps = await repo.checkActiveDepsForHq(id);
				if (activeDeps) throw new Error(`Cannot deactivate HQ because it has active dependencies (Areas, Users, Doctors, Chemists, or Stockists)`);
			}
		}

		if (this.collection === 'areas') {
			if (validData.area_code && validData.area_code !== existingData?.area_code) {
				const repo = new MasterDataRepository(env);
				const existingCode = await repo.checkAreaCodeExists(validData.area_code, id);
				if (existingCode) throw new Error(`Area Code '${validData.area_code}' already exists`);
			}
			if (validData.area_name && validData.area_name !== existingData?.area_name) {
				const repo = new MasterDataRepository(env);
				const existingName = await repo.checkAreaNameExists(validData.area_name, validData.hq_id, id);
				if (existingName) throw new Error(`Area Name '${validData.area_name}' already exists in this HQ`);
			}
			
			if (validData.is_active === false && (!existingData || existingData.is_active !== 0)) {
				const repo = new MasterDataRepository(env);
				const activeDeps = await repo.checkActiveDepsForHq(id);
				if (activeDeps) throw new Error(`Cannot deactivate Beat because it has active dependencies (Doctors, Chemists, Stockists, Targets, DCR)`);
			}

			if (validData.area_id) {
				const repo = new MasterDataRepository(env);
				const parentArea: any = await repo.getParentArea(validData.area_id);
				if (parentArea) {
					validData.hq_id = parentArea.hq_id;
					validData.state_id = parentArea.state_id;
					validData.zone_id = parentArea.zone_id;
				}
			}
		}
	}

	protected async preDeleteCheck(env: Env, id: string) {
		if (this.collection === 'zones') {
			const repo = new MasterDataRepository(env);
			if (await repo.hasActiveStates(id)) throw new Error('Cannot delete Zone if active States exist');
		} else if (this.collection === 'states') {
			const repo = new MasterDataRepository(env);
			if (await repo.hasActiveHqs(id)) throw new Error('Cannot delete State if active HQs exist');
		} else if (this.collection === 'hqs') {
			const repo = new MasterDataRepository(env);
			if (await repo.hasActiveAreas(id)) throw new Error('Cannot delete HQ if active Areas exist');
		} else if (this.collection === 'areas') {
			const repo = new MasterDataRepository(env);
			if (await repo.hasUsersMappedToArea(id)) throw new Error('Cannot delete Area if Users are mapped to it');
		}
	}
}


