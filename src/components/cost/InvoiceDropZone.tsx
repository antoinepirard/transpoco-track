'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Upload,
  FileText,
  Loader2,
  Check,
  X,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Demo vehicle list
const DEMO_VEHICLES = [
  { id: 'DUB-117', label: 'Transit Custom · DUB-117' },
  { id: 'DUB-204', label: 'Sprinter 316CDI · DUB-204' },
  { id: 'CORK-118', label: 'Vivaro-e · CORK-118' },
  { id: 'LIM-077', label: 'Transit Custom · LIM-077' },
  { id: 'BEL-033', label: 'eVito · BEL-033' },
  { id: 'GAL-022', label: 'Crafter · GAL-022' },
  { id: 'DUB-301', label: 'Transit · DUB-301' },
  { id: 'CORK-205', label: 'Sprinter · CORK-205' },
];

const COST_CATEGORIES = [
  { value: 'fuel', label: 'Fuel' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'lease', label: 'Lease/Finance' },
  { value: 'tax', label: 'Road Tax' },
  { value: 'tolls', label: 'Tolls' },
  { value: 'fines', label: 'Fines' },
  { value: 'parking', label: 'Parking' },
  { value: 'other', label: 'Other' },
];

// Fake AI extraction suppliers
const MOCK_SUPPLIERS = [
  'QuickFit Tyres Dublin',
  'Circle K Navan Road',
  'Applegreen M50',
  'eFlow Monthly',
  'National Toll Roads',
  'AXA Insurance',
  'Zurich Fleet Insurance',
  'Ayvens Leasing',
  'Fast Fit Exhausts',
  'Halfords Dublin',
];

interface ExtractedData {
  vehicle: string;
  category: string;
  amount: string;
  date: string;
  supplier: string;
  confidence: number;
}

type ProcessingState =
  | 'idle'
  | 'uploading'
  | 'extracting'
  | 'preview'
  | 'success';

interface InvoiceDropZoneProps {
  onExpenseAdded?: (data: ExtractedData) => void;
  compact?: boolean;
}

// Simulate AI extraction with realistic delay
async function simulateAIExtraction(file: File): Promise<ExtractedData> {
  await new Promise((resolve) =>
    setTimeout(resolve, 1500 + Math.random() * 1000)
  );

  // Generate plausible extracted data
  const randomVehicle =
    DEMO_VEHICLES[Math.floor(Math.random() * DEMO_VEHICLES.length)];
  const randomCategory = COST_CATEGORIES[Math.floor(Math.random() * 5)]; // Bias towards common categories
  const randomSupplier =
    MOCK_SUPPLIERS[Math.floor(Math.random() * MOCK_SUPPLIERS.length)];

  // Generate realistic amount based on category
  let amount: number;
  switch (randomCategory.value) {
    case 'fuel':
      amount = 50 + Math.random() * 100;
      break;
    case 'maintenance':
      amount = 100 + Math.random() * 400;
      break;
    case 'insurance':
      amount = 200 + Math.random() * 300;
      break;
    case 'lease':
      amount = 500 + Math.random() * 500;
      break;
    default:
      amount = 20 + Math.random() * 100;
  }

  // Generate date within last 30 days
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  return {
    vehicle: randomVehicle.id,
    category: randomCategory.value,
    amount: amount.toFixed(2),
    date: date.toISOString().split('T')[0],
    supplier: randomSupplier,
    confidence: 0.85 + Math.random() * 0.14, // 85-99% confidence
  };
}

