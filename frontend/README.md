# Fireflies Clone - Frontend

This is the Next.js frontend for the Fireflies.ai clone. It provides a beautiful, modern UI that interacts with the FastAPI backend.

## Features Built
- **Meetings Dashboard**: View statistics and recently uploaded meetings.
- **Meeting Upload**: Supports uploading `.txt` transcripts or pasting text directly.
- **Interactive Transcript Player**: Clicking a transcript line seeks the audio player, and as the audio plays, the current transcript line is highlighted!
- **AI Summary & Action Items**: Easily view the AI-generated meeting artifacts and check off action items.
- **Search**: Fully functional full-text search across the transcript, with easy next/prev jumping.
- **Dark Mode Support**: Uses Tailwind's `dark:x` classes and system preferences.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file at the root of the `frontend` folder with the following content:
   ```env
   NEXT_PUBLIC_API_URL=https://fireflies-clone-1.onrender.com
   ```
   *(Note: This is already created for you in this workspace.)*

3. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Backend Gaps & Notes
- The "Edit Meeting" requirement mentioned editing title/date, but the backend only exposes `PUT /meetings/{id}/participants`. Therefore, the UI only supports editing participants.
- The deployed Render backend is on a free tier, meaning it sleeps after inactivity. The "Upload Meeting" and initial dashboard fetch may take up to a minute if the server is asleep. The UI handles this gracefully by displaying loading spinners and informative toast messages.
- The media player uses a generic placeholder audio track since the backend doesn't store/serve the actual audio files.

## Folder Structure
- `src/app`: Next.js App Router pages (`/`, `/meetings/[id]`, `/settings`).
- `src/components`: Reusable UI components (`Sidebar`, `TopNav`, `CreateMeetingModal`, `DeleteConfirmModal`).
- `src/lib`: Utility functions, including `api.ts` which handles all communication with the FastAPI backend.
