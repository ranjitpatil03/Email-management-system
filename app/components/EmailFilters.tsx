'use client'

import { useState } from 'react'
import { Search, Filter } from 'lucide-react'

interface EmailFiltersProps {
  onFilterChange: (filters: FilterOptions) => void
  onSearchChange: (search: string) => void
}

export interface FilterOptions {
  priority: string[]
  category: string[]
  opportunityLevel: string[]
}

export default function EmailFilters({ onFilterChange, onSearchChange }: EmailFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({
    priority: [],
    category: [],
    opportunityLevel: []
  })
  const [showFilters, setShowFilters] = useState(false)

  const priorityOptions = ['Critical', 'High', 'Medium', 'Low']
  const categoryOptions = ['Business', 'Support', 'Marketing', 'Personal']
  const opportunityLevels = ['High (70-100)', 'Medium (40-69)', 'Low (0-39)']

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    onSearchChange(value)
  }

  const handleFilterChange = (filterType: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters }
    const currentValues = newFilters[filterType]
    
    if (currentValues.includes(value)) {
      newFilters[filterType] = currentValues.filter(v => v !== value)
    } else {
      newFilters[filterType] = [...currentValues, value]
    }
    
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      priority: [],
      category: [],
      opportunityLevel: []
    }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
      <div className="flex flex-col space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by sender or subject..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          {filters.priority.length > 0 || filters.category.length > 0 || filters.opportunityLevel.length > 0 ? (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear Filters
            </button>
          ) : null}
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            {/* Priority Filter */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Priority</h4>
              <div className="space-y-2">
                {priorityOptions.map((priority) => (
                  <label key={priority} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.priority.includes(priority)}
                      onChange={() => handleFilterChange('priority', priority)}
                      className="h-4 w-4 text-primary-600 rounded border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      {priority}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Category</h4>
              <div className="space-y-2">
                {categoryOptions.map((category) => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.category.includes(category)}
                      onChange={() => handleFilterChange('category', category)}
                      className="h-4 w-4 text-primary-600 rounded border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      {category}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Opportunity Level Filter */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Opportunity Level</h4>
              <div className="space-y-2">
                {opportunityLevels.map((level) => (
                  <label key={level} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.opportunityLevel.includes(level)}
                      onChange={() => handleFilterChange('opportunityLevel', level)}
                      className="h-4 w-4 text-primary-600 rounded border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      {level}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {(filters.priority.length > 0 || filters.category.length > 0 || filters.opportunityLevel.length > 0) && (
          <div className="pt-3 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters</h4>
            <div className="flex flex-wrap gap-2">
              {filters.priority.map(priority => (
                <span key={priority} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Priority: {priority}
                </span>
              ))}
              {filters.category.map(category => (
                <span key={category} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Category: {category}
                </span>
              ))}
              {filters.opportunityLevel.map(level => (
                <span key={level} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Opportunity: {level}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}