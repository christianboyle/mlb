import { AL_CENTRAL_TEAMS } from './espn';
import DynamicTeamSelect from './components/client/DynamicTeamSelect';

export default function Page() {
  return (
    <main className="grid md:grid-cols-2 lg:grid-cols-3">
      <section className="w-full mx-auto p-6 border-r border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold text-2xl mb-4">Team Stats</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Select a team to view their stats
        </p>
        <div className="max-w-xs">
          <DynamicTeamSelect 
            allTeams={AL_CENTRAL_TEAMS} 
          />
        </div>
      </section>

      <section className="w-full mx-auto p-6 border-r border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold text-2xl mb-4">Schedule</h2>
        <div className="text-gray-600 dark:text-gray-400">
          Select a team to view their schedule
        </div>
      </section>

      <section className="w-full mx-auto p-6">
        <h2 className="font-semibold text-2xl mb-4">Division Standings</h2>
        <div className="text-gray-600 dark:text-gray-400">
          Select a team to view division standings
        </div>
      </section>
    </main>
  );
}
