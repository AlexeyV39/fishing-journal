// ─── Константы ───
const STORAGE_KEY = 'fishing_journal';
const MONTHS_RU = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const MONTHS_SHORT = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
const DAYS_RU = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

// ─── База водоёмов ───
const WATER_BODIES = [
    { name: 'Озеро Байкал', lat: 53.5587, lng: 108.1650, region: 'Иркутская обл.', fish: ['Омуль', 'Нельма', 'Сиг', 'Хариус', 'Ленок', 'Таймень', 'Сиг-лещ', 'Гольян'] },
    { name: 'Озеро Ладожское', lat: 61.0, lng: 31.0, region: 'Ленинградская обл.', fish: ['Лещ', 'Сиг', 'Судак', 'Ряпушка', 'Сельдь', 'Навага', 'Корюшка'] },
    { name: 'Озеро Онежское', lat: 61.5, lng: 35.0, region: 'Карелия', fish: ['Лещ', 'Сиг', 'Судак', 'Ряпушка', 'Корюшка', 'Навага'] },
    { name: 'Река Волга', lat: 56.85, lng: 45.0, region: 'Нижегородская обл.', fish: ['Судак', 'Щука', 'Лещ', 'Жерех', 'Сом', 'Желтопёрый карась', 'Карп', 'Густера'] },
    { name: 'Река Ока', lat: 55.0, lng: 39.0, region: 'Рязанская обл.', fish: ['Судак', 'Щука', 'Лещ', 'Жерех', 'Сом', 'Карась', 'Густера', 'Краснопёрка'] },
    { name: 'Река Москва', lat: 55.75, lng: 37.62, region: 'Москва', fish: ['Щука', 'Окунь', 'Плотва', 'Уклейка', 'Карась', 'Лещ', 'Густера'] },
    { name: 'Река Клязьма', lat: 55.8, lng: 37.8, region: 'Московская обл.', fish: ['Щука', 'Окунь', 'Плотва', 'Лещ', 'Карась', 'Густера', 'Краснопёрка'] },
    { name: 'Истринское водохранилище', lat: 55.92, lng: 36.85, region: 'Московская обл.', fish: ['Щука', 'Окунь', 'Лещ', 'Плотва', 'Карась', 'Судак'] },
    { name: 'Можайское водохранилище', lat: 55.6, lng: 36.0, region: 'Московская обл.', fish: ['Щука', 'Окунь', 'Лещ', 'Плотва', 'Карась'] },
    { name: 'Река Яуза', lat: 55.85, lng: 37.7, region: 'Москва', fish: ['Щука', 'Окунь', 'Плотва', 'Уклейка', 'Ерш'] },
    { name: 'Река Сходня', lat: 55.95, lng: 37.25, region: 'Московская обл.', fish: ['Щука', 'Окунь', 'Плотва', 'Карась', 'Гольян'] },
    { name: 'Река Химки', lat: 55.88, lng: 37.45, region: 'Московская обл.', fish: ['Щука', 'Окунь', 'Плотва', 'Уклейка'] },
    { name: 'Река Пахра', lat: 55.45, lng: 37.85, region: 'Московская обл.', fish: ['Щука', 'Окунь', 'Лещ', 'Карась', 'Плотва', 'Густера'] },
    { name: 'Река Нара', lat: 55.4, lng: 36.8, region: 'Московская обл.', fish: ['Щука', 'Окунь', 'Лещ', 'Карась', 'Плотва'] },
    { name: 'Река Руза', lat: 55.7, lng: 36.2, region: 'Московская обл.', fish: ['Щука', 'Окунь', 'Лещ', 'Плотва', 'Карась'] },
    { name: 'Река Сетунь', lat: 55.75, lng: 37.45, region: 'Москва', fish: ['Щука', 'Окунь', 'Плотва', 'Уклейка', 'Ерш'] },
    { name: 'Перхушковское водохранилище', lat: 55.85, lng: 37.0, region: 'Московская обл.', fish: ['Щука', 'Окунь', 'Плотва', 'Карась'] },
    { name: 'Река Невля', lat: 56.7, lng: 60.3, region: 'Челябинская обл.', fish: ['Щука', 'Окунь', 'Плотва', 'Карась', 'Лещ'] },
    { name: 'Река Миасс', lat: 55.05, lng: 60.1, region: 'Челябинская обл.', fish: ['Хариус', 'Форель', 'Ленок', 'Окунь', 'Щука'] },
    { name: 'Озеро Тургояк', lat: 55.1, lng: 60.1, region: 'Челябинская обл.', fish: ['Щука', 'Окунь', 'Лещ', 'Плотва', 'Форель'] },
    { name: 'Река Тобол', lat: 55.2, lng: 68.2, region: 'Курганская обл.', fish: ['Судак', 'Щука', 'Лещ', 'Озёрный сиг', 'Плотва'] },
    { name: 'Река Ишим', lat: 56.1, lng: 69.5, region: 'Тюменская обл.', fish: ['Судак', 'Щука', 'Лещ', 'Плотва', 'Карась'] },
    { name: 'Река Обь', lat: 55.0, lng: 83.0, region: 'Новосибирская обл.', fish: ['Судак', 'Щука', 'Омуль', 'Лещ', 'Плотва', 'Налим'] },
    { name: 'Река Енисей', lat: 56.0, lng: 92.8, region: 'Красноярский край', fish: ['Омуль', 'Таймень', 'Ленок', 'Хариус', 'Щука', 'Судак'] },
    { name: 'Река Лена', lat: 62.0, lng: 130.0, region: 'Якутия', fish: ['Омуль', 'Таймень', 'Ленок', 'Хариус', 'Щука'] },
    { name: 'Река Амур', lat: 48.5, lng: 135.0, region: 'Хабаровский край', fish: ['Калуга', 'Сом', 'Лещ', 'Судак', 'Щука', 'Амурский сом'] },
    { name: 'Река Дон', lat: 47.2, lng: 39.7, region: 'Ростовская обл.', fish: ['Судак', 'Щука', 'Лещ', 'Сом', 'Карась', 'Густера'] },
    { name: 'Река Кубань', lat: 45.0, lng: 38.9, region: 'Краснодарский край', fish: ['Судак', 'Щука', 'Лещ', 'Сом', 'Карась'] },
    { name: 'Река Кавказка', lat: 43.5, lng: 44.0, region: 'Северная Осетия', fish: ['Форель', 'Хариус', 'Ленок', 'Гольян'] },
    { name: 'Река Самара', lat: 53.2, lng: 50.1, region: 'Самарская обл.', fish: ['Судак', 'Щука', 'Лещ', 'Карась', 'Плотва'] },
    { name: 'Река Урал', lat: 51.8, lng: 55.0, region: 'Оренбургская обл.', fish: ['Судак', 'Щука', 'Лещ', 'Карась', 'Форель'] },
    { name: 'Озеро Телецкое', lat: 51.5, lng: 87.5, region: 'Алтай', fish: ['Хариус', 'Форель', 'Ленок', 'Окушок'] },
    { name: 'Река Бия', lat: 52.4, lng: 85.0, region: 'Алтай', fish: ['Хариус', 'Форель', 'Ленок', 'Окушок'] },
    { name: 'Река Катунь', lat: 51.7, lng: 85.5, region: 'Алтай', fish: ['Хариус', 'Форель', 'Ленок', 'Гольян'] },
    { name: 'Река Печора', lat: 63.0, lng: 56.3, region: 'Коми', fish: ['Сиг', 'Сельдь', 'Навага', 'Корюшка', 'Щука', 'Окунь'] },
    { name: 'Река Мезень', lat: 62.2, lng: 50.0, region: 'Архангельская обл.', fish: ['Сиг', 'Сельдь', 'Корюшка', 'Щука', 'Окунь'] },
    { name: 'Река Северная Двина', lat: 64.5, lng: 41.8, region: 'Архангельская обл.', fish: ['Сиг', 'Сельдь', 'Навага', 'Щука', 'Лещ'] },
    { name: 'Река Неман', lat: 54.9, lng: 23.9, region: 'Калининградская обл.', fish: ['Лещ', 'Щука', 'Судак', 'Карась', 'Густера'] },
    { name: 'Река Преголя', lat: 54.7, lng: 20.5, region: 'Калининградская обл.', fish: ['Лещ', 'Щука', 'Судак', 'Карась', 'Угорь'] },
    { name: 'Река Вуокса', lat: 60.6, lng: 30.0, region: 'Ленинградская обл.', fish: ['Щука', 'Окунь', 'Лещ', 'Плотва', 'Судак'] },
    { name: 'Река Свирь', lat: 60.5, lng: 34.0, region: 'Ленинградская обл.', fish: ['Лещ', 'Сиг', 'Судак', 'Щука', 'Ряпушка'] },
];

