'use client';

import dynamic from 'next/dynamic';
import { TeamBasicInfo } from 'app/espn';

const TeamSelect = dynamic(
  () => import('./TeamSelect'),
  {
    ssr: false,
    loading: () => (
      <div className="relative">
        <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
      </div>
    ),
  }
);

export default function DynamicTeamSelect({
  allTeams,
  teamId,
}: {
  allTeams: TeamBasicInfo[];
  teamId?: string;
}) {
  return <TeamSelect allTeams={allTeams} teamId={teamId} />;
} 