import React, { useState, useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import { UploadCloud, File, AlertCircle, CheckCircle2, X, Building2, FolderKanban } from 'lucide-react';
import { DocumentProcessingSkeleton } from './SkeletonLoader';

export default function DocumentUploadModal({ isOpen, onClose }) {
  const {
    uploadDocument,
    uploadingDoc,
    departments,
    collections,
    fetchDepartments,
    fetchCollections,
  } = useChatStore();

  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
      fetchCollections();
    }
  }, [isOpen, fetchDepartments, fetchCollections]);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setErrorMessage('');
    setSuccessMessage('');

    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    const hasAllowedExt = /\.(pdf|png|jpe?g)$/i.test(file.name);

    if (!allowedTypes.includes(file.type) && !hasAllowedExt) {
      setErrorMessage('Unsupported File Type. Only PDF, PNG, JPG, and JPEG documents are supported.');
      setSelectedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File Too Large. Maximum allowed size is 10MB.');
      setSelectedFile(null);
      return;
    }

    if (file.size === 0) {
      setErrorMessage('The selected file is empty.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select a document or image file first');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    const res = await uploadDocument(selectedFile, title, departmentId || undefined, collectionId || undefined);
    if (res.success) {
      setSuccessMessage(`Document '${res.data.title}' ingested and chunked successfully! (${res.data.chunkCount} vector chunks created)`);
      setTimeout(() => {
        setSelectedFile(null);
        setTitle('');
        setDepartmentId('');
        setCollectionId('');
        setSuccessMessage('');
        onClose();
      }, 1500);
    } else {
      setErrorMessage(res.error || 'Failed to upload and vectorize document');
    }
  };

  const filteredCollections = departmentId
    ? collections.filter((c) => (c.departmentId?._id || c.departmentId) === departmentId)
    : collections;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-sky-600 dark:text-sky-400" /> Upload Official College Document
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ingest PDF guidelines or scanned notice images for Academic Guidance RAG
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-md flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs rounded-md flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Title input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Document Title
            </label>
            <input
              type="text"
              className="console-input"
              placeholder="e.g. Academic Regulations 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploadingDoc}
            />
          </div>

          {/* Department & Collection Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" /> Department
              </label>
              <select
                className="console-input text-xs"
                value={departmentId}
                onChange={(e) => {
                  setDepartmentId(e.target.value);
                  setCollectionId('');
                }}
                disabled={uploadingDoc}
              >
                <option value="">Default (General College)</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <FolderKanban className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Collection
              </label>
              <select
                className="console-input text-xs"
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                disabled={uploadingDoc}
              >
                <option value="">Default (General Regulations)</option>
                {filteredCollections.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* File Picker / Dropzone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Select Document File (PDF, PNG, JPG, JPEG – Max 10MB)
            </label>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 rounded-lg p-6 text-center transition-colors bg-slate-50/50 dark:bg-slate-800/40">
              <input
                type="file"
                accept=".pdf,application/pdf,image/png,image/jpeg,image/jpg"
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-file-input"
                disabled={uploadingDoc}
              />
              <label htmlFor="pdf-file-input" className="cursor-pointer space-y-2 block">
                <UploadCloud className="w-10 h-10 mx-auto text-sky-600 dark:text-sky-400" />
                <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {selectedFile ? (
                    <span className="text-sky-700 dark:text-sky-300 font-semibold flex items-center justify-center gap-2">
                      <File className="w-4 h-4" /> {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  ) : (
                    <span>Click to browse or drop official document / image here</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">Supported formats: PDF, PNG, JPG, JPEG</p>
              </label>
            </div>
          </div>

          {uploadingDoc && <DocumentProcessingSkeleton />}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="console-btn-secondary"
              disabled={uploadingDoc}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="console-btn-primary"
              disabled={!selectedFile || uploadingDoc}
            >
              <UploadCloud className="w-4 h-4" />
              {uploadingDoc ? 'Ingesting Document...' : 'Ingest & Vectorize'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
