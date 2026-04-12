import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DayPicker } from 'react-day-picker';
import { enGB } from 'date-fns/locale';
import { dateToDmy, parseDmyToDate } from '../../Pages/Mwadmin/Sponsor/sponsorDateFormat';
import 'react-day-picker/style.css';

const POPOVER_Z = 2400;
const ESTIMATED_POPOVER_W = 320;
const ESTIMATED_POPOVER_H = 360;

/**
 * dd-mm-yyyy field with React DayPicker (smooth month/year dropdowns, Mon–Sun).
 * Portaled to document.body so overflow:hidden panels do not clip.
 *
 * @param {'default' | 'compact'} [density] — compact uses smaller day cells (filters).
 */
export default function DmyDateInput({ id, value, onChange, placeholder = 'dd-mm-yyyy', density = 'default' }) {
    const genId = useId();
    const inputId = id || `dmy-date-${genId}`;
    const wrapRef = useRef(null);
    const inputRef = useRef(null);
    const popoverRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
    const [month, setMonth] = useState(() => parseDmyToDate(value) || new Date());
    const [shellDark, setShellDark] = useState(false);

    const selectedDate = parseDmyToDate(value);

    const updatePopoverPosition = useCallback(() => {
        if (!open || !inputRef.current) return;
        const r = inputRef.current.getBoundingClientRect();
        const margin = 8;
        let top = r.bottom + 4;
        let left = r.left;
        if (left + ESTIMATED_POPOVER_W > window.innerWidth - margin) {
            left = Math.max(margin, window.innerWidth - ESTIMATED_POPOVER_W - margin);
        }
        if (left < margin) left = margin;
        if (top + ESTIMATED_POPOVER_H > window.innerHeight - margin) {
            top = r.top - ESTIMATED_POPOVER_H - 4;
        }
        if (top < margin) top = margin;
        setPopoverPos({ top, left });
    }, [open]);

    useEffect(() => {
        if (!open) return undefined;
        const t = selectedDate || new Date();
        setMonth(new Date(t.getFullYear(), t.getMonth(), 1));
        if (typeof document !== 'undefined') {
            setShellDark(Boolean(document.querySelector('.mwadmin-shell.mwadmin-theme-dark')));
        }
        return undefined;
    }, [open, value, selectedDate]);

    useLayoutEffect(() => {
        updatePopoverPosition();
    }, [open, month, updatePopoverPosition]);

    useEffect(() => {
        if (!open) return undefined;
        const onScrollOrResize = () => updatePopoverPosition();
        window.addEventListener('scroll', onScrollOrResize, true);
        window.addEventListener('resize', onScrollOrResize);
        return () => {
            window.removeEventListener('scroll', onScrollOrResize, true);
            window.removeEventListener('resize', onScrollOrResize);
        };
    }, [open, updatePopoverPosition]);

    useEffect(() => {
        if (!open) return undefined;
        const onDoc = (e) => {
            const t = e.target;
            if (wrapRef.current?.contains(t) || popoverRef.current?.contains(t)) return;
            setOpen(false);
        };
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, [open]);

    useEffect(() => {
        if (!open) return undefined;
        const onKey = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);

    const onSelectDay = useCallback(
        (d) => {
            if (d) {
                onChange(dateToDmy(d));
                setOpen(false);
            }
        },
        [onChange]
    );

    const onKeyDown = (e) => {
        if (e.key === 'Escape') setOpen(false);
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen((o) => !o);
        }
    };

    const shellClass = [
        'mwadmin-dmy-picker-popover',
        'mwadmin-dmy-picker-popover--portal',
        'mwadmin-rdp-shell',
        density === 'compact' ? 'mwadmin-rdp-shell--compact' : '',
        shellDark ? 'mwadmin-rdp-shell--dark' : '',
    ]
        .filter(Boolean)
        .join(' ');

    const popover =
        open && typeof document !== 'undefined' ? (
            <div
                ref={popoverRef}
                className={shellClass}
                style={{
                    position: 'fixed',
                    top: popoverPos.top,
                    left: popoverPos.left,
                    zIndex: POPOVER_Z,
                }}
                role="dialog"
                aria-label="Choose date"
            >
                <DayPicker
                    mode="single"
                    locale={enGB}
                    weekStartsOn={1}
                    captionLayout="dropdown"
                    startMonth={new Date(2000, 0)}
                    endMonth={new Date(2040, 11)}
                    month={month}
                    onMonthChange={setMonth}
                    selected={selectedDate || undefined}
                    onSelect={onSelectDay}
                    autoFocus
                />
            </div>
        ) : null;

    return (
        <div className="mwadmin-dmy-picker-wrap" ref={wrapRef}>
            <input
                ref={inputRef}
                id={inputId}
                type="text"
                className="mwadmin-dmy-picker-input"
                readOnly
                placeholder={placeholder}
                value={value}
                autoComplete="off"
                aria-haspopup="dialog"
                aria-expanded={open}
                onClick={() => setOpen(true)}
                onFocus={() => setOpen(true)}
                onKeyDown={onKeyDown}
            />
            {popover ? createPortal(popover, document.body) : null}
        </div>
    );
}
