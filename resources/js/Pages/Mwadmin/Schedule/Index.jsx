import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import MwadminLayout from '../../../Components/Mwadmin/Layout';
import { useClassicDialog } from '../../../Components/Mwadmin/ClassicDialog';
import { canEdit } from '../../../lib/mwadminPermissions';

function shiftWeekStart(isoDate, deltaDays) {
    const d = new Date(`${isoDate}T12:00:00`);
    d.setDate(d.getDate() + deltaDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export default function ScheduleIndex({ authUser = {} }) {
    const dialog = useClassicDialog();
    const canUpdateStatus = canEdit(authUser, 'schedule');
    const [loading, setLoading] = useState(true);
    const [weekStart, setWeekStart] = useState('');
    const [payload, setPayload] = useState(null);
    const [modal, setModal] = useState(null);
    const [modalStatus, setModalStatus] = useState('1');
    const [saving, setSaving] = useState(false);

    const loadWeek = useCallback(
        async (start) => {
            setLoading(true);
            try {
                const { data } = await axios.get('/api/mwadmin/schedule/week', {
                    params: start ? { week_start: start } : {},
                });
                setPayload(data);
                setWeekStart(data.week_start);
            } catch (err) {
                dialog.toast(err?.response?.data?.message || 'Unable to load weekly schedule.', 'error');
            } finally {
                setLoading(false);
            }
        },
        [dialog]
    );

    useEffect(() => {
        loadWeek();
    }, [loadWeek]);

    const openContent = async (id) => {
        try {
            const { data } = await axios.get(`/api/mwadmin/schedule/content/${id}`);
            const row = data.data;
            setModal(row);
            setModalStatus(
                row.final_releasestatus === '1' || row.final_releasestatus === 1 ? '1' : '0'
            );
        } catch {
            dialog.toast('Unable to load content details.', 'error');
        }
    };

    const saveModal = async () => {
        if (!modal) return;
        setSaving(true);
        try {
            await axios.post('/api/mwadmin/schedule/update-status', {
                content_id: modal.id,
                status: parseInt(modalStatus, 10),
            });
            dialog.toast('Contenttrans updated successfully.', 'success');
            setModal(null);
            await loadWeek(weekStart);
        } catch (err) {
            dialog.toast(err?.response?.data?.message || 'Unable to update status.', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Head title="Weekly Schedule" />
            <MwadminLayout authUser={authUser} activeMenu="schedule">
                <div className="mwadmin-category-classic">
                    <div className="mwadmin-pagebar">
                        <span>Content</span> <span className="sep">›</span> <span>Weekly Schedule</span>{' '}
                        <span className="sep">›</span> <strong>Listing</strong>
                    </div>
                    <h1 className="mwadmin-title">Weekly Schedule</h1>

                    <section className="mwadmin-panel mwadmin-schedule-panel">
                        <div className="mwadmin-panel-head mwadmin-schedule-panel-head">
                            <span className="mwadmin-schedule-head-icon" aria-hidden>
                                &#128197;
                            </span>
                            Weekly Schedule
                        </div>

                        {loading && <div className="mwadmin-schedule-loading">Loading…</div>}

                        {!loading && payload && (
                            <>
                                <div className="mwadmin-schedule-toolbar">
                                    <div className="mwadmin-schedule-toolbar-mid">
                                        From&nbsp;&nbsp;{payload.label_from}&nbsp;&nbsp; To &nbsp;&nbsp;
                                        {payload.label_to}
                                    </div>
                                    <div className="mwadmin-schedule-toolbar-nav">
                                        <button
                                            type="button"
                                            className="mwadmin-schedule-nav-btn"
                                            onClick={() => weekStart && loadWeek(shiftWeekStart(weekStart, -7))}
                                            title="Previous week"
                                            aria-label="Previous week"
                                        >
                                            &#9664;
                                        </button>
                                        <button
                                            type="button"
                                            className="mwadmin-schedule-nav-btn"
                                            onClick={() => weekStart && loadWeek(shiftWeekStart(weekStart, 7))}
                                            title="Next week"
                                            aria-label="Next week"
                                        >
                                            &#9654;
                                        </button>
                                    </div>
                                </div>

                                <div className="mwadmin-schedule-table-wrap">
                                    <table className="mwadmin-schedule-table">
                                        <thead>
                                            <tr>
                                                <th className="mwadmin-schedule-th-cat">Category</th>
                                                {payload.week_days.map((d) => (
                                                    <th key={d.date} className="mwadmin-schedule-th-day">
                                                        {d.weekday}/{d.day}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payload.categories.map((cat) => (
                                                <tr key={cat.id}>
                                                    <td className="mwadmin-schedule-td-cat">{cat.title}</td>
                                                    {cat.cells.map((cell, idx) => (
                                                        <td key={`${cat.id}-${payload.week_days[idx].date}`} className="mwadmin-schedule-td-cell">
                                                            {cell.map((item) => (
                                                                <button
                                                                    key={item.id}
                                                                    type="button"
                                                                    className="mwadmin-schedule-chip"
                                                                    style={{ backgroundColor: item.color }}
                                                                    title={item.title}
                                                                    onClick={() => openContent(item.id)}
                                                                >
                                                                    {item.title}
                                                                </button>
                                                            ))}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </section>
                </div>

                {modal && (
                    <div
                        className="mwadmin-modal-backdrop"
                        role="presentation"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setModal(null);
                        }}
                    >
                        <div className="mwadmin-modal mwadmin-schedule-modal" role="dialog" aria-modal="true">
                            <div className="mwadmin-modal-head">
                                Schedule for Category —{' '}
                                <strong>{modal.category_name}</strong>
                            </div>
                            <div className="mwadmin-modal-body">
                                <table className="mwadmin-schedule-modal-table">
                                    <tbody>
                                        <tr>
                                            <th>Topic name</th>
                                            <td>{modal.title}</td>
                                        </tr>
                                        <tr>
                                            <th>Sub-category</th>
                                            <td>{modal.subcategory_name || '—'}</td>
                                        </tr>
                                        <tr>
                                            <th>Final release status</th>
                                            <td>
                                                {canUpdateStatus ? (
                                                    <select
                                                        value={modalStatus}
                                                        onChange={(e) => setModalStatus(e.target.value)}
                                                        className="mwadmin-select"
                                                    >
                                                        <option value="1">Active</option>
                                                        <option value="0">In-Active</option>
                                                    </select>
                                                ) : (
                                                    <span>
                                                        {modalStatus === '1' ? 'Active' : 'In-Active'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="mwadmin-modal-actions">
                                {canUpdateStatus && (
                                    <button
                                        type="button"
                                        className="mwadmin-news-create-submit"
                                        disabled={saving}
                                        onClick={saveModal}
                                    >
                                        {saving ? 'Saving…' : 'Update'}
                                    </button>
                                )}
                                <button type="button" className="mwadmin-news-create-cancel" onClick={() => setModal(null)}>
                                    Cancel
                                </button>
                                <Link
                                    href={`/mwadmin/newslisting/${modal.id}/edit`}
                                    className="mwadmin-schedule-edit-link"
                                >
                                    Open in Manage Content
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </MwadminLayout>
        </>
    );
}
