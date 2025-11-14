'use client';

import { useParams, useRouter } from 'next/navigation';
import { X, CheckCircle2, Lock } from 'lucide-react';
import Image from 'next/image';
import { getLockedFeature, isValidFeatureId } from '@/config/lockedFeatures';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function FeatureDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const featureId = params.featureId as string;

  // Get feature data
  const feature = getLockedFeature(featureId);

  // Handle navigation back - fallback to home if no history
  const handleClose = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      router.back();
    } else {
      // Fallback to home page if no history (e.g., direct link)
      router.replace('/');
    }
  };

  // Handle invalid feature ID
  if (!isValidFeatureId(featureId) || !feature) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="fixed right-6 top-20 z-50 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <Lock className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h1 className="mb-2 text-2xl font-semibold text-gray-900">
            Feature Not Found
          </h1>
          <p className="mb-6 text-gray-600">
            The feature you're looking for doesn't exist or is not available.
          </p>
          <Button onClick={handleClose} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const handleRequestDemo = () => {
    console.log(`[Demo] Request demo for feature: ${feature.title}`);
    // TODO: Implement actual demo request functionality
    // Could open a form modal, redirect to external URL, or send to sales team
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Close Button - Fixed Top Right */}
      <button
        onClick={handleClose}
        className="fixed right-6 top-20 z-50 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Main Content */}
      <div className="mx-auto max-w-3xl px-6 py-12 pb-16">
        {/* Hero Section */}
        <div className="mb-8">
          {/* Category Badge */}
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
              <Lock className="h-3 w-3" />
              {feature.category}
            </span>
            {feature.comingSoon && (
              <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                Coming Soon
              </span>
            )}
          </div>

          {/* Tagline */}
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {feature.tagline}
          </h1>

          {/* Title */}
          <p className="mb-4 text-lg font-medium text-gray-700">
            {feature.title}
          </p>

          {/* Image - Smaller and more condensed */}
          <div className="relative mb-4 overflow-hidden rounded-lg">
            <div className="relative aspect-[16/7] w-full overflow-hidden bg-gray-100">
              {feature.image ? (
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <Lock className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-base leading-relaxed text-gray-600">
            {feature.longDescription || feature.description}
          </p>
        </div>

        {/* CTA Banner - Top */}
        <div className="mb-8 overflow-hidden rounded-lg border border-blue-200 bg-gradient-to-r from-blue-600 to-blue-500 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">
                Ready to unlock {feature.title}?
              </p>
              <p className="text-xs text-blue-50">
                See how it transforms your fleet operations
              </p>
            </div>
            <Button
              onClick={handleRequestDemo}
              size="sm"
              className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            >
              Request Demo
            </Button>
          </div>
        </div>

        {/* Value Propositions - Show only first 4 */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Key Features
          </h2>
          <div className="space-y-3">
            {feature.valueProps.slice(0, 4).map((prop) => (
              <div
                key={prop.id}
                className="rounded-lg border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-blue-200 hover:shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 pt-0.5">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 text-sm font-semibold text-gray-900">
                      {prop.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-600">
                      {prop.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action - Bottom */}
        <div className="overflow-hidden rounded-xl border-2 border-blue-600 bg-gradient-to-br from-blue-50 via-white to-blue-50 p-8 text-center shadow-lg">
          <div className="mx-auto max-w-md">
            <div className="mb-3 inline-flex rounded-full bg-blue-100 px-3 py-1">
              <span className="text-xs font-semibold text-blue-700">
                Premium Feature
              </span>
            </div>
            <h2 className="mb-3 text-2xl font-bold text-gray-900">
              Transform your fleet operations
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-gray-600">
              Join leading fleet operators who trust Transpoco to optimize their
              operations and reduce costs
            </p>
            <Button
              onClick={handleRequestDemo}
              size="lg"
              className="bg-blue-600 px-8 py-6 text-base font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg"
            >
              Request Demo
            </Button>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-500">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              Response within 24 hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
