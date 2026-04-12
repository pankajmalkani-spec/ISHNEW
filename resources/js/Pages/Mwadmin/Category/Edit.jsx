import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import MwadminLayout from '../../../Components/Mwadmin/Layout';

export default function CategoryEdit({ authUser = {}, categoryId }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        code: '',
        title: '',
        color: '#ffffff',
        sort: '',
        status: '1',
    });

    useEffect(() => {
        let canceled = false;
        const load = async () => {
            try {
                const { data } = await axios.get(`/api/mwadmin/categories/${categoryId}`);
                if (canceled) return;
                const item = data?.data || {};
                setForm({
                    code: item.code || '',
                    title: item.title || '',
                    color: item.color || '#ffffff',
                    sort: String(item.sort ?? ''),
                    status: String(item.status ?? '1'),
                });
            } catch {
                if (!canceled) setError('Unable to load category.');
            } finally {
                if (!canceled) setLoading(false);
            }
        };
        load();
        return () => {
            canceled = true;
        };
    }, [categoryId]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            await axios.put(`/api/mwadmin/categories/${categoryId}`, form);
            window.location.assign('/mwadmin/category');
        } catch (err) {
            const msg = err?.response?.data?.message || 'Unable to update category.';
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Head title="Edit Category" />
            <MwadminLayout authUser={authUser} activeMenu="category">
                <div className="mwadmin-pagebar">
                    <span>Administration</span> <span className="sep">›</span> <span>Category</span>{' '}
                    <span className="sep">›</span> <strong>Edit Category</strong>
                    <Link href="/mwadmin/category" className="mwadmin-back-btn">Back</Link>
                </div>
                <h1 className="mwadmin-title">Edit Category</h1>

                <section className="mwadmin-panel mwadmin-form-panel">
                    {error && <div className="mwadmin-error">{error}</div>}
                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                        <form onSubmit={onSubmit} className="mwadmin-form-grid">
                            <div>
                                <label>Category Code *</label>
                                <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} />
                            </div>
                            <div>
                                <label>Category Title *</label>
                                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                            </div>
                            <div>
                                <label>Color *</label>
                                <input type="color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} />
                            </div>
                            <div>
                                <label>Sort *</label>
                                <input type="number" value={form.sort} onChange={(e) => setForm((f) => ({ ...f, sort: e.target.value }))} />
                            </div>
                            <div>
                                <label>Status</label>
                                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                                    <option value="1">Active</option>
                                    <option value="0">In-Active</option>
                                </select>
                            </div>
                            <div className="mwadmin-form-actions">
                                <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Update'}</button>
                                <Link href="/mwadmin/category">Cancel</Link>
                            </div>
                        </form>
                    )}
                </section>
            </MwadminLayout>
        </>
    );
}