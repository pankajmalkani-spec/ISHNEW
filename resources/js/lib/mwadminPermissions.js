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

export function moduleFlags(authUser, moduleKey) {
    if (authUser?.superaccess === true) {
        const full = emptyFlags();
        Object.keys(full).forEach((k) => {
            full[k] = 1;
        });
        return full;
    }
    const m = authUser?.modules?.[moduleKey];
    return { ...emptyFlags(), ...(typeof m === 'object' && m ? m : {}) };
}

export function canAccessModule(authUser, moduleKey) {
    const f = moduleFlags(authUser, moduleKey);
    return !!(f.allow_access || f.allow_view);
}

/** Detail / view screen */
export function canViewDetail(authUser, moduleKey) {
    const f = moduleFlags(authUser, moduleKey);
    return !!(f.allow_view || f.allow_access);
}

export function canAdd(authUser, moduleKey) {
    return !!moduleFlags(authUser, moduleKey).allow_add;
}

export function canEdit(authUser, moduleKey) {
    return !!moduleFlags(authUser, moduleKey).allow_edit;
}

export function canDelete(authUser, moduleKey) {
    return !!moduleFlags(authUser, moduleKey).allow_delete;
}

export function canExport(authUser, moduleKey) {
    return !!moduleFlags(authUser, moduleKey).allow_export;
}
