import React from 'react';
import type { SponsorshipType, ProductSchemeDetail } from '../../../../core/domain/transaction/sponsorship.types';

interface SponsorshipDynamicFieldsProps {
  sponsorshipType: SponsorshipType;
  amount: number;
  setAmount: (n: number) => void;
  programName: string;
  setProgramName: (s: string) => void;
  institutionOrOrganizer: string;
  setInstitutionOrOrganizer: (s: string) => void;
  locationCity: string;
  setLocationCity: (s: string) => void;
  travelType: 'Flight' | 'Train' | 'Bus' | 'Taxi' | 'Other';
  setTravelType: (t: 'Flight' | 'Train' | 'Bus' | 'Taxi' | 'Other') => void;
  fromLocation: string;
  setFromLocation: (s: string) => void;
  toLocation: string;
  setToLocation: (s: string) => void;
  hotelName: string;
  setHotelName: (s: string) => void;
  checkInDate: string;
  setCheckInDate: (s: string) => void;
  checkOutDate: string;
  setCheckOutDate: (s: string) => void;
  selectedProduct: string;
  setSelectedProduct: (p: string) => void;
  schemeType: 'Free Goods' | 'Net Rate';
  setSchemeType: (t: 'Free Goods' | 'Net Rate') => void;
  schemeValue: string;
  setSchemeValue: (v: string) => void;
}

export function SponsorshipDynamicFields({
  sponsorshipType,
  amount,
  setAmount,
  programName,
  setProgramName,
  institutionOrOrganizer,
  setInstitutionOrOrganizer,
  locationCity,
  setLocationCity,
  travelType,
  setTravelType,
  fromLocation,
  setFromLocation,
  toLocation,
  setToLocation,
  hotelName,
  setHotelName,
  checkInDate,
  setCheckInDate,
  checkOutDate,
  setCheckOutDate,
  selectedProduct,
  setSelectedProduct,
  schemeType,
  setSchemeType,
  schemeValue,
  setSchemeValue,
}: SponsorshipDynamicFieldsProps) {
  return (
    <div style={{ background: '#f8fafc', padding: '16px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
        3. {sponsorshipType} Specific Details
      </h4>

      {/* Case 1: Financial Support & Others */}
      {(sponsorshipType === 'Financial Support' || sponsorshipType === 'Others') && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Support Value / Amount (₹) *
            </label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 20000"
              value={amount === 0 ? '' : amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              style={{ width: '100%', maxWidth: '260px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 800, color: '#0284c7' }}
            />
          </div>
        </div>
      )}

      {/* Case 2: Educational / Registration Support */}
      {(sponsorshipType === 'Educational Support' || sponsorshipType === 'Registration Support') && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Program / Conference Name *
            </label>
            <input
              type="text"
              placeholder="e.g. 78th National Cardiology CME"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Institution / Organizer
            </label>
            <input
              type="text"
              placeholder="e.g. Cardiological Society of India"
              value={institutionOrOrganizer}
              onChange={(e) => setInstitutionOrOrganizer(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              City / Location
            </label>
            <input
              type="text"
              placeholder="e.g. Indore"
              value={locationCity}
              onChange={(e) => setLocationCity(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Support Value (₹) *
            </label>
            <input
              type="number"
              placeholder="0"
              value={amount === 0 ? '' : amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 800 }}
            />
          </div>
        </div>
      )}

      {/* Case 3: Travel Support */}
      {sponsorshipType === 'Travel Support' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1.5fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Travel Mode
            </label>
            <select
              value={travelType}
              onChange={(e) => setTravelType(e.target.value as any)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
            >
              <option value="Flight">✈️ Flight</option>
              <option value="Train">🚆 Train</option>
              <option value="Taxi">🚕 Taxi / Cab</option>
              <option value="Bus">🚌 Bus</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              From Station / City
            </label>
            <input
              type="text"
              placeholder="e.g. Bhopal"
              value={fromLocation}
              onChange={(e) => setFromLocation(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              To Destination City
            </label>
            <input
              type="text"
              placeholder="e.g. Mumbai"
              value={toLocation}
              onChange={(e) => setToLocation(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Fare Value (₹) *
            </label>
            <input
              type="number"
              placeholder="0"
              value={amount === 0 ? '' : amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 800 }}
            />
          </div>
        </div>
      )}

      {/* Case 4: Accommodation Support */}
      {sponsorshipType === 'Accommodation Support' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.2fr 1.2fr 1.2fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Hotel / Stay Name
            </label>
            <input
              type="text"
              placeholder="e.g. Radisson Blu"
              value={hotelName}
              onChange={(e) => setHotelName(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              City
            </label>
            <input
              type="text"
              placeholder="e.g. Indore"
              value={locationCity}
              onChange={(e) => setLocationCity(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Check-In Date
            </label>
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Check-Out Date
            </label>
            <input
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Tariff (₹) *
            </label>
            <input
              type="number"
              placeholder="0"
              value={amount === 0 ? '' : amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 800 }}
            />
          </div>
        </div>
      )}

      {/* Case 5: Product Scheme */}
      {sponsorshipType === 'Product Scheme' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Target Product Brand
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
            >
              <option value="D-Cal 500 Tablet (15x10)">D-Cal 500 Tablet (15x10)</option>
              <option value="Chiku-Glow Face Wash (100ml)">Chiku-Glow Face Wash (100ml)</option>
              <option value="Sun-Guard SPF 50+ (50g)">Sun-Guard SPF 50+ (50g)</option>
              <option value="Derma-Klenz Serum (30ml)">Derma-Klenz Serum (30ml)</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Scheme Type
            </label>
            <select
              value={schemeType}
              onChange={(e) => setSchemeType(e.target.value as any)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
            >
              <option value="Free Goods">🎁 Free Goods (e.g. 10 + 1 Free)</option>
              <option value="Net Rate">📉 Net Rate / Special Discount</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Scheme Value (% or Qty)
            </label>
            <input
              type="text"
              placeholder="e.g. 10% or 10+2"
              value={schemeValue}
              onChange={(e) => setSchemeValue(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Estimated Value (₹) *
            </label>
            <input
              type="number"
              placeholder="0"
              value={amount === 0 ? '' : amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 800 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
