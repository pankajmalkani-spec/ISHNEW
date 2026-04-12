import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Tag-style multi-select: selected roles as removable chips; pick more from a dropdown list.
 * `value` is an ordered list of role ids (strings).
 */
export default function MwadminRoleTagSelect({ roles = [], value = [], onChange, placeholder = 'Select roles…' }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);

    const selectedSet = useMemo(() => new Set((value || []).map(String)), [value]);

    const selectedOrdered = useMemo(() => {
        const byId = new Map(roles.map((r) => [String(r.arid), r]));
        return (value || []).map(String).map((id) => {
            const r = byId.get(id);
            return r || { arid: id, rolename: `Role #${id}` };
        });
    }, [value, roles]);

    useEffect(() => {
        const onDoc = (e) => {
            if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, []);

    const add = (arid) => {
        const id = String(arid);
        if (selectedSet.has(id)) return;
        onChange([...(value || []).map(String), id]);
    };

    const remove = (arid) => {
        const id = String(arid);
        onChange((value || []).map(String).filter((x) => x !== id));
    };

    const toggle = (arid) => {
        const id = String(arid);
        if (selectedSet.has(id)) remove(id);
        else add(id);
    };

    const clearAll = (e) => {
        e?.stopPropagation?.();
        onChange([]);
    };

    return (
        <div className="mwadmin-role-ms" ref={rootRef}>
            <button
                type="button"
                className="mwadmin-role-ms__control"
                aria-expanded={open}
                aria-haspopup="listbox"
                onClick={() => setOpen((o) => !o)}
            >
                <div className="mwadmin-role-ms__tags">
                    {selectedOrdered.length === 0 ? (
                        <span className="mwadmin-role-ms__placeholder">{placeholder}</span>
                    ) : (
                        selectedOrdered.map((r) => (
                            <span key={String(r.arid)} className="mwadmin-role-ms__tag">
                                <button
                                    type="button"
                                    className="mwadmin-role-ms__tag-x"
                                    aria-label={`Remove ${r.rolename}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        remove(r.arid);
                                    }}
                                >
                                    ×
                                </button>
                                <span className="mwadmin-role-ms__tag-label">{r.rolename}</span>
                            </span>
                        ))
                    )}
                </div>
                <div className="mwadmin-role-ms__trail">
                    {selectedOrdered.length > 0 && (
                        <button
                            type="button"
                            className="mwadmin-role-ms__clear-all"
                            aria-label="Clear all roles"
                            onClick={clearAll}
                        >
                            ×
                        </button>
                    )}
                    <span className="mwadmin-role-ms__caret" aria-hidden>
                        ▾
                    </span>
                </div>
            </button>
            {open && (
                <ul className="mwadmin-role-ms__menu" role="listbox">
                    {roles.map((r) => {
                        const sel = selectedSet.has(String(r.arid));
                        return (
                            <li
                                key={r.arid}
                                role="option"
                                aria-selected={sel}
                                className={sel ? 'is-selected' : undefined}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => toggle(r.arid)}
                            >
                                {r.rolename}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
