import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '@/Layouts/AuthenticatedLayout';

export default function Index({ auth, mainProducts, specialProducts, search, allData }) {
    const [searchInput, setSearchInput] = useState(search || '');
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef(null);

    const [sortedMainProducts, setSortedMainProducts] = useState(() =>
        mainProducts?.data?.length ? mainProducts.data : []
    );
    const [mainSortOrder, setMainSortOrder] = useState(null);

    const [sortedSpecialProducts, setSortedSpecialProducts] = useState(() =>
        specialProducts?.data?.length ? specialProducts.data : []
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
            'z': 'я', 'x': 'ч', 'c': 'с', 'v': 'м', 'b': 'и', 'n': 'т', 'm': 'ь', '/': '.', '?' : ','
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
        if (hasFullData) {
            const sortedMain = sortByPrice(allData.mainProductsAll || [], mainSortOrder);
            setSortedMainProducts(sortedMain);

            const sortedSpecial = sortByPrice(allData.specialProductsAll || [], specialSortOrder);
            const groupedSpecial = groupSpecialProducts(sortedSpecial);
            setSortedSpecialProducts(groupedSpecial);
        } else {
            const defaultMain = mainProducts?.data || [];
            setSortedMainProducts(sortByPrice(defaultMain, mainSortOrder));

            const defaultSpecial = specialProducts?.data || [];
            setSortedSpecialProducts(groupSpecialProducts(sortByPrice(defaultSpecial, specialSortOrder)));
        }
    }, [allData, mainSortOrder, specialSortOrder, mainProducts, specialProducts, hasFullData]);

    const handleMainSortChange = () => {
        if (mainSortOrder === null) {
            setMainSortOrder("asc");
        } else if (mainSortOrder === "asc") {
            setMainSortOrder("desc");
        } else {
            setMainSortOrder(null);
        }
    };

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
        setMainSortOrder(null);
        setSpecialSortOrder(null);

        router.get(route('search.index'), { search: searchInput }, {
            preserveState: true,
            replace: true,
            only: ['mainProducts', 'specialProducts', 'search', 'allData'],
            onFinish: () => {
                setIsLoading(false);
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
            "bg-purple-100", "bg-orange-100", "bg-yellow-100",
            "bg-slate-200", "bg-indigo-100", "bg-teal-100",
            "bg-amber-100", "bg-lime-100", "bg-sky-100",
            "bg-emerald-100"
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
                <div className="mx-auto sm:px-6 lg:px-4">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-3 mb-4">
                        <form onSubmit={handleSubmit}>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    ref={inputRef}
                                    className="form-input rounded-md shadow-sm block w-full"
                                    style={{ border: '1px solid #00000030' }}
                                    value={searchInput}
                                    onChange={handleSearchChange}
                                    placeholder="Введите запрос..."
                                />
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-500 transition-colors"
                                    disabled={isLoading}
                                >
                                    Поиск
                                </button>
                                <button
                                    type="button"
                                    onClick={toggleConvertLayout}
                                    className={`px-4 py-2 rounded-md transition-colors ${convertLayout ? 'bg-gray-800 text-white hover:bg-gray-500' : 'bg-gray-200 text-black hover:bg-gray-300'}`}
                                >
                                    EN→RU
                                </button>
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300 transition-colors"
                                    onClick={handlePaste}
                                >
                                    Вставить
                                </button>
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300 transition-colors"
                                    onClick={handleCopy}
                                >
                                    Копировать
                                </button>
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300 transition-colors"
                                    onClick={handleCut}
                                >
                                    Вырезать
                                </button>
                                <div className="bg-gray-400 separator"/>
                                <Link
                                    href={route('settings')}
                                    method="get"
                                    as="button"
                                    className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-500 transition-colors"
                                >
                                    Настройки
                                </Link>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-400 transition-colors"
                                >
                                    Выйти
                                </Link>
                            </div>
                        </form>
                    </div>
                    <div className="flex flex-row gap-4">
                        <div
                            className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-4 h-screen-padding"
                            style={sortedSpecialProducts && sortedSpecialProducts.length > 0 ? {width: '80%'} : {width: '30%'}}
                        >
                            <h2 className="text-lg font-semibold mb-2">
                                Стоп-лист ({sortedSpecialProducts.length})
                            </h2>
                            {sortedSpecialProducts && sortedSpecialProducts.length > 0 ? (
                                <div className="overflow-y-auto h-full-padding">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[220px] truncate">
                                                Название
                                            </th>
                                            <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[75px] truncate">
                                                Год
                                            </th>
                                            <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Кол-во
                                            </th>
                                            <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Цена
                                            </th>
                                            <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Поставщик
                                            </th>
                                            <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Описание
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                        {sortedSpecialProducts.map((product) => (
                                            <tr
                                                key={product.id}
                                                className={`${product.sheet_name === "STOP" ? "text-red-600 bg-red-50" : getSupplierColor(product.sheet_name)} hover:bg-opacity-50`}
                                            >
                                                <td className="whitespace-nowrap text-sm row-padding max-w-[220px] truncate">{product.name}</td>
                                                <td className="whitespace-nowrap text-sm row-padding max-w-[75px] truncate">{product.code}</td>
                                                <td className="whitespace-nowrap text-sm row-padding">{product.quantity}</td>
                                                <td className="whitespace-nowrap text-sm row-padding">{product.price}</td>
                                                <td className="whitespace-nowrap text-sm row-padding">{product.sheet_name}</td>
                                                <td className="whitespace-nowrap text-sm row-padding">{product.description}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500">Нет данных для отображения</p>
                            )}
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-4 h-screen-padding" style={{width: '100%'}}>
                            <h2 className="text-lg font-semibold mb-2">
                                Детали ({sortedMainProducts.length})
                            </h2>
                            {sortedMainProducts && sortedMainProducts.length > 0 ? (
                                <div className="overflow-y-auto h-full-padding">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase max-w-[220px] truncate">
                                                Название
                                            </th>
                                            <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase max-w-[75px] truncate">
                                                Год
                                            </th>
                                            <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                Кол-во
                                            </th>
                                            <th
                                                className="p-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                                                onClick={handleMainSortChange}
                                            >
                                                Цена <SortIndicator sortOrder={mainSortOrder} />
                                            </th>
                                            <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                Поставщик
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                        {sortedMainProducts.map((product) => (
                                            <tr
                                                key={product.id}
                                                className={`${getSupplierColor(product.sheet_name)} hover:bg-opacity-50`}
                                            >
                                                <td className="whitespace-nowrap text-sm text-gray-900 row-padding max-w-[220px] truncate">
                                                    {product.name}
                                                </td>
                                                <td className="whitespace-nowrap text-sm text-gray-500 row-padding max-w-[75px] truncate">
                                                    {product.code}
                                                </td>
                                                <td className="whitespace-nowrap text-sm text-gray-500 row-padding">
                                                    {product.quantity}
                                                </td>
                                                <td className="whitespace-nowrap text-sm text-gray-500 row-padding">
                                                    {product.price}
                                                </td>
                                                <td className="whitespace-nowrap text-sm text-gray-500 row-padding">
                                                    {product.sheet_name}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
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
