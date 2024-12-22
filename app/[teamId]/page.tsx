import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import { redirect } from 'next/navigation';
import { getAllTeamIds } from '../actions';
import { getTeamData, getConferenceRankings } from '../espn';
import TeamSelect from './select';
import { Scores } from '../components/Scores';
import { ScoresLoading } from '../components/ScoresLoading';
import SeasonSelect from '../components/SeasonSelect';
import Row from '../components/Row';
import { SortableScores } from '../components/SortableScores';

const CURRENT_SEASON = 2024;
const DISPLAY_YEAR = 2025;
const STANDINGS_YEAR = 2024;
const VALID_SEASONS = [2020, 2021, 2022, 2023, 2024, 2025] as const;
type Season = typeof VALID_SEASONS[number];

function RankingRow({
  color,
  gamesBack,
  index,
  isLast,
  logo,
  name,
  teamId,
}: any) {
  return (
    <div
      className={clsx(
        'flex flex-col min-[450px]:flex-row justify-between px-0 min-[450px]:px-4 py-2',
        { 'border-b border-gray-200 dark:border-gray-800': !isLast }
      )}
    >
      <div className="flex">
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
      <div className="flex flex-row-reverse justify-end min-[450px]:flex-row">
        <p className="text-gray-700 dark:text-gray-300 tabular-nums">
          {gamesBack}
        </p>
      </div>
    </div>
  );
}

interface PageProps {
  params: Promise<{
    teamId: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page(props: PageProps) {
  const { teamId } = await props.params;
  const searchParams = await props.searchParams;
  
  const parsedSeason = typeof searchParams?.season === 'string' 
    ? parseInt(searchParams.season) 
    : CURRENT_SEASON;

  const season: Season = VALID_SEASONS.includes(parsedSeason as Season) 
    ? parsedSeason as Season 
    : CURRENT_SEASON;

  if (teamId === 'favicon.ico' || teamId === 'default-team-logo.png') {
    redirect('/7');
  }

  try {
    const [team, allTeams, confRankings] = await Promise.all([
      getTeamData(teamId, season),
      getAllTeamIds(),
      getConferenceRankings(teamId, season),
    ]);

    return (
      <main className="grid md:grid-cols-2 lg:grid-cols-3">
        <section className="w-full mx-auto p-6 border-r border-gray-200 dark:border-gray-800">
          <div className="flex items-center mb-2">
            <Image
              src={team.logo}
              alt="Logo"
              priority
              width={24}
              height={24}
              className={clsx('h-6 w-6', {
                'dark:invert': team.color === '000000',
              })}
            />
            <h1 className="font-semibold text-2xl ml-2">{team.name}</h1>
          </div>
          <h3 className="text-gray-700 dark:text-gray-300 mb-4">
            {`${team.record} • ${team.standing}`}
          </h3>
          <div className="flex items-center gap-4 mb-6">
            <TeamSelect allTeams={allTeams} teamId={teamId} />
            <SeasonSelect season={season} teamId={teamId} />
          </div>
          <h2 className="font-semibold text-2xl mt-8 mb-4">Scores</h2>
          <SortableScores games={team.games} />
        </section>

        <section className="w-full mx-auto p-6 border-r border-gray-200 dark:border-gray-800">
          <h2 className="font-semibold text-2xl mb-4">Schedule • {DISPLAY_YEAR}</h2>
          <Suspense fallback={<ScoresLoading />}>
            <Scores year={DISPLAY_YEAR} teamId={teamId} />
          </Suspense>
        </section>

        <section className="w-full mx-auto p-6">
          <h2 className="font-semibold text-2xl mb-4">{team.standing.split(' in ')[1]} Standings</h2>
          <div className="mb-6">
            {confRankings.map((team) => (
              <div 
                key={team.teamId} 
                className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800 last:border-0"
              >
                <div className="flex items-center">
                  <img
                    src={team.logo}
                    alt={`${team.name} logo`}
                    className="w-6 h-6"
                  />
                  <span className="ml-2">{team.name}</span>
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {team.overallWinLoss}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  } catch (error) {
    console.error('Error loading team data:', error);
    return (
      <div className="p-4 text-center">
        <h1 className="text-xl text-red-500">
          Error loading team data. Please try again later.
        </h1>
      </div>
    );
  }
}
