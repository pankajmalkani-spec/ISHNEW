import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import MwadminLayout from '../../../Components/Mwadmin/Layout';
import { useClassicDialog } from '../../../Components/Mwadmin/ClassicDialog';

export default function AdvertisementCreate({ authUser = {} }) {
    const dialog = useClassicDialog();
    const [subcategories, setSubcategories] = useState([]);
    const [form, setForm] = useState({
        title: '',
        company_name: '',
        contactperson_name: '',
        ad_url: '',
        email: '',
        mobile: '',
        brand: '',
        model: '',
        ad_type: '0',
        category_id: '',
        annual_rates: '0',
        start_date: '',
        end_date: '',
        status: '1',
        img: null,
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let c = false;
        (async () => {
            try {
                const { data } = await axios.get('/api/mwadmin/advertisements/options');
                if (!c) setSubcategories(data.subcategories || []);
            } catch {
                if (!c) setSubcategories([]);
            }
        })();
        return () => {
            c = true;
        };
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.company_name.trim() || !form.contactperson_name.trim()) {
            dialog.toast('Title, company, and contact person are required.', 'error');
            return;
        }
        setSaving(true);
        try {
            const fd = new FormData();
            fd.append('title', form.title);
            fd.append('company_name', form.company_name);
            fd.append('contactperson_name', form.contactperson_name);
            fd.append('ad_url', form.ad_url);
            if (form.email) fd.append('email', form.email);
            if (form.mobile) fd.append('mobile', form.mobile);
            if (form.brand) fd.append('brand', form.brand);
            if (form.model) fd.append('model', form.model);
            fd.append('ad_type', form.ad_type);
            fd.append('category_id', form.category_id === '' ? '0' : form.category_id);
            fd.append('annual_rates', form.annual_rates);
            if (form.start_date) fd.append('start_date', form.start_date);
            if (form.end_date) fd.append('end_date', form.end_date);
            fd.append('status', form.status);
            if (form.img) fd.append('img', form.img);

            await axios.post('/api/mwadmin/advertisements', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            dialog.toast('Advertisement created successfully.', 'success');
            window.setTimeout(() => window.location.assign('/mwadmin/advertisement'), 1500);
        } catch (err) {
            const msg = err?.response?.data?.message || 'Unable to create advertisement.';
            dialog.toast(msg, 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Head title="Create Advertisement" />
            <MwadminLayout authUser={authUser} activeMenu="advertisement">
                <div className="mwadmin-category-classic">
                    <div className="mwadmin-pagebar">
                        <span>Masters</span> <span className="sep">›</span> <span>Advertisement</span>{' '}
                        <span className="sep">›</span> <strong>Create</strong>
                        <Link href="/mwadmin/advertisement" className="mwadmin-back-btn">
                            Back
                        </Link>
                    </div>
                    <h1 className="mwadmin-title">Add Advertisement</h1>
                    <section className="mwadmin-panel mwadmin-form-panel">
                        <form onSubmit={onSubmit} className="mwadmin-form-grid">
                            <div>
                                <label>Title *</label>
                                <input
                                    value={form.title}
                                    maxLength={150}
                                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label>Company Name *</label>
                                <input
                                    value={form.company_name}
                                    maxLength={150}
                                    onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label>Contact Person *</label>
                                <input
                                    value={form.contactperson_name}
                                    maxLength={150}
                                    onChange={(e) => setForm((f) => ({ ...f, contactperson_name: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label>Ad URL *</label>
                                <input
                                    type="url"
                                    value={form.ad_url}
                                    maxLength={150}
                                    onChange={(e) => setForm((f) => ({ ...f, ad_url: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    maxLength={150}
                                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label>Mobile</label>
                                <input
                                    value={form.mobile}
                                    maxLength={20}
                                    onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label>Brand</label>
                                <input
                                    value={form.brand}
                                    maxLength={150}
                                    onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label>Model</label>
                                <input
                                    value={form.model}
                                    maxLength={150}
                                    onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label>Ad Type</label>
                                <select
                                    value={form.ad_type}
                                    onChange={(e) => setForm((f) => ({ ...f, ad_type: e.target.value }))}
                                >
                                    <option value="0">Type 0</option>
                                    <option value="1">Type 1</option>
                                </select>
                            </div>
                            <div>
                                <label>Subcategory</label>
                                <select
                                    value={form.category_id}
                                    onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                                >
                                    <option value="">— None —</option>
                                    {subcategories.map((s) => (
                                        <option key={s.id} value={String(s.id)}>
                                            {s.subcat_code}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Annual Rates *</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={form.annual_rates}
                                    onChange={(e) => setForm((f) => ({ ...f, annual_rates: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label>Start Date</label>
                                <input
                                    type="date"
                                    value={form.start_date}
                                    onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label>End Date</label>
                                <input
                                    type="date"
                                    value={form.end_date}
                                    onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
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
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label>Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setForm((f) => ({ ...f, img: e.target.files?.[0] || null }))}
                                />
                            </div>
                            <div className="mwadmin-form-actions">
                                <button type="submit" disabled={saving}>
                                    {saving ? 'Saving...' : 'Submit'}
                                </button>
                                <Link href="/mwadmin/advertisement">Cancel</Link>
                            </div>
                        </form>
                    </section>
                </div>
            </MwadminLayout>
        </>
    );
}
