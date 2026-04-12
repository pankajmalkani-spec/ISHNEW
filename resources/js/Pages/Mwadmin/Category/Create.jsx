import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';
import MwadminLayout from '../../../Components/Mwadmin/Layout';

export default function CategoryCreate({ authUser = {} }) {
    const [form, setForm] = useState({
        code: '',
        title: '',
        color: '#ffffff',
        sort: '',
        status: '1',
        banner_img: null,
        box_img: null,
    });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            const payload = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                if (value !== null && value !== '') payload.append(key, value);
            });
            await axios.post('/api/mwadmin/categories', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            window.location.assign('/mwadmin/category');
        } catch (err) {
            const msg = err?.response?.data?.message || 'Unable to create category.';
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Head title="Create Category" />
            <MwadminLayout authUser={authUser} activeMenu="category">
                <div className="mwadmin-pagebar">
                    <span>Administration</span> <span className="sep">›</span> <span>Category</span>{' '}
                    <span className="sep">›</span> <strong>Create New Category</strong>
                    <Link href="/mwadmin/category" className="mwadmin-back-btn">
                        Back
                    </Link>
                </div>
                <h1 className="mwadmin-title">Create Category</h1>

                <section className="mwadmin-panel mwadmin-form-panel">
                    {error && <div className="mwadmin-error">{error}</div>}
                    <form onSubmit={onSubmit} className="mwadmin-form-grid">
                        <div>
                            <label>Category Code *</label>
                            <input
                                value={form.code}
                                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                            />
                        </div>
                        <div>
                            <label>Category Title *</label>
                            <input
                                value={form.title}
                                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label>Color *</label>
                            <input
                                type="color"
                                value={form.color}
                                onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label>Sort *</label>
                            <input
                                type="number"
                                value={form.sort}
                                onChange={(e) => setForm((f) => ({ ...f, sort: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label>Banner Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setForm((f) => ({ ...f, banner_img: e.target.files?.[0] || null }))}
                            />
                        </div>
                        <div>
                            <label>Box Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setForm((f) => ({ ...f, box_img: e.target.files?.[0] || null }))}
                            />
                        </div>
                        <div>
                            <label>Status</label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                            >
                                <option value="1">Active</option>
                                <option value="0">In-Active</option>
                            </select>
                        </div>
                        <div className="mwadmin-form-actions">
                            <button type="submit" disabled={saving}>
                                {saving ? 'Saving...' : 'Submit'}
                            </button>
                            <Link href="/mwadmin/category">Cancel</Link>
                        </div>
                    </form>
                </section>
            </MwadminLayout>
        </>
    );
}