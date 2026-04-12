import { Head, router } from '@inertiajs/react';

export default function AccessDenied({ authUser = {}, flash = {} }) {
    const err = flash?.error;

    return (
        <>
            <Head title="Access" />
            <div className="min-h-dvh bg-zinc-950 text-zinc-100">
                <main className="mx-auto flex min-h-dvh max-w-lg items-center px-6 py-10">
                    <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg">
                        <h1 className="mb-2 text-xl font-semibold">No access</h1>
                        <p className="mb-4 text-sm text-zinc-400">
                            {err ||
                                'Your account is signed in, but no mwadmin modules are enabled for this user. Ask an administrator to assign roles and module rights.'}
                        </p>
                        <p className="mb-6 text-xs text-zinc-500">
                            Signed in as <strong className="text-zinc-300">{authUser.username || '—'}</strong>
                        </p>
                        <button
                            type="button"
                            onClick={() => router.post('/mwadmin/logout')}
                            className="rounded-md bg-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-600"
                        >
                            Log out
                        </button>
                    </div>
                </main>
            </div>
        </>
    );
}
