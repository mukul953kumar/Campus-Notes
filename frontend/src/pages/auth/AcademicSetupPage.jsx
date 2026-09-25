import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/api';
import Button from '../../components/common/Button';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const BRANCH_OPTIONS = [
  { value: 'Computer Science & Engineering', code: 'CSE', label: 'Computer Science & Engineering' },
  { value: 'Information Technology', code: 'IT', label: 'Information Technology' },
  { value: 'Electronics Engineering', code: 'ECE', label: 'Electronics Engineering' },
  { value: 'Electrical Engineering', code: 'EE', label: 'Electrical Engineering' },
  { value: 'Mechanical Engineering', code: 'ME', label: 'Mechanical Engineering' },
  { value: 'Civil Engineering', code: 'CE', label: 'Civil Engineering' },
  { value: 'Master of Computer Applications', code: 'MCA', label: 'Master of Computer Applications' }
];

const SEMESTER_OPTIONS = [
  { value: '1', label: '1st Sem', full: 'Semester 1 (1st Year)' },
  { value: '2', label: '2nd Sem', full: 'Semester 2 (1st Year)' },
  { value: '3', label: '3rd Sem', full: 'Semester 3 (2nd Year)' },
  { value: '4', label: '4th Sem', full: 'Semester 4 (2nd Year)' },
  { value: '5', label: '5th Sem', full: 'Semester 5 (3rd Year)' },
  { value: '6', label: '6th Sem', full: 'Semester 6 (3rd Year)' },
  { value: '7', label: '7th Sem', full: 'Semester 7 (4th Year)' },
  { value: '8', label: '8th Sem', full: 'Semester 8 (4th Year)' }
];

export default function AcademicSetupPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [branch, setBranch] = useState(user?.branch || 'Computer Science & Engineering');
  const [semester, setSemester] = useState(user?.semester ? String(user.semester) : '5');
  const [graduationYear, setGraduationYear] = useState(
    user?.graduationYear ? String(user.graduationYear) : String(new Date().getFullYear() + 2)
  );

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSave = async (e) => {
    e.preventDefault();
    if (!branch || !semester) {
      setErrorMessage('Please select both your branch and semester.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await userService.updateProfile({
        branch,
        semester: Number(semester),
        graduationYear: Number(graduationYear)
      });

      if (response && response.data) {
        updateUser(response.data);
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save academic preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-6 sm:my-12 px-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-9 shadow-sm space-y-7">
        
        {/* Header Title */}
        <div className="text-center space-y-2.5">
          <div className="w-13 h-13 rounded-2xl bg-blue-700 flex items-center justify-center text-white mx-auto shadow-sm ring-4 ring-blue-50">
            <GraduationCap className="w-6 h-6" />
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-3 py-0.5 rounded-full font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic Personalization</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome to CampusNotes{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Select your academic branch and current semester so we can automatically curate your semester notes, subjects hub, and previous year exam papers.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Setup Form */}
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Branch Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Select Your Branch / Department
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {BRANCH_OPTIONS.map((b) => {
                const isSelected = branch === b.value;
                return (
                  <button
                    key={b.value}
                    type="button"
                    onClick={() => setBranch(b.value)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-100 font-semibold'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <span className="block text-xs font-bold text-slate-900 truncate">
                        {b.code}
                      </span>
                      <span className="block text-[11px] text-slate-500 truncate">
                        {b.label}
                      </span>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Semester Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              2. Select Your Current Semester
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SEMESTER_OPTIONS.map((s) => {
                const isSelected = semester === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setSemester(s.value)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-100 font-bold'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 font-medium'
                    }`}
                  >
                    <span className="block text-xs">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Preference Preview Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Personalized Feed Setting
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                {branch} • Semester {semester}
              </p>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              variant="primary"
              icon={ArrowRight}
              isLoading={isLoading}
              className="w-full justify-center text-sm font-semibold shadow-xs"
            >
              Personalize & Explore My Notes
            </Button>
            <p className="text-center text-[11px] text-slate-400 mt-2.5">
              You can easily change your branch or semester anytime in your Student Profile.
            </p>
          </div>

        </form>

      </div>
    </div>
  );
}
