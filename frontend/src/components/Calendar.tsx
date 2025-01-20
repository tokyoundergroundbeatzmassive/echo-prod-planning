import React, { useEffect, useState } from 'react';

interface CalendarDate {
    year: number;
    month: number;
    date: number;
}

interface CalendarProps {
    onDateSelect: (date: Date) => void;
    selectedDate: Date;
}

const Calendar: React.FC<CalendarProps> = ({ onDateSelect, selectedDate }) => {
    const [currentDate, setCurrentDate] = useState<CalendarDate>(() => {
        return {
            year: selectedDate.getFullYear(),
            month: selectedDate.getMonth(),
            date: selectedDate.getDate()
        };
    });
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setCurrentDate({
            year: selectedDate.getFullYear(),
            month: selectedDate.getMonth(),
            date: selectedDate.getDate()
        });
    }, [selectedDate]);

    const renderCalendar = () => {
        const firstDay = new Date(currentDate.year, currentDate.month, 1);
        const lastDay = new Date(currentDate.year, currentDate.month + 1, 0);
        const days = [];

        // 前月の日付を埋める
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(
                <div key={`empty-${i}`} className="text-center text-gray-400 p-2">
                    -
                </div>
            );
        }

        // 当月の日付を埋める
        for (let date = 1; date <= lastDay.getDate(); date++) {
            const currentDateObj = new Date(currentDate.year, currentDate.month, date);
            const isToday = isSameDate(currentDateObj, new Date());
            const isSelected = isSameDate(currentDateObj, selectedDate);

            days.push(
                <div
                    key={date}
                    onClick={() => handleDateSelect(date)}
                    className={`text-center p-2 cursor-pointer hover:bg-blue-100 rounded
            ${isToday ? 'bg-blue-50' : ''} 
            ${isSelected ? 'bg-blue-500 text-white' : ''}`}
                >
                    {date}
                </div>
            );
        }

        return (
            <div>
                <div className="flex justify-between mb-4">
                    <button
                        onClick={prevMonth}
                        className="px-2 py-1 hover:bg-gray-100 rounded"
                    >
                        &lt;
                    </button>
                    <div>{currentDate.year}年 {currentDate.month + 1}月</div>
                    <button
                        onClick={nextMonth}
                        className="px-2 py-1 hover:bg-gray-100 rounded"
                    >
                        &gt;
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-1">
                    <div className="text-center text-red-500">日</div>
                    <div className="text-center">月</div>
                    <div className="text-center">火</div>
                    <div className="text-center">水</div>
                    <div className="text-center">木</div>
                    <div className="text-center">金</div>
                    <div className="text-center text-blue-500">土</div>
                    {days}
                </div>
            </div>
        );
    };

    const handleDateSelect = (date: number) => {
        const newDate = new Date(currentDate.year, currentDate.month, date);
        onDateSelect(newDate);
        setIsOpen(false);
    };

    const prevMonth = () => {
        setCurrentDate(prev => {
            const newMonth = prev.month - 1;
            const newYear = prev.year + Math.floor(newMonth / 12);
            return {
                ...prev,
                year: newYear,
                month: (newMonth + 12) % 12
            };
        });
    };

    const nextMonth = () => {
        setCurrentDate(prev => {
            const newMonth = prev.month + 1;
            const newYear = prev.year + Math.floor(newMonth / 12);
            return {
                ...prev,
                year: newYear,
                month: newMonth % 12
            };
        });
    };

    const isSameDate = (date1: Date, date2: Date): boolean => {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    };

    // 1日前へ移動する関数
    const prevDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() - 1);
        onDateSelect(newDate);
    };

    // 1日後へ移動する関数
    const nextDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + 1);
        onDateSelect(newDate);
    };

    // 曜日を取得する関数
    const getWeekDay = (date: Date): string => {
        const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
        return weekDays[date.getDay()];
    };

    return (
        <div className="date-selector relative">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    日付選択
                </button>
                <div className="flex items-center gap-2">
                    <button
                        onClick={prevDay}
                        className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded"
                    >
                        &lt;
                    </button>
                    <h2 className="text-xl font-bold">
                        {selectedDate.getFullYear()}年 {selectedDate.getMonth() + 1}月 {selectedDate.getDate()}日（{getWeekDay(selectedDate)}）の生産計画
                    </h2>
                    <button
                        onClick={nextDay}
                        className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded"
                    >
                        &gt;
                    </button>
                </div>
            </div>
            {isOpen && (
                <div className="absolute bg-white shadow-lg rounded-lg p-4 z-10">
                    {renderCalendar()}
                </div>
            )}
        </div>
    );
};

export default Calendar;