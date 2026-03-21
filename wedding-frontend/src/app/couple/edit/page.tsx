'use client';

import { useEffect, useState, FormEvent } from 'react';
import { weddingApi, bankApi, WeddingResponse, Bank, getImageUrl } from '@/lib/api';
import MapPicker from '@/components/MapPicker';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function EditWeddingPage() {
    const [wedding, setWedding] = useState<WeddingResponse | null>(null);
    const [isNew, setIsNew] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [expandedSections, setExpandedSections] = useState<string[]>(['couple']);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [lookupLoading, setLookupLoading] = useState<'groom' | 'bride' | null>(null);
    const [lookupError, setLookupError] = useState<{ type: 'groom' | 'bride', message: string } | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [timelineSaving, setTimelineSaving] = useState<number | 'new' | null>(null);
    const [timelineError, setTimelineError] = useState<string>('');
    const [timelinePreviews, setTimelinePreviews] = useState<Record<number | 'new', string>>({} as Record<number | 'new', string>);

    useEffect(() => {
        const fetchBanks = async () => {
            try {
                const list = await bankApi.getBanks();
                setBanks(list);
            } catch (err) {
                console.error("Failed to fetch banks", err);
            }
        };
        fetchBanks();
    }, []);

    const handleBankLookup = async (type: 'groom' | 'bride') => {
        const bankName = type === 'groom' ? form.groomBankName : form.brideBankName;
        const accountNumber = type === 'groom' ? form.groomBankAccountNumber : form.brideBankAccountNumber;
        
        if (!bankName || !accountNumber) return;
        
        const bankCode = bankName.includes(' - ') ? bankName.split(' - ')[0] : bankName;
        const bank = banks.find(b => b.code === bankCode || b.name === bankName);
        if (!bank) return;

        setLookupLoading(type);
        setLookupError(null);
        try {
            const accountName = await bankApi.lookupAccount(bank.bin, accountNumber);
            if (type === 'groom') update('groomBankAccountHolder', accountName);
            else update('brideBankAccountHolder', accountName);
        } catch (err: any) {
            console.error("Lookup failed", err);
            setLookupError({ type, message: "Không tìm thấy tài khoản hoặc lỗi API." });
        } finally {
            setLookupLoading(null);
        }
    };

    const [venueType, setVenueType] = useState<'common' | 'separate'>('common');
    const [form, setForm] = useState({
        groomName: '',
        brideName: '',
        loveStory: '',
        primaryColor: '#e11d48',
        secondaryColor: '#f43f5e',
        weddingDate: '',
        venueName: '',
        venueAddress: '',
        venueLat: '',
        venueLng: '',
        groomHouseName: '',
        groomHouseAddress: '',
        groomHouseLat: '',
        groomHouseLng: '',
        brideHouseName: '',
        brideHouseAddress: '',
        brideHouseLat: '',
        brideHouseLng: '',
        slug: '',
        groomBankName: '',
        groomBankAccountNumber: '',
        groomBankAccountHolder: '',
        brideBankName: '',
        brideBankAccountNumber: '',
        brideBankAccountHolder: '',
        musicUrl: '',
        templateCode: 'template1',
        groomImageUrl: '',
        brideImageUrl: '',
        groomFatherName: '',
        groomMotherName: '',
        brideFatherName: '',
        brideMotherName: '',
    });

    useEffect(() => {
        loadWedding();
    }, []);

    const loadWedding = async () => {
        try {
            const res = await weddingApi.getMine();
            setWedding(res.data);
            setForm({
                groomName: res.data.groomName || '',
                brideName: res.data.brideName || '',
                loveStory: res.data.loveStory || '',
                primaryColor: res.data.primaryColor || '#e11d48',
                secondaryColor: res.data.secondaryColor || '#f43f5e',
                weddingDate: res.data.weddingDate ? res.data.weddingDate.slice(0, 16) : '',
                venueName: res.data.venueName || '',
                venueAddress: res.data.venueAddress || '',
                venueLat: res.data.venueLat?.toString() || '',
                venueLng: res.data.venueLng?.toString() || '',
                groomHouseName: res.data.groomHouseName || '',
                groomHouseAddress: res.data.groomHouseAddress || '',
                groomHouseLat: res.data.groomHouseLat?.toString() || '',
                groomHouseLng: res.data.groomHouseLng?.toString() || '',
                brideHouseName: res.data.brideHouseName || '',
                brideHouseAddress: res.data.brideHouseAddress || '',
                brideHouseLat: res.data.brideHouseLat?.toString() || '',
                brideHouseLng: res.data.brideHouseLng?.toString() || '',
                slug: res.data.slug || '',
                groomBankName: res.data.groomBankName || '',
                groomBankAccountNumber: res.data.groomBankAccountNumber || '',
                groomBankAccountHolder: res.data.groomBankAccountHolder || '',
                brideBankName: res.data.brideBankName || '',
                brideBankAccountNumber: res.data.brideBankAccountNumber || '',
                brideBankAccountHolder: res.data.brideBankAccountHolder || '',
                musicUrl: res.data.musicUrl || '',
                templateCode: res.data.templateCode || 'template1',
                groomImageUrl: res.data.groomImageUrl || '',
                brideImageUrl: res.data.brideImageUrl || '',
                groomFatherName: res.data.groomFatherName || '',
                groomMotherName: res.data.groomMotherName || '',
                brideFatherName: res.data.brideFatherName || '',
                brideMotherName: res.data.brideMotherName || '',
            });
            if (res.data.groomHouseAddress || res.data.brideHouseAddress) {
                setVenueType('separate');
            } else {
                setVenueType('common');
            }
        } catch {
            setIsNew(true);
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => 
            prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
        );
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            const data: Record<string, unknown> = {
                ...form,
                venueLat: form.venueLat ? parseFloat(form.venueLat) : null,
                venueLng: form.venueLng ? parseFloat(form.venueLng) : null,
                groomHouseLat: form.groomHouseLat ? parseFloat(form.groomHouseLat) : null,
                groomHouseLng: form.groomHouseLng ? parseFloat(form.groomHouseLng) : null,
                brideHouseLat: form.brideHouseLat ? parseFloat(form.brideHouseLat) : null,
                brideHouseLng: form.brideHouseLng ? parseFloat(form.brideHouseLng) : null,
                weddingDate: form.weddingDate || null,
            };

            if (isNew) {
                const res = await weddingApi.create(data);
                setWedding(res.data);
                setIsNew(false);
                setMessage('✅ Thiệp cưới đã được tạo thành công! Bạn có thể xem và xuất bản ngay bây giờ.');
            } else {
                const res = await weddingApi.updateMine(data);
                setWedding(res.data);
                setMessage('✅ Tuyệt vời! Mọi thay đổi của bạn đã được lưu lại thành công.');
            }

            if (selectedFiles.length > 0) {
                setUploadingImage(true);
                const uploadPromises = selectedFiles.map(file => weddingApi.uploadImage(file));
                await Promise.all(uploadPromises);
                setSelectedFiles([]);
                await loadWedding();
                setMessage(prev => prev + ' 📸 Đã tải các ảnh lên thành công!');
            }
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
        } catch (err: unknown) {
            setMessage('❌ ' + (err instanceof Error ? err.message : 'Có lỗi xảy ra'));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setSaving(false);
            setUploadingImage(false);
        }
    };

    const handlePublish = async () => {
        try {
            const res = await weddingApi.publish();
            setWedding(res.data);
            setMessage('🎉 Tuyệt vời! Thiệp đã được xuất bản công khai. Giờ đây bạn có thể copy link để gửi cho bạn bè.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: unknown) {
            setMessage('❌ ' + (err instanceof Error ? err.message : 'Có lỗi khi xuất bản'));
        }
    };

    const handleDeleteTimeline = async (eventId: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa mốc thời gian này?')) return;
        
        setTimelineSaving(eventId);
        try {
            await weddingApi.deleteTimelineEvent(eventId);
            await loadWedding();
        } catch (err: any) {
            alert(err.message || 'Không thể xóa mốc thời gian');
        } finally {
            setTimelineSaving(null);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        
        if (isNew) {
            setSelectedFiles(prev => [...prev, ...Array.from(files)]);
        } else {
            handleImageUpload(e);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setUploadingImage(true);
        try {
            const uploadPromises = Array.from(files).map(file => weddingApi.uploadImage(file));
            await Promise.all(uploadPromises);
            await loadWedding();
            setMessage('✅ Đã tải ảnh lên thành công!');
        } catch (err: unknown) {
            setMessage('❌ ' + (err instanceof Error ? err.message : 'Tải lên thất bại'));
        } finally {
            setUploadingImage(false);
            e.target.value = '';
        }
    };

    const removeSelectedFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleDeleteImage = async (imageId: number) => {
        try {
            await weddingApi.deleteImage(imageId);
            setConfirmDeleteId(null);
            await loadWedding();
        } catch (err: unknown) {
            setMessage('❌ ' + (err instanceof Error ? err.message : 'Xóa thất bại'));
        }
    };

    const update = (field: string, value: string | number | null) =>
        setForm((prev) => ({ ...prev, [field]: value?.toString() || '' }));

    if (loading) {
        return <div className="flex justify-center p-12 text-slate-400">Đang tải dữ liệu thiệp...</div>;
    }

    const SectionHeader = ({ id, icon, title, description }: { id: string; icon: string; title: string; description?: string }) => {
        const isOpen = expandedSections.includes(id);
        return (
            <div 
                onClick={() => toggleSection(id)}
                className={`flex items-center justify-between p-5 cursor-pointer transition-all ${isOpen ? 'bg-slate-50 border-b border-slate-100' : 'hover:bg-slate-50'}`}
            >
                <div className="flex items-center gap-4">
                    <span className="text-2xl">{icon}</span>
                    <div>
                        <h3 className="font-bold text-slate-900 leading-none">{title}</h3>
                        {description && <p className="text-xs text-slate-500 mt-1.5">{description}</p>}
                    </div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${isOpen ? 'rotate-180 bg-slate-200 text-slate-600' : 'bg-slate-100 text-slate-400'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl animate-fade-in-up pb-24 px-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 pt-8">
                <div>
                    <h1 className="font-display text-3xl font-bold text-slate-900 mb-1">
                        {isNew ? '✨ Khởi tạo thiệp cưới' : '✏️ Chỉnh sửa thiệp cưới'}
                    </h1>
                    <p className="text-slate-500 text-sm">Điền đầy đủ thông tin để thiệp mời của bạn thật hoàn hảo.</p>
                </div>
                {!isNew && !wedding?.isPublished && (
                    <button onClick={handlePublish} className="btn-secondary h-12 px-6 flex items-center justify-center gap-2 border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors rounded-xl">
                        🚀 Xuất bản ngay
                    </button>
                )}
            </div>

            {message && (
                <div className={`mb-8 p-4 rounded-xl text-sm font-medium ${message.startsWith('✅') || message.startsWith('🎉')
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                    <div className="flex justify-between items-center">
                        <span>{message}</span>
                        {!isNew && !wedding?.isPublished && message.includes('thành công') && (
                            <button onClick={handlePublish} className="ml-4 px-3 py-1 bg-primary text-white rounded-lg text-xs font-bold shadow-sm">
                                Xuất bản 🚀
                            </button>
                        )}
                    </div>
                </div>
            )}

            <form id="wedding-form" onSubmit={handleSubmit} className="space-y-6">
                {/* Couple Info */}
                <div className="card overflow-hidden">
                    <SectionHeader 
                        id="couple" 
                        icon="👫" 
                        title="Thông tin cặp đôi" 
                        description="Tên cô dâu, tên chú rể và đường dẫn thiệp mời."
                    />
                    {expandedSections.includes('couple') && (
                        <div className="p-6 md:p-8 animate-fade-in-down">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tên cô dâu</label>
                                    <input className="input-field" value={form.brideName} onChange={(e) => update('brideName', e.target.value)} required placeholder="Trần Thị B" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tên chú rể</label>
                                    <input className="input-field" value={form.groomName} onChange={(e) => update('groomName', e.target.value)} required placeholder="Nguyễn Văn A" />
                                </div>
                            </div>
                            <div className="mt-6">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Đường dẫn chia sẻ (Slug)</label>
                                <div className="flex bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                                    <span className="px-4 py-3 text-slate-500 bg-slate-100 border-r border-slate-200 text-sm font-mono whitespace-nowrap">
                                        /wedding/
                                    </span>
                                    <input className="flex-1 px-4 py-3 bg-white text-slate-900 focus:outline-none" value={form.slug} onChange={(e) => update('slug', e.target.value)} placeholder="minh-va-lan" />
                                </div>
                                <p className="text-xs text-slate-400 mt-2">Bỏ trống hệ thống sẽ tự động tạo URL ngẫu nhiên.</p>
                                {!isNew && (
                                    <p className="text-xs text-amber-600 mt-2 font-medium italic">
                                        ⚠️ Lưu ý: Khi đổi đường dẫn, các link cũ bạn đã gửi sẽ không còn truy cập được nữa.
                                    </p>
                                )}
                            </div>

                            {/* Traditional fields for Template 2 */}
                            {form.templateCode === 'template2' && (
                                <div className="mt-8 pt-8 border-t border-slate-100 space-y-8 animate-fade-in-up">
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm">🏮 Thông tin truyền thống (Mẫu 2)</h4>
                                    
                                    <div className="grid md:grid-cols-2 gap-8">
                                        {/* Groom Avatar */}
                                        <div className="space-y-4">
                                            <label className="block text-xs font-semibold text-slate-500 uppercase">Ảnh đại diện Chú Rể</label>
                                            <div 
                                                className="w-24 h-24 rounded-full border-4 border-slate-100 overflow-hidden bg-slate-50 flex items-center justify-center relative group cursor-pointer"
                                                onClick={() => document.getElementById('groom-avatar-input')?.click()}
                                            >
                                                {form.groomImageUrl ? (
                                                    <img src={getImageUrl(form.groomImageUrl)} className="w-full h-full object-cover" alt="Groom Avatar" />
                                                ) : (
                                                    <span className="text-3xl">🤵</span>
                                                )}
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-white text-[10px] font-bold">Thay đổi</span>
                                                </div>
                                                <input 
                                                    id="groom-avatar-input"
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setUploadingImage(true);
                                                            try {
                                                                const res = await weddingApi.uploadImage(file);
                                                                update('groomImageUrl', res.data.imageUrl);
                                                            } catch (err: any) {
                                                                alert(err.message);
                                                            } finally {
                                                                setUploadingImage(false);
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <input className="input-field text-sm" value={form.groomFatherName} onChange={(e) => update('groomFatherName', e.target.value)} placeholder="Tên Cha chú rể (Ví dụ: Ông Nguyễn Văn A)" />
                                                <input className="input-field text-sm" value={form.groomMotherName} onChange={(e) => update('groomMotherName', e.target.value)} placeholder="Tên Mẹ chú rể (Ví dụ: Bà Lê Thị B)" />
                                            </div>
                                        </div>

                                        {/* Bride Avatar */}
                                        <div className="space-y-4">
                                            <label className="block text-xs font-semibold text-slate-500 uppercase">Ảnh đại diện Cô Dâu</label>
                                            <div 
                                                className="w-24 h-24 rounded-full border-4 border-slate-100 overflow-hidden bg-slate-50 flex items-center justify-center relative group cursor-pointer"
                                                onClick={() => document.getElementById('bride-avatar-input')?.click()}
                                            >
                                                {form.brideImageUrl ? (
                                                    <img src={getImageUrl(form.brideImageUrl)} className="w-full h-full object-cover" alt="Bride Avatar" />
                                                ) : (
                                                    <span className="text-3xl">👰</span>
                                                )}
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-white text-[10px] font-bold">Thay đổi</span>
                                                </div>
                                                <input 
                                                    id="bride-avatar-input"
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setUploadingImage(true);
                                                            try {
                                                                const res = await weddingApi.uploadImage(file);
                                                                update('brideImageUrl', res.data.imageUrl);
                                                            } catch (err: any) {
                                                                alert(err.message);
                                                            } finally {
                                                                setUploadingImage(false);
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <input className="input-field text-sm" value={form.brideFatherName} onChange={(e) => update('brideFatherName', e.target.value)} placeholder="Tên Cha cô dâu (Ví dụ: Ông Trần Văn C)" />
                                                <input className="input-field text-sm" value={form.brideMotherName} onChange={(e) => update('brideMotherName', e.target.value)} placeholder="Tên Mẹ cô dâu (Ví dụ: Bà Phạm Thị D)" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Event Details */}
                <div className="card overflow-hidden">
                    <SectionHeader 
                        id="event" 
                        icon="📅" 
                        title="Thời gian & Địa điểm" 
                        description="Ngày giờ tổ chức tiệc và tích hợp bản đồ chỉ đường."
                    />
                    {expandedSections.includes('event') && (
                        <div className="p-6 md:p-8 animate-fade-in-down space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Ngày giờ tổ chức tiệc</label>
                                <input type="datetime-local" className="input-field max-w-sm" value={form.weddingDate} onChange={(e) => update('weddingDate', e.target.value)} />
                            </div>
                            <div className="flex gap-4 mb-4">
                                <label className={`flex-1 p-3 rounded-lg border-2 cursor-pointer transition-colors text-center ${venueType === 'common' ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                                    <input type="radio" name="venueType" className="sr-only" checked={venueType === 'common'} onChange={() => setVenueType('common')} />
                                    <span className="font-semibold text-sm">🏨 Tổ chức chung</span>
                                </label>
                                <label className={`flex-1 p-3 rounded-lg border-2 cursor-pointer transition-colors text-center ${venueType === 'separate' ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                                    <input type="radio" name="venueType" className="sr-only" checked={venueType === 'separate'} onChange={() => setVenueType('separate')} />
                                    <span className="font-semibold text-sm">🏠 Tổ chức riêng</span>
                                </label>
                            </div>

                            {venueType === 'common' ? (
                                <>
                                    <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Tên nhà hàng</label>
                                            <input className="input-field" value={form.venueName} onChange={(e) => update('venueName', e.target.value)} placeholder="GEM Center" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Địa chỉ chính xác</label>
                                            <input className="input-field" value={form.venueAddress} onChange={(e) => update('venueAddress', e.target.value)} placeholder="8 Nguyễn Bỉnh Khiêm, Quận 1..." />
                                        </div>
                                    </div>
                                    <MapPicker 
                                        label="Vị trí trên bản đồ"
                                        address={form.venueAddress}
                                        lat={form.venueLat}
                                        lng={form.venueLng}
                                        onLocationSelect={(lat, lng, addr) => {
                                            update('venueLat', lat);
                                            update('venueLng', lng);
                                            if (addr) update('venueAddress', addr);
                                        }}
                                    />
                                </>
                            ) : (
                                <div className="space-y-8">
                                    <div className="p-6 rounded-2xl border border-sky-100 bg-sky-50/50 space-y-6">
                                        <h4 className="font-bold text-sky-800 flex items-center gap-2">🤵 Nhà Trai</h4>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 mb-1">Tên địa điểm</label>
                                                <input className="input-field text-sm" value={form.groomHouseName} onChange={(e) => update('groomHouseName', e.target.value)} placeholder="Tên địa điểm (Nhà Trai)" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 mb-1">Địa chỉ</label>
                                                <input className="input-field text-sm" value={form.groomHouseAddress} onChange={(e) => update('groomHouseAddress', e.target.value)} placeholder="Địa chỉ Nhà Trai" />
                                            </div>
                                        </div>
                                        <MapPicker 
                                            address={form.groomHouseAddress}
                                            lat={form.groomHouseLat}
                                            lng={form.groomHouseLng}
                                            onLocationSelect={(lat, lng, addr) => {
                                                update('groomHouseLat', lat);
                                                update('groomHouseLng', lng);
                                                if (addr) update('groomHouseAddress', addr);
                                            }}
                                        />
                                    </div>
                                    <div className="p-6 rounded-2xl border border-rose-100 bg-rose-50/50 space-y-6">
                                        <h4 className="font-bold text-rose-800 flex items-center gap-2">👰 Nhà Gái</h4>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 mb-1">Tên địa điểm</label>
                                                <input className="input-field text-sm" value={form.brideHouseName} onChange={(e) => update('brideHouseName', e.target.value)} placeholder="Tên địa điểm (Nhà Gái)" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 mb-1">Địa chỉ</label>
                                                <input className="input-field text-sm" value={form.brideHouseAddress} onChange={(e) => update('brideHouseAddress', e.target.value)} placeholder="Địa chỉ Nhà Gái" />
                                            </div>
                                        </div>
                                        <MapPicker 
                                            address={form.brideHouseAddress}
                                            lat={form.brideHouseLat}
                                            lng={form.brideHouseLng}
                                            onLocationSelect={(lat, lng, addr) => {
                                                update('brideHouseLat', lat);
                                                update('brideHouseLng', lng);
                                                if (addr) update('brideHouseAddress', addr);
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Gift Info */}
                <div className="card overflow-hidden">
                    <SectionHeader 
                        id="gift" 
                        icon="💳" 
                        title="Thông tin nhận quà" 
                        description="Hệ thống tự động tra cứu tên chủ tài khoản sau khi bạn nhập số tài khoản."
                    />
                    {expandedSections.includes('gift') && (
                        <div className="p-6 md:p-8 animate-fade-in-down space-y-8">
                            {/* Groom Bank */}
                            <div className="p-6 rounded-2xl border border-blue-100 bg-blue-50/30">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-bold text-blue-800 flex items-center gap-2 text-sm">🤵 Tài khoản Chú Rể</h4>
                                    {lookupLoading === 'groom' && <span className="text-[10px] text-blue-500 animate-pulse">Đang kiểm tra...</span>}
                                </div>
                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-blue-400 uppercase mb-1 px-1">Ngân hàng</label>
                                        <select 
                                            className="input-field text-sm" 
                                            value={form.groomBankName?.includes(' - ') ? form.groomBankName.split(' - ')[0] : ''} 
                                            onChange={(e) => {
                                                const b = banks.find(h => h.code === e.target.value);
                                                update('groomBankName', b ? `${b.code} - ${b.shortName || b.name}` : '');
                                            }}
                                        >
                                            <option value="">Chọn ngân hàng</option>
                                            {banks.map(b => (
                                                <option key={b.bin} value={b.code}>{b.shortName || b.code} - {b.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-blue-400 uppercase mb-1 px-1">Số tài khoản</label>
                                        <div className="relative">
                                            <input 
                                                className="input-field text-sm pr-10" 
                                                value={form.groomBankAccountNumber} 
                                                onChange={(e) => update('groomBankAccountNumber', e.target.value)} 
                                                onBlur={() => handleBankLookup('groom')}
                                                placeholder="Ví dụ: 03833..." 
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => handleBankLookup('groom')}
                                                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 transition-all ${lookupLoading === 'groom' ? 'animate-spin opacity-50' : 'text-blue-500 hover:scale-110'}`}
                                                title="Tra cứu tên"
                                                disabled={lookupLoading === 'groom'}
                                            >
                                                {lookupLoading === 'groom' ? '⏳' : '🔍'}
                                            </button>
                                        </div>
                                        {lookupError?.type === 'groom' && <p className="text-[10px] text-rose-500 mt-1 px-1">{lookupError.message}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-blue-400 uppercase mb-1 px-1">Chủ tài khoản (Tự động điền)</label>
                                    <input className="input-field text-sm bg-blue-50/50" value={form.groomBankAccountHolder} onChange={(e) => update('groomBankAccountHolder', e.target.value)} placeholder="Tên chủ tài khoản..." />
                                </div>
                            </div>

                            {/* Bride Bank */}
                            <div className="p-6 rounded-2xl border border-rose-100 bg-rose-50/30">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-bold text-rose-800 flex items-center gap-2 text-sm">👰 Tài khoản Cô Dâu</h4>
                                    {lookupLoading === 'bride' && <span className="text-[10px] text-rose-500 animate-pulse">Đang kiểm tra...</span>}
                                </div>
                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-rose-400 uppercase mb-1 px-1">Ngân hàng</label>
                                        <select 
                                            className="input-field text-sm" 
                                            value={form.brideBankName?.includes(' - ') ? form.brideBankName.split(' - ')[0] : ''} 
                                            onChange={(e) => {
                                                const b = banks.find(h => h.code === e.target.value);
                                                update('brideBankName', b ? `${b.code} - ${b.shortName || b.name}` : '');
                                            }}
                                        >
                                            <option value="">Chọn ngân hàng</option>
                                            {banks.map(b => (
                                                <option key={b.bin} value={b.code}>{b.shortName || b.code} - {b.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-rose-400 uppercase mb-1 px-1">Số tài khoản</label>
                                        <div className="relative">
                                            <input 
                                                className="input-field text-sm pr-10" 
                                                value={form.brideBankAccountNumber} 
                                                onChange={(e) => update('brideBankAccountNumber', e.target.value)} 
                                                onBlur={() => handleBankLookup('bride')}
                                                placeholder="Số tài khoản..." 
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => handleBankLookup('bride')}
                                                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 transition-all ${lookupLoading === 'bride' ? 'animate-spin opacity-50' : 'text-rose-500 hover:scale-110'}`}
                                                title="Tra cứu tên"
                                                disabled={lookupLoading === 'bride'}
                                            >
                                                {lookupLoading === 'bride' ? '⏳' : '🔍'}
                                            </button>
                                        </div>
                                        {lookupError?.type === 'bride' && <p className="text-[10px] text-rose-500 mt-1 px-1">{lookupError.message}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-rose-400 uppercase mb-1 px-1">Chủ tài khoản (Tự động điền)</label>
                                    <input className="input-field text-sm bg-rose-50/50" value={form.brideBankAccountHolder} onChange={(e) => update('brideBankAccountHolder', e.target.value)} placeholder="Tên chủ tài khoản..." />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Story & Theme */}
                <div className="card overflow-hidden">
                    <SectionHeader 
                        id="theme" 
                        icon="🎨" 
                        title="Câu chuyện & Giao diện" 
                        description="Lời nhắn gửi yêu thương và màu sắc chủ đạo của thiệp."
                    />
                    {expandedSections.includes('theme') && (
                        <div className="p-6 md:p-8 animate-fade-in-down space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Câu chuyện tình yêu</label>
                                <textarea className="input-field min-h-[120px] text-sm" value={form.loveStory} onChange={(e) => update('loveStory', e.target.value)} placeholder="Kể về hành trình của hai bạn..." />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-4 text-center">Chọn mẫu thiệp</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div 
                                        onClick={() => update('templateCode', 'template1')}
                                        className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${form.templateCode === 'template1' ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <div className="aspect-[3/4] rounded-lg bg-slate-100 mb-3 flex items-center justify-center text-slate-400 font-bold border border-slate-200">
                                            Mẫu Hiện Đại (1)
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold">Mẫu 1</span>
                                            {form.templateCode === 'template1' && <span className="text-primary">✓</span>}
                                        </div>
                                    </div>
                                    <div 
                                        onClick={() => update('templateCode', 'template2')}
                                        className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${form.templateCode === 'template2' ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <div className="aspect-[3/4] rounded-lg bg-red-100 mb-3 flex items-center justify-center text-red-600 font-bold border border-red-200">
                                            Mẫu Truyền Thống (2)
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold">Mẫu 2</span>
                                            {form.templateCode === 'template2' && <span className="text-primary">✓</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Màu chính</label>
                                    <input type="color" value={form.primaryColor} onChange={(e) => update('primaryColor', e.target.value)} className="w-full h-10 cursor-pointer rounded-lg border-2 border-slate-100 p-0.5" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Màu phụ</label>
                                    <input type="color" value={form.secondaryColor} onChange={(e) => update('secondaryColor', e.target.value)} className="w-full h-10 cursor-pointer rounded-lg border-2 border-slate-100 p-0.5" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Love Story Timeline */}
                <div className="card overflow-hidden">
                    <SectionHeader 
                        id="timeline" 
                        icon="💕" 
                        title="Love Story Timeline" 
                        description="Kể lại những cột mốc quan trọng nhất trong hành trình yêu của hai bạn."
                    />
                    {expandedSections.includes('timeline') && (
                        <div className="p-6 md:p-8 animate-fade-in-down">
                            {timelineError && (
                                <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-600 text-xs border border-rose-100">
                                    {timelineError}
                                </div>
                            )}

                            {/* Existing Events */}
                            <div className="space-y-8 mb-10">
                                {wedding?.loveStoryEvents && wedding.loveStoryEvents.length > 0 ? (
                                    wedding.loveStoryEvents.map((event) => (
                                        <div key={event.id} className="p-5 rounded-2xl border border-rose-100 bg-white shadow-sm relative group overflow-hidden">
                                            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    type="button"
                                                    onClick={() => handleDeleteTimeline(event.id)}
                                                    className="p-1.5 text-rose-400 hover:text-rose-600 transition-colors"
                                                    disabled={timelineSaving === event.id}
                                                >
                                                    {timelineSaving === event.id ? '...' : '🗑️'}
                                                </button>
                                            </div>
                                            
                                            <div className="grid md:grid-cols-[150px_1fr] gap-6" id={`event-form-${event.id}`}>
                                                <div className="space-y-3">
                                                    <div 
                                                        className="aspect-square rounded-xl overflow-hidden bg-rose-50 border border-rose-100 flex items-center justify-center relative cursor-pointer group/img"
                                                        onClick={() => (document.querySelector(`#event-form-${event.id} input[name="file"]`) as HTMLInputElement)?.click()}
                                                    >
                                                        {timelinePreviews[event.id] || event.imageUrl ? (
                                                            <img 
                                                                src={timelinePreviews[event.id] || getImageUrl(event.imageUrl)} 
                                                                alt={event.title} 
                                                                className="w-full h-full object-cover transition-transform group-hover/img:scale-105" 
                                                            />
                                                        ) : (
                                                            <span className="text-2xl text-rose-200">📸</span>
                                                        )}
                                                        <input 
                                                            name="file" 
                                                            type="file" 
                                                            accept="image/*" 
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    setTimelinePreviews(prev => ({ ...prev, [event.id]: URL.createObjectURL(file) }));
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 text-center italic">Bấm vào ảnh để đổi</p>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tiêu đề</label>
                                                            <input name="title" className="input-field text-sm" defaultValue={event.title} placeholder="Ví dụ: Lần đầu gặp gỡ" required />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ngày/Thời gian</label>
                                                            <input name="eventDate" className="input-field text-sm" defaultValue={event.eventDate} placeholder="Ví dụ: 14/02/2020" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nội dung chi tiết</label>
                                                        <textarea name="description" className="input-field text-sm min-h-[80px]" defaultValue={event.description} placeholder="Mô tả ngắn gọn về kỷ niệm này..." />
                                                    </div>
                                                    <div className="flex justify-end pt-2">
                                                        <button 
                                                            type="button"
                                                            onClick={(e) => {
                                                                const div = document.getElementById(`event-form-${event.id}`);
                                                                if (!div) return;
                                                                const fileInput = div.querySelector('input[name="file"]') as HTMLInputElement;
                                                                const titleInput = div.querySelector('input[name="title"]') as HTMLInputElement;
                                                                const dateInput = div.querySelector('input[name="eventDate"]') as HTMLInputElement;
                                                                const descInput = div.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
                                                                
                                                                if (!titleInput.value) {
                                                                    setTimelineError('Vui lòng nhập tiêu đề');
                                                                    return;
                                                                }

                                                                setTimelineSaving(event.id);
                                                                setTimelineError('');
                                                                weddingApi.updateTimelineEvent(event.id, {
                                                                    file: fileInput.files?.[0],
                                                                    title: titleInput.value,
                                                                    eventDate: dateInput.value,
                                                                    description: descInput.value
                                                                }).then(() => {
                                                                    loadWedding();
                                                                }).catch(err => {
                                                                    setTimelineError(err.message);
                                                                }).finally(() => {
                                                                    setTimelineSaving(null);
                                                                });
                                                            }}
                                                            disabled={timelineSaving === event.id}
                                                            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                                                        >
                                                            {timelineSaving === event.id ? 'Đang lưu...' : 'Lưu thay đổi'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                        <span className="text-4xl mb-3 block">📸</span>
                                        <p className="text-slate-500 font-medium">Chưa có mốc thời gian nào.</p>
                                        <p className="text-slate-400 text-xs mt-1">Hãy thêm những kỷ niệm đẹp của hai bạn ở phía dưới.</p>
                                    </div>
                                )}
                            </div>

                            {/* Add New Event Form */}
                            <div className="p-6 rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/30" id="new-timeline-form">
                                <h4 className="font-bold text-rose-800 flex items-center gap-2 mb-6">✨ Thêm kỷ niệm mới</h4>
                                <div className="grid md:grid-cols-[200px_1fr] gap-8">
                                    <div className="space-y-4">
                                        <div 
                                            className="aspect-square rounded-2xl border-2 border-dashed border-rose-200 bg-white flex flex-col items-center justify-center p-4 text-center group hover:border-rose-400 transition-all relative overflow-hidden cursor-pointer"
                                            onClick={() => document.getElementById('new-event-file')?.click()}
                                        >
                                            {timelinePreviews['new'] ? (
                                                <img src={timelinePreviews['new']} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <>
                                                    <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">➕</span>
                                                    <p className="text-[10px] font-bold text-rose-400 uppercase">Ảnh kỷ niệm</p>
                                                </>
                                            )}
                                            <input 
                                                name="file" 
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden" 
                                                id="new-event-file"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setTimelinePreviews(prev => ({ ...prev, new: URL.createObjectURL(file) }));
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 px-1">Tiêu đề mốc *</label>
                                                <input name="title" className="input-field text-sm" placeholder="Ví dụ: Lần đầu đi chơi..." id="new-event-title" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 px-1">Mốc thời gian</label>
                                                <input name="eventDate" className="input-field text-sm" placeholder="Ví dụ: Tháng 5, 2019" id="new-event-date" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 px-1">Nội dung</label>
                                            <textarea name="description" className="input-field text-sm min-h-[100px]" placeholder="Kể về khoảnh khắc này..." id="new-event-desc" />
                                        </div>
                                        <div className="flex justify-end">
                                            <button 
                                                type="button" 
                                                onClick={() => {
                                                    const title = (document.getElementById('new-event-title') as HTMLInputElement).value;
                                                    const date = (document.getElementById('new-event-date') as HTMLInputElement).value;
                                                    const decs = (document.getElementById('new-event-desc') as HTMLTextAreaElement).value;
                                                    const file = (document.getElementById('new-event-file') as HTMLInputElement).files?.[0];

                                                    if (!title) {
                                                        setTimelineError('Vui lòng nhập tiêu đề mốc thời gian');
                                                        return;
                                                    }

                                                    setTimelineSaving('new');
                                                    setTimelineError('');
                                                    weddingApi.addTimelineEvent({ file, title, eventDate: date, description: decs })
                                                        .then(() => {
                                                            loadWedding();
                                                            (document.getElementById('new-event-title') as HTMLInputElement).value = '';
                                                            (document.getElementById('new-event-date') as HTMLInputElement).value = '';
                                                            (document.getElementById('new-event-desc') as HTMLTextAreaElement).value = '';
                                                            (document.getElementById('new-event-file') as HTMLInputElement).value = '';
                                                            setTimelinePreviews(prev => {
                                                                const next = { ...prev };
                                                                delete (next as any).new;
                                                                return next;
                                                            });
                                                        })
                                                        .catch(err => {
                                                            setTimelineError(err.message);
                                                        })
                                                        .finally(() => {
                                                            setTimelineSaving(null);
                                                        });
                                                }}
                                                disabled={timelineSaving === 'new'}
                                                className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg shadow-rose-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                                            >
                                                {timelineSaving === 'new' ? 'Đang thêm...' : '🚀 Thêm vào Timeline'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Album Images */}
                <div className="card overflow-hidden">
                    <SectionHeader 
                        id="album" 
                        icon="🖼️" 
                        title="Album ảnh cưới" 
                        description="Tải lên những khoảnh khắc đẹp nhất của hai bạn."
                    />
                    {expandedSections.includes('album') && (
                        <div className="p-6 md:p-8 animate-fade-in-down">
                            <div className="mb-6 flex flex-wrap gap-4">
                                <label className={`inline-flex items-center justify-center gap-2 btn-secondary bg-white cursor-pointer px-5 py-2.5 ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <span className="text-xl">📤</span>
                                    <span className="font-semibold text-sm">{uploadingImage ? 'Đang tải...' : 'Chọn ảnh mới'}</span>
                                    <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                                </label>
                            </div>

                            {selectedFiles.length > 0 && (
                                <div className="mb-8 p-4 bg-amber-50 rounded-xl border border-amber-100">
                                    <p className="text-xs font-bold text-amber-700 uppercase mb-3 px-1">Ảnh đang chờ được tải lên ({selectedFiles.length})</p>
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                        {selectedFiles.map((file, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-slate-200 group">
                                                <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                                <button onClick={() => removeSelectedFile(idx)} className="absolute top-1 right-1 bg-white/90 text-red-600 rounded-full w-5 h-5 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-amber-600 mt-2 px-1 italic">* Các ảnh này sẽ được lưu sau khi bạn nhấn "Lưu thay đổi".</p>
                                </div>
                            )}

                            {wedding?.images && wedding.images.length > 0 ? (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                    {wedding.images.map((img) => (
                                        <div key={img.id} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white">
                                            <img src={getImageUrl(img.imageUrl)} className="w-full aspect-square object-cover" />
                                            
                                            {confirmDeleteId === img.id ? (
                                                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-2 text-center animate-fade-in">
                                                    <p className="text-[10px] font-bold text-white mb-2 leading-tight">Xác nhận xóa?</p>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => handleDeleteImage(img.id)}
                                                            className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded shadow-sm hover:bg-red-600"
                                                        >
                                                            Xóa
                                                        </button>
                                                        <button 
                                                            onClick={() => setConfirmDeleteId(null)}
                                                            className="px-2 py-1 bg-slate-600 text-white text-[10px] font-bold rounded shadow-sm hover:bg-slate-700"
                                                        >
                                                            Hủy
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => setConfirmDeleteId(img.id)}
                                                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : selectedFiles.length === 0 && (
                                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">Chưa có ảnh nào được tải lên.</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Music Section */}
                <div className="card p-6 border-l-4 border-sky-500 bg-gradient-to-br from-white to-sky-50/20">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span>🎵</span> Nhạc nền thiệp cưới
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Link nhạc (MP3, YouTube hoặc URL trực tiếp)</label>
                            <input 
                                className="input-field" 
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={form.musicUrl} 
                                onChange={(e) => update('musicUrl', e.target.value)} 
                            />
                            <p className="mt-2 text-[10px] text-slate-500 italic">
                                * Hỗ trợ link YouTube hoặc link trực tiếp (.mp3). Nhạc sẽ phát ẩn khi khách xem thiệp.
                            </p>
                        </div>
                    </div>
                </div>
            </form>

            {/* Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white/95 backdrop-blur shadow-2xl border-t p-4 z-40">
                <div className="max-w-4xl mx-auto flex gap-3">
                    <button form="wedding-form" type="submit" disabled={saving || uploadingImage} className="btn-primary flex-1 h-12 text-base shadow-lg shadow-primary/20">
                        {saving ? '⏳ Đang lưu...' : isNew ? '✨ Khởi tạo ngay' : '💾 Lưu mọi thay đổi'}
                    </button>
                    {!isNew && !wedding?.isPublished && (
                        <button onClick={handlePublish} className="btn-secondary h-12 px-6 flex items-center justify-center gap-2 border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors rounded-xl shadow-lg">
                            🚀 Xuất bản
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
