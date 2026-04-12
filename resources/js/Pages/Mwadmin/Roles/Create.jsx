import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import MwadminLayout from '../../../Components/Mwadmin/Layout';
import { buildDefaultPermissions } from '../../../Components/Mwadmin/RolePermissionsMatrix';
import RolePermissionsMatrix from '../../../Components/Mwadmin/RolePermissionsMatrix';
import { useClassicDialog } from '../../../Components/Mwadmin/ClassicDialog';

export default function RolesCreate({ authUser = {} }) {
    const dialog = useClassicDialog();
    const [modules, setModules] = useState([]);
    const [permissions, setPermissions] = useState({});
    const [form, setForm] = useState({ rolename: '', description: '', status: '1' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        axios.get('/api/mwadmin/roles/options').then(({ data }) => {
            const mods = data.modules || [];
            setModules(mods);
            setPermissions(buildDefaultPermissions(mods));
        });
    }, []);

    const permissionPayload = useMemo(() => Object.values(permissions), [permissions]);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!String(form.rolename || '').trim()) {
            dialog.toast('Role Name is required.', 'error');
            return;
        }
        setSaving(true);
        try {
            await axios.post('/api/mwadmin/roles', { ...form, permissions: permissionPayload });
            dialog.toast('Role has been added successfully.', 'success');
            window.setTimeout(() => window.location.assign('/mwadmin/roles'), 1500);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Head title="Create Role" />
            <MwadminLayout authUser={authUser} activeMenu="roles">
                <div className="mwadmin-category-classic">
                    <div className="mwadmin-pagebar">
                        <span>Administrator</span> <span className="sep">›</span> <span>Roles</span>{' '}
                        <span className="sep">›</span> <strong>Create New Role</strong>
                        <Link href="/mwadmin/roles" className="mwadmin-back-btn">Back</Link>
                    </div>
                    <h1 className="mwadmin-title">Create Role</h1>
                    <section className="mwadmin-panel mwadmin-form-panel">
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
                                <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Submit'}</button>
                                <Link href="/mwadmin/roles">Cancel</Link>
                            </div>
                        </form>
                    </section>
                </div>
            </MwadminLayout>
        </>
    );
}
