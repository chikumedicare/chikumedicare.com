import { useState, useCallback, useEffect } from 'react';
import type { EmployeeUserDraft, EmployeeUserRecord } from './employeeUser.types';
import type { SfaUser } from '../../../core/domain/hr/user.types';
import type { Employee } from '../../../core/domain/hr/employee.types';
import { GatewayContainer } from '../../../core/container/GatewayContainer';
import { ApiClient } from '../../../infrastructure/api/ApiClient';
import { getErrorMessage } from '../../../utils/dataIntegrity';

export function useEmployeeUserActions() {
  const [users, setUsers] = useState<SfaUser[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<EmployeeUserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userGateway = GatewayContainer.getUserGateway();
  const empGateway = GatewayContainer.getEmployeeGateway();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [uList, eList] = await Promise.all([
        userGateway.getUsers(),
        empGateway.getEmployees(),
      ]);
      setUsers(uList);
      setEmployees(eList);

      // Merge into unified EmployeeUserRecord[]
      const merged: EmployeeUserRecord[] = uList.map((u) => {
        const emp = eList.find(
          (e) => e.empCode === u.userId || e.empCode === u.empCode || e.id === u.id
        );
        return {
          id: u.id,
          userId: u.userId,
          empCode: u.userId,
          fullName: u.fullName || (emp ? `${emp.firstName} ${emp.lastName}` : u.userId),
          firstName: emp?.firstName || u.fullName.split(' ')[0] || u.userId,
          middleName: emp?.middleName || '',
          lastName: emp?.lastName || u.fullName.split(' ').slice(1).join(' ') || '',
          role: u.role,
          divisionId: u.divisionId,
          hqId: u.hqId,
          reportsToId: u.reportsToId,
          joiningDate: u.joiningDate,
          isActive: u.isActive,
          mobile: u.mobile || emp?.mobile || '',
          alternateMobile: emp?.alternateMobile,
          email: u.email || emp?.email,
          dateOfBirth: emp?.dateOfBirth,
          gender: emp?.gender || 'MALE',
          bloodGroup: emp?.bloodGroup,
          maritalStatus: emp?.maritalStatus || 'SINGLE',
          currentAddress: emp?.currentAddress,
          permanentAddress: emp?.permanentAddress,
          fatherName: emp?.fatherName,
          motherName: emp?.motherName,
          spouseName: emp?.spouseName,
          panNumber: emp?.panNumber,
          aadhaarNumber: emp?.aadhaarNumber || (emp as any)?.aadharNumber,
          bankName: emp?.bankName,
          accountNumber: emp?.accountNumber,
          ifscCode: emp?.ifscCode,
          accountType: emp?.accountType,
          emergencyContactName: emp?.emergencyContactName,
          emergencyContactNo: emp?.emergencyContactNo,
          emergencyContactRelation: emp?.emergencyContactRelation,
          qualification: emp?.qualification || emp?.highestQualification,
          passingYear: emp?.passingYear,
        };
      });

      setRecords(merged);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [userGateway, empGateway]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveEmployeeUser = useCallback(
    async (draft: EmployeeUserDraft): Promise<{ success: boolean; error?: string }> => {
      setLoading(true);
      try {
        const isEditing = Boolean(draft.id);

        if (isEditing && draft.id) {
          // Update User
          await userGateway.updateUser(draft.id, {
            fullName: `${draft.firstName} ${draft.lastName}`.trim(),
            mobile: draft.mobile,
            email: draft.email,
            role: draft.role,
            divisionId: draft.divisionId || undefined,
            hqId: draft.hqId || undefined,
            reportsToId: draft.reportsToId || undefined,
            joiningDate: draft.joiningDate,
            isActive: draft.isActive,
          });

          if (draft.password && draft.password.trim().length > 0) {
            await userGateway.resetPassword(draft.id, draft.password.trim());
          }

          // Update matching Employee
          const emp = employees.find((e) => e.empCode === draft.userId);
          if (emp) {
            await empGateway.updateEmployee(emp.id, {
              firstName: draft.firstName,
              lastName: draft.lastName,
              middleName: draft.middleName,
              mobile: draft.mobile,
              alternateMobile: draft.alternateMobile,
              email: draft.email,
              dateOfBirth: draft.dateOfBirth,
              gender: draft.gender,
              bloodGroup: draft.bloodGroup,
              maritalStatus: draft.maritalStatus,
              currentAddress: draft.currentAddress,
              permanentAddress: draft.permanentAddress,
              fatherName: draft.fatherName,
              spouseName: draft.spouseName,
              panNumber: draft.panNumber,
              aadharNumber: draft.aadhaarNumber,
              bankName: draft.bankName,
              accountNumber: draft.accountNumber,
              ifscCode: draft.ifscCode,
              accountType: draft.accountType,
              emergencyContactName: draft.emergencyContactName,
              emergencyContactNo: draft.emergencyContactNo,
              emergencyContactRelation: draft.emergencyContactRelation,
              highestQualification: draft.qualification,
              passingYear: draft.passingYear,
            });
          }
        } else {
          // Create User
          await userGateway.createUser({
            userId: draft.userId.trim().toUpperCase(),
            empCode: draft.userId.trim().toUpperCase(),
            fullName: `${draft.firstName} ${draft.lastName}`.trim(),
            role: draft.role,
            password: (draft.password || draft.userId).trim().toLowerCase(),
            mobile: draft.mobile,
            email: draft.email,
            divisionId: draft.divisionId || undefined,
            hqId: draft.hqId || undefined,
            joiningDate: draft.joiningDate,
          });

          // Create Employee
          await empGateway.createEmployee({
            empCode: draft.userId.trim().toUpperCase(),
            firstName: draft.firstName,
            lastName: draft.lastName,
            middleName: draft.middleName,
            mobile: draft.mobile,
            alternateMobile: draft.alternateMobile,
            email: draft.email,
            dateOfBirth: draft.dateOfBirth,
            gender: draft.gender,
            bloodGroup: draft.bloodGroup,
            maritalStatus: draft.maritalStatus,
            currentAddress: draft.currentAddress,
            permanentAddress: draft.permanentAddress,
            fatherName: draft.fatherName,
            spouseName: draft.spouseName,
            panNumber: draft.panNumber,
            aadharNumber: draft.aadhaarNumber,
            bankName: draft.bankName,
            accountNumber: draft.accountNumber,
            ifscCode: draft.ifscCode,
            accountType: draft.accountType,
            emergencyContactName: draft.emergencyContactName,
            emergencyContactNo: draft.emergencyContactNo,
            emergencyContactRelation: draft.emergencyContactRelation,
            highestQualification: draft.qualification,
            passingYear: draft.passingYear,
          });
        }

        await refresh();
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err) };
      } finally {
        setLoading(false);
      }
    },
    [userGateway, empGateway, employees, refresh]
  );

  const toggleActive = useCallback(
    async (item: EmployeeUserRecord) => {
      try {
        setLoading(true);
        await userGateway.updateUser(item.id, { isActive: !item.isActive });
        const emp = employees.find((e) => e.empCode === item.userId);
        if (emp) {
          await empGateway.toggleEmployeeStatus(emp.id, !item.isActive);
        }
        await refresh();
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [userGateway, empGateway, employees, refresh]
  );

  const deleteRecord = useCallback(
    async (item: EmployeeUserRecord) => {
      try {
        setLoading(true);
        if (userGateway.deleteUser) {
          await userGateway.deleteUser(item.id);
        } else {
          await ApiClient.fetch('/api/data/users/' + item.id, { method: 'DELETE' });
        }
        const emp = employees.find((e) => e.empCode === item.userId);
        if (emp) {
          await ApiClient.fetch('/api/data/employees/' + emp.id, { method: 'DELETE' });
        }
        await refresh();
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [userGateway, empGateway, employees, refresh]
  );

  return {
    records,
    users,
    employees,
    loading,
    error,
    refresh,
    saveEmployeeUser,
    toggleActive,
    deleteRecord,
  };
}
