import { useState, useEffect } from 'react';
import type { Headquarter, Area, Beat } from '../../../../core/domain/hr/geography.types';
import type { Doctor } from '../../../../core/domain/master/fieldMaster.types';
import { getErrorMessage } from '../../../../utils/dataIntegrity';
import { toTitleCase } from '../../../../utils/textFormat';
import { SPECIALITY_OPTIONS } from './doctorConstants';

interface UseDoctorFormProps {
  doctor: Doctor | null;
  hqs?: Headquarter[];
  areas?: Area[];
  beats?: Beat[];
  onSave: (draft: Partial<Doctor>) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}

export function useDoctorForm({
  doctor,
  hqs = [],
  areas = [],
  beats = [],
  onSave,
  onClose,
}: UseDoctorFormProps) {
  // 1. Doctor Name, Reg No & Gender
  const [doctorName, setDoctorNameRaw] = useState(doctor?.doctorName || '');
  const setDoctorName = (v: string) => setDoctorNameRaw(toTitleCase(v));
  const [registrationNo, setRegistrationNoRaw] = useState(doctor?.registrationNo || (doctor as any)?.registration_no || '');
  const setRegistrationNo = (v: string) => setRegistrationNoRaw(v.toUpperCase());
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(doctor?.gender || 'Male');

  // 2. Qualifications
  const initialQuals = doctor?.qualification ? doctor.qualification.split(',').map((q) => q.trim()) : ['MBBS'];
  const [selectedQualifications, setSelectedQualifications] = useState<string[]>(initialQuals);
  const [otherQualification, setOtherQualificationRaw] = useState<string>('');
  const setOtherQualification = (v: string) => setOtherQualificationRaw(toTitleCase(v));

  // 3. Speciality
  const isInitialSpecialityOther = Boolean(doctor?.speciality && !SPECIALITY_OPTIONS.includes(doctor.speciality));
  const [speciality, setSpeciality] = useState<string>(
    isInitialSpecialityOther ? 'Other' : (doctor?.speciality || 'General Physician')
  );
  const [otherSpeciality, setOtherSpecialityRaw] = useState<string>(
    isInitialSpecialityOther ? (doctor?.speciality || '') : (doctor?.otherSpeciality || '')
  );
  const setOtherSpeciality = (v: string) => setOtherSpecialityRaw(toTitleCase(v));

  // 4. Doctor Class & Visits
  const [doctorClass, setDoctorClass] = useState<'A' | 'B' | 'C'>(
    (doctor?.doctorClass === 'B' || doctor?.doctorClass === 'C') ? doctor.doctorClass : 'A'
  );
  const [visits, setVisits] = useState<number>(Number(doctor?.visitFrequency) || 2);

  // 5. Territory & Field Geography Cascading
  const [hqId, setHqId] = useState(doctor?.hqId || hqs[0]?.id || '');
  const [areaId, setAreaId] = useState(doctor?.areaId || '');
  const [beatId, setBeatId] = useState(doctor?.beatId || '');

  useEffect(() => {
    if (!hqId && hqs.length > 0) {
      setHqId(hqs[0].id);
    }
  }, [hqs, hqId]);

  const filteredAreas = areas.filter((a) => {
    if (!hqId) return true;
    const aHq = (a as any).hqId || (a as any).hq_id || (a as any).parentHqId;
    return !aHq || aHq === hqId;
  });

  useEffect(() => {
    if (filteredAreas.length > 0) {
      const exists = filteredAreas.some((a) => a.id === areaId);
      if (!exists) {
        setAreaId(filteredAreas[0].id);
      }
    } else {
      setAreaId('');
    }
  }, [hqId, filteredAreas, areaId]);

  const filteredBeats = beats.filter((b) => {
    if (!areaId) return true;
    const bArea = (b as any).areaId || (b as any).area_id || (b as any).parentAreaId;
    return !bArea || bArea === areaId;
  });

  useEffect(() => {
    if (filteredBeats.length > 0) {
      const exists = filteredBeats.some((b) => b.id === beatId);
      if (!exists) {
        setBeatId(filteredBeats[0].id);
      }
    } else {
      setBeatId('');
    }
  }, [areaId, filteredBeats, beatId]);

  // 6. Clinic Address
  const [clinicAdd1, setClinicAdd1Raw] = useState(doctor?.clinicAddressLine1 || doctor?.clinicAddress || '');
  const setClinicAdd1 = (v: string) => setClinicAdd1Raw(toTitleCase(v));
  const [clinicAdd2, setClinicAdd2Raw] = useState(doctor?.clinicAddressLine2 || '');
  const setClinicAdd2 = (v: string) => setClinicAdd2Raw(toTitleCase(v));
  const [clinicCity, setClinicCityRaw] = useState(doctor?.clinicCity || doctor?.city || 'Bhopal');
  const setClinicCity = (v: string) => setClinicCityRaw(toTitleCase(v));
  const [clinicPin, setClinicPin] = useState(doctor?.clinicPin || doctor?.pinCode || '');
  const [clinicState, setClinicState] = useState(doctor?.clinicState || doctor?.state || 'Madhya Pradesh');

  // 7. Permanent Address
  const [sameAsClinic, setSameAsClinic] = useState(false);
  const [permAdd1, setPermAdd1Raw] = useState(doctor?.permAddressLine1 || '');
  const setPermAdd1 = (v: string) => setPermAdd1Raw(toTitleCase(v));
  const [permAdd2, setPermAdd2Raw] = useState(doctor?.permAddressLine2 || '');
  const setPermAdd2 = (v: string) => setPermAdd2Raw(toTitleCase(v));
  const [permCity, setPermCityRaw] = useState(doctor?.permCity || 'Bhopal');
  const setPermCity = (v: string) => setPermCityRaw(toTitleCase(v));
  const [permPin, setPermPin] = useState(doctor?.permPin || '');
  const [permState, setPermState] = useState(doctor?.permState || 'Madhya Pradesh');

  // 8. Personal & Contact
  const [dob, setDob] = useState(doctor?.dob || '');
  const [anniversaryDate, setAnniversaryDate] = useState(doctor?.anniversaryDate || '');
  const [mobile, setMobile] = useState(doctor?.mobile || '');
  const [email, setEmail] = useState(doctor?.email || '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleQualification = (qual: string) => {
    setSelectedQualifications((prev) =>
      prev.includes(qual) ? prev.filter((q) => q !== qual) : [...prev, qual]
    );
  };

  const handleSameAsClinicToggle = (checked: boolean) => {
    setSameAsClinic(checked);
    if (checked) {
      setPermAdd1Raw(clinicAdd1);
      setPermAdd2Raw(clinicAdd2);
      setPermCityRaw(clinicCity);
      setPermPin(clinicPin);
      setPermState(clinicState);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName.trim()) {
      setError('Doctor Name is required.');
      return;
    }
    if (!hqId) {
      setError('Please select Base HQ.');
      return;
    }
    if (speciality === 'Other' && !otherSpeciality.trim()) {
      setError('Please specify the custom speciality.');
      return;
    }
    if (selectedQualifications.includes('Other') && !otherQualification.trim()) {
      setError('Please specify the custom qualification.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const hqObj = hqs.find((h) => h.id === hqId);
      const areaObj = areas.find((a) => a.id === areaId);
      const beatObj = beats.find((b) => b.id === beatId);

      const qualList = selectedQualifications.filter((q) => q !== 'Other');
      if (selectedQualifications.includes('Other') && otherQualification.trim()) {
        qualList.push(toTitleCase(otherQualification.trim()));
      }
      const finalQualString = qualList.join(', ');
      const finalSpecialityString = speciality === 'Other' ? toTitleCase(otherSpeciality.trim()) : speciality;

      const draft: Partial<Doctor> = {
        id: doctor?.id,
        doctorName: toTitleCase(doctorName.trim()),
        registrationNo: registrationNo.trim() || undefined,
        gender,
        qualification: finalQualString,
        otherQualification: selectedQualifications.includes('Other') ? toTitleCase(otherQualification.trim()) : undefined,
        speciality: finalSpecialityString,
        otherSpeciality: speciality === 'Other' ? toTitleCase(otherSpeciality.trim()) : undefined,
        doctorClass,
        visitFrequency: visits,
        hqId,
        hqName: (hqObj as any)?.name || (hqObj as any)?.hq_name || '',
        areaId: areaId || (areaObj as any)?.id || '',
        areaName: (areaObj as any)?.name || (areaObj as any)?.area_name || '',
        beatId: beatId || (beatObj as any)?.id || '',
        beatName: (beatObj as any)?.name || (beatObj as any)?.beat_name || '',
        clinicAddressLine1: toTitleCase(clinicAdd1.trim()),
        clinicAddressLine2: toTitleCase(clinicAdd2.trim()),
        clinicCity: toTitleCase(clinicCity.trim()),
        clinicPin: clinicPin.trim(),
        clinicState,
        clinicAddress: toTitleCase(`${clinicAdd1} ${clinicAdd2}`.trim()),
        city: toTitleCase(clinicCity.trim()),
        pinCode: clinicPin.trim(),
        state: clinicState,
        permAddressLine1: toTitleCase(permAdd1.trim()),
        permAddressLine2: toTitleCase(permAdd2.trim()),
        permCity: toTitleCase(permCity.trim()),
        permPin: permPin.trim(),
        permState,
        dob: dob || undefined,
        anniversaryDate: anniversaryDate || undefined,
        mobile: mobile.trim() || undefined,
        email: email.trim() || undefined,
        isActive: true,
      };

      const res = await onSave(draft);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Failed to save doctor details.');
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return {
    doctorName, setDoctorName,
    registrationNo, setRegistrationNo,
    gender, setGender,
    selectedQualifications, toggleQualification,
    otherQualification, setOtherQualification,
    speciality, setSpeciality,
    otherSpeciality, setOtherSpeciality,
    doctorClass, setDoctorClass,
    visits, setVisits,
    hqId, setHqId,
    areaId, setAreaId,
    beatId, setBeatId,
    filteredAreas, filteredBeats,
    clinicAdd1, setClinicAdd1,
    clinicAdd2, setClinicAdd2,
    clinicCity, setClinicCity,
    clinicPin, setClinicPin,
    clinicState, setClinicState,
    sameAsClinic, handleSameAsClinicToggle,
    permAdd1, setPermAdd1,
    permAdd2, setPermAdd2,
    permCity, setPermCity,
    permPin, setPermPin,
    permState, setPermState,
    dob, setDob,
    anniversaryDate, setAnniversaryDate,
    mobile, setMobile,
    email, setEmail,
    saving, error,
    handleSubmit,
  };
}
