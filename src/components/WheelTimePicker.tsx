/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Clock, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WheelTimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: string; // 24-hour HH:MM format e.g. "09:00", "14:35"
  onConfirm: (newValue: string) => void;
  title?: string;
  idPrefix?: string;
}

const HOURS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
const PERIODS = ['AM', 'PM'];

const ITEM_HEIGHT = 40; // px height per row
const VISIBLE_HEIGHT = 160; // total wheel container height
const PADDING_Y = (VISIBLE_HEIGHT - ITEM_HEIGHT) / 2; // 60px padding top and bottom

/**
 * Helper to convert 24h HH:MM to 12h display string e.g. "09:00" -> "9:00 AM"
 */
export function formatTime12H(time24: string): string {
  if (!time24) return '9:00 AM';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  if (isNaN(h)) h = 9;
  let m = parseInt(mStr, 10);
  if (isNaN(m)) m = 0;
  const roundedM = Math.round(m / 5) * 5 % 60;
  const roundedMStr = String(roundedM).padStart(2, '0');

  const period = h >= 12 ? 'PM' : 'AM';
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;

  return `${h12}:${roundedMStr} ${period}`;
}

/**
 * Parse 24h string into 12h hour, minute, period
 */
function parse24HTime(timeStr: string) {
  let [hStr, mStr] = (timeStr || '09:00').split(':');
  let h24 = parseInt(hStr, 10);
  if (isNaN(h24) || h24 < 0 || h24 > 23) h24 = 9;

  let m = parseInt(mStr, 10);
  if (isNaN(m) || m < 0 || m > 59) m = 0;

  const roundedM = Math.round(m / 5) * 5 % 60;
  const roundedMStr = String(roundedM).padStart(2, '0');

  const period = h24 >= 12 ? 'PM' : 'AM';
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;

  return {
    hour: String(h12),
    minute: roundedMStr,
    period,
  };
}

/**
 * Convert 12h components back to 24h HH:MM string
 */
function to24HTime(hour12: string, minute: string, period: string): string {
  let h24 = parseInt(hour12, 10);
  if (period === 'AM') {
    if (h24 === 12) h24 = 0;
  } else {
    if (h24 < 12) h24 += 12;
  }
  return `${String(h24).padStart(2, '0')}:${minute}`;
}

