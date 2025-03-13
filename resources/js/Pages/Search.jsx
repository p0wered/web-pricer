import React, {useState} from 'react';
import {Head, Link, useForm} from '@inertiajs/react';
import Layout from '@/Layouts/AuthenticatedLayout';
import Pagination from "@/Components/Pagination.jsx";


export default function Index({ auth, mainProducts, specialProducts, search }) {
    const { data, setData, post, processing } = useForm({
        search: search || '',
    });

    const [sortOrder, setSortOrder] = useState(null);

    const sortedProducts = [...mainProducts.data];
    if (sortOrder !== null) {
        sortedProducts.sort((a, b) => {
            const priceA = parseFloat(a.price) || 0;
            const priceB = parseFloat(b.price) || 0;
            return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
        });
    }

    const toggleSortOrder = () => {
        if (sortOrder === null) {
            setSortOrder("asc");
        } else if (sortOrder === "asc") {
            setSortOrder("desc");
        } else {
            setSortOrder(null);
        }
    };

    const getSortSymbol = () => {
        if (sortOrder === "asc") return "↑";
        if (sortOrder === "desc") return "↓";
        return "↔";
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('search.search'));
    };

    const getSupplierColor = (supplier) => {
        const colors = [
            "bg-red-100", "bg-green-100", "bg-blue-100",
            "bg-yellow-100", "bg-purple-100", "bg-pink-100",
            "bg-gray-100", "bg-indigo-100", "bg-teal-100",
            "bg-amber-100", "bg-lime-100", "bg-sky-100"
        ];
        const index = supplier ? supplier.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length : 0;
        return colors[index];
    };

    return (
        <Layout auth={auth}>
            <Head title="Поиск деталей" />
            <div className="py-8">
                <div className="mx-auto sm:px-6 lg:px-8 ">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 mb-6">
                        <div className="flex justify-between">
                            <h1 className="text-2xl font-bold mb-4">Поиск деталей</h1>
                            <div>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="text-gray-700 underline"
                                    style={{fontSize: 18}}
                                >
                                    Выйти
                                </Link>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="flex items-center">
                                <input
                                    type="text"
                                    className="form-input rounded-md shadow-sm mt-1 block w-full"
                                    style={{border: '1px solid #00000030'}}
                                    value={data.search}
                                    onChange={e => setData('search', e.target.value)}
                                    placeholder="Введите запрос..."
                                />
                                <button
                                    type="submit"
                                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    disabled={processing}
                                >
                                    Поиск
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-4">
                            <h2 className="text-lg font-semibold mb-4">
                                Стоп-лист ({specialProducts.total || 0})
                            </h2>
                            {specialProducts.data && specialProducts.data.length > 0 ? (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Год</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Кол-во</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Цена</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Описание</th>
                                            </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                            {specialProducts.data.map((product) => (
                                                <tr key={product.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.code}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.quantity}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.price}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.description}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Pagination
                                        links={specialProducts.links}
                                        search={search}
                                        currentPage={specialProducts.current_page}
                                        lastPage={specialProducts.last_page}
                                        pageParam="special_page"
                                    />
                                </>
                            ) : (
                                <p className="text-gray-500">Нет данных для отображения</p>
                            )}
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-4">
                            <h2 className="text-lg font-semibold mb-4">
                                Детали ({mainProducts.total || 0})
                            </h2>
                            {sortedProducts.length > 0 ? (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Название
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Год
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Количество
                                                </th>
                                                <th
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                                                    onClick={toggleSortOrder}
                                                >
                                                    Цена <span className='text-blue-600'>{getSortSymbol()}</span>
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Поставщик
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Описание
                                                </th>
                                            </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                            {sortedProducts.map((product) => (
                                                <tr
                                                    key={product.id}
                                                    className={`${getSupplierColor(product.sheet_name)} hover:bg-opacity-50`}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {product.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {product.code}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {product.quantity}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {product.price}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {product.sheet_name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {product.description}
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Pagination
                                        links={mainProducts.links}
                                        search={search}
                                        currentPage={mainProducts.current_page}
                                        lastPage={mainProducts.last_page}
                                        pageParam="main_page"
                                    />
                                </>
                            ) : (
                                <p className="text-gray-500">Нет данных для отображения</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
