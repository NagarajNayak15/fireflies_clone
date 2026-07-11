export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://fireflies-clone-1.onrender.com';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch (e) {
      // Ignore json parse error
    }
    throw new Error(errorMessage);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  getDashboardStats: () => fetchApi('/dashboard/stats'),
  getMeetings: () => fetchApi('/meetings'),
  getMeeting: (id: number) => fetchApi(`/meetings/${id}`),
  searchTranscript: (id: number, query: string) => fetchApi(`/meetings/${id}/search?q=${encodeURIComponent(query)}`),
  createMeeting: (formData: FormData) => fetchApi('/meetings', {
    method: 'POST',
    body: formData,
  }),
  deleteMeeting: (id: number) => fetchApi(`/meetings/${id}`, {
    method: 'DELETE',
  }),
  updateParticipants: (id: number, participants: string[]) => fetchApi(`/meetings/${id}/participants`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ participants }),
  }),
  updateActionItem: (id: number, completed: boolean) => fetchApi(`/action-items/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ completed }),
  }),
};
