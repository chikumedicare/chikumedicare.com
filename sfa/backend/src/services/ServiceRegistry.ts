import { DataService } from './DataService';
import { UserService } from './UserService';
import { MasterDataService } from './MasterDataService';
import { CustomerService } from './CustomerService';
import { EmployeeService } from './EmployeeService';
import { LeaveApplicationService } from './LeaveApplicationService';
import { DcrService } from './DcrService';
import { TargetService } from './TargetService';
import { SalesService } from './SalesService';

export class ServiceRegistry {
	private static services = new Map<string, DataService>();

	public static get(collection: string): DataService {
		if (this.services.has(collection)) {
			return this.services.get(collection)!;
		}

		let service: DataService;
		switch (collection) {
			case 'users':
				service = new UserService(collection);
				break;
			case 'hqs':
			case 'areas':
			case 'beats':
			case 'zones':
			case 'states':
				service = new MasterDataService(collection);
				break;
			case 'doctors':
			case 'chemists':
			case 'stockists':
				service = new CustomerService(collection);
				break;
			case 'employees':
				service = new EmployeeService(collection);
				break;
			case 'leave_applications':
				service = new LeaveApplicationService(collection);
				break;
			case 'dcr_entries':
				service = new DcrService();
				break;
			case 'sales_targets':
				service = new TargetService();
				break;
			case 'sales_entries':
				service = new SalesService();
				break;
			default:
				service = new DataService(collection);
				break;
		}

		this.services.set(collection, service);
		return service;
	}
}
