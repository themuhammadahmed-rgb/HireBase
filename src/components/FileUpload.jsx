import React, { useState } from 'react';

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB limit
  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];

  const validateAndSetFile = (selectedFile) => {
    setError('');
    setUploadedFileUrl('');

    if (!selectedFile) return;

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('Invalid file type! Only PNG, JPG, and PDF files are allowed.');
      return;
    }

    if (selectedFile.size > MAX_SIZE) {
      setError('File size exceeds the 5MB limit!');
      return;
    }

    setFile(selectedFile);

    if (selectedFile.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://localhost:5000/api/upload', true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setUploadedFileUrl(`http://localhost:5000${response.filePath}`);
          setFile(null);
          setPreview(null);
        } else {
          setError('Upload failed. Server error.');
        }
        setUploading(false);
      };

      xhr.onerror = () => {
        setError('Network error occurred during upload.');
        setUploading(false);
      };

      xhr.send(formData);
    } catch (err) {
      setError('Error uploading file.');
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-8 p-6 bg-white rounded-xl shadow-md border border-slate-200 text-left">
      <h2 className="text-xl font-bold text-slate-800 mb-4">File & Image Uploader</h2>

      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400'
        }`}
      >
        <div className="text-4xl mb-2">📁</div>
        <p className="text-sm font-semibold text-slate-700">
          Drag & drop your file here, or{' '}
          <label className="text-indigo-600 hover:underline cursor-pointer">
            browse
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={(e) => validateAndSetFile(e.target.files[0])}
              className="hidden"
            />
          </label>
        </p>
        <p className="text-xs text-slate-400 mt-1">PNG, JPG, or PDF up to 5MB</p>
      </div>

      {error && <p className="text-rose-500 text-xs mt-3 font-medium">{error}</p>}

      {/* File Preview */}
      {file && (
        <div className="mt-4 p-4 border border-slate-200 rounded-lg flex items-center gap-4 bg-slate-50">
          {preview ? (
            <img src={preview} alt="Preview" className="w-16 h-16 object-cover rounded-md border" />
          ) : (
            <div className="w-16 h-16 bg-indigo-100 rounded-md flex items-center justify-center text-indigo-600 font-bold text-xs">
              PDF
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
            <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button
            onClick={() => { setFile(null); setPreview(null); }}
            className="text-xs text-rose-500 hover:text-rose-700 font-medium"
          >
            Remove
          </button>
        </div>
      )}

      {/* Progress Bar */}
      {uploading && (
        <div className="mt-4">
          <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {file && !uploading && (
        <button
          onClick={handleUpload}
          className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-semibold transition"
        >
          Upload to Backend
        </button>
      )}

      {/* Success View */}
      {uploadedFileUrl && (
        <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-xs font-semibold text-emerald-800 mb-2">✅ Upload Complete!</p>
          {uploadedFileUrl.endsWith('.pdf') ? (
            <a
              href={uploadedFileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:underline text-xs font-semibold"
            >
              📄 View / Download PDF File
            </a>
          ) : (
            <img
              src={uploadedFileUrl}
              alt="Uploaded Result"
              className="max-h-48 rounded-lg border shadow-sm mx-auto mt-2"
            />
          )}
        </div>
      )}
    </div>
  );
}