'use client';

import React from 'react';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CaretDownIcon,
  CheckIcon,
} from '@phosphor-icons/react';

interface BrandSwitcherProps {
  selectedBrand: 'transpoco' | 'safely';
  onBrandChange: (brand: 'transpoco' | 'safely') => void;
  variant?: 'light' | 'dark';
  onAddNewProduct?: () => void;
}

const brands = [
  {
    id: 'transpoco' as const,
    name: 'Transpoco',
    logo: '/transpoco-logo.svg',
    darkLogo: '/transpoco-logo.svg',
    description: 'Fleet Management',
  },
  {
    id: 'safely' as const,
    name: 'Safely',
    logo: '/safelylogo.png',
    darkLogo: '/Group-1707478422.png',
    description: 'Safety Solutions',
  },
];

export function BrandSwitcher({ selectedBrand, onBrandChange, variant = 'light', onAddNewProduct }: BrandSwitcherProps) {
  const currentBrand = brands.find(brand => brand.id === selectedBrand) || brands[0];

  const handleBrandSelect = (brandId: 'transpoco' | 'safely') => {
    onBrandChange(brandId);
    console.log(`[Demo] Switched to ${brandId}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={`flex items-center space-x-2 rounded-md p-1 transition-colors outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
        variant === 'dark'
          ? 'hover:hover-only:bg-gray-300/20'
          : 'hover:hover-only:bg-gray-100'
      }`}>
        <Image
          src={variant === 'dark' ? currentBrand.darkLogo : currentBrand.logo}
          alt={`${currentBrand.name} logo`}
          width={111}
          height={26}
          className={`h-7 w-auto ${
            variant === 'dark' && currentBrand.id === 'transpoco'
              ? 'brightness-0 invert'
              : ''
          }`}
        />
        <CaretDownIcon className="h-4 w-4 text-gray-300 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        side="bottom"
        className="w-74"
        collisionPadding={10}
      >
        {brands.map((brand) => (
          <DropdownMenuItem
            key={brand.id}
            className="flex items-center justify-between cursor-pointer p-3"
            onClick={() => handleBrandSelect(brand.id)}
          >
            <div className="flex items-center space-x-6">
              <Image
                src={brand.logo}
                alt={`${brand.name} logo`}
                width={80}
                height={20}
                className="h-5 w-20"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">{brand.name}</div>
                <div className="text-xs text-gray-500">{brand.description}</div>
              </div>
            </div>
            {selectedBrand === brand.id && (
              <CheckIcon className="h-4 w-4 text-blue-600" />
            )}
          </DropdownMenuItem>
        ))}

        {onAddNewProduct && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center justify-center cursor-pointer p-3 text-[#95B148] hover:text-[#7a9138] hover:bg-gray-50"
              onClick={onAddNewProduct}
            >
              <div className="text-sm font-medium">
                + Add new product
              </div>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}