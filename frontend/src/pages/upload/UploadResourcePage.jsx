import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { academicService, resourceService } from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import jsPDF from 'jspdf';
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
  BookOpen,
  Image as ImageIcon,
  RotateCw,
  ArrowLeft,
  Trash2,
  Plus,
  Layers,
  Check,
  Eye,
  ChevronDown,
  ChevronUp,
  Info,
  HelpCircle,
  ShieldCheck
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

// Helper to compile ordered images into a single standard A4 PDF document
async function compileImagesToPdf(imageItems, documentTitle = 'Academic Notes') {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < imageItems.length; i++) {
    if (i > 0) {
      pdf.addPage('a4', 'portrait');
    }

    const item = imageItems[i];

    // Load image into an Image element
    const img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = (err) => reject(new Error('Failed to render page image: ' + err));
      image.src = item.previewUrl;
    });

    // Handle smart scaling (max 1800px dimension for sharp, lightweight ~150DPI A4 output)
    const MAX_DIMENSION = 1800;
    let targetWidth = img.width;
    let targetHeight = img.height;

    if (targetWidth > MAX_DIMENSION || targetHeight > MAX_DIMENSION) {
      if (targetWidth > targetHeight) {
        targetHeight = Math.round((targetHeight * MAX_DIMENSION) / targetWidth);
        targetWidth = MAX_DIMENSION;
      } else {
        targetWidth = Math.round((targetWidth * MAX_DIMENSION) / targetHeight);
        targetHeight = MAX_DIMENSION;
      }
    }

    // Handle rotation on canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const rotation = item.rotation || 0;

    if (rotation === 90 || rotation === 270) {
      canvas.width = targetHeight;
      canvas.height = targetWidth;
    } else {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);

    // 0.85 JPEG compression provides crystal clear text with small file size
    const imgData = canvas.toDataURL('image/jpeg', 0.85);

    // Calculate dimensions to fit inside A4 page preserving aspect ratio
    const imgRatio = canvas.width / canvas.height;
    const pageRatio = pageWidth / pageHeight;

    let renderWidth = pageWidth;
    let renderHeight = pageHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (imgRatio > pageRatio) {
      renderWidth = pageWidth;
      renderHeight = pageWidth / imgRatio;
      offsetY = (pageHeight - renderHeight) / 2;
    } else {
      renderHeight = pageHeight;
      renderWidth = pageHeight * imgRatio;
      offsetX = (pageWidth - renderWidth) / 2;
    }

    pdf.addImage(imgData, 'JPEG', offsetX, offsetY, renderWidth, renderHeight, undefined, 'FAST');
  }

  const pdfBlob = pdf.output('blob');
  const safeTitle = (documentTitle || 'notes')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .slice(0, 50);
  return new File([pdfBlob], `${safeTitle}.pdf`, { type: 'application/pdf' });
}

