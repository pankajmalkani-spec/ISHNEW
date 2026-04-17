/**
 * Legacy-aligned flags from authUser.modules[moduleKey] (0/1 integers) and superaccess.
 */

const emptyFlags = () => ({
    allow_access: 0,
    allow_view: 0,
    allow_add: 0,
    allow_edit: 0,
    allow_delete: 0,
    allow_print: 0,
    allow_import: 0,
    allow_export: 0,
});

/** Session/Inertia may expose flags as 0/1, "0"/"1", or true — avoid `!!"0" === true`. */
function coerce01(value) {
    return value === true || value === 1 || value === '1' ? 1 : 0;
}

export function moduleFlags(authUser, moduleKey) {
    if (authUser?.superaccess === true) {
        const full = emptyFlags();
        Object.keys(full).forEach((k) => {
            full[k] = 1;
        });
        return full;
    }
    const m = authUser?.modules?.[moduleKey];
    const merged = { ...emptyFlags(), ...(typeof m === 'object' && m ? m : {}) };
    const out = {};
    for (const k of Object.keys(emptyFlags())) {
        out[k] = coerce01(merged[k]);
    }
    return out;
}

export function canAccessModule(authUser, moduleKey) {
    const f = moduleFlags(authUser, moduleKey);
    return f.allow_access === 1 || f.allow_view === 1;
}

/** Detail / view screen */
export function canViewDetail(authUser, moduleKey) {
    const f = moduleFlags(authUser, moduleKey);
    return f.allow_view === 1 || f.allow_access === 1;
}

export function canAdd(authUser, moduleKey) {
    return moduleFlags(authUser, moduleKey).allow_add === 1;
}

export function canEdit(authUser, moduleKey) {
    return moduleFlags(authUser, moduleKey).allow_edit === 1;
}

export function canDelete(authUser, moduleKey) {
    return moduleFlags(authUser, moduleKey).allow_delete === 1;
}

export function canExport(authUser, moduleKey) {
    return moduleFlags(authUser, moduleKey).allow_export === 1;
}
