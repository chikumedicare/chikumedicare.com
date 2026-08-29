import type { Employee, Gender, MaritalStatus, AccountType, EmployeeStatus } from '../../core/domain/hr/employee.types';

export function mapEmployeeFromDb(row: Record<string, unknown>): Employee {
  if (!row) return {} as Employee;
  return {
    id: String(row.id || ''),
    empCode: String(row.emp_code || row.empCode || ''),
    firstName: String(row.first_name || row.firstName || ''),
    middleName: row.middle_name ? String(row.middle_name) : (row.middleName ? String(row.middleName) : ''),
    lastName: String(row.last_name || row.lastName || ''),
    dateOfBirth: row.date_of_birth ? String(row.date_of_birth) : (row.dateOfBirth ? String(row.dateOfBirth) : ''),
    gender: (row.gender || 'MALE') as Gender,
    bloodGroup: row.blood_group ? String(row.blood_group) : (row.bloodGroup ? String(row.bloodGroup) : ''),
    maritalStatus: (row.marital_status || row.maritalStatus || 'SINGLE') as MaritalStatus,
    mobile: String(row.mobile || ''),
    alternateMobile: row.alternate_mobile ? String(row.alternate_mobile) : (row.alternateMobile ? String(row.alternateMobile) : ''),
    email: row.email ? String(row.email) : '',
    emergencyContactName: row.emergency_contact_name ? String(row.emergency_contact_name) : (row.emergencyContactName ? String(row.emergencyContactName) : ''),
    emergencyContactNo: row.emergency_contact_no ? String(row.emergency_contact_no) : (row.emergencyContactNo ? String(row.emergencyContactNo) : ''),
    emergencyContactRelation: row.emergency_contact_relation ? String(row.emergency_contact_relation) : (row.emergencyContactRelation ? String(row.emergencyContactRelation) : ''),
    currentAddress: row.current_address ? String(row.current_address) : (row.currentAddress ? String(row.currentAddress) : ''),
    permanentAddress: row.permanent_address ? String(row.permanent_address) : (row.permanentAddress ? String(row.permanentAddress) : ''),
    fatherName: row.father_name ? String(row.father_name) : (row.fatherName ? String(row.fatherName) : ''),
    fatherOccupation: row.father_occupation ? String(row.father_occupation) : (row.fatherOccupation ? String(row.fatherOccupation) : ''),
    motherName: row.mother_name ? String(row.mother_name) : (row.motherName ? String(row.motherName) : ''),
    spouseName: row.spouse_name ? String(row.spouse_name) : (row.spouseName ? String(row.spouseName) : ''),
    numberOfChildren: Number(row.number_of_children || row.numberOfChildren || 0),
    highestQualification: row.highest_qualification ? String(row.highest_qualification) : (row.highestQualification ? String(row.highestQualification) : ''),
    specialization: row.specialization ? String(row.specialization) : '',
    instituteName: row.institute_name ? String(row.institute_name) : (row.instituteName ? String(row.instituteName) : ''),
    passingYear: row.passing_year ? String(row.passing_year) : (row.passingYear ? String(row.passingYear) : ''),
    aadharNumber: row.aadhar_number ? String(row.aadhar_number) : (row.aadharNumber ? String(row.aadharNumber) : ''),
    panNumber: row.pan_number ? String(row.pan_number) : (row.panNumber ? String(row.panNumber) : ''),
    passportNumber: row.passport_number ? String(row.passport_number) : (row.passportNumber ? String(row.passportNumber) : ''),
    passportExpiry: row.passport_expiry ? String(row.passport_expiry) : (row.passportExpiry ? String(row.passportExpiry) : ''),
    drivingLicenseNumber: row.driving_license_number ? String(row.driving_license_number) : (row.drivingLicenseNumber ? String(row.drivingLicenseNumber) : ''),
    drivingLicenseExpiry: row.driving_license_expiry ? String(row.driving_license_expiry) : (row.drivingLicenseExpiry ? String(row.drivingLicenseExpiry) : ''),
    identityDocs: typeof row.identity_docs === 'string' ? JSON.parse(row.identity_docs || '[]') : ((row.identityDocs as string[]) || []),
    bankName: row.bank_name ? String(row.bank_name) : (row.bankName ? String(row.bankName) : ''),
    accountNumber: row.account_number ? String(row.account_number) : (row.accountNumber ? String(row.accountNumber) : ''),
    ifscCode: row.ifsc_code ? String(row.ifsc_code) : (row.ifscCode ? String(row.ifscCode) : ''),
    accountType: (row.account_type || row.accountType || 'SAVINGS') as AccountType,
    status: (row.status || row.employee_status || row.employeeStatus || 'ACTIVE') as EmployeeStatus,
    employeeStatus: (row.employee_status || row.employeeStatus || row.status || 'ACTIVE') as EmployeeStatus,
    isActive: row.is_active === 1 || row.is_active === true || row.isActive === true,
    createdAt: row.created_at ? String(row.created_at) : (row.createdAt ? String(row.createdAt) : ''),
    updatedAt: row.updated_at ? String(row.updated_at) : (row.updatedAt ? String(row.updatedAt) : ''),
  };
}

