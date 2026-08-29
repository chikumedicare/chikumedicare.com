-- Migration: Clean employees table schema to match Person Master requirements

CREATE TABLE IF NOT EXISTS employees_new (
    id TEXT PRIMARY KEY,
    emp_code TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    date_of_birth TEXT,
    gender TEXT CHECK(gender IN ('MALE','FEMALE','OTHER')),
    blood_group TEXT,
    marital_status TEXT CHECK(marital_status IN ('SINGLE','MARRIED','DIVORCED','WIDOWED')),
    mobile TEXT NOT NULL,
    alternate_mobile TEXT,
    email TEXT,
    emergency_contact_name TEXT,
    emergency_contact_no TEXT,
    emergency_contact_relation TEXT,
    current_address TEXT,
    permanent_address TEXT,
    father_name TEXT,
    father_occupation TEXT,
    mother_name TEXT,
    spouse_name TEXT,
    number_of_children INTEGER DEFAULT 0,
    highest_qualification TEXT,
    specialization TEXT,
    institute_name TEXT,
    passing_year TEXT,
    aadhar_number TEXT,
    pan_number TEXT,
    passport_number TEXT,
    passport_expiry TEXT,
    driving_license_number TEXT,
    driving_license_expiry TEXT,
    identity_docs TEXT DEFAULT '[]',
    bank_name TEXT,
    account_number TEXT,
    ifsc_code TEXT,
    account_type TEXT CHECK(account_type IN ('SAVINGS','CURRENT')),
    employee_status TEXT DEFAULT 'ACTIVE' CHECK(employee_status IN ('ACTIVE','INACTIVE','PROBATION','RESIGNED','SUSPENDED','TERMINATED')),
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    created_by TEXT,
    updated_at TEXT DEFAULT (datetime('now')),
    updated_by TEXT
);

INSERT INTO employees_new (
    id, emp_code, first_name, middle_name, last_name, date_of_birth, gender, blood_group, marital_status,
    mobile, alternate_mobile, email, emergency_contact_name, emergency_contact_no, emergency_contact_relation,
    current_address, permanent_address, father_name, father_occupation, mother_name, spouse_name, number_of_children,
    highest_qualification, specialization, institute_name, passing_year, aadhar_number, pan_number, passport_number, passport_expiry,
    driving_license_number, driving_license_expiry, identity_docs, bank_name, account_number, ifsc_code, account_type,
    employee_status, is_active, created_at, created_by, updated_at, updated_by
)
SELECT 
    id, emp_code, first_name, middle_name, last_name, date_of_birth, gender, blood_group, marital_status,
    mobile, alternate_mobile, email, emergency_contact_name, emergency_contact_no, emergency_contact_relation,
    current_address, permanent_address, father_name, father_occupation, mother_name, spouse_name, number_of_children,
    highest_qualification, specialization, institute_name, passing_year, aadhar_number, pan_number, passport_number, passport_expiry,
    driving_license_number, driving_license_expiry, identity_docs, bank_name, account_number, ifsc_code, account_type,
    employee_status, is_active, created_at, created_by, updated_at, updated_by
FROM employees;

DROP TABLE employees;

ALTER TABLE employees_new RENAME TO employees;
