import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import { HomeIcon, MapPinIcon } from 'lucide-react';

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
}: RowProps) {
  const gameDate = new Date(date);
  const formattedDate = gameDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  const displayScore = status === 'Postponed' 
    ? 'POSTPONED'
    : homeScore !== null && awayScore !== null 
      ? isHome 
        ? `${homeScore}-${awayScore}` 
        : `${awayScore}-${homeScore}`
      : formattedDate;

  return (
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
              <HomeIcon className="h-4 w-4" />
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
  );
} 