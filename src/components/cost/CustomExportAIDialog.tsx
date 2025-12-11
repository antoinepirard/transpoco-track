'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Check,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Download,
  Save,
  Trash2,
  Loader2,
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type {
  ExportTemplate,
  ExportColumnMapping,
  VehicleTco,
} from '@/types/cost';
import { EXPORTABLE_FIELDS } from '@/types/cost';

const TEMPLATES_STORAGE_KEY = 'transpoco_export_templates';

type Step = 'upload' | 'mapping' | 'review' | 'export';

interface CustomExportAIDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: VehicleTco[];
  currency: string;
}

// Group exportable fields by category for the dropdown
const groupedFields = EXPORTABLE_FIELDS.reduce(
  (acc, field) => {
    if (!acc[field.group]) {
      acc[field.group] = [];
    }
    acc[field.group].push(field);
    return acc;
  },
  {} as Record<string, typeof EXPORTABLE_FIELDS>
);

// AI-powered column matching with confidence scoring
function detectMapping(header: string): {
  field: string | null;
  confidence: number;
} {
  const lower = header.toLowerCase().trim();

  // High confidence matches
  if (lower.includes('registration') || lower === 'reg' || lower === 'reg no')
    return { field: 'registrationNumber', confidence: 0.95 };
  if (lower === 'vehicle id' || lower === 'vehicleid' || lower === 'id')
    return { field: 'vehicleId', confidence: 0.9 };
  if (lower.includes('vehicle name') || lower === 'vehicle' || lower === 'name')
    return { field: 'vehicleLabel', confidence: 0.85 };
  if (lower.includes('driver')) return { field: 'driverName', confidence: 0.9 };
  if (lower.includes('type') && lower.includes('vehicle'))
    return { field: 'vehicleType', confidence: 0.85 };

  // Cost matches
  if (
    lower === 'tco' ||
    lower.includes('monthly tco') ||
    lower.includes('total cost')
  )
    return { field: 'monthlyTco', confidence: 0.9 };
  if (
    lower.includes('cost per km') ||
    lower.includes('tco/km') ||
    lower === 'cpk'
  )
    return { field: 'tcoPerKm', confidence: 0.9 };
  if (lower.includes('cost per hour') || lower.includes('tco/hour'))
    return { field: 'tcoPerHour', confidence: 0.85 };

  // Cost breakdown matches
  if (lower.includes('fuel')) return { field: 'fuel', confidence: 0.9 };
  if (
    lower.includes('maintenance') ||
    lower.includes('repair') ||
    lower.includes('service')
  )
    return { field: 'maintenance', confidence: 0.85 };
  if (lower.includes('insurance'))
    return { field: 'insurance', confidence: 0.9 };
  if (
    lower.includes('lease') ||
    lower.includes('rental') ||
    lower.includes('finance')
  )
    return { field: 'lease', confidence: 0.85 };
  if (lower.includes('tax') || lower.includes('road tax'))
    return { field: 'tax', confidence: 0.85 };
  if (lower.includes('toll')) return { field: 'tolls', confidence: 0.9 };
  if (lower.includes('fine') || lower.includes('penalty'))
    return { field: 'fines', confidence: 0.85 };
  if (lower.includes('parking')) return { field: 'parking', confidence: 0.9 };

  // Usage matches
  if (
    lower.includes('km') ||
    lower.includes('mileage') ||
    lower.includes('distance')
  )
    return { field: 'totalKm', confidence: 0.8 };
  if (lower.includes('hours') || lower.includes('hrs'))
    return { field: 'totalHours', confidence: 0.8 };
  if (lower.includes('utilization') || lower.includes('usage'))
    return { field: 'utilization', confidence: 0.8 };
  if (lower.includes('age')) return { field: 'vehicleAge', confidence: 0.75 };

  // No match found
  return { field: null, confidence: 0 };
}