// ─── Состояние ───
let catches = [];
let mapMarkers = [];
let settings = { city: 'Москва' };
let currentEditId = null;
let deleteTargetId = null;
let calendarDate = new Date();
let selectedCalendarDate = null;
let photoDataUrl = null;
let ymap = null;
let placingMarker = false;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ─── Инициализация ───
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEvents();
    setDefaultDate();
    // Восстановить вкладку
    const savedTab = localStorage.getItem(STORAGE_KEY + '_tab') || 'dashboard';
    switchTab(savedTab);
    updateAll();
    loadWeather();
    calcMoonPhase();
    updateForecast();
});

// ─── Хранилище ───
function loadData() {
    try {
        const d = localStorage.getItem(STORAGE_KEY);
        if (d) {
            const parsed = JSON.parse(d);
            catches = Array.isArray(parsed) ? parsed : (parsed.catches || []);
        }
        const s = localStorage.getItem(STORAGE_KEY + '_settings');
        if (s) settings = { ...settings, ...JSON.parse(s) };
        const m = localStorage.getItem(STORAGE_KEY + '_markers');
        if (m) mapMarkers = JSON.parse(m);
    } catch(e) { console.error('Load error:', e); }
}

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(catches));
        localStorage.setItem(STORAGE_KEY + '_settings', JSON.stringify(settings));
        localStorage.setItem(STORAGE_KEY + '_markers', JSON.stringify(mapMarkers));
    } catch(e) {
        console.error('Save error:', e);
        showToast('Ошибка сохранения! Возможно, память переполнена.', 'error');
    }
}

// ─── Toast уведомления ───
function showToast(msg, type = 'success') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);padding:12px 24px;border-radius:8px;color:#fff;font-size:.9rem;z-index:9999;transition:opacity .3s;max-width:90%;text-align:center;';
        document.body.appendChild(toast);
    }
    toast.style.background = type === 'error' ? '#ef4444' : '#22c55e';
    toast.textContent = msg;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