export const WheelTimePickerModal: React.FC<WheelTimePickerModalProps> = ({
  isOpen,
  onClose,
  value,
  onConfirm,
  title = 'Select Time',
  idPrefix = 'time-picker',
}) => {
  const [tempHour, setTempHour] = useState('9');
  const [tempMin, setTempMin] = useState('00');
  const [tempPeriod, setTempPeriod] = useState('AM');

  const hourRef = useRef<HTMLDivElement>(null);
  const minRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  const isInternalScroll = useRef(false);

  // Initialize internal temp state when modal opens
  useEffect(() => {
    if (isOpen) {
      const { hour, minute, period } = parse24HTime(value);
      setTempHour(hour);
      setTempMin(minute);
      setTempPeriod(period);

      // Scroll columns to target position
      const timer = setTimeout(() => {
        scrollToIndex(hourRef.current, HOURS.indexOf(hour));
        scrollToIndex(minRef.current, MINUTES.indexOf(minute));
        scrollToIndex(periodRef.current, PERIODS.indexOf(period));
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [isOpen, value]);

  const scrollToIndex = (el: HTMLDivElement | null, index: number) => {
    if (!el || index < 0) return;
    isInternalScroll.current = true;
    el.scrollTo({
      top: index * ITEM_HEIGHT,
      behavior: 'smooth',
    });
    setTimeout(() => {
      isInternalScroll.current = false;
    }, 200);
  };

  const handleScrollColumn = (
    ref: React.RefObject<HTMLDivElement | null>,
    list: string[],
    currentVal: string,
    setVal: (v: string) => void
  ) => {
    if (isInternalScroll.current || !ref.current) return;
    const scrollTop = ref.current.scrollTop;
    const closestIdx = Math.max(0, Math.min(list.length - 1, Math.round(scrollTop / ITEM_HEIGHT)));
    const newVal = list[closestIdx];

    if (newVal && newVal !== currentVal) {
      setVal(newVal);
    }
  };

  const handleDone = () => {
    const final24 = to24HTime(tempHour, tempMin, tempPeriod);
    onConfirm(final24);
    onClose();
  };

  const currentPreview = `${tempHour}:${tempMin} ${tempPeriod}`;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          id={`${idPrefix}-backdrop`}
          onClick={onClose}
        >
          <motion.div
            id={`${idPrefix}-modal-card`}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#FEFBEC] border border-[#DFD8C4] rounded-3xl p-5 shadow-2xl space-y-4 overflow-hidden select-none relative z-[101]"
          >
            {/* Header with Centered Title */}
            <div className="flex items-center justify-center pb-3 border-b border-[#DFD8C4]/60">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-[#137B7C]" />
                <h3 className="text-sm font-black text-[#301208] uppercase tracking-wider font-heading">{title}</h3>
              </div>
            </div>

            {/* Time Preview Badge */}
            <div className="flex items-center justify-center">
              <span className="text-sm font-black text-[#137B7C] bg-[#76DFCB]/25 border border-[#76DFCB]/60 px-4 py-1.5 rounded-full font-mono shadow-2xs">
                {currentPreview}
              </span>
            </div>

            {/* Wheel Container */}
            <div className="relative bg-white border border-[#DFD8C4] rounded-2xl p-2 shadow-inner overflow-hidden">
              {/* Center Highlight Bar */}
              <div
                className="absolute left-2 right-2 h-[40px] bg-[#76DFCB]/25 border-y border-[#76DFCB]/60 rounded-xl pointer-events-none z-10 shadow-2xs"
                style={{ top: `${PADDING_Y}px` }}
              />

              {/* Top & Bottom Gradient Masks */}
              <div
                className="absolute top-0 left-0 right-0 bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none z-20"
                style={{ height: `${PADDING_Y}px` }}
              />
              <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-20"
                style={{ height: `${PADDING_Y}px` }}
              />

              {/* Wheels */}
              <div
                className="grid grid-cols-3 gap-1 relative z-0"
                style={{ height: `${VISIBLE_HEIGHT}px` }}
              >
                {/* HOUR WHEEL */}
                <div
                  ref={hourRef}
                  id={`${idPrefix}-hour-wheel`}
                  onScroll={() => handleScrollColumn(hourRef, HOURS, tempHour, setTempHour)}
                  className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-none"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    paddingTop: `${PADDING_Y}px`,
                    paddingBottom: `${PADDING_Y}px`,
                  }}
                >
                  {HOURS.map((h) => {
                    const isSelected = h === tempHour;
                    return (
                      <div
                        key={`h-${h}`}
                        onClick={() => {
                          setTempHour(h);
                          scrollToIndex(hourRef.current, HOURS.indexOf(h));
                        }}
                        className={`h-[40px] flex items-center justify-center snap-center cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? 'text-[#301208] text-lg font-black scale-110'
                            : 'text-[#68614E] text-sm font-bold opacity-35 hover:opacity-75'
                        }`}
                      >
                        {h}
                      </div>
                    );
                  })}
                </div>

                {/* MINUTE WHEEL */}
                <div
                  ref={minRef}
                  id={`${idPrefix}-min-wheel`}
                  onScroll={() => handleScrollColumn(minRef, MINUTES, tempMin, setTempMin)}
                  className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-none"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    paddingTop: `${PADDING_Y}px`,
                    paddingBottom: `${PADDING_Y}px`,
                  }}
                >
                  {MINUTES.map((m) => {
                    const isSelected = m === tempMin;
                    return (
                      <div
                        key={`m-${m}`}
                        onClick={() => {
                          setTempMin(m);
                          scrollToIndex(minRef.current, MINUTES.indexOf(m));
                        }}
                        className={`h-[40px] flex items-center justify-center snap-center cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? 'text-[#301208] text-lg font-black scale-110 font-mono'
                            : 'text-[#68614E] text-sm font-bold opacity-35 hover:opacity-75 font-mono'
                        }`}
                      >
                        {m}
                      </div>
                    );
                  })}
                </div>

                {/* AM / PM WHEEL */}
                <div
                  ref={periodRef}
                  id={`${idPrefix}-period-wheel`}
                  onScroll={() => handleScrollColumn(periodRef, PERIODS, tempPeriod, setTempPeriod)}
                  className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-none"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    paddingTop: `${PADDING_Y}px`,
                    paddingBottom: `${PADDING_Y}px`,
                  }}
                >
                  {PERIODS.map((p) => {
                    const isSelected = p === tempPeriod;
                    return (
                      <div
                        key={`p-${p}`}
                        onClick={() => {
                          setTempPeriod(p);
                          scrollToIndex(periodRef.current, PERIODS.indexOf(p));
                        }}
                        className={`h-[40px] flex items-center justify-center snap-center cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? 'text-[#137B7C] text-base font-black scale-105'
                            : 'text-[#68614E] text-xs font-bold opacity-35 hover:opacity-75'
                        }`}
                      >
                        {p}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Footer Buttons */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                id={`${idPrefix}-footer-cancel-btn`}
                onClick={onClose}
                className="flex-1 bg-white hover:bg-[#FAF7E8] text-[#68614E] border border-[#DFD8C4] font-bold text-xs py-3 rounded-2xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                <X size={14} />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                id={`${idPrefix}-footer-done-btn`}
                onClick={handleDone}
                className="flex-1 bg-[#76DFCB] hover:bg-[#31ADAF] text-[#301208] font-bold text-xs py-3 rounded-2xl transition-all shadow-xs cursor-pointer text-center flex items-center justify-center gap-1.5 active:scale-98"
              >
                <Check size={14} strokeWidth={2.5} />
                <span>Done</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

interface WheelTimePickerFieldProps {
  value: string; // 24-hour HH:MM string
  onChange: (newValue: string) => void;
  label?: string;
  idPrefix?: string;
}

/**
 * Tapable form field component that renders formatted time text
 * and opens the WheelTimePickerModal on click.
 */
export const WheelTimePickerField: React.FC<WheelTimePickerFieldProps> = ({
  value,
  onChange,
  label,
  idPrefix = 'time-field',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatted12H = formatTime12H(value);

  return (
    <div className="space-y-1">
      {label && (
        <label
          className="text-xs font-bold text-[#68614E] uppercase tracking-wider block"
          htmlFor={`${idPrefix}-trigger-btn`}
        >
          {label}
        </label>
      )}

      <button
        id={`${idPrefix}-trigger-btn`}
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-[#FAF7E8] hover:bg-[#F5F0D9] border border-[#DFD8C4] active:border-[#31ADAF] rounded-2xl px-3.5 py-3 text-[#301208] font-bold focus:outline-hidden focus:ring-3 focus:ring-[#76DFCB]/20 transition-all text-sm flex items-center justify-between cursor-pointer group shadow-2xs"
      >
        <span className="font-mono text-base font-black text-[#301208] group-hover:text-[#137B7C] transition-colors">
          {formatted12H}
        </span>
        <div className="flex items-center gap-1 text-[#68614E] group-hover:text-[#137B7C] transition-colors">
          <Clock size={16} />
        </div>
      </button>

      <WheelTimePickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        value={value}
        onConfirm={onChange}
        title={label ? `Select ${label}` : 'Select Time'}
        idPrefix={idPrefix}
      />
    </div>
  );
};