export default function UploadResourcePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Search parameters for Re-upload / Revision flow
  const isReupload = searchParams.get('reupload') === 'true';
  const paramFeedback = searchParams.get('feedback') || '';
  const paramTitle = searchParams.get('title') || '';
  const paramBranch = searchParams.get('branch') || '';
  const paramSemester = searchParams.get('semester') || '';
  const paramSubjectId = searchParams.get('subjectId') || '';
  const paramResourceType = searchParams.get('resourceType') || '';
  const paramUnit = searchParams.get('unit') || '';

  const [showGuidelines, setShowGuidelines] = useState(true);

  const [branches, setBranches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Upload Mode: 'pdf' | 'images'
  const [uploadMode, setUploadMode] = useState('pdf');

  // Single PDF File state
  const [file, setFile] = useState(null);

  // Multi-Image State: Array of { id, file, previewUrl, rotation }
  const [imagePages, setImagePages] = useState([]);

  const [isDragOver, setIsDragOver] = useState(false);
  const [title, setTitle] = useState(paramTitle || '');
  const [description, setDescription] = useState('');
  const [branch, setBranch] = useState(paramBranch || user?.branch || 'Information Technology');
  const [semester, setSemester] = useState(paramSemester || (user?.semester ? String(user.semester) : '5'));
  const [subjectId, setSubjectId] = useState(paramSubjectId || '');
  const [unit, setUnit] = useState(paramUnit || '');
  const [resourceType, setResourceType] = useState(paramResourceType || 'notes');
  const [examYear, setExamYear] = useState(String(new Date().getFullYear()));
  const [examType, setExamType] = useState('End-Sem');
  const [tagsInput, setTagsInput] = useState('');

  // Upload status & progress
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusStep, setUploadStatusStep] = useState(''); // 'converting' | 'uploading'
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
      } catch {
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
          // If paramSubjectId is valid for this branch/semester, select it
          if (paramSubjectId && res.data.some((s) => s._id === paramSubjectId)) {
            setSubjectId(paramSubjectId);
          } else if (res.data.length > 0 && !subjectId) {
            setSubjectId(res.data[0]._id);
          } else if (res.data.length === 0) {
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
  }, [branch, semester, paramSubjectId]);

  // Handle PDF file selection
  const handlePdfValidation = (selectedFile) => {
    setErrorMessage('');
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      // If user selected an image in PDF mode, auto-switch to image mode
      if (selectedFile.type.startsWith('image/')) {
        setUploadMode('images');
        handleAddImages([selectedFile]);
        return;
      }
      setErrorMessage('Invalid file format. Please upload a PDF or switch to Photo mode.');
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

  // Handle Multiple Images Selection
  const handleAddImages = (filesList) => {
    setErrorMessage('');
    const files = Array.from(filesList);
    if (files.length === 0) return;

    const validImages = [];
    for (const f of files) {
      if (f.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(f.name)) {
        validImages.push({
          id: Math.random().toString(36).substring(2, 9),
          file: f,
          previewUrl: URL.createObjectURL(f),
          rotation: 0,
        });
      }
    }

    if (validImages.length === 0) {
      setErrorMessage('Please select valid image files (JPG, PNG, WEBP).');
      return;
    }

    setImagePages((prev) => [...prev, ...validImages]);

    if (!title && files[0]) {
      const cleanName = files[0].name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName);
    }
  };

  // Move image page left (earlier in document)
  const handleMovePageLeft = (index) => {
    if (index === 0) return;
    setImagePages((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  // Move image page right (later in document)
  const handleMovePageRight = (index) => {
    if (index >= imagePages.length - 1) return;
    setImagePages((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  // Rotate image page 90 degrees
  const handleRotatePage = (index) => {
    setImagePages((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        rotation: (next[index].rotation + 90) % 360,
      };
      return next;
    });
  };

  // Delete an image page
  const handleDeletePage = (index) => {
    setImagePages((prev) => {
      const next = [...prev];
      const removed = next.splice(index, 1)[0];
      if (removed?.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return next;
    });
  };

  // Handle Drag and Drop
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    const hasImages = droppedFiles.some((f) => f.type.startsWith('image/'));

    if (hasImages || uploadMode === 'images') {
      setUploadMode('images');
      handleAddImages(droppedFiles);
    } else {
      handlePdfValidation(droppedFiles[0]);
    }
  };

  const handleRemovePdf = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearAllImages = () => {
    imagePages.forEach((p) => {
      if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
    });
    setImagePages([]);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  // Submit Handler: Automatically converts images to PDF if in image mode
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (uploadMode === 'pdf' && !file) {
      setErrorMessage('Please select a PDF file to upload.');
      return;
    }

    if (uploadMode === 'images' && imagePages.length === 0) {
      setErrorMessage('Please select at least one photo/page image of your notes.');
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

    let finalPdfFile = file;

    // Convert images to PDF if in image mode
    if (uploadMode === 'images') {
      setUploadStatusStep('converting');
      try {
        finalPdfFile = await compileImagesToPdf(imagePages, title.trim());
      } catch (compileErr) {
        setIsUploading(false);
        setErrorMessage('Failed to compile photos into PDF: ' + compileErr.message);
        return;
      }
    }

    setUploadStatusStep('uploading');

    const formData = new FormData();
    formData.append('file', finalPdfFile);
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
      setUploadStatusStep('');
    }
  };

  const resetForm = () => {
    setFile(null);
    handleClearAllImages();
    setTitle('');
    setDescription('');
    setTagsInput('');
    setUploadSuccess(null);
    setErrorMessage('');
    setUploadProgress(0);
    setUploadMode('pdf');
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'PDF Document';
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
            Thank you for contributing to KNIT Sultanpur's academic repository. Your document has been safely compiled into a PDF and queued for peer review.
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
        <div className="inline-flex items-center gap-1.5 text-xs text-blue-800 bg-blue-50/90 px-3 py-1 rounded-full font-bold mb-2 border border-blue-200/80">
          <Sparkles className="w-3.5 h-3.5 text-blue-700" />
          <span>KNIT Sultanpur Peer Contribution</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Upload Academic Resource
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Upload a ready PDF or select multiple notebook photos to automatically compile them into a clean PDF.
        </p>
      </div>

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* Revision Notice Banner (when student arrives from Fix & Re-upload) */}
      {isReupload && (
        <div className="bg-amber-50/90 border border-amber-300/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-200/90 text-amber-900 flex items-center justify-center font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-amber-800" />
              </span>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-amber-950">
                  Revision Submission: Addressing Moderator Feedback
                </h3>
                <p className="text-xs text-amber-800/80">
                  Previous details pre-filled. Please upload your improved document below.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-200/80 text-amber-900 border border-amber-300">
              Revision Mode
            </span>
          </div>

          {paramFeedback && (
            <div className="bg-white/95 border border-amber-200/90 rounded-xl p-3 text-xs space-y-1">
              <span className="font-bold text-amber-900 flex items-center gap-1.5">
                <span>Moderator Feedback:</span>
              </span>
              <p className="text-slate-800 italic font-medium leading-relaxed">
                "{paramFeedback}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Academic Upload Guidelines Card */}
      <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setShowGuidelines(!showGuidelines)}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center shadow-2xs shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Academic Upload Guidelines</span>
                <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                  Peer Standards
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Follow these quality criteria for prompt moderator verification
              </p>
            </div>
          </div>
          <button
            type="button"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white/80 rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle Guidelines"
          >
            {showGuidelines ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showGuidelines && (
          <div className="pt-2 border-t border-blue-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="flex items-start gap-2.5 bg-white/90 p-3 rounded-xl border border-blue-100 shadow-2xs">
              <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                ✓
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900">Legible & Well-Lit Pages</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Scans must be high contrast and readable. Avoid blur, dark shadows, or low-light captures.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-white/90 p-3 rounded-xl border border-blue-100 shadow-2xs">
              <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                ✓
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900">Upright Page Orientation</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Pages must be upright (portrait). Use the rotate tool on each photo before compiling.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-white/90 p-3 rounded-xl border border-blue-100 shadow-2xs">
              <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                ✓
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900">Accurate Subject & Unit</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Select the exact Branch, Semester, and Subject code. Label Unit 1–5 or Full Syllabus accurately.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-white/90 p-3 rounded-xl border border-blue-100 shadow-2xs">
              <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                ✓
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900">Original & Authentic Study Material</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Upload genuine lecture notes, PYQs, and lab manuals. No duplicate submissions or copyrighted book scans.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Upload Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Step 1: File / Photos Selection Console */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span>Select Material Files</span>
            </h2>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setUploadMode('pdf')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  uploadMode === 'pdf'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Single PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setUploadMode('images')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  uploadMode === 'images'
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Photos to PDF (Auto-Stitch)</span>
                {imagePages.length > 0 && (
                  <span className="ml-1 bg-white text-blue-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                    {imagePages.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => e.target.files && handlePdfValidation(e.target.files[0])}
            className="hidden"
            id="resource-pdf-input"
          />

          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            multiple
            onChange={(e) => e.target.files && handleAddImages(e.target.files)}
            className="hidden"
            id="resource-images-input"
          />

          {/* MODE 1: SINGLE PDF UPLOAD */}
          {uploadMode === 'pdf' && (
            <div>
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
                    Standard PDF format only • Maximum file size 25 MB
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-blue-50/60 border border-blue-200 rounded-xl">
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-10 h-10 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="truncate text-left">
                        <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">
                          {formatFileSize(file.size)} • Ready to upload {file.size > 10 * 1024 * 1024 ? '(Large File)' : '(Optimal)'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePdf}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors ml-2 cursor-pointer"
                      title="Remove file"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {file.size > 10 * 1024 * 1024 && (
                    <div className="p-3 bg-amber-50/90 border border-amber-200/90 rounded-xl flex items-start gap-2.5 text-xs text-amber-950">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-1 text-left">
                        <p className="font-bold text-amber-900">
                          Notice: Large PDF File ({formatFileSize(file.size)})
                        </p>
                        <p className="text-amber-800 leading-relaxed">
                          This file is within the 25 MB limit and will upload properly. If this PDF is made of uncompressed camera photos, you can also use our <strong>Photos to PDF (Auto-Stitch)</strong> mode to automatically create a super-sharp, lightweight ~5 MB document.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* MODE 2: MULTI-IMAGE AUTO PDF ORGANIZER */}
          {uploadMode === 'images' && (
            <div className="space-y-4">
              {imagePages.length === 0 ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => imageInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    isDragOver
                      ? 'border-blue-600 bg-blue-50/50'
                      : 'border-blue-300 bg-blue-50/30 hover:border-blue-500 hover:bg-blue-50/60'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-3">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    Select Multiple Notebook Photos / Pages
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Select 1 to 40 photos of handwritten notes from your gallery or camera. We will automatically stitch them into a clean A4 PDF!
                  </p>
                  <span className="inline-block mt-3 text-xs font-bold text-blue-700 bg-white border border-blue-200 px-3 py-1 rounded-lg shadow-2xs">
                    Browse Photos / Camera
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Top Page Count & Actions Strip */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-blue-50/80 border border-blue-200/90 rounded-xl text-xs text-blue-950">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-700 shrink-0" />
                      <span>
                        <strong>{imagePages.length} Pages Organized</strong> • Ready to auto-convert to A4 PDF
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="inline-flex items-center gap-1 bg-white hover:bg-blue-100/80 text-blue-700 font-bold px-2.5 py-1 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Pages</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleClearAllImages}
                        className="text-rose-600 hover:text-rose-800 font-semibold px-2 py-1 transition-colors cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail Page Grid for Reordering */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[360px] overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50/50 scrollbar-thin">
                    {imagePages.map((page, idx) => (
                      <div
                        key={page.id}
                        className="relative bg-white rounded-xl border border-slate-200 p-2 shadow-2xs space-y-1.5 flex flex-col justify-between group"
                      >
                        {/* Page Number Badge */}
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 px-1">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-800">
                            Page {idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeletePage(idx)}
                            className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Remove page"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Image Thumbnail */}
                        <div className="w-full h-32 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center border border-slate-100 relative">
                          <img
                            src={page.previewUrl}
                            alt={`Page ${idx + 1}`}
                            style={{ transform: `rotate(${page.rotation}deg)` }}
                            className="w-full h-full object-contain transition-transform"
                          />
                        </div>

                        {/* Reorder & Rotate Controls */}
                        <div className="flex items-center justify-between pt-1 text-slate-500 border-t border-slate-100 text-xs">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMovePageLeft(idx)}
                            className="p-1 hover:text-blue-700 disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer"
                            title="Move page earlier"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRotatePage(idx)}
                            className="p-1 hover:text-blue-700 cursor-pointer"
                            title="Rotate 90 degrees"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            disabled={idx === imagePages.length - 1}
                            onClick={() => handleMovePageRight(idx)}
                            className="p-1 hover:text-blue-700 disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer"
                            title="Move page later"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

          {/* Upload / Conversion Progress Indicator */}
          {isUploading && (
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-700 animate-spin" />
                  <span>
                    {uploadStatusStep === 'converting'
                      ? `Converting ${imagePages.length} photos into standard A4 PDF...`
                      : 'Uploading compiled PDF to secure campus storage...'}
                  </span>
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-700 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadStatusStep === 'converting' ? 35 : Math.max(35, uploadProgress)}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-400">
              {uploadMode === 'images'
                ? `Ready to compile ${imagePages.length} ${imagePages.length === 1 ? 'page' : 'pages'} into a PDF.`
                : 'Only authentic academic materials conforming to KNIT syllabus.'}
            </p>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={Upload}
              isLoading={isUploading}
              disabled={isUploading || (uploadMode === 'pdf' && !file) || (uploadMode === 'images' && imagePages.length === 0)}
              className="w-full sm:w-auto"
            >
              {isUploading
                ? uploadStatusStep === 'converting'
                  ? 'Compiling PDF...'
                  : 'Uploading...'
                : uploadMode === 'images'
                ? `Convert & Upload ${imagePages.length > 0 ? `(${imagePages.length} Pages)` : ''}`
                : 'Submit Material'}
            </Button>
          </div>
        </div>

      </form>

    </div>
  );
}
