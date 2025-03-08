export default function AuthenticatedLayout({children}) {
    return (
        <div className="min-h-screen bg-gray-100">
            <main>{children}</main>
        </div>
    );
}
