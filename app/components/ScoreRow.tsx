import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import { HomeIcon, MapPinIcon } from 'lucide-react';

interface ScoreRowProps {
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
}

export default function ScoreRow({
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
}: ScoreRowProps) {
  const displayScore = homeScore !== null && awayScore !== null 
    ? `${awayScore}-${homeScore}` 
    : '';

  const gameDate = new Date(date);
  const formattedDate = gameDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  return (
    <div
      className={clsx(
        'flex flex-col min-[450px]:flex-row justify-between px-0 min-[450px]:px-4 py-2',
        {
          'border-b border-gray-200 dark:border-gray-800': !isLast,
          'bg-amber-50 dark:bg-amber-950/20': isPostseason
        }
      )}
    >
      <div className="flex items-center">
        <div className="w-14 text-sm text-gray-600 dark:text-gray-400">
          {formattedDate}
        </div>
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
        <div className="ml-2 text-gray-500 dark:text-gray-400">
          {isHome ? (
            <HomeIcon className="h-4 w-4" />
          ) : (
            <MapPinIcon className="h-4 w-4" />
          )}
        </div>
      </div>
      <div className="flex flex-row-reverse justify-end min-[450px]:flex-row">
        <p className="text-gray-700 dark:text-gray-300 tabular-nums">
          {displayScore}
        </p>
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