import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ArrowLeftRight, 
  Sparkles, 
  Copy, 
  Check, 
  Users, 
  Megaphone,
  Smartphone,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface StaffGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StaffGuideModal({ isOpen, onClose }: StaffGuideModalProps) {
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleCopyWhatsAppGuide = () => {
    const guideText = `👋 *Beste collega's van In De Molen!*

Vanaf nu gebruiken we dit handige online personeelsportaal voor onze planning en communicatie. Hier is een kort stappenplan:

👉 *1. Open de link op je smartphone of pc:*
Selecteer bovenaan je eigen naam om je persoonlijke pagina te zien.

📅 *2. Bekijk je rooster & klik op 'Bevestigen':*
Onder 'Mijn Rooster' zie je wanneer je bent ingepland. Klik op "Bevestigen als Gezien" zodat Hans weet dat je op de hoogte bent! Tip: je kunt je uren met 1 klik toevoegen aan je Google of Apple Agenda.

✨ *3. Geef je beschikbaarheid door (op tijd!):*
Ga naar 'Doorgeven Beschikbaarheid'. Duid per dag aan of je beschikbaar bent (groen), niet-beschikbaar (rood), of met voorkeursuren (bijv. vanaf 17:00). Doe dit minstens 2 weken op voorhand!

🔄 *4. Dienst ruilen of overdragen:*
Kan je onverwacht toch niet? Ga naar 'Ruilen / Overdragen', kies je shift en geef de reden in. Zodra de beheerder goedkeurt, wisselt het rooster automatisch.

📢 *5. Mededelingen & Collega's:*
Check het mededelingenbord voor belangrijk café-nieuws en vind onder 'Collega's' elkaars nummer om snel te bellen of appen.

Heb je vragen? Vraag het gerust aan Hans! Tot snel op de vloer! 🍻`;

    navigator.clipboard.writeText(guideText).then(() => {
      setCopiedWhatsApp(true);
      setTimeout(() => setCopiedWhatsApp(false), 3000);
    });
  };

  const steps = [
    {
      num: 1,
      title: "Selecteer jouw naam",
      badge: "Eerste stap",
      icon: Users,
      color: "bg-blue-500 text-white",
      desc: "Open de link op je smartphone of computer en kies jouw naam in de lijst bovenaan. Bij de eerste keer kun je meteen je GSM-nummer en e-mailadres controleren.",
      tip: "Je hebt geen wachtwoord nodig voor het personeelsportaal; je komt direct op jouw persoonlijke pagina terecht."
    },
    {
      num: 2,
      title: "Bekijk je rooster & Bevestig je uren",
      badge: "Belangrijk!",
      icon: Calendar,
      color: "bg-orange-500 text-white",
      desc: "In het tabblad 'Mijn Rooster' zie je precies op welke dagen en uren je staat ingepland (in de Zaal of in de Keuken). Klik op de oranje knop 'Bevestigen als Gezien'. Zo weet de beheerder zeker dat je aanwezig zult zijn.",
      tip: "Met de knoppen 'Google Agenda' of 'Apple Agenda' zet je jouw shifts direct in je smartphone-agenda."
    },
    {
      num: 3,
      title: "Geef je beschikbaarheid door (6 weken vooruit)",
      badge: "Min. 2 weken op voorhand",
      icon: Sparkles,
      color: "bg-amber-500 text-white",
      desc: "Ga naar 'Doorgeven Beschikbaarheid'. Kies de gewenste week en klik per dag op Beschikbaar (groen), Niet-beschikbaar (rood), of Beschikbaar met uren (bijv. pas vanaf 17:00 of tot 22:00). Klik onderaan op 'Opslaan'.",
      tip: "Voeg gerust een opmerking toe (zoals 'examens', 'verlof' of 'voetbalmatch'). De planning wordt hier automatisch op afgestemd!"
    },
    {
      num: 4,
      title: "Dienst ruilen of overdragen",
      badge: "Als je niet-beschikbaar bent",
      icon: ArrowLeftRight,
      color: "bg-purple-500 text-white",
      desc: "Kun je onverhoopt een ingeplande dienst niet werken? Ga naar 'Ruilen / Overdragen'. Kies de betreffende dienst, leg kort uit waarom, en kies eventueel de collega met wie je al gesproken hebt.",
      tip: "Zodra Hans (de beheerder) het ruilverzoek goedkeurt, wordt het rooster vanzelf aangepast en krijgt iedereen bericht."
    },
    {
      num: 5,
      title: "Mededelingenbord & Telefoonnummers",
      badge: "Altijd op de hoogte",
      icon: Megaphone,
      color: "bg-emerald-500 text-white",
      desc: "Onder 'Mededelingen' lees je belangrijke updates over het café, speciale evenementen en sluitingsdagen. In de tab 'Collega's' vind je de contactgegevens van het hele team om elkaar snel te bereiken.",
      tip: "Met één klik kun je een collega direct bellen of een WhatsApp-bericht sturen."
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-[fadeIn_0.15s_ease-out]">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border-2 border-orange-200 overflow-hidden my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition active:scale-90 cursor-pointer"
            title="Sluiten"
          >
            <X size={18} />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <BookOpen size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-200">Handleiding & Gids</span>
              <h2 className="text-xl font-black uppercase tracking-tight">Wat kun je doen op deze site?</h2>
            </div>
          </div>
          <p className="text-xs text-orange-100 font-medium leading-relaxed max-w-xl">
            Welkom bij het personeelsportaal van <strong>Eet-staminée In De Molen</strong>! Hieronder vind je in 5 duidelijke stappen hoe je je rooster bekijkt, je uren doorgeeft en diensten regelt.
          </p>
        </div>

        {/* WhatsApp Share Copy Bar */}
        <div className="bg-amber-50 border-b border-amber-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-amber-950">
            <Smartphone size={16} className="text-amber-600 shrink-0" />
            <span className="font-semibold">Wil je dit stappenplan delen in de team-WhatsApp?</span>
          </div>
          <button
            onClick={handleCopyWhatsAppGuide}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center space-x-1.5 transition active:scale-95 shadow-sm shrink-0 cursor-pointer"
          >
            {copiedWhatsApp ? (
              <>
                <Check size={14} className="stroke-[3]" />
                <span>Gekopieerd naar Klembord!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Kopieer tekst voor WhatsApp 📲</span>
              </>
            )}
          </button>
        </div>

        {/* Steps List */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {steps.map((step) => {
            const Icon = step.icon;
            const isExpanded = activeStep === step.num;
            return (
              <div 
                key={step.num}
                className="bg-slate-50 hover:bg-orange-50/40 border-2 border-slate-200 hover:border-orange-200 rounded-2xl p-4 transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-9 h-9 rounded-xl ${step.color} flex items-center justify-center font-black text-sm shrink-0 shadow-sm mt-0.5`}>
                    {step.num}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                        {step.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200">
                        {step.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-650 leading-relaxed font-medium mb-2">
                      {step.desc}
                    </p>
                    <div className="bg-white border border-slate-200 rounded-xl p-2.5 text-[11px] text-slate-600 flex items-start gap-2">
                      <span className="text-amber-500 font-bold shrink-0">💡 Tip:</span>
                      <span className="font-semibold text-slate-700">{step.tip}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Extra Notes for Staff */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-4 text-emerald-950 flex items-start space-x-3">
            <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-black uppercase tracking-tight text-emerald-900 block">Altijd veilig en up-to-date</span>
              <p className="text-emerald-800 font-medium leading-relaxed">
                Alles wat je invult wordt direct opgeslagen in de beveiligde Google Cloud van In De Molen. Je hoeft je geen zorgen te maken over verloren gegevens!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase tracking-tight rounded-xl shadow-md transition active:scale-95 cursor-pointer"
          >
            Begrepen, Sluiten ✓
          </button>
        </div>

      </div>
    </div>
  );
}
