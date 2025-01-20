import React, { useState } from 'react';

interface DatePickerProps {
    position: {
        top: number;
        left: number;
    };
    onDateSelect: (date: Date) => void;
    onClose: () => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({
    position,
    onDateSelect,
    onClose
}) => {
    const [currentDate, setCurrentDate] = useState(() => {
        const today = new Date();
        return {
            year: today.getFullYear(),
            month: today.getMonth()
        };
    });

    const renderCalendar = () => {
        const firstDay = new Date(currentDate.year, currentDate.month, 1);
        const lastDay = new Date(currentDate.year, currentDate.month + 1, 0);
        const today = new Date();
        const days = [];

        // 前月の日付を埋める
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(
                <div key={`empty-${i}`} className="text-center text-gray-400 p-1">
                    -
                </div>
            );
        }

        // 当月の日付を埋める
        for (let date = 1; date <= lastDay.getDate(); date++) {
            const currentDateObj = new Date(currentDate.year, currentDate.month, date);
            const isToday = isSameDate(currentDateObj, today);

            days.push(
                <div
                    key={date}
                    onClick={() => {
                        onDateSelect(new Date(currentDate.year, currentDate.month, date));
                        onClose();
                    }}
                    className={`text-center p-1 cursor-pointer hover:bg-blue-100 rounded
                        ${isToday ? 'bg-blue-100' : ''}`}
                >
                    {date}
                </div>
            );
        }

        return days;
    };

    // 日付比較用のヘルパー関数
    const isSameDate = (date1: Date, date2: Date): boolean => {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    };

    // 前月へ移動
    const handlePrevMonth = () => {
        setCurrentDate(prev => {
            if (prev.month === 0) {
                return {
                    year: prev.year - 1,
                    month: 11
                };
            }
            return {
                ...prev,
                month: prev.month - 1
            };
        });
    };

    // 翌月へ移動
    const handleNextMonth = () => {
        setCurrentDate(prev => {
            if (prev.month === 11) {
                return {
                    year: prev.year + 1,
                    month: 0
                };
            }
            return {
                ...prev,
                month: prev.month + 1
            };
        });
    };

    return (
        <div
            className="absolute z-50 bg-white shadow-lg rounded-lg p-2 w-64"
            style={{
                top: `${position.top}px`,
                left: `${position.left - 200}px`
            }}
        >
            <div className="flex justify-between items-center mb-2">
                <button
                    onClick={handlePrevMonth}
                    className="px-2 hover:bg-gray-100 rounded"
                >
                    ←
                </button>
                <span>{currentDate.year}年{currentDate.month + 1}月</span>
                <button
                    onClick={handleNextMonth}
                    className="px-2 hover:bg-gray-100 rounded"
                >
                    →
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-sm">
                <div className="text-center text-red-500">日</div>
                <div className="text-center">月</div>
                <div className="text-center">火</div>
                <div className="text-center">水</div>
                <div className="text-center">木</div>
                <div className="text-center">金</div>
                <div className="text-center text-blue-500">土</div>
                {renderCalendar()}
            </div>
        </div>
    );
}; 