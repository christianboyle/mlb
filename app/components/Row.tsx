'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import { HomeIcon, MapPinIcon, X } from 'lucide-react';
import type { Promotion } from '../espn';

interface RowProps {
  awayScore: string | null;
  color: string;
  date: string;
  homeScore: string | null;
  index: number;
  isLast: boolean;
  logo: string;
  name: string;
  teamId: string;
  winner: boolean | null;
  isPostseason: boolean;
  isHome: boolean;
  showDate?: boolean;
  status?: string;
  isSpringTraining?: boolean;
  promotions?: Promotion[];
}

export default function Row({
  awayScore,
  color,
  date,
  homeScore,
  index,
  isLast,
  logo,
  name,
  teamId,
  winner,
  isPostseason,
  isHome,
  showDate = false,
  status = '',
  isSpringTraining = false,
  promotions,
}: RowProps) {
  const [showPromotions, setShowPromotions] = useState(false);

  const gameDate = new Date(date);
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  }).format(gameDate);

  const displayScore = status === 'Postponed' 
    ? 'POSTPONED'
    : homeScore !== null && awayScore !== null 
      ? isHome 
        ? `${homeScore}-${awayScore}` 
        : `${awayScore}-${homeScore}`
      : formattedDate;

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setShowPromotions(false);
      }
    }

    if (showPromotions) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showPromotions]);

  function handleClickOutside(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      setShowPromotions(false);
    }
  }

  return (
    <div className="relative">
      <div
        className={clsx(
          'flex flex-col min-[450px]:flex-row justify-between px-0 min-[450px]:px-4 py-2',
          {
            'border-b border-gray-200 dark:border-gray-800': !isLast,
            'bg-green-50/30 dark:bg-green-900/20': isPostseason,
            'bg-yellow-50/30 dark:bg-yellow-900/20': isSpringTraining
          }
        )}
      >
        <div className="flex items-center">
          {showDate && (
            <div className="w-14 text-sm text-gray-600 dark:text-gray-400">
              {formattedDate}
            </div>
          )}
          <Image
            src={logo}
            alt={name}
            priority={index < 10}
            width={20}
            height={20}
            className={clsx('h-5 w-5', {
              'dark:invert': color === '000000',
            })}
          />
          <Link href={`/${teamId}`} className="font-semibold ml-4">
            {name}
          </Link>
        </div>
        <div className="flex flex-row-reverse justify-end min-[450px]:flex-row items-center">
          <p className={clsx(
            'text-gray-700 dark:text-gray-300 tabular-nums',
            { 'text-amber-600 dark:text-amber-400': status === 'Postponed' }
          )}>
            {displayScore}
          </p>
          {!showDate && status !== 'Postponed' && (
            <div className="ml-2 text-gray-500 dark:text-gray-400">
              {isHome ? (
                <button
                  onClick={() => promotions?.length && setShowPromotions(true)}
                  className={clsx(
                    'focus:outline-none transition-colors',
                    {
                      'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300': promotions?.length,
                      'cursor-default': !promotions?.length
                    }
                  )}
                >
                  <HomeIcon className="h-4 w-4" />
                </button>
              ) : (
                <MapPinIcon className="h-4 w-4" />
              )}
            </div>
          )}
          {homeScore !== null && awayScore !== null && winner !== null && (
            <p 
              className={clsx(
                'font-semibold ml-0 min-[450px]:ml-2 w-5 mr-4 min-[450px]:mr-0 text-center',
                {
                  'text-green-700 dark:text-green-500': winner,
                  'text-red-700 dark:text-red-500': !winner
                }
              )}
            >
              {winner ? 'W' : 'L'}
            </p>
          )}
        </div>
      </div>

      {/* Promotions Popover */}
      {showPromotions && promotions?.length && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={handleClickOutside}
        >
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowPromotions(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="text-lg font-semibold mb-4">Game Promotions</h3>
            
            <div className="space-y-4">
              {promotions.map((promo, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-800 last:border-0 pb-4 last:pb-0">
                  <h4 className="font-medium text-green-600 dark:text-green-400">
                    {promo.name}
                  </h4>
                  {promo.imageUrl && (
                    <div className="relative h-[200px]">
                      <Image
                        src={promo.imageUrl}
                        alt={promo.name}
                        fill
                        className="object-cover rounded"
                        sizes="(max-width: 768px) 100vw, 300px"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {promo.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 