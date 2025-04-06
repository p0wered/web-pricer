import {useForm, Head, Link} from '@inertiajs/react';
import React, { useState } from 'react';
import Layout from '@/Layouts/AuthenticatedLayout';

export default function Settings({ auth, settings }) {
    const {
        data: passwordData,
        setData: setPasswordData,
        post: postPassword,
        processing: processingPassword,
        errors: passwordErrors,
        reset: resetPassword,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const {
        data: importData,
        setData: setImportData,
        put: putImport,
        processing: processingImport,
        errors: importErrors,
    } = useForm({
        excel_import_url: settings?.excel_import_url || '',
        excel_import_username: settings?.excel_import_username || '',
        excel_import_password: settings?.excel_import_password || '',
        excel_import_frequency: settings?.excel_import_frequency || 'daily',
        excel_import_day: settings?.excel_import_day || '',
        excel_import_time: settings?.excel_import_time || '',
    });

    const [passwordMessage, setPasswordMessage] = useState(null);
    const [importMessage, setImportMessage] = useState(null);
    const { post, processing: processingImportAction } = useForm();

    const handleImport = (e) => {
        e.preventDefault();
        post(route('import.data'), {
            onSuccess: (res) => {
                console.log(res.props);
            },
            onError: (errors) => {
                console.error(errors);
            }
        });
    };

    const submitPassword = (e) => {
        e.preventDefault();
        postPassword(route('settings.password'), {
            preserveScroll: true,
            onSuccess: () => {
                setPasswordMessage('Пароль успешно обновлён');
                resetPassword();
            },
        });
    };

    const submitImport = (e) => {
        e.preventDefault();
        putImport(route('settings.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setImportMessage('Настройки импорта обновлены');
            },
        });
    };

    return (
        <Layout auth={auth}>
            <Head title="Настройки" />
            <div>
                <div className="mx-auto">
                    <div className="overflow-hidden sm:rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-center bg-white rounded-lg p-4 mb-4">
                            <h1 className="text-2xl font-bold">Настройки</h1>
                            <Link
                                href={route('search.index')}
                                method="get"
                                as="button"
                                className="text-gray-700 underline"
                                style={{fontSize: 16}}
                            >
                                Вернуться к поиску
                            </Link>
                        </div>
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                            <div className='flex flex-col gap-4'>
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-4">
                                    <h2 className="text-xl font-semibold mb-4">Сменить пароль</h2>
                                    {passwordMessage && <p className="text-green-500 mb-2">{passwordMessage}</p>}
                                    <form onSubmit={submitPassword} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Текущий пароль
                                            </label>
                                            <input
                                                type="password"
                                                value={passwordData.current_password}
                                                onChange={(e) => setPasswordData('current_password', e.target.value)}
                                                className="form-input rounded-md shadow-sm block w-full border border-gray-300 p-2"
                                            />
                                            {passwordErrors.current_password && (
                                                <p className="text-red-500 text-sm mt-2">{passwordErrors.current_password}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Новый пароль
                                            </label>
                                            <input
                                                type="password"
                                                value={passwordData.password}
                                                onChange={(e) => setPasswordData('password', e.target.value)}
                                                className="form-input rounded-md shadow-sm block w-full border border-gray-300 p-2"
                                            />
                                            {passwordErrors.password && (
                                                <p className="text-red-500 text-sm mt-2">{passwordErrors.password}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Подтвердите пароль
                                            </label>
                                            <input
                                                type="password"
                                                value={passwordData.password_confirmation}
                                                onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                                className="form-input rounded-md shadow-sm block w-full border border-gray-300 p-2"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                            disabled={processingPassword}
                                        >
                                            {processingPassword ? 'Сохранение...' : 'Сменить пароль'}
                                        </button>
                                    </form>
                                </div>
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-4">
                                    <h2 className="text-xl font-semibold mb-4">Импорт данных</h2>
                                    <button
                                        onClick={handleImport}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                        disabled={processingImportAction}
                                    >
                                        {processingImportAction ? 'Импорт...' : 'Импортировать данные'}
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-4">
                                <h2 className="text-xl font-semibold mb-4">Настройки импорта</h2>
                                {importMessage && <p className="text-green-500 mb-2">{importMessage}</p>}
                                <form onSubmit={submitImport} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            URL Excel файла
                                        </label>
                                        <input
                                            type="url"
                                            value={importData.excel_import_url}
                                            onChange={(e) => setImportData('excel_import_url', e.target.value)}
                                            className="form-input rounded-md shadow-sm block w-full border border-gray-300 p-2"
                                        />
                                        {importErrors.excel_import_url && (
                                            <p className="text-red-500 text-sm mt-2">{importErrors.excel_import_url}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Логин
                                        </label>
                                        <input
                                            type="text"
                                            value={importData.excel_import_username}
                                            onChange={(e) => setImportData('excel_import_username', e.target.value)}
                                            className="form-input rounded-md shadow-sm block w-full border border-gray-300 p-2"
                                        />
                                        {importErrors.excel_import_username && (
                                            <p className="text-red-500 text-sm mt-2">{importErrors.excel_import_username}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Пароль
                                        </label>
                                        <input
                                            type="text"
                                            value={importData.excel_import_password}
                                            onChange={(e) => setImportData('excel_import_password', e.target.value)}
                                            className="form-input rounded-md shadow-sm block w-full border border-gray-300 p-2"
                                        />
                                        {importErrors.excel_import_password && (
                                            <p className="text-red-500 text-sm mt-2">{importErrors.excel_import_password}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Частота импорта
                                        </label>
                                        <select
                                            value={importData.excel_import_frequency}
                                            onChange={(e) => setImportData('excel_import_frequency', e.target.value)}
                                            className="form-select rounded-md shadow-sm block w-full border border-gray-300 p-2"
                                        >
                                            <option value="daily">Ежедневно</option>
                                            <option value="weekly">Еженедельно</option>
                                            <option value="monthly">Ежемесячно</option>
                                        </select>
                                        {importErrors.excel_import_frequency && (
                                            <p className="text-red-500 text-sm mt-2">{importErrors.excel_import_frequency}</p>
                                        )}
                                    </div>

                                    {importData.excel_import_frequency !== 'daily' && (
                                        <div>
                                            {
                                                importData.excel_import_frequency === 'weekly' ? (
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Номер дня недели
                                                    </label>
                                                ) : (
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Число месяца
                                                    </label>
                                                )
                                            }

                                            <input
                                                type="number"
                                                min="1"
                                                max="31"
                                                value={importData.excel_import_day || ''}
                                                onChange={(e) => setImportData('excel_import_day', e.target.value)}
                                                className="form-input rounded-md shadow-sm block w-full border border-gray-300 p-2"
                                            />
                                            {importErrors.excel_import_day && (
                                                <p className="text-red-500 text-sm mt-2">{importErrors.excel_import_day}</p>
                                            )}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Время запуска импорта
                                        </label>
                                        <input
                                            type="text"
                                            value={importData.excel_import_time}
                                            onChange={(e) => setImportData('excel_import_time', e.target.value)}
                                            className="form-input rounded-md shadow-sm block w-full border border-gray-300 p-2"
                                            placeholder="HH:MM"
                                        />
                                        {importErrors.excel_import_time && (
                                            <p className="text-red-500 text-sm mt-2">{importErrors.excel_import_time}</p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                        disabled={processingImport}
                                    >
                                        {processingImport ? 'Сохранение...' : 'Сохранить настройки импорта'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
