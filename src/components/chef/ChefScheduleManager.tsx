import React, { useState } from 'react';
import { Calendar, Clock, Briefcase, CheckCircle, Plus, ChevronRight, X, AlertCircle } from 'lucide-react';

interface ShiftSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  period: 'Morning' | 'Afternoon' | 'Evening';
  timeLabel: string;
  type: 'available_meal_prep' | 'blocked_personal' | 'private_banquet' | 'restaurant_interview';
  title: string;
  notes?: string;
  clientName?: string;
}

interface RestaurantInterview {
  id: string;
  restaurantName: string;
  logo: string;
  role: string;
  dateTime: string;
  location: string;
  status: 'confirmed' | 'pending' | 'completed';
  contactPerson: string;
}

export const ChefScheduleManager: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [slots, setSlots] = useState<ShiftSlot[]>([
    {
      id: 'slot-1',
      day: 'Monday',
      period: 'Morning',
      timeLabel: '07:30 AM - 10:30 AM',
      type: 'available_meal_prep',
      title: 'Weekly Healthy Meal Prep Slot (Subscribed)',
      clientName: 'Naveen & Swati (Indiranagar)',
    },
    {
      id: 'slot-2',
      day: 'Monday',
      period: 'Afternoon',
      timeLabel: '12:30 PM - 03:30 PM',
      type: 'restaurant_interview',
      title: 'Executive Sous Chef Trial',
      clientName: 'Toit Brewpub (Stage Trial)',
    },
    {
      id: 'slot-3',
      day: 'Monday',
      period: 'Evening',
      timeLabel: '06:30 PM - 09:30 PM',
      type: 'available_meal_prep',
      title: 'Available for SOS Radar or Meal Prep',
    },
    {
      id: 'slot-4',
      day: 'Wednesday',
      period: 'Morning',
      timeLabel: '08:00 AM - 11:00 AM',
      type: 'available_meal_prep',
      title: 'Keto Batch Cooking (2 Clients)',
    },
    {
      id: 'slot-5',
      day: 'Friday',
      period: 'Evening',
      timeLabel: '06:00 PM - 11:00 PM',
      type: 'private_banquet',
      title: 'Luxury 12-Pax Terrace Banquet Feast',
      clientName: 'Koramangala 4th Block Party',
    },
    {
      id: 'slot-6',
      day: 'Saturday',
      period: 'Morning',
      timeLabel: '09:00 AM - 01:00 PM',
      type: 'blocked_personal',
      title: 'Rest & Culinary Research / Market Visit',
    },
  ]);

  const [interviews, setInterviews] = useState<RestaurantInterview[]>([
    {
      id: 'int-1',
      restaurantName: 'Toit Brewpub & Kitchen',
      logo: '🍺',
      role: 'Senior Tandoor & Grill Chef',
      dateTime: 'Friday, 3:00 PM',
      location: '100ft Road, Indiranagar',
      status: 'confirmed',
      contactPerson: 'Chef Senthil (Head of Culinary)',
    },
    {
      id: 'int-2',
      restaurantName: 'Smoke House Deli',
      logo: '🥩',
      role: 'Continental Line Lead',
      dateTime: 'Next Tuesday, 11:30 AM',
      location: 'Lavelle Road, Bengaluru',
      status: 'pending',
      contactPerson: 'Aditya Mehra (General Manager)',
    },
  ]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleSlotAvailability = (slotId: string) => {
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id === slotId) {
          const nextType = s.type === 'available_meal_prep' ? 'blocked_personal' : 'available_meal_prep';
          return {
            ...s,
            type: nextType,
            title: nextType === 'available_meal_prep' ? 'Available for On-Demand & Subscriptions' : 'Blocked Hours (Personal)',
          };
        }
        return s;
      })
    );
  };

  const handleAddNewSlot = (period: 'Morning' | 'Afternoon' | 'Evening') => {
    const newSlot: ShiftSlot = {
      id: `slot-${Date.now()}`,
      day: selectedDay as ShiftSlot['day'],
      period,
      timeLabel:
        period === 'Morning'
          ? '08:00 AM - 11:00 AM'
          : period === 'Afternoon'
          ? '12:00 PM - 03:00 PM'
          : '06:00 PM - 09:00 PM',
      type: 'available_meal_prep',
      title: 'Open Slot for Meal Prep Subscribers',
    };
    setSlots((prev) => [...prev, newSlot]);
  };

  const daySlots = slots.filter((s) => s.day === selectedDay);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <h3 className="text-lg font-black text-white">Calendar & Shift Dispatch Manager</h3>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Choose your work style: Block out recurring weekly meal prep subscription hours, or schedule full-time restaurant stage trials.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-neutral-950 p-2 rounded-2xl border border-neutral-800 text-xs">
          <span className="text-emerald-400 font-bold">✓ Auto-Sync:</span>
          <span className="text-neutral-400">Blocked hours automatically hide your pin from SOS radar.</span>
        </div>
      </div>

      {/* Day Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {daysOfWeek.map((day) => {
          const count = slots.filter((s) => s.day === day && s.type !== 'blocked_personal').length;
          const isSelected = selectedDay === day;
          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <span>{day.slice(0, 3)}</span>
              {count > 0 && (
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-neutral-950 text-amber-300' : 'bg-neutral-800 text-neutral-300'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Grid: Day Schedule Slots on Left + Restaurant Interviews on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Schedule for Selected Day */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <span>{selectedDay} Shift Availability</span>
              <span className="text-xs text-neutral-400 font-normal">({daySlots.length} slots configured)</span>
            </h4>
            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleAddNewSlot('Morning')}
                className="px-2.5 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold"
              >
                + Add Morning
              </button>
              <button
                type="button"
                onClick={() => handleAddNewSlot('Evening')}
                className="px-2.5 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold"
              >
                + Add Evening
              </button>
            </div>
          </div>

          {daySlots.length === 0 ? (
            <div className="rounded-2xl bg-neutral-900/60 border border-neutral-800 p-8 text-center text-neutral-400 space-y-3">
              <Clock size={28} className="mx-auto text-neutral-600" />
              <p className="text-xs">No specific shifts set for {selectedDay}.</p>
              <button
                type="button"
                onClick={() => handleAddNewSlot('Morning')}
                className="px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs"
              >
                Create Meal Prep Availability Slot
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {daySlots.map((slot) => {
                const isBlocked = slot.type === 'blocked_personal';
                return (
                  <div
                    key={slot.id}
                    className={`rounded-2xl border p-4.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isBlocked
                        ? 'bg-neutral-950/80 border-neutral-800 opacity-60'
                        : slot.type === 'restaurant_interview'
                        ? 'bg-blue-950/20 border-blue-500/40'
                        : slot.type === 'private_banquet'
                        ? 'bg-purple-950/20 border-purple-500/40'
                        : 'bg-neutral-900 border-neutral-800 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full ${
                          isBlocked
                            ? 'bg-neutral-800 text-neutral-400'
                            : slot.type === 'restaurant_interview'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {slot.period} • {slot.timeLabel}
                        </span>
                        {slot.clientName && (
                          <span className="text-xs font-semibold text-amber-400">
                            👤 {slot.clientName}
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-black text-white">{slot.title}</div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleSlotAvailability(slot.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isBlocked
                            ? 'bg-emerald-500 text-neutral-950 hover:bg-emerald-400'
                            : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                        }`}
                      >
                        {isBlocked ? 'Unlock Slot' : 'Block Slot (Personal)'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Restaurant Interviews & Hiring Trials */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <Briefcase size={16} className="text-amber-400" />
              <span>Full-Time Restaurant Interviews</span>
            </h4>
          </div>

          <div className="space-y-3">
            {interviews.map((int) => (
              <div
                key={int.id}
                className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{int.logo}</span>
                    <div>
                      <div className="text-xs font-black text-white">{int.restaurantName}</div>
                      <div className="text-[11px] text-amber-400 font-semibold">{int.role}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    int.status === 'confirmed'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {int.status}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs space-y-1 text-neutral-300">
                  <div><strong>Time:</strong> <span className="text-white">{int.dateTime}</span></div>
                  <div><strong>Location:</strong> {int.location}</div>
                  <div><strong>Contact:</strong> {int.contactPerson}</div>
                </div>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(int.location + ', Bengaluru')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>📍 Get Directions for Trial</span>
                  <ChevronRight size={13} />
                </a>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