export function mapEmployeeToDb(emp: Partial<Employee>): Record<string, unknown> {
  const dbObj: Record<string, unknown> = {};
  if (emp.empCode !== undefined) dbObj.emp_code = emp.empCode;
  if (emp.firstName !== undefined) dbObj.first_name = emp.firstName;
  if (emp.middleName !== undefined) dbObj.middle_name = emp.middleName;
  if (emp.lastName !== undefined) dbObj.last_name = emp.lastName;
  if (emp.dateOfBirth !== undefined) dbObj.date_of_birth = emp.dateOfBirth;
  if (emp.gender !== undefined) dbObj.gender = emp.gender;
  if (emp.bloodGroup !== undefined) dbObj.blood_group = emp.bloodGroup;
  if (emp.maritalStatus !== undefined) dbObj.marital_status = emp.maritalStatus;
  if (emp.mobile !== undefined) dbObj.mobile = emp.mobile;
  if (emp.alternateMobile !== undefined) dbObj.alternate_mobile = emp.alternateMobile;
  if (emp.email !== undefined) dbObj.email = emp.email;
  if (emp.emergencyContactName !== undefined) dbObj.emergency_contact_name = emp.emergencyContactName;
  if (emp.emergencyContactNo !== undefined) dbObj.emergency_contact_no = emp.emergencyContactNo;
  if (emp.emergencyContactRelation !== undefined) dbObj.emergency_contact_relation = emp.emergencyContactRelation;
  if (emp.currentAddress !== undefined) dbObj.current_address = emp.currentAddress;
  if (emp.permanentAddress !== undefined) dbObj.permanent_address = emp.permanentAddress;
  if (emp.fatherName !== undefined) dbObj.father_name = emp.fatherName;
  if (emp.fatherOccupation !== undefined) dbObj.father_occupation = emp.fatherOccupation;
  if (emp.motherName !== undefined) dbObj.mother_name = emp.motherName;
  if (emp.spouseName !== undefined) dbObj.spouse_name = emp.spouseName;
  if (emp.numberOfChildren !== undefined) dbObj.number_of_children = emp.numberOfChildren;
  if (emp.highestQualification !== undefined) dbObj.highest_qualification = emp.highestQualification;
  if (emp.specialization !== undefined) dbObj.specialization = emp.specialization;
  if (emp.instituteName !== undefined) dbObj.institute_name = emp.instituteName;
  if (emp.passingYear !== undefined) dbObj.passing_year = emp.passingYear;
  if (emp.aadharNumber !== undefined) dbObj.aadhar_number = emp.aadharNumber;
  if (emp.panNumber !== undefined) dbObj.pan_number = emp.panNumber;
  if (emp.passportNumber !== undefined) dbObj.passport_number = emp.passportNumber;
  if (emp.passportExpiry !== undefined) dbObj.passport_expiry = emp.passportExpiry;
  if (emp.drivingLicenseNumber !== undefined) dbObj.driving_license_number = emp.drivingLicenseNumber;
  if (emp.drivingLicenseExpiry !== undefined) dbObj.driving_license_expiry = emp.drivingLicenseExpiry;
  if (emp.identityDocs !== undefined) dbObj.identity_docs = JSON.stringify(emp.identityDocs || []);
  if (emp.bankName !== undefined) dbObj.bank_name = emp.bankName;
  if (emp.accountNumber !== undefined) dbObj.account_number = emp.accountNumber;
  if (emp.ifscCode !== undefined) dbObj.ifsc_code = emp.ifscCode;
  if (emp.accountType !== undefined) dbObj.account_type = emp.accountType;
  if (emp.employeeStatus !== undefined) dbObj.employee_status = emp.employeeStatus;
  if (emp.isActive !== undefined) dbObj.is_active = emp.isActive ? 1 : 0;
  return dbObj;
}
