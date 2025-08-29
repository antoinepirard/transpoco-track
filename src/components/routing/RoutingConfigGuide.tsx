'use client';

import { useState } from 'react';
import {
  CheckCircle,
  ArrowSquareOut,
  Copy,
  Eye,
  EyeClosed,
} from '@phosphor-icons/react';

interface RoutingConfigGuideProps {
  className?: string;
}

interface ConfigStep {
  id: string;
  title: string;
  description: string;
  envVar: string;
  placeholder: string;
  link?: string;
  linkText?: string;
  required: boolean;
}

const CONFIG_STEPS: ConfigStep[] = [
  {
    id: 'mapbox',
    title: 'Mapbox Access Token',
    description:
      'Primary routing provider for production-grade road mapping and traffic data.',
    envVar: 'NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN',
    placeholder:
      'pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbGV4YW1wbGUifQ.example',
    link: 'https://account.mapbox.com/access-tokens/',
    linkText: 'Get Mapbox Token',
    required: false,
  },
  {
    id: 'maptiler',
    title: 'MapTiler API Key',
    description: 'Required for base map rendering with vector tiles.',
    envVar: 'NEXT_PUBLIC_MAPTILER_API_KEY',
    placeholder: 'your_maptiler_api_key_here',
    link: 'https://cloud.maptiler.com/account/keys/',
    linkText: 'Get MapTiler Key',
    required: true,
  },
];

export function RoutingConfigGuide({
  className = '',
}: RoutingConfigGuideProps) {
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({});
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const toggleTokenVisibility = (stepId: string) => {
    setShowTokens((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const copyToClipboard = async (text: string, stepId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates((prev) => ({ ...prev, [stepId]: true }));
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [stepId]: false }));
      }, 2000);
    } catch (error) {
      console.warn('Failed to copy to clipboard:', error);
    }
  };

  const getCurrentValue = (envVar: string): string => {
    if (typeof window === 'undefined') return '';
    return (process.env as Record<string, string | undefined>)[envVar] || '';
  };

  const isConfigured = (envVar: string): boolean => {
    return !!getCurrentValue(envVar);
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">
          Routing Configuration
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Configure external routing services for enhanced fleet tracking
          accuracy.
        </p>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          {CONFIG_STEPS.map((step, index) => (
            <div key={step.id} className="flex gap-4">
              {/* Step indicator */}
              <div className="flex-shrink-0 flex flex-col items-center">
                <div
                  className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${
                    isConfigured(step.envVar)
                      ? 'bg-green-100 text-green-700'
                      : step.required
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-500'
                  }
                `}
                >
                  {isConfigured(step.envVar) ? (
                    <CheckCircle weight="fill" size={16} />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < CONFIG_STEPS.length - 1 && (
                  <div className="w-0.5 h-8 bg-gray-200 mt-2" />
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-medium text-gray-900">
                    {step.title}
                  </h3>
                  {step.required && (
                    <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded">
                      Required
                    </span>
                  )}
                  {isConfigured(step.envVar) && (
                    <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                      Configured
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-3">{step.description}</p>

                {/* Environment variable code block */}
                <div className="bg-gray-50 rounded-md p-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-xs font-mono text-gray-700">
                      {step.envVar}
                    </code>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `${step.envVar}=${step.placeholder}`,
                          step.id
                        )
                      }
                      className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      {copiedStates[step.id] ? (
                        <>
                          <CheckCircle size={12} /> Copied
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> Copy
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type={showTokens[step.id] ? 'text' : 'password'}
                      value={getCurrentValue(step.envVar) || step.placeholder}
                      readOnly
                      className="flex-1 text-xs font-mono bg-transparent border-none outline-none text-gray-600"
                    />
                    <button
                      onClick={() => toggleTokenVisibility(step.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showTokens[step.id] ? (
                        <EyeClosed size={14} />
                      ) : (
                        <Eye size={14} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Get token link */}
                {step.link && (
                  <a
                    href={step.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                  >
                    {step.linkText}
                    <ArrowSquareOut size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Setup instructions */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Setup Instructions
          </h4>
          <div className="space-y-2 text-xs text-blue-700">
            <div className="flex items-start gap-2">
              <span className="font-medium">1.</span>
              <span>
                Create a{' '}
                <code className="bg-blue-100 px-1 rounded">.env.local</code>{' '}
                file in your project root
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium">2.</span>
              <span>
                Add the environment variables above with your API keys
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium">3.</span>
              <span>Restart your development server to apply changes</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium">4.</span>
              <span>Check the routing status to verify configuration</span>
            </div>
          </div>
        </div>

        {/* Fallback notice */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Note:</strong> The application will automatically fall back
            to the local road network if external services are unavailable. This
            ensures your fleet tracking remains operational even without API
            keys.
          </p>
        </div>
      </div>
    </div>
  );
}

export default RoutingConfigGuide;
