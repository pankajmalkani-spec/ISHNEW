import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import MwadminLayout from '../../../Components/Mwadmin/Layout';

export default function UsersCreate({ authUser = {} }) {
    const [options, setOptions] = useState({ designations: [], roles: [] });
    const [form, setForm] = useState({
        salutation: '',
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        designation: '',
        p2d_intials: '',
        status: '1',
        password: '',
        role_ids: [],
        profile_img: null,
    });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        axios.get('/api/mwadmin/users/options').then(({ data }) => setOptions(data));
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            const payload = new FormData();
            Object.entries(form).forEach(([k, v]) => {
                if (k === 'role_ids') {
                    v.forEach((roleId) => payload.append('role_ids[]', roleId));
                    return;
                }
                if (v !== null && v !== '') payload.append(k, v);
            });
            await axios.post('/api/mwadmin/users', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
            window.location.assign('/mwadmin/users');
        } catch (err) {
            setError(err?.response?.data?.message || 'Unable to create user.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Head title="Create User" />
            <MwadminLayout authUser={authUser} activeMenu="users">
                <div className="mwadmin-category-classic">
                    <div className="mwadmin-pagebar">
                        <span>Administrator</span> <span className="sep">›</span> <span>Users</span>{' '}
                        <span className="sep">›</span> <strong>Create User</strong>
                        <Link href="/mwadmin/users" className="mwadmin-back-btn">Back</Link>
                    </div>
                    <h1 className="mwadmin-title">Create User</h1>
                    <section className="mwadmin-panel mwadmin-form-panel">
                        {error && <div className="mwadmin-error">{error}</div>}
                        <form onSubmit={onSubmit} className="mwadmin-form-grid">
                            <div><label>Salutation</label><input value={form.salutation} onChange={(e) => setForm((f) => ({ ...f, salutation: e.target.value }))} /></div>
                            <div><label>First Name *</label><input value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} /></div>
                            <div><label>Last Name *</label><input value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} /></div>
                            <div><label>User Name *</label><input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} /></div>
                            <div><label>Email *</label><input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
                            <div>
                                <label>Designation</label>
                                <select value={form.designation} onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))}>
                                    <option value="">Select</option>
                                    {options.designations.map((d) => <option key={d.id} value={d.id}>{d.designation}</option>)}
                                </select>
                            </div>
                            <div><label>P2D Initials</label><input value={form.p2d_intials} onChange={(e) => setForm((f) => ({ ...f, p2d_intials: e.target.value.toUpperCase() }))} /></div>
                            <div><label>Password *</label><input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} /></div>
                            <div><label>Status</label><select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}><option value="1">Active</option><option value="0">In-Active</option></select></div>
                            <div>
                                <label>Profile Photo</label>
                                <input type="file" accept="image/*" onChange={(e) => setForm((f) => ({ ...f, profile_img: e.target.files?.[0] || null }))} />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label>Roles</label>
                                <div className="mwadmin-role-list">
                                    {options.roles.map((r) => (
                                        <label key={r.arid}>
                                            <input
                                                type="checkbox"
                                                checked={form.role_ids.includes(String(r.arid))}
                                                onChange={(e) => setForm((f) => ({
                                                    ...f,
                                                    role_ids: e.target.checked
                                                        ? [...f.role_ids, String(r.arid)]
                                                        : f.role_ids.filter((x) => x !== String(r.arid)),
                                                }))}
                                            />
                                            {r.rolename}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="mwadmin-form-actions"><button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Submit'}</button><Link href="/mwadmin/users">Cancel</Link></div>
                        </form>
                    </section>
                </div>
            </MwadminLayout>
        </>
    );
}