// ─── События ───
function setupEvents() {
    // Навигация с сохранением вкладки
    $$('.nav-btn').forEach(b => b.addEventListener('click', () => {
        switchTab(b.dataset.tab);
        localStorage.setItem(STORAGE_KEY + '_tab', b.dataset.tab);
        if (b.dataset.tab === 'map') setTimeout(initMap, 200);
    }));

    // Уловы
    $('#add-catch-btn').addEventListener('click', openAddModal);
    $('#close-modal').addEventListener('click', closeCatchModal);
    $('#cancel-btn').addEventListener('click', closeCatchModal);
    $('#catch-form').addEventListener('submit', handleFormSubmit);
    $('#catch-photo').addEventListener('change', handlePhotoUpload);
    $('#search-input').addEventListener('input', updateJournal);
    $('#sort-select').addEventListener('change', updateJournal);

    // Удаление
    $('#close-delete-modal').addEventListener('click', closeDeleteModal);
    $('#cancel-delete-btn').addEventListener('click', closeDeleteModal);
    $('#confirm-delete-btn').addEventListener('click', confirmDelete);

    // Календарь
    $('#prev-month').addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth()-1); renderCalendar(); });
    $('#next-month').addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth()+1); renderCalendar(); });

    // Геолокация
    $('#geo-btn').addEventListener('click', detectLocation);

    // Настройки
    $('#save-city').addEventListener('click', () => { settings.city = $('#default-city-input').value.trim() || 'Москва'; saveData(); loadWeather(); showToast('Город сохранён'); });
    $('#retry-weather').addEventListener('click', loadWeather);
    $('#default-city-input').value = settings.city;

    // Экспорт/Импорт
    $('#export-json').addEventListener('click', () => exportData('json'));
    $('#export-csv').addEventListener('click', () => exportData('csv'));
    $('#export-btn').addEventListener('click', () => exportData('json'));
    $('#import-btn').addEventListener('click', () => $('#import-file-input').click());
    $('#import-file-input').addEventListener('change', handleImport);
    $('#clear-data').addEventListener('click', () => {
        if (confirm('Удалить ВСЕ данные?')) { catches = []; mapMarkers = []; saveData(); updateAll(); showToast('Данные удалены'); }
    });

    // Карта
    $('#add-marker-btn').addEventListener('click', togglePlacingMarker);
    $('#close-marker-modal').addEventListener('click', () => $('#marker-modal').classList.remove('active'));
    $('#cancel-marker-btn').addEventListener('click', () => $('#marker-modal').classList.remove('active'));
    $('#marker-form').addEventListener('submit', handleMarkerSubmit);

    // Заполнить список водоёмов в селекте
    const waterSelect = $('#water-body-select');
    WATER_BODIES.forEach((wb, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `${wb.name} (${wb.region})`;
        waterSelect.appendChild(opt);
    });
    waterSelect.addEventListener('change', () => {
        const idx = waterSelect.value;
        if (idx !== '') {
            const wb = WATER_BODIES[parseInt(idx)];
            $('#marker-name').value = wb.name;
            $('#marker-fish').value = wb.fish.join(', ');
            $('#marker-desc').value = wb.region;
        }
    });

    // Поиск по водоёмам
    $('#water-search').addEventListener('input', renderWaterBodies);
    renderWaterBodies();

    // Закрытие модалок по фону
    $('#catch-modal').addEventListener('click', (e) => { if (e.target === $('#catch-modal')) closeCatchModal(); });
    $('#delete-modal').addEventListener('click', (e) => { if (e.target === $('#delete-modal')) closeDeleteModal(); });
    $('#marker-modal').addEventListener('click', (e) => { if (e.target === $('#marker-modal')) $('#marker-modal').classList.remove('active'); });
}

// ─── Список водоёмов ───
function renderWaterBodies() {
    const q = ($('#water-search').value || '').toLowerCase();
    const list = $('#water-bodies-list');
    const filtered = WATER_BODIES.filter(wb =>
        wb.name.toLowerCase().includes(q) ||
        wb.region.toLowerCase().includes(q) ||
        wb.fish.some(f => f.toLowerCase().includes(q))
    );
    if (!filtered.length) {
        list.innerHTML = '<p class="empty-state">Ничего не найдено</p>';
        return;
    }
    list.innerHTML = filtered.map(wb => `
        <div class="water-card" onclick="selectWaterBody(${WATER_BODIES.indexOf(wb)})">
            <div class="water-card-header">
                <span class="water-name">${wb.name}</span>
                <span class="water-region">${wb.region}</span>
            </div>
            <div class="water-fish">🐟 ${wb.fish.join(', ')}</div>
        </div>
    `).join('');
}

function selectWaterBody(idx) {
    const wb = WATER_BODIES[idx];
    placingMarker = true;
    if (ymap) {
        ymap.setCenter([wb.lat, wb.lng], 12);
    }
    showToast(`Добавьте точку на карте: ${wb.name}`);
    // Подставить данные при добавлении маркера
    window._pendingWaterBody = wb;
}

function switchTab(name) {
    $$('.nav-btn').forEach(b => b.classList.remove('active'));
    $$('.tab-content').forEach(c => c.classList.remove('active'));
    const btn = $(`[data-tab="${name}"]`);
    const tab = $(`#${name}`);
    if (btn) btn.classList.add('active');
    if (tab) tab.classList.add('active');
}

function setDefaultDate() { $('#catch-date').value = new Date().toISOString().split('T')[0]; }

// ─── Модалки ───
function openAddModal() {
    currentEditId = null;
    photoDataUrl = null;
    $('#modal-title').textContent = 'Добавить улов';
    $('#catch-form').reset();
    setDefaultDate();
    resetPhotoPreview();
    $('#catch-modal').classList.add('active');
}

function openEditModal(id) {
    const c = catches.find(x => x.id === id);
    if (!c) return;
    currentEditId = id;
    photoDataUrl = c.photo || null;
    $('#modal-title').textContent = 'Редактировать улов';
    $('#catch-id').value = id;
    $('#catch-date').value = c.date;
    $('#catch-location').value = c.location;
    $('#catch-species').value = c.species;
    $('#catch-size').value = c.size || '';
    $('#catch-weight').value = c.weight || '';
    $('#catch-bait').value = c.bait || '';
    $('#catch-notes').value = c.notes || '';
    if (photoDataUrl) { $('#photo-preview').innerHTML = `<img src="${photoDataUrl}">`; }
    else resetPhotoPreview();
    $('#catch-modal').classList.add('active');
}

