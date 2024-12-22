'use client';

import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

export default function SeasonSelect({
  season,
  teamId,
}: {
  season: number;
  teamId: string;
}) {
  const router = useRouter();

  function changeSeason(event: React.ChangeEvent<HTMLSelectElement>) {
    const newSeason = event.target.value;
    router.push(`/${teamId}?season=${newSeason}`);
  }

  return (
    <div className="relative inline-block">
      <select
        className="appearance-none bg-white dark:bg-black text-gray-800 dark:text-gray-200 font-semibold px-3 py-1 pr-8 rounded-md border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
        value={season}
        onChange={changeSeason}
      >
        {[2024, 2023, 2022, 2021, 2020].map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
        <ChevronDown className="h-3 w-3" />
      </div>
    </div>
  );
} 