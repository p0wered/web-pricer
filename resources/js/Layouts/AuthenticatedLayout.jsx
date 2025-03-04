import { Link } from '@inertiajs/react';

export default function AuthenticatedLayout({header, children}) {
    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center"/>
                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex"/>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="text-sm text-gray-700 underline"
                                >
                                    Log Out
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
