import { useEffect, useState } from 'react';
import { getTickets, updateTicketStatus, deleteTicket } from '../services/api';
import { Search, Filter, Trash2, Eye, MapPin, Calendar, CheckCircle2, Clock, Wrench } from 'lucide-react';

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = async () => {
    try {
      const res = await getTickets();
      setTickets(res.data.data);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateTicketStatus(id, newStatus);
      fetchTickets();
      if (selectedTicket && selectedTicket._id === id) {
        setSelectedTicket(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await deleteTicket(id);
        fetchTickets();
        if (selectedTicket && selectedTicket._id === id) {
          setSelectedTicket(null);
        }
      } catch (err) {
        console.error(err);
        alert('Failed to delete ticket');
      }
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.ticketNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.machineModel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold flex items-center gap-1"><Clock className="w-3 h-3"/> Pending</span>;
      case 'assigned': return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold flex items-center gap-1"><Wrench className="w-3 h-3"/> Assigned</span>;
      case 'completed': return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Completed</span>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Installation Tickets</h1>
            <p className="text-gray-500 text-sm">Manage and track machine installations</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search tickets..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
              />
            </div>
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select 
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition appearance-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Table List */}
          <div className={`flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${selectedTicket ? 'hidden lg:block lg:w-2/3' : 'w-full'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 font-semibold text-gray-600 text-sm">Ticket No.</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Branch</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Machine</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Date</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map(ticket => (
                    <tr 
                      key={ticket._id} 
                      className={`border-b border-gray-50 hover:bg-yellow-50/50 transition cursor-pointer ${selectedTicket?._id === ticket._id ? 'bg-yellow-50' : ''}`}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <td className="p-4 font-mono text-sm text-gray-800 font-medium">{ticket.ticketNo}</td>
                      <td className="p-4 text-sm text-gray-700">{ticket.branchName}</td>
                      <td className="p-4 text-sm text-gray-700">{ticket.machineType}</td>
                      <td className="p-4 text-sm text-gray-500">{new Date(ticket.installDate).toLocaleDateString()}</td>
                      <td className="p-4">{getStatusBadge(ticket.status)}</td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedTicket(ticket); }}
                          className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-100 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredTickets.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-500">No tickets found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail View Sidebar */}
          {selectedTicket && (
            <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-xl border border-yellow-200 overflow-hidden flex flex-col h-fit sticky top-6">
              <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-yellow-500 text-white">
                <div>
                  <p className="text-sm opacity-90 mb-1">Ticket Details</p>
                  <h2 className="text-xl font-mono font-bold">{selectedTicket.ticketNo}</h2>
                </div>
                <button 
                  onClick={() => setSelectedTicket(null)}
                  className="p-1 hover:bg-yellow-600 rounded-md transition"
                >
                  &times;
                </button>
              </div>

              <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Current Status</span>
                  {getStatusBadge(selectedTicket.status)}
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">Requester</p>
                    <p className="text-gray-800 font-medium">{selectedTicket.lineDisplayName}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">Machine</p>
                    <p className="text-gray-800">{selectedTicket.machineType} - <span className="font-medium">{selectedTicket.machineModel}</span></p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">Location</p>
                    <div className="flex items-start gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-800">{selectedTicket.branchName}</p>
                        <p className="text-sm text-gray-600 mt-1">{selectedTicket.address}</p>
                        <a href={selectedTicket.googleMapUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline mt-1 inline-block">View on Google Maps</a>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">Schedule</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-800">{new Date(selectedTicket.installDate).toLocaleDateString()}</span>
                      <Clock className="w-4 h-4 text-blue-400 ml-2" />
                      <span className="text-gray-800">{selectedTicket.installTime}</span>
                    </div>
                  </div>

                  {selectedTicket.description && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">Description</p>
                      <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                        {selectedTicket.description}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-4">
                <div className="flex gap-2">
                  <select 
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(selectedTicket._id, e.target.value)}
                    className="flex-1 p-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                  >
                    <option value="pending">Set Pending</option>
                    <option value="assigned">Set Assigned</option>
                    <option value="completed">Set Completed</option>
                  </select>
                </div>
                
                <button 
                  onClick={() => handleDelete(selectedTicket._id)}
                  className="w-full py-2 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 rounded-xl transition font-medium"
                >
                  <Trash2 className="w-4 h-4" /> Delete Ticket
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
