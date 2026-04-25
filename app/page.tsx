'use client';

import { useState, useEffect } from 'react';

export default function Home() {
    const defaultExpenses = [
        { id: 1, title: 'Кофе', amount: 350, category: 'Еда' },
        { id: 2, title: 'Такси', amount: 1500, category: 'Транспорт' },
        { id: 3, title: 'Кино', amount: 600, category: 'Развлечения' },
    ];

    const defaultCategories = ['Еда', 'Транспорт', 'Развлечения', 'Покупки', 'Другое'];

    const [expenses, setExpenses] = useState(defaultExpenses);
    const [categories, setCategories] = useState(defaultCategories);

    const [newTitle, setNewTitle] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [newCategory, setNewCategory] = useState('Еда');
    const [activeFilter, setActiveFilter] = useState('Все');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const savedExpenses = localStorage.getItem('expenses');
        const savedCategories = localStorage.getItem('categories');

        if (savedExpenses) {
            setExpenses(JSON.parse(savedExpenses));
        }
        if (savedCategories) {
            setCategories(JSON.parse(savedCategories));
        }

        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('expenses', JSON.stringify(expenses));
        }
    }, [expenses, isLoaded]);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('categories', JSON.stringify(categories));
        }
    }, [categories, isLoaded]);

    const filteredExpenses = activeFilter === 'Все'
        ? expenses
        : expenses.filter(exp => exp.category === activeFilter);

    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    const addExpense = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newAmount) return;

        const amount = Number(newAmount);
        if (amount < 1 || amount > 1000000) {
            alert('Сумма должна быть от 1 до 1 000 000 ₽');
            return;
        }

        const expense = {
            id: Date.now(),
            title: newTitle,
            amount: amount,
            category: newCategory,
        };

        setExpenses([expense, ...expenses]);
        setNewTitle('');
        setNewAmount('');
    };

    const deleteExpense = (id: number) => {
        setExpenses(expenses.filter(expense => expense.id !== id));
    };

    const addCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        if (categories.includes(newCategoryName.trim())) {
            alert('Такая категория уже существует!');
            return;
        }

        setCategories([...categories, newCategoryName.trim()]);
        setNewCategoryName('');
        setShowCategoryForm(false);
    };

    const deleteCategory = (categoryToDelete: string) => {
        const isUsed = expenses.some(exp => exp.category === categoryToDelete);

        if (isUsed) {
            alert(`Нельзя удалить категорию "${categoryToDelete}", так как в ней есть траты!`);
            return;
        }

        if (categories.length <= 2) {
            alert('Должно остаться минимум 2 категории!');
            return;
        }

        setCategories(categories.filter(cat => cat !== categoryToDelete));

        if (activeFilter === categoryToDelete) {
            setActiveFilter('Все');
        }
    };

    const clearAllData = () => {
        if (confirm('Вы уверены? Все траты будут удалены!')) {
            setExpenses([]);
            localStorage.removeItem('expenses');
        }
    };

    const getCategoryIcon = (category: string) => {
        const icons: Record<string, string> = {
            'Еда': '🍕',
            'Транспорт': '🚌',
            'Развлечения': '🎮',
            'Покупки': '🛍',
            'Другое': '📦',
        };
        return icons[category] || '📌';
    };

    if (!isLoaded) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Загрузка...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-3 sm:p-4 md:p-8 pb-24">
            <div className="max-w-2xl mx-auto">
                {/* Заголовок */}
                <div className="flex justify-between items-start mb-6 sm:mb-8">
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            💸 ExpenseFlow
                        </h1>
                        <p className="text-gray-500 text-xs sm:text-sm mt-1">Учёт личных расходов</p>
                    </div>
                    {expenses.length > 0 && (
                        <button
                            onClick={clearAllData}
                            className="text-xs sm:text-sm text-red-500 hover:text-red-700 hover:bg-red-100 px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 font-medium ml-2 whitespace-nowrap"
                        >
                            🗑
                        </button>
                    )}
                </div>

                {/* Карточка баланса */}
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl mb-6 sm:mb-8 text-center transform hover:scale-[1.02] transition-transform duration-300">
                    <p className="text-blue-100 text-xs sm:text-sm font-medium mb-2 uppercase tracking-wide">Общий баланс</p>
                    <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                        {total.toLocaleString('ru-RU')} ₽
                    </p>
                    <p className="text-blue-100 text-xs mt-3">
                        {filteredExpenses.length} {filteredExpenses.length === 1 ? 'трата' : filteredExpenses.length < 5 ? 'траты' : 'трат'}
                    </p>
                </div>

                {/* Форма добавления */}
                <div className="bg-white/80 backdrop-blur-lg p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl mb-6 sm:mb-8 border border-white/50">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-5 flex items-center gap-2">
                        <span className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-xl flex items-center justify-center text-base sm:text-lg">+</span>
                        Добавить трату
                    </h2>
                    <form onSubmit={addExpense} className="space-y-3 sm:space-y-4">
                        <div>
                            <input
                                type="text"
                                placeholder="Например: Обед в кафе"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-800 placeholder-gray-400 font-medium text-sm sm:text-base"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <input
                                type="number"
                                placeholder="Сумма"
                                value={newAmount}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || (Number(value) >= 0 && Number(value) <= 1000000)) {
                                        setNewAmount(value);
                                    }
                                }}
                                className="px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-800 placeholder-gray-400 font-medium text-sm sm:text-base"
                                required
                                min="1"
                                max="1000000"
                                step="1"
                            />

                            <select
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                className="px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-800 font-medium cursor-pointer text-sm sm:text-base"
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{getCategoryIcon(cat)} {cat}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 hover:from-blue-700 hover:to-purple-700 active:scale-95"
                        >
                            Добавить расход
                        </button>
                    </form>
                </div>

                {/* Фильтры */}
                <div className="mb-4 sm:mb-6">
                    <p className="text-gray-600 font-semibold mb-3 text-xs sm:text-sm uppercase tracking-wide">Категории</p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setActiveFilter('Все')}
                            className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                                activeFilter === 'Все'
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border-2 border-gray-200'
                            }`}
                        >
                            📊 Все
                        </button>

                        {categories.map((cat) => (
                            <div
                                key={cat}
                                className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 group relative ${
                                    activeFilter === cat
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border-2 border-gray-200'
                                }`}
                            >
                                <button
                                    onClick={() => setActiveFilter(cat)}
                                    className="flex items-center gap-1.5 sm:gap-2"
                                >
                                    <span className="text-sm sm:text-base">{getCategoryIcon(cat)}</span>
                                    <span className="hidden xs:inline">{cat}</span>
                                </button>
                                {cat !== 'Другое' && (
                                    <button
                                        onClick={() => deleteCategory(cat)}
                                        className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white text-[10px] sm:text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                                        title="Удалить категорию"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}

                        <button
                            onClick={() => setShowCategoryForm(!showCategoryForm)}
                            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold bg-green-100 text-green-700 hover:bg-green-200 border-2 border-green-200 transition-all duration-200"
                        >
                            <span className="text-base sm:text-lg">+</span>
                            <span className="hidden xs:inline">Категория</span>
                        </button>
                    </div>

                    {/* Форма категории */}
                    {showCategoryForm && (
                        <form onSubmit={addCategory} className="flex gap-2 mt-4 animate-fadeIn">
                            <input
                                type="text"
                                placeholder="Название"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-green-500 transition-all duration-200 text-sm sm:text-base"
                                required
                                maxLength={20}
                            />
                            <button
                                type="submit"
                                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg sm:rounded-xl font-bold hover:bg-green-700 transition-all duration-200 shadow-lg text-sm sm:text-base"
                            >
                                ✓
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCategoryForm(false);
                                    setNewCategoryName('');
                                }}
                                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-200 text-gray-700 rounded-lg sm:rounded-xl font-bold hover:bg-gray-300 transition-all duration-200 text-sm sm:text-base"
                            >
                                ✕
                            </button>
                        </form>
                    )}
                </div>

                {/* Список трат */}
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-xl border border-white/50 overflow-hidden">
                    <div className="p-4 sm:p-6 border-b-2 border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-transparent">
                        <h2 className="text-base sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                            📋 Траты
                            <span className="text-xs sm:text-sm font-normal text-gray-500 bg-gray-200 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                                {filteredExpenses.length}
                            </span>
                        </h2>
                        {expenses.length > 0 && (
                            <span className="text-[10px] sm:text-xs text-gray-400 font-medium hidden sm:inline">
                                💾 Автосохранение
                            </span>
                        )}
                    </div>

                    <div className="divide-y divide-gray-100">
                        {filteredExpenses.map((expense, index) => (
                            <div
                                key={expense.id}
                                className="p-3 sm:p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 group animate-slideIn"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-md flex-shrink-0">
                                        {getCategoryIcon(expense.category)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-800 text-sm sm:text-lg truncate">{expense.title}</p>
                                        <p className="text-xs sm:text-sm text-gray-500 font-medium">{expense.category}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-0 sm:ml-4">
                                    <p className="font-bold text-gray-800 text-sm sm:text-lg whitespace-nowrap">
                                        {expense.amount.toLocaleString('ru-RU')} ₽
                                    </p>
                                    <button
                                        onClick={() => deleteExpense(expense.id)}
                                        className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl bg-red-100 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all duration-200 transform hover:scale-110 flex-shrink-0"
                                        title="Удалить трату"
                                    >
                                        🗑
                                    </button>
                                </div>
                            </div>
                        ))}

                        {filteredExpenses.length === 0 && (
                            <div className="p-8 sm:p-12 text-center">
                                <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📭</div>
                                <p className="text-gray-500 font-medium text-sm sm:text-lg">
                                    {activeFilter === 'Все'
                                        ? 'Пока нет трат'
                                        : `В категории "${activeFilter}" пусто`}
                                </p>
                                <p className="text-gray-400 text-xs sm:text-sm mt-2">
                                    Добавьте первую трату выше!
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Подвал */}
                <div className="text-center mt-6 sm:mt-8 text-gray-400 text-xs sm:text-sm">
                    <p>Сделано с ❤️ на Next.js</p>
                </div>
            </div>

            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                .animate-slideIn {
                    animation: slideIn 0.4s ease-out;
                    opacity: 0;
                    animation-fill-mode: forwards;
                }
            `}</style>
        </main>
    );
}