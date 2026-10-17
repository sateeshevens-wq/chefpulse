const fs = require('fs');

const logoSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720" role="img" aria-labelledby="title desc">
  <title id="title">ChefPulse</title>
  <desc id="desc">ChefPulse official brand mark with green gradient cloche and ChefPulse wordmark</desc>
  <defs>
    <linearGradient id="pulseGreen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#d9ff00"/><stop offset="0.45" stop-color="#65f000"/><stop offset="1" stop-color="#00c85a"/>
    </linearGradient>
    <linearGradient id="wordGreen" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#d9ff00"/><stop offset="0.55" stop-color="#72ef00"/><stop offset="1" stop-color="#00c85a"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="720" fill="#000"/>
  <g transform="translate(360 58)">
    <path d="M240 18c-47 0-82 27-95 68-48 4-85 42-85 88 0 49 40 89 89 89h182c49 0 89-40 89-89 0-46-37-84-85-88-13-41-48-68-95-68z" fill="url(#pulseGreen)"/>
    <path d="M73 276h334c13 0 24 11 24 24v19H49v-19c0-13 11-24 24-24z" fill="url(#pulseGreen)"/>
    <path d="M163 88c22 17 35 38 40 66M317 88c-22 17-35 38-40 66" fill="none" stroke="#eaff8a" stroke-width="15" stroke-linecap="round" opacity=".8"/>
    <path d="M181 35c15-19 37-29 61-29" fill="none" stroke="#d9ff00" stroke-width="14" stroke-linecap="round"/>
    <path d="M324 21c12-15 28-23 45-23" fill="none" stroke="#d9ff00" stroke-width="12" stroke-linecap="round"/>
  </g>
  <text x="600" y="510" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="126" font-weight="800" letter-spacing="-6"><tspan fill="#f7f7f7">Chef</tspan><tspan fill="url(#wordGreen)">Pulse</tspan></text>
  <text x="600" y="585" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="600" fill="#f7f7f7">Great Food. At Your Place.</text>
</svg>`;

fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/official-chefpulse-logo.svg', logoSvg);
fs.writeFileSync('public/icon.svg', logoSvg);

let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/import \{ AIChatSupportModal \} from '\.\/components\/common\/AIChatSupportModal';\n/g, '');
app = app.replace(/import \{ Bot, ShieldAlert \} from 'lucide-react';\n/g, '');
app = app.replace(/  const \[showAIChatModal, setShowAIChatModal\] = useState<boolean>\(false\);\n/g, '');
app = app.replace(/\n\s*onOpenAIChat=\{\(\) => setShowAIChatModal\(true\)\}/g, '');
app = app.replace(/\n\s*\/\* 24\/7 AI-Powered Support & Safety Sentinel Chatbot Modal \*\/[\s\S]*?<\/AIChatSupportModal>\n/g, '\n');
app = app.replace(/\n\s*\/\* Floating 24\/7 AI Support & Dispute Desk Action \*\/[\s\S]*?<\/button>\n/g, '\n');
fs.writeFileSync('src/App.tsx', app);

let header = fs.readFileSync('src/components/common/Header.tsx', 'utf8');
header = header.replace(/\n\s*onOpenAIChat\?: \(\) => void;/g, '');
header = header.replace(/\n\s*<div className="brand-mark h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500\/15 overflow-hidden">\n\s*<img src="\/icon\.svg" alt="ChefPulse" className="h-full w-full object-cover" \/>\n\s*<\/div>/g, '\n            <div className="brand-mark h-10 w-10 sm:h-11 sm:w-11 shrink-0 rounded-xl flex items-center justify-center bg-black overflow-hidden shadow-sm">\n              <img src="/official-chefpulse-logo.svg" alt="ChefPulse" className="h-full w-full object-cover" />\n            </div>');
header = header.replace(/currentRoleView === 'customer' \? 'bg-white\/95 border-slate-200\/80' : 'bg-neutral-950\/95 border-neutral-800\/80'/g, "'bg-white/95 border-slate-200/80'");
header = header.replace(/bg-neutral-900 p-1 rounded-xl border border-neutral-800/g, 'bg-slate-100 p-1 rounded-xl border border-slate-200');
header = header.replace(/bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white'/g, 'bg-emerald-500 text-white' : 'text-slate-500 hover:text-slate-900');
header = header.replace(/bg-neutral-900 border border-neutral-800/g, 'bg-white border border-slate-200');
header = header.replace(/text-neutral-300/g, 'text-slate-600');
header = header.replace(/text-white/g, 'text-slate-900');
header = header.replace(/text-neutral-200/g, 'text-slate-700');
header = header.replace(/hover:bg-neutral-800/g, 'hover:bg-slate-100');
header = header.replace(/border-neutral-800/g, 'border-slate-200');
header = header.replace(/bg-neutral-900/g, 'bg-white');
fs.writeFileSync('src/components/common/Header.tsx', header);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<meta name="theme-color" content="#[^"]+" \/>/, '<meta name="theme-color" content="#ffffff" />');
html = html.replace(/<link rel="icon" type="image\/svg\+xml" href="\/icon\.svg" \/>/, '<link rel="icon" type="image/svg+xml" href="/official-chefpulse-logo.svg" />');
html = html.replace(/<body class="[^"]*">/, '<body class="bg-slate-50 text-slate-900 antialiased font-sans">');
html = html.replace(/<div id="root"><\/div>/, `<div id="chef-pulse-splash" aria-label="ChefPulse">
      <img src="/official-chefpulse-logo.svg" alt="ChefPulse" />
    </div>
    <div id="root"></div>`);
html = html.replace(/<script>\n      \/\/ Backwards-compatible globals[\s\S]*?<\/script>/, `<script>
      var area = { name: 'Indiranagar' };
      var city = { name: 'Bengaluru' };
      window.addEventListener('load', function () {
        setTimeout(function () {
          var splash = document.getElementById('chef-pulse-splash');
          if (splash) splash.classList.add('chef-pulse-splash-hide');
        }, 1100);
      });
    </script>`);
html = html.replace('</head>', `<style>
      #chef-pulse-splash{position:fixed;inset:0;z-index:99999;background:#000;display:flex;align-items:center;justify-content:center;transition:opacity .35s ease,visibility .35s ease}
      #chef-pulse-splash img{width:min(86vw,560px);height:auto;display:block}
      #chef-pulse-splash.chef-pulse-splash-hide{opacity:0;visibility:hidden;pointer-events:none}
    </style>\n  </head>`);
fs.writeFileSync('index.html', html);

try { fs.rmSync('src/components/common/AIChatSupportModal.tsx'); } catch (_) {}
console.log('ChefPulse V24 branding refreshed; AI bot removed; official-brand splash installed.');
