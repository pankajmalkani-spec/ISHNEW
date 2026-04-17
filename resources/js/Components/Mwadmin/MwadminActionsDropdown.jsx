/**
 * Row-level Actions &lt;select&gt; shown only for operations the user may perform (mwadmin module flags).
 */
export default function MwadminActionsDropdown({
    onAction,
    flags = {},
    noActionsLabel = 'Locked',
    noActionsNode = null,
    lockIfOnlyView = false,
}) {
    const { view, edit, delete: canDel, resetPassword, deactivate } = flags;
    const hasMutatingAction = !!(edit || canDel || resetPassword || deactivate);
    const hasAny = !!(view || hasMutatingAction);
    const shouldLock = !hasAny || (lockIfOnlyView && !!view && !hasMutatingAction);
    if (shouldLock) {
        if (noActionsNode) return noActionsNode;
        return (
            <span className="mwadmin-grid-action-locked" title="No action rights for this role">
                <span aria-hidden>🔒</span> {noActionsLabel}
            </span>
        );
    }
    return (
        <select
            className="mwadmin-grid-action"
            defaultValue=""
            onChange={(e) => {
                const a = e.target.value;
                e.target.value = '';
                if (a) onAction(a);
            }}
        >
            <option value="">Actions</option>
            {view ? <option value="view">View</option> : null}
            {edit ? <option value="edit">Edit</option> : null}
            {resetPassword ? <option value="resetpwd">Reset Password</option> : null}
            {canDel ? <option value="delete">Delete</option> : null}
            {deactivate ? <option value="deactivate">Deactivate</option> : null}
        </select>
    );
}
