import React, {useEffect, useRef, useState} from 'react';
import {Head, Link, router} from '@inertiajs/react';
import Layout from '@/Layouts/AuthenticatedLayout';
import Pagination from "@/Components/Pagination.jsx";

export default function Index({ auth, mainProducts, specialProducts, search, allData }) {
    const [searchInput, setSearchInput] = useState(search || '');
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef(null);

    const [localMainPage, setLocalMainPage] = useState(1);
    const [localMainProducts, setLocalMainProducts] = useState(() =>
        mainProducts?.data?.length ? mainProducts : { data: [], links: [] }
    );
    const [mainSortOrder, setMainSortOrder] = useState(null);

    const [localSpecialPage, setLocalSpecialPage] = useState(1);
    const [localSpecialProducts, setLocalSpecialProducts] = useState(() =>
        specialProducts?.data?.length ? specialProducts : { data: [], links: [] }
    );
    const [specialSortOrder, setSpecialSortOrder] = useState(null);
    const [convertLayout, setConvertLayout] = useState(() => {
        const saved = localStorage.getItem('convertLayout');
        return saved === 'true';
    });

    const hasFullData = allData && (
        (allData.mainProductsAll?.length > 0) ||
        (allData.specialProductsAll?.length > 0)
    );

    const sortByPrice = (data, sortOrder) => {
        if (!sortOrder) return data;

        return [...data].sort((a, b) => {
            const priceA = a.price ? parseFloat(a.price) : null;
            const priceB = b.price ? parseFloat(b.price) : null;

            if (priceA === null && priceB === null) return 0;
            if (priceA === null) return 1;
            if (priceB === null) return -1;

            return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
        });
    };

    const convertEngToRus = (text) => {
        const engToRusMap = {
            'q': 'й', 'w': 'ц', 'e': 'у', 'r': 'к', 't': 'е', 'y': 'н', 'u': 'г', 'i': 'ш', 'o': 'щ', 'p': 'з', '[': 'х', ']': 'ъ',
            'a': 'ф', 's': 'ы', 'd': 'в', 'f': 'а', 'g': 'п', 'h': 'р', 'j': 'о', 'k': 'л', 'l': 'д', ';': 'ж', '\'': 'э',
            'z': 'я', 'x': 'ч', 'c': 'с', 'v': 'м', 'b': 'и', 'n': 'т', 'm': 'ь', ',': 'б', '.': 'ю'
        };

        return text.split('').map(char => {
            const lowerChar = char.toLowerCase();
            const converted = engToRusMap[lowerChar] || char;
            return char === lowerChar ? converted : converted.toUpperCase();
        }).join('');
    };

    const groupSpecialProducts = (data) => {
        const priorityOrder = ["STOP", "RK", "PI"];

        return [...data].sort((a, b) => {
            const indexA = priorityOrder.includes(a.sheet_name) ? priorityOrder.indexOf(a.sheet_name) : priorityOrder.length;
            const indexB = priorityOrder.includes(b.sheet_name) ? priorityOrder.indexOf(b.sheet_name) : priorityOrder.length;
            return indexA - indexB;
        });
    };

    useEffect(() => {
        const perPage = 15;

        if (hasFullData) {
            const sortedMain = sortByPrice(allData.mainProductsAll || [], mainSortOrder);
            const mainTotalItems = sortedMain.length;
            const mainLastPage = Math.ceil(mainTotalItems / perPage) || 1;
            const currentMainPage = Math.min(localMainPage, mainLastPage);

            const mainStartIndex = (currentMainPage - 1) * perPage;
            const mainPaginatedData = sortedMain.slice(
                mainStartIndex,
                mainStartIndex + perPage
            );

            setLocalMainProducts({
                data: mainPaginatedData,
                current_page: currentMainPage,
                last_page: mainLastPage,
                links: generatePaginationLinks(currentMainPage, mainLastPage)
            });

            const sortedSpecial = sortByPrice(allData.specialProductsAll || [], specialSortOrder);
            const groupedSpecial = groupSpecialProducts(sortedSpecial);
            const specialTotalItems = groupedSpecial.length;
            const specialLastPage = Math.ceil(specialTotalItems / perPage) || 1;
            const currentSpecialPage = Math.min(localSpecialPage, specialLastPage);

            const specialStartIndex = (currentSpecialPage - 1) * perPage;
            const specialPaginatedData = groupedSpecial.slice(
                specialStartIndex,
                specialStartIndex + perPage
            );

            setLocalSpecialProducts({
                data: specialPaginatedData,
                current_page: currentSpecialPage,
                last_page: specialLastPage,
                links: generatePaginationLinks(currentSpecialPage, specialLastPage)
            });

        } else {
            const mainData = mainProducts?.data?.length
                ? mainProducts
                : { data: [], links: [], current_page: 1, last_page: 1 };

            const specialData = specialProducts?.data?.length
                ? specialProducts
                : { data: [], links: [], current_page: 1, last_page: 1 };

            setLocalMainProducts(prev => ({
                ...prev,
                ...mainData,
                links: mainData.links || generatePaginationLinks(1, 1)
            }));

            setLocalSpecialProducts(prev => ({
                ...prev,
                ...specialData,
                links: specialData.links || generatePaginationLinks(1, 1)
            }));
        }
    }, [
        allData,
        mainSortOrder,
        specialSortOrder,
        localMainPage,
        localSpecialPage,
        mainProducts,
        specialProducts
    ]);

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

    const handleMainSortChange = () => {
        if (mainSortOrder === null) {
            setMainSortOrder("asc");
        } else if (mainSortOrder === "asc") {
            setMainSortOrder("desc");
        } else {
            setMainSortOrder(null);
        }
        setLocalMainPage(1);
    };

    const displayMainProducts = localMainProducts;
    const displaySpecialProducts = localSpecialProducts;

    const handleSearchChange = (e) => {
        const newValue = e.target.value;

        if (convertLayout && newValue.length > searchInput.length) {
            const addedPart = newValue.slice(searchInput.length);
            const convertedPart = convertEngToRus(addedPart);
            setSearchInput(searchInput + convertedPart);
        } else {
            setSearchInput(newValue);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        setLocalMainPage(1);
        setLocalSpecialPage(1);
        setMainSortOrder(null);
        setSpecialSortOrder(null);

        router.get(route('search.index'), { search: searchInput }, {
            preserveState: true,
            replace: true,
            only: ['mainProducts', 'specialProducts', 'search', 'allData'],
            onFinish: () => {
                setIsLoading(false);
                setLocalMainProducts(prev => ({ ...prev }));
                setLocalSpecialProducts(prev => ({ ...prev }));
            }
        });
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
            "bg-purple-100", "bg-pink-100", "bg-yellow-100",
            "bg-gray-100", "bg-indigo-100", "bg-teal-100",
            "bg-amber-100", "bg-lime-100", "bg-sky-100",
            "bg-fuchsia-100"
        ];
        const index = supplier ? supplier.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length : 0;
        return colors[index];
    };

    const SortIndicator = ({ sortOrder }) => {
        if (sortOrder === null) return <span className="ml-1">↔</span>;
        return sortOrder === "asc" ? <span className="ml-1">↑</span> : <span className="ml-1">↓</span>;
    };

    const toggleConvertLayout = () => {
        setConvertLayout(prev => {
            const newValue = !prev;
            localStorage.setItem('convertLayout', newValue);
            return newValue;
        });
    };

    return (
        <Layout auth={auth}>
            <Head title="Поиск деталей" />
            <div className="py-4">
                <div className="mx-auto sm:px-6 lg:px-4 ">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-start">
                            <h1 className="text-xl font-bold mb-3">Поиск деталей</h1>
                            <div className='flex gap-3'>
                                <Link
                                    href={route('settings')}
                                    method="get"
                                    as="button"
                                    className="text-gray-700 underline"
                                    style={{fontSize: 16}}
                                >
                                    Настройки
                                </Link>
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
                                    onClick={toggleConvertLayout}
                                    className={`px-4 py-2 rounded-md transition-colors ${convertLayout ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'}`}
                                >
                                    EN→РУ
                                </button>
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
                                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Год</th>
                                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Кол-во</th>
                                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Цена</th>
                                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Поставщик</th>
                                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Описание</th>
                                            </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                            {displaySpecialProducts.data.map((product) => (
                                                <tr key={product.id}
                                                    className={`${getSupplierColor(product.sheet_name)} hover:bg-opacity-50`}
                                                >
                                                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900">{product.name}</td>
                                                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-500">{product.code}</td>
                                                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-500">{product.quantity}</td>
                                                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-500">{product.price}</td>
                                                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-500">{product.sheet_name}</td>
                                                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-500">{product.description}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Pagination
                                        links={hasFullData ? displaySpecialProducts.links : specialProducts.links}
                                        currentPage={hasFullData ? localSpecialPage : specialProducts.current_page}
                                        lastPage={hasFullData ? displaySpecialProducts.last_page : specialProducts.last_page}
                                        onPageChange={handleSpecialPageChange}
                                    />

                                </>
                            ) : (
                                <p className="text-gray-500">Нет данных для отображения</p>
                            )}
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-4">
                            <h2 className="text-lg font-semibold mb-4">
                                Детали
                            </h2>
                            {displayMainProducts.data && displayMainProducts.data.length > 0 ? (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Название
                                                </th>
                                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Год
                                                </th>
                                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Кол-во
                                                </th>
                                                <th
                                                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                                                    onClick={handleMainSortChange}
                                                >
                                                    Цена <SortIndicator sortOrder={mainSortOrder} />
                                                </th>
                                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Поставщик
                                                </th>
                                            </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                            {displayMainProducts.data.map((product) => (
                                                <tr
                                                    key={product.id}
                                                    className={`${getSupplierColor(product.sheet_name)} hover:bg-opacity-50`}
                                                >
                                                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900">
                                                        {product.name}
                                                    </td>
                                                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-500">
                                                        {product.code}
                                                    </td>
                                                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-500">
                                                        {product.quantity}
                                                    </td>
                                                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-500">
                                                        {product.price}
                                                    </td>
                                                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-500">
                                                        {product.sheet_name}
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Pagination
                                        links={hasFullData ? displayMainProducts.links : mainProducts.links}
                                        currentPage={hasFullData ? localMainPage : mainProducts.current_page}
                                        lastPage={hasFullData ? displayMainProducts.last_page : mainProducts.last_page}
                                        onPageChange={handleMainPageChange}
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
