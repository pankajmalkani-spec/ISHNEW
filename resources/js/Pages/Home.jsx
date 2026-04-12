import { Head } from '@inertiajs/react';

export default function Home() {
    return (
        <>
            <Head title="Home" />
            <div className="min-h-dvh bg-zinc-50 text-zinc-900">
                <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-16">
                    <h1 className="text-3xl font-semibold tracking-tight">
                        ISH News — Laravel + Inertia + React
                    </h1>
                    <p className="text-zinc-600">
                        This page is rendered with Inertia. Add routes that return{' '}
                        <code className="rounded bg-zinc-200 px-1.5 py-0.5 text-sm">
                            Inertia::render(...)
                        </code>{' '}
                        and matching components under{' '}
                        <code className="rounded bg-zinc-200 px-1.5 py-0.5 text-sm">
                            resources/js/Pages
                        </code>
                        .
                    </p>
                </main>
            </div>
        </>
    );
}
