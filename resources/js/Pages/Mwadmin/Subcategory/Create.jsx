import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import MwadminLayout from '../../../Components/Mwadmin/Layout';

export default function SubcategoryCreate({ authUser = {} }) {
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({
        subcat_code: '',
        name: '',
        category_id: '',
        color: '#ffffff',
        sort: '',
        status: '1',
        banner_img: null,
        box_img: null,
    });
    const [error, setError] = useState('');
    const [sortError, setSortError] = useState('');
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        axios.get('/api/mwadmin/subcategories/options').then(({ data }) => {
            setCategories(data.categories || []);
        });
    }, []);

    const verifySort = async (value) => {
        setSortError('');
        if (!value) return;
        const { data } = await axios.get('/api/mwadmin/subcategories/verify-sort', { params: { sort: value } });
        if (data?.exists) setSortError(data.message || 'Sort number already exists.');
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSortError('');
        setSaving(true);
        try {
            const payload = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                if (value !== null && value !== '') payload.append(key, value);
            });
            await axios.post('/api/mwadmin/subcategories', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setSuccessMessage('Sub-Category has been added successfully.');
            setTimeout(() => window.location.assign('/mwadmin/subcategory'), 1500);
        } catch (err) {
            setError(err?.response?.data?.message || 'Unable to create sub-category.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Head title="Create Sub-Category" />
            <MwadminLayout authUser={authUser} activeMenu="subcategory">
                <div className="mwadmin-category-classic">
                    <div className="mwadmin-pagebar">
                        <span>Administration</span> <span className="sep">›</span> <span>Sub-Category</span>{' '}
                        <span className="sep">›</span> <strong>Create New Sub-Category</strong>
                        <Link href="/mwadmin/subcategory" className="mwadmin-back-btn">Back</Link>
                    </div>
                    <h1 className="mwadmin-title">Create Sub-Category</h1>
                    <section className="mwadmin-panel mwadmin-form-panel">
                        {error && <div className="mwadmin-error">{error}</div>}
                        {successMessage && <div className="mwadmin-success mwadmin-success-premium"><span className="mwadmin-success-icon">✓</span><div><strong>Success!</strong> {successMessage}</div></div>}
                        <form onSubmit={onSubmit} className="mwadmin-form-grid">
                            <div><label>Sub Category Code *</label><input value={form.subcat_code} onChange={(e) => setForm((f) => ({ ...f, subcat_code: e.target.value.toUpperCase() }))} /></div>
                            <div><label>Sub Category Name *</label><input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
                            <div>
                                <label>Category Title *</label>
                                <select value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}>
                                    <option value="">Select Category</option>
                                    {categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                                </select>
                            </div>
                            <div><label>Color *</label><input type="color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} /></div>
                            <div>
                                <label>Sort *</label>
                                <input type="number" value={form.sort} onChange={(e) => setForm((f) => ({ ...f, sort: e.target.value }))} onBlur={(e) => verifySort(e.target.value)} />
                                {sortError && <div className="mwadmin-field-error">{sortError}</div>}
                            </div>
                            <div><label>Status</label><select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}><option value="1">Active</option><option value="0">In-Active</option></select></div>
                            <div className="mwadmin-upload-card">
                                <label>Banner Image</label>
                                <input type="file" accept="image/*" onChange={(e) => setForm((f) => ({ ...f, banner_img: e.target.files?.[0] || null }))} />
                            </div>
                            <div className="mwadmin-upload-card">
                                <label>Box Image</label>
                                <input type="file" accept="image/*" onChange={(e) => setForm((f) => ({ ...f, box_img: e.target.files?.[0] || null }))} />
                            </div>
                            <div className="mwadmin-form-actions">
                                <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Submit'}</button>
                                <Link href="/mwadmin/subcategory">Cancel</Link>
                            </div>
                        </form>
                    </section>
                </div>
            </MwadminLayout>
        </>
    );
}