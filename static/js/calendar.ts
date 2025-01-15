interface CalendarDate {
    year: number;
    month: number;
    date: number;
}

class ProductionCalendar {
    private currentDate: CalendarDate;
    private calendarElement: HTMLElement | null;
    private selectedDate: Date;

    constructor() {
        const today = new Date();
        this.currentDate = {
            year: today.getFullYear(),
            month: today.getMonth(),
            date: today.getDate()
        };
        this.selectedDate = today;
        this.calendarElement = null;
        this.initialize();
    }

    private initialize(): void {
        document.addEventListener('DOMContentLoaded', () => {
            // カレンダー表示ボタンのイベントリスナー設定
            const datePickerButton = document.getElementById('date-picker-button');
            if (datePickerButton) {
                datePickerButton.addEventListener('click', () => this.toggleCalendar());
            }

            // カレンダー要素の作成
            this.createCalendarElement();
            this.updateProductionSchedule(this.selectedDate);
        });
    }

    private createCalendarElement(): void {
        this.calendarElement = document.createElement('div');
        this.calendarElement.className = 'absolute bg-white shadow-lg rounded-lg p-4 hidden';
        document.querySelector('.date-selector')?.appendChild(this.calendarElement);
        this.renderCalendar();
    }

    private renderCalendar(): void {
        if (!this.calendarElement) return;

        const firstDay = new Date(this.currentDate.year, this.currentDate.month, 1);
        const lastDay = new Date(this.currentDate.year, this.currentDate.month + 1, 0);

        let calendarHTML = `
            <div class="flex justify-between mb-4">
                <button class="px-2 py-1 hover:bg-gray-100 rounded" onclick="calendar.prevMonth()">&lt;</button>
                <div>${this.currentDate.year}年 ${this.currentDate.month + 1}月</div>
                <button class="px-2 py-1 hover:bg-gray-100 rounded" onclick="calendar.nextMonth()">&gt;</button>
            </div>
            <div class="grid grid-cols-7 gap-1">
                <div class="text-center text-red-500">日</div>
                <div class="text-center">月</div>
                <div class="text-center">火</div>
                <div class="text-center">水</div>
                <div class="text-center">木</div>
                <div class="text-center">金</div>
                <div class="text-center text-blue-500">土</div>
        `;

        // 前月の日付を埋める
        const firstDayOfWeek = firstDay.getDay();
        for (let i = 0; i < firstDayOfWeek; i++) {
            calendarHTML += '<div class="text-center text-gray-400 p-2">-</div>';
        }

        // 当月の日付を埋める
        for (let date = 1; date <= lastDay.getDate(); date++) {
            const isToday = this.isToday(new Date(this.currentDate.year, this.currentDate.month, date));
            const isSelected = this.isSelectedDate(new Date(this.currentDate.year, this.currentDate.month, date));

            calendarHTML += `
                <div 
                    class="text-center p-2 cursor-pointer hover:bg-blue-100 rounded
                    ${isToday ? 'bg-blue-50' : ''} 
                    ${isSelected ? 'bg-blue-500 text-white' : ''}"
                    onclick="calendar.selectDate(${date})"
                >
                    ${date}
                </div>
            `;
        }

        calendarHTML += '</div>';
        this.calendarElement.innerHTML = calendarHTML;
    }

    private toggleCalendar(): void {
        if (!this.calendarElement) return;
        this.calendarElement.classList.toggle('hidden');
    }

    public prevMonth(): void {
        this.currentDate.month--;
        if (this.currentDate.month < 0) {
            this.currentDate.month = 11;
            this.currentDate.year--;
        }
        this.renderCalendar();
    }

    public nextMonth(): void {
        this.currentDate.month++;
        if (this.currentDate.month > 11) {
            this.currentDate.month = 0;
            this.currentDate.year++;
        }
        this.renderCalendar();
    }

    public selectDate(date: number): void {
        this.selectedDate = new Date(this.currentDate.year, this.currentDate.month, date);
        this.renderCalendar();
        this.toggleCalendar();
        this.updateProductionSchedule(this.selectedDate);
    }

    private isToday(date: Date): boolean {
        const today = new Date();
        return date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate();
    }

    private isSelectedDate(date: Date): boolean {
        return date.getFullYear() === this.selectedDate.getFullYear() &&
            date.getMonth() === this.selectedDate.getMonth() &&
            date.getDate() === this.selectedDate.getDate();
    }

    private updateProductionSchedule(date: Date): void {
        const dateDisplay = document.getElementById('selected-date');
        if (dateDisplay) {
            dateDisplay.textContent = `${date.getFullYear()}年 ${date.getMonth() + 1}月 ${date.getDate()}日の生産計画`;
        }
        // ここで生産計画テーブルの内容を更新
    }
}

// インスタンス作成とグローバルへの公開
const calendar = new ProductionCalendar();
(window as any).calendar = calendar; 