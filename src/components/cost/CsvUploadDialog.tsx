'use client';

import { useState, useCallback } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Check,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

// Expected columns for cost data
const EXPECTED_COLUMNS = [
  { id: 'vehicle_id', label: 'Vehicle ID', required: true },
  { id: 'category', label: 'Cost Category', required: true },
  { id: 'amount', label: 'Amount', required: true },
  { id: 'date', label: 'Date', required: true },
  { id: 'notes', label: 'Notes', required: false },
  { id: 'supplier', label: 'Supplier', required: false },
  { id: 'invoice_ref', label: 'Invoice Reference', required: false },
];

type Step = 'upload' | 'mapping' | 'preview' | 'success';

interface CsvUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CsvUploadDialog({ open, onOpenChange }: CsvUploadDialogProps) {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>(
    {}
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [importStats, setImportStats] = useState({
    total: 0,
    success: 0,
    errors: 0,
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (
      droppedFile &&
      (droppedFile.type === 'text/csv' ||
        droppedFile.name.endsWith('.csv') ||
        droppedFile.name.endsWith('.xlsx') ||
        droppedFile.name.endsWith('.xls'))
    ) {
      processFile(droppedFile);
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        processFile(selectedFile);
      }
    },
    []
  );

  const processFile = (f: File) => {
    setFile(f);

    // Simulate parsing CSV headers
    // In real implementation, use papaparse or similar
    const simulatedHeaders = [
      'Registration',
      'Type',
      'Cost',
      'Transaction Date',
      'Description',
      'Vendor',
      'Ref',
    ];
    setDetectedColumns(simulatedHeaders);

    // Auto-map columns based on name similarity
    const autoMapping: Record<string, string> = {};
    simulatedHeaders.forEach((header) => {
      const lowerHeader = header.toLowerCase();
      if (
        lowerHeader.includes('registration') ||
        lowerHeader.includes('vehicle')
      ) {
        autoMapping.vehicle_id = header;
      } else if (
        lowerHeader.includes('type') ||
        lowerHeader.includes('category')
      ) {
        autoMapping.category = header;
      } else if (
        lowerHeader.includes('cost') ||
        lowerHeader.includes('amount')
      ) {
        autoMapping.amount = header;
      } else if (lowerHeader.includes('date')) {
        autoMapping.date = header;
      } else if (
        lowerHeader.includes('description') ||
        lowerHeader.includes('notes')
      ) {
        autoMapping.notes = header;
      } else if (
        lowerHeader.includes('vendor') ||
        lowerHeader.includes('supplier')
      ) {
        autoMapping.supplier = header;
      } else if (
        lowerHeader.includes('ref') ||
        lowerHeader.includes('invoice')
      ) {
        autoMapping.invoice_ref = header;
      }
    });
    setColumnMapping(autoMapping);

    setStep('mapping');
  };

  const handleMappingChange = (expectedCol: string, csvCol: string) => {
    setColumnMapping((prev) => ({
      ...prev,
      [expectedCol]: csvCol,
    }));
  };

  const requiredMapped = EXPECTED_COLUMNS.filter((c) => c.required).every(
    (c) => columnMapping[c.id]
  );

  const handlePreview = () => {
    setStep('preview');
  };

  const handleImport = async () => {
    setIsProcessing(true);

    // Simulate import process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate results
    const total = Math.floor(Math.random() * 50) + 20;
    const errors = Math.floor(Math.random() * 3);
    setImportStats({
      total,
      success: total - errors,
      errors,
    });

    console.log('[Demo] CSV Import completed:', {
      file: file?.name,
      mapping: columnMapping,
      rows: total,
    });

    setIsProcessing(false);
    setStep('success');
  };

  const handleClose = () => {
    // Reset state
    setStep('upload');
    setFile(null);
    setDetectedColumns([]);
    setColumnMapping({});
    setIsProcessing(false);
    setImportStats({ total: 0, success: 0, errors: 0 });
    onOpenChange(false);
  };

  const renderUploadStep = () => (
    <>
      <DialogHeader>
        <DialogTitle>Upload Cost Data</DialogTitle>
        <DialogDescription>
          Import expenses from a CSV or Excel file. We&apos;ll help you map the
          columns.
        </DialogDescription>
      </DialogHeader>

      <div className="py-6">
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-gray-300'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm font-medium mb-1">
            Drop your file here, or{' '}
            <label className="text-primary cursor-pointer hover:underline">
              browse
              <input
                type="file"
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
              />
            </label>
          </p>
          <p className="text-xs text-muted-foreground">
            Supports CSV, XLSX, XLS
          </p>
        </div>

        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Expected columns:</h4>
          <div className="flex flex-wrap gap-2">
            {EXPECTED_COLUMNS.map((col) => (
              <span
                key={col.id}
                className={cn(
                  'text-xs px-2 py-1 rounded',
                  col.required
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                {col.label}
                {col.required && ' *'}
              </span>
            ))}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
      </DialogFooter>
    </>
  );

  const renderMappingStep = () => (
    <>
      <DialogHeader>
        <DialogTitle>Map Columns</DialogTitle>
        <DialogDescription>
          Match your file columns to the expected fields. Required fields are
          marked with *.
        </DialogDescription>
      </DialogHeader>

      <div className="py-4">
        {file && (
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg mb-4">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-medium">{file.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 ml-auto"
              onClick={() => {
                setFile(null);
                setStep('upload');
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {EXPECTED_COLUMNS.map((col) => (
            <div key={col.id} className="grid grid-cols-2 gap-4 items-center">
              <Label className={cn(!col.required && 'text-muted-foreground')}>
                {col.label}
                {col.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Select
                value={columnMapping[col.id] || ''}
                onValueChange={(v) => handleMappingChange(col.id, v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select column..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">-- Skip --</SelectItem>
                  {detectedColumns.map((csvCol) => (
                    <SelectItem key={csvCol} value={csvCol}>
                      {csvCol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => {
            setFile(null);
            setStep('upload');
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back
        </Button>
        <Button onClick={handlePreview} disabled={!requiredMapped}>
          Preview
          <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
      </DialogFooter>
    </>
  );

  const renderPreviewStep = () => (
    <>
      <DialogHeader>
        <DialogTitle>Preview Import</DialogTitle>
        <DialogDescription>
          Review your column mapping before importing.
        </DialogDescription>
      </DialogHeader>

      <div className="py-4">
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                  Field
                </th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                  Mapped To
                </th>
                <th className="px-3 py-2 text-center font-medium text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {EXPECTED_COLUMNS.filter(
                (c) => c.required || columnMapping[c.id]
              ).map((col) => (
                <tr key={col.id}>
                  <td className="px-3 py-2 font-medium">{col.label}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {columnMapping[col.id] || '—'}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {columnMapping[col.id] ? (
                      <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                    ) : col.required ? (
                      <AlertCircle className="h-4 w-4 text-amber-500 mx-auto" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          Demo: This will simulate importing ~30 rows of expense data.
        </p>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => setStep('mapping')}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back
        </Button>
        <Button onClick={handleImport} disabled={isProcessing}>
          {isProcessing ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Importing...
            </>
          ) : (
            'Import Data'
          )}
        </Button>
      </DialogFooter>
    </>
  );

  const renderSuccessStep = () => (
    <>
      <DialogHeader>
        <DialogTitle>Import Complete</DialogTitle>
      </DialogHeader>

      <div className="py-6 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-emerald-600" />
        </div>

        <h3 className="text-lg font-semibold mb-2">
          Successfully imported expenses
        </h3>

        <div className="flex justify-center gap-6 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {importStats.success}
            </p>
            <p className="text-xs text-muted-foreground">Imported</p>
          </div>
          {importStats.errors > 0 && (
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">
                {importStats.errors}
              </p>
              <p className="text-xs text-muted-foreground">Skipped</p>
            </div>
          )}
          <div className="text-center">
            <p className="text-2xl font-bold">{importStats.total}</p>
            <p className="text-xs text-muted-foreground">Total Rows</p>
          </div>
        </div>

        {importStats.errors > 0 && (
          <p className="text-xs text-muted-foreground mt-4">
            {importStats.errors} row(s) were skipped due to validation errors.
          </p>
        )}
      </div>

      <DialogFooter>
        <Button onClick={handleClose}>Done</Button>
      </DialogFooter>
    </>
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        {step === 'upload' && renderUploadStep()}
        {step === 'mapping' && renderMappingStep()}
        {step === 'preview' && renderPreviewStep()}
        {step === 'success' && renderSuccessStep()}
      </DialogContent>
    </Dialog>
  );
}
