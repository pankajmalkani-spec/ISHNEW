import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import MwadminLayout from '../../../Components/Mwadmin/Layout';
import { buildDefaultPermissions } from '../../../Components/Mwadmin/RolePermissionsMatrix';
import RolePermissionsMatrix from '../../../Components/Mwadmin/RolePermissionsMatrix';
import { useClassicDialog } from '../../../Components/Mwadmin/ClassicDialog';

export default function RolesEdit({ authUser = {}, roleId }) {
    const dialog = useClassicDialog();
    const [loading, setLoading] = useState(true);
    const [modules, setModules] = useState([]);
    const [permissions, setPermissions] = useState({});
    const [form, setForm] = useState({ rolename: '', description: '', status: '1' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let canceled = false;
        const load = async () => {
            try {
                const [{ data: opts }, { data: one }] = await Promise.all([
                    axios.get('/api/mwadmin/roles/options'),
                    axios.get(`/api/mwadmin/roles/${roleId}`),
                ]);
                if (canceled) return;
                const mods = opts.modules || [];
                setModules(mods);
                const role = one?.data || {};
                setForm({
                    rolename: role.rolename || '',
                    description: role.description || '',
                    status: String(role.status ?? '1'),
                });
                const existingMap = (role.permissions || []).reduce((acc, p) => {
                    acc[String(p.moduleid)] = p;
                    return acc;
                }, {});
                setPermissions(buildDefaultPermissions(mods, existingMap));
            } finally {
                if (!canceled) setLoading(false);
            }
        };
        load();
        return () => {
            canceled = true;
        };
    }, [roleId]);

    const permissionPayload = useMemo(() => Object.values(permissions), [permissions]);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!String(form.rolename || '').trim()) {
            dialog.toast('Role Name is required.', 'error');
            return;
        }
        setSaving(true);
        try {
            await axios.put(`/api/mwadmin/roles/${roleId}`, { ...form, permissions: permissionPayload });
            dialog.toast('Role has been updated successfully.', 'success');
            window.setTimeout(() => window.location.assign('/mwadmin/roles'), 1200);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Head title="Edit Role" />
            <MwadminLayout authUser={authUser} activeMenu="roles">
                <div className="mwadmin-category-classic">
                    <div className="mwadmin-pagebar">
                        <span>Administrator</span> <span className="sep">›</span> <span>Roles</span>{' '}
                        <span className="sep">›</span> <strong>Edit Role</strong>
                        <Link href="/mwadmin/roles" className="mwadmin-back-btn">Back</Link>
                    </div>
                    <h1 className="mwadmin-title">Edit Role</h1>
                    <section className="mwadmin-panel mwadmin-form-panel">
                        {loading ? <div>Loading...</div> : (
                            <form onSubmit={onSubmit} className="mwadmin-form-grid">
                                <div><label>Role Name *</label><input maxLength={50} value={form.rolename} onChange={(e) => setForm((f) => ({ ...f, rolename: e.target.value }))} /></div>
                                <div><label>Status</label><select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}><option value="1">Active</option><option value="0">In-Active</option></select></div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label>Remarks</label>
                                    <textarea className="mwadmin-textarea" rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <RolePermissionsMatrix modules={modules} permissions={permissions} setPermissions={setPermissions} />
                                </div>
                                <div className="mwadmin-form-actions">
                                    <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Update'}</button>
                                    <Link href="/mwadmin/roles">Cancel</Link>
                                </div>
                            </form>
                        )}
                    </section>
                </div>
            </MwadminLayout>
        </>
    );
}
