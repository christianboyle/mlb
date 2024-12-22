export async function getScores() {
  const res = await fetch(
    'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard'
  );

  if (!res.ok) {
    throw new Error('Failed to fetch scores');
  }

  return res.json();
} 