function closeCatchModal() {
    $('#catch-modal').classList.remove('active');
    currentEditId = null;
    photoDataUrl = null;
}

function openDeleteModal(id) { deleteTargetId = id; $('#delete-modal').classList.add('active'); }
function closeDeleteModal() { $('#delete-modal').classList.remove('active'); deleteTargetId = null; }
function confirmDelete() {
    if (!deleteTargetId) return;
    catches = catches.filter(c => c.id !== deleteTargetId);
    saveData();
    updateAll();
    closeDeleteModal();
    showToast('Улов удалён');
}

// ─── Фото ───
function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    // Сжимаем фото перед сохранением
    compressPhoto(file, 1200, 0.7).then(dataUrl => {
        photoDataUrl = dataUrl;
        $('#photo-preview').innerHTML = `<img src="${photoDataUrl}">`;
    }).catch(() => {
        showToast('Ошибка обработки фото', 'error');
    });
}

function compressPhoto(file, maxDim, quality) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let w = img.width, h = img.height;
                if (w > maxDim || h > maxDim) {
                    if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
                    else { w = Math.round(w * maxDim / h); h = maxDim; }
                }
                canvas.width = w;
                canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                const result = canvas.toDataURL('image/jpeg', quality);
                resolve(result);
            };
            img.onerror = reject;
            img.src = ev.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function resetPhotoPreview() {
    $('#photo-preview').innerHTML = '<span class="photo-icon">📷</span><span>Нажмите или перетащите</span>';
}

// ─── Форма улова ───
function handleFormSubmit(e) {
    e.preventDefault();

    const species = $('#catch-species').value.trim();
    const location = $('#catch-location').value.trim();
    if (!species || !location) {
        showToast('Заполните вид рыбы и место!', 'error');
        return;
    }

    const data = {
        date: $('#catch-date').value || new Date().toISOString().split('T')[0],
        location: location,
        species: species,
        size: parseFloat($('#catch-size').value) || null,
        weight: parseFloat($('#catch-weight').value) || null,
        bait: $('#catch-bait').value.trim() || null,
        notes: $('#catch-notes').value.trim() || null,
        photo: photoDataUrl || null
    };

    if (currentEditId) {
        const i = catches.findIndex(c => c.id === currentEditId);
        if (i !== -1) catches[i] = { ...catches[i], ...data };
        showToast('Улов обновлён!');
    } else {
        data.id = genId();
        data.createdAt = Date.now();
        catches.push(data);
        showToast('Улов сохранён!');
    }

    saveData();
    updateAll();
    closeCatchModal();
}

function genId() { return Date.now().toString(36) + Math.random().toString(36).substr(2,6); }

// ─── Обновление ───
function updateAll() { updateDashboard(); updateJournal(); updateStats(); }

function updateDashboard() {
    const list = $('#recent-catches-list');
    const sorted = [...catches].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0,5);
    if (!sorted.length) { list.innerHTML = '<li class="empty-state">Пока нет уловов</li>'; return; }
    list.innerHTML = sorted.map(c => `
        <li>
            <div><span class="catch-species">${fishIcon(c.species)} ${c.species}</span><br><span class="catch-details">${c.location}</span></div>
            <span class="catch-date">${fmtDate(c.date)}</span>
        </li>`).join('');

    $('#total-catches').textContent = catches.length;
    $('#total-fish').textContent = catches.length;
    if (catches.length) {
        const sz = catches.filter(c=>c.size);
        $('#biggest-fish').textContent = sz.length ? sz.reduce((a,b)=>a.size>b.size?a:b).size + ' см' : '-';
        const sp = {};
        catches.forEach(c=>{ sp[c.species]=(sp[c.species]||0)+1; });
        $('#favorite-species').textContent = Object.entries(sp).sort((a,b)=>b[1]-a[1])[0][0];
    } else {
        $('#biggest-fish').textContent = '-';
        $('#favorite-species').textContent = '-';
    }
}

function updateJournal() {
    const q = $('#search-input').value.toLowerCase();
    const sort = $('#sort-select').value;
    let f = catches.filter(c => `${c.location} ${c.species} ${c.bait||''} ${c.notes||''}`.toLowerCase().includes(q));
    switch(sort) {
        case 'date-desc': f.sort((a,b)=>new Date(b.date)-new Date(a.date)); break;
        case 'date-asc': f.sort((a,b)=>new Date(a.date)-new Date(b.date)); break;
        case 'size-desc': f.sort((a,b)=>(b.size||0)-(a.size||0)); break;
        case 'size-asc': f.sort((a,b)=>(a.size||0)-(b.size||0)); break;
    }
    const list = $('#catches-list');
    if (!f.length) { list.innerHTML = '<p class="empty-state">Ничего не найдено</p>'; return; }
    list.innerHTML = f.map(c => `
        <div class="catch-card">
            <div class="catch-header">
                <span class="catch-species">${fishIcon(c.species)} ${c.species}</span>
                <span class="catch-date">${fmtDate(c.date)}</span>
            </div>
            <p class="catch-location">📍 ${c.location}</p>
            <div class="catch-details">
                ${c.size ? `<span class="catch-detail">📏 ${c.size} см</span>` : ''}
                ${c.weight ? `<span class="catch-detail">⚖️ ${c.weight} кг</span>` : ''}
                ${c.bait ? `<span class="catch-detail">🪝 ${c.bait}</span>` : ''}
            </div>
            ${c.photo ? `<div class="catch-photo"><img src="${c.photo}" loading="lazy"></div>` : ''}
            ${c.notes ? `<p class="catch-notes">${c.notes}</p>` : ''}
            <div class="catch-actions">
                <button class="btn btn-icon" onclick="openEditModal('${c.id}')" title="Редактировать">✏️</button>
                <button class="btn btn-icon" onclick="openDeleteModal('${c.id}')" title="Удалить">🗑️</button>
            </div>
        </div>`).join('');
}