export function InvoiceDropZone({
  onExpenseAdded,
  compact = false,
}: InvoiceDropZoneProps) {
  const [state, setState] = useState<ProcessingState>('idle');
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = async (file: File) => {
    setFileName(file.name);
    setFileType(file.type);
    setState('uploading');

    // Create preview URL for the file
    const previewUrl = URL.createObjectURL(file);
    setFilePreviewUrl(previewUrl);

    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 500));
    setState('extracting');

    // Simulate AI extraction
    const extracted = await simulateAIExtraction(file);
    setExtractedData(extracted);
    setState('preview');
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (
      file &&
      (file.type === 'application/pdf' || file.type.startsWith('image/'))
    ) {
      processFile(file);
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    []
  );

  const handleConfirm = () => {
    if (extractedData) {
      console.log('[Demo] Expense confirmed:', extractedData);
      onExpenseAdded?.(extractedData);
      setState('success');

      // Reset after showing success
      setTimeout(() => {
        setState('idle');
        setExtractedData(null);
        setFileName('');
        setFileType('');
        if (filePreviewUrl) {
          URL.revokeObjectURL(filePreviewUrl);
          setFilePreviewUrl(null);
        }
      }, 2000);
    }
  };

  const handleCancel = () => {
    setState('idle');
    setExtractedData(null);
    setFileName('');
    setFileType('');
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateExtractedField = (field: keyof ExtractedData, value: string) => {
    if (extractedData) {
      setExtractedData({ ...extractedData, [field]: value });
    }
  };

  // Compact button version for header
  if (compact && state === 'idle') {
    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button
          variant="default"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Upload className="h-4 w-4 mr-1.5" />
          Drop Invoice
        </Button>
      </>
    );
  }

  // Processing states overlay
  if (state === 'uploading' || state === 'extracting') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            {state === 'uploading' ? (
              <Upload className="h-8 w-8 text-blue-600 animate-pulse" />
            ) : (
              <Sparkles className="h-8 w-8 text-blue-600 animate-pulse" />
            )}
          </div>
          <h3 className="font-semibold text-lg mb-2">
            {state === 'uploading' ? 'Uploading...' : 'Extracting data...'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {state === 'uploading'
              ? `Processing ${fileName}`
              : 'AI is reading your invoice'}
          </p>
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  // Preview extracted data with document preview
  if (state === 'preview' && extractedData) {
    const isPdf = fileType === 'application/pdf';
    const isImage = fileType.startsWith('image/');

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-5xl w-full shadow-2xl overflow-hidden h-[70vh] flex flex-col">
          {/* Header */}
          <div className="p-4 bg-emerald-50 border-b flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Review Extracted Data</h3>
              <p className="text-xs text-muted-foreground">
                {Math.round(extractedData.confidence * 100)}% confidence ·{' '}
                {fileName}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content: Document Preview + Form */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Left: Document Preview */}
            <div className="w-1/2 bg-slate-100 border-r flex flex-col">
              <div className="p-2 bg-slate-200 border-b flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700 truncate">
                  {fileName}
                </span>
              </div>
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
                {filePreviewUrl && isPdf && (
                  <iframe
                    src={filePreviewUrl}
                    className="w-full h-full min-h-[400px] rounded border bg-white"
                    title="Invoice Preview"
                  />
                )}
                {filePreviewUrl && isImage && (
                  <img
                    src={filePreviewUrl}
                    alt="Invoice Preview"
                    className="max-w-full max-h-full object-contain rounded shadow-sm"
                  />
                )}
                {!filePreviewUrl && (
                  <div className="text-center text-muted-foreground">
                    <FileText className="h-16 w-16 mx-auto mb-2 opacity-30" />
                    <p>Preview not available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Editable Fields */}
            <div className="w-1/2 flex flex-col">
              <div className="flex-1 overflow-auto p-6 space-y-4">
                {/* Vehicle */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Vehicle</Label>
                  <Select
                    value={extractedData.vehicle}
                    onValueChange={(v) => updateExtractedField('vehicle', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEMO_VEHICLES.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Category</Label>
                  <Select
                    value={extractedData.category}
                    onValueChange={(v) => updateExtractedField('category', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COST_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount and Date row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Amount (€)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        €
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        value={extractedData.amount}
                        onChange={(e) =>
                          updateExtractedField('amount', e.target.value)
                        }
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Date</Label>
                    <Input
                      type="date"
                      value={extractedData.date}
                      onChange={(e) =>
                        updateExtractedField('date', e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Supplier */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Supplier</Label>
                  <Input
                    value={extractedData.supplier}
                    onChange={(e) =>
                      updateExtractedField('supplier', e.target.value)
                    }
                  />
                </div>

                {/* Low confidence warning */}
                {extractedData.confidence < 0.9 && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 text-amber-700 text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>
                      Some fields may need review. Please verify before
                      confirming.
                    </span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t flex gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleConfirm}>
                  <Check className="h-4 w-4 mr-1.5" />
                  Confirm & Add
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (state === 'success') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Expense Added</h3>
          <p className="text-sm text-muted-foreground">
            Successfully recorded €{extractedData?.amount} for{' '}
            {DEMO_VEHICLES.find((v) => v.id === extractedData?.vehicle)?.id}
          </p>
        </div>
      </div>
    );
  }

  // Default drop zone (non-compact)
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all',
          isDragging
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'
        )}
      >
        <div className="flex flex-col items-center">
          <div
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors',
              isDragging ? 'bg-emerald-100' : 'bg-slate-100'
            )}
          >
            <Upload
              className={cn(
                'h-6 w-6 transition-colors',
                isDragging ? 'text-emerald-600' : 'text-slate-500'
              )}
            />
          </div>
          <p className="font-medium mb-1">
            {isDragging
              ? 'Drop invoice here'
              : 'Drop invoice or click to upload'}
          </p>
          <p className="text-sm text-muted-foreground">
            PDF or image · AI will extract the data
          </p>
        </div>
      </div>
    </>
  );
}
