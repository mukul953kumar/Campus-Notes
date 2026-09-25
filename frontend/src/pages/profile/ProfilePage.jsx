import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import {
  User,
  Mail,
  GraduationCap,
  Award,
  Upload,
  CheckCircle2,
  Calendar,
  LogOut,
  Save,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const BRANCH_OPTIONS = [
  { value: 'Computer Science & Engineering', label: 'Computer Science & Engineering (CSE)' },
  { value: 'Information Technology', label: 'Information Technology (IT)' },
  { value: 'Electronics Engineering', label: 'Electronics Engineering (ECE)' },
  { value: 'Electrical Engineering', label: 'Electrical Engineering (EE)' },
  { value: 'Mechanical Engineering', label: 'Mechanical Engineering (ME)' },
  { value: 'Civil Engineering', label: 'Civil Engineering (CE)' },
  { value: 'Master of Computer Applications', label: 'Master of Computer Applications (MCA)' },
];

const SEMESTER_OPTIONS = [
  { value: '1', label: 'Semester 1' },
  { value: '2', label: 'Semester 2' },
  { value: '3', label: 'Semester 3' },
  { value: '4', label: 'Semester 4' },
  { value: '5', label: 'Semester 5' },
  { value: '6', label: 'Semester 6' },
  { value: '7', label: 'Semester 7' },
  { value: '8', label: 'Semester 8' },
];

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();

  const [branch, setBranch] = useState(user?.branch || '');
  const [semester, setSemester] = useState(user?.semester ? String(user.semester) : '6');
  const [graduationYear, setGraduationYear] = useState(
    user?.graduationYear ? String(user.graduationYear) : String(new Date().getFullYear() + 1)
  );

  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      if (user.branch) setBranch(user.branch);
      if (user.semester) setSemester(String(user.semester));
      if (user.graduationYear) setGraduationYear(String(user.graduationYear));
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });
    setIsSaving(true);

    try {
      const response = await authService.updateProfile({
        branch,
        semester: Number(semester),
        graduationYear: Number(graduationYear),
      });

      if (response && response.data) {
        updateUser(response.data);
        setStatusMessage({ type: 'success', text: 'Academic profile updated successfully!' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Recent';

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      
      {/* Top Banner / Student ID Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-700 flex items-center justify-center text-white text-xl font-bold shadow-xs">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                user?.name?.slice(0, 2).toUpperCase() || 'ST'
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{user?.name}</h1>
                {user?.role === 'admin' ? (
                  <Badge variant="notes" size="sm">
                    Admin
                  </Badge>
                ) : (
                  <Badge variant="verified" size="sm" showIcon>
                    Verified Student
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.email}</span>
                {user?.rollNumber && (
                  <>
                    <span>•</span>
                    <span className="font-mono bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded text-[11px] font-semibold">
                      Roll: {user.rollNumber}
                    </span>
                  </>
                )}
              </p>
              <p className="text-xs text-blue-700 font-medium flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Kamla Nehru Institute of Technology, Sultanpur</span>
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={LogOut}
            onClick={logout}
            className="text-rose-700 hover:text-rose-800 hover:bg-rose-50 border-rose-200 shrink-0 self-start sm:self-center"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Academic Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Upload className="w-4 h-4 text-blue-700" />
            <span>Uploaded</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {user?.stats?.uploadsCount ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Total documents submitted</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Approved</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {user?.stats?.approvedCount ?? user?.stats?.verifiedUploadsCount ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Verified by college team</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Impact</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {user?.stats?.downloadsReceived ?? user?.stats?.downloadsCount ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Downloads on your uploads</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Member Since</span>
          </div>
          <div className="text-xl font-bold text-slate-900">{memberSince}</div>
          <p className="text-[11px] text-slate-400 mt-1">Active student account</p>
        </div>
      </div>

      {/* Edit Academic Information Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="border-b border-slate-100 pb-4 mb-6">
          <h2 className="text-lg font-bold text-slate-900">Academic Details</h2>
          <p className="text-xs text-slate-500">
            Keep your branch and semester up to date to get recommendations relevant to your syllabus.
          </p>
        </div>

        {statusMessage.text && (
          <div
            className={`p-3.5 rounded-lg text-xs mb-5 flex items-start gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Select
              label="Engineering Branch / Department"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              options={BRANCH_OPTIONS}
              required
            />

            <Select
              label="Current Semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              options={SEMESTER_OPTIONS}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Expected Graduation Year"
              type="number"
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              placeholder="e.g. 2026"
              min="2020"
              max="2032"
              required
            />

            <Input
              label="Registered College"
              type="text"
              value="Kamla Nehru Institute of Technology, Sultanpur"
              disabled
              helperText="Affiliated college cannot be changed"
            />
          </div>

          <div className="flex justify-end pt-3">
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Save}
              isLoading={isSaving}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>

    </div>
  );
}
