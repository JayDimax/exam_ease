import React, { useState } from 'react';
import {
  Upload,
  FileText,
  FileSpreadsheet,
  FileCode,
  Archive,
  Trash2,
  Sparkles,
  BrainCircuit,
  CheckCircle2,
  BookOpen,
  AlertCircle,
  FileCheck,
  Globe,
  Link2,
  ExternalLink,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';
import { extractTextFromFile, calculateWordCount } from '../../services/parser';
import { DocumentMetadata } from '../../types';

// Sample Documents for instant quick-start testing
const SAMPLE_DOCS: { name: string; type: string; text: string }[] = [
  {
    name: 'Computer Science - Data Structures & Algorithms Notes.txt',
    type: 'TXT',
    text: `
DATA STRUCTURES & ALGORITHMS - CHAPTER 1: ARRAYS, LINKED LISTS, AND TREES

1. OVERVIEW
Data structures are foundational organization methods for storing and retrieving memory efficient data in computational systems.

2. ARRAY DATA STRUCTURE
An array is a contiguous memory allocation holding homogeneous data types.
- Access Time Complexity: O(1)
- Search Time Complexity: O(n) for linear search, O(log n) for binary search on sorted arrays.
- Insertion/Deletion: O(n) due to shifting elements.

3. LINKED LISTS
A linear collection of data nodes where each node points to the next node via pointers.
- Singly Linked List: Contains data and next pointer.
- Doubly Linked List: Contains prev pointer, data, and next pointer.
- Access Time: O(n)
- Insertion at Head: O(1)

4. BINARY SEARCH TREES (BST)
A node-based tree structure where the left subtree contains values less than the parent node, and the right subtree contains values greater than the parent.
- Average Search/Insert/Delete: O(log n)
- Worst Case: O(n) when degenerated into a linked list.
- In-Order Traversal yields sorted order.

5. KEY FORMULAS & CONCEPTS
- Time Complexity Big-O Notation: Upper bound worst-case scenario representation.
- Space Complexity: Extra memory consumed relative to input size N.
- Stack (LIFO: Last-In, First-Out) vs Queue (FIFO: First-In, First-Out).
`,
  },
  {
    name: 'Biology - Cell Division & Genetics Lecture.txt',
    type: 'TXT',
    text: `
CELLULAR BIOLOGY & GENETICS LECTURE NOTES

1. MITOSIS & MEIOSIS
Mitosis is a process of nuclear division in eukaryotic cells occurring when a parent cell divides to produce two identical daughter cells.
Stages of Mitosis:
1. Prophase: Chromatin condenses into chromosomes, nuclear envelope breaks down.
2. Metaphase: Chromosomes align along the metaphase plate (equatorial plane).
3. Anaphase: Sister chromatids pull apart toward opposite spindle poles.
4. Telophase: Nuclear envelopes reform around separated daughter chromosomes.

Meiosis is specialized cell division resulting in four genetically unique haploid gamete cells (sperm/egg) with half the chromosome count (23 chromosomes in humans).

2. DNA REPLICATION & GENETICS
- DNA (Deoxyribonucleic Acid) consists of double-helix nucleotide strands with Nitrogenous Bases: Adenine (A), Thymine (T), Guanine (G), Cytosine (C).
- Base Pairing Rule: Adenine pairs with Thymine (A-T), Guanine pairs with Cytosine (G-C).
- DNA Polymerase: Key enzyme responsible for synthesizing new DNA strands.
- Central Dogma of Molecular Biology: DNA -> RNA (Transcription) -> Protein (Translation).

3. MENDELIAN GENETICS
- Dominant Allele: Expressed phenotype even if heterozygous (Aa).
- Recessive Allele: Expressed phenotype only when homozygous recessive (aa).
- Punnett Square: Diagram tool used to predict genotype and phenotype frequencies of genetic crosses.
`,
  },
];

// Public Link Presets for quick testing
const PUBLIC_LINK_PRESETS = [
  {
    title: 'Wikipedia: Machine Learning',
    url: 'https://en.wikipedia.org/wiki/Machine_learning',
    category: 'Computer Science',
  },
  {
    title: 'Wikipedia: Artificial Intelligence',
    url: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
    category: 'AI & Tech',
  },
  {
    title: 'Wikipedia: Photosynthesis',
    url: 'https://en.wikipedia.org/wiki/Photosynthesis',
    category: 'Biology',
  },
];

export const DocumentUploadView: React.FC = () => {
  const {
    documents,
    addDocument,
    deleteDocument,
    setActiveDocument,
    setActiveTab,
    showToast,
  } = useAppStore();

  const [activeSourceTab, setActiveSourceTab] = useState<'file' | 'url'>('file');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [publicUrl, setPublicUrl] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);

  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const parsed = await extractTextFromFile(file);
        const { words, chars } = calculateWordCount(parsed.text);

        const newDoc: DocumentMetadata = {
          id: 'doc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          name: parsed.name,
          size: parsed.size,
          type: parsed.type,
          uploadDate: new Date().toISOString(),
          extractedText: parsed.text,
          characterCount: chars,
          wordCount: words,
        };

        addDocument(newDoc);
      }
      showToast(`Successfully processed ${files.length} document(s).`);
    } catch (err: any) {
      console.error(err);
      showToast('Error parsing file: ' + err.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFetchUrl = async (targetUrl?: string) => {
    const urlToFetch = (targetUrl || publicUrl).trim();
    if (!urlToFetch) {
      showToast('Please enter a valid public web URL', 'error');
      return;
    }

    setIsFetchingUrl(true);
    try {
      const response = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToFetch }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch content from URL');
      }

      const newDoc: DocumentMetadata = {
        id: 'doc_url_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        name: data.name || 'Public Web Import',
        size: data.size || data.extractedText.length * 2,
        type: 'URL',
        uploadDate: new Date().toISOString(),
        extractedText: data.extractedText,
        characterCount: data.characterCount,
        wordCount: data.wordCount,
        sourceUrl: data.sourceUrl || urlToFetch,
      };

      addDocument(newDoc);
      setPublicUrl('');
      showToast(`Successfully imported web page content (${data.wordCount.toLocaleString()} words).`);
    } catch (err: any) {
      console.error('URL import error:', err);
      showToast(err.message || 'Failed to fetch URL', 'error');
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleAddSample = (sample: typeof SAMPLE_DOCS[0]) => {
    const { words, chars } = calculateWordCount(sample.text);
    const doc: DocumentMetadata = {
      id: 'doc_sample_' + Date.now(),
      name: sample.name,
      size: sample.text.length * 2,
      type: sample.type,
      uploadDate: new Date().toISOString(),
      extractedText: sample.text.trim(),
      characterCount: chars,
      wordCount: words,
    };
    addDocument(doc);
    showToast(`Loaded sample document: "${sample.name}"`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Learning Materials & Source Documents</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Upload local files or import public web links (articles, documentation, Wikipedia, online syllabi) as source material.
          </p>
        </div>

        {/* Quick Sample Button */}
        <div className="flex items-center gap-2">
          {SAMPLE_DOCS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleAddSample(sample)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition"
            >
              + Sample {idx + 1} ({sample.name.split('-')[0].trim()})
            </button>
          ))}
        </div>
      </div>

      {/* Upload Source Selector Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button
          onClick={() => setActiveSourceTab('file')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeSourceTab === 'file'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload File / Document</span>
        </button>

        <button
          onClick={() => setActiveSourceTab('url')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeSourceTab === 'url'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Import from Public Link / URL</span>
          <span className="px-1.5 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-md font-extrabold uppercase">
            New
          </span>
        </button>
      </div>

      {/* SOURCE TAB 1: File Upload */}
      {activeSourceTab === 'file' && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition ${
            dragActive
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-slate-400'
          }`}
        >
          <input
            type="file"
            id="file-upload-input"
            multiple
            accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.txt,.md,.pptx,.zip,.png,.jpg,.jpeg"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
              <Upload className="w-7 h-7" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Drag & Drop your learning materials here
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                or click below to browse files from your device
              </p>
            </div>

            <label
              htmlFor="file-upload-input"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition"
            >
              <Upload className="w-4 h-4" />
              <span>Select Files</span>
            </label>

            <div className="text-[11px] text-slate-400 space-y-1">
              <p>Supported formats: PDF, Word (.docx), Excel (.xlsx), PowerPoint (.pptx), Text (.txt), Markdown (.md), Images, or ZIP</p>
              <p className="text-slate-500 dark:text-slate-400 font-medium">✨ Maximum file size: Up to 50MB per file (no artificial character limit)</p>
            </div>
          </div>

          {isUploading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <div className="flex items-center gap-3 text-blue-600 font-bold text-xs">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Reading and extracting document text...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SOURCE TAB 2: Public Link / URL Import */}
      {activeSourceTab === 'url' && (
        <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Import Content from a Public Link</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Paste any publicly accessible URL (e.g., Wikipedia article, online documentation, web page, or raw text file) to import it directly into your workspace.
              </p>
            </div>
          </div>

          {/* URL Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleFetchUrl();
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <Link2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                value={publicUrl}
                onChange={(e) => setPublicUrl(e.target.value)}
                placeholder="https://en.wikipedia.org/wiki/Machine_learning"
                disabled={isFetchingUrl}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={isFetchingUrl || !publicUrl.trim()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition"
            >
              {isFetchingUrl ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Fetching & Extracting...</span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  <span>Import Link</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Presets for Public Links */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Try a Quick Public Link Preset:
            </p>
            <div className="flex flex-wrap gap-2">
              {PUBLIC_LINK_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isFetchingUrl}
                  onClick={() => handleFetchUrl(preset.url)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium text-xs rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition"
                >
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                  <span>{preset.title}</span>
                  <span className="text-[10px] text-slate-400">({preset.category})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl text-xs text-blue-700 dark:text-blue-300">
            <Info className="w-4 h-4 shrink-0" />
            <span>
              The server will automatically parse and clean the HTML, extract main text content, and compute word metrics ready for AI knowledge mapping and exam generation.
            </span>
          </div>
        </div>
      )}

      {/* Uploaded Documents List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-blue-600" />
          <span>Uploaded Documents Collection ({documents.length})</span>
        </h2>

        {documents.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
            <p className="text-xs text-slate-500">No documents or public link imports in your workspace yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-lg ${
                      doc.type === 'URL'
                        ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                        : 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                    }`}>
                      {doc.type === 'URL' ? '🌐 PUBLIC LINK' : doc.type}
                    </span>
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      title="Delete document"
                      className="text-slate-400 hover:text-red-500 p-1 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-3 line-clamp-2">
                    {doc.name}
                  </h3>

                  {doc.sourceUrl && (
                    <a
                      href={doc.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline mt-1 truncate max-w-full"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate">{doc.sourceUrl}</span>
                    </a>
                  )}

                  <div className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <p>• Words: <span className="font-semibold text-slate-800 dark:text-slate-200">{doc.wordCount.toLocaleString()}</span></p>
                    <p>• Characters: <span className="font-semibold text-slate-800 dark:text-slate-200">{doc.characterCount.toLocaleString()}</span></p>
                    <p>• Estimated Reading Time: <span className="font-semibold text-slate-800 dark:text-slate-200">{Math.ceil(doc.wordCount / 200)} min</span></p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveDocument(doc);
                      setActiveTab('analysis');
                    }}
                    className="flex-1 py-2 px-3 bg-slate-100 dark:bg-slate-700/70 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                  >
                    <BrainCircuit className="w-3.5 h-3.5 text-indigo-500" />
                    <span>AI Analysis</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveDocument(doc);
                      setActiveTab('generate');
                    }}
                    className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Exam</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