// Get saved templates from localStorage
function getSavedTemplates(): ExportTemplate[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save template to localStorage
function saveTemplate(template: ExportTemplate): void {
  if (typeof window === 'undefined') return;
  const templates = getSavedTemplates();
  const existing = templates.findIndex((t) => t.id === template.id);
  if (existing >= 0) {
    templates[existing] = template;
  } else {
    templates.push(template);
  }
  localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
}

// Delete template from localStorage
function deleteTemplate(templateId: string): void {
  if (typeof window === 'undefined') return;
  const templates = getSavedTemplates().filter((t) => t.id !== templateId);
  localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
}

// Get value from vehicle for a given field
function getVehicleValue(
  vehicle: VehicleTco,
  fieldId: string,
  currency: string
): string {
  switch (fieldId) {
    case 'vehicleId':
      return vehicle.vehicleId;
    case 'vehicleLabel':
      return vehicle.vehicleLabel;
    case 'registrationNumber':
      return vehicle.registrationNumber;
    case 'vehicleType':
      return vehicle.vehicleType;
    case 'driverName':
      return vehicle.driver?.name ?? '';
    case 'monthlyTco':
      return `${currency}${vehicle.monthlyTco.toLocaleString()}`;
    case 'tcoPerKm':
      return `${currency}${vehicle.tcoPerKm.toFixed(2)}`;
    case 'tcoPerHour':
      return `${currency}${vehicle.tcoPerHour.toFixed(2)}`;
    case 'tcoTrend':
      return `${vehicle.tcoTrend > 0 ? '+' : ''}${vehicle.tcoTrend.toFixed(1)}%`;
    case 'totalKm':
      return vehicle.totalKm.toLocaleString();
    case 'totalHours':
      return vehicle.totalHours.toLocaleString();
    case 'utilization':
      return `${vehicle.utilization.toFixed(1)}%`;
    case 'vehicleAge':
      return vehicle.vehicleAge.toString();
    case 'dataCompleteness':
      return `${vehicle.dataCompleteness}%`;
    case 'peerGroupMultiple':
      return `${vehicle.peerGroupMultiple.toFixed(2)}x`;
    case 'fuel':
    case 'maintenance':
    case 'insurance':
    case 'lease':
    case 'tax':
    case 'tolls':
    case 'fines':
    case 'parking': {
      const bucket = vehicle.costBreakdown.find((b) => b.bucket === fieldId);
      return bucket ? `${currency}${bucket.amount.toLocaleString()}` : '';
    }
    default:
      return '';
  }
}

// Get raw value for CSV export
function getVehicleRawValue(
  vehicle: VehicleTco,
  fieldId: string
): string | number {
  switch (fieldId) {
    case 'vehicleId':
      return vehicle.vehicleId;
    case 'vehicleLabel':
      return vehicle.vehicleLabel;
    case 'registrationNumber':
      return vehicle.registrationNumber;
    case 'vehicleType':
      return vehicle.vehicleType;
    case 'driverName':
      return vehicle.driver?.name ?? '';
    case 'monthlyTco':
      return vehicle.monthlyTco;
    case 'tcoPerKm':
      return vehicle.tcoPerKm;
    case 'tcoPerHour':
      return vehicle.tcoPerHour;
    case 'tcoTrend':
      return vehicle.tcoTrend;
    case 'totalKm':
      return vehicle.totalKm;
    case 'totalHours':
      return vehicle.totalHours;
    case 'utilization':
      return vehicle.utilization;
    case 'vehicleAge':
      return vehicle.vehicleAge;
    case 'dataCompleteness':
      return vehicle.dataCompleteness;
    case 'peerGroupMultiple':
      return vehicle.peerGroupMultiple;
    case 'fuel':
    case 'maintenance':
    case 'insurance':
    case 'lease':
    case 'tax':
    case 'tolls':
    case 'fines':
    case 'parking': {
      const bucket = vehicle.costBreakdown.find((b) => b.bucket === fieldId);
      return bucket?.amount ?? 0;
    }
    default:
      return '';
  }
}

export function CustomExportAIDialog({
  open,
  onOpenChange,
  vehicles,
  currency,
}: CustomExportAIDialogProps) {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<ExportColumnMapping[]>(
    []
  );
  const [templateName, setTemplateName] = useState('');
  const [savedTemplates, setSavedTemplates] = useState<ExportTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  // Load saved templates on mount
  useState(() => {
    setSavedTemplates(getSavedTemplates());
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
      void processFile(droppedFile);
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        void processFile(selectedFile);
      }
    },
    []
  );

  const [isParsingFile, setIsParsingFile] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const processFile = async (f: File) => {
    setFile(f);
    setSelectedTemplateId(null);
    setIsParsingFile(true);
    setParseError(null);

    try {
      // Read the file and extract headers
      const text = await f.text();
      let headers: string[] = [];

      if (f.name.endsWith('.csv') || f.type === 'text/csv') {
        // Parse CSV - get first line as headers
        const lines = text.split(/\r?\n/).filter((line) => line.trim());
        if (lines.length === 0) {
          throw new Error('File is empty');
        }

        // Simple CSV parsing for header row (handles quoted fields)
        const headerLine = lines[0];
        headers = parseCSVLine(headerLine);
      } else if (f.name.endsWith('.xlsx') || f.name.endsWith('.xls')) {
        // For Excel files, we'd need a library like xlsx
        // For now, show a helpful message
        throw new Error(
          'Excel files (.xlsx, .xls) require additional processing. Please export your file as CSV first.'
        );
      } else {
        throw new Error('Unsupported file format. Please use CSV files.');
      }

      if (headers.length === 0) {
        throw new Error('No columns found in the file');
      }

      // Filter out empty headers
      headers = headers.filter((h) => h.trim());

      setDetectedColumns(headers);

      // Auto-map columns using AI
      const mappings: ExportColumnMapping[] = headers.map((header) => {
        const { field, confidence } = detectMapping(header);
        return {
          templateColumn: header,
          dataField: field,
          confidence,
          isManualOverride: false,
        };
      });
      setColumnMappings(mappings);
      setTemplateName(f.name.replace(/\.(csv|xlsx|xls)$/i, ''));

      setStep('mapping');
    } catch (error) {
      setParseError(
        error instanceof Error ? error.message : 'Failed to parse file'
      );
    } finally {
      setIsParsingFile(false);
    }
  };

  // Simple CSV line parser that handles quoted fields
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++;
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    // Don't forget the last field
    result.push(current.trim());

    return result;
  };

  const handleSelectTemplate = (templateId: string) => {
    const template = savedTemplates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setDetectedColumns(template.columnMappings.map((m) => m.templateColumn));
      setColumnMappings(template.columnMappings);
      setTemplateName(template.name);
      setFile(null);
      setStep('mapping');
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    deleteTemplate(templateId);
    setSavedTemplates(getSavedTemplates());
    if (selectedTemplateId === templateId) {
      setSelectedTemplateId(null);
    }
  };

  const handleMappingChange = (index: number, dataField: string | null) => {
    setColumnMappings((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        dataField: dataField === '__skip__' ? null : dataField,
        confidence: 1,
        isManualOverride: true,
      };
      return updated;
    });
  };

  // Calculate stats for the review step
  const mappingStats = useMemo(() => {
    const mapped = columnMappings.filter((m) => m.dataField !== null);
    const unmapped = columnMappings.filter((m) => m.dataField === null);
    const aiDetected = columnMappings.filter(
      (m) => m.dataField !== null && !m.isManualOverride
    );
    return { mapped, unmapped, aiDetected, total: columnMappings.length };
  }, [columnMappings]);

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;

    const template: ExportTemplate = {
      id: selectedTemplateId || `template-${Date.now()}`,
      name: templateName.trim(),
      createdAt: new Date().toISOString(),
      sourceFileName: file?.name || 'Saved template',
      columnMappings,
    };

    saveTemplate(template);
    setSavedTemplates(getSavedTemplates());
    setSelectedTemplateId(template.id);
  };

  const handleExport = async () => {
    setIsExporting(true);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate CSV
    const headers = columnMappings.map((m) => m.templateColumn);
    const rows = vehicles.map((vehicle) =>
      columnMappings.map((m) =>
        m.dataField ? getVehicleRawValue(vehicle, m.dataField) : ''
      )
    );

    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((cell) => {
            const str = String(cell);
            // Escape commas and quotes
            if (str.includes(',') || str.includes('"')) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          })
          .join(',')
      ),
    ].join('\n');

    // Download file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName || 'custom-export'}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsExporting(false);
    setExportComplete(true);
    setStep('export');
  };

  const handleClose = () => {
    setStep('upload');
    setFile(null);
    setDetectedColumns([]);
    setColumnMappings([]);
    setTemplateName('');
    setSelectedTemplateId(null);
    setIsExporting(false);
    setExportComplete(false);
    setIsParsingFile(false);
    setParseError(null);
    onOpenChange(false);
  };

  // Render Step 1: Upload
  const renderUploadStep = () => (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <DialogTitle>Custom Export</DialogTitle>
          <Badge className="bg-violet-100 text-violet-700 gap-1">
            <Sparkles className="h-3 w-3" />
            AI-Powered
          </Badge>
        </div>
        <DialogDescription>
          Upload a previous report and we&apos;ll match your columns
          automatically.
        </DialogDescription>
      </DialogHeader>

      <div className="py-4 space-y-4">
        {/* Saved Templates */}
        {savedTemplates.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Use saved template</Label>
            <div className="space-y-2 max-h-[150px] overflow-y-auto">
              {savedTemplates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <button
                    type="button"
                    className="flex items-center gap-3 flex-1 text-left"
                    onClick={() => handleSelectTemplate(template.id)}
                  >
                    <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium">{template.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {
                          template.columnMappings.filter((m) => m.dataField)
                            .length
                        }{' '}
                        columns mapped
                      </p>
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-600"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  or upload new
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {parseError && (
          <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">
                Failed to parse file
              </p>
              <p className="text-xs text-red-700 mt-0.5">{parseError}</p>
            </div>
          </div>
        )}

        {/* Drop Zone */}
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-gray-300',
            isParsingFile && 'pointer-events-none opacity-60'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isParsingFile ? (
            <>
              <Loader2 className="h-10 w-10 mx-auto text-primary mb-4 animate-spin" />
              <p className="text-sm font-medium mb-1">Analyzing your file...</p>
              <p className="text-xs text-muted-foreground">
                Detecting columns and mapping fields
              </p>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm font-medium mb-1">
                Drop your previous report here, or{' '}
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
                Supports CSV files
              </p>
            </>
          )}
        </div>

        <div className="flex items-start gap-2 p-3 bg-violet-50 rounded-lg">
          <Sparkles className="h-4 w-4 text-violet-600 mt-0.5 shrink-0" />
          <p className="text-xs text-violet-700">
            Our AI will detect your column headers and automatically map them to
            available data fields. You can review and adjust the mapping before
            exporting.
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
      </DialogFooter>
    </>
  );

  // Render Step 2: Column Mapping
  const renderMappingStep = () => (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <DialogTitle>Map Columns</DialogTitle>
          <Badge className="bg-violet-100 text-violet-700 gap-1">
            <Sparkles className="h-3 w-3" />
            AI-Detected
          </Badge>
        </div>
        <DialogDescription>
          Review the detected mappings. Adjust any that don&apos;t look right.
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
          {columnMappings.map((mapping, index) => (
            <div
              key={mapping.templateColumn}
              className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">
                  {mapping.templateColumn}
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <Select
                  value={mapping.dataField || '__skip__'}
                  onValueChange={(v) => handleMappingChange(index, v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select field..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__skip__">
                      -- Skip this column --
                    </SelectItem>
                    {Object.entries(groupedFields).map(([group, fields]) => (
                      <SelectGroup key={group}>
                        <SelectLabel>{group}</SelectLabel>
                        {fields.map((field) => (
                          <SelectItem key={field.id} value={field.id}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
                {mapping.dataField &&
                  !mapping.isManualOverride &&
                  mapping.confidence > 0.7 && (
                    <Sparkles className="h-4 w-4 text-violet-500 shrink-0" />
                  )}
                {mapping.dataField && (
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                )}
                {!mapping.dataField && (
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Check className="h-3 w-3 text-emerald-500" />
            {mappingStats.mapped.length} mapped
          </span>
          {mappingStats.unmapped.length > 0 && (
            <span className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3 text-amber-500" />
              {mappingStats.unmapped.length} skipped
            </span>
          )}
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-violet-500" />
            {mappingStats.aiDetected.length} AI-detected
          </span>
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
        <Button onClick={() => setStep('review')}>
          Review
          <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
      </DialogFooter>
    </>
  );

  // Render Step 3: Review & Configure
  const renderReviewStep = () => (
    <>
      <DialogHeader>
        <DialogTitle>Review Export</DialogTitle>
        <DialogDescription>
          Preview your export and optionally save this mapping as a template.
        </DialogDescription>
      </DialogHeader>

      <div className="py-4 space-y-4">
        {/* Preview Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto max-h-[200px]">
            <table className="w-full text-sm table-fixed">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  {columnMappings.map((m) => (
                    <th
                      key={m.templateColumn}
                      title={m.templateColumn}
                      className={cn(
                        'px-3 py-2 text-left font-medium w-[120px] min-w-[100px]',
                        !m.dataField && 'text-muted-foreground'
                      )}
                    >
                      <div className="flex items-center gap-1">
                        <span className="truncate">{m.templateColumn}</span>
                        {!m.dataField && (
                          <Badge
                            variant="outline"
                            className="shrink-0 text-[10px] px-1 py-0"
                          >
                            Empty
                          </Badge>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {vehicles.slice(0, 3).map((vehicle) => (
                  <tr key={vehicle.vehicleId}>
                    {columnMappings.map((m) => (
                      <td
                        key={`${vehicle.vehicleId}-${m.templateColumn}`}
                        className={cn(
                          'px-3 py-2 truncate',
                          !m.dataField && 'text-muted-foreground'
                        )}
                      >
                        {m.dataField
                          ? getVehicleValue(vehicle, m.dataField, currency)
                          : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 bg-slate-50 border-t text-xs text-muted-foreground">
            Showing 3 of {vehicles.length} vehicles
          </div>
        </div>

        {/* Limitations Panel */}
        {mappingStats.unmapped.length > 0 && (
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Limitations
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  The following columns will be empty because we couldn&apos;t
                  match them to available data:
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {mappingStats.unmapped.map((m) => (
                    <Badge
                      key={m.templateColumn}
                      variant="outline"
                      className="bg-white"
                    >
                      {m.templateColumn}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Template */}
        <div className="flex items-end gap-3 p-3 bg-slate-50 rounded-lg">
          <div className="flex-1">
            <Label htmlFor="template-name" className="text-sm font-medium">
              Save as template
            </Label>
            <Input
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="My Custom Report Format"
              className="mt-1.5"
            />
          </div>
          <Button
            variant="outline"
            onClick={handleSaveTemplate}
            disabled={!templateName.trim()}
          >
            <Save className="h-4 w-4 mr-1.5" />
            Save
          </Button>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => setStep('mapping')}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back
        </Button>
        <Button onClick={handleExport} disabled={isExporting}>
          {isExporting ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-1.5" />
              Export CSV
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  );

  // Render Step 4: Export Complete
  const renderExportStep = () => (
    <>
      <DialogHeader>
        <DialogTitle>Export Complete</DialogTitle>
      </DialogHeader>

      <div className="py-6 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-emerald-600" />
        </div>

        <h3 className="text-lg font-semibold mb-2">Your export is ready!</h3>

        <div className="flex justify-center gap-6 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {vehicles.length}
            </p>
            <p className="text-xs text-muted-foreground">Vehicles</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{mappingStats.mapped.length}</p>
            <p className="text-xs text-muted-foreground">Columns</p>
          </div>
          {mappingStats.unmapped.length > 0 && (
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">
                {mappingStats.unmapped.length}
              </p>
              <p className="text-xs text-muted-foreground">Empty</p>
            </div>
          )}
        </div>

        {selectedTemplateId && (
          <p className="text-sm text-muted-foreground mt-4">
            Template &quot;{templateName}&quot; saved for future use.
          </p>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => setStep('review')}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Review
        </Button>
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
      <DialogContent className="sm:max-w-[600px]">
        {step === 'upload' && renderUploadStep()}
        {step === 'mapping' && renderMappingStep()}
        {step === 'review' && renderReviewStep()}
        {step === 'export' && renderExportStep()}
      </DialogContent>
    </Dialog>
  );
}
