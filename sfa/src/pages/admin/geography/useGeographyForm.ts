import type { Beat } from '../../../core/domain/hr/geography.types';
import { useState, useEffect, useMemo } from 'react';
import type { TerritoryType } from '../../../store/hr/useGeographyStore';
import type { Zone, State, Headquarter, Area } from '../../../core/domain/hr/geography.types';

export function useGeographyForm(
  type: TerritoryType,
  item: Zone | State | Headquarter | Area | Beat | null,
  zones: Zone[],
  states: State[],
  hqs: Headquarter[],
  areas: Area[],
  onSave: (draft: Partial<Zone | State | Headquarter | Area | Beat>) => Promise<{ success: boolean; error?: string }>,
  back: () => void
) {
  const [divisionId, setDivisionId] = useState(item?.divisionId || '');
  const [code, setCode] = useState(item?.code || '');
  const [name, setName] = useState(item?.name || '');
  const [parentId, setParentId] = useState('');
  const [isActive, setIsActive] = useState('ACTIVE');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // HQ & HO Fields
  const [hqType, setHqType] = useState('HQ');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [isPoolHq, setIsPoolHq] = useState('0');
  const [parentPoolHqId, setParentPoolHqId] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  // Area & Beat Fields
  const [territoryType, setTerritoryType] = useState('LOCAL');
  const [travelMode, setTravelMode] = useState('TWO_SIDE');
  const [bothSideAllowed, setBothSideAllowed] = useState('1');
  const [beatType, setBeatType] = useState('CORE');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (item) {
      setDivisionId(item.divisionId || '');
      setCode(item.code || '');
      setName(item.name || '');
      setIsActive(item.isActive ? 'ACTIVE' : 'INACTIVE');
      setDescription(item.description || '');
      setDisplayOrder(String(item.displayOrder || 0));

      if (type === 'State') setParentId(item.zoneId || '');
      if (type === 'HQ' || type === 'HO') {
        setParentId(item.stateId || '');
        setHqType(type === 'HO' ? 'HEAD_OFFICE' : (item.hqType || 'HQ'));
        setCity(item.city || '');
        setDistrict(item.district || '');
        setPinCode(item.pinCode || '');
        setIsPoolHq(item.isPoolHq ? '1' : '0');
        setParentPoolHqId(item.parentPoolHqId || '');
        setLatitude(item.latitude != null ? String(item.latitude) : '');
        setLongitude(item.longitude != null ? String(item.longitude) : '');
      }
      if (type === 'Area') {
        setParentId(item.hqId || '');
        setTerritoryType(item.territoryType || 'LOCAL');
        setTravelMode(item.travelMode || 'TWO_SIDE');
        setBothSideAllowed(item.bothSideAllowed ? '1' : '0');
      }
      if (type === 'Beat') {
        setParentId(item.areaId || '');
        setBeatType(item.beatType || 'CORE');
      }
    } else {
      setCode('');
      setName('');
      setParentId('');
      setIsActive('ACTIVE');
      setDescription('');
      setDisplayOrder('0');
      if (type === 'HQ' || type === 'HO') {
        setHqType(type === 'HO' ? 'HEAD_OFFICE' : 'HQ');
        setCity('');
        setDistrict('');
        setPinCode('');
        setIsPoolHq('0');
        setParentPoolHqId('');
        setLatitude('');
        setLongitude('');
      }
      if (type === 'Area') {
        setTerritoryType('LOCAL');
        setTravelMode('TWO_SIDE');
        setBothSideAllowed('1');
      }
      if (type === 'Beat') {
        setBeatType('CORE');
      }
    }
  }, [item, type]);

  const handleDivisionChange = (newDivId: string) => {
    setDivisionId(newDivId);
    setParentId('');
    setError('');
  };

  const contextLocation = useMemo(() => {
    if (type === 'Area') {
      const hq = hqs.find((h) => h.id === parentId);
      const st = states.find((s) => s.id === hq?.stateId);
      return [hq?.name, st?.name].filter(Boolean).join(', ');
    }
    if (type === 'Beat') {
      const ar = areas.find((a) => a.id === parentId);
      const hq = hqs.find((h) => h.id === ar?.hqId);
      return [ar?.name, hq?.name].filter(Boolean).join(', ');
    }
    return '';
  }, [type, parentId, hqs, states, areas]);

  const handleSubmit = async () => {
    const isHo = type === 'HO';
    if (!divisionId && !isHo) {
      setError('Division is required');
      return;
    }
    if (!name.trim()) {
      setError(`${type === 'HO' ? 'Head Office' : type} Name is required`);
      return;
    }
    if (type !== 'Zone' && !isHo && !parentId) {
      setError('Parent selection is required for ' + type);
      return;
    }

    setSaving(true);
    setError('');

    const draft: Partial<Zone | State | Headquarter | Area | Beat> = {
      ...(item?.id ? { id: item.id, code: item.code } : {}),
      name: name.trim(),
      divisionId: divisionId || undefined,
      isActive: isActive === 'ACTIVE',
      description: description.trim() || undefined,
      displayOrder: Number(displayOrder) || 0,
    };

    if (type === 'State') draft.zoneId = parentId;
    if (type === 'HQ' || type === 'HO') {
      draft.stateId = parentId || undefined;
      draft.hqType = type === 'HO' ? 'HEAD_OFFICE' : hqType;
      draft.isSuperHq = type === 'HO';
      draft.city = city.trim() || undefined;
      draft.district = district.trim() || undefined;
      draft.pinCode = pinCode.trim() || undefined;
      draft.isPoolHq = isPoolHq === '1';
      draft.parentPoolHqId = isPoolHq === '1' ? parentPoolHqId : undefined;
      draft.latitude = latitude ? parseFloat(latitude) : undefined;
      draft.longitude = longitude ? parseFloat(longitude) : undefined;
    }
    if (type === 'Area') {
      draft.hqId = parentId;
      draft.territoryType = territoryType;
      draft.travelMode = travelMode;
      draft.bothSideAllowed = bothSideAllowed === '1';
    }
    if (type === 'Beat') {
      draft.areaId = parentId;
      draft.beatType = beatType;
    }

    try {
      const res = await onSave(draft);
      if (res.success) {
        back();
      } else if (res.error) {
        setError(res.error);
      }
    } finally {
      setSaving(false);
    }
  };

  return {
    divisionId,
    code,
    name,
    setName,
    parentId,
    setParentId,
    isActive,
    setIsActive,
    error,
    setError,
    saving,
    hqType,
    setHqType,
    city,
    setCity,
    district,
    setDistrict,
    pinCode,
    setPinCode,
    isPoolHq,
    setIsPoolHq,
    parentPoolHqId,
    setParentPoolHqId,
    latitude,
    setLatitude,
    longitude,
    setLongitude,
    territoryType,
    setTerritoryType,
    travelMode,
    setTravelMode,
    bothSideAllowed,
    setBothSideAllowed,
    beatType,
    setBeatType,
    displayOrder,
    setDisplayOrder,
    description,
    setDescription,
    handleDivisionChange,
    contextLocation,
    handleSubmit,
  };
}
