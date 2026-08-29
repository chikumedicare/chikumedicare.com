import { useState, useEffect } from 'react';
import type { Zone, State, Headquarter, Area, Beat } from '../../../core/domain/hr/geography.types';
import type { TerritoryType } from '../../../store/hr/useGeographyStore';

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
  const [name, setName] = useState(item?.name || '');
  const [code, setCode] = useState(item?.code || '');
  const [divisionId, setDivisionId] = useState(item?.divisionId || '');
  const [isActive, setIsActive] = useState<string>(item ? (item.isActive ? 'ACTIVE' : 'INACTIVE') : 'ACTIVE');

  // Parent linkage state
  const [parentId, setParentId] = useState<string>('');

  // HQ specific fields
  const [hqType, setHqType] = useState<string>('HQ');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [isPoolHq, setIsPoolHq] = useState('0');
  const [parentPoolHqId, setParentPoolHqId] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  // Area & Beat specific fields
  const [territoryType, setTerritoryType] = useState('LOCAL');
  const [travelMode, setTravelMode] = useState('TWO_SIDE');
  const [bothSideAllowed, setBothSideAllowed] = useState('0');
  const [beatType, setBeatType] = useState('CORE');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [description, setDescription] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Context location breadcrumb string
  const [contextLocation, setContextLocation] = useState('');

  // Initialize form when item or type changes
  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setCode(item.code || '');
      setDivisionId(item.divisionId || '');
      setIsActive(item.isActive ? 'ACTIVE' : 'INACTIVE');
      setDescription(item.description || '');
      setDisplayOrder(item.displayOrder ? String(item.displayOrder) : '0');

      if (type === 'State') {
        const s = item as State;
        setParentId(s.zoneId || '');
      } else if (type === 'HQ') {
        const h = item as Headquarter;
        setParentId(h.stateId || '');
        setHqType(h.hqType || 'HQ');
        setCity(h.city || '');
        setDistrict(h.district || '');
        setPinCode(h.pinCode || '');
        setIsPoolHq(h.isPoolHq ? '1' : '0');
        setParentPoolHqId(h.parentPoolHqId || '');
        setLatitude(h.latitude ? String(h.latitude) : '');
        setLongitude(h.longitude ? String(h.longitude) : '');
      } else if (type === 'Area') {
        const a = item as Area;
        setParentId(a.hqId || '');
        setTerritoryType(a.territoryType || 'LOCAL');
        setTravelMode(a.travelMode || 'TWO_SIDE');
        setBothSideAllowed(a.bothSideAllowed ? '1' : '0');
      } else if (type === 'Beat') {
        const b = item as Beat;
        setParentId(b.areaId || '');
        setBeatType(b.beatType || 'CORE');
      }
    } else {
      setName('');
      setCode('');
      setIsActive('ACTIVE');
      setParentId('');
      setHqType('HQ');
      setCity('');
      setDistrict('');
      setPinCode('');
      setIsPoolHq('0');
      setParentPoolHqId('');
      setLatitude('');
      setLongitude('');
      setTerritoryType('LOCAL');
      setTravelMode('TWO_SIDE');
      setBothSideAllowed('0');
      setBeatType('CORE');
      setDisplayOrder('0');
      setDescription('');
    }
  }, [item, type]);

  // Compute dynamic context breadcrumb location
  useEffect(() => {
    if (!parentId) {
      setContextLocation('');
      return;
    }
    if (type === 'State') {
      const z = zones.find((x) => x.id === parentId);
      setContextLocation(z ? `Zone: ${z.name}` : '');
    } else if (type === 'HQ') {
      const s = states.find((x) => x.id === parentId);
      setContextLocation(s ? `State: ${s.name}` : '');
    } else if (type === 'Area') {
      const h = hqs.find((x) => x.id === parentId);
      setContextLocation(h ? `HQ: ${h.name} (${h.city || ''})` : '');
    } else if (type === 'Beat') {
      const a = areas.find((x) => x.id === parentId);
      setContextLocation(a ? `Area: ${a.name}` : '');
    }
  }, [parentId, type, zones, states, hqs, areas]);

  const handleDivisionChange = (newDivId: string) => {
    setDivisionId(newDivId);
    setParentId('');
    setError('');
  };

  const handleSubmit = async () => {
    if (!divisionId) {
      setError('Division is required');
      return;
    }
    if (!name.trim()) {
      setError(`${type} Name is required`);
      return;
    }
    if (type !== 'Zone' && !parentId) {
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
    if (type === 'HQ') {
      draft.stateId = parentId;
      draft.hqType = hqType || 'HQ';
      draft.isSuperHq = false;
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
      draft.territoryType = territoryType as any;
      draft.travelMode = travelMode as any;
      draft.bothSideAllowed = bothSideAllowed === '1';
    }
    if (type === 'Beat') {
      draft.areaId = parentId;
      draft.beatType = beatType as any;
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
    name,
    setName,
    code,
    divisionId,
    handleDivisionChange,
    isActive,
    setIsActive,
    parentId,
    setParentId,
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
    saving,
    error,
    setError,
    contextLocation,
    handleSubmit,
  };
}
