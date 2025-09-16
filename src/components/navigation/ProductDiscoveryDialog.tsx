'use client';

import React from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Product {
  id: string;
  name: string;
  logo: string;
  description: string;
  category: string;
}

interface ProductDiscoveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const newProducts: Product[] = [
  {
    id: 'safely',
    name: 'Safely',
    logo: '/safelylogo.png',
    description: 'Turn raw telematics into safer driving and fewer incidents with vendor‑agnostic analytics, leaderboards, and behavior change workflows that coach drivers and build a safety culture without ripping and replacing your current stack.',
    category: 'Safety & Analytics',
  },
  {
    id: 'maintainly',
    name: 'Maintainly',
    logo: '/safelylogo.png', // Using safely logo as placeholder
    description: 'Keep vehicles compliant and on the road with maintenance workflows that tie daily checks and defects to service actions, with an AI‑assisted layer emerging to reduce admin and surface what needs attention next.',
    category: 'Maintenance & Compliance',
  },
  {
    id: 'bikly',
    name: 'Bikly',
    logo: '/transpoco-logo.svg', // Using transpoco logo as placeholder
    description: 'Simplify Benefit‑in‑Kind (BIK) compliance and communication for fleets and drivers by turning complex tax rules into clear calculations and guidance, helping organizations reduce admin overhead and policy friction.',
    category: 'Tax & Compliance',
  },
  {
    id: 'transpoco',
    name: 'Transpoco',
    logo: '/transpoco-logo.svg',
    description: 'Comprehensive fleet management platform providing real-time tracking, route optimization, and operational insights for modern fleet operations.',
    category: 'Fleet Management',
  },
];

export function ProductDiscoveryDialog({ open, onOpenChange }: ProductDiscoveryDialogProps) {
  const handleProductClick = (product: Product) => {
    console.log(`[Demo] Product clicked: ${product.name}`);
    // Here you would typically navigate to the product page or initiate setup
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Discover New Products</DialogTitle>
          <DialogDescription className="text-gray-600">
            Explore our latest products and integrations to enhance your fleet management experience.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-6">
          {newProducts.map((product) => {
            const isActivated = product.id === 'transpoco' || product.id === 'safely';

            return (
              <div
                key={product.id}
                onClick={() => handleProductClick(product)}
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer text-center flex flex-col h-full ${
                  isActivated
                    ? 'border-green-200 bg-green-50/50 hover:bg-green-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                {/* Logo at the top */}
                <div className="flex justify-center mb-2">
                  <Image
                    src={product.logo}
                    alt={`${product.name} logo`}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-contain"
                  />
                </div>

                {/* Product name and category */}
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {product.category}
                  </p>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed mb-3 flex-1">
                  {product.description}
                </p>

                {/* Action button */}
                <div className={`pt-2 mt-auto ${isActivated ? 'border-t border-green-200' : 'border-t border-gray-100'}`}>
                  <button className={`text-xs font-medium transition-colors ${
                    isActivated
                      ? 'text-green-700 hover:text-green-800'
                      : 'text-[#95B148] hover:text-[#7a9138]'
                  }`}>
                    {isActivated ? 'Activated ✓' : 'Learn More →'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            More products coming soon. Stay tuned for exciting updates!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}