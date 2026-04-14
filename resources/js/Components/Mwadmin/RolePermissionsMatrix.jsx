import { Fragment, useMemo } from 'react';

const PERMISSION_COLUMNS = [
    { key: 'allow_access', label: 'Full Access' },
    { key: 'allow_view', label: 'View' },
    { key: 'allow_add', label: 'Add' },
    { key: 'allow_edit', label: 'Edit' },
    { key: 'allow_delete', label: 'Delete' },
    { key: 'allow_print', label: 'Print' },
    { key: 'allow_import', label: 'Import' },
    { key: 'allow_export', label: 'Export' },
];

/** True if any permission flag is set on any module (matches server syncRolePermissions logic). */
export function hasAnyPermissionSelected(permissionsMap) {
    const keys = PERMISSION_COLUMNS.map((c) => c.key);
    return Object.values(permissionsMap || {}).some((row) => keys.some((k) => Boolean(row[k])));
}

export function buildDefaultPermissions(modules, existingMap = {}) {
    return (modules || []).reduce((acc, m) => {
        const prev = existingMap[String(m.moduleid)] || {};
        acc[String(m.moduleid)] = {
            moduleid: Number(m.moduleid),
            allow_access: Boolean(prev.allow_access),
            allow_view: Boolean(prev.allow_view),
            allow_add: Boolean(prev.allow_add),
            allow_edit: Boolean(prev.allow_edit),
            allow_delete: Boolean(prev.allow_delete),
            allow_print: Boolean(prev.allow_print),
            allow_import: Boolean(prev.allow_import),
            allow_export: Boolean(prev.allow_export),
        };
        return acc;
    }, {});
}

export default function RolePermissionsMatrix({ modules = [], permissions = {}, setPermissions, disabled = false }) {
    const groupedModules = useMemo(() => {
        const groups = {};
        modules.forEach((m) => {
            const group = m.modulegroup || 'General';
            if (!groups[group]) groups[group] = [];
            groups[group].push(m);
        });
        return Object.entries(groups);
    }, [modules]);

    const applyModulePermission = (moduleId, key, value) => {
        if (!setPermissions || disabled) return;
        setPermissions((prev) => {
            const id = String(moduleId);
            const current = prev[id] || {
                moduleid: Number(moduleId),
                allow_access: false,
                allow_view: false,
                allow_add: false,
                allow_edit: false,
                allow_delete: false,
                allow_print: false,
                allow_import: false,
                allow_export: false,
            };

            const next = { ...current, [key]: Boolean(value) };
            if (key === 'allow_access') {
                PERMISSION_COLUMNS.forEach((col) => {
                    next[col.key] = Boolean(value);
                });
            } else {
                const anyPerm = PERMISSION_COLUMNS
                    .filter((col) => col.key !== 'allow_access')
                    .some((col) => next[col.key]);
                next.allow_access = next.allow_access || anyPerm;
            }
            return { ...prev, [id]: next };
        });
    };

    const colCount = 2 + PERMISSION_COLUMNS.length;

    const selectAll = (checked) => {
        if (!setPermissions || disabled) return;
        setPermissions((prev) => {
            const next = { ...prev };
            modules.forEach((m) => {
                const id = String(m.moduleid);
                next[id] = {
                    moduleid: Number(m.moduleid),
                    allow_access: checked,
                    allow_view: checked,
                    allow_add: checked,
                    allow_edit: checked,
                    allow_delete: checked,
                    allow_print: checked,
                    allow_import: checked,
                    allow_export: checked,
                };
            });
            return next;
        });
    };

    return (
        <div className="mwadmin-role-permissions-wrap">
            <div className="mwadmin-role-permissions-toolbar">
                <label>
                    <input type="checkbox" disabled={disabled} onChange={(e) => selectAll(e.target.checked)} />
                    {' '}Select All
                </label>
            </div>
            <div className="mwadmin-role-table-wrap">
                <table className="mwadmin-role-table">
                    <thead>
                        <tr>
                            <th>Sr. No.</th>
                            <th>Module Name</th>
                            {PERMISSION_COLUMNS.map((col) => <th key={col.key}>{col.label}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {groupedModules.map(([group, groupModules]) => (
                            <Fragment key={group}>
                                <tr className="mwadmin-role-group-row">
                                    <td className="mwadmin-role-group" colSpan={colCount}>
                                        {group}
                                    </td>
                                </tr>
                                {groupModules.map((m, idx) => {
                                    const p = permissions[String(m.moduleid)] || {};
                                    return (
                                        <tr key={m.moduleid}>
                                            <td>{idx + 1}</td>
                                            <td>{m.modulelabel || m.modulename}</td>
                                            {PERMISSION_COLUMNS.map((col) => (
                                                <td key={`${m.moduleid}_${col.key}`}>
                                                    <input
                                                        type="checkbox"
                                                        disabled={disabled}
                                                        checked={Boolean(p[col.key])}
                                                        onChange={(e) => applyModulePermission(m.moduleid, col.key, e.target.checked)}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
