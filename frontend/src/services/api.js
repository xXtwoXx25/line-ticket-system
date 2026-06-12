import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const createTicket = (data) => api.post('/tickets', data);
export const getTickets = () => api.get('/tickets');
export const updateTicketStatus = (id, status) => api.put(`/tickets/${id}/status`, { status });
export const deleteTicket = (id) => api.delete(`/tickets/${id}`);

export default api;
