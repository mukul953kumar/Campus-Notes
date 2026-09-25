import React, { useState } from 'react';
import { Filter, X, ArrowUpDown, ChevronDown } from 'lucide-react';
import Select from '../common/Select';
import Button from '../common/Button';

const BRANCH_OPTIONS = [
  { value: '', label: 'All Branches' },
  { value: 'Computer Science & Engineering', label: 'Computer Science (CSE)' },
  { value: 'Information Technology', label: 'Information Technology (IT)' },
  { value: 'Electronics Engineering', label: 'Electronics (ECE)' },
  { value: 'Electrical Engineering', label: 'Electrical (EE)' },
  { value: 'Mechanical Engineering', label: 'Mechanical (ME)' },
  { value: 'Civil Engineering', label: 'Civil (CE)' },
  { value: 'Master of Computer Applications', label: 'MCA' },
];

const SEMESTER_OPTIONS = [
  { value: '', label: 'All Semesters' },
  { value: '1', label: 'Semester 1' },
  { value: '2', label: 'Semester 2' },
  { value: '3', label: 'Semester 3' },
  { value: '4', label: 'Semester 4' },
  { value: '5', label: 'Semester 5' },
  { value: '6', label: 'Semester 6' },
  { value: '7', label: 'Semester 7' },
  { value: '8', label: 'Semester 8' },
];

const UNIT_OPTIONS = [
  { value: '', label: 'All Units' },
  { value: '1', label: 'Unit 1' },
  { value: '2', label: 'Unit 2' },
  { value: '3', label: 'Unit 3' },
  { value: '4', label: 'Unit 4' },
  { value: '5', label: 'Unit 5' },
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Downloaded' },
  { value: 'title', label: 'Title (A-Z)' },
];

export default function FilterToolbar({
  branch = '',
  semester = '',
  unit = '',
  sortBy = 'recent',
  onFilterChange,
  onResetFilters,
}) {
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const activeFiltersCount = [branch, semester, unit].filter(Boolean).length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs space-y-3">
      
      {/* Mobile Toggle Bar */}
      <div className="flex sm:hidden items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200"
        >
          <Filter className="w-3.5 h-3.5 text-blue-700" />
          <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpenMobile ? 'rotate-180' : ''}`} />
        </button>

        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs text-rose-600 font-medium hover:underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Filter Controls (Collapsible on mobile, inline on desktop) */}
      <div className={`${isOpenMobile ? 'block' : 'hidden'} sm:grid sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-2 sm:pt-0`}>
        
        {/* Branch Filter */}
        <div className="col-span-1 sm:col-span-1 lg:col-span-2">
          <Select
            placeholder=""
            value={branch}
            onChange={(e) => onFilterChange('branch', e.target.value)}
            options={BRANCH_OPTIONS}
            className="text-xs py-1.5"
          />
        </div>

        {/* Semester Filter */}
        <div>
          <Select
            placeholder=""
            value={semester}
            onChange={(e) => onFilterChange('semester', e.target.value)}
            options={SEMESTER_OPTIONS}
            className="text-xs py-1.5"
          />
        </div>

        {/* Unit Filter */}
        <div>
          <Select
            placeholder=""
            value={unit}
            onChange={(e) => onFilterChange('unit', e.target.value)}
            options={UNIT_OPTIONS}
            className="text-xs py-1.5"
          />
        </div>

        {/* Sort By Filter */}
        <div className="flex items-center gap-2">
          <Select
            placeholder=""
            value={sortBy}
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
            options={SORT_OPTIONS}
            className="text-xs py-1.5"
          />

          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              title="Reset all filters"
              className="hidden lg:flex p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
