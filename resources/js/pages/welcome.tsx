import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';

export default function Welcome() {
    const { auth, name } = usePage().props as { auth: { user: unknown }; name: string };

    if (auth.user) {
        return (
            <>
                <Head title="Welcome" />
                <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-700 to-emerald-900">
                    <Link
                        href={dashboard()}
                        className="rounded-lg bg-white px-8 py-4 text-lg font-semibold text-emerald-800 shadow-lg transition hover:bg-emerald-50"
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
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-600 to-green-800 p-4">
                <div className="w-full max-w-md rounded-2xl bg-white/95 p-10 shadow-2xl backdrop-blur">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-emerald-800">
                            {name}
                        </h1>
                        <p className="mt-2 text-emerald-600">Manage your domains & invoices</p>
                    </div>
                    <div className="space-y-4">
                        <Link
                            href={login()}
                            className="flex w-full items-center justify-center rounded-xl bg-emerald-600 px-6 py-4 text-lg font-semibold text-white shadow-md transition hover:bg-emerald-700 active:scale-[0.98]"
                        >
                            Log in
                        </Link>
                        <Link
                            href={register()}
                            className="flex w-full items-center justify-center rounded-xl border-2 border-emerald-600 px-6 py-4 text-lg font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50 active:scale-[0.98]"
                        >
                            Register
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
