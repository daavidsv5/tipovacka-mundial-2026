export default function PravidlaPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pravidla</h1>
        <p className="text-gray-500 mt-1">Jak funguje Tipovačka Mundial 2026</p>
      </div>

      <section className="bg-white border border-gray-200 rounded-2xl p-7 space-y-4 shadow-sm">
        <h2 className="text-gray-900 font-bold text-lg flex items-center gap-2">
          <span>🌍</span> Formát turnaje
        </h2>
        <ul className="text-gray-600 space-y-2.5 text-sm leading-relaxed">
          <li>• Na MS 2026 postupují <strong className="text-gray-900">první dva týmy</strong> ve skupině a <strong className="text-gray-900">8 týmů ze třetích míst</strong> (celkem 32 postupujících ze 12 skupin).</li>
          <li>• Skupiny A–L, 4 týmy v každé skupině, každý hraje 3 zápasy.</li>
          <li>• V play-off se tipuje <strong className="text-gray-900">stav po 90 minutách</strong> hry — nepočítají se góly v prodloužení ani penalty.</li>
        </ul>
      </section>

      <section className="bg-white border border-gray-200 rounded-2xl p-7 space-y-6 shadow-sm">
        <h2 className="text-gray-900 font-bold text-lg flex items-center gap-2">
          <span>⭐</span> Bodový systém
        </h2>

        <div className="space-y-2.5">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest pb-1">Výsledky zápasů</h3>
          {[
            { pts: 5, desc: "Uhodnutí přesného výsledku utkání", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
            { pts: 3, desc: "Uhodnutí brankového rozdílu (např. tip 2:1, výsledek 1:0)", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
            { pts: 2, desc: "Uhodnutí vítězství domácích / hostů nebo remízy", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
          ].map(({ pts, desc, color, bg }) => (
            <div key={pts} className={`flex items-center gap-4 border rounded-xl px-5 py-3.5 ${bg}`}>
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm border flex items-center justify-center shrink-0">
                <span className={`text-base font-black ${color}`}>{pts}b</span>
              </div>
              <span className="text-gray-700 text-sm">{desc}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2.5">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest pb-1">Skupiny &amp; Turnaj</h3>
          {[
            { pts: 5, desc: "Postup ze skupiny s přesným umístěním (1., 2. nebo 3. místo)", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
            { pts: 10, desc: "Umístění českého týmu na turnaji — správný tip", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
            { pts: 10, desc: "Celkové pořadí — Zlato, Stříbro nebo Bronz (za každý správný)", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
            { pts: 10, desc: "Nejlepší střelec turnaje — správný tip", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
          ].map(({ pts, desc, color, bg }, i) => (
            <div key={i} className={`flex items-center gap-4 border rounded-xl px-5 py-3.5 ${bg}`}>
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm border flex items-center justify-center shrink-0">
                <span className={`text-base font-black ${color}`}>{pts}b</span>
              </div>
              <span className="text-gray-700 text-sm">{desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-2xl p-7 space-y-4 shadow-sm">
        <h2 className="text-gray-900 font-bold text-lg flex items-center gap-2">
          <span>⚖️</span> Vyrovnání při shodě bodů
        </h2>
        <ul className="text-gray-600 space-y-2.5 text-sm leading-relaxed">
          <li>• Při rovnosti bodů v celkovém žebříčku rozhoduje <strong className="text-gray-900">větší počet přesných výsledků</strong>.</li>
          <li>• U nejlepšího střelce při shodě gólů rozhoduje: <strong className="text-gray-900">1. počet asistencí</strong>, 2. odehraný čas (méně je více).</li>
        </ul>
      </section>

      <section className="bg-white border border-gray-200 rounded-2xl p-7 space-y-4 shadow-sm">
        <h2 className="text-gray-900 font-bold text-lg flex items-center gap-2">
          <span>💰</span> Rozdělení výher
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { place: "1. místo", pct: "40 %", icon: "🥇", color: "text-yellow-500", bg: "bg-yellow-50 border-yellow-200" },
            { place: "2. místo", pct: "25 %", icon: "🥈", color: "text-gray-500", bg: "bg-gray-50 border-gray-200" },
            { place: "3. místo", pct: "20 %", icon: "🥉", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
            { place: "4. místo", pct: "10 %", icon: "4️⃣", color: "text-blue-500", bg: "bg-blue-50 border-blue-200" },
            { place: "5. místo", pct: "5 %",  icon: "5️⃣", color: "text-indigo-500", bg: "bg-indigo-50 border-indigo-200" },
          ].map(({ place, pct, icon, color, bg }) => (
            <div key={place} className={`border rounded-2xl p-4 text-center ${bg}`}>
              <div className="text-2xl mb-1.5">{icon}</div>
              <div className={`text-xl font-black ${color}`}>{pct}</div>
              <div className="text-gray-500 text-xs mt-1">{place}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
