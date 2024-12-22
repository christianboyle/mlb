'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TeamBasicInfo } from 'app/espn';
import { ChevronDown } from 'lucide-react';
import { useId, useEffect, useState, useDeferredValue } from 'react';

export default function TeamSelect({
  allTeams,
  teamId,
}: {
  allTeams: TeamBasicInfo[];
  teamId?: string;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const deferredMounted = useDeferredValue(mounted);
  const selectId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  const teamLogo = deferredMounted && teamId ? 
    allTeams.find(team => team.id === teamId)?.logo : null;

  function changeTeam(event: React.ChangeEvent<HTMLSelectElement>) {
    const selectedTeamId = event.target.value;
    if (selectedTeamId) {
      router.push(`/${selectedTeamId}`);
    } else {
      router.push('/');
    }
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {teamLogo && (
          <div className="w-6 h-6 flex-shrink-0">
            <Image
              src={teamLogo}
              alt="Team logo"
              width={24}
              height={24}
              className="w-full h-full"
              priority
            />
          </div>
        )}
        <div className="relative flex-grow">
          <select
            id={selectId}
            className="appearance-none w-full bg-white dark:bg-black text-gray-800 dark:text-gray-200 font-semibold px-3 py-2 pr-8 rounded-md border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-sans"
            value={deferredMounted ? (teamId || '') : ''}
            onChange={deferredMounted ? changeTeam : undefined}
            disabled={!deferredMounted}
            suppressHydrationWarning
          >
            <option value="">Select a team</option>
            {deferredMounted && allTeams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.displayName}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 flex items-center px-2 text-gray-700 dark:text-gray-300">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
