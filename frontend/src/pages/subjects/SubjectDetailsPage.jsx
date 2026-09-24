import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { academicService, resourceService } from '../../services/api';
import ResourceRow from '../../components/resources/ResourceRow';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import {
  ArrowLeft,
  BookOpen,
  Layers,
  Upload,
  Calendar,
  HelpCircle,
  FileText,
  GraduationCap
} from 'lucide-react';

export default function SubjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(null);
  const [activeUnit, setActiveUnit] = useState(''); // '' = all, '1', '2', '3', '4', '5', 'pyq'
  const [resources, setResources] = useState([]);
  const [isLoadingSubject, setIsLoadingSubject] = useState(true);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [savedIds, setSavedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('campus_notes_saved_ids') || '[]');
    } catch {
      return [];
    }
  });

  // Load subject metadata
  useEffect(() => {
    async function loadSubject() {
      setIsLoadingSubject(true);
      try {
        const response = await academicService.getSubjectById(id);
        if (response && response.data) {
          setSubject(response.data);
        } else {
          setErrorMessage('Course subject not found.');
        }
      } catch (err) {
        setErrorMessage(err.message || 'Failed to load subject information.');
      } finally {
        setIsLoadingSubject(false);
      }
    }
    loadSubject();
  }, [id]);

  // Load resources for this subject & active unit
  useEffect(() => {
    if (!id) return;
    async function loadResources() {
      setIsLoadingResources(true);
      try {
        const params = { subjectId: id };
        if (activeUnit === 'pyq') {
          params.resourceType = 'pyq';
        } else if (activeUnit) {
          params.unit = activeUnit;
        }

        const res = await resourceService.getResources(params);
        if (res && res.data) {
          setResources(res.data);
        }
      } catch (err) {
        console.error('Failed to load unit resources:', err);
      } finally {
        setIsLoadingResources(false);
      }
    }
    loadResources();
  }, [id, activeUnit]);

  const handleToggleSave = (resourceId) => {
    setSavedIds((prev) => {
      const exists = prev.includes(resourceId);
      const next = exists ? prev.filter((i) => i !== resourceId) : [...prev, resourceId];
      localStorage.setItem('campus_notes_saved_ids', JSON.stringify(next));
      return next;
    });
  };

  if (isLoadingSubject) {
    return (
      <div className="py-24">
        <Loader message="Loading course hub..." size="lg" />
      </div>
    );
  }

  if (errorMessage || !subject) {
    return (
      <div className="py-12">
        <EmptyState
          title="Subject Not Found"
          description={errorMessage || 'The requested course does not exist.'}
          actionLabel="Back to Subjects"
          onAction={() => navigate('/subjects')}
        />
      </div>
    );
  }

  const unitsList = subject.units || [
    { unitNumber: 1, title: 'Unit 1' },
    { unitNumber: 2, title: 'Unit 2' },
    { unitNumber: 3, title: 'Unit 3' },
    { unitNumber: 4, title: 'Unit 4' },
    { unitNumber: 5, title: 'Unit 5' },
  ];

  return (
    <div className="space-y-6 py-2">
      
      {/* Top Navigation */}
      <Link
        to="/subjects"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-700 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Subject Catalog</span>
      </Link>

      {/* Subject Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {subject.code}
              </span>
              {subject.shortName && (
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {subject.shortName}
                </span>
              )}
              <span className="text-xs text-slate-500">
                Semester {subject.semester} • {subject.branch}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {subject.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {subject.description || 'Access unit-by-unit lecture notes, previous year question papers, and solved problems for KNIT curriculum.'}
            </p>
          </div>

          <Link to="/upload" className="shrink-0 self-start sm:self-auto">
            <Button variant="primary" size="md" icon={Upload}>
              Upload Notes for this Course
            </Button>
          </Link>
        </div>
      </div>

      {/* Unit Selection Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveUnit('')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeUnit === ''
              ? 'bg-blue-700 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Units</span>
        </button>

        {unitsList.map((u) => {
          const isActive = activeUnit === String(u.unitNumber);
          return (
            <button
              key={u.unitNumber}
              type="button"
              onClick={() => setActiveUnit(String(u.unitNumber))}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-blue-700 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200'
              }`}
            >
              <span>Unit {u.unitNumber}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setActiveUnit('pyq')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeUnit === 'pyq'
              ? 'bg-purple-700 text-white font-bold shadow-xs'
              : 'text-purple-700 hover:bg-purple-50 bg-white border border-purple-200'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>PYQs Archive</span>
        </button>
      </div>

      {/* Materials List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-4 sm:px-6 py-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-medium">
          <span>
            {isLoadingResources
              ? 'Loading resources...'
              : `${resources.length} ${resources.length === 1 ? 'Material' : 'Materials'} Found`}
          </span>
          <span className="text-[11px] text-slate-400">
            {activeUnit === 'pyq' ? 'Previous Year Exam Papers' : activeUnit ? `Unit ${activeUnit} Notes` : 'Complete Course Notes'}
          </span>
        </div>

        {isLoadingResources ? (
          <div className="py-16">
            <Loader message="Loading study materials..." size="md" />
          </div>
        ) : resources.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={BookOpen}
              title={`No materials uploaded for ${activeUnit === 'pyq' ? 'PYQ' : activeUnit ? `Unit ${activeUnit}` : 'this subject'} yet`}
              description="Be the first student to upload handwritten notes or previous year papers for this syllabus section."
              actionLabel="Upload Notes"
              onAction={() => (window.location.href = '/upload')}
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {resources.map((item) => (
              <ResourceRow
                key={item._id}
                resource={item}
                isSaved={savedIds.includes(item._id)}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
