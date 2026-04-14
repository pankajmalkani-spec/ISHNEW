import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import MwadminLayout from '../../../Components/Mwadmin/Layout';
import MwadminStatusBadge from '../../../Components/Mwadmin/MwadminStatusBadge';
import { buildDefaultPermissions, hasAnyPermissionSelected } from '../../../Components/Mwadmin/RolePermissionsMatrix';
import RolePermissionsMatrix from '../../../Components/Mwadmin/RolePermissionsMatrix';
import { useClassicDialog } from '../../../Components/Mwadmin/ClassicDialog';

function formatApiErrors(err) {
    const d = err?.response?.data;
    if (d?.errors && typeof d.errors === 'object') {
        const lines = Object.entries(d.errors).flatMap(([key, val]) => {
            const msgs = Array.isArray(val) ? val : [String(val)];
            return msgs.map((m) => `${key}: ${m}`);
        });
        return lines.join('\n');
    }
    if (typeof d?.message === 'string') return d.message;
    return err?.message || 'Unable to create role.';
}

export default function RolesCreate({ authUser = {} }) {
    const dialog = useClassicDialog();
    const [modules, setModules] = useState([]);
    const [permissions, setPermissions] = useState({});
    const [optionsLoading, setOptionsLoading] = useState(true);
    const [form, setForm] = useState({ rolename: '', description: '', status: '1' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let canceled = false;
        axios
            .get('/api/mwadmin/roles/options')
            .then(({ data }) => {
                if (canceled) return;
                const mods = data.modules || [];
                setModules(mods);
                setPermissions(buildDefaultPermissions(mods));
            })
            .catch(() => {
                if (!canceled) dialog.toast('Unable to load module list.', 'error');
            })
            .finally(() => {
                if (!canceled) setOptionsLoading(false);
            });
        return () => {
            canceled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- options load once on mount
    }, []);

    const permissionPayload = useMemo(() => Object.values(permissions), [permissions]);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!String(form.rolename || '').trim()) {
            dialog.toast('Role Name is required.', 'error');
            return;
        }
        if (modules.length > 0 && !hasAnyPermissionSelected(permissions)) {
            dialog.toast('Select at least one module permission.', 'error');
            return;
        }
        setSaving(true);
        try {
            await axios.post('/api/mwadmin/roles', { ...form, permissions: permissionPayload });
            dialog.toast('Role has been added successfully.', 'success');
            window.setTimeout(() => window.location.assign('/mwadmin/roles'), 1500);
        } catch (err) {
            dialog.toast(formatApiErrors(err), 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Head title="Create Role" />
            <MwadminLayout authUser={authUser} activeMenu="roles">
                <div className="mwadmin-pagebar">
                    <span>Administrator</span> <span className="sep">›</span> <span>Roles</span>{' '}
                    <span className="sep">›</span> <strong>Create New Role</strong>
                    <Link href="/mwadmin/roles" className="mwadmin-back-btn">
                        Back
                    </Link>
                </div>
                <h1 className="mwadmin-title">Create Role</h1>
                <section className="mwadmin-panel mwadmin-form-panel">
                    <form onSubmit={onSubmit} className="mwadmin-form-grid" noValidate>
                        <div>
                            <label>Role Name *</label>
                            <input
                                maxLength={50}
                                value={form.rolename}
                                onChange={(e) => setForm((f) => ({ ...f, rolename: e.target.value }))}
                                autoComplete="off"
                            />
                        </div>
                        <div>
                            <label>Status</label>
                            <div className="mwadmin-category-status-row">
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                                >
                                    <option value="1">Active</option>
                                    <option value="0">In-Active</option>
                                </select>
                                <MwadminStatusBadge value={form.status === '1' ? 1 : 0} />
                            </div>
                        </div>
                        <div className="mwadmin-form-grid-full">
                            <label>Description</label>
                            <textarea
                                className="mwadmin-textarea"
                                rows={4}
                                value={form.description}
                                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                            />
                        </div>
                        <div className="mwadmin-form-grid-full mwadmin-role-permissions-section">
                            <span className="mwadmin-form-section-label">Module permissions *</span>
                            {optionsLoading ? (
                                <p className="mwadmin-role-permissions-loading">Loading modules…</p>
                            ) : (
                                <RolePermissionsMatrix modules={modules} permissions={permissions} setPermissions={setPermissions} />
                            )}
                        </div>
                        <div className="mwadmin-form-actions">
                            <button type="submit" disabled={saving || optionsLoading}>
                                {saving ? 'Saving...' : 'Submit'}
                            </button>
                            <Link href="/mwadmin/roles">Cancel</Link>
                        </div>
                    </form>
                </section>
            </MwadminLayout>
        </>
    );
}
