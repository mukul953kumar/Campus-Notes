import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/profile/ProfilePage';
import UploadResourcePage from './pages/upload/UploadResourcePage';
import ResourceLibraryPage from './pages/resources/ResourceLibraryPage';
import ResourceDetailsPage from './pages/resources/ResourceDetailsPage';
import SavedResourcesPage from './pages/student/SavedResourcesPage';
import MyUploadsPage from './pages/student/MyUploadsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import Button from './components/common/Button';
import Badge from './components/common/Badge';
import EmptyState from './components/common/EmptyState';
import {
  Search,
  BookOpen,
  FileText,
  Upload,
  Download,
  Sparkles,
  ArrowRight
} from 'lucide-react';

function HomePage() {
  const branches = [
    { code: 'CSE', name: 'Computer Science & Engineering', count: 84 },
    { code: 'IT', name: 'Information Technology', count: 62 },
    { code: 'ECE', name: 'Electronics Engineering', count: 47 },
    { code: 'EE', name: 'Electrical Engineering', count: 39 },
    { code: 'ME', name: 'Mechanical Engineering', count: 31 },
    { code: 'CE', name: 'Civil Engineering', count: 28 },
    { code: 'MCA', name: 'Master of Computer Applications', count: 19 },
  ];

  const recentUploads = [
    {
      id: '1',
      title: 'Database Management Systems (DBMS) - Complete Unit 1 to 5 Hand-Written Notes',
      subject: 'DBMS',
      subjectCode: 'BCS-501',
      type: 'notes',
      unit: 'Units 1-5',
      author: 'Aman Verma',
      branch: 'CSE',
      verified: true,
      downloads: 142,
    },
    {
      id: '2',
      title: 'Design and Analysis of Algorithms - End Semester Question Paper 2023-24',
      subject: 'DAA',
      subjectCode: 'BCS-502',
      type: 'pyq',
      unit: 'End-Sem',
      author: 'Priya Singh',
      branch: 'IT',
      verified: true,
      downloads: 98,
    },
    {
      id: '3',
      title: 'Operating Systems - Process Scheduling & Memory Management Solved Problems',
      subject: 'OS',
      subjectCode: 'BCS-401',
      type: 'assignment',
      unit: 'Unit 2 & 3',
      author: 'Rohit Gupta',
      branch: 'CSE',
      verified: false,
      downloads: 41,
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto pt-6 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-medium mb-5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated for Kamla Nehru Institute of Technology</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Verified Academic Resources for <span className="text-blue-700">KNITians</span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Access high-quality lecture notes, previous year question papers (PYQs), and assignment guides shared by top-ranking students.
        </p>

        {/* Quick Search Input */}
        <div className="mt-8 max-w-xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-2 bg-white p-2 rounded-xl border border-slate-300 shadow-sm">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search subject code (e.g. BCS-501, DBMS, OS)..."
                className="w-full pl-9 pr-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none"
              />
            </div>
            <Link to="/resources" className="w-full sm:w-auto">
              <Button size="md" variant="primary" className="w-full sm:w-auto">
                Search Library
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-2.5">
            <span>Popular:</span>
            <span className="cursor-pointer hover:text-blue-700 font-medium">DBMS</span>
            <span>•</span>
            <span className="cursor-pointer hover:text-blue-700 font-medium">DAA</span>
            <span>•</span>
            <span className="cursor-pointer hover:text-blue-700 font-medium">OS</span>
            <span>•</span>
            <span className="cursor-pointer hover:text-blue-700 font-medium">Compiler Design</span>
          </div>
        </div>
      </section>

      {/* Engineering Branches Catalog */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Explore by Branch</h2>
            <p className="text-xs text-slate-500">Official B.Tech & MCA curriculums</p>
          </div>
          <Link
            to="/subjects"
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1"
          >
            All Subjects <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {branches.map((b) => (
            <Link
              key={b.code}
              to={`/resources?branch=${b.code}`}
              className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-xs transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  {b.code}
                </span>
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {b.count} files
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">{b.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recently Verified Resources List */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Recent Materials</h2>
            <Badge variant="verified" size="sm" showIcon>
              Verified
            </Badge>
          </div>
          <Link
            to="/resources"
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden shadow-xs">
          {recentUploads.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shrink-0 mt-0.5">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 hover:text-blue-700 cursor-pointer">
                      {item.title}
                    </span>
                    {item.verified && (
                      <Badge variant="verified" size="sm" showIcon>
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">{item.subjectCode}</span>
                    <span>•</span>
                    <Badge variant={item.type} size="sm">
                      {item.type.toUpperCase()}
                    </Badge>
                    <span>•</span>
                    <span>{item.unit}</span>
                    <span>•</span>
                    <span>Uploaded by {item.author}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" />
                  {item.downloads}
                </span>
                <Button size="sm" variant="secondary">
                  Preview
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to action for Student Uploads */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-xl font-bold">Have handwritten notes or PYQs?</h3>
          <p className="text-sm text-blue-100 max-w-xl">
            Upload your academic materials to earn contributor badges and help junior batches excel in their semester exams.
          </p>
        </div>
        <Link to="/upload" className="shrink-0">
          <Button
            size="lg"
            variant="outline"
            icon={Upload}
            className="bg-white text-blue-800 hover:bg-blue-50 border-white font-semibold"
          >
            Upload Material
          </Button>
        </Link>
      </section>
    </div>
  );
}

function PlaceholderPage({ title, description }) {
  return (
    <div className="py-12">
      <EmptyState
        title={title}
        description={description}
        actionLabel="Back to Home"
        onAction={() => (window.location.href = '/')}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            
            {/* Public catalog routes */}
            <Route path="resources" element={<ResourceLibraryPage />} />
            <Route path="resources/:id" element={<ResourceDetailsPage />} />
            <Route
              path="subjects"
              element={
                <PlaceholderPage
                  title="Subject Catalog"
                  description="List of all 22+ engineering subjects categorized by branch and semester."
                />
              }
            />

            {/* Authentication routes */}
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />

            {/* Protected Student routes */}
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="upload"
              element={
                <ProtectedRoute>
                  <UploadResourcePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="saved"
              element={
                <ProtectedRoute>
                  <SavedResourcesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-uploads"
              element={
                <ProtectedRoute>
                  <MyUploadsPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Moderation route */}
            <Route
              path="admin"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />

            {/* 404 Route */}
            <Route
              path="*"
              element={
                <PlaceholderPage
                  title="Page Not Found"
                  description="The academic page you are looking for does not exist."
                />
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
