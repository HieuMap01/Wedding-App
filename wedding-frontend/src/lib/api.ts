const getApiBase = () => {
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    // On production (e.g. Vercel), we expect NEXT_PUBLIC_API_URL to be set to the Render URL
    const publicApiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return publicApiUrl || '';
    }
    return publicApiUrl || 'http://localhost:8080';
  }
  
  // On Server (SSR): Use internal Docker network URL to avoid external round-trips via ngrok
  // This is much faster and more reliable inside the container network.
  return 'http://wedding-backend:8080';
};

export const API_BASE = getApiBase();

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // Determine base URL dynamically inside the request to be SSR-safe and browser-resilient
  let baseUrl = API_BASE;
  
  // Safety check: if for some reason API_BASE was initialized to '' but we are on server,
  // we must use the internal backend URL.
  if (typeof window === 'undefined' && !baseUrl) {
    baseUrl = 'http://wedding-backend:8080';
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const headers: Record<string, string> = {
    'ngrok-skip-browser-warning': 'true',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add timeout to prevent indefinite hanging (especially on mobile/proxy)
  const controller = new AbortController();
  // Use a longer timeout for large file uploads (60 seconds)
  const timeoutId = setTimeout(() => controller.abort(), 60000); 

  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.status === 401 && endpoint !== '/api/iam/auth/login' && endpoint !== '/api/iam/auth/refresh') {
      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            // Attempt to refresh
            const refreshRes = await fetch(`${baseUrl}/api/iam/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken })
            });
            const refreshData = await refreshRes.json();
            if (refreshRes.ok && refreshData.data.accessToken) {
              localStorage.setItem('accessToken', refreshData.data.accessToken);
              localStorage.setItem('refreshToken', refreshData.data.refreshToken);
              // Retry the original request
              return request(endpoint, options);
            }
          } catch (err) {
            console.error("Token refresh failed", err);
          }
        }
        
        // If refresh failed or no token, logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Đã xảy ra lỗi không xác định');
    }

    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Yêu cầu quá hạn (Timeout). Vui lòng kiểm tra kết nối mạng.');
    }
    throw err;
  }
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};

export interface PageResponse<T> {
  content: T[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// ===== Auth =====
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  fullName: string;
  role: string;
}

export const authApi = {
  register: (data: { email: string; password: string; fullName: string; phone?: string; address?: string }) =>
    api.post<AuthResponse>('/api/iam/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/api/iam/auth/login', data),
  getMe: () => api.get<UserResponse>('/api/iam/users/me'),
  updateMe: (data: { fullName?: string; phone?: string; address?: string }) =>
    api.put<UserResponse>('/api/iam/users/me', data),
};

// ===== Users (Admin) =====
export interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export const adminApi = {
  getStats: () => api.get<{ totalCouples: number; totalUsers: number }>('/api/iam/admin/stats'),
  getCouples: (page: number = 0, size: number = 10) => api.get<PageResponse<UserResponse>>(`/api/iam/admin/users?page=${page}&size=${size}`),
  getCoupleById: (id: number) => api.get<UserResponse>(`/api/iam/admin/users/${id}`),
  updateCoupleStatus: (id: number, isActive: boolean) => api.put<void>(`/api/iam/admin/users/${id}/status?isActive=${isActive}`),
  getAllWeddings: () => api.get<WeddingResponse[]>('/api/weddings/admin/list'),
  getWeddingById: (id: number) => api.get<WeddingResponse>(`/api/weddings/admin/${id}`),
  getWeddingStats: (weddingId: number) => api.get<StatsResponse>(`/api/interactions/admin/${weddingId}/stats`),
  getWeddingRsvps: (weddingId: number, page: number = 0, size: number = 50) => api.get<PageResponse<RsvpResponse>>(`/api/interactions/admin/${weddingId}/rsvps?page=${page}&size=${size}`),
  getWeddingWishes: (weddingId: number, page: number = 0, size: number = 50) => api.get<PageResponse<WishResponse>>(`/api/interactions/admin/${weddingId}/wishes?page=${page}&size=${size}`),
  toggleWeddingStatus: (weddingId: number, isActive: boolean) => api.put<WeddingResponse>(`/api/weddings/admin/${weddingId}/status?isActive=${isActive}`),
};

// ===== Wedding =====
export interface WeddingImageResponse {
  id: number;
  imageUrl: string;
  caption: string;
  displayOrder: number;
  createdAt: string;
}

export interface LoveStoryEventResponse {
  id: number;
  title: string;
  eventDate: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
  createdAt: string;
}

export interface WeddingResponse {
  id: number;
  coupleUserId: number;
  slug: string;
  groomName: string;
  brideName: string;
  loveStory: string;
  primaryColor: string;
  secondaryColor: string;
  weddingDate: string;
  venueName: string;
  venueAddress: string;
  venueLat: number;
  venueLng: number;
  groomHouseName: string;
  groomHouseAddress: string;
  groomHouseLat: number;
  groomHouseLng: number;
  brideHouseName: string;
  brideHouseAddress: string;
  brideHouseLat: number;
  brideHouseLng: number;
  isPublished: boolean;
  isActive: boolean;
  groomBankName?: string;
  groomBankAccountNumber?: string;
  groomBankAccountHolder?: string;
  brideBankName?: string;
  brideBankAccountNumber?: string;
  brideBankAccountHolder?: string;
  publicUrl: string;
  musicUrl?: string;
  groomImageUrl?: string;
  brideImageUrl?: string;
  groomFatherName?: string;
  groomMotherName?: string;
  brideFatherName?: string;
  brideMotherName?: string;
  templateCode: string;
  images: WeddingImageResponse[];
  loveStoryEvents: LoveStoryEventResponse[];
  createdAt: string;
  updatedAt: string;
}

export const weddingApi = {
  create: (data: Record<string, unknown>) => api.post<WeddingResponse>('/api/weddings', data),
  getMine: () => api.get<WeddingResponse>('/api/weddings/mine'),
  updateMine: (data: Record<string, unknown>) => api.put<WeddingResponse>('/api/weddings/mine', data),
  publish: () => api.put<WeddingResponse>('/api/weddings/mine/publish'),
  uploadImage: (file: File, caption?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (caption) formData.append('caption', caption);
    return api.post<WeddingImageResponse>('/api/weddings/mine/images', formData);
  },
  deleteImage: (imageId: number) => api.delete<void>(`/api/weddings/mine/images/${imageId}`),
  getPublic: (slug: string) => api.get<WeddingResponse>(`/api/weddings/public/${slug}`),
  getQrCode: () => api.get<string>(`/api/weddings/mine/qr`),
  
  // Timeline
  addTimelineEvent: (data: { file?: File; title: string; eventDate?: string; description?: string }) => {
    const formData = new FormData();
    if (data.file) formData.append('file', data.file);
    formData.append('title', data.title);
    if (data.eventDate) formData.append('eventDate', data.eventDate);
    if (data.description) formData.append('description', data.description);
    return api.post<LoveStoryEventResponse>('/api/weddings/mine/timeline', formData);
  },
  updateTimelineEvent: (eventId: number, data: { file?: File; title?: string; eventDate?: string; description?: string }) => {
    const formData = new FormData();
    if (data.file) formData.append('file', data.file);
    if (data.title) formData.append('title', data.title);
    if (data.eventDate) formData.append('eventDate', data.eventDate); // Note: server uses @RequestParam names
    if (data.description) formData.append('description', data.description);
    return api.put<LoveStoryEventResponse>(`/api/weddings/mine/timeline/${eventId}`, formData);
  },
  deleteTimelineEvent: (eventId: number) => api.delete<void>(`/api/weddings/mine/timeline/${eventId}`),
};

// ===== Bank API (VietQR) =====
export interface Bank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
}

export const bankApi = {
  getBanks: async (): Promise<Bank[]> => {
    const res = await fetch('https://api.vietqr.io/v2/banks');
    const data = await res.json();
    return data.data;
  },
  lookupAccount: async (bin: string, accountNumber: string): Promise<string> => {
    const res = await fetch('https://api.vietqr.io/v2/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bin, accountNumber }),
    });
    const data = await res.json();
    if (data.code === '00') {
      return data.data.accountName;
    }
    throw new Error(data.desc || 'Account lookup failed');
  }
};

// ===== Interactions =====
export interface RsvpResponse {
  id: number;
  guestName: string;
  guestPhone: string;
  wishes: string;
  attendance: string;
  createdAt: string;
}

export interface StatsResponse {
  weddingId: number;
  totalVisits: number;
  totalRsvps: number;
  attendingCount: number;
  notAttendingCount: number;
}

export interface WishResponse {
  id: number;
  guestName: string;
  wishes: string;
  createdAt: string;
}

export const interactionApi = {
  recordVisit: (weddingId: number) => api.post<void>(`/api/interactions/${weddingId}/visit`),
  submitRsvp: (weddingId: number, data: { guestName: string; guestPhone?: string; wishes?: string; attendance: string }) =>
    api.post<RsvpResponse>(`/api/interactions/${weddingId}/rsvp`, data),
  getMyStats: (weddingId: number) => api.get<StatsResponse>(`/api/interactions/mine/stats?weddingId=${weddingId}`),
  getMyRsvps: (weddingId: number, page: number = 0, size: number = 50) => api.get<PageResponse<RsvpResponse>>(`/api/interactions/mine/rsvps?weddingId=${weddingId}&page=${page}&size=${size}`),
  getMyWishes: (weddingId: number, page: number = 0, size: number = 50) => api.get<PageResponse<WishResponse>>(`/api/interactions/mine/wishes?weddingId=${weddingId}&page=${page}&size=${size}`),
};
