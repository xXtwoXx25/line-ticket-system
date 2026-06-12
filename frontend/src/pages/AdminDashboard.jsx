import { useEffect, useState, useCallback } from 'react';
import { getTickets, updateTicketStatus, deleteTicket } from '../services/api';
import {
  Search, Filter, Trash2, Eye, MapPin, Calendar,
  CheckCircle2, Clock, Wrench, RefreshCw, X, AlertTriangle
} from 'lucide-react';

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [toastMsg, setToastMsg] = useState(null); // { type: 'success'|'error', text }
  const [deletingId, setDeletingId] = useState(null);

  // ── Toast helper ─────────────────────────────────────────────────────────────
  const showToast = (type, text) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3000);
  };

  // ── Fetch tickets ─────────────────────────────────────────────────────────────
  const fetchTickets = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await getTickets();
      setTickets(res.data.data || []);
    } catch (err) {
      console.error('[Dashboard] fetch error:', err);
      showToast('error', 'โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchTickets(true), 30000);
    return () => clearInterval(interval);
  }, [fetchTickets]);

  // ── Status change ─────────────────────────────────────────────────────────────
  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateTicketStatus(id, newStatus);
      setTickets(prev =>
        prev.map(t => t._id === id ? { ...t, status: newStatus } : t)
      );
      if (selectedTicket?._id === id) {
        setSelectedTicket(prev => ({ ...prev, status: newStatus }));
      }
      showToast('success', 'อัปเดตสถานะสำเร็จ');
    } catch (err) {
      console.error('[Dashboard] status update error:', err);
      showToast('error', 'อัปเดตสถานะไม่สำเร็จ');
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    setDeletingId(null); // close confirm modal
    try {
      await deleteTicket(id);
      setTickets(prev => prev.filter(t => t._id !== id));
      if (selectedTicket?._id === id) setSelectedTicket(null);
      showToast('success', 'ลบ Ticket สำเร็จ');
    } catch (err) {
      console.error('[Dashboard] delete error:', err);
      showToast('error', 'ลบ Ticket ไม่สำเร็จ');
    }
  };

  // ── Filter (safe null-check) ──────────────────────────────────────────────────
  const filteredTickets = tickets.filter(t => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (t.ticketNo || '').toLowerCase().includes(q) ||
      (t.branchName || '').toLowerCase().includes(q) ||
      (t.machineModel || '').toLowerCase().includes(q) ||
      (t.machineType || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ── Stats ─────────────────────────────────────────────────────────────────────
  const stats = {
    total: tickets.length,
    pending: tickets.filter(t => t.status === 'pending').length,
    assigned: tickets.filter(t => t.status === 'assigned').length,
    completed: tickets.filter(t => t.status === 'completed').length,
  };

  // ── Status badge ──────────────────────────────────────────────────────────────
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><Clock className="w-3 h-3" />รอดำเนินการ</span>;
      case 'assigned':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><Wrench className="w-3 h-3" />กำลังดำเนินการ</span>;
      case 'completed':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" />เสร็จสิ้น</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  // ── Loading screen ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── Toast Notification ── */}
      {toastMsg && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 transition-all
          ${toastMsg.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toastMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toastMsg.text}
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 text-center mb-2">ยืนยันการลบ</h3>
            <p className="text-gray-500 text-sm text-center mb-6">ต้องการลบ Ticket นี้? ไม่สามารถกู้คืนได้</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition font-medium text-sm"
              >ยกเลิก</button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="flex-1 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-medium text-sm"
              >ลบเลย</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-5">

        {/* ── Header ── */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">🎫 Installation Tickets</h1>
              <p className="text-gray-500 text-sm mt-0.5">จัดการและติดตามการติดตั้งเครื่อง</p>
            </div>
            <button
              onClick={() => fetchTickets(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-xl hover:bg-yellow-100 transition text-sm font-medium disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'กำลังโหลด...' : 'รีเฟรช'}
            </button>
          </div>

          {/* ── Stats Row ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {[
              { label: 'ทั้งหมด', value: stats.total, color: 'bg-gray-100 text-gray-700' },
              { label: 'รอดำเนินการ', value: stats.pending, color: 'bg-yellow-100 text-yellow-700' },
              { label: 'กำลังดำเนินการ', value: stats.assigned, color: 'bg-blue-100 text-blue-700' },
              { label: 'เสร็จสิ้น', value: stats.completed, color: 'bg-green-100 text-green-700' },
            ].map(s => (
              <div key={s.label} className={`${s.color} rounded-xl p-3 text-center`}>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Search & Filter ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหา Ticket, สาขา, รุ่นเครื่อง..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition text-sm"
            />
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition appearance-none text-sm"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="pending">รอดำเนินการ</option>
              <option value="assigned">กำลังดำเนินการ</option>
              <option value="completed">เสร็จสิ้น</option>
            </select>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex flex-col lg:flex-row gap-5">

          {/* Table */}
          <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1 ${selectedTicket ? 'hidden lg:block' : ''}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Ticket No.</th>
                    <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">สาขา</th>
                    <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">เครื่อง</th>
                    <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">วันที่</th>
                    <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">สถานะ</th>
                    <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider text-center">รายละเอียด</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map(ticket => (
                    <tr
                      key={ticket._id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`border-b border-gray-50 hover:bg-yellow-50/50 transition cursor-pointer ${selectedTicket?._id === ticket._id ? 'bg-yellow-50' : ''}`}
                    >
                      <td className="p-4 font-mono text-sm text-gray-800 font-semibold">{ticket.ticketNo}</td>
                      <td className="p-4 text-sm text-gray-700">{ticket.branchName}</td>
                      <td className="p-4 text-sm text-gray-600">{ticket.machineType}</td>
                      <td className="p-4 text-sm text-gray-500">
                        {ticket.installDate ? new Date(ticket.installDate).toLocaleDateString('th-TH') : '-'}
                      </td>
                      <td className="p-4">{getStatusBadge(ticket.status)}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedTicket(ticket); }}
                          className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-100 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredTickets.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-gray-400">
                        <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        ไม่พบ Ticket ที่ค้นหา
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail Sidebar */}
          {selectedTicket && (
            <div className="w-full lg:w-[340px] bg-white rounded-2xl shadow-xl border border-yellow-200 flex flex-col h-fit sticky top-4">
              {/* Sidebar Header */}
              <div className="p-5 bg-yellow-500 text-white flex justify-between items-start rounded-t-2xl">
                <div>
                  <p className="text-xs opacity-80 font-medium mb-0.5">Ticket Details</p>
                  <h2 className="text-lg font-mono font-bold">{selectedTicket.ticketNo}</h2>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-1.5 hover:bg-yellow-600 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sidebar Body */}
              <div className="p-5 space-y-5 flex-1 overflow-y-auto">
                {/* Status */}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-medium">สถานะปัจจุบัน</span>
                  {getStatusBadge(selectedTicket.status)}
                </div>

                {/* Requester */}
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">ผู้แจ้ง</p>
                  <p className="text-gray-800 font-medium text-sm">{selectedTicket.lineDisplayName || '-'}</p>
                </div>

                {/* Machine */}
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">เครื่อง</p>
                  <p className="text-gray-800 text-sm">{selectedTicket.machineType} — <span className="font-semibold">{selectedTicket.machineModel}</span></p>
                </div>

                {/* Location */}
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-2">สถานที่</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{selectedTicket.branchName}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{selectedTicket.address}</p>
                      {selectedTicket.googleMapUrl && (
                        <a
                          href={selectedTicket.googleMapUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-500 hover:underline mt-1 inline-block"
                        >📍 ดูใน Google Maps</a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-2">กำหนดการ</p>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      {selectedTicket.installDate
                        ? new Date(selectedTicket.installDate).toLocaleDateString('th-TH')
                        : '-'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-blue-400" />
                      {selectedTicket.installTime || '-'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {selectedTicket.description && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">หมายเหตุ</p>
                    <p className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">{selectedTicket.description}</p>
                  </div>
                )}
              </div>

              {/* Sidebar Footer */}
              <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1.5 font-medium">เปลี่ยนสถานะ</p>
                  <select
                    value={selectedTicket.status}
                    onChange={e => handleStatusChange(selectedTicket._id, e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition text-sm bg-white"
                  >
                    <option value="pending">รอดำเนินการ</option>
                    <option value="assigned">กำลังดำเนินการ</option>
                    <option value="completed">เสร็จสิ้น</option>
                  </select>
                </div>
                <button
                  onClick={() => setDeletingId(selectedTicket._id)}
                  className="w-full py-2.5 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 border border-red-100 rounded-xl transition font-medium text-sm"
                >
                  <Trash2 className="w-4 h-4" /> ลบ Ticket
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
