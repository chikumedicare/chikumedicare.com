import type { Employee } from '../../domain/hr/employee.types';
import type { SfaUser } from '../../domain/hr/user.types';
import type { Headquarter, Area, Beat, Zone, State } from '../../domain/hr/geography.types';

export function parseJsonArray(field: any): string[] {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  try {
    const parsed = JSON.parse(field);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function mapEmployeeFromDb(row: any): Employee {
  return {
    id: String(row.id),
    empCode: row.emp_code || '',
    firstName: row.first_name || '',
    middleName: row.middle_name || '',
    lastName: row.last_name || '',
    dateOfBirth: row.date_of_birth || '',
    gender: row.gender || 'MALE',
    bloodGroup: row.blood_group || 'O+',
    maritalStatus: row.marital_status || 'SINGLE',
    mobile: row.mobile || '',
    alternateMobile: row.alternate_mobile || '',
    email: row.email || '',
    emergencyContactName: row.emergency_contact_name || '',
    emergencyContactNo: row.emergency_contact_no || '',
    emergencyContactRelation: row.emergency_contact_relation || '',
    currentAddress: row.current_address || '',
    permanentAddress: row.permanent_address || '',
    fatherName: row.father_name || '',
    fatherOccupation: row.father_occupation || '',
    motherName: row.mother_name || '',
    spouseName: row.spouse_name || '',
    numberOfChildren: Number(row.number_of_children || 0),
    qualification: row.highest_qualification || '',
    specialization: row.specialization || '',
    university: row.institute_name || '',
    passingYear: row.passing_year || '',
    aadhaarNumber: row.aadhar_number || '',
    panNumber: row.pan_number || '',
    passportNumber: row.passport_number || '',
    passportExpiry: row.passport_expiry || '',
    drivingLicenseNumber: row.driving_license_number || '',
    drivingLicenseExpiry: row.driving_license_expiry || '',
    identityDocs: parseJsonArray(row.identity_docs),
    department: row.department || 'Sales',
    designation: row.designation || undefined,
    joiningDate: row.joining_date || '',
    status: row.employee_status || (row.is_active ? 'ACTIVE' : 'RESIGNED'),
    hqId: row.hq_id || '',
    divisionId: row.division_id || '',
    managerId: row.manager_id || undefined,
    areaId: row.area_id || undefined,
    bankName: row.bank_name || '',
    accountNumber: row.account_number || row.bank_account_no || '',
    ifscCode: row.ifsc_code || row.bank_ifsc || '',
    accountType: row.account_type || row.bank_account_type || 'SAVINGS',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapEmployeeToDb(emp: Partial<Employee>): Record<string, any> {
  const row: Record<string, any> = {};
  if (emp.empCode !== undefined && emp.empCode !== '') row.emp_code = emp.empCode;
  if (emp.firstName !== undefined) row.first_name = emp.firstName;
  if (emp.middleName !== undefined) row.middle_name = emp.middleName;
  if (emp.lastName !== undefined) row.last_name = emp.lastName;
  if (emp.dateOfBirth !== undefined) row.date_of_birth = emp.dateOfBirth;
  if (emp.gender !== undefined) row.gender = emp.gender;
  if (emp.bloodGroup !== undefined) row.blood_group = emp.bloodGroup;
  if (emp.maritalStatus !== undefined) row.marital_status = emp.maritalStatus;
  if (emp.mobile !== undefined) row.mobile = emp.mobile;
  if (emp.alternateMobile !== undefined) row.alternate_mobile = emp.alternateMobile;
  if (emp.email !== undefined) row.email = emp.email;
  if (emp.emergencyContactName !== undefined) row.emergency_contact_name = emp.emergencyContactName;
  if (emp.emergencyContactNo !== undefined) row.emergency_contact_no = emp.emergencyContactNo;
  if (emp.emergencyContactRelation !== undefined) row.emergency_contact_relation = emp.emergencyContactRelation;
  if (emp.currentAddress !== undefined) row.current_address = emp.currentAddress;
  if (emp.permanentAddress !== undefined) row.permanent_address = emp.permanentAddress;
  if (emp.fatherName !== undefined) row.father_name = emp.fatherName;
  if (emp.fatherOccupation !== undefined) row.father_occupation = emp.fatherOccupation;
  if (emp.motherName !== undefined) row.mother_name = emp.motherName;
  if (emp.spouseName !== undefined) row.spouse_name = emp.spouseName;
  if (emp.numberOfChildren !== undefined) row.number_of_children = Number(emp.numberOfChildren || 0);
  if (emp.qualification !== undefined) row.highest_qualification = emp.qualification;
  if (emp.specialization !== undefined) row.specialization = emp.specialization;
  if (emp.university !== undefined) row.institute_name = emp.university;
  if (emp.passingYear !== undefined) row.passing_year = emp.passingYear;
  if (emp.aadhaarNumber !== undefined) row.aadhar_number = emp.aadhaarNumber;
  if (emp.panNumber !== undefined) row.pan_number = emp.panNumber;
  if (emp.passportNumber !== undefined) row.passport_number = emp.passportNumber;
  if (emp.passportExpiry !== undefined) row.passport_expiry = emp.passportExpiry;
  if (emp.drivingLicenseNumber !== undefined) row.driving_license_number = emp.drivingLicenseNumber;
  if (emp.drivingLicenseExpiry !== undefined) row.driving_license_expiry = emp.drivingLicenseExpiry;
  if (emp.identityDocs !== undefined) row.identity_docs = JSON.stringify(emp.identityDocs || []);
  if (emp.department !== undefined) row.department = emp.department;
  if (emp.joiningDate !== undefined) row.joining_date = emp.joiningDate;
  if (emp.status !== undefined) {
    row.employee_status = emp.status;
    row.is_active = emp.status === 'ACTIVE' ? 1 : 0;
  }
  if (emp.hqId !== undefined) row.hq_id = emp.hqId;
  if (emp.divisionId !== undefined) row.division_id = emp.divisionId;
  if (emp.managerId !== undefined) row.manager_id = emp.managerId || null;
  if (emp.areaId !== undefined) row.area_id = emp.areaId || null;
  if (emp.bankName !== undefined) row.bank_name = emp.bankName;
  if (emp.accountNumber !== undefined) row.account_number = emp.accountNumber;
  if (emp.ifscCode !== undefined) row.ifsc_code = emp.ifscCode;
  if (emp.accountType !== undefined) row.account_type = emp.accountType;
  return row;
}

export function mapUserFromDb(row: any): SfaUser {
  return {
    id: String(row.id),
    userId: row.user_id || '',
    empCode: row.emp_code || '',
    fullName: row.full_name || '',
    role: row.role || 'MR',
    isActive: row.is_active === 1 || row.is_active === true,
    mobile: row.mobile || '',
    email: row.email || '',
    designation: row.designation || '',
    hqId: row.hq_id || '',
    reportsToId: row.reports_to_id || row.manager_id || '',
    coveringHqIds: parseJsonArray(row.covering_hq_ids),
    areaIds: parseJsonArray(row.area_ids),
    divisionId: row.division_id || '',
    joiningDate: row.joining_date || (row.registered_on ? row.registered_on.split(' ')[0] : ''),
    deviceId: row.device_id || '',
    deviceName: row.device_name || '',
    deviceModel: row.device_model || '',
    osVersion: row.os_version || '',
    appVersion: row.app_version || '',
    registeredOn: row.registered_on || '',
    lastLogin: row.last_login || '',
    failedLoginAttempts: Number(row.failed_login_attempts || 0),
    lockedUntil: row.locked_until || null,
    status: row.status || (row.is_active ? 'ACTIVE' : 'INACTIVE'),
  };
}

export function mapHqFromDb(row: any): Headquarter {
  return {
    id: String(row.id),
    code: row.hq_code || '',
    name: row.hq_name || '',
    stateId: row.state_id || undefined,
    zoneId: row.zone_id || undefined,
    hqType: row.hq_type || 'HQ',
    city: row.city || '',
    district: row.district || '',
    pinCode: row.pin_code || '',
    latitude: row.latitude != null ? Number(row.latitude) : undefined,
    longitude: row.longitude != null ? Number(row.longitude) : undefined,
    isPoolHq: row.is_pool_hq === 1,
    parentPoolHqId: row.parent_pool_hq_id || undefined,
    isSuperHq: row.is_super_hq === 1,
    displayOrder: row.display_order != null ? Number(row.display_order) : 0,
    description: row.description || '',
    isActive: row.is_active === 1 || row.is_active === true,
    divisionId: row.division_id || '',
  };
}

export function mapAreaFromDb(row: any): Area {
  return {
    id: String(row.id),
    code: row.area_code || row.code || '',
    name: row.area_name || row.name || '',
    hqId: row.hq_id || '',
    zoneId: row.zone_id || undefined,
    stateId: row.state_id || undefined,
    territoryType: row.territory_type || 'LOCAL',
    travelMode: row.travel_mode || 'TWO_SIDE',
    defaultTravelMode: row.default_travel_mode || 'TWO_SIDE',
    bothSideAllowed: row.both_side_allowed === 1,
    displayOrder: row.display_order != null ? Number(row.display_order) : 0,
    description: row.description || '',
    isActive: row.is_active === 1 || row.is_active === true,
    divisionId: row.division_id || '',
  };
}

export function mapBeatFromDb(row: any): Beat {
  return {
    id: String(row.id),
    code: row.beat_code || row.code || '',
    name: row.beat_name || row.name || '',
    areaId: row.area_id || '',
    hqId: row.hq_id || undefined,
    stateId: row.state_id || undefined,
    zoneId: row.zone_id || undefined,
    beatType: row.beat_type || 'CORE',
    displayOrder: row.display_order != null ? Number(row.display_order) : 0,
    description: row.description || '',
    isActive: row.is_active === 1 || row.is_active === true,
    divisionId: row.division_id || '',
  };
}

export function mapZoneFromDb(row: any): Zone {
  return {
    id: String(row.id),
    code: row.zone_code || row.code || '',
    name: row.name || row.zone_name || '',
    headUserId: row.head_user_id || undefined,
    headUserName: row.head_user_name || undefined,
    description: row.description || '',
    isActive: row.is_active === 1 || row.is_active === true,
    divisionId: row.division_id || '',
  };
}

export function mapStateFromDb(row: any): State {
  return {
    id: String(row.id),
    code: row.state_code || row.code || '',
    name: row.state_name || row.name || '',
    zoneId: row.zone_id || '',
    displayOrder: row.display_order != null ? Number(row.display_order) : 0,
    description: row.description || '',
    isActive: row.is_active === 1 || row.is_active === true,
    divisionId: row.division_id || '',
  };
}
