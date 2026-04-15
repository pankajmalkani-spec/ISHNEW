import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import MwadminLayout from '../../../Components/Mwadmin/Layout';
import { useClassicDialog } from '../../../Components/Mwadmin/ClassicDialog';

export default function ProfileIndex({ authUser = {} }) {
    const dialog = useClassicDialog();
    const reduceMotion = useReducedMotion();
    const [tab, setTab] = useState('personal');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        username: '',
        first_name: '',
        last_name: '',
        contactno: '',
        email: '',
        profile_photo_url: null,
    });
    const [initial, setInitial] = useState(null);
    const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });

    useEffect(() => {
        let canceled = false;
        const load = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get('/api/mwadmin/profile');
                const p = data?.data || {};
                if (!canceled) {
                    setProfile({
                        username: p.username || '',
                        first_name: p.first_name || '',
                        last_name: p.last_name || '',
                        contactno: p.contactno || '',
                        email: p.email || '',
                        profile_photo_url: p.profile_photo_url || null,
                    });
                    setInitial({
                        username: p.username || '',
                        first_name: p.first_name || '',
                        last_name: p.last_name || '',
                        contactno: p.contactno || '',
                        email: p.email || '',
                        profile_photo_url: p.profile_photo_url || null,
                    });
                }
            } catch {
                if (!canceled) dialog.toast('Unable to load profile.', 'error');
            } finally {
                if (!canceled) setLoading(false);
            }
        };
        load();
        return () => {
            canceled = true;
        };
    }, [dialog]);

    const displayName =
        `${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
        profile.username ||
        'User';

    const onSavePersonal = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.put('/api/mwadmin/profile', {
                first_name: profile.first_name,
                last_name: profile.last_name,
                contactno: profile.contactno,
                email: profile.email,
            });
            dialog.toast('Profile updated successfully.', 'success');
            router.reload();
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.errors?.email?.[0] ||
                'Unable to save profile.';
            dialog.toast(msg, 'error');
        } finally {
            setSaving(false);
        }
    };

    const onCancelPersonal = () => {
        router.visit('/mwadmin/dashboard');
    };

    const onSavePassword = async (e) => {
        e.preventDefault();
        if (pwd.next !== pwd.confirm) {
            dialog.toast('New password and confirmation do not match.', 'error');
            return;
        }
        setSaving(true);
        try {
            await axios.post('/api/mwadmin/profile/password', {
                current_password: pwd.current,
                password: pwd.next,
                password_confirmation: pwd.confirm,
            });
            dialog.toast('Password updated successfully.', 'success');
            setPwd({ current: '', next: '', confirm: '' });
        } catch (err) {
            const msg = err?.response?.data?.message || 'Unable to change password.';
            dialog.toast(msg, 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Head title="My Profile" />
            <MwadminLayout authUser={authUser} activeMenu="profile">
                <div className="mwadmin-category-classic mwadmin-profile-page">
                    <div className="mwadmin-pagebar">
                        <span>Account</span> <span className="sep">›</span> <strong>My Profile</strong>
                    </div>

                    <motion.div
                        className="mwadmin-profile-layout"
                        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={
                            reduceMotion
                                ? { duration: 0.01 }
                                : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
                        }
                    >
                        <aside className="mwadmin-profile-sidebar">
                            <motion.div
                                className="mwadmin-profile-avatar-wrap"
                                initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={
                                    reduceMotion
                                        ? { duration: 0.01 }
                                        : { delay: 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }
                                }
                            >
                                <img
                                    className="mwadmin-profile-avatar"
                                    src={profile.profile_photo_url || '/images/UserProfile_photo/no_user.png'}
                                    alt=""
                                    onError={(e) => {
                                        e.currentTarget.src = '/images/categoryImages/boxImages/no_img.gif';
                                    }}
                                />
                            </motion.div>
                            <div className="mwadmin-profile-sidebar-name">{displayName}</div>
                            <nav className="mwadmin-profile-nav">
                                <button
                                    type="button"
                                    className={tab === 'personal' ? 'is-active' : ''}
                                    onClick={() => setTab('personal')}
                                >
                                    Account Settings
                                </button>
                                <button type="button" className="mwadmin-profile-nav-help" disabled title="Coming soon">
                                    Help
                                </button>
                            </nav>
                        </aside>

                        <section className="mwadmin-profile-main">
                            <div className="mwadmin-profile-card">
                                <h2 className="mwadmin-profile-card-title">Profile Account</h2>
                                <div className="mwadmin-profile-tabs">
                                    <button
                                        type="button"
                                        className={tab === 'personal' ? 'is-active' : ''}
                                        onClick={() => setTab('personal')}
                                    >
                                        Personal Info
                                    </button>
                                    <button
                                        type="button"
                                        className={tab === 'password' ? 'is-active' : ''}
                                        onClick={() => setTab('password')}
                                    >
                                        Change Password
                                    </button>
                                </div>

                                {loading ? (
                                    <div className="mwadmin-profile-loading">Loading…</div>
                                ) : (
                                    <AnimatePresence mode="wait">
                                        {tab === 'personal' && (
                                            <motion.div
                                                key="personal"
                                                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                                                transition={
                                                    reduceMotion
                                                        ? { duration: 0.01 }
                                                        : { duration: 0.22, ease: 'easeOut' }
                                                }
                                            >
                                            <form className="mwadmin-profile-form" onSubmit={onSavePersonal}>
                                                <div className="mwadmin-profile-form-grid">
                                                    <div>
                                                        <label>Login ID</label>
                                                        <input value={profile.username} readOnly />
                                                    </div>
                                                    <div />
                                                    <div>
                                                        <label>First Name *</label>
                                                        <input
                                                            value={profile.first_name}
                                                            onChange={(e) =>
                                                                setProfile((p) => ({ ...p, first_name: e.target.value }))
                                                            }
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label>Last Name *</label>
                                                        <input
                                                            value={profile.last_name}
                                                            onChange={(e) =>
                                                                setProfile((p) => ({ ...p, last_name: e.target.value }))
                                                            }
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label>Mobile Number</label>
                                                        <input
                                                            value={profile.contactno}
                                                            onChange={(e) =>
                                                                setProfile((p) => ({ ...p, contactno: e.target.value }))
                                                            }
                                                        />
                                                    </div>
                                                    <div>
                                                        <label>Email *</label>
                                                        <input
                                                            type="email"
                                                            value={profile.email}
                                                            onChange={(e) =>
                                                                setProfile((p) => ({ ...p, email: e.target.value }))
                                                            }
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mwadmin-profile-form-actions">
                                                    <button type="submit" className="mwadmin-profile-btn-primary" disabled={saving}>
                                                        {saving ? 'Saving…' : 'Save Changes'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="mwadmin-profile-btn-secondary"
                                                        onClick={onCancelPersonal}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                            </motion.div>
                                        )}

                                        {tab === 'password' && (
                                            <motion.div
                                                key="password"
                                                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                                                transition={
                                                    reduceMotion
                                                        ? { duration: 0.01 }
                                                        : { duration: 0.22, ease: 'easeOut' }
                                                }
                                            >
                                            <form className="mwadmin-profile-form" onSubmit={onSavePassword}>
                                                <div className="mwadmin-profile-form-grid mwadmin-profile-form-grid--narrow">
                                                    <div>
                                                        <label>Current Password *</label>
                                                        <input
                                                            type="password"
                                                            autoComplete="current-password"
                                                            value={pwd.current}
                                                            onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))}
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label>New Password *</label>
                                                        <input
                                                            type="password"
                                                            autoComplete="new-password"
                                                            value={pwd.next}
                                                            onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))}
                                                            required
                                                            minLength={4}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label>Confirm New Password *</label>
                                                        <input
                                                            type="password"
                                                            autoComplete="new-password"
                                                            value={pwd.confirm}
                                                            onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
                                                            required
                                                            minLength={4}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mwadmin-profile-form-actions">
                                                    <button type="submit" className="mwadmin-profile-btn-primary" disabled={saving}>
                                                        {saving ? 'Saving…' : 'Save Changes'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="mwadmin-profile-btn-secondary"
                                                        onClick={() => setPwd({ current: '', next: '', confirm: '' })}
                                                    >
                                                        Clear
                                                    </button>
                                                </div>
                                            </form>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                )}
                            </div>
                        </section>
                    </motion.div>
                </div>
            </MwadminLayout>
        </>
    );
}
