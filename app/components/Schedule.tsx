'use client';

import { useState } from 'react';
import { getTodaySchedule } from '../espn';
import Row from './Row';
import SortButton from './SortButton';
import clsx from 'clsx';
import { Eye, EyeOff } from 'lucide-react';
import useSWR from 'swr';

type SortDirection = 'asc' | 'desc';

export function Schedule({ teamId = '7' }) {
  const { data, error, isLoading } = useSWR(
    [`/api/schedule`, 2025, teamId],
    () => getTodaySchedule(2025, teamId, true)
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showSpringTraining, setShowSpringTraining] = useState(true);

  if (error) return <div>Error loading schedule</div>;
  if (isLoading) return <div>Loading...</div>;
  if (!data?.events) return null;

  const filteredGames = showSpringTraining 
    ? data.events 
    : data.events.filter(game => !game.isSpringTraining);

  const sortedGames = [...filteredGames].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => setShowSpringTraining(prev => !prev)}
          className={clsx(
            'text-sm px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2',
            {
              'text-gray-900 dark:text-gray-100': showSpringTraining,
              'text-gray-500 dark:text-gray-400': !showSpringTraining
            }
          )}
        >
          Spring Training
          {showSpringTraining ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </button>
        <SortButton
          onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
          isActive={true}
          label="Date"
        />
      </div>
      {sortedGames.map((game, index) => (
        <Row
          key={game.id}
          index={index}
          isLast={index === sortedGames.length - 1}
          {...game}
        />
      ))}
    </div>
  );
} 