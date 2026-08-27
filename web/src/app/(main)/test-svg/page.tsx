'use client';

export default function TestSvgPage() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">SVG 渲染测试</h1>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">1. 素材占位图（landscape）</h2>
        <img
          src="/api/placeholder/snap-0c162849-97e4-11f1-9bd9-6018957395ba?type=landscape"
          alt="素材占位图测试"
          className="w-full max-w-2xl border-2 border-gray-300 rounded-lg"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">2. 头像占位图（avatar）</h2>
        <div className="flex gap-4">
          <img
            src="/api/placeholder/zhangshan"
            alt="用户头像测试"
            className="w-24 h-24 border-2 border-gray-300 rounded-full"
          />
          <img
            src="/api/placeholder/lisi"
            alt="用户头像测试"
            className="w-24 h-24 border-2 border-gray-300 rounded-full"
          />
          <img
            src="/api/placeholder/wangwu"
            alt="用户头像测试"
            className="w-24 h-24 border-2 border-gray-300 rounded-full"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">3. 真实上传的图片</h2>
        <img
          src="/uploads/images/38cb0475-5e9f-42d9-9b48-970fb1ae6845.png"
          alt="真实图片测试"
          className="w-full max-w-md border-2 border-gray-300 rounded-lg"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">4. 内联SVG（直接嵌入）</h2>
        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 800 450" className="border-2 border-gray-300 rounded-lg">
          <defs>
            <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6"/>
              <stop offset="100%" stopColor="#8b5cf6"/>
            </linearGradient>
            <linearGradient id="sun" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.55)"/>
              <stop offset="100%" stopColor="rgba(255,255,255,0.15)"/>
            </linearGradient>
          </defs>
          <rect width="800" height="450" fill="url(#sky)"/>
          <circle cx="620" cy="130" r="90" fill="url(#sun)"/>
          <polygon points="0,450 0,320 140,230 260,330 400,220 540,320 660,260 800,330 800,450" fill="rgba(0,0,0,0.18)"/>
          <polygon points="0,450 0,370 180,290 320,380 470,280 620,370 800,300 800,450" fill="rgba(0,0,0,0.30)"/>
          <text x="40" y="90" fontFamily="system-ui,sans-serif" fontSize="40" fontWeight="700"
                fill="rgba(255,255,255,0.95)">测试文字</text>
        </svg>
      </div>

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold mb-2">测试说明</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>如果第1项显示有渐变色背景和图形，说明占位图SVG正常</li>
          <li>如果第2项显示有颜色背景的圆形头像，说明头像占位图正常</li>
          <li>如果第3项显示真实照片，说明图片上传和代理正常</li>
          <li>如果第4项显示有图形，说明浏览器支持SVG渲染</li>
          <li>如果某项只显示文字或空白，说明对应的渲染有问题</li>
        </ul>
      </div>
    </div>
  );
}
