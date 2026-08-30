import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';

export default function Welcome() {
    const { auth, name } = usePage().props as { auth: { user: unknown }; name: string };

    const gradientBg = {
        background: `linear-gradient(135deg, var(--sidebar-from), var(--sidebar-to))`,
    };

    if (auth.user) {
        return (
            <>
                <Head title="Welcome" />
                <div className="flex min-h-screen items-center justify-center" style={gradientBg}>
                    <Link
                        href={dashboard()}
                        className="rounded-lg bg-white px-8 py-4 text-lg font-semibold shadow-lg transition hover:bg-emerald-50"
                        style={{ color: 'var(--sidebar-from)' }}
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Welcome" />
            <div className="flex min-h-screen items-center justify-center p-4" style={gradientBg}>
                <div className="w-full max-w-md rounded-2xl bg-white/95 p-10 shadow-2xl backdrop-blur">
                    <div className="mb-8 text-center">
                        <h1
                            className="text-3xl font-bold tracking-tight"
                            style={{ color: 'var(--sidebar-via)' }}
                        >
                            {name}
                        </h1>
                        <p className="mt-2" style={{ color: 'var(--sidebar-from)' }}>
                            Manage your domains & invoices
                        </p>
                    </div>
                    <div className="space-y-4">
                        <Link
                            href={login()}
                            className="flex w-full items-center justify-center rounded-xl px-6 py-4 text-lg font-semibold text-white shadow-md transition active:scale-[0.98]"
                            style={{ background: 'var(--sidebar-from)' }}
                        >
                            Log in
                        </Link>
                        <Link
                            href={register()}
                            className="flex w-full items-center justify-center rounded-xl border-2 px-6 py-4 text-lg font-semibold shadow-sm transition active:scale-[0.98]"
                            style={{ borderColor: 'var(--sidebar-from)', color: 'var(--sidebar-from)' }}
                        >
                            Register
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
