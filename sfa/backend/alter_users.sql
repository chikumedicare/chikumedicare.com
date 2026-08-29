-- This script drops redundant HR and Financial columns from the 'users' table.
-- These fields have been moved to the 'employees' table as part of the architecture decoupling.

ALTER TABLE users DROP COLUMN designation;
ALTER TABLE users DROP COLUMN date_of_joining;
ALTER TABLE users DROP COLUMN date_of_exit;
ALTER TABLE users DROP COLUMN date_of_birth;
ALTER TABLE users DROP COLUMN gender;
ALTER TABLE users DROP COLUMN blood_group;
ALTER TABLE users DROP COLUMN emergency_contact;
ALTER TABLE users DROP COLUMN address;
ALTER TABLE users DROP COLUMN father_name;
ALTER TABLE users DROP COLUMN mother_name;
ALTER TABLE users DROP COLUMN pan_number;
ALTER TABLE users DROP COLUMN aadhar_number;
ALTER TABLE users DROP COLUMN bank_name;
ALTER TABLE users DROP COLUMN bank_account;
ALTER TABLE users DROP COLUMN ifsc_code;
ALTER TABLE users DROP COLUMN department;
ALTER TABLE users DROP COLUMN local_hq_da;
ALTER TABLE users DROP COLUMN ex_hq_da;
ALTER TABLE users DROP COLUMN out_station_da;
ALTER TABLE users DROP COLUMN basic_salary;
ALTER TABLE users DROP COLUMN hra;
ALTER TABLE users DROP COLUMN other_allowances;
