import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { academicService, resourceService } from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  FileUp,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen
} from 'lucide-react';

const RESOURCE_TYPES = [
  { value: 'notes', label: 'Lecture Notes / Handwritten' },
  { value: 'pyq', label: 'Previous Year Question Paper (PYQ)' },
  { value: 'assignment', label: 'Assignment / Problem Set' },
  { value: 'practical', label: 'Practical / Lab File' },
  { value: 'syllabus', label: 'Curriculum / Syllabus' },
];

const UNIT_OPTIONS = [
  { value: '', label: 'All Units / Full Syllabus' },
  { value: '1', label: 'Unit 1' },
  { value: '2', label: 'Unit 2' },
  { value: '3', label: 'Unit 3' },
  { value: '4', label: 'Unit 4' },
  { value: '5', label: 'Unit 5' },
];

const EXAM_TYPES = [
  { value: 'End-Sem', label: 'End Semester Examination' },
  { value: 'Mid-Sem', label: 'Mid-Semester / Sessional' },
  { value: 'Class Test', label: 'Class Test / Quiz' },
];

export default function UploadResourcePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [branches, setBranches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Form state
  const [file, setFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [branch, setBranch] = useState(user?.branch || 'Information Technology');
  const [semester, setSemester] = useState(user?.semester ? String(user.semester) : '6');
  const [subjectId, setSubjectId] = useState('');
  const [unit, setUnit] = useState('');
  const [resourceType, setResourceType] = useState('notes');
  const [examYear, setExamYear] = useState(String(new Date().getFullYear()));
  const [examType, setExamType] = useState('End-Sem');
  const [tagsInput, setTagsInput] = useState('');

  // Upload status & progress
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(null);

  // Fetch branches on mount
  useEffect(() => {
    async function loadBranches() {
      try {
        const res = await academicService.getBranches();
        if (res?.data?.branches) {
          setBranches(res.data.branches);
        }
      } catch (err) {
        setBranches([
          'Computer Science & Engineering',
          'Information Technology',
          'Electronics Engineering',
          'Electrical Engineering',
          'Mechanical Engineering',
          'Civil Engineering',
          'Master of Computer Applications',
        ]);
      }
    }
    loadBranches();
  }, []);

  // Fetch subjects whenever branch or semester changes
  useEffect(() => {
    async function loadSubjects() {
      if (!branch || !semester) return;
      setLoadingSubjects(true);
      try {
        const res = await academicService.getSubjects({ branch, semester });
        if (res?.data) {
          setSubjects(res.data);
          if (res.data.length > 0) {
            setSubjectId(res.data[0]._id);
          } else {
            setSubjectId('');
          }
        }
      } catch {
        setSubjects([]);
      } finally {
        setLoadingSubjects(false);
      }
    }
    loadSubjects();
  }, [branch, semester]);

  const handleFileValidation = (selectedFile) => {
    setErrorMessage('');
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Invalid file format. Only PDF documents are permitted.');
      return;
    }

    const maxSizeBytes = 25 * 1024 * 1024; // 25 MB
    if (selectedFile.size > maxSizeBytes) {
      setErrorMessage('File size exceeds the 25 MB limit. Please compress the PDF before uploading.');
      return;
    }

    setFile(selectedFile);
    if (!title) {
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileValidation(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileValidation(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!file) {
      setErrorMessage('Please select a PDF file to upload.');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('Please provide a descriptive title for this academic material.');
      return;
    }

    if (!subjectId) {
      setErrorMessage('Please select the relevant course subject.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('branch', branch);
    formData.append('semester', semester);
    formData.append('subjectId', subjectId);
    if (unit) formData.append('unit', unit);
    formData.append('resourceType', resourceType);

    if (resourceType === 'pyq') {
      if (examYear) formData.append('examYear', examYear);
      if (examType) formData.append('examType', examType);
    }

    if (tagsInput.trim()) {
      formData.append('tags', tagsInput.trim());
    }

    try {
      const result = await resourceService.uploadResource(formData, (progress) => {
        setUploadProgress(progress);
      });

      setUploadSuccess(result.data);
    } catch (err) {
      if (err.status === 409) {
        setErrorMessage('Duplicate File: This identical document has already been uploaded for your college.');
      } else {
        setErrorMessage(err.message || 'An error occurred while uploading. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setTagsInput('');
    setUploadSuccess(null);
    setErrorMessage('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  if (uploadSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Study Material Submitted!
          </h2>

          <p className="text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
            Thank you for contributing to KNIT Sultanpur's academic repository. Your document has been safely uploaded and queued for peer review.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-6 text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Document Summary
              </span>
              <Badge variant="pending" size="sm" showIcon>
                Pending Verification
              </Badge>
            </div>
            <p className="font-semibold text-sm text-slate-900 truncate">{uploadSuccess.title}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{uploadSuccess.subjectId?.name || 'Subject'}</span>
              <span>•</span>
              <Badge variant={uploadSuccess.resourceType} size="sm">
                {uploadSuccess.resourceType?.toUpperCase()}
              </Badge>
              <span>•</span>
              <span>{formatFileSize(uploadSuccess.fileSize)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button variant="primary" size="md" onClick={resetForm}>
              Upload Another Document
            </Button>
            <Link to="/resources">
              <Button variant="outline" size="md">
                Browse Library
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full font-medium mb-2 border border-blue-200/80">
          <Sparkles className="w-3.5 h-3.5" />
          <span>KNIT Sultanpur Peer Contribution</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Upload Academic Resource
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Share high quality lecture notes, previous year question papers, or practical manuals.
        </p>
      </div>

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* Main Upload Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Step 1: File Dropzone */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-bold">
              1
            </span>
            <span>Select PDF Document</span>
          </h2>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleFileChange}
            className="hidden"
            id="resource-pdf-input"
          />

          {!file ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-blue-600 bg-blue-50/50'
                  : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50/70'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-3">
                <FileUp className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                Click to browse or drag and drop your PDF here
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Strictly PDF format only • Maximum file size 25 MB
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-blue-50/60 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-3 truncate">
                <div className="w-10 h-10 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate text-left">
                  <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{formatFileSize(file.size)} • Ready to upload</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors ml-2 cursor-pointer"
                title="Remove file"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Step 2: Academic Categorization */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-bold">
              2
            </span>
            <span>Academic Classification</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Engineering Branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              options={branches.map((b) => ({ value: b, label: b }))}
              required
            />

            <Select
              label="Semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              options={[
                { value: '1', label: 'Semester 1' },
                { value: '2', label: 'Semester 2' },
                { value: '3', label: 'Semester 3' },
                { value: '4', label: 'Semester 4' },
                { value: '5', label: 'Semester 5' },
                { value: '6', label: 'Semester 6' },
                { value: '7', label: 'Semester 7' },
                { value: '8', label: 'Semester 8' },
              ]}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Subject / Course"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              disabled={loadingSubjects || subjects.length === 0}
              helperText={
                loadingSubjects
                  ? 'Loading subjects...'
                  : subjects.length === 0
                  ? 'No subjects configured for this semester yet'
                  : ''
              }
              options={subjects.map((s) => ({
                value: s._id,
                label: `${s.name} (${s.code || s.shortName})`,
              }))}
              required
            />

            <Select
              label="Resource Type"
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              options={RESOURCE_TYPES}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Unit / Scope"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              options={UNIT_OPTIONS}
            />

            {resourceType === 'pyq' ? (
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Exam Year"
                  type="number"
                  value={examYear}
                  onChange={(e) => setExamYear(e.target.value)}
                  placeholder="2024"
                  min="2015"
                  max="2030"
                />
                <Select
                  label="Exam Type"
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  options={EXAM_TYPES}
                />
              </div>
            ) : (
              <Input
                label="Tags (Optional)"
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. handwritten, algorithms, solved"
                helperText="Comma-separated keywords for faster search"
              />
            )}
          </div>
        </div>

        {/* Step 3: Details & Submission */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-bold">
              3
            </span>
            <span>Title & Description</span>
          </h2>

          <Input
            label="Document Title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Operating Systems - Process Scheduling Complete Notes"
            helperText="Clear, descriptive titles help students find materials faster"
            required
          />

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
              Description / Key Topics (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Highlight any particular topics covered, prof name, or exam relevance..."
              className="w-full bg-white text-slate-900 placeholder:text-slate-400 text-sm border border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-lg p-3 transition-colors focus:outline-none"
            />
          </div>

          {/* Upload Progress Indicator */}
          {isUploading && (
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-700 animate-spin" />
                  <span>Uploading document to secure cloud storage...</span>
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-700 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Only authentic academic materials conforming to KNIT syllabus.
            </p>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={Upload}
              isLoading={isUploading}
              disabled={isUploading || !file}
            >
              {isUploading ? 'Uploading...' : 'Submit Material'}
            </Button>
          </div>
        </div>

      </form>

    </div>
  );
}
