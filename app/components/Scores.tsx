'use client';

import { useState, useEffect } from 'react';
import { getTodaySchedule, CURRENT_SEASON } from '../espn';
import Row from './Row';
import SortButton from './SortButton';
import clsx from 'clsx';
import { Eye, EyeOff } from 'lucide-react';

type SortDirection = 'asc' | 'desc';

export function Scores({ year = 2025, teamId = '7' }) {
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showSpringTraining, setShowSpringTraining] = useState(true);
  const [games, setGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGames() {
      try {
        if (year <= CURRENT_SEASON) {
          setGames([]);
          return;
        }

        const schedule = await getTodaySchedule(year, teamId, true);
        setGames(schedule.events);
      } catch (err) {
        console.error('Error in Scores component:', err);
        setError('Error loading schedule');
      } finally {
        setIsLoading(false);
      }
    }

    fetchGames();
  }, [year, teamId]);

  if (error) return <div>{error}</div>;
  if (isLoading) return <div>Loading...</div>;
  if (year <= CURRENT_SEASON) return null;

  const filteredGames = showSpringTraining 
    ? games 
    : games.filter(game => !game.isSpringTraining);

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