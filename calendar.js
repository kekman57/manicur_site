// ========== КАЛЕНДАРЬ ДЛЯ МАНИКЮРНОГО САЛОНА ==========

class ManicureCalendar {
    constructor(containerId, onDateSelect, scheduleDataGetter) {
        this.container = document.getElementById(containerId);
        this.onDateSelect = onDateSelect;
        this.getScheduleData = scheduleDataGetter;
        
        this.currentDate = new Date();
        this.currentDate.setHours(0, 0, 0, 0);
        this.selectedDate = null;
        
        this.init();
    }
    
    init() {
        if (!this.container) return;
        this.render();
    }
    
    // Получить статус для конкретной даты
    getDateStatus(dateStr) {
        const scheduleData = this.getScheduleData();
        if (!scheduleData || scheduleData.length === 0) return null;
        
        const slotsForDate = scheduleData.filter(slot => slot.date === dateStr);
        if (slotsForDate.length === 0) return null;
        
        const hasFree = slotsForDate.some(slot => slot.status === 'свободно');
        if (hasFree) return 'has-free';
        return 'all-booked';
    }
    
    // Форматировать дату в YYYY-MM-DD
    formatDate(year, month, day) {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    
    // Получить количество дней в месяце
    getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }
    
    // Получить день недели первого числа месяца (0 = воскресенье)
    getFirstDayOfMonth(year, month) {
        return new Date(year, month, 1).getDay();
    }
    
    // Отрисовать календарь
    render() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        
        const daysInMonth = this.getDaysInMonth(year, month);
        const firstDayOfMonth = this.getFirstDayOfMonth(year, month);
        // Корректируем, чтобы понедельник был первым днём (0 = понедельник)
        let startOffset = firstDayOfMonth - 1;
        if (startOffset === -1) startOffset = 6;
        
        const daysInPrevMonth = this.getDaysInMonth(year, month - 1);
        
        let html = `
            <div class="custom-calendar">
                <div class="calendar-header">
                    <button class="calendar-nav-btn" data-nav="prev">←</button>
                    <span class="calendar-month-year">${monthNames[month]} ${year}</span>
                    <button class="calendar-nav-btn" data-nav="next">→</button>
                </div>
                <div class="calendar-weekdays">
                    ${weekdays.map(day => `<div class="calendar-weekday">${day}</div>`).join('')}
                </div>
                <div class="calendar-days">
        `;
        
        // Пустые ячейки для дней предыдущего месяца
        for (let i = 0; i < startOffset; i++) {
            const prevDay = daysInPrevMonth - startOffset + i + 1;
            const prevDateStr = this.formatDate(year, month - 1, prevDay);
            const status = this.getDateStatus(prevDateStr);
            html += `<div class="calendar-day other-month ${status || ''}" data-date="${prevDateStr}">${prevDay}</div>`;
        }
        
        // Дни текущего месяца
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = this.formatDate(year, month, day);
            const status = this.getDateStatus(dateStr);
            const isSelected = (this.selectedDate === dateStr);
            html += `<div class="calendar-day ${status || ''} ${isSelected ? 'selected' : ''}" data-date="${dateStr}">${day}</div>`;
        }
        
        // Дни следующего месяца (чтобы заполнить сетку до 6 строк)
        const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
        const nextMonthDays = totalCells - (startOffset + daysInMonth);
        for (let day = 1; day <= nextMonthDays; day++) {
            const nextDateStr = this.formatDate(year, month + 1, day);
            const status = this.getDateStatus(nextDateStr);
            html += `<div class="calendar-day other-month ${status || ''}" data-date="${nextDateStr}">${day}</div>`;
        }
        
        html += `
                </div>
            </div>
        `;
        
        this.container.innerHTML = html;
        
        // Добавляем обработчики событий
        this.attachEventHandlers();
    }
    
    attachEventHandlers() {
        // Навигация
        const prevBtn = this.container.querySelector('[data-nav="prev"]');
        const nextBtn = this.container.querySelector('[data-nav="next"]');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.render();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.render();
            });
        }
        
        // Клик по дню
        const dayElements = this.container.querySelectorAll('.calendar-day');
        dayElements.forEach(el => {
            el.addEventListener('click', () => {
                const date = el.dataset.date;
                if (date) {
                    this.selectDate(date);
                }
            });
        });
    }
    
    selectDate(dateStr) {
        this.selectedDate = dateStr;
        this.render();
        if (this.onDateSelect) {
            this.onDateSelect(dateStr);
        }
    }
    
    // Установить выбранную дату извне
    setSelectedDate(dateStr) {
        this.selectedDate = dateStr;
        this.render();
    }
    
    // Обновить статусы дней (например, после загрузки расписания)
    refresh() {
        this.render();
    }
}