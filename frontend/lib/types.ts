// TypeScript types matching the backend Pydantic response shapes exactly.

export interface Participant {
  id: number;
  name: string;
}

export interface TranscriptLine {
  id: number;
  speaker: string;
  timestamp_seconds: number;
  transcript_text: string;
}

export interface Summary {
  id: number;
  content: string;
}

export interface Topic {
  id: number;
  title: string;
  timestamp_seconds?: number | null;
}

export interface ActionItem {
  id: number;
  task: string;
  owner?: string | null;
  deadline?: string | null;
  completed: boolean;
}

// List view (GET /meetings)
export interface MeetingList {
  id: number;
  title: string;
  meeting_date?: string | null;
  duration_seconds?: number | null;
}

// Detail view (GET /meetings/{id})
export interface MeetingDetail extends MeetingList {
  participants: Participant[];
  transcripts: TranscriptLine[];
  summary: Summary | null;
  topics: Topic[];
  action_items: ActionItem[];
}

export interface DashboardStats {
  total_meetings: number;
  total_participants: number;
  total_action_items: number;
  completed_action_items: number;
}
