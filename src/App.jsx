import React, { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  FileText, 
  Camera, 
  Zap, 
  Ship, 
  Monitor, 
  ChevronRight, 
  ChevronLeft,
  RotateCcw,
  AlertTriangle,
  Users,
  HardHat,
  Cpu,
  ShoppingBag,
  ArrowRight,
  Printer,
  X,
  ExternalLink
} from 'lucide-react';

// --- KONFIGURACJA GOOGLE ANALYTICS ---
const GA_TRACKING_ID = ""; // Wpisz tutaj swój identyfikator, np. "G-XXXXXXXXXX"

const COMMON_ERRORS = [
  {
    category: "Wymagane Dokumenty",
    errors: [
      "Brak oświadczenia o sposobie zarządzania majątkiem we wniosku końcowym.",
      "Brak wydruków z wyodrębnionej ewidencji księgowej (analityki) potwierdzającej kodowanie wydatków.",
      "Brak zdjęć zakupionych środków trwałych oraz działań promocyjnych (plakatów/naklejek).",
      "Niepełne plany amortyzacji – dostarczane tylko na bieżący rok zamiast na cały okres."
    ]
  },
  {
    category: "Terminy i PKD",
    errors: [
      "Złożenie wniosku końcowego po terminie realizacji projektu (nawet o 1 dzień).",
      "Brak aktualizacji kodów PKD w CEIDG/KRS przed zakończeniem realizacji przedsięwzięcia.",
      "Realizacja zadań przed lub po terminach wskazanych w harmonogramie bez wcześniejszego aneksu."
    ]
  },
  {
    category: "Wskaźniki i Nowe Usługi",
    errors: [
      "Brak dowodów (paragony, faktury, oferty) potwierdzających faktyczne rozpoczęcie świadczenia nowej usługi.",
      "Niezgodność liczby środków trwałych w dokumentach OT ze wskaźnikami we wniosku (np. zestaw vs sztuki).",
      "Brak zaświadczenia od operatora o przyłączeniu do sieci w przypadku fotowoltaiki."
    ]
  },
  {
    category: "Zamówienia i Płatności",
    errors: [
      "Brak kompletu dokumentów z Bazy Konkurencyjności (brak ofert odrzuconych, brak protokołów).",
      "Błędne kwoty w zestawieniu wydatków – rozbieżności między wnioskiem a faktycznymi fakturami.",
      "Brak obowiązkowych umów z wykonawcami dla zakupów powyżej 80 tys. zł netto."
    ]
  }
];

