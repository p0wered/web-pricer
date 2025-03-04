import React, {useState} from 'react';

const Pagination = ({links, search, currentPage, lastPage, pageParam = 'page'}) => {
    const [pageInput, setPageInput] = useState(currentPage);

    if (links.length <= 3) {
        return null;
    }

    const handlePageChange = (e) => {
        e.preventDefault();
        const url = new URL(window.location.href);
        url.searchParams.set(pageParam, pageInput);
        if (search) {
            url.searchParams.set('search', search);
        }
        window.location.href = url.toString();
    };

    return (
        <div className="flex flex-wrap justify-center mt-4 items-center">
            {links.map((link, key) => {
                if (link.url === null) {
                    return (
                        <span
                            key={key}
                            className="mx-1 px-4 py-2 text-gray-500 bg-gray-200 rounded-md"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                }

                const url = new URL(link.url, window.location.origin);

                if (search) {
                    url.searchParams.set('search', search);
                }

                return (
                    <a
                        key={key}
                        href={url.toString()}
                        className={`mx-1 px-4 py-2 rounded-md ${
                            link.active ?
                                'bg-blue-600 text-white' :
                                'bg-white text-blue-600 hover:bg-gray-100'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                );
            })}

            <form onSubmit={handlePageChange} className="ml-4 flex items-center">
                <span className="mr-2">Страница:</span>
                <input
                    type="number"
                    min="1"
                    max={lastPage}
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    className="w-16 px-2 py-1 border rounded-md"
                />
                <span style={{marginLeft: '0.5rem', marginRight: '1rem'}}>из {lastPage}</span>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Перейти
                </button>
            </form>
        </div>
    );
};

export default Pagination;
