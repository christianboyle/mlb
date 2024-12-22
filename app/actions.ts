'use server';

import { AL_CENTRAL_TEAMS, type TeamBasicInfo } from './espn';

export async function getAllTeamIds(): Promise<TeamBasicInfo[]> {
  return AL_CENTRAL_TEAMS;
} 