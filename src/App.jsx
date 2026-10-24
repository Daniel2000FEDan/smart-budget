import React, { useState, useEffect, useMemo } from 'react';
import {
  Wallet, PiggyBank, Receipt, Plus, Trash2,
  ChevronDown, ChevronUp, ArrowRightLeft, TrendingDown,
  CheckCircle2, AlertCircle, Copy, CalendarDays, PieChart,
  Coins, ChevronLeft, ChevronRight, X, Check,
  Sparkles, Download, ShoppingCart, Fuel,
  Coffee, HeartPulse, Car, ShoppingBag, Film
} from 'lucide-react';

function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

function getFormattedDateNow() {
  return new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function getCurrentTimestamp() {
  return Date.now();
}



const MONTHS_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const DAYS_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

// Быстрые категории для покупок недели с иконками и цветами
const EXPENSE_CATEGORIES = [
  { id: 'groceries', label: 'Супермаркет', icon: ShoppingCart, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { id: 'fuel', label: 'Заправка', icon: Fuel, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { id: 'food', label: 'Кафе и Еда', icon: Coffee, color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  { id: 'health', label: 'Аптека', icon: HeartPulse, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  { id: 'transport', label: 'Транспорт', icon: Car, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  { id: 'shopping', label: 'Покупки', icon: ShoppingBag, color: 'text-violet-400 bg-violet-500/10 border-violet-500/30' },
  { id: 'entertainment', label: 'Отдых', icon: Film, color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },
  { id: 'other', label: 'Другое', icon: Sparkles, color: 'text-slate-300 bg-slate-800/60 border-slate-700/50' }
];

const CURRENCIES = [
  { symbol: '₪', code: 'ILS', name: 'Шекель (₪)' },
  { symbol: '$', code: 'USD', name: 'Доллар ($)' },
  { symbol: '€', code: 'EUR', name: 'Евро (€)' },
  { symbol: '₽', code: 'RUB', name: 'Рубль (₽)' },
  { symbol: '₸', code: 'KZT', name: 'Тенге (₸)' }
];

// Генератор недель месяца (Воскресенье - Суббота)
function getMonthWeeks(year, month) {
  const weeks = [];
  const totalDays = new Date(year, month + 1, 0).getDate();
  let currentStart = 1;
  let weekIndex = 1;

  while (currentStart <= totalDays) {
    const startDate = new Date(year, month, currentStart);
    const dayOfWeek = startDate.getDay(); // 0 - Воскресенье, 6 - Суббота
    const daysRemainingInWeek = 6 - dayOfWeek;
    const currentEnd = Math.min(currentStart + daysRemainingInWeek, totalDays);
    const endDate = new Date(year, month, currentEnd);
    const daysCount = currentEnd - currentStart + 1;

    weeks.push({
      id: `${year}-${month}-w${weekIndex}`,
      weekNumber: weekIndex,
      startDay: currentStart,
      endDay: currentEnd,
      startDayName: DAYS_SHORT[dayOfWeek],
      endDayName: DAYS_SHORT[endDate.getDay()],
      daysCount,
      isFullWeek: daysCount === 7
    });

    currentStart = currentEnd + 1;
    weekIndex++;
  }

  return { weeks, totalDays };
}

export default function App() {
  // Инициализация даты без вызова impure new Date() внутри тела компонента
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
  const monthKey = `${selectedYear}-${selectedMonth}`;

  // Выбранная валюта (по умолчанию израильский шекель ₪)
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('smart_budget_currency') || '₪';
  });

  // Активная вкладка Android-приложения: 'weeks' (Недели), 'month' (Бюджет месяца), 'analytics' (Аналитика)
  const [activeTab, setActiveTab] = useState('weeks');

  // Загружаем данные всех месяцев из localStorage
  const [allData, setAllData] = useState(() => {
    const saved = localStorage.getItem('smart_budget_v1');
    if (!saved) return {};
    try {
      return JSON.parse(saved);
    } catch {
      return {};
    }
  });

  // Сохраняем в localStorage при любом изменении
  useEffect(() => {
    localStorage.setItem('smart_budget_v1', JSON.stringify(allData));
  }, [allData]);

  // Сохраняем валюту
  useEffect(() => {
    localStorage.setItem('smart_budget_currency', currency);
  }, [currency]);

  // Вспомогательная тактильная вибрация (для Android)
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(10);
      } catch {
        // ignore
      }
    }
  };

  // Всплывающее уведомление (Toast)
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    triggerHaptic();
    setTimeout(() => {
      setToastMessage(current => current === msg ? null : current);
    }, 3200);
  };

  // Данные текущего выбранного месяца
  const currentMonthData = allData[monthKey] || {
    salary: 10000,
    savings: 2000,
    rolloverEnabled: false,
    fixedExpenses: [
      { id: '1', title: 'Аренда и счета', amount: 3500 },
      { id: '2', title: 'Подписки и связь', amount: 200 }
    ],
    extraExpenses: [],
    weeklySpent: {}, // { [weekId]: number } для обратной совместимости
    weeklyExpenses: {} // { [weekId]: [ { id, title, amount, category, date } ] }
  };

  // Функция обновления данных текущего месяца
  const updateMonthData = (updater) => {
    setAllData(prev => {
      const current = prev[monthKey] || currentMonthData;
      const updated = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
      return { ...prev, [monthKey]: updated };
    });
  };

  // Состояния раскрытых списков и форм
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [showFixedList, setShowFixedList] = useState(true);
  const [showExtraList, setShowExtraList] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);

  // Формы добавления
  const [newFixed, setNewFixed] = useState({ title: '', amount: '' });
  const [newExtra, setNewExtra] = useState({ title: '', amount: '' });

  // Форма добавления покупки в конкретную неделю: { [weekId]: { title, amount, category } }
  const [weekInputs, setWeekInputs] = useState({});

  // Математические расчеты недель месяца
  const { weeks, totalDays } = useMemo(
    () => getMonthWeeks(selectedYear, selectedMonth),
    [selectedYear, selectedMonth]
  );

  const totalFixed = (currentMonthData.fixedExpenses || []).reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );
  const totalExtra = (currentMonthData.extraExpenses || []).reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  // Чистый остаток для распределения по неделям
  const netMonthlyBudget =
    (Number(currentMonthData.salary) || 0) -
    (Number(currentMonthData.savings) || 0) -
    totalFixed -
    totalExtra;

  const dailyRate = totalDays > 0 ? netMonthlyBudget / totalDays : 0;

  const [today] = useState(() => new Date());
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  const isCurrentMonth = selectedYear === currentYear && selectedMonth === currentMonth;
  const isPastMonth = selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentMonth);

  // Расчет бюджета каждой недели (с учетом покупок списком и умного переноса остатка)
  const calculatedWeeks = useMemo(() => {
    const list = [];
    let carryOver = 0;

    for (const w of weeks) {
      const baseBudget = w.daysCount * dailyRate;
      const carriedIn = currentMonthData.rolloverEnabled ? carryOver : 0;
      const effectiveBudget = baseBudget + carriedIn;

      // Покупки списком этой недели
      const itemizedList = (currentMonthData.weeklyExpenses && currentMonthData.weeklyExpenses[w.id]) || [];
      const itemizedSum = itemizedList.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

      // Если есть список покупок - берем сумму списка. Если списка нет, но есть legacy weeklySpent - берем его.
      const spent = itemizedList.length > 0
        ? itemizedSum
        : (Number(currentMonthData.weeklySpent?.[w.id]) || 0);

      const remaining = effectiveBudget - spent;

      const isWeekPast = isPastMonth || (isCurrentMonth && w.endDay < currentDay);
      const isWeekCurrent = isCurrentMonth && currentDay >= w.startDay && currentDay <= w.endDay;
      const isWeekFuture = !isPastMonth && (!isCurrentMonth || w.startDay > currentDay);

      // Перенос остатка:
      // Переносится, если:
      // 1. Неделя уже завершилась (прошла по календарю)
      // 2. В неделе был перерасход (дефицит всегда уменьшает следующую неделю)
      // 3. Либо в неделе уже есть записанные траты (пользователь активно ведет бюджет)
      if (currentMonthData.rolloverEnabled) {
        if (isWeekPast || remaining < 0 || spent > 0) {
          carryOver = remaining;
        } else {
          // Если неделя в будущем и в ней 0 трат, она не передает виртуальный неизрасходованный лимит дальше
          carryOver = 0;
        }
      }

      list.push({
        ...w,
        baseBudget,
        effectiveBudget,
        carriedIn,
        spent,
        remaining,
        isWeekPast,
        isWeekCurrent,
        isWeekFuture,
        expensesList: itemizedList
      });
    }

    return list;
  }, [
    weeks,
    dailyRate,
    currentMonthData.weeklyExpenses,
    currentMonthData.weeklySpent,
    currentMonthData.rolloverEnabled,
    isCurrentMonth,
    isPastMonth,
    currentDay
  ]);

  const totalWeeklySpent = calculatedWeeks.reduce((sum, w) => sum + w.spent, 0);
  const totalRemainingMonth = netMonthlyBudget - totalWeeklySpent;

  // Форматирование валюты
  const fmt = (num) => {
    const rounded = Math.round(Number(num) || 0);
    return `${currency} ${rounded.toLocaleString('ru-RU')}`;
  };

  // Переключение месяцев (стрелочки влево/вправо)
  const handlePrevMonth = () => {
    triggerHaptic();
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    triggerHaptic();
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  };

  // Вычисление предыдущего месяца для кнопки копирования
  const prevMonthInfo = useMemo(() => {
    const pMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const pYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
    const pKey = `${pYear}-${pMonth}`;
    const pData = allData[pKey];
    return {
      monthIndex: pMonth,
      year: pYear,
      key: pKey,
      name: MONTHS_RU[pMonth],
      data: pData,
      hasFixedExpenses: Boolean(pData?.fixedExpenses && pData.fixedExpenses.length > 0)
    };
  }, [selectedMonth, selectedYear, allData]);

  // Копирование постоянных расходов из предыдущего месяца
  const copyFixedFromPrevious = (mode = 'replace', includeSalaryAndSavings = true) => {
    const sourceExpenses = prevMonthInfo.data?.fixedExpenses;
    if (!sourceExpenses || sourceExpenses.length === 0) {
      showToast('В прошлом месяце нет постоянных расходов');
      return;
    }

    // Создаем новые копии с уникальными id
    const clonedExpenses = sourceExpenses.map(item => ({
      ...item,
      id: generateId('copy')
    }));

    updateMonthData(prev => {
      let updatedList = [];
      if (mode === 'replace') {
        updatedList = clonedExpenses;
      } else {
        // Режим объединения (merge)
        const currentTitles = new Set((prev.fixedExpenses || []).map(i => i.title.trim().toLowerCase()));
        const additions = clonedExpenses.filter(i => !currentTitles.has(i.title.trim().toLowerCase()));
        updatedList = [...(prev.fixedExpenses || []), ...additions];
      }

      return {
        ...prev,
        fixedExpenses: updatedList,
        salary: includeSalaryAndSavings && prevMonthInfo.data?.salary ? prevMonthInfo.data.salary : prev.salary,
        savings: includeSalaryAndSavings && prevMonthInfo.data?.savings ? prevMonthInfo.data.savings : prev.savings
      };
    });

    setShowCopyModal(false);
    showToast(`Скопировано ${clonedExpenses.length} расходов из ${prevMonthInfo.name}!`);
  };

  // Добавление/удаление постоянных и общих доп. расходов
  const addExpense = (type) => {
    const isFixed = type === 'fixed';
    const item = isFixed ? newFixed : newExtra;
    if (!item.title.trim() || !item.amount) return;

    const key = isFixed ? 'fixedExpenses' : 'extraExpenses';

    updateMonthData(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), {
        id: generateId('exp'),
        title: item.title.trim(),
        amount: Number(item.amount)
      }]
    }));

    triggerHaptic();
    if (isFixed) setNewFixed({ title: '', amount: '' });
    else setNewExtra({ title: '', amount: '' });
    showToast(isFixed ? 'Постоянный расход добавлен' : 'Доп. расход добавлен');
  };

  const removeExpense = (type, id) => {
    const key = type === 'fixed' ? 'fixedExpenses' : 'extraExpenses';
    updateMonthData(prev => ({
      ...prev,
      [key]: (prev[key] || []).filter(item => item.id !== id)
    }));
    triggerHaptic();
  };

  // Управление покупками конкретной недели
  const getWeekInput = (weekId) => weekInputs[weekId] || { title: '', amount: '', category: 'groceries' };

  const updateWeekInput = (weekId, field, value) => {
    setWeekInputs(prev => ({
      ...prev,
      [weekId]: {
        ...getWeekInput(weekId),
        [field]: value
      }
    }));
  };

  // Добавить отдельную покупку списком в неделю
  const addPurchaseToWeek = (weekId) => {
    const input = getWeekInput(weekId);
    if (!input.amount || Number(input.amount) <= 0) return;

    const categoryObj = EXPENSE_CATEGORIES.find(c => c.id === input.category) || EXPENSE_CATEGORIES[0];
    const title = input.title.trim() || categoryObj.label;

    const newPurchase = {
      id: generateId('purchase'),
      title,
      amount: Number(input.amount),
      category: input.category || 'groceries',
      createdAt: getCurrentTimestamp(),
      dateStr: getFormattedDateNow()
    };

    updateMonthData(prev => {
      const currentWeekList = (prev.weeklyExpenses && prev.weeklyExpenses[weekId]) || [];
      const updatedWeekList = [newPurchase, ...currentWeekList];
      const newTotal = updatedWeekList.reduce((acc, p) => acc + p.amount, 0);

      return {
        ...prev,
        weeklyExpenses: {
          ...(prev.weeklyExpenses || {}),
          [weekId]: updatedWeekList
        },
        weeklySpent: {
          ...(prev.weeklySpent || {}),
          [weekId]: newTotal
        }
      };
    });

    triggerHaptic();
    updateWeekInput(weekId, 'amount', '');
    updateWeekInput(weekId, 'title', '');
    showToast(`Записано: ${title} (${fmt(newPurchase.amount)})`);
  };

  // Удалить покупку из недели
  const removePurchaseFromWeek = (weekId, purchaseId) => {
    updateMonthData(prev => {
      const currentWeekList = (prev.weeklyExpenses && prev.weeklyExpenses[weekId]) || [];
      const updatedWeekList = currentWeekList.filter(p => p.id !== purchaseId);
      const newTotal = updatedWeekList.reduce((acc, p) => acc + p.amount, 0);

      return {
        ...prev,
        weeklyExpenses: {
          ...(prev.weeklyExpenses || {}),
          [weekId]: updatedWeekList
        },
        weeklySpent: {
          ...(prev.weeklySpent || {}),
          [weekId]: newTotal
        }
      };
    });
    triggerHaptic();
    showToast('Покупка удалена');
  };

  // Быстро добавить сумму (кнопки +50, +100, +200, +500)
  const addQuickSpendToWeek = (weekId, amountToAdd) => {
    const quickPurchase = {
      id: generateId('quick'),
      title: `Быстрая трата`,
      amount: Number(amountToAdd),
      category: 'other',
      createdAt: getCurrentTimestamp(),
      dateStr: getFormattedDateNow()
    };

    updateMonthData(prev => {
      const currentWeekList = (prev.weeklyExpenses && prev.weeklyExpenses[weekId]) || [];
      const updatedWeekList = [quickPurchase, ...currentWeekList];
      const newTotal = updatedWeekList.reduce((acc, p) => acc + p.amount, 0);

      return {
        ...prev,
        weeklyExpenses: {
          ...(prev.weeklyExpenses || {}),
          [weekId]: updatedWeekList
        },
        weeklySpent: {
          ...(prev.weeklySpent || {}),
          [weekId]: newTotal
        }
      };
    });

    triggerHaptic();
    showToast(`+${fmt(amountToAdd)} добавлено к неделе`);
  };

  // Ручной сброс трат недели
  const resetWeekExpenses = (weekId) => {
    if (!window.confirm('Сбросить все траты за эту неделю?')) return;
    updateMonthData(prev => ({
      ...prev,
      weeklyExpenses: {
        ...(prev.weeklyExpenses || {}),
        [weekId]: []
      },
      weeklySpent: {
        ...(prev.weeklySpent || {}),
        [weekId]: 0
      }
    }));
    triggerHaptic();
    showToast('Траты недели очищены');
  };

  // Расчет аналитики по категориям
  const categoryStats = useMemo(() => {
    const map = {};
    for (const cat of EXPENSE_CATEGORIES) {
      map[cat.id] = { ...cat, total: 0, count: 0 };
    }

    if (currentMonthData.weeklyExpenses) {
      Object.values(currentMonthData.weeklyExpenses).forEach(weekList => {
        if (Array.isArray(weekList)) {
          weekList.forEach(p => {
            const catId = p.category || 'other';
            if (!map[catId]) {
              map[catId] = { id: catId, label: 'Другое', icon: Sparkles, color: 'text-slate-400', total: 0, count: 0 };
            }
            map[catId].total += Number(p.amount) || 0;
            map[catId].count += 1;
          });
        }
      });
    }

    return Object.values(map)
      .filter(item => item.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [currentMonthData.weeklyExpenses]);

  // Резервное копирование и экспорт
  const exportBackupJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `smart_budget_backup_${selectedYear}_${selectedMonth + 1}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Резервная копия скачана!');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 pb-24 font-sans selection:bg-indigo-500 selection:text-white flex flex-col items-center">
      {/* Toast уведомление */}
      {toastMessage && (
        <div className="fixed top-4 z-50 px-4 py-2.5 rounded-2xl bg-indigo-600/90 text-white font-medium text-xs shadow-2xl backdrop-blur-md border border-indigo-400/40 animate-bounce flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Контейнер приложения мобильного размера (Android shell) */}
      <div className="w-full max-w-md px-4 pt-4 space-y-4">
        
        {/* Верхняя панель (Header): Логотип, селектор месяца со стрелками и выбор валюты */}
        <header className="bg-slate-900/95 border border-slate-800/80 p-3.5 rounded-3xl shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            {/* Название и статус */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  Умный Бюджет
                </h1>
                <p className="text-[11px] font-medium text-slate-400">
                  {totalDays} дн. • Вс – Сб
                </p>
              </div>
            </div>

            {/* Быстрая смена месяца и валюты */}
            <div className="flex items-center gap-1.5">
              {/* Кнопка смены валюты */}
              <button
                onClick={() => setShowCurrencyModal(true)}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700/80 active:scale-95 border border-slate-700/70 rounded-xl text-xs font-bold text-indigo-300 flex items-center gap-1 transition"
                title="Сменить валюту"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>{currency}</span>
              </button>

              {/* Навигация по месяцам */}
              <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-0.5">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 hover:text-white text-slate-400 active:scale-90 transition rounded-lg"
                  title="Предыдущий месяц"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="px-2 text-xs font-bold text-slate-200">
                  {MONTHS_RU[selectedMonth].slice(0, 3)} {selectedYear}
                </div>

                <button
                  onClick={handleNextMonth}
                  className="p-1 hover:text-white text-slate-400 active:scale-90 transition rounded-lg"
                  title="Следующий месяц"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Главная информационная карточка: Чистый бюджет и статистика распределения */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-900 border border-indigo-500/30 p-4 rounded-3xl shadow-xl space-y-3.5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-indigo-300 uppercase">
                Чистый бюджет на недели
              </span>
              <div className="text-3xl font-black text-white tracking-tight mt-0.5">
                {fmt(netMonthlyBudget)}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                после вычета постоянных и копилки
              </p>
            </div>

            <div className="text-right bg-slate-950/50 border border-slate-800/80 px-3 py-2 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Дневная норма
              </span>
              <span className="text-sm font-extrabold text-indigo-300">
                {fmt(dailyRate)}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                7 дн: <strong className="text-slate-200">{fmt(dailyRate * 7)}</strong>
              </span>
            </div>
          </div>

          {/* Полоса прогресса месяца */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">
                Потрачено: <strong className="text-slate-200">{fmt(totalWeeklySpent)}</strong>
              </span>
              <span className="text-slate-400">
                Остаток на месяц:{' '}
                <strong className={totalRemainingMonth >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {fmt(totalRemainingMonth)}
                </strong>
              </span>
            </div>

            <div className="h-2.5 w-full bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-slate-800/60">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  totalRemainingMonth < 0
                    ? 'bg-rose-500'
                    : totalWeeklySpent > netMonthlyBudget * 0.85
                    ? 'bg-amber-400'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                }`}
                style={{
                  width: `${netMonthlyBudget > 0 ? Math.min(100, Math.max(0, (totalWeeklySpent / netMonthlyBudget) * 100)) : 100}%`
                }}
              />
            </div>
          </div>
        </section>

        {/* ВКЛАДКА 1: НЕДЕЛИ (Основной экран трат с записью покупок списком) */}
        {activeTab === 'weeks' && (
          <div className="space-y-3.5 animate-fadeIn">
            {/* Верхний бар управления неделями: перенос остатка и сводка */}
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-indigo-400" />
                <span>Недели месяца ({calculatedWeeks.length})</span>
              </h2>

              <button
                onClick={() => {
                  triggerHaptic();
                  updateMonthData({ rolloverEnabled: !currentMonthData.rolloverEnabled });
                  showToast(
                    !currentMonthData.rolloverEnabled
                      ? 'Перенос включен: остаток недели идет на следующую'
                      : 'Перенос выключен: каждая неделя независима'
                  );
                }}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border active:scale-95 transition ${
                  currentMonthData.rolloverEnabled
                    ? 'bg-indigo-500/20 border-indigo-500/60 text-indigo-300 font-semibold shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Перенос остатка: {currentMonthData.rolloverEnabled ? 'ВКЛ' : 'ВЫКЛ'}</span>
              </button>
            </div>

            {/* Список карточек недель */}
            <div className="space-y-3">
              {calculatedWeeks.map((week) => {
                const isExpanded = expandedWeek === week.id;
                const isOverBudget = week.remaining < 0;
                const progressPercent = week.effectiveBudget > 0
                  ? Math.min(100, Math.max(0, (week.spent / week.effectiveBudget) * 100))
                  : 100;
                const inputState = getWeekInput(week.id);

                return (
                  <div
                    key={week.id}
                    className={`bg-slate-900/90 border rounded-3xl transition-all duration-200 overflow-hidden ${
                      isExpanded
                        ? 'border-indigo-500/60 shadow-xl ring-1 ring-indigo-500/20 bg-slate-900'
                        : 'border-slate-800/90 hover:border-slate-700/80'
                    }`}
                  >
                    {/* Кликабельная шапка карточки недели */}
                    <button
                      onClick={() => {
                        triggerHaptic();
                        setExpandedWeek(isExpanded ? null : week.id);
                      }}
                      className="w-full p-4 text-left space-y-3 active:bg-slate-800/30 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-base font-extrabold text-white">
                              Неделя {week.weekNumber}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                week.isFullWeek
                                  ? 'bg-slate-800 text-slate-300'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {week.daysCount} {week.daysCount === 1 ? 'день' : week.daysCount < 5 ? 'дня' : 'дней'}
                              {!week.isFullWeek && ' (неполная)'}
                            </span>

                            {week.isWeekCurrent && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 animate-pulse">
                                Текущая
                              </span>
                            )}

                            {currentMonthData.rolloverEnabled && Math.round(week.carriedIn) !== 0 && (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                                  week.carriedIn > 0
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                }`}
                              >
                                {week.carriedIn > 0 ? `+${fmt(week.carriedIn)} перенос` : `${fmt(week.carriedIn)} перерасход`}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-400 mt-1">
                            {week.startDay} {MONTHS_RU[selectedMonth].slice(0, 3).toLowerCase()} ({week.startDayName}) — {week.endDay} {MONTHS_RU[selectedMonth].slice(0, 3).toLowerCase()} ({week.endDayName})
                          </p>
                        </div>

                        {/* Остаток бюджета на неделю */}
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Остаток
                          </span>
                          <div
                            className={`text-lg font-black flex items-center justify-end gap-1 ${
                              isOverBudget ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            {isOverBudget ? (
                              <AlertCircle className="w-4 h-4 shrink-0" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                            )}
                            {fmt(week.remaining)}
                          </div>
                        </div>
                      </div>

                      {/* Прогресс-бар расходов за неделю */}
                      <div className="space-y-1.5">
                        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5">
                          <div
                            className={`h-full transition-all duration-300 rounded-full ${
                              isOverBudget
                                ? 'bg-rose-500'
                                : progressPercent > 80
                                ? 'bg-amber-400'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-center text-xs text-slate-400">
                          <span>
                            Потрачено: <strong className="text-slate-100">{fmt(week.spent)}</strong>
                            {week.expensesList.length > 0 && (
                              <span className="text-slate-500 ml-1">
                                ({week.expensesList.length} {week.expensesList.length === 1 ? 'покупка' : 'покупок'})
                              </span>
                            )}
                          </span>

                          <span>
                            Лимит: <strong className="text-indigo-300">{fmt(week.effectiveBudget)}</strong>
                            {currentMonthData.rolloverEnabled && Math.round(week.carriedIn) !== 0 && (
                              <span className={`ml-1 text-[11px] font-semibold ${week.carriedIn > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                ({fmt(week.baseBudget)} {week.carriedIn > 0 ? `+ ${fmt(week.carriedIn)}` : `- ${fmt(Math.abs(week.carriedIn))}`})
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Подсказка развернуть / свернуть */}
                      <div className="pt-1 flex items-center justify-between text-[11px] text-indigo-400 font-medium">
                        <span>{isExpanded ? 'Свернуть покупки' : 'Нажмите, чтобы записать покупку'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {/* Раскрывающийся блок: добавление покупок и список расходов недели */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 bg-slate-950/60 space-y-4">
                        
                        {/* Форма добавления отдельной покупки списком */}
                        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                              <Plus className="w-3.5 h-3.5 text-indigo-400" />
                              Записать покупку в Неделю {week.weekNumber}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              норма: {fmt(dailyRate)}/день
                            </span>
                          </div>

                          {/* Поля ввода Название + Сумма */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Название (напр. Супермаркет)"
                              value={inputState.title}
                              onChange={(e) => updateWeekInput(week.id, 'title', e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && addPurchaseToWeek(week.id)}
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition"
                            />
                            <div className="relative w-28">
                              <input
                                type="number"
                                inputMode="decimal"
                                placeholder="Сумма"
                                value={inputState.amount}
                                onChange={(e) => updateWeekInput(week.id, 'amount', e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addPurchaseToWeek(week.id)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-6 py-2.5 text-xs font-bold text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition"
                              />
                              <span className="absolute right-2 top-2.5 text-xs font-bold text-slate-400">
                                {currency}
                              </span>
                            </div>

                            <button
                              onClick={() => addPurchaseToWeek(week.id)}
                              className="px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold rounded-xl flex items-center justify-center transition shadow-md shadow-indigo-600/30"
                              title="Добавить покупку"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Быстрые категории-чипы для мгновенного заполнения в 1 клик */}
                          <div className="flex gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
                            {EXPENSE_CATEGORIES.map(cat => {
                              const Icon = cat.icon;
                              const isSelected = inputState.category === cat.id;
                              return (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => {
                                    triggerHaptic();
                                    updateWeekInput(week.id, 'category', cat.id);
                                    if (!inputState.title) {
                                      updateWeekInput(week.id, 'title', cat.label);
                                    }
                                  }}
                                  className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-medium border transition ${
                                    isSelected
                                      ? 'bg-indigo-600 text-white border-indigo-500 font-semibold shadow-sm'
                                      : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:bg-slate-800'
                                  }`}
                                >
                                  <Icon className="w-3 h-3" />
                                  <span>{cat.label}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Быстрые кнопки добавления сумм */}
                          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5">
                            <span className="text-[11px] text-slate-400 mr-0.5 shrink-0">Быстро:</span>
                            {[50, 100, 200, 500].map(amt => (
                              <button
                                key={amt}
                                onClick={() => addQuickSpendToWeek(week.id, amt)}
                                className="flex-1 py-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 active:scale-95 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-bold transition"
                              >
                                +{amt}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Список покупок за эту неделю */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                            <span>Список покупок недели ({week.expensesList.length})</span>
                            {week.expensesList.length > 0 && (
                              <button
                                onClick={() => resetWeekExpenses(week.id)}
                                className="text-[11px] text-rose-400 hover:text-rose-300 transition"
                              >
                                Очистить всё
                              </button>
                            )}
                          </div>

                          {week.expensesList.length === 0 ? (
                            <div className="text-center py-4 bg-slate-900/40 border border-slate-800/60 rounded-2xl text-xs text-slate-400">
                              Трат пока нет. Добавьте покупку выше (напр. «Супермаркет — 350»).
                            </div>
                          ) : (
                            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                              {week.expensesList.map((item) => {
                                const catObj = EXPENSE_CATEGORIES.find(c => c.id === item.category) || EXPENSE_CATEGORIES[7];
                                const CatIcon = catObj.icon;

                                return (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between bg-slate-900 border border-slate-800/90 px-3 py-2 rounded-2xl text-xs group"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <div className={`p-1.5 rounded-xl border ${catObj.color}`}>
                                        <CatIcon className="w-3.5 h-3.5" />
                                      </div>
                                      <div>
                                        <div className="font-semibold text-slate-100">{item.title}</div>
                                        <div className="text-[10px] text-slate-400">{item.dateStr || 'Сегодня'}</div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2.5">
                                      <span className="font-bold text-rose-300 text-sm">
                                        -{fmt(item.amount)}
                                      </span>
                                      <button
                                        onClick={() => removePurchaseFromWeek(week.id, item.id)}
                                        className="text-slate-500 hover:text-rose-400 active:scale-90 p-1 transition"
                                        title="Удалить покупку"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ВКЛАДКА 2: БЮДЖЕТ МЕСЯЦА (Зарплата, Копилка, Постоянные и Доп. расходы) */}
        {activeTab === 'month' && (
          <div className="space-y-4 animate-fadeIn">
            
            {/* Блок: Зарплата и Копилка */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-3xl shadow-sm">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-1.5">
                  <Wallet className="w-4 h-4" />
                  <span>Зарплата</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={currentMonthData.salary}
                    onChange={(e) =>
                      updateMonthData({ salary: e.target.value === '' ? '' : Number(e.target.value) })
                    }
                    placeholder="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-3 pr-7 py-2 text-base font-extrabold text-white focus:border-emerald-500 outline-none transition"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                    {currency}
                  </span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-3xl shadow-sm">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-1.5">
                  <PiggyBank className="w-4 h-4" />
                  <span>Отложить в копилку</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={currentMonthData.savings}
                    onChange={(e) =>
                      updateMonthData({ savings: e.target.value === '' ? '' : Number(e.target.value) })
                    }
                    placeholder="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-3 pr-7 py-2 text-base font-extrabold text-white focus:border-amber-500 outline-none transition"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                    {currency}
                  </span>
                </div>
              </div>
            </div>

            {/* Карточка: Постоянные расходы с кнопкой копирования */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-4 flex items-center justify-between border-b border-slate-800/80">
                <button
                  onClick={() => setShowFixedList(!showFixedList)}
                  className="flex items-center gap-2.5 text-left flex-1"
                >
                  <div className="p-2 bg-rose-500/15 rounded-2xl text-rose-400">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Постоянные расходы</div>
                    <div className="text-xs text-slate-400">
                      {currentMonthData.fixedExpenses?.length || 0} поз. • Аренда, связь, счета
                    </div>
                  </div>
                </button>

                <div className="flex items-center gap-2.5">
                  <span className="text-base font-extrabold text-rose-400">-{fmt(totalFixed)}</span>
                  <button
                    onClick={() => setShowFixedList(!showFixedList)}
                    className="text-slate-400 p-1"
                  >
                    {showFixedList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Кнопка "Скопировать постоянные расходы с прошлого месяца" */}
              <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400">Перенос с прошлого месяца:</span>
                <button
                  onClick={() => {
                    triggerHaptic();
                    setShowCopyModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 active:scale-95 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-bold transition shadow-sm"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Скопировать из {prevMonthInfo.name}</span>
                </button>
              </div>

              {/* Список позиций постоянных расходов */}
              {showFixedList && (
                <div className="p-4 space-y-3">
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {(currentMonthData.fixedExpenses || []).map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between bg-slate-950/70 border border-slate-800/80 px-3 py-2 rounded-2xl text-xs"
                      >
                        <span className="font-semibold text-slate-200">{item.title}</span>
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-rose-300">{fmt(item.amount)}</span>
                          <button
                            onClick={() => removeExpense('fixed', item.id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Форма добавления постоянного расхода */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Название (напр. Зал, Netflix)"
                      value={newFixed.title}
                      onChange={(e) => setNewFixed({ ...newFixed, title: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && addExpense('fixed')}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                    />
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder="Сумма"
                      value={newFixed.amount}
                      onChange={(e) => setNewFixed({ ...newFixed, amount: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && addExpense('fixed')}
                      className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => addExpense('fixed')}
                      className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white px-3.5 rounded-xl font-bold flex items-center justify-center transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Карточка: Общие доп. расходы на месяц */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <button
                onClick={() => setShowExtraList(!showExtraList)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/30 transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-orange-500/15 rounded-2xl text-orange-400">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Общие доп. расходы</div>
                    <div className="text-xs text-slate-400">
                      {currentMonthData.extraExpenses?.length || 0} поз. • Разовые траты вне недель
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-base font-extrabold text-orange-400">-{fmt(totalExtra)}</span>
                  {showExtraList ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {showExtraList && (
                <div className="p-4 pt-1 border-t border-slate-800/80 space-y-3">
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {(currentMonthData.extraExpenses || []).map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between bg-slate-950/70 border border-slate-800/80 px-3 py-2 rounded-2xl text-xs"
                      >
                        <span className="font-semibold text-slate-200">{item.title}</span>
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-orange-300">{fmt(item.amount)}</span>
                          <button
                            onClick={() => removeExpense('extra', item.id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Напр. Подарок другу, ТО авто"
                      value={newExtra.title}
                      onChange={(e) => setNewExtra({ ...newExtra, title: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && addExpense('extra')}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                    />
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder="Сумма"
                      value={newExtra.amount}
                      onChange={(e) => setNewExtra({ ...newExtra, amount: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && addExpense('extra')}
                      className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => addExpense('extra')}
                      className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white px-3.5 rounded-xl font-bold flex items-center justify-center transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Быстрый экспорт резервной копии */}
            <div className="pt-2 flex justify-center">
              <button
                onClick={exportBackupJSON}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition py-1 px-3 rounded-xl border border-slate-800/80 bg-slate-900/50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Скачать резервную копию всех данных</span>
              </button>
            </div>
          </div>
        )}

        {/* ВКЛАДКА 3: АНАЛИТИКА (Диаграмма категорий, сбережения, темп трат) */}
        {activeTab === 'analytics' && (
          <div className="space-y-4 animate-fadeIn">
            
            {/* Карточка структуры сбережений */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-amber-400" />
                Норма сбережений за месяц
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Отложено в копилку</span>
                  <span className="text-base font-extrabold text-amber-300">
                    {fmt(currentMonthData.savings)}
                  </span>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">% от зарплаты</span>
                  <span className="text-base font-extrabold text-emerald-400">
                    {currentMonthData.salary > 0
                      ? `${Math.round(((currentMonthData.savings || 0) / currentMonthData.salary) * 100)}%`
                      : '0%'}
                  </span>
                </div>
              </div>
            </div>

            {/* Карточка распределения трат по категориям */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-indigo-400" />
                  Траты недель по категориям
                </h3>
                <span className="text-xs text-slate-400">
                  Всего: {fmt(totalWeeklySpent)}
                </span>
              </div>

              {categoryStats.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 bg-slate-950/50 rounded-2xl border border-slate-800/60">
                  Пока нет записанных покупок в неделях.
                  <br />Записывайте супермаркет, заправку и еду во вкладке «Недели».
                </div>
              ) : (
                <div className="space-y-2.5">
                  {categoryStats.map(cat => {
                    const CatIcon = cat.icon;
                    const percent = totalWeeklySpent > 0 ? Math.round((cat.total / totalWeeklySpent) * 100) : 0;

                    return (
                      <div key={cat.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <CatIcon className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="font-semibold text-slate-200">{cat.label}</span>
                            <span className="text-[10px] text-slate-500">({cat.count} шт.)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-100">{fmt(cat.total)}</span>
                            <span className="text-[11px] font-mono text-slate-400">{percent}%</span>
                          </div>
                        </div>

                        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-violet-400 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Сравнение недель месяца */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-3">
              <h3 className="text-sm font-bold text-white">Сравнение недель</h3>
              <div className="space-y-2 text-xs">
                {calculatedWeeks.map(w => (
                  <div key={w.id} className="flex items-center justify-between bg-slate-950 p-2.5 rounded-2xl border border-slate-800/80">
                    <div>
                      <span className="font-bold text-slate-200">Неделя {w.weekNumber}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">({w.daysCount} дн.)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400">Потрачено: </span>
                      <span className="font-bold text-slate-200">{fmt(w.spent)}</span>
                      <span className="text-slate-500 ml-1">/ {fmt(w.effectiveBudget)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* НИЖНЯЯ ПАНЕЛЬ НАВИГАЦИИ (Android Bottom Navigation Bar) */}
      <nav className="fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/90 py-2 px-6 flex justify-around items-center z-40 max-w-md mx-auto shadow-2xl">
        <button
          onClick={() => {
            triggerHaptic();
            setActiveTab('weeks');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-2xl transition active:scale-95 ${
            activeTab === 'weeks'
              ? 'text-indigo-400 font-bold bg-indigo-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CalendarDays className="w-5 h-5" />
          <span className="text-[11px]">Недели</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic();
            setActiveTab('month');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-2xl transition active:scale-95 ${
            activeTab === 'month'
              ? 'text-indigo-400 font-bold bg-indigo-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span className="text-[11px]">Бюджет</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic();
            setActiveTab('analytics');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-2xl transition active:scale-95 ${
            activeTab === 'analytics'
              ? 'text-indigo-400 font-bold bg-indigo-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PieChart className="w-5 h-5" />
          <span className="text-[11px]">Аналитика</span>
        </button>
      </nav>

      {/* МОДАЛКА: Смена валюты */}
      {showCurrencyModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xs w-full p-5 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                Выберите валюту
              </h3>
              <button
                onClick={() => setShowCurrencyModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              {CURRENCIES.map(c => (
                <button
                  key={c.code}
                  onClick={() => {
                    setCurrency(c.symbol);
                    setShowCurrencyModal(false);
                    showToast(`Валюта изменена на ${c.symbol} (${c.code})`);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-semibold border transition ${
                    currency === c.symbol
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                      : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-base font-bold">{c.symbol}</span>
                  <span>{c.name}</span>
                  {currency === c.symbol && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛКА: Копирование постоянных расходов из предыдущего месяца */}
      {showCopyModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Copy className="w-4 h-4 text-indigo-400" />
                Копирование из {prevMonthInfo.name}
              </h3>
              <button
                onClick={() => setShowCopyModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {prevMonthInfo.hasFixedExpenses ? (
              <div className="space-y-3.5">
                <p className="text-xs text-slate-300">
                  В <strong>{prevMonthInfo.name} {prevMonthInfo.year}</strong> найдено{' '}
                  <strong className="text-white">{prevMonthInfo.data.fixedExpenses.length} постоянных расходов</strong>{' '}
                  на сумму{' '}
                  <strong className="text-rose-400">
                    {fmt(prevMonthInfo.data.fixedExpenses.reduce((s, i) => s + (Number(i.amount) || 0), 0))}
                  </strong>:
                </p>

                {/* Список расходов прошлого месяца */}
                <div className="max-h-40 overflow-y-auto space-y-1.5 bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800 text-xs">
                  {prevMonthInfo.data.fixedExpenses.map(item => (
                    <div key={item.id} className="flex justify-between text-slate-300">
                      <span>• {item.title}</span>
                      <span className="font-bold text-rose-300">{fmt(item.amount)}</span>
                    </div>
                  ))}
                </div>

                <div className="text-[11px] text-slate-400">
                  Как перенести в текущий месяц (<strong>{MONTHS_RU[selectedMonth]} {selectedYear}</strong>)?
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => copyFixedFromPrevious('replace', true)}
                    className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold rounded-2xl text-xs transition shadow-md shadow-indigo-600/30"
                  >
                    Заменить текущие
                  </button>

                  <button
                    onClick={() => copyFixedFromPrevious('merge', false)}
                    className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold rounded-2xl text-xs border border-slate-700 transition"
                  >
                    Объединить
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 py-2 text-center">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="text-xs text-slate-300">
                  В <strong>{prevMonthInfo.name}</strong> ещё нет сохраненных расходов.
                </div>
                <p className="text-[11px] text-slate-400">
                  Заполните расходы в этом месяце (аренда, счета, подписки) — и в следующем месяце вы сможете скопировать их в 1 клик!
                </p>
                <button
                  onClick={() => setShowCopyModal(false)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-2xl transition"
                >
                  Понятно
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}