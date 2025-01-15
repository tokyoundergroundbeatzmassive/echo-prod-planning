import React, { useState } from 'react';

interface CalendarDate {
    year: number;
    month: number;
    date: number;
}

const Calendar: React.FC = () => {
    const [currentDate, setCurrentDate] = useState<CalendarDate>(() => {
        const today = new Date();
        return {
            year: today.getFullYear(),
            month: today.getMonth(),
            date: today.getDate()
        };
    });
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [isOpen, setIsOpen] = useState(false);

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
        setSelectedDate(newDate);
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

    return (
        <div className="date-selector relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                日付選択
            </button>
            <h2 className="text-xl font-bold my-4">
                {selectedDate.getFullYear()}年 {selectedDate.getMonth() + 1}月 {selectedDate.getDate()}日の生産計画
            </h2>
            {isOpen && (
                <div className="absolute bg-white shadow-lg rounded-lg p-4 z-10">
                    {renderCalendar()}
                </div>
            )}
        </div>
    );
};

export default Calendar;