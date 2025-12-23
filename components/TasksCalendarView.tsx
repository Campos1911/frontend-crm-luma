import React, { useState, useMemo, useRef, useEffect } from 'react';
import { GlobalTask } from '../types';
import { Icon } from './ui/Icon';

interface TasksCalendarViewProps {
    tasks: GlobalTask[];
    onTaskClick: (task: GlobalTask) => void;
}

export const TasksCalendarView: React.FC<TasksCalendarViewProps> = ({ tasks, onTaskClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [showYearPicker, setShowYearPicker] = useState(false);

    // Refs for clicking outside
    const monthRef = useRef<HTMLDivElement>(null);
    const yearRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (monthRef.current && !monthRef.current.contains(event.target as Node)) {
                setShowMonthPicker(false);
            }
            if (yearRef.current && !yearRef.current.contains(event.target as Node)) {
                setShowYearPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    const calendarData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const prevMonthDays = new Date(year, month, 0).getDate();
        
        const days = [];
        
        // Days from previous month
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            days.push({
                day: prevMonthDays - i,
                month: month - 1,
                year: year,
                currentMonth: false
            });
        }
        
        // Days from current month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                day: i,
                month: month,
                year: year,
                currentMonth: true
            });
        }
        
        // Days from next month to fill the grid (6 rows * 7 columns = 42)
        const totalSlots = 42;
        const nextMonthStart = 1;
        while (days.length < totalSlots) {
            days.push({
                day: nextMonthStart + (days.length - (firstDayOfMonth + daysInMonth)),
                month: month + 1,
                year: year,
                currentMonth: false
            });
        }
        
        return days;
    }, [currentDate]);

    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    const handleMonthSelect = (monthIndex: number) => {
        const newDate = new Date(currentDate.getFullYear(), monthIndex, 1);
        setCurrentDate(newDate);
        setShowMonthPicker(false);
    };

    const handleYearSelect = (year: number) => {
        const newDate = new Date(year, currentDate.getMonth(), 1);
        setCurrentDate(newDate);
        setShowYearPicker(false);
    };

    const getTasksForDate = (day: number, month: number, year: number) => {
        // Adjust for JS Date months (0-11) vs ISO strings (1-12)
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return tasks.filter(task => task.dueDate === dateStr);
    };

    // Generate year range (current year +/- 6)
    const currentYear = currentDate.getFullYear();
    const years = Array.from({ length: 12 }, (_, i) => currentYear - 6 + i);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-background-dark">
            {/* Calendar Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-gray-800 relative z-20">
                
                {/* Title & Selectors */}
                <div className="flex items-center gap-2">
                    {/* Month Selector */}
                    <div className="relative" ref={monthRef}>
                        <button 
                            onClick={() => setShowMonthPicker(!showMonthPicker)}
                            className="flex items-center gap-1 text-xl font-bold text-gray-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-gray-800 px-2 py-1 rounded-lg transition-colors"
                        >
                            {monthNames[currentDate.getMonth()]}
                            <Icon name="arrow_drop_down" className="text-gray-400" />
                        </button>
                        
                        {showMonthPicker && (
                            <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-[#1e1d24] border border-neutral-200 dark:border-gray-700 rounded-lg shadow-xl p-2 grid grid-cols-2 gap-1 animate-scale-in origin-top-left">
                                {monthNames.map((m, idx) => (
                                    <button
                                        key={m}
                                        onClick={() => handleMonthSelect(idx)}
                                        className={`px-3 py-2 text-sm text-left rounded-md transition-colors ${
                                            currentDate.getMonth() === idx 
                                                ? 'bg-primary/10 text-primary font-bold' 
                                                : 'text-gray-700 dark:text-gray-200 hover:bg-neutral-100 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Year Selector */}
                    <div className="relative" ref={yearRef}>
                        <button 
                            onClick={() => setShowYearPicker(!showYearPicker)}
                            className="flex items-center gap-1 text-xl font-bold text-gray-500 dark:text-gray-400 hover:bg-neutral-100 dark:hover:bg-gray-800 px-2 py-1 rounded-lg transition-colors"
                        >
                            {currentDate.getFullYear()}
                            <Icon name="arrow_drop_down" className="text-gray-400" />
                        </button>

                        {showYearPicker && (
                            <div className="absolute top-full left-0 mt-2 w-32 bg-white dark:bg-[#1e1d24] border border-neutral-200 dark:border-gray-700 rounded-lg shadow-xl p-2 max-h-64 overflow-y-auto kanban-scroll animate-scale-in origin-top-left">
                                {years.map((y) => (
                                    <button
                                        key={y}
                                        onClick={() => handleYearSelect(y)}
                                        className={`w-full px-3 py-2 text-sm text-left rounded-md transition-colors ${
                                            currentDate.getFullYear() === y
                                                ? 'bg-primary/10 text-primary font-bold' 
                                                : 'text-gray-700 dark:text-gray-200 hover:bg-neutral-100 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        {y}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Static Navigation Controls */}
                <div className="flex items-center bg-neutral-100 dark:bg-gray-800 rounded-lg p-1">
                    <button 
                        onClick={() => changeMonth(-1)}
                        className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-colors text-gray-600 dark:text-gray-400"
                        title="Mês anterior"
                    >
                        <Icon name="chevron_left" />
                    </button>
                    <button 
                        onClick={() => setCurrentDate(new Date())}
                        className="px-3 py-1 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                    >
                        Hoje
                    </button>
                    <button 
                        onClick={() => changeMonth(1)}
                        className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-colors text-gray-600 dark:text-gray-400"
                        title="Próximo mês"
                    >
                        <Icon name="chevron_right" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-hidden border-l border-t border-neutral-200 dark:border-gray-800 relative z-10">
                {/* Days of Week Headers */}
                {daysOfWeek.map(day => (
                    <div key={day} className="bg-neutral-50 dark:bg-gray-800/50 py-2 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-r border-b border-neutral-200 dark:border-gray-800">
                        {day}
                    </div>
                ))}

                {/* Date Cells */}
                {calendarData.map((cell, idx) => {
                    const dayTasks = getTasksForDate(cell.day, cell.month, cell.year);
                    const isToday = new Date().toDateString() === new Date(cell.year, cell.month, cell.day).toDateString();
                    
                    return (
                        <div 
                            key={idx} 
                            className={`min-h-[120px] p-2 border-r border-b border-neutral-200 dark:border-gray-800 flex flex-col gap-1 overflow-y-auto kanban-scroll ${
                                cell.currentMonth ? 'bg-white dark:bg-background-dark' : 'bg-neutral-50/50 dark:bg-gray-900/20'
                            }`}
                        >
                            <div className="flex justify-end">
                                <span className={`size-7 flex items-center justify-center text-sm font-bold rounded-full ${
                                    isToday 
                                        ? 'bg-primary text-white' 
                                        : cell.currentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-600'
                                }`}>
                                    {cell.day}
                                </span>
                            </div>
                            
                            <div className="flex flex-col gap-1">
                                {dayTasks.map(task => (
                                    <button
                                        key={task.id}
                                        onClick={() => onTaskClick(task)}
                                        className={`text-left px-2 py-1 rounded text-[11px] font-bold truncate transition-all border ${
                                            task.isCompleted
                                                ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 line-through opacity-70'
                                                : 'bg-primary/10 border-primary/20 text-primary dark:bg-primary/20 dark:border-primary/40 dark:text-primary-light hover:scale-[1.02] shadow-sm'
                                        }`}
                                        title={task.title}
                                    >
                                        {task.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};