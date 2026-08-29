import { DataService } from './DataService';
import { Env } from '../types';
import { CustomerRepository } from '../repositories/CustomerRepository';

export class CustomerService extends DataService {
	protected async preSaveCheck(env: Env, validData: any, existingData: any, id: string, action: 'CREATE' | 'UPDATE') {
		if (['doctors', 'chemists', 'stockists'].includes(this.collection)) {
			// Strict Deduplication Check
			const nameField = this.collection === 'doctors' ? 'name' : (this.collection === 'chemists' ? 'shop_name' : 'firm_name');
			const checkName = validData[nameField];
			const hqId = validData.hq_id || (existingData && existingData.hq_id);
			
			if (checkName && hqId) {
				const query = `SELECT id FROM ${this.collection} WHERE ${nameField} = ? AND hq_id = ? AND id != ? AND is_active = 1`;
				const existing = await env.chikusfa_db.prepare(query).bind(checkName, hqId, id).first();
				
				if (existing) {
					const entityName = this.collection === 'doctors' ? 'Doctor' : (this.collection === 'chemists' ? 'Chemist' : 'Stockist');
					throw new Error(`409 Conflict: ${entityName} with name '${checkName}' already exists in this territory.`);
				}
			}

			if (validData.hq_id && !validData.state_id && !validData.zone_id) {
				const repo = new CustomerRepository(env);
				const parentHq: any = await repo.getParentHq(validData.hq_id);
				if (parentHq) {
					validData.state_id = parentHq.state_id;
					validData.zone_id = parentHq.zone_id;
				}
			}
		}
	}
}

