# MLB Stats

> Simple baseball scores and schedules.

## Overview

This site shows MLB scores, schedules, and division standings for all MLB teams.

## APIs

We use the ESPN API to fetch all baseball data:

```
https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/{teamId}/schedule
```

Parameters:
- `teamId`: ESPN's team ID
- `season`: Year (e.g., 2024)
- `seasontype`: 
  - 1: Spring Training
  - 2: Regular Season
  - 3: Postseason

## Stack

- JavaScript (Vanilla)
- Tailwind CSS for styling
- Vite for bundling and development
- GoatCounter for analytics

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```
