import { useEffect, useState } from 'react';
import liff from '@line/liff';
import { createTicket } from '../services/api';
import { CheckCircle2, AlertCircle, MapPin, Calendar, Clock, PenTool } from 'lucide-react';

const MACHINE_TYPES = ['Quick Wash', 'Wash & Go'];
const MACHINE_MODELS = {
  'Quick Wash': ['Quick Wash A', 'Quick Wash B', 'Quick Wash C'],
  'Wash & Go': ['Wash & Go A', 'Wash & Go B', 'Wash & Go C']
};

export default function LiffForm() {
  const [profile, setProfile] = useState(null);
  const [groupId, setGroupId] = useState('');
  const [isLiffReady, setIsLiffReady] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketNo, setTicketNo] = useState('');

  const [formData, setFormData] = useState({
    machineType: '',
    machineModel: '',
    branchName: '',
    address: '',
    googleMapUrl: '',
    installDate: '',
    installTime: '',
    description: ''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({
          liffId: import.meta.env.VITE_LIFF_ID,
          // withLoginOnExternalBrowser: true  ← uncomment if opening in regular browser
        });

        console.log('[LIFF] isLoggedIn:', liff.isLoggedIn());
        console.log('[LIFF] isInClient:', liff.isInClient());

        if (!liff.isLoggedIn()) {
          // Redirect back to this exact page after login (preserves query params)
          liff.login({ redirectUri: window.location.href });
          return; // stop here — browser will redirect
        }

        // ── Logged in: get profile ───────────────────────────────────────────
        const userProfile = await liff.getProfile();
        console.log('[LIFF] Profile:', userProfile.displayName);
        setProfile(userProfile);

        // ── Get groupId from LIFF context or URL param ───────────────────────
        const context = liff.getContext();
        console.log('[LIFF] Context type:', context?.type);

        if (context?.groupId) {
          setGroupId(context.groupId);
        } else {
          const params = new URLSearchParams(window.location.search);
          const gId = params.get('groupId');
          if (gId) setGroupId(gId);
        }

        setIsLiffReady(true);
      } catch (err) {
        console.error('[LIFF] init failed:', err);
        setError(`ไม่สามารถเชื่อมต่อ LINE ได้: ${err.message || 'กรุณาลองใหม่อีกครั้ง'}`);
      }
    };

    initLiff();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.machineType) newErrors.machineType = 'กรุณาเลือกประเภทเครื่อง';
    if (!formData.machineModel) newErrors.machineModel = 'กรุณาเลือกรุ่นเครื่อง';
    if (!formData.branchName) newErrors.branchName = 'กรุณากรอกชื่อสาขา';
    if (!formData.address) newErrors.address = 'กรุณากรอกที่อยู่';
    if (!formData.googleMapUrl) newErrors.googleMapUrl = 'กรุณากรอก Google Maps URL';
    if (!formData.installDate) newErrors.installDate = 'กรุณาเลือกวันที่ติดตั้ง';
    if (!formData.installTime) newErrors.installTime = 'กรุณาเลือกเวลาติดตั้ง';

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'machineType' && { machineModel: '' })
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        lineUserId: profile.userId,
        lineDisplayName: profile.displayName,
        groupId: groupId
      };

      const res = await createTicket(payload);
      setTicketNo(res.data.data.ticketNo);
      setIsSuccess(true);
    } catch (err) {
      console.error('[SUBMIT] Error:', err);
      setError('เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (liff.isInClient()) {
      liff.closeWindow();
    } else {
      window.close();
    }
  };

  // ── Error screen ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={handleClose} className="w-full py-3 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition">
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    );
  }

  // ── Success screen ───────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">เปิด Ticket สำเร็จ</h2>
          <p className="text-gray-600 mb-6">ระบบได้บันทึกข้อมูลและแจ้งเตือนไปยังกลุ่มไลน์แล้ว</p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-yellow-800 mb-1">หมายเลข Ticket ของคุณ</p>
            <p className="text-xl font-mono font-bold text-yellow-600">{ticketNo}</p>
          </div>

          <button onClick={handleClose} className="w-full py-3 bg-yellow-500 text-white rounded-xl font-medium hover:bg-yellow-600 transition shadow-lg shadow-yellow-200">
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    );
  }

  // ── Loading screen ───────────────────────────────────────────────────────────
  if (!isLiffReady || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  // ── Main form ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-yellow-500 pt-10 pb-16 px-6 rounded-b-[40px] shadow-sm">
        <div className="flex items-center gap-4 mb-2">
          <img src={profile.pictureUrl} alt="profile" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
          <div className="text-white">
            <p className="text-sm opacity-90">ผู้แจ้งงาน</p>
            <p className="font-bold text-lg">{profile.displayName}</p>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mt-4">ฟอร์มเปิด Ticket</h1>
        <p className="text-yellow-100">แจ้งติดตั้งเครื่องใหม่</p>
      </div>

      {/* Form Card */}
      <div className="px-4 -mt-10">
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Machine Info */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                <PenTool className="w-5 h-5 text-yellow-500" /> ข้อมูลเครื่อง
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทเครื่อง *</label>
                <select
                  name="machineType"
                  value={formData.machineType}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-xl border ${formErrors.machineType ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-yellow-200'} focus:outline-none focus:ring-2 transition`}
                >
                  <option value="">เลือกประเภท</option>
                  {MACHINE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {formErrors.machineType && <p className="text-red-500 text-xs mt-1">{formErrors.machineType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">รุ่นเครื่อง *</label>
                <select
                  name="machineModel"
                  value={formData.machineModel}
                  onChange={handleChange}
                  disabled={!formData.machineType}
                  className={`w-full p-3 rounded-xl border ${formErrors.machineModel ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-yellow-200'} focus:outline-none focus:ring-2 transition disabled:bg-gray-100 disabled:text-gray-400`}
                >
                  <option value="">เลือกรุ่น</option>
                  {formData.machineType && MACHINE_MODELS[formData.machineType].map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
                {formErrors.machineModel && <p className="text-red-500 text-xs mt-1">{formErrors.machineModel}</p>}
              </div>
            </div>

            {/* Location Info */}
            <div className="space-y-4 pt-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                <MapPin className="w-5 h-5 text-yellow-500" /> ข้อมูลสถานที่
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสาขา *</label>
                <input
                  type="text"
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleChange}
                  placeholder="เช่น สาขาเอกมัย"
                  className={`w-full p-3 rounded-xl border ${formErrors.branchName ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-yellow-200 focus:outline-none transition`}
                />
                {formErrors.branchName && <p className="text-red-500 text-xs mt-1">{formErrors.branchName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่ *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="รายละเอียดที่อยู่..."
                  rows="2"
                  className={`w-full p-3 rounded-xl border ${formErrors.address ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-yellow-200 focus:outline-none transition`}
                ></textarea>
                {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps URL *</label>
                <input
                  type="url"
                  name="googleMapUrl"
                  value={formData.googleMapUrl}
                  onChange={handleChange}
                  placeholder="https://maps.app.goo.gl/..."
                  className={`w-full p-3 rounded-xl border ${formErrors.googleMapUrl ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-yellow-200 focus:outline-none transition`}
                />
                {formErrors.googleMapUrl && <p className="text-red-500 text-xs mt-1">{formErrors.googleMapUrl}</p>}
              </div>
            </div>

            {/* Schedule Info */}
            <div className="space-y-4 pt-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                <Calendar className="w-5 h-5 text-yellow-500" /> กำหนดการ
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">วันที่ติดตั้ง *</label>
                  <input
                    type="date"
                    name="installDate"
                    value={formData.installDate}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-xl border ${formErrors.installDate ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-yellow-200 focus:outline-none transition`}
                  />
                  {formErrors.installDate && <p className="text-red-500 text-xs mt-1">{formErrors.installDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เวลา *</label>
                  <input
                    type="time"
                    name="installTime"
                    value={formData.installTime}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-xl border ${formErrors.installTime ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-yellow-200 focus:outline-none transition`}
                  />
                  {formErrors.installTime && <p className="text-red-500 text-xs mt-1">{formErrors.installTime}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดเพิ่มเติม</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="เช่น จุดสังเกต ข้อควรระวัง..."
                  rows="2"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition"
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 mt-6 bg-yellow-500 text-white rounded-xl font-bold text-lg hover:bg-yellow-600 transition shadow-lg shadow-yellow-200 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  กำลังบันทึก...
                </>
              ) : (
                'ยืนยันการเปิด Ticket'
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
