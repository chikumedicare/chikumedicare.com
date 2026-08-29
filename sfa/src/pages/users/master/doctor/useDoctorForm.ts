import { useState } from 'react';
import type { Headquarter, Area, Beat } from '../../../../core/domain/hr/geography.types';
import type { Doctor } from '../../../../core/domain/master/fieldMaster.types';
import { getErrorMessage } from '../../../../utils/dataIntegrity';
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
  // 1. Doctor Name & Gender
  const [doctorName, setDoctorName] = useState(doctor?.doctorName || '');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(doctor?.gender || 'Male');

  // 2. Qualifications
  const initialQuals = doctor?.qualification ? doctor.qualification.split(',').map((q) => q.trim()) : ['MBBS'];
  const [selectedQualifications, setSelectedQualifications] = useState<string[]>(initialQuals);
  const [otherQualification, setOtherQualification] = useState<string>('');

  // 3. Speciality
  const isInitialSpecialityOther = Boolean(doctor?.speciality && !SPECIALITY_OPTIONS.includes(doctor.speciality));
  const [speciality, setSpeciality] = useState<string>(
    isInitialSpecialityOther ? 'Other' : (doctor?.speciality || 'General Physician')
  );
  const [otherSpeciality, setOtherSpeciality] = useState<string>(
    isInitialSpecialityOther ? (doctor?.speciality || '') : (doctor?.otherSpeciality || '')
  );

  // 4. Doctor Class & Visits
  const [doctorClass, setDoctorClass] = useState<'A' | 'B' | 'C'>(
    (doctor?.doctorClass === 'B' || doctor?.doctorClass === 'C') ? doctor.doctorClass : 'A'
  );
  const [visits, setVisits] = useState<number>(Number(doctor?.visitFrequency) || 2);

  // 5. Territory & Geography
  const [hqId, setHqId] = useState(doctor?.hqId || hqs[0]?.id || '');
  const filteredAreas = areas.filter((a) => !hqId || a.hqId === hqId || (a as any).hq_id === hqId);
  const [areaId, setAreaId] = useState(doctor?.areaId || filteredAreas[0]?.id || areas[0]?.id || '');
  const filteredBeats = beats.filter((b) => !areaId || b.areaId === areaId || (b as any).area_id === areaId);
  const [beatId, setBeatId] = useState(doctor?.beatId || filteredBeats[0]?.id || beats[0]?.id || '');

  // 6. Clinic Address
  const [clinicAdd1, setClinicAdd1] = useState(doctor?.clinicAddressLine1 || doctor?.clinicAddress || '');
  const [clinicAdd2, setClinicAdd2] = useState(doctor?.clinicAddressLine2 || '');
  const [clinicCity, setClinicCity] = useState(doctor?.clinicCity || doctor?.city || 'Bhopal');
  const [clinicPin, setClinicPin] = useState(doctor?.clinicPin || doctor?.pinCode || '');
  const [clinicState, setClinicState] = useState(doctor?.clinicState || doctor?.state || 'Madhya Pradesh');

  // 7. Permanent Address
  const [sameAsClinic, setSameAsClinic] = useState(false);
  const [permAdd1, setPermAdd1] = useState(doctor?.permAddressLine1 || '');
  const [permAdd2, setPermAdd2] = useState(doctor?.permAddressLine2 || '');
  const [permCity, setPermCity] = useState(doctor?.permCity || 'Bhopal');
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
      setPermAdd1(clinicAdd1);
      setPermAdd2(clinicAdd2);
      setPermCity(clinicCity);
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
        qualList.push(otherQualification.trim());
      }
      const finalQualString = qualList.join(', ');
      const finalSpecialityString = speciality === 'Other' ? otherSpeciality.trim() : speciality;

      const draft: Partial<Doctor> = {
        id: doctor?.id,
        doctorName: doctorName.trim(),
        gender,
        qualification: finalQualString,
        otherQualification: selectedQualifications.includes('Other') ? otherQualification.trim() : undefined,
        speciality: finalSpecialityString,
        otherSpeciality: speciality === 'Other' ? otherSpeciality.trim() : undefined,
        doctorClass,
        visitFrequency: visits,
        hqId,
        hqName: (hqObj as any)?.name || (hqObj as any)?.hq_name || '',
        areaId,
        areaName: (areaObj as any)?.name || (areaObj as any)?.area_name || '',
        beatId,
        beatName: (beatObj as any)?.name || (beatObj as any)?.beat_name || '',
        clinicAddressLine1: clinicAdd1.trim(),
        clinicAddressLine2: clinicAdd2.trim(),
        clinicCity: clinicCity.trim(),
        clinicPin: clinicPin.trim(),
        clinicState,
        clinicAddress: `${clinicAdd1} ${clinicAdd2}`.trim(),
        city: clinicCity.trim(),
        pinCode: clinicPin.trim(),
        state: clinicState,
        permAddressLine1: permAdd1.trim(),
        permAddressLine2: permAdd2.trim(),
        permCity: permCity.trim(),
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
