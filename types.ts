export enum AppStage {
  INTENT = 'INTENT',
  BREAKDOWN_LOADING = 'BREAKDOWN_LOADING',
  ROUTE_PREVIEW = 'ROUTE_PREVIEW',
  EXECUTION = 'EXECUTION',
  SUMMARY = 'SUMMARY',
  REFLECTION = 'REFLECTION',
  ARCHIVE = 'ARCHIVE',
}

export enum StepType {
  PHYSICAL_RESET = 'PHYSICAL_RESET', // Move phone, clean desk
  PHYSIOLOGICAL_RESET = 'PHYSIOLOGICAL_RESET', // Breathe, stretch
  PHYSICAL_START = 'PHYSICAL_START', // Touch the tool
  ACTION = 'ACTION', // The actual work
}

export interface Step {
  id: string;
  instruction: string;
  type: StepType;
  completed: boolean;
  timeSpentSeconds: number; // Recorded actual time
  isEmergency?: boolean; // If generated via "Stuck" button
}

export interface Route {
  id: string;
  name: string; // The "Want to do" goal
  currentStatus: string; // The "Doing now" state
  steps: Step[];
  createdAt: number;
  completedAt?: number;
  reflection?: Reflection;
  totalTimeSeconds?: number;
  // xpEarned removed
}

export interface Reflection {
  focusScore: number; // 0-100
  moodScore: number; // 0-100
  energyScore: number; // 0-100
  selfTalk: string;
}

export interface BreakdownResponseItem {
  instruction: string;
  type: string;
}