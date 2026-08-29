import { DataService } from './DataService';
import { Env, AuthUser } from '../types';
import { EmployeeRepository } from '../repositories/EmployeeRepository';

export class EmployeeService extends DataService {
	protected async preSaveCheck(env: Env, validData: any, existingData: any, id: string, action: 'CREATE' | 'UPDATE') {
		const repo = new EmployeeRepository(env);

		if (action === 'CREATE') {
			// Safely auto-generate sequential CHIKU00001 series Employee Code at D1 level
			const generatedCode = await repo.generateNextEmpCode();
			validData.emp_code = generatedCode;
		} else if (action === 'UPDATE') {
			// Preserve existing emp_code on update
			if (existingData?.emp_code) {
				validData.emp_code = existingData.emp_code;
			}
		}

		if (validData.emp_code && validData.emp_code !== existingData?.emp_code) {
			const existing = await repo.checkEmpCodeExists(validData.emp_code, id);
			if (existing) throw new Error(`Employee Code '${validData.emp_code}' already exists`);
		}
		if (validData.mobile && validData.mobile !== existingData?.mobile) {
			const existing = await repo.checkMobileExists(validData.mobile, id);
			if (existing) throw new Error(`Mobile number '${validData.mobile}' already exists in employees`);
		}
		if (validData.aadhar_number && validData.aadhar_number !== existingData?.aadhar_number) {
			const existing = await repo.checkAadharExists(validData.aadhar_number, id);
			if (existing) throw new Error(`Aadhar number already exists for another employee`);
		}
		if (validData.pan_number && validData.pan_number !== existingData?.pan_number) {
			const existing = await repo.checkPanExists(validData.pan_number, id);
			if (existing) throw new Error(`PAN number already exists for another employee`);
		}
		if (action === 'CREATE' && !validData.first_name) throw new Error('First name is required');
		if (action === 'CREATE' && !validData.mobile) throw new Error('Mobile number is required');
	}

	protected async getAdditionalSaveStatements(env: Env, action: 'CREATE' | 'UPDATE', id: string, validData: any, existingData: any, authUser: AuthUser): Promise<any[]> {
		const stmts: any[] = [];
		const repo = new EmployeeRepository(env);

		if (action === 'UPDATE') {
			const newStatus = validData.employee_status;
			const oldStatus = existingData?.employee_status;
			
			if (newStatus && newStatus !== oldStatus && ['RESIGNED', 'SUSPENDED', 'TERMINATED'].includes(newStatus)) {
				const linkedUser: any = await repo.getLinkedUserByEmpCode(existingData?.emp_code);
				if (linkedUser && linkedUser.is_active) {
					stmts.push(...repo.getDeactivateUserStatements(existingData?.emp_code, linkedUser.id, authUser.id));
				}
			}

			const empCode = validData.emp_code || existingData?.emp_code;
			if (empCode) {
				const firstName = validData.first_name !== undefined ? validData.first_name : existingData?.first_name;
				const lastName = validData.last_name !== undefined ? validData.last_name : existingData?.last_name;
				const fullName = (firstName || lastName) ? `${firstName || ''} ${lastName || ''}`.trim() : undefined;
				const mobile = validData.mobile;
				const email = validData.email;
				if (fullName || mobile || email) {
					stmts.push(...repo.getSyncUserPiiStatements(empCode, { fullName, mobile, email }));
				}
			}
		}
		return stmts;
	}
}

