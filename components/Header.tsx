import React from 'react';
import { ShoppingCart, FileDown } from 'lucide-react';

interface HeaderProps {
    onPurchaseAdvisor: () => void;
    onGeneratePDF: () => void;
}

const logoSvg = `
<svg version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" preserveAspectRatio="xMidYMid meet">
  <defs>
    <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
    </linearGradient>
  </defs>
  <g transform="translate(0,1024) scale(0.1,-0.1)" stroke="none">
    <path fill="url(#logo-gradient)" d="M2843 5925 c-55 -15 -139 -54 -185 -87 -21 -15 -32 -17 -47 -9 -68 37 -372 76 -445 57 -26 -6 -27 -9 -24 -66 l3 -60 120 -4 c126 -4 221 -25 232 -52 8 -23 -4 -58 -27 -72 -17 -10 -31 -10 -79 3 -62 16 -221 21 -221 7 0 -23 53 -160 89 -229 116 -222 318 -396 556 -479 141 -49 224 -60 321 -40 135 28 149 49 159 247 7 148 4 154 -87 175 -34 8 -73 21 -85 29 -12 8 -40 50 -63 93 -22 43 -63 106 -90 140 l-50 62 15 108 c8 59 20 123 25 141 5 19 7 38 4 42 -8 13 -61 10 -121 -6z m57 -517 c13 -25 13 -31 0 -55 -21 -38 -81 -45 -104 -11 -9 12 -16 29 -16 38 0 9 7 26 16 38 23 34 83 27 104 -10z"/>
    <path fill="url(#logo-gradient)" d="M1971 5850 c-208 -62 -399 -205 -498 -375 -31 -52 -43 -65 -63 -65 -50 0 -56 15 -22 55 27 30 32 44 32 86 0 43 -5 55 -29 80 -23 22 -39 29 -69 29 -75 0 -122 -69 -103 -152 10 -42 2 -47 -43 -26 -22 9 -29 8 -46 -7 -21 -19 -21 -19 17 -42 21 -12 58 -25 83 -29 25 -3 55 -15 66 -26 12 -11 41 -25 65 -33 34 -10 43 -17 41 -31 -38 -267 9 -441 167 -616 52 -57 55 -64 88 -191 19 -72 41 -139 50 -149 14 -15 33 -18 122 -18 58 0 111 4 118 8 15 10 33 57 33 88 0 28 0 28 105 9 121 -22 246 -19 397 10 39 7 38 8 52 -57 11 -51 28 -58 141 -58 84 0 107 3 123 18 14 12 30 59 53 151 28 119 36 139 66 169 19 19 48 52 64 75 l30 41 -92 18 c-197 40 -365 129 -519 275 -141 134 -242 291 -299 466 -17 49 -27 67 -40 67 -48 0 -68 75 -28 107 21 16 23 25 19 81 -2 34 -7 62 -10 61 -4 0 -36 -9 -71 -19z m-623 -262 c7 -7 12 -22 12 -34 0 -28 -43 -80 -58 -70 -20 12 -25 65 -8 91 18 27 36 31 54 13z"/>
    <path fill="url(#logo-gradient)" d="M8942 5694 c-57 -39 -65 -119 -16 -167 48 -48 142 -43 184 10 22 28 27 91 10 124 -25 45 -132 66 -178 33z"/>
    <path fill="#3730a3" d="M3657 5603 c-4 -3 -7 -206 -7 -450 l0 -443 99 0 c84 0 100 3 105 17 4 10 6 65 5 123 l-2 105 154 6 c190 7 255 28 331 104 69 69 97 170 78 277 -26 146 -126 233 -295 258 -78 11 -458 14 -468 3z m483 -182 c58 -31 75 -63 75 -141 0 -65 -2 -71 -34 -104 -42 -43 -91 -56 -220 -56 l-101 0 0 160 0 160 123 0 c100 0 129 -3 157 -19z"/>
    <path fill="url(#logo-gradient)" d="M8231 5592 c-5 -9 -65 -145 -134 -302 -69 -157 -155 -350 -191 -429 -36 -80 -66 -146 -66 -148 0 -2 47 -3 104 -3 l104 0 38 95 38 95 210 -2 210 -3 36 -90 36 -90 108 -3 c85 -2 107 0 103 10 -3 7 -67 150 -143 318 -75 168 -163 364 -195 435 l-58 130 -96 2 c-80 1 -96 -1 -104 -15z m178 -380 c34 -84 61 -154 61 -157 0 -3 -61 -5 -135 -5 -80 0 -135 4 -135 10 0 10 73 199 110 285 26 60 19 69 99 -133z"/>
    <path fill="#3730a3" d="M4765 5397 c-102 -34 -187 -103 -225 -183 -45 -91 -44 -227 1 -321 73 -152 283 -231 466 -174 166 51 263 192 251 363 -10 131 -85 239 -207 296 -67 31 -220 41 -286 19z m182 -158 c94 -36 141 -172 94 -274 -22 -48 -44 -69 -94 -90 -48 -20 -93 -19 -143 4 -132 60 -135 282 -6 351 41 21 106 26 149 9z"/>
    <path fill="#3730a3" d="M6580 5399 c-19 -6 -54 -24 -77 -39 -44 -30 -53 -26 -53 21 0 17 -8 19 -90 19 l-90 0 0 -465 0 -466 98 3 97 3 5 153 5 154 24 -26 c37 -40 110 -59 201 -54 135 8 231 73 289 197 22 49 26 69 26 156 0 87 -4 107 -26 156 -60 127 -155 191 -293 196 -45 1 -97 -2 -116 -8z m127 -164 c50 -21 72 -42 94 -90 35 -77 20 -180 -33 -232 -40 -38 -76 -53 -130 -53 -117 0 -196 114 -168 243 14 64 43 105 94 128 50 23 95 24 143 4z"/>
    <path fill="#3730a3" d="M7288 5395 c-32 -8 -80 -26 -108 -40 l-50 -25 33 -68 c17 -37 33 -68 33 -70 1 -2 26 9 56 24 37 19 73 28 123 32 110 7 165 -25 181 -106 l7 -32 -114 0 c-129 0 -213 -17 -263 -51 -109 -74 -107 -241 3 -311 62 -39 113 -51 196 -46 71 5 122 24 163 61 l22 20 0 -36 0 -37 96 0 96 0 -4 248 c-4 276 -8 295 -75 364 -56 58 -121 81 -238 84 -65 2 -120 -2 -157 -11z m272 -439 c0 -81 -72 -134 -167 -123 -82 9 -118 73 -73 130 24 31 38 34 153 36 l87 1 0 -44z"/>
    <path fill="#3730a3" d="M5392 5143 c3 -242 4 -261 24 -298 49 -90 122 -136 230 -143 88 -6 166 16 212 58 18 16 35 30 38 30 2 0 4 -18 4 -40 l0 -40 90 0 90 0 0 345 0 345 -94 0 -94 0 -4 -202 c-4 -225 -12 -258 -71 -300 -41 -30 -121 -36 -163 -13 -60 32 -68 64 -72 303 l-4 212 -95 0 -94 0 3 -257z"/>
    <path fill="url(#logo-gradient)" d="M8910 5055 l0 -345 100 0 100 0 0 345 0 345 -100 0 -100 0 0 -345z"/>
  </g>
</svg>
`.replace(/\s\s+/g, ' ');

const logoSrc = `data:image/svg+xml,${encodeURIComponent(logoSvg)}`;

const Header: React.FC<HeaderProps> = ({ onPurchaseAdvisor, onGeneratePDF }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <img src={logoSrc} alt="PoupaAI Logo" className="h-32 w-auto" />
          </div>
          <div className="flex items-center space-x-3">
            <button
              id="tour-purchase-advisor"
              onClick={onPurchaseAdvisor}
              className="flex items-center gap-2 p-2 md:py-2 md:px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              title="Posso Comprar?"
            >
              <ShoppingCart size={18} />
              <span className="hidden md:inline">Posso Comprar?</span>
            </button>
            <button
              id="tour-pdf-report"
              onClick={onGeneratePDF}
              className="flex items-center gap-2 p-2 md:py-2 md:px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              title="Gerar Relatório PDF"
            >
              <FileDown size={18} />
              <span className="hidden md:inline">Relatório PDF</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;