// ─── Статистика ───
function updateStats() { updateMonthlyChart(); updateSpeciesChart(); updateLocationsChart(); updateSizeChart(); }
function updateMonthlyChart() {
    const el = $('#monthly-chart');
    if (!catches.length) { el.innerHTML = '<p class="empty-state">Недостаточно данных</p>'; return; }
    const m = {}; catches.forEach(c => { const d=new Date(c.date); const k=`${d.getFullYear()}-${d.getMonth()}`; m[k]=(m[k]||0)+1; });
    const sorted = Object.entries(m).sort((a,b)=>{ const [yA,mA]=a[0].split('-').map(Number); const [yB,mB]=b[0].split('-').map(Number); return (yB*12+mB)-(yA*12+mA); }).slice(0,8);
    const max = Math.max(...sorted.map(x=>x[1]));
    el.innerHTML = `<div class="bar-chart">${sorted.map(([k,v])=>{ const [y,mo]=k.split('-').map(Number); return `<div class="bar-item"><span class="bar-label">${MONTHS_SHORT[mo]} ${y}</span><div class="bar"><div class="bar-fill" style="width:${(v/max)*100}%">${v}</div></div></div>`; }).join('')}</div>`;
}
function updateSpeciesChart() {
    const el = $('#species-chart');
    if (!catches.length) { el.innerHTML = '<p class="empty-state">Недостаточно данных</p>'; return; }
    const sp = {}; catches.forEach(c=>{ sp[c.species]=(sp[c.species]||0)+1; });
    const sorted = Object.entries(sp).sort((a,b)=>b[1]-a[1]).slice(0,8);
    const max = Math.max(...sorted.map(x=>x[1]));
    el.innerHTML = `<div class="bar-chart">${sorted.map(([s,v])=>`<div class="bar-item"><span class="bar-label">${fishIcon(s)} ${s}</span><div class="bar"><div class="bar-fill" style="width:${(v/max)*100}%">${v}</div></div></div>`).join('')}</div>`;
}
function updateLocationsChart() {
    const el = $('#locations-chart');
    if (!catches.length) { el.innerHTML = '<p class="empty-state">Недостаточно данных</p>'; return; }
    const loc = {}; catches.forEach(c=>{ loc[c.location]=(loc[c.location]||0)+1; });
    const sorted = Object.entries(loc).sort((a,b)=>b[1]-a[1]).slice(0,8);
    const max = Math.max(...sorted.map(x=>x[1]));
    el.innerHTML = `<div class="bar-chart">${sorted.map(([l,v])=>`<div class="bar-item"><span class="bar-label">${l}</span><div class="bar"><div class="bar-fill" style="width:${(v/max)*100}%">${v}</div></div></div>`).join('')}</div>`;
}
function updateSizeChart() {
    const el = $('#size-chart');
    const ws = catches.filter(c=>c.size);
    if (ws.length < 2) { el.innerHTML = '<p class="empty-state">Недостаточно данных</p>'; return; }
    const m = {}; ws.forEach(c => { const d=new Date(c.date); const k=`${d.getFullYear()}-${d.getMonth()}`; if(!m[k]) m[k]=[]; m[k].push(c.size); });
    const sorted = Object.entries(m).sort((a,b)=>{ const [yA,mA]=a[0].split('-').map(Number); const [yB,mB]=b[0].split('-').map(Number); return (yB*12+mB)-(yA*12+mA); }).slice(0,8);
    const max = Math.max(...sorted.map(([,v])=>Math.max(...v)));
    el.innerHTML = `<div class="bar-chart">${sorted.map(([k,v])=>{ const [y,mo]=k.split('-').map(Number); const avg=(v.reduce((a,b)=>a+b,0)/v.length).toFixed(0); return `<div class="bar-item"><span class="bar-label">${MONTHS_SHORT[mo]} ${y}</span><div class="bar"><div class="bar-fill" style="width:${(Math.max(...v)/max)*100}%">~${avg} см</div></div></div>`; }).join('')}</div>`;
}

// ─── Погода (Open-Meteo) ───
async function loadWeather() {
    $('#weather-loading').style.display = 'block';
    $('#weather-info').style.display = 'none';
    $('#weather-params').style.display = 'none';
    $('#weather-error').style.display = 'none';
    try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(settings.city)}&count=1&language=ru&format=json`);
        const geoData = await geoRes.json();
        if (!geoData.results || !geoData.results.length) throw new Error(`Город "${settings.city}" не найден`);
        const { latitude: lat, longitude: lon } = geoData.results[0];
        const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure&timezone=auto&forecast_days=1`);
        if (!wRes.ok) throw new Error('Ошибка API');
        const data = await wRes.json();
        const cur = data.current;
        $('#weather-icon').textContent = wmoToEmoji(cur.weather_code);
        $('#weather-temp').textContent = `${Math.round(cur.temperature_2m)}°C`;
        $('#weather-desc').textContent = wmoToText(cur.weather_code);
        $('#weather-location').textContent = settings.city;
        $('#wind-speed').textContent = `${cur.wind_speed_10m} км/ч`;
        $('#humidity').textContent = `${cur.relative_humidity_2m}%`;
        $('#pressure').textContent = `${Math.round(cur.surface_pressure * 0.75)} мм`;
        $('#weather-loading').style.display = 'none';
        $('#weather-info').style.display = 'flex';
        $('#weather-params').style.display = 'grid';
        updateForecastFromWeather(cur);
    } catch (e) {
        $('#weather-loading').style.display = 'none';
        $('#weather-error').style.display = 'block';
        $('#weather-error p').textContent = `Ошибка: ${e.message}`;
    }
}

// ─── Геолокация ───
async function detectLocation() {
    const btn = $('#geo-btn');
    if (!navigator.geolocation) { alert('Геолокация не поддерживается'); return; }
    btn.classList.add('loading');
    btn.textContent = '⏳ Определение...';
    try {
        const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
        });
        const { latitude: lat, longitude: lon } = pos.coords;
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ru`);
        const geoData = await geoRes.json();
        const city = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.state || 'Москва';
        const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure&timezone=auto&forecast_days=1`);
        const data = await wRes.json();
        const cur = data.current;
        $('#weather-icon').textContent = wmoToEmoji(cur.weather_code);
        $('#weather-temp').textContent = `${Math.round(cur.temperature_2m)}°C`;
        $('#weather-desc').textContent = wmoToText(cur.weather_code);
        $('#weather-location').textContent = `📍 ${city}`;
        $('#wind-speed').textContent = `${cur.wind_speed_10m} км/ч`;
        $('#humidity').textContent = `${cur.relative_humidity_2m}%`;
        $('#pressure').textContent = `${Math.round(cur.surface_pressure * 0.75)} мм`;
        $('#weather-loading').style.display = 'none';
        $('#weather-info').style.display = 'flex';
        $('#weather-params').style.display = 'grid';
        $('#weather-error').style.display = 'none';
        updateForecastFromWeather(cur);
        settings.city = city;
        saveData();
        $('#default-city-input').value = city;
        showToast(`Определено: ${city}`);
    } catch (e) {
        let msg = 'Не удалось определить местоположение';
        if (e.code === 1) msg = 'Разрешите доступ к геолокации';
        alert(msg);
    }
    btn.classList.remove('loading');
    btn.textContent = '📍 Моя локация';
}

function wmoToEmoji(c) { if(c===0)return'☀️';if(c<=2)return'⛅';if(c===3)return'☁️';if(c===45||c===48)return'🌫️';if(c>=51&&c<=67)return'🌧️';if(c>=71&&c<=77)return'❄️';if(c>=80&&c<=82)return'🌦️';if(c>=85)return'❄️';if(c>=95)return'⛈️';return'🌤️'; }
function wmoToText(c) { if(c===0)return'Ясно';if(c<=2)return'Малооблачно';if(c===3)return'Пасмурно';if(c===45||c===48)return'Туман';if(c>=51&&c<=55)return'Морось';if(c>=61&&c<=65)return'Дождь';if(c>=71&&c<=75)return'Снег';if(c>=80&&c<=82)return'Ливень';if(c>=95)return'Гроза';return'Неизвестно'; }

function updateForecastFromWeather(cur) {
    let f = 1.0;
    if (cur.temperature_2m < 5 || cur.temperature_2m > 30) f *= 0.6;
    else if (cur.temperature_2m >= 10 && cur.temperature_2m <= 22) f *= 1.1;
    if (cur.wind_speed_10m > 25) f *= 0.5; else if (cur.wind_speed_10m > 15) f *= 0.8;
    if (cur.relative_humidity_2m < 40 || cur.relative_humidity_2m > 90) f *= 0.7;
    if (cur.weather_code >= 61) f *= 0.7;
    if (cur.weather_code >= 95) f *= 0.4;
    ['morning','day','evening','night'].forEach(id => {
        const bar = $(`#bar-${id}`), rating = $(`#forecast-${id}`);
        const curW = parseInt(bar.style.width) || 50;
        const newW = Math.min(100, Math.round(curW * f));
        bar.style.width = newW + '%';
        let cls, text;
        if (newW >= 75) { cls='excellent'; text='Отлично'; }
        else if (newW >= 55) { cls='good'; text='Хорошо'; }
        else if (newW >= 35) { cls='medium'; text='Средне'; }
        else { cls='bad'; text='Слабо'; }
        bar.className = 'forecast-fill ' + cls;
        rating.className = 'forecast-rating ' + cls;
        rating.textContent = text;
    });
}

// ─── Прогноз клёва ───
function updateForecast() {
    const moon = getMoonPhase(new Date()), month = new Date().getMonth();
    const mf = getMoonFactor(moon), sf = getSeasonFactor(month);
    const tf = (h) => { if(h>=5&&h<9)return 0.9; if(h>=9&&h<14)return 0.5; if(h>=14&&h<18)return 0.6; if(h>=18&&h<22)return 0.85; return 0.3; };
    [{id:'morning',h:7},{id:'day',h:12},{id:'evening',h:19},{id:'night',h:1}].forEach(p => {
        const pct = Math.round(Math.min(1, mf * sf * tf(p.h)) * 100);
        let rating, cls;
        if (pct >= 75) { rating='Отлично'; cls='excellent'; }
        else if (pct >= 55) { rating='Хорошо'; cls='good'; }
        else if (pct >= 35) { rating='Средне'; cls='medium'; }
        else { rating='Слабо'; cls='bad'; }
        $(`#forecast-${p.id}`).textContent = rating;
        $(`#forecast-${p.id}`).className = 'forecast-rating ' + cls;
        $(`#bar-${p.id}`).style.width = pct + '%';
        $(`#bar-${p.id}`).className = 'forecast-fill ' + cls;
    });
}
function getMoonFactor(p) { if(p<0.1||p>0.9)return 0.7; if(p>=0.45&&p<=0.55)return 1.0; if(p>=0.2&&p<=0.3)return 0.9; if(p>=0.7&&p<=0.8)return 0.85; return 0.6; }
function getSeasonFactor(m) { return [0.2,0.2,0.3,0.5,0.7,0.9,1.0,0.95,0.8,0.6,0.3,0.2][m]; }

function calcMoonPhase() {
    const phase = getMoonPhase(new Date());
    const emojis = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'];
    const names = ['Новолуние','Растущая луна','Первая четверть','Растущая луна','Полнолуние','Убывающая луна','Последняя четверть','Убывающая луна'];
    const idx = Math.round(phase * 8) % 8;
    $('#moon-icon').textContent = emojis[idx];
    $('#moon-text').textContent = `${names[idx]} (${Math.round(phase*100)}%)`;
}

function getMoonPhase(date) {
    const y=date.getFullYear(), m=date.getMonth()+1, d=date.getDate();
    let c=0,e=0; if(m<3){c=y-1;e=m+12;}else{c=y;e=m;}
    const a=Math.floor(c/100),b=Math.floor(a/4),f=Math.floor(8*(a+2)/25),g=Math.floor((c-b+f+30)/4);
    const jd=Math.floor(365.25*(c+4716))+Math.floor(30.6001*(e+1))+d+g-1524.5;
    const days=jd-2451549.5;
    return (days/29.53059)-(Math.floor(days/29.53059));
}

// ─── Календарь клёва ───
function renderCalendar() {
    const year = calendarDate.getFullYear(), month = calendarDate.getMonth();
    $('#calendar-month-year').textContent = `${MONTHS_RU[month]} ${year}`;
    const grid = $('#calendar-grid');
    grid.innerHTML = '';
    DAYS_RU.forEach(d => { grid.innerHTML += `<div class="cal-header">${d}</div>`; });
    const startDay = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month+1, 0).getDate();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    for (let i=0; i<startDay; i++) grid.innerHTML += `<div class="cal-day empty"></div>`;
    for (let d=1; d<=daysInMonth; d++) {
        const date = new Date(year, month, d);
        const dateStr = `${year}-${month}-${d}`;
        const isToday = dateStr === todayStr;
        const isSelected = selectedCalendarDate === dateStr;
        const rating = getDayRating(date);
        let cls = 'cal-day';
        if (isToday) cls += ' today';
        if (isSelected) cls += ' selected';
        else if (rating >= 75) cls += ' excellent';
        else if (rating >= 55) cls += ' good';
        else if (rating >= 35) cls += ' medium';
        else cls += ' bad';
        grid.innerHTML += `<div class="${cls}" onclick="selectCalendarDay(${year},${month},${d})">${d}<span class="moon-emoji">${getDayMoonEmoji(date)}</span></div>`;
    }
}

function selectCalendarDay(y,m,d) {
    selectedCalendarDate = `${y}-${m}-${d}`;
    renderCalendar();
    showDayTips(new Date(y,m,d));
}
function getDayRating(date) { return Math.round(getMoonFactor(getMoonPhase(date)) * getSeasonFactor(date.getMonth()) * 100); }
function getDayMoonEmoji(date) { const p=getMoonPhase(date); if(p<0.1||p>0.9)return'🌑'; if(p<0.25)return'🌒'; if(p<0.5)return'🌓'; if(p<0.75)return'🌔'; return'🌕'; }
function showDayTips(date) {
    const moon=getMoonPhase(date), month=date.getMonth(), rating=getDayRating(date);
    let a = rating>=75?'Отличный день! ':rating>=55?'Хороший день. ':rating>=35?'Средний день. ':'Сложный день. ';
    if(moon<0.1||moon>0.9) a+='Новолуние — мелкие приманки.';
    else if(moon>=0.45&&moon<=0.55) a+='Полнолуние — рыбы активны.';
    else if(month>=2&&month<=4) a+='Весна — будьте осторожны с запретами.';
    else if(month>=5&&month<=7) a+='Лучшее время — утро и вечер.';
    else if(month>=8&&month<=10) a+='Осень — рыба активно питается.';
    else a+='Зима — ловля на мотыля.';
    $('#tips-text').textContent = a;
}

// ─── Яндекс Карты ───
function initMap() {
    if (ymap) { ymap.container.fitSize(); return; }
    if (typeof ymaps === 'undefined') {
        // Загрузить API Яндекс Карт
        const script = document.createElement('script');
        script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
        script.onload = () => createMap();
        document.head.appendChild(script);
    } else {
        createMap();
    }
}

function createMap() {
    ymaps.ready(() => {
        ymap = new ymaps.Map('map-container', {
            center: [55.7558, 37.6173],
            zoom: 10,
            controls: ['zoomControl', 'geolocationControl']
        });

        // Загрузить сохранённые маркеры
        mapMarkers.forEach(m => addPlacemark(m));

        // Клик по карте для добавления точки
        ymap.events.add('click', (e) => {
            if (!placingMarker) return;
            placingMarker = false;
            $('#add-marker-btn').textContent = '📍 Добавить точку';
            $('#add-marker-btn').style.background = '';
            const coords = e.get('coords');
            $('#marker-lat').value = coords[0];
            $('#marker-lng').value = coords[1];
            // Если выбран водоём из справочника — подставить данные
            const wb = window._pendingWaterBody;
            if (wb) {
                $('#marker-name').value = wb.name;
                $('#marker-fish').value = wb.fish.join(', ');
                $('#marker-desc').value = wb.region;
                window._pendingWaterBody = null;
            } else {
                $('#marker-name').value = '';
                $('#marker-fish').value = '';
                $('#marker-desc').value = '';
            }
            $('#water-body-select').value = '';
            $('#marker-modal').classList.add('active');
        });
    });
}

function togglePlacingMarker() {
    placingMarker = !placingMarker;
    if (placingMarker) {
        $('#add-marker-btn').textContent = '👆 Тапните на карту';
        $('#add-marker-btn').style.background = '#dc2626';
        showToast('Тапните на карту, чтобы поставить точку');
    } else {
        $('#add-marker-btn').textContent = '📍 Добавить точку';
        $('#add-marker-btn').style.background = '';
    }
}

function handleMarkerSubmit(e) {
    e.preventDefault();
    const marker = {
        id: genId(),
        lat: parseFloat($('#marker-lat').value),
        lng: parseFloat($('#marker-lng').value),
        name: $('#marker-name').value.trim(),
        desc: $('#marker-desc').value.trim(),
        fish: $('#marker-fish').value.trim() || null
    };
    mapMarkers.push(marker);
    addPlacemark(marker);
    saveData();
    $('#marker-modal').classList.remove('active');
    $('#water-body-select').value = '';
    showToast('Точка сохранена!');
}

function addPlacemark(m) {
    if (!ymap) return;

    const MyIconLayout = ymaps.templateLayoutFactory.createClass(
        '<div style="background:#2563eb;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 2px 8px rgba(0,0,0,.35);border:3px solid #fff;">🐟</div>'
    );

    // Информация о рыбе из базы
    let fishInfo = '';
    const wb = WATER_BODIES.find(w => w.name === m.name);
    if (wb) {
        fishInfo = '<div style="margin-top:6px;padding:8px 10px;background:#eff6ff;border-radius:8px;font-size:.85rem;color:#1e40af;"><b>🐟 Какая рыба:</b><br>' + wb.fish.join(', ') + '</div>';
    } else if (m.fish) {
        fishInfo = '<div style="margin-top:6px;padding:8px 10px;background:#eff6ff;border-radius:8px;font-size:.85rem;color:#1e40af;"><b>🐟 Какая рыба:</b><br>' + m.fish + '</div>';
    }

    const placemark = new ymaps.Placemark([m.lat, m.lng], {
        balloonContent: '<div style="font-size:1.1rem;font-weight:700;margin-bottom:4px;">🐟 ' + m.name + '</div>'
            + (m.desc ? '<div style="color:#64748b;font-size:.85rem;margin-bottom:4px;">' + m.desc + '</div>' : '')
            + fishInfo
            + '<div style="margin-top:10px;display:flex;gap:6px;flex-direction:column;">'
            + '<a href="https://yandex.ru/maps/?ll=' + m.lng + ',' + m.lat + '&z=15&pt=' + m.lng + ',' + m.lat + ',pm2rdm" target="_blank" style="display:block;padding:8px 12px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-size:.85rem;text-align:center;">🗺 Открыть в Яндекс.Картах</a>'
            + '<a href="https://yandex.ru/maps/?rtext=' + m.lat + ',' + m.lng + '&rtt=auto" target="_blank" style="display:block;padding:8px 12px;background:#00bfff;color:#fff;border-radius:8px;text-decoration:none;font-size:.85rem;text-align:center;">🚗 Навигатор</a>'
            + '<button onclick="deleteMapMarker(\'' + m.id + '\')" style="padding:8px 12px;background:#ef4444;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:.85rem;">🗑 Удалить</button>'
            + '</div>'
    }, {
        iconLayout: 'default#imageWithContent',
        iconImageHref: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38"><circle cx="19" cy="19" r="17" fill="#2563eb" stroke="white" stroke-width="3"/></svg>'),
        iconImageSize: [38, 38],
        iconImageOffset: [-19, -19],
        iconContentOffset: [0, 0],
        iconContentLayout: MyIconLayout
    });
    ymap.geoObjects.add(placemark);
}

function deleteMapMarker(id) {
    mapMarkers = mapMarkers.filter(m => m.id !== id);
    // Перерисовать все маркеры
    if (ymap) {
        ymap.geoObjects.removeAll();
        mapMarkers.forEach(m => addPlacemark(m));
    }
    saveData();
    ymap && ymap.balloon.close();
    showToast('Точка удалена');
}

// ─── Экспорт/Импорт ───
function exportData(format) {
    if (!catches.length) { alert('Нет данных для экспорта'); return; }
    let content, filename, type;
    if (format === 'csv') {
        const headers = ['Дата','Место','Вид рыбы','Размер','Вес','Приманка','Заметки'];
        const rows = catches.map(c => [c.date,c.location,c.species,c.size||'',c.weight||'',c.bait||'',c.notes||''].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','));
        content = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');
        filename = `fishing_${new Date().toISOString().slice(0,10)}.csv`;
        type = 'text/csv;charset=utf-8';
    } else {
        content = JSON.stringify({ version:2, catches, markers: mapMarkers }, null, 2);
        filename = `fishing_${new Date().toISOString().slice(0,10)}.json`;
        type = 'application/json';
    }
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Файл скачан');
}

function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const data = JSON.parse(ev.target.result);
            const imported = data.catches || (Array.isArray(data) ? data : []);
            if (!Array.isArray(imported)) throw new Error('Неверный формат');
            const ids = new Set(catches.map(c=>c.id));
            let count = 0;
            imported.forEach(c => { if (!ids.has(c.id)) { catches.push(c); count++; } });
            if (data.markers) {
                const mIds = new Set(mapMarkers.map(m=>m.id));
                data.markers.forEach(m => { if (!mIds.has(m.id)) mapMarkers.push(m); });
            }
            saveData(); updateAll();
            showToast(`Импортировано: ${count} уловов`);
        } catch(err) { alert('Ошибка: ' + err.message); }
    };
    reader.readAsText(file);
    e.target.value = '';
}

// ─── Утилиты ───
function fmtDate(d) { return new Date(d).toLocaleDateString('ru-RU', { day:'numeric', month:'short', year:'numeric' }); }
function fishIcon(s) { const l=(s||'').toLowerCase(); return {окунь:'🐟',щука:'🐟',карась:'🐟',лещ:'🐟',судак:'🐟',плотва:'🐟',налим:'🐟',форель:'🐟',сом:'🐟',язь:'🐟',ерш:'🐟',линь:'🐟',карп:'🐟'}[l] || '🐠'; }

window.openEditModal = openEditModal;
window.openDeleteModal = openDeleteModal;
window.selectCalendarDay = selectCalendarDay;
window.deleteMapMarker = deleteMapMarker;