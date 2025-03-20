import React, {useEffect, useRef, useState} from 'react';
import {Head, Link, router} from '@inertiajs/react';
import Layout from '@/Layouts/AuthenticatedLayout';
import Pagination from "@/Components/Pagination.jsx";

export default function Index({ auth, mainProducts, specialProducts, search, allData }) {
    const [searchInput, setSearchInput] = useState(search || '');
    const [sortOrder, setSortOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef(null);

    const [localMainPage, setLocalMainPage] = useState(mainProducts?.current_page || 1);
    const [localMainProducts, setLocalMainProducts] = useState(mainProducts);

    const [localSpecialPage, setLocalSpecialPage] = useState(specialProducts?.current_page || 1);
    const [localSpecialProducts, setLocalSpecialProducts] = useState(specialProducts);

    const hasFullData = allData && allData.mainProductsAll && allData.specialProductsAll;

    useEffect(() => {
        if (hasFullData) {
            const perPage = 15;

            const mainStart = (localMainPage - 1) * perPage;
            const mainEnd = mainStart + perPage;
            const mainCurrentItems = allData.mainProductsAll.slice(mainStart, mainEnd);

            const mainPaginator = {
                data: mainCurrentItems,
                current_page: localMainPage,
                last_page: Math.ceil(allData.mainProductsAll.length / perPage),
                links: generatePaginationLinks(localMainPage, Math.ceil(allData.mainProductsAll.length / perPage))
            };

            setLocalMainProducts(mainPaginator);

            const specialStart = (localSpecialPage - 1) * perPage;
            const specialEnd = specialStart + perPage;
            const specialCurrentItems = allData.specialProductsAll.slice(specialStart, specialEnd);

            const specialPaginator = {
                data: specialCurrentItems,
                current_page: localSpecialPage,
                last_page: Math.ceil(allData.specialProductsAll.length / perPage),
                links: generatePaginationLinks(localSpecialPage, Math.ceil(allData.specialProductsAll.length / perPage))
            };

            setLocalSpecialProducts(specialPaginator);
        }
    }, [localMainPage, localSpecialPage, hasFullData]);

    const generatePaginationLinks = (currentPage, lastPage) => {
        const links = [];

        links.push({
            url: currentPage > 1 ? '#' : null,
            label: '&laquo; Назад',
            active: false
        });

        for (let i = 1; i <= lastPage; i++) {
            links.push({
                url: '#',
                label: i.toString(),
                active: i === currentPage
            });
        }

        links.push({
            url: currentPage < lastPage ? '#' : null,
            label: 'Вперед &raquo;',
            active: false
        });

        return links;
    };

    const handleMainPageChange = (page) => {
        setLocalMainPage(page);
    };

    const handleSpecialPageChange = (page) => {
        setLocalSpecialPage(page);
    };

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.addEventListener('focus', () => {
                navigator.keyboard?.lock(['ru']);
            });
        }
    }, []);

    const displayMainProducts = hasFullData ? localMainProducts : mainProducts;
    const displaySpecialProducts = hasFullData ? localSpecialProducts : specialProducts;

    const sortedProducts = [...(displayMainProducts.data || [])];
    if (sortOrder !== null) {
        sortedProducts.sort((a, b) => {
            const priceA = parseFloat(a.price) || 0;
            const priceB = parseFloat(b.price) || 0;
            return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
        });
    }

    const handleSearchChange = (e) => {
        setSearchInput(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        router.get(route('search.index'), { search: searchInput }, {
            preserveState: true,
            only: ['mainProducts', 'specialProducts', 'search', 'allData'],
            onFinish: () => setIsLoading(false)
        });
    };

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

    const handlePaste = async () => {
        const text = await navigator.clipboard.readText();
        setSearchInput(text);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(searchInput);
    };

    const handleCut = () => {
        navigator.clipboard.writeText(searchInput);
        setSearchInput('');
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
            <div className="py-4">
                <div className="mx-auto sm:px-6 lg:px-4 ">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-start">
                            <h1 className="text-2xl font-bold mb-3">Поиск деталей</h1>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="text-gray-700 underline"
                                style={{fontSize: 16}}
                            >
                                Выйти
                            </Link>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    ref={inputRef}
                                    className="form-input rounded-md shadow-sm block w-full"
                                    style={{border: '1px solid #00000030'}}
                                    value={searchInput}
                                    onChange={handleSearchChange}
                                    placeholder="Введите запрос..."
                                />
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300 transition-colors"
                                    onClick={handlePaste}>
                                    Вставить
                                </button>
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300 transition-colors"
                                    onClick={handleCopy}>
                                    Копировать
                                </button>
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300 transition-colors"
                                    onClick={handleCut}>
                                    Вырезать
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    disabled={isLoading}
                                >
                                    Поиск
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-4">
                            <h2 className="text-lg font-semibold mb-4">
                                Стоп-лист
                            </h2>
                            {displaySpecialProducts.data && displaySpecialProducts.data.length > 0 ? (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Год</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Кол-во</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Цена</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Поставщик</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Описание</th>
                                            </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                            {displaySpecialProducts.data.map((product) => (
                                                <tr key={product.id}
                                                    className={`${getSupplierColor(product.sheet_name)} hover:bg-opacity-50`}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.code}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.quantity}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.price}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sheet_name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.description}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {hasFullData ? (
                                        <Pagination
                                            links={displaySpecialProducts.links}
                                            currentPage={localSpecialPage}
                                            lastPage={displaySpecialProducts.last_page}
                                            onPageChange={handleSpecialPageChange}
                                        />
                                    ) : (
                                        <Pagination
                                            links={specialProducts.links}
                                            currentPage={specialProducts.current_page}
                                            lastPage={specialProducts.last_page}
                                            onPageChange={handleSpecialPageChange}
                                        />
                                    )}

                                </>
                            ) : (
                                <p className="text-gray-500">Нет данных для отображения</p>
                            )}
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-4">
                            <h2 className="text-lg font-semibold mb-4">
                                Детали
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
                                    {hasFullData ? (
                                        <Pagination
                                            links={displayMainProducts.links}
                                            currentPage={localMainPage}
                                            lastPage={displayMainProducts.last_page}
                                            onPageChange={handleMainPageChange}
                                        />
                                    ) : (
                                        <Pagination
                                            links={mainProducts.links}
                                            currentPage={mainProducts.current_page}
                                            lastPage={mainProducts.last_page}
                                            onPageChange={handleMainPageChange}
                                        />
                                    )}

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