const App = () => {
  const [step, setStep] = useState(1);
  const [showErrors, setShowErrors] = useState(false);
  const [formData, setFormData] = useState({
    wopType: '', // 'partial' | 'final'
    isWatercraft: false,
    indicators: [], // 'const_obj', 'wnip', 'fixed_assets', 'training_count', 'digital_skills', 'other_skills', 'advisory_count', 'green_corp', 'digital_corp'
    competitiveProcedure: false,
    orderAbove80k: false
  });

  const totalSteps = 4;

  // --- LOGIKA GOOGLE ANALYTICS ---
  useEffect(() => {
    if (!GA_TRACKING_ID) return;

    // Ładowanie skryptu gtag.js
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', GA_TRACKING_ID);
    window.gtag = gtag;
  }, []);

  // Śledzenie zmiany kroków i otwierania modala
  useEffect(() => {
    if (typeof window.gtag !== 'function') return;

    const pageName = showErrors ? 'najczestsze_bledy' : `krok_${step}`;
    window.gtag('event', 'page_view', {
      page_title: pageName,
      page_location: window.location.href,
      page_path: `/${pageName}`
    });
  }, [step, showErrors]);

  const handleCheckboxChange = (field) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const toggleArrayItem = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item) 
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const handlePrint = () => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'generate_pdf', {
        event_category: 'engagement',
        event_label: formData.wopType
      });
    }
    window.print();
  };

  // Logika generowania listy dokumentów i ostrzeżeń
  const checklist = useMemo(() => {
    const docs = [];
    const tips = [];

    const isGreen = formData.indicators.includes('green_corp');
    const isDigital = formData.indicators.includes('digital_corp');

    // --- DOKUMENTY OGÓLNE ---
    docs.push({ id: 'inv', title: 'Faktury i dokumenty księgowe', desc: 'Poprawnie opisane, z numerem umowy i zadania.' });
    docs.push({ id: 'pay', title: 'Potwierdzenia płatności', desc: 'Wyciągi bankowe lub potwierdzenia przelewów dla każdego wydatku.' });
    
    if (formData.orderAbove80k) {
      docs.push({ id: 'contract', title: 'Umowa z wykonawcą/dostawcą', desc: 'Obowiązkowa dla wydatków/zamówień powyżej 80 tys. zł brutto.' });
    }

    if (formData.competitiveProcedure) {
      docs.push({ id: 'bk', title: 'Komplet z Bazy Konkurencyjności', desc: 'Ogłoszenie z załącznikami, wszystkie złożone oferty, protokół wyboru, umowy.' });
      tips.push('Pamiętaj: Sumuj wydatki tożsame przedmiotowo, podmiotowo i czasowo przy badaniu progu 80 tys. zł netto zamówienia.');
      tips.push('Dokumenty potwierdzające szacowanie wartości zamówienia są wymagane na każde wezwanie Operatora.');
    }

    // --- WSKAŹNIKI I KOMPONENTY ---
    
    // Roboty budowlane
    if (formData.indicators.includes('const_obj')) {
      docs.push({ id: 'const_prot', title: 'Protokół odbioru robót / Świadectwo ukończenia', desc: 'Protokół odbioru robót budowlanych oraz ewentualne pozwolenie na użytkowanie.' });
    }

    // Środki Trwałe i WNiP
    if (formData.indicators.includes('fixed_assets') || formData.indicators.includes('wnip')) {
      docs.push({ id: 'ot_ew', title: 'OT / Ewidencja Środków Trwałych', desc: 'Dokumenty potwierdzające przyjęcie do użytkowania oraz plan amortyzacji na cały okres.' });
      tips.push('UWAGA: Wydatki poniżej 10 tys. zł muszą być ujęte jako amortyzowane środki trwałe, aby kwalifikować się do refundacji.');
    }

    // Szkolenia
    if (formData.indicators.includes('training_count') || formData.indicators.includes('digital_skills') || formData.indicators.includes('other_skills')) {
      docs.push({ id: 'train_cert', title: 'Zaświadczenia o szkoleniu / Raport końcowy', desc: 'Szczegóły treści, daty oraz potwierdzenie nabycia kompetencji.' });
      docs.push({ id: 'train_survey', title: 'Ankiety uczestników szkolenia', desc: 'Dane w podziale na płeć i grupy wiekowe (0-17, 18-29, 30-54, 55+).' });
    }

    // Doradztwo
    if (formData.indicators.includes('advisory_count')) {
      docs.push({ id: 'adv_report', title: 'Raport końcowy z usługi doradczej', desc: 'Dokument przygotowany przez wykonawcę opisujący zrealizowane usługi.' });
    }

    // Transformacje (wykrywane ze wskaźników)
    if (isGreen) {
      tips.push('Zielona transformacja: W przypadku fotowoltaiki dołącz zaświadczenie o przyłączeniu do sieci.');
    }

    // --- SPECYFICZNE CECHY ---
    if (formData.isWatercraft) {
      docs.push({ id: 'ship_reg', title: 'Rejestracja i ubezpieczenie jednostki', desc: 'Dowód rejestracji komercyjnej oraz polisa ubezpieczeniowa do celów komercyjnych.' });
      docs.push({ id: 'ship_marina', title: 'Umowa na korzystanie z mariny', desc: 'Wymagana, chyba że posiadasz własny dostęp do zbiornika (wskazać w oświadczeniu).' });
    }

    // --- WNIOSEK KOŃCOWY ---
    if (formData.wopType === 'final') {
      docs.push({ id: 'final_mgmt', title: 'Oświadczenie dot. zarządzania majątkiem', desc: 'Oświadczenie o trwałości, zgodne z wymogami projektu.' });
      docs.push({ id: 'final_promo', title: 'Dokumentacja promocyjna', desc: 'Zdjęcia plakatów, naklejek informacyjnych na sprzętach itp.' });
      docs.push({ id: 'final_ledger', title: 'Potwierdzenie wyodrębnionej ewidencji', desc: 'Dokumentacja potwierdzająca stosowanie osobnego kodu księgowego.' });
      docs.push({ id: 'final_offer', title: 'Dowody włączenia nowej usługi do oferty', desc: 'Cenniki, menu, faktury lub paragony potwierdzające pierwszą sprzedaż.' });
      
      tips.push('Sprawdź, czy wskazane we wniosku kody PKD rozszerzonej działalności zostały już ujęte w dokumentach rejestrowych (CEIDG/KRS).');
    }

    tips.push('Każdy dokument musi być zgodny z metodą weryfikacji wskazaną we wniosku o wsparcie.');

    return { docs, tips };
  }, [formData]);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-xl font-semibold text-slate-800">Krok 1: Typ wniosku</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => setFormData({...formData, wopType: 'partial'})}
                className={`p-4 border-2 rounded-xl text-left transition-all ${formData.wopType === 'partial' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-200'}`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <FileText className={formData.wopType === 'partial' ? 'text-blue-500' : 'text-slate-400'} />
                  <span className="font-bold">Wniosek częściowy</span>
                </div>
                <p className="text-xs text-slate-500">Rozliczasz wybrany etap przedsięwzięcia.</p>
              </button>
              <button 
                onClick={() => setFormData({...formData, wopType: 'final'})}
                className={`p-4 border-2 rounded-xl text-left transition-all ${formData.wopType === 'final' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-200'}`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <CheckCircle className={formData.wopType === 'final' ? 'text-blue-500' : 'text-slate-400'} />
                  <span className="font-bold">Wniosek końcowy</span>
                </div>
                <p className="text-xs text-slate-500">Zamykasz i rozliczasz całe przedsięwzięcie.</p>
              </button>
            </div>

            <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl flex gap-4 items-center">
              <Info size={24} className="text-blue-600 shrink-0" />
              <p className="text-sm text-blue-800 font-medium">
                Prawidłowość i kompletność złożonego wniosku o płatność ma największy wpływ na czas oceny i wypłaty refundacji.
              </p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-xl font-semibold text-slate-800">Krok 2: Wskaźniki do rozliczenia</h2>
            <p className="text-xs text-slate-500 mb-4 font-medium uppercase tracking-wider">Wybierz wskaźniki, które chcesz rozliczyć w tym wniosku:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                {id: 'const_obj', label: 'Liczba obiektów (roboty budowlane)', icon: <HardHat size={16}/>},
                {id: 'fixed_assets', label: 'Liczba nabytych środków trwałych', icon: <ShoppingBag size={16}/>},
                {id: 'wnip', label: 'Liczba nabytych WNiP', icon: <Cpu size={16}/>},
                {id: 'training_count', label: 'Liczba przeprowadzonych szkoleń', icon: <Users size={16}/>},
                {id: 'digital_skills', label: 'Uczestnicy (kompetencje cyfrowe)', icon: <Monitor size={16}/>},
                {id: 'other_skills', label: 'Uczestnicy (pozostałe szkolenia)', icon: <Users size={16}/>},
                {id: 'advisory_count', label: 'Liczba usług doradczych', icon: <Info size={16}/>},
                {id: 'green_corp', label: 'Zielona transformacja przedsiębiorstwa', icon: <Zap size={16}/>},
                {id: 'digital_corp', label: 'Cyfrowa transformacja przedsiębiorstwa', icon: <Monitor size={16}/>}
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => toggleArrayItem('indicators', item.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${formData.indicators.includes(item.id) ? 'bg-slate-800 text-white border-slate-800 shadow-md scale-[1.02]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  <span className={formData.indicators.includes(item.id) ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                  <span className="text-xs font-semibold leading-tight">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-xl font-semibold text-slate-800">Krok 3: Szczegóły realizacji</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Ship size={20}/></div>
                  <span className="text-sm font-medium">Czy rozliczane wydatki obejmują zakup jednostek pływających?</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={formData.isWatercraft} 
                  onChange={() => handleCheckboxChange('isWatercraft')}
                  className="w-5 h-5 accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 text-slate-600 rounded-lg"><Info size={20}/></div>
                  <span className="text-sm font-medium">Czy realizowano zamówienia w Bazie Konkurencyjności (zakupy powyżej 80 tys. zł netto)?</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={formData.competitiveProcedure} 
                  onChange={() => handleCheckboxChange('competitiveProcedure')}
                  className="w-5 h-5 accent-slate-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><ShoppingBag size={20}/></div>
                  <span className="text-sm font-medium">Czy wniosek obejmuje wydatki o wartości powyżej 80 tys. zł? (wymagana umowa)</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={formData.orderAbove80k} 
                  onChange={() => handleCheckboxChange('orderAbove80k')}
                  className="w-5 h-5 accent-orange-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8 animate-in zoom-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Twoja lista kontrolna</h2>
                <p className="text-slate-500">Zestawienie dokumentów przygotowane zgodnie z Przewodnikiem Kwalifikowalności.</p>
              </div>
              <button 
                onClick={handlePrint}
                className="print:hidden flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                <Printer size={20} /> Zapisz jako PDF / Drukuj
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-bold text-slate-800 uppercase tracking-wider text-xs">
                  <FileText size={16} className="text-blue-500" /> Dokumentacja do MGD
                </h3>
                <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-sm overflow-hidden print:shadow-none print:border-slate-300">
                  {checklist.docs.map(doc => (
                    <div key={doc.id} className="p-4 flex gap-4 hover:bg-slate-50 transition-colors">
                      <div className="mt-1 print:hidden"><input type="checkbox" className="w-5 h-5 rounded border-slate-300" /></div>
                      <div>
                        <p className="font-semibold text-slate-800 leading-tight text-sm">{doc.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{doc.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-bold text-slate-800 uppercase tracking-wider text-xs">
                  <AlertTriangle size={16} className="text-orange-500" /> Uwagi merytoryczne
                </h3>
                <div className="space-y-3">
                  {checklist.tips.map((tip, idx) => (
                    <div key={idx} className="flex gap-3 p-4 bg-orange-50 border border-orange-100 rounded-xl text-orange-800 print:bg-white print:border-orange-300">
                      <AlertCircle size={18} className="shrink-0" />
                      <p className="text-xs font-medium leading-relaxed">{tip}</p>
                    </div>
                  ))}
                  <div className="p-4 bg-slate-900 rounded-xl text-white text-xs print:bg-white print:text-slate-800 print:border print:border-slate-300">
                    <p className="font-bold mb-2 flex items-center gap-2 text-blue-400 print:text-blue-700 uppercase tracking-widest text-[10px]">
                      <ArrowRight size={12} /> Standardy przesyłania plików:
                    </p>
                    <ul className="space-y-2 text-slate-300 print:text-slate-600">
                      <li>• Łącz powiązane dokumenty w jeden plik PDF (nie przesyłaj pojedynczych stron).</li>
                      <li>• Nadawaj plikom czytelne nazwy (np. <span className="text-blue-300 print:text-blue-700">Faktura_1_Zadanie_2.pdf</span>).</li>
                      <li>• Sprawdź czytelność skanów – dokumenty nieczytelne nie zostaną uznane.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-slate-200 flex justify-center print:hidden">
              <button 
                onClick={() => { setStep(1); setFormData({wopType: '', isWatercraft: false, indicators: [], competitiveProcedure: false, orderAbove80k: false}); }}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium text-sm"
              >
                <RotateCcw size={18} /> Wyczyść i zacznij od nowa
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900 selection:bg-blue-100 print:bg-white print:p-0">
      {/* Modal - Najczęstsze błędy */}
      {showErrors && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 print:hidden">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-slate-900 p-6 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-orange-400" />
                <h3 className="font-bold text-lg">Najczęstsze błędy we wnioskach</h3>
              </div>
              <button onClick={() => setShowErrors(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 md:p-8 overflow-y-auto max-h-[70vh] space-y-6">
              {COMMON_ERRORS.map((group, idx) => (
                <div key={idx} className="space-y-3">
                  <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest">{group.category}</h4>
                  <ul className="space-y-2">
                    {group.errors.map((error, eIdx) => (
                      <li key={eIdx} className="flex gap-3 text-sm text-slate-700 leading-relaxed group">
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-xs text-blue-800 font-medium text-center">
                  Uniknięcie powyższych błędów może skrócić czas zatwierdzania Twojego wniosku nawet o 2-3 tygodnie.
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setShowErrors(false)}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors"
              >
                Rozumiem, wracam do listy
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
              <span className="bg-blue-600 text-white px-2 py-0.5 rounded shadow-lg shadow-blue-200 print:shadow-none">HoReCa</span> Asystent WoP
            </h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Inteligentny przewodnik po rozliczeniach KPO</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button 
              onClick={() => setShowErrors(true)}
              className="print:hidden flex items-center gap-2 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full hover:bg-orange-100 transition-all border border-orange-200 shadow-sm"
            >
              <AlertTriangle size={14} /> Zobacz najczęstsze błędy
            </button>
            <div className="hidden sm:block text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Inwestycja A1.2.1</p>
              <p className="text-xs font-bold text-blue-600/60">Region 5: Wielkopolska, Lubuskie, Dolnośląskie</p>
            </div>
          </div>
        </div>

        {/* Progress Navigation */}
        {step < 4 && (
          <div className="mb-10 print:hidden">
            <div className="flex justify-between items-end mb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-1">Krok {step} z 3</span>
                <h3 className="text-sm font-bold text-slate-700">
                  {step === 1 && "Określenie typu wniosku"}
                  {step === 2 && "Wybór rozliczanych wskaźników"}
                  {step === 3 && "Weryfikacja procedur i wydatków"}
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-400">{Math.round(((step-1) / 3) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                style={{ width: `${((step-1) / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 p-6 md:p-10 mb-8 transition-all print:shadow-none print:border-none print:p-0">
          {renderStep()}
        </div>

        {/* Bottom Navigation */}
        {step < 4 && (
          <div className="flex justify-between items-center px-2 print:hidden">
            <button
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${step === 1 ? 'text-slate-300' : 'text-slate-600 hover:bg-white hover:shadow-lg active:scale-95'}`}
            >
              <ChevronLeft size={20} /> Wstecz
            </button>
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 && !formData.wopType}
              className={`flex items-center gap-2 px-10 py-4 rounded-2xl font-bold transition-all ${step === 1 && !formData.wopType ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-blue-600 hover:shadow-xl shadow-slate-300 active:scale-95 group'}`}
            >
              {step === 3 ? 'Generuj listę dokumentów' : 'Kontynuuj'} <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-12 text-center max-w-2xl mx-auto print:mt-8">
          <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
            Wygenerowano: {new Date().toLocaleDateString('pl-PL')} o godzinie {new Date().toLocaleTimeString('pl-PL', {hour: '2-digit', minute:'2-digit'})}. Aplikacja ma charakter doradczy. Ostateczna ocena należy do Operatora Inwestycji A1.2.1 KPO.
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;