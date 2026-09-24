import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { academicService } from '../../services/api';
import SearchInput from '../../components/common/SearchInput';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import {
  BookOpen,
  GraduationCap,
  Layers,
  ArrowRight,
  Sparkles,
  Search
} from 'lucide-react';

const BRANCH_TABS = [
  { id: '', label: 'All Branches' },
  { id: 'Information Technology', label: 'Information Technology (IT)' },
  { id: 'Computer Science & Engineering', label: 'Computer Science (CSE)' },
  { id: 'Electronics Engineering', label: 'Electronics (ECE)' },
  { id: 'Electrical Engineering', label: 'Electrical (EE)' },
  { id: 'Mechanical Engineering', label: 'Mechanical (ME)' },
  { id: 'Civil Engineering', label: 'Civil (CE)' },
  { id: 'Master of Computer Applications', label: 'MCA' },
];

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [activeBranch, setActiveBranch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSubjects() {
      setIsLoading(true);
      try {
        const response = await academicService.getSubjects({
          branch: activeBranch,
          search: searchQuery,
        });
        if (response && response.data) {
          setSubjects(response.data);
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSubjects();
  }, [activeBranch, searchQuery]);

  // Group subjects by semester
  const groupedBySemester = subjects.reduce((acc, sub) => {
    const sem = sub.semester || 1;
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(sub);
    return acc;
  }, {});

  const semesters = Object.keys(groupedBySemester).sort((a, b) => Number(a) - Number(b));

  return (
    <div className="space-y-8 py-2">
      
      {/* Top Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full font-medium mb-2 border border-blue-200">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Official Syllabus Catalog</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Curriculum Subjects & Unit Hubs
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore courses by semester to access organized unit-by-unit handwritten notes, reference materials, and question banks.
        </p>
      </div>

      {/* Search Input */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search subject by name (e.g. Operating Systems, DBMS), code (BCS-501), or acronym..."
      />

      {/* Branch Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-none">
        {BRANCH_TABS.map((tab) => {
          const isActive = activeBranch === tab.id;
          return (
            <button
              key={tab.id || 'all'}
              type="button"
              onClick={() => setActiveBranch(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-blue-700 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="py-20">
          <Loader message="Loading curriculum subjects..." size="md" />
        </div>
      ) : subjects.length === 0 ? (
        <div className="p-8 bg-white border border-slate-200 rounded-2xl">
          <EmptyState
            icon={BookOpen}
            title="No Subjects Found"
            description={
              searchQuery
                ? `No courses matched "${searchQuery}". Try searching with alternative acronyms (e.g. OS, DAA, DBMS, CN).`
                : 'No curriculum courses currently configured for this branch.'
            }
            actionLabel={searchQuery ? 'Clear Search' : undefined}
            onAction={searchQuery ? () => setSearchQuery('') : undefined}
          />
        </div>
      ) : (
        <div className="space-y-8">
          {semesters.map((sem) => (
            <div key={sem} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center">
                  {sem}
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  Semester {sem} Courses
                </h2>
                <span className="text-xs text-slate-400 font-medium">
                  ({groupedBySemester[sem].length} {groupedBySemester[sem].length === 1 ? 'Subject' : 'Subjects'})
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedBySemester[sem].map((subject) => (
                  <Link
                    key={subject._id}
                    to={`/subjects/${subject._id}`}
                    className="p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-sm transition-all group flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {subject.code}
                        </span>
                        {subject.shortName && (
                          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {subject.shortName}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                        {subject.name}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {subject.description || 'Complete lecture notes, previous year question papers, and unit-wise question sets.'}
                      </p>
                    </div>

                    <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>{subject.unitsCount || 5} Units</span>
                      </span>

                      <span className="font-semibold text-blue-700 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                        Open Hub <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
