import React, { useState } from "react";

export default function Pagination({ links, currentPage, lastPage, onPageChange }) {
    const visiblePages = 3;
    const [inputPage, setInputPage] = useState(currentPage);

    const generatePageNumbers = () => {
        const pages = [];
        if (lastPage <= visiblePages + 2) {
            for (let i = 1; i <= lastPage; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            if (currentPage > visiblePages) {
                pages.push("...");
            }

            let start = Math.max(2, currentPage - 1);
            let end = Math.min(lastPage - 1, currentPage + 1);
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < lastPage - visiblePages) {
                pages.push("...");
            }
            pages.push(lastPage);
        }
        return pages;
    };

    const handleInputChange = (e) => {
        setInputPage(e.target.value);
    };

    const handlePageSubmit = (e) => {
        e.preventDefault();
        const pageNumber = Number(inputPage);
        if (pageNumber >= 1 && pageNumber <= lastPage) {
            onPageChange(pageNumber);
        }
    };

    return (
        <div className="flex items-center justify-center mt-4 space-x-2">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 border text-sm font-medium rounded-md ${
                    currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
                }`}
            >
                &laquo;
            </button>

            <div className="flex">
                <div className="flex space-x-1 mr-1">
                    {generatePageNumbers().map((page, index) => (
                        <button
                            key={index}
                            onClick={() => typeof page === "number" && onPageChange(page)}
                            className={`px-3 py-2 border text-sm font-medium rounded-md ${
                                page === currentPage ? "bg-blue-600 text-white" : "hover:bg-gray-100"
                            } ${typeof page === "string" ? "cursor-default" : ""}`}
                            disabled={typeof page === "string"}
                        >
                            {page}
                        </button>
                    ))}
                </div>
                <form onSubmit={handlePageSubmit} className="flex items-center space-x-1">
                    <input
                        type="number"
                        value={inputPage}
                        onChange={handleInputChange}
                        className="w-16 px-2 py-1 border rounded-md text-center"
                        style={{border: '1px solid #e0e0e2', height: '100%'}}
                    />
                    <button type="submit" className="px-3 py-2 border text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-600">
                        Перейти
                    </button>
                </form>
            </div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === lastPage}
                className={`px-3 py-2 border text-sm font-medium rounded-md ${
                    currentPage === lastPage ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
                }`}
            >
                &raquo;
            </button>
        </div>
    );
}
