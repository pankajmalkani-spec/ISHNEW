import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import MwadminLayout from '../../../Components/Mwadmin/Layout';

export default function SponsorCategoryEdit({ authUser = {}, sponsorcategoryId }) {
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ name: '', note: '', status: '1' });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        let canceled = false;
        const load = async () => {
            try {
                const { data } = await axios.get(`/api/mwadmin/sponsorcategories/${sponsorcategoryId}`);
                if (!canceled) setForm({
                    name: data?.data?.name || '',
                    note: data?.data?.note || '',
                    status: String(data?.data?.status ?? '1'),
                });
            } catch {
                if (!canceled) setError('Unable to load sponsor category.');
            } finally {
                if (!canceled) setLoading(false);
            }
        };
        load();
        return () => {
            canceled = true;
        };
    }, [sponsorcategoryId]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            await axios.put(`/api/mwadmin/sponsorcategories/${sponsorcategoryId}`, form);
            setSuccessMessage('Sponsor Category has been updated successfully.');
            setTimeout(() => window.location.assign('/mwadmin/sponsorcategory'), 1500);
        } catch (err) {
            setError(err?.response?.data?.message || 'Unable to update sponsor category.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Head title="Edit Sponsor Category" />
            <MwadminLayout authUser={authUser} activeMenu="sponsorcategory">
                <div className="mwadmin-category-classic">
                    <div className="mwadmin-pagebar">
                        <span>Masters</span> <span className="sep">›</span> <span>Sponsor Category</span>{' '}
                        <span className="sep">›</span> <strong>Edit Sponsor Category</strong>
                        <Link href="/mwadmin/sponsorcategory" className="mwadmin-back-btn">Back</Link>
                    </div>
                    <h1 className="mwadmin-title">Edit Sponsor Category</h1>
                    <section className="mwadmin-panel mwadmin-form-panel">
                        {error && <div className="mwadmin-error">{error}</div>}
                        {successMessage && <div className="mwadmin-success mwadmin-success-premium"><span className="mwadmin-success-icon">✓</span><div><strong>Success!</strong> {successMessage}</div></div>}
                        {loading ? <div>Loading...</div> : (
                            <form onSubmit={onSubmit} className="mwadmin-form-grid">
                                <div><label>Sponsor Category Name *</label><input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
                                <div><label>Status</label><select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}><option value="1">Active</option><option value="0">In-Active</option></select></div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label>Note(s)</label>
                                    <textarea className="mwadmin-textarea" rows={5} value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
                                </div>
                                <div className="mwadmin-form-actions">
                                    <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Update'}</button>
                                    <Link href="/mwadmin/sponsorcategory">Cancel</Link>
                                </div>
                            </form>
                        )}
                    </section>
                </div>
            </MwadminLayout>
        </>
    );
}