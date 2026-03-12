'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">

      {/* ─── N A V ─── */}
      <nav className="w-full bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary text-white rounded-md flex justify-center items-center font-bold text-sm">
              W
            </div>
            <span className="font-display font-semibold text-lg text-slate-900 tracking-tight">
              WeddingApp
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden sm:block">
              Đăng nhập
            </Link>
            <Link href="/register" className="btn-primary text-sm py-2 px-5">
              Đăng ký miễn phí
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">

        {/* ─── H E R O ─── */}
        <section className="px-6 py-20 text-center max-w-4xl mx-auto">
          <div className="inline-block px-4 py-1.5 rounded-full bg-rose-50 border border-primary/20 text-primary text-xs font-bold mb-8 uppercase tracking-wider">
            Nền tảng thiệp cưới trực tuyến
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-slate-900 leading-tight mb-6">
            Thiết kế thiệp cưới <br className="hidden sm:block" /> dễ dàng và tinh tế
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Công cụ mạnh mẽ nhưng cực kỳ đơn giản để giúp bạn tạo website thiệp cưới, quản lý khách mời, và chia sẻ niềm vui trong ngày trọng đại.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="btn-primary text-base py-3.5 px-8 w-full sm:w-auto">
              Bắt đầu thiết kế ngay
            </Link>
            <Link href="/login" className="btn-secondary text-base py-3.5 px-8 w-full sm:w-auto">
              Xem bảng điều khiển
            </Link>
          </div>
        </section>

        {/* ─── F E A T U R E S ─── */}
        <section className="px-6 py-20 bg-white border-t border-slate-200">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl font-bold text-slate-900 mb-4">Tính năng nổi bật</h2>
              <p className="text-slate-600">Đầy đủ công cụ để bạn có một sự chuẩn bị hoàn hảo nhất.</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-8">
              <div className="card p-8">
                <div className="w-12 h-12 bg-rose-50 text-primary rounded-xl flex items-center justify-center text-xl mb-6">🖌️</div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Giao diện tùy biến</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Tự do thiết kế màu sắc, hình ảnh và câu chuyện tình yêu của riêng bạn thật lãng mạn.
                </p>
              </div>
              <div className="card p-8">
                <div className="w-12 h-12 bg-rose-50 text-primary rounded-xl flex items-center justify-center text-xl mb-6">📨</div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Quản lý RSVP</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Theo dõi chính xác ai sẽ tham gia, xem trước số lượng khách để chuẩn bị bàn tiệc chu đáo.
                </p>
              </div>
              <div className="card p-8">
                <div className="w-12 h-12 bg-rose-50 text-primary rounded-xl flex items-center justify-center text-xl mb-6">📍</div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Tích hợp Google Maps</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Bản đồ chỉ đường tự động giúp khách mời tìm đến nhà hàng hoặc từ đường gia tiên dễ dàng.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ─── F O O T E R ─── */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-800 text-white rounded flex justify-center items-center font-bold text-xs">
              W
            </div>
            <span className="font-display text-white font-medium">WeddingApp</span>
          </div>
          <div className="text-sm">
            © 2026 Nền tảng tạo thiệp cưới.
          </div>
        </div>
      </footer>

    </div>
  );
}
