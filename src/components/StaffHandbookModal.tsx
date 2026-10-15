import React, { useState, useMemo } from 'react';
import {
  X,
  BookOpen,
  Search,
  CheckCircle2,
  Clock,
  Coffee,
  Sparkles,
  ShieldCheck,
  Lock,
  Lightbulb,
  Thermometer,
  Wine,
  Utensils,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Flame,
  AlertCircle,
  Smartphone,
  Eye,
  CheckSquare,
  Square,
  KeyRound,
  DoorClosed,
  RotateCcw
} from 'lucide-react';

interface StaffHandbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: string;
}

export default function StaffHandbookModal({
  isOpen,
  onClose,
  initialSection = 'all'
}: StaffHandbookModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string>(initialSection);
  const [completedChecklistItems, setCompletedChecklistItems] = useState<{ [key: string]: boolean }>({});

  if (!isOpen) return null;

  const toggleChecklistItem = (id: string) => {
    setCompletedChecklistItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const resetChecklist = () => {
    setCompletedChecklistItems({});
  };

  const sections = [
    { id: 'algemeen', title: '1. Algemene Afspraken & Toog', icon: ShieldCheck, color: 'text-blue-600 bg-blue-50' },
    { id: 'openen', title: '2. Openen van de Zaak', icon: Clock, color: 'text-emerald-600 bg-emerald-50' },
    { id: 'service', title: '3. Tijdens de Shift & Barregels', icon: Wine, color: 'text-amber-600 bg-amber-50' },
    { id: 'voordelen', title: '4. Eten & Personeelsvoordelen', icon: Utensils, color: 'text-purple-600 bg-purple-50' },
    { id: 'npt', title: '5. Niet-Prioritaire Taken (NPT)', icon: Sparkles, color: 'text-cyan-600 bg-cyan-50' },
    { id: 'sluiting', title: '6. Checklist Goede Sluiting', icon: ClipboardList, color: 'text-orange-600 bg-orange-50' },
    { id: 'lichtplan', title: '7. Lichtplan per Ruimte', icon: Lightbulb, color: 'text-yellow-600 bg-yellow-50' },
    { id: 'verwarming', title: '8. Verwarming voor de Nacht', icon: Thermometer, color: 'text-rose-600 bg-rose-50' },
    { id: 'slotcontrole', title: '9. Slotcontrole (Cruciaal!)', icon: Lock, color: 'text-red-600 bg-red-50' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs font-sans overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full p-4 sm:p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-600/20 shrink-0">
              <BookOpen size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                  Praktische Richtlijnen & Werkprocedures
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-950 border border-orange-200">
                  Editie 2026
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Handboek voor het personeel van Eet-Staminée "In De Molen" • Huisreglement & werkafspraken
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Section Quick Filter */}
        <div className="py-3 border-b border-slate-100 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Zoek in het handboek (bijv. Aperol, kassa, sluiting, licht)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveSection('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight transition cursor-pointer shrink-0 ${
                activeSection === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Volledig Handboek
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('sluiting')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight transition cursor-pointer shrink-0 flex items-center gap-1 ${
                activeSection === 'sluiting'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-50 text-orange-950 border border-orange-200 hover:bg-orange-100'
              }`}
            >
              <ClipboardList size={13} />
              <span>Sluitingschecklist</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('slotcontrole')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight transition cursor-pointer shrink-0 flex items-center gap-1 ${
                activeSection === 'slotcontrole'
                  ? 'bg-red-600 text-white'
                  : 'bg-rose-50 text-rose-950 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              <Lock size={13} />
              <span>Slotcontrole</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 text-slate-800 text-xs leading-relaxed pr-1">
          {/* Quick jump menu when viewing all */}
          {activeSection === 'all' && !searchQuery && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              {sections.map(s => {
                const IconComponent = s.icon;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      const el = document.getElementById(`section-${s.id}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="p-2 bg-white hover:bg-orange-50/60 rounded-xl border border-slate-200 text-left transition flex items-center gap-2 cursor-pointer shadow-2xs group"
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>
                      <IconComponent size={14} />
                    </div>
                    <span className="font-bold text-[11px] text-slate-800 group-hover:text-orange-900 truncate">
                      {s.title}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 1. Algemene Afspraken & Taakverdeling */}
          {(activeSection === 'all' || activeSection === 'algemeen') && (
            <section id="section-algemeen" className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2.5 text-blue-900 border-b border-slate-200 pb-2">
                <ShieldCheck size={20} className="text-blue-600 shrink-0" />
                <h4 className="text-sm font-black uppercase tracking-tight">
                  1. 🤝 Algemene Afspraken & Taakverdeling
                </h4>
              </div>

              <div className="space-y-3 text-slate-700">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="font-black text-slate-900 uppercase text-[11px] mb-1">
                    Taakverdeling & Toogbeleid
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-[11.5px]">
                    <li><strong>Taakverdeling:</strong> Wordt bij de start van de shift vastgelegd door de shiftverantwoordelijke en wordt door iedereen strikt nagekomen.</li>
                    <li><strong>Toegang tot de toog:</strong> Enkel het personeel voor de tap, afwas, kassa of koffie komt achter de toog. Anderen komen hier enkel op uitdrukkelijk verzoek van de shiftverantwoordelijke.</li>
                  </ul>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="font-black text-slate-900 uppercase text-[11px] mb-1">
                    Bestellingen & Kassa
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-[11.5px]">
                    <li>Het afrekenen gebeurt steeds door <strong>één en dezelfde persoon</strong>.</li>
                    <li>Enkel medewerkers met een tablet nemen bestellingen op. Dicteer geen bestellingen door en geef ze niet zelf in op de grote tablet.</li>
                    <li>Breng <strong>geen wijzigingen aan gerechten</strong> aan, tenzij in geval van een gediagnosticeerde voedingsallergie.</li>
                  </ul>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="font-black text-slate-900 uppercase text-[11px] mb-1">
                    Planning & Buiten de shift
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-[11.5px]">
                    <li><strong>Planning & Beschikbaarheden:</strong> Geef je beschikbaarheden door <strong>vóór woensdagavond 18:00 uur</strong> (voor de week daaropvolgend).</li>
                    <li>Bij een voorlopig rooster sta je zelf in voor vervanging (behalve bij ziekte). Een shiftwissel wordt altijd via Hans gecommuniceerd.</li>
                    <li><strong>Buiten de shift:</strong> Als je niet op de planning staat, ben je klant. Je komt niet achter de toog of in de koelcel, ook niet in het sorteerkot of de berging.</li>
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* 2. Openen van de Zaak */}
          {(activeSection === 'all' || activeSection === 'openen') && (
            <section id="section-openen" className="bg-emerald-50/50 rounded-2xl p-4 sm:p-5 border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2.5 text-emerald-950 border-b border-emerald-200 pb-2">
                <Clock size={20} className="text-emerald-700 shrink-0" />
                <h4 className="text-sm font-black uppercase tracking-tight">
                  2. 🟢 Openen van de Zaak
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700">
                <div className="bg-white p-3.5 rounded-xl border border-emerald-100 space-y-2">
                  <div className="font-black text-emerald-900 uppercase text-[11px]">
                    Sfeer & Techniek
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-[11.5px]">
                    <li>Zet de muziek aan via Spotify.</li>
                    <li>Schakel de verwarming aan.</li>
                    <li>Doe de lichten aan (spots en lusters boven toog/tafels, toilet en eventuele spots in de vensters).</li>
                  </ul>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-emerald-100 space-y-2">
                  <div className="font-black text-emerald-900 uppercase text-[11px]">
                    Bar & Voorbereiding
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-[11.5px]">
                    <li><strong>Vaten:</strong> Sluit de vaten aan; controleer of de acide en alle zwarte kraantjes openstaan.</li>
                    <li><strong>Toebehoren:</strong> Vul de ijsemmer. Neem citroenen en appelsienen uit de ijskast en snijd indien nodig verse exemplaren.</li>
                    <li><strong>Doeken:</strong> Neem 5 nieuwe schotelvodden, 2 glazenhanddoeken en 4 gewone handdoeken. Vul de potten met warm water en Dreft.</li>
                    <li><strong>Wasbakken:</strong> Vul bak 1 met koud water, becharein en een dopje ammoniak; vul bak 2 enkel met koud water. Zet de afwasmachine aan.</li>
                    <li><strong>Zaal:</strong> Controleer of er overal menu's liggen en of de bierkaartjeshouders gevuld zijn met propere kaartjes (gebruikte kaartjes opruimen).</li>
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* 3. Tijdens de Shift & Barregels */}
          {(activeSection === 'all' || activeSection === 'service') && (
            <section id="section-service" className="bg-amber-50/50 rounded-2xl p-4 sm:p-5 border border-amber-200 space-y-4">
              <div className="flex items-center gap-2.5 text-amber-950 border-b border-amber-200 pb-2">
                <Wine size={20} className="text-amber-700 shrink-0" />
                <h4 className="text-sm font-black uppercase tracking-tight">
                  3. ⏱ Tijdens de Shift (Service & Bestellingen)
                </h4>
              </div>

              {/* Volgorde Drankklaarmaking */}
              <div className="bg-white p-3.5 rounded-xl border border-amber-200">
                <div className="font-black text-amber-950 uppercase text-[11.5px] mb-2 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Volgorde van Drankklaarmaking (Altijd strikt aanhouden!)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-black">
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl">
                    <span className="text-amber-600 block text-[10px]">Stap 1</span>
                    1. Warme dranken
                  </div>
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl">
                    <span className="text-amber-600 block text-[10px]">Stap 2</span>
                    2. Frisdrank, wijn & sterke drank
                  </div>
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl">
                    <span className="text-amber-600 block text-[10px]">Stap 3</span>
                    3. Flesbieren (nooit uitschenken!)
                  </div>
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl">
                    <span className="text-amber-600 block text-[10px]">Stap 4</span>
                    4. Tapbieren
                  </div>
                </div>
              </div>

              {/* Tap & Schenkregels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-2">
                  <div className="font-black text-amber-950 uppercase text-[11px]">
                    Tap, Flessen & Ijsregels
                  </div>
                  <ul className="list-disc pl-5 space-y-1.5 text-[11.5px]">
                    <li><strong>Tappen:</strong> Tussen twee vaten in spoel je telkens overvloedig (2 à 3 minuten) met water. Glazen worden altijd gekoeld en pinten onmiddellijk afgeschuimd.</li>
                    <li><strong>Grote flessen:</strong> Pepsi, Pepsi zero, plat water en bruiswater worden standaard van de grote fles geschonken (tenzij de klant anders vraagt).</li>
                    <li><strong>Ijs & Garnering:</strong> <strong>3 volledige ijsblokjes</strong> per glas.
                      <ul className="list-circle pl-4 mt-1 text-[11px] text-slate-600 space-y-0.5">
                        <li><strong>Met citroentje + ijs:</strong> Pepsi, bruiswater, Gini, Tonic, 7Up, Tonisteiner citroen.</li>
                        <li><strong>Met appelsientje + ijs:</strong> Fruitsap, Ice Tea, Agrum, Orangina, Tonisteiner Mirinda, Canada Dry.</li>
                        <li><strong>Geen citroen:</strong> Plat water, Perrier of Apollinaris (tenzij op verzoek). Alle frisdranken met glas ijs geserveerd.</li>
                      </ul>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-2">
                  <div className="font-black text-amber-950 uppercase text-[11px]">
                    Sterke Dranken & Cocktails
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-[11.5px]">
                    <li><strong>Maatbeker:</strong> Gebruik steeds de maatbeker (behalve Martini, Baileys en Amaretto).</li>
                    <li><strong>Mixdranken:</strong> Geserveerd met 4 blokjes ijs, 2 rietjes en het flesje apart.</li>
                    <li><strong>Martini Bianco, Rosso, Baileys, Amaretto:</strong> Géén maatbeker; in klein glas, 3 ijsblokjes en vol schenken. Bianco = schijfje citroen, Rosso = appelsien.</li>
                    <li><strong>Aperol van de fles:</strong> Glas vol met ijs, Schijfje appelsien, 1 grote maat spuitwater, 1 grote maat Aperol, 2 grote maten Cava.</li>
                    <li><strong>Aperol van 't vat:</strong> Glas vol met ijs, Schijfje appelsien, tappen tot 1 cm onder de rand.</li>
                  </ul>
                </div>
              </div>

              {/* Zaalopvolging & Avondregime */}
              <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-2">
                <div className="font-black text-amber-950 uppercase text-[11px]">
                  Zaalopvolging & Avondregime (Vanaf 21:30)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11.5px]">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Je draagt een <strong>polo van de zaak</strong>.</li>
                    <li>Je zit niet constant op je GSM (echte vrienden kunnen wachten).</li>
                    <li><strong>We werken niet met oortjes in!</strong> Luister naar de gezelligheid, de collega's en de klanten.</li>
                    <li>Het personeel met tablet verwelkomt de klant en vermeldt het tafelnummer.</li>
                  </ul>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Vraag na de maaltijd of het heeft gesmaakt en ruim tafels zo spoedig mogelijk af. Een afgeruimde tafel moet meteen volledig schoon zijn.</li>
                    <li><strong>Na 21:30 uur:</strong> Dim de lichten lichtjes, zet de muziek een tikkeltje luider (geen Gunther D-muziek!) en plaats mandjes chips op de tafels. De bediening blijft doorlopen.</li>
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* 4. Eten & Personeelsvoordelen */}
          {(activeSection === 'all' || activeSection === 'voordelen') && (
            <section id="section-voordelen" className="bg-purple-50/50 rounded-2xl p-4 sm:p-5 border border-purple-200 space-y-3">
              <div className="flex items-center gap-2.5 text-purple-950 border-b border-purple-200 pb-2">
                <Utensils size={20} className="text-purple-700 shrink-0" />
                <h4 className="text-sm font-black uppercase tracking-tight">
                  4. 🍽 Eten & Personeelsvoordelen
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700">
                <div className="bg-white p-3.5 rounded-xl border border-purple-100 space-y-2">
                  <div className="font-black text-purple-900 uppercase text-[11px]">
                    Drankafspraken
                  </div>
                  <ul className="list-disc pl-5 space-y-1.5 text-[11.5px]">
                    <li><strong>Geen alcohol tijdens de shift:</strong> Ook niet als je getrakteerd wordt! Uiteraard kan je dan een lekkere frisdrank drinken.</li>
                    <li>Vraag je drank tijdens je shift (koffie, thee, chocomelk, frisdrank) even aan de tapper.</li>
                    <li><strong>Na je shift:</strong> Je mag <strong>1 normaal drankje</strong> nuttigen op kosten van de zaak. Daarna ben je klant en word je ook als klant behandeld (drank betalen, niet in sorteerkot of bijkeuken).</li>
                  </ul>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-purple-100 space-y-2">
                  <div className="font-black text-purple-900 uppercase text-[11px]">
                    Eten aan Personeelstarief (50%)
                  </div>
                  <ul className="list-disc pl-5 space-y-1.5 text-[11.5px]">
                    <li>Personeel kan tijdens, voor of na de shift aan de <strong>helft van de prijs (50%)</strong> eten. <strong>Je betaalt cash in de keuken en schrijft dit op het blad.</strong></li>
                    <li>Eten uit de keuken kan enkel bij <strong>shifts langer dan 6 uur</strong> en in overleg met de shiftverantwoordelijke.</li>
                    <li>Als je om 18u00 moet starten, gaan we er vanuit dat je reeds gegeten hebt.</li>
                    <li>Tijdens drukke momenten hebben klanten voorrang. Eten bestellen "omdat het kalm is" doen we niet; op rustige momenten voer je NPT's uit.</li>
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* 5. Niet-Prioritaire Taken (NPT's) */}
          {(activeSection === 'all' || activeSection === 'npt') && (
            <section id="section-npt" className="bg-cyan-50/50 rounded-2xl p-4 sm:p-5 border border-cyan-200 space-y-3">
              <div className="flex items-center gap-2.5 text-cyan-950 border-b border-cyan-200 pb-2">
                <Sparkles size={20} className="text-cyan-700 shrink-0" />
                <h4 className="text-sm font-black uppercase tracking-tight">
                  5. 🧹 Niet-Prioritaire Taken (NPT's)
                </h4>
              </div>
              <p className="text-[11.5px] text-cyan-950 font-bold">
                Te verrichten wanneer er even geen klanten zijn (geen stilstand, werk proactief):
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-[11.5px]">
                <div className="bg-white p-2.5 rounded-xl border border-cyan-100 flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">✓</span>
                  <span>Bierkaartjes & houders aanvullen (met QR-code naar de deur/klanten).</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-cyan-100 flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">✓</span>
                  <span>Peper, zout, pannenkoekensuiker, selderijzout, tabasco & ketchup bijvullen.</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-cyan-100 flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">✓</span>
                  <span>Chips en thee aanvullen.</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-cyan-100 flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">✓</span>
                  <span>Broodhoek opkuisen (mandjes, boter, servetten bijvullen).</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-cyan-100 flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">✓</span>
                  <span>Glazenleggers reinigen (ook onder de toog en bij sterke dranken).</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-cyan-100 flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">✓</span>
                  <span>Sanitair controleren: zeepbakje, toiletpapier & handdoekjes aanvullen.</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-cyan-100 flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">✓</span>
                  <span>Koffiehoek opruimen (bonen, melk, suiker, koekjes & frigo kuisen).</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-cyan-100 flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">✓</span>
                  <span>Bestekken steken, leeggoed sorteren & frigo's bijvullen.</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-cyan-100 flex items-start gap-2">
                  <span className="text-cyan-600 font-bold">✓</span>
                  <span>Stoelen en tafels (ook op terras) afkuisen & netjes rechtzetten.</span>
                </div>
              </div>
            </section>
          )}

          {/* 6. Checklist voor een Goede Sluiting */}
          {(activeSection === 'all' || activeSection === 'sluiting') && (
            <section id="section-sluiting" className="bg-orange-50/60 rounded-2xl p-4 sm:p-5 border-2 border-orange-300 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-orange-200 pb-3">
                <div className="flex items-center gap-2.5 text-orange-950">
                  <ClipboardList size={22} className="text-orange-600 shrink-0" />
                  <div>
                    <h4 className="text-sm sm:text-base font-black uppercase tracking-tight">
                      6. 🌙 📋 Checklist voor een Goede Sluiting
                    </h4>
                    <p className="text-[11px] text-orange-850 font-medium">
                      Interactieve afvinklijst voor de sluitploeg en hulpsluit. Vink taken af tijdens de sluiting.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetChecklist}
                  className="self-start sm:self-auto px-3 py-1 bg-white hover:bg-orange-100 border border-orange-300 text-orange-900 rounded-xl text-[11px] font-black uppercase flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>Lijst Wissen</span>
                </button>
              </div>

              {/* 6.1 Algemene Timing */}
              <div className="bg-white p-3.5 rounded-xl border border-orange-200 space-y-2">
                <div className="font-black text-orange-950 uppercase text-[11px]">
                  6.1. ⏱ Algemene Timing & Aanpak
                </div>
                <ul className="list-disc pl-5 space-y-1 text-[11.5px] text-slate-700">
                  <li><strong>Voorbereidend werk:</strong> Glazen afdrogen, frigo's aanvullen terwijl er nog klanten zitten.</li>
                  <li><strong>Volgorde van opruim:</strong> Tuinterras ➔ Terras vooraan ➔ Achterhuis ➔ Zaaltje ➔ Café ➔ Toog ➔ Achter toog.</li>
                  <li><strong>Tafels:</strong> Zet alle tafels symmetrisch. Stoelen onder de tafel 2 per 2 (terrassen), of op tafel (achterhuis, zaaltje, café).</li>
                  <li><strong>Stoelen:</strong> Stoelen pas op tafel zetten <strong>maximaal een half uur voor de reguliere sluitingstijd</strong>.</li>
                  <li><strong>Koffiemachine:</strong> Ten vroegste 1 uur voor sluitingstijd kuisen (ongeveer rond 00:00). Meestal voor hulpsluit.</li>
                  <li><strong>Contact met de klant:</strong> Vraag bij afsluiten van de tap of de laatste klanten nog "ne laatste van de zaak" wensen; zo kan jij verder werken en heeft de klant gezelschap.</li>
                </ul>
              </div>

              {/* 6.2 t/m 6.7 Checklists with click-to-check boxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 6.2 Aanvullen & Voorraad */}
                <div className="bg-white p-3.5 rounded-xl border border-orange-200 space-y-2">
                  <div className="font-black text-orange-950 uppercase text-[11px] flex items-center justify-between">
                    <span>6.2. 🧰 Aanvullen & Voorraad</span>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { id: 'c_frigo_koeling', text: 'Kleine frigo\'s: zet koeling af tijdens werken' },
                      { id: 'c_frigo_groot', text: 'Grote flessen frisdrank & wijn bijvullen (rode wijn in kast!)' },
                      { id: 'c_snacks', text: 'Chips aanvullen & chocolade controleren' },
                      { id: 'c_frigo_koffie', text: 'Frigo koffiemachine: melk, jenever, slagroom, Cécémel' },
                      { id: 'c_asbakken', text: 'Asbakken uitkuisen in wasbak bijkeuken' },
                      { id: 'c_grote_frigo', text: 'Grote frigo kamer aanvullen (zo, wo, do, vr na levering)' },
                      { id: 'c_bestekken', text: 'Al het afgewassen bestek in zakjes steken' }
                    ].map(item => (
                      <div
                        key={item.id}
                        onClick={() => toggleChecklistItem(item.id)}
                        className={`p-1.5 rounded-lg border text-[11px] font-medium flex items-center gap-2 cursor-pointer transition select-none ${
                          completedChecklistItems[item.id]
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 line-through'
                            : 'bg-slate-50 border-slate-200 hover:bg-orange-50/50 text-slate-800'
                        }`}
                      >
                        {completedChecklistItems[item.id] ? (
                          <CheckSquare size={14} className="text-emerald-600 shrink-0" />
                        ) : (
                          <Square size={14} className="text-slate-400 shrink-0" />
                        )}
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6.3 Koffiehoek & Vaatwasser */}
                <div className="bg-white p-3.5 rounded-xl border border-orange-200 space-y-2">
                  <div className="font-black text-orange-950 uppercase text-[11px]">
                    6.3. ☕ Koffiehoek & Vaatwasser
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { id: 'c_koffiemolens', text: 'Koffiemolens: borstelen, bakjes afwassen, afdrogen & bonen/deca bijvullen' },
                      { id: 'c_koppen_poeder', text: 'Elke kop kuisen met gesloten lepel & wit poeder, daarna dubbele naspoeling' },
                      { id: 'c_lepels_schuren', text: 'Lepels schuren met staalwol tot ze koperkleurig zijn (zwart eraf!)' },
                      { id: 'c_stomers', text: 'Stomers afkuisen met doek + sopje, en even openzetten (warm!)' },
                      { id: 'c_afloopbak', text: 'Afloopbak & rooster proper maken met sop (in vaatwasser)' },
                      { id: 'c_vaatwasser_uit', text: 'Vaatwasser leeglopen, filters kuisen en machine UIT zetten' },
                      { id: 'c_boppen_los', text: 'Boppen van koffiemachine uitkloppen en OP machine leggen (niet laten zitten!)' }
                    ].map(item => (
                      <div
                        key={item.id}
                        onClick={() => toggleChecklistItem(item.id)}
                        className={`p-1.5 rounded-lg border text-[11px] font-medium flex items-center gap-2 cursor-pointer transition select-none ${
                          completedChecklistItems[item.id]
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 line-through'
                            : 'bg-slate-50 border-slate-200 hover:bg-orange-50/50 text-slate-800'
                        }`}
                      >
                        {completedChecklistItems[item.id] ? (
                          <CheckSquare size={14} className="text-emerald-600 shrink-0" />
                        ) : (
                          <Square size={14} className="text-slate-400 shrink-0" />
                        )}
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6.4 Bijkeuken & Toog (Tap & Afwas) */}
                <div className="bg-white p-3.5 rounded-xl border border-orange-200 space-y-2">
                  <div className="font-black text-orange-950 uppercase text-[11px]">
                    6.4. 🚰 Bijkeuken & Toog (Afwas & Tap)
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { id: 'c_bijkeuken_javel', text: 'Bijkeuken: afwasbakken proper & Javel in elke afvoer' },
                      { id: 'c_toog_glazen', text: 'Alle glazen afdrogen en even laten uitdampen' },
                      { id: 'c_toog_afwas_javel', text: 'Wasbakken leegmaken & Javel in afvoeren via trechter' },
                      { id: 'c_stella_water', text: 'Stella op water zetten en aftappen met darmpje' },
                      { id: 'c_toog_kranen', text: 'Toog spoelen met water, sopje, kranen zelf afkuisen' },
                      { id: 'c_toog_azijn', text: 'Heel de toog opblinken met een beetje azijn & marmer afwassen' },
                      { id: 'c_acide_dicht', text: 'Water & acide Stella afzetten; algemene acidekraan dichtzetten' },
                      { id: 'c_droge_handdoek_frigo', text: 'Met droge handdoek onder de frigodeuren (condens drogen)' }
                    ].map(item => (
                      <div
                        key={item.id}
                        onClick={() => toggleChecklistItem(item.id)}
                        className={`p-1.5 rounded-lg border text-[11px] font-medium flex items-center gap-2 cursor-pointer transition select-none ${
                          completedChecklistItems[item.id]
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 line-through'
                            : 'bg-slate-50 border-slate-200 hover:bg-orange-50/50 text-slate-800'
                        }`}
                      >
                        {completedChecklistItems[item.id] ? (
                          <CheckSquare size={14} className="text-emerald-600 shrink-0" />
                        ) : (
                          <Square size={14} className="text-slate-400 shrink-0" />
                        )}
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6.5 & 6.6 & 6.7 Kassa, Tafels & Varia */}
                <div className="bg-white p-3.5 rounded-xl border border-orange-200 space-y-2">
                  <div className="font-black text-orange-950 uppercase text-[11px]">
                    6.5 - 6.7. 💶 Kassa, Tafels & Varia
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { id: 'c_kassa_blad', text: 'Kassablad invullen (Datum, Naam), briefjes zelfde richting' },
                      { id: 'c_kassa_rekenen', text: 'Subtotaal - Beginkassa + Uitgaven = Totaal' },
                      { id: 'c_enveloppe', text: 'Geld in de enveloppe steken, beginkassa morgen noteren' },
                      { id: 'c_drankkaarten', text: 'Drankkaarten opdienkant met QR naar deur; peper & zout erachter' },
                      { id: 'c_stoelen_omhoog', text: 'Stoelen & barkrukken omhoog zetten, tafels grondig afkuisen' },
                      { id: 'c_openers_printer', text: 'Prikkers, openers & kurkentrekker voor barticketprinter leggen' },
                      { id: 'c_ipads_laden', text: 'Controleer of alle iPads aan het opladen zijn!' },
                      { id: 'c_luifels', text: 'Luifels buiten volledig dichtdraaien' },
                      { id: 'c_wasmand_boven', text: 'Natte handdoeken in wasmand onder ijsmachine; naar boven brengen' }
                    ].map(item => (
                      <div
                        key={item.id}
                        onClick={() => toggleChecklistItem(item.id)}
                        className={`p-1.5 rounded-lg border text-[11px] font-medium flex items-center gap-2 cursor-pointer transition select-none ${
                          completedChecklistItems[item.id]
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 line-through'
                            : 'bg-slate-50 border-slate-200 hover:bg-orange-50/50 text-slate-800'
                        }`}
                      >
                        {completedChecklistItems[item.id] ? (
                          <CheckSquare size={14} className="text-emerald-600 shrink-0" />
                        ) : (
                          <Square size={14} className="text-slate-400 shrink-0" />
                        )}
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 7. Lichtplan (Ter info) */}
          {(activeSection === 'all' || activeSection === 'lichtplan') && (
            <section id="section-lichtplan" className="bg-yellow-50/60 rounded-2xl p-4 sm:p-5 border border-yellow-200 space-y-3">
              <div className="flex items-center gap-2.5 text-yellow-950 border-b border-yellow-200 pb-2">
                <Lightbulb size={20} className="text-yellow-700 shrink-0" />
                <h4 className="text-sm font-black uppercase tracking-tight">
                  💡 LICHTPLAN (Exacte Knoplocaties per Ruimte)
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-[11.5px]">
                <div className="bg-white p-2.5 rounded-xl border border-yellow-200">
                  <strong>Spots boven toog:</strong> Knop tussen frigodeuren en Wolf-logo.
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-yellow-200">
                  <strong>Lusters toog & tafels:</strong> Drukken op draaiknop achter het Wolf-logo.
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-yellow-200">
                  <strong>Toilet en gangetje:</strong> Aan de deur van de toiletten.
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-yellow-200">
                  <strong>Licht aan tafel 8-9:</strong> Ronde knop naast deur naar achterkeuken.
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-yellow-200">
                  <strong>Buitenverlichting:</strong> 2 knoppen met lampje naast deur naar achterkeuken.
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-yellow-200">
                  <strong>Lichten in raamkozijnen:</strong> Boven de inkom (schakelaar-stekker) én aan tafel 12.
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-yellow-200">
                  <strong>Licht klein zaaltje:</strong> Ronde knop aan tafel Z100 of schakelaar trap wagon.
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-yellow-200">
                  <strong>Achterhuis:</strong> Schakelaars bij binnenkomst rechts (niet aparte schakelaar!) & ±4m voor achterdeur.
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-yellow-200">
                  <strong>Tuinterras:</strong> Binnenkomst achterhuis rechts (aparte knop) én onder afdakje werkhuis rechts.
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-yellow-200">
                  <strong>Wagon:</strong> In de kast 2 ronde knoppen (midden & zijkant) én kleine draaiknop (LED aan ramen).
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-yellow-200">
                  <strong>Sorteerkot:</strong> Bij binnenkomst direct rechts; achteraan links van inham.
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-yellow-200">
                  <strong>Laatste licht keuken:</strong> Tegen de muur rechts als je aan de uitgang staat.
                </div>
              </div>
            </section>
          )}

          {/* 8. Verwarming voor de Nacht */}
          {(activeSection === 'all' || activeSection === 'verwarming') && (
            <section id="section-verwarming" className="bg-rose-50/60 rounded-2xl p-4 sm:p-5 border border-rose-200 space-y-3">
              <div className="flex items-center gap-2.5 text-rose-950 border-b border-rose-200 pb-2">
                <Thermometer size={20} className="text-rose-700 shrink-0" />
                <h4 className="text-sm font-black uppercase tracking-tight">
                  🌡 VERWARMING VOOR DE NACHT
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11.5px]">
                <div className="bg-white p-3 rounded-xl border border-rose-200">
                  <div className="font-black text-rose-900 uppercase text-xs mb-1">Café</div>
                  Thermostaat aan de deur naar de grote frigo: <strong>Zet op UIT.</strong>
                </div>
                <div className="bg-white p-3 rounded-xl border border-rose-200">
                  <div className="font-black text-rose-900 uppercase text-xs mb-1">Wagon & Achterhuis</div>
                  Bij binnenkomst achterhuis links: <strong>thermostaat & schakelaar.</strong>
                </div>
                <div className="bg-white p-3 rounded-xl border border-rose-200">
                  <div className="font-black text-rose-900 uppercase text-xs mb-1">Toilet (WC)</div>
                  Thermostatische kraan aan de verwarming controleren.
                </div>
              </div>
            </section>
          )}

          {/* 9. Slotcontrole (Cruciaal!) */}
          {(activeSection === 'all' || activeSection === 'slotcontrole') && (
            <section id="section-slotcontrole" className="bg-red-50 rounded-2xl p-4 sm:p-5 border-2 border-red-500 space-y-3">
              <div className="flex items-center gap-2.5 text-red-950 border-b border-red-200 pb-2">
                <Lock size={22} className="text-red-600 shrink-0" />
                <div>
                  <h4 className="text-sm sm:text-base font-black uppercase tracking-tight text-red-950">
                    🔒 SLOTCONTROLE (Cruciaal voor de veiligheid!)
                  </h4>
                  <p className="text-[11px] text-red-800 font-bold">
                    Volg deze 6 stappen nauwgezet bij het verlaten van het pand:
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { num: 1, title: 'Koelcellen', desc: 'Licht van de koelcellen (zowel van drank als van eten) UITDOEN.' },
                  { num: 2, title: 'Achterdeur', desc: 'CONTROLEER of de achterdeur op slot is (sleutel hangt rechts aan het kastje boven de Vedettbakken).' },
                  { num: 3, title: 'Schuiframen', desc: 'Controleer of de schuiframen van het achterhuis in het slot zijn.' },
                  { num: 4, title: 'Voordeur', desc: 'Voordeur (houten deur) dicht doen en hendel sluiten.' },
                  { num: 5, title: 'Keukenlicht', desc: 'Laatste licht in de keuken uitdoen.' },
                  { num: 6, title: 'Buitengaan (Keukendeur)', desc: 'Zorg dat de deur van de keuken in slot valt. TREK ER EXTRA AAN TER CONTROLE!' }
                ].map(step => (
                  <div
                    key={step.num}
                    className="bg-white p-3 rounded-xl border border-red-200 flex items-start gap-3 shadow-2xs"
                  >
                    <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                      {step.num}
                    </span>
                    <div>
                      <span className="font-black text-xs uppercase text-red-950 block">
                        {step.title}
                      </span>
                      <p className="text-[11.5px] text-slate-800 leading-relaxed font-medium">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
