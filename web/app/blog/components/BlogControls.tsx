// This file is a part of AlphaGameBot.
// 
//     AlphaGameBot - A Discord bot that's free and (hopefully) doesn't suck.
//     Copyright (C) 2025  Damien Boisvert (AlphaGameDeveloper)
// 
//     AlphaGameBot is free software: you can redistribute it and/or modify
//     it under the terms of the GNU General Public License as published by
//     the Free Software Foundation, either version 3 of the License, or
//     (at your option) any later version.
// 
//     AlphaGameBot is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU General Public License for more details.
// 
//     You should have received a copy of the GNU General Public License
//     along with AlphaGameBot.  If not, see <https://www.gnu.org/licenses/>.

'use client';

import { useState } from 'react';

type BlogControlsProps = {
    categories: string[];
    onFilterChange: (category: string) => void;
    onSortChange: (sort: 'newest' | 'oldest') => void;
};

export default function BlogControls({ categories, onFilterChange, onSortChange }: BlogControlsProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedSort, setSelectedSort] = useState<'newest' | 'oldest'>('newest');

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const category = e.target.value;
        setSelectedCategory(category);
        onFilterChange(category);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const sort = e.target.value as 'newest' | 'oldest';
        setSelectedSort(sort);
        onSortChange(sort);
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-surface-elevated rounded-lg">
            {/* Category Filter */}
            <div className="flex items-center gap-3 flex-1">
                <label htmlFor="category-filter" className="text-sm font-medium text-text-default whitespace-nowrap">
                    Category:
                </label>
                <select
                    id="category-filter"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    className="flex-1 sm:flex-none sm:min-w-[200px] px-4 py-2 rounded-lg bg-surface-default border border-border text-text-default font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-primary-400 cursor-pointer"
                >
                    <option value="all">All Posts</option>
                    {categories.map((category) => (
                        <option key={category} value={category} className="capitalize">
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                    ))}
                </select>
                {selectedCategory !== 'all' && (
                    <button
                        onClick={() => handleCategoryChange({ target: { value: 'all' } } as any)}
                        className="text-xs text-text-muted hover:text-primary-500 transition-colors underline"
                        title="Clear filter"
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-3 flex-1 sm:flex-none">
                <label htmlFor="sort-order" className="text-sm font-medium text-text-default whitespace-nowrap">
                    Sort:
                </label>
                <select
                    id="sort-order"
                    value={selectedSort}
                    onChange={handleSortChange}
                    className="flex-1 sm:flex-none sm:min-w-40 px-4 py-2 rounded-lg bg-surface-default border border-border text-text-default font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-primary-400 cursor-pointer"
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                </select>
            </div>
        </div>
    );
}
