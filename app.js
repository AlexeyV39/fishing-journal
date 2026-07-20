// ─── Константы ───
const STORAGE_KEY = 'fishing_journal';
const MONTHS_RU = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const MONTHS_SHORT = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
const DAYS_RU = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

// ─── Справочник рыб ───
const FISH_DB = [
    { name: 'Окунь', emoji: '🐟', minSize: 15, season: 'Круглый год', months: [0,1,2,3,4,5,6,7,8,9,10,11], tackle: ['Спиннинг', 'Жерлицы', 'Поплавочная удочка'], bait: ['Мотыль', 'Опарыш', 'Блесна', 'Воблер', 'Силикон'], desc: 'Предпочитает заросли, коряги, камни. Активен ранним утром и вечером.' },
    { name: 'Щука', emoji: '🐟', minSize: 30, season: 'Круглый год', months: [0,1,2,3,4,5,6,7,8,9,10,11], tackle: ['Спиннинг', 'Жерлицы', 'Донка'], bait: ['Живец', 'Блесна', 'Воблер', 'Силикон'], desc: 'Хищник. Засадный охотник. Любимые места: урез воды, коряги, трава.' },
    { name: 'Карась', emoji: '🐟', minSize: 15, season: 'Май — Октябрь', months: [4,5,6,7,8,9], tackle: ['Поплавочная удочка', 'Донка', 'Фидер'], bait: ['Червь', 'Тесто', 'Хлеб', 'Кукуруза', 'Горох'], desc: 'Любит тихие, прогретые места. Активен в тёплую погоду.' },
    { name: 'Лещ', emoji: '🐟', minSize: 25, season: 'Апрель — Ноябрь', months: [3,4,5,6,7,8,9,10], tackle: ['Фидер', 'Поплавочная удочка', 'Донка'], bait: ['Мотыль', 'Опарыш', 'Червь', 'Манка'], desc: 'Держится на глубине. Активен на рассвете и закате.' },
    { name: 'Судак', emoji: '🐟', minSize: 30, season: 'Круглый год', months: [0,1,2,3,4,5,6,7,8,9,10,11], tackle: ['Спиннинг', 'Донка', 'Жерлицы'], bait: ['Воблер', 'Силикон', 'Блесна', 'Живец'], desc: 'Глубоководный хищник. Любимые места: ямы, бровки, свалы глубин.' },
    { name: 'Плотва', emoji: '🐟', minSize: 0, season: 'Круглый год', months: [0,1,2,3,4,5,6,7,8,9,10,11], tackle: ['Поплавочная удочка', 'Фидер'], bait: ['Мотыль', 'Червь', 'Хлеб', 'Тесто'], desc: 'Самая распространённая рыба. Держится стаями на мелководье.' },
    { name: 'Налим', emoji: '🐟', minSize: 25, season: 'Ноябрь — Март', months: [0,1,2,3,10,11], tackle: ['Донка', 'Жерлицы'], bait: ['Живец', 'Мотыль', 'Червь'], desc: 'Ночная рыба. Активен зимой. Держится на глубине.' },
    { name: 'Форель', emoji: '🐟', minSize: 15, season: 'Круглый год', months: [0,1,2,3,4,5,6,7,8,9,10,11], tackle: ['Спиннинг', 'Нахлыст'], bait: ['Блесна', 'Воблер', 'Муха', 'Червь'], desc: 'Предпочитает чистую, холодную воду. Горные реки, озёра.' },
    { name: 'Сом', emoji: '🐟', minSize: 50, season: 'Июнь — Сентябрь', months: [5,6,7,8], tackle: ['Донка', 'Жерлицы'], bait: ['Живец', 'Лягушка', 'Куски мяса'], desc: 'Крупный хищник. Активен ночью. Держится в ямах и у обрывов.' },
    { name: 'Язь', emoji: '🐟', minSize: 15, season: 'Апрель — Октябрь', months: [3,4,5,6,7,8,9], tackle: ['Поплавочная удочка', 'Фидер', 'Спиннинг'], bait: ['Червь', 'Мотыль', 'Кукуруза', 'Тесто'], desc: 'Осторожная рыба. Держится на средней глубине.' },
    { name: 'Ерш', emoji: '🐟', minSize: 0, season: 'Круглый год', months: [0,1,2,3,4,5,6,7,8,9,10,11], tackle: ['Поплавочная удочка', 'Донка'], bait: ['Мотыль', 'Опарыш', 'Червь'], desc: 'Колючий, но вкусный. Держится у дна, в корягах.' },
    { name: 'Линь', emoji: '🐟', minSize: 15, season: 'Июнь — Сентябрь', months: [5,6,7,8], tackle: ['Поплавочная удочка', 'Донка'], bait: ['Тесто', 'Горох', 'Кукуруза', 'Червь'], desc: 'Любит теплую, тихую воду. Заросли камыша, заливы.' },
    { name: 'Карп', emoji: '🐟', minSize: 15, season: 'Май — Сентябрь', months: [4,5,6,7,8], tackle: ['Поплавочная удочка', 'Фидер', 'Донка'], bait: ['Кукуруза', 'Горох', 'Тесто', 'Бойлы', 'Червь'], desc: 'Крупная, осторожная рыба. Предпочитает тёплые воды.' },
    { name: 'Амур', emoji: '🐟', minSize: 25, season: 'Июнь — Сентябрь', months: [5,6,7,8], tackle: ['Поплавочная удочка', 'Донка'], bait: ['Кукуруза', 'Горох', 'Бамбук', 'Тесто'], desc: 'Травоядный. Держится в камышовых зарослях.' },
    { name: 'Краснопёрка', emoji: '🐟', minSize: 0, season: 'Май — Октябрь', months: [4,5,6,7,8,9], tackle: ['Поплавочная удочка', 'Фидер'], bait: ['Мотыль', 'Опарыш', 'Червь'], desc: 'Красивая рыба с красными плавниками. Тёплые, заросшие заливы.' },
    { name: 'Уклейка', emoji: '🐟', minSize: 0, season: 'Май — Сентябрь', months: [4,5,6,7,8], tackle: ['Поплавочная удочка'], bait: ['Мотыль', 'Опарыш'], desc: 'Мелкая стайная рыба. Хороша как живец.' },
    { name: 'Гольян', emoji: '🐟', minSize: 0, season: 'Круглый год', months: [0,1,2,3,4,5,6,7,8,9,10,11], tackle: ['Поплавочная удочка'], bait: ['Мотыль', 'Опарыш'], desc: 'Мелкая рыба чистых рек. Индикатор экологии.' },
    { name: 'Густера', emoji: '🐟', minSize: 0, season: 'Апрель — Октябрь', months: [3,4,5,6,7,8,9], tackle: ['Поплавочная удочка', 'Фидер'], bait: ['Мотыль', 'Опарыш', 'Тесто'], desc: 'Стайная рыба. Держится на средней глубине.' },
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
    renderCalendar();
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

    // Показать/скрыть секцию улова
    $$('input[name="catch-status"]').forEach(r => r.addEventListener('change', toggleCatchSection));
    toggleCatchSection();

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
    $('#map-geo-btn').addEventListener('click', mapLocateMe);
    $('#map-search-btn').addEventListener('click', mapSearch);
    $('#map-search-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') mapSearch(); });
    $$('.layer-btn').forEach(b => b.addEventListener('click', () => switchMapLayer(b.dataset.layer)));
    $('#close-marker-modal').addEventListener('click', () => $('#marker-modal').classList.remove('active'));
    $('#cancel-marker-btn').addEventListener('click', () => $('#marker-modal').classList.remove('active'));
    $('#marker-form').addEventListener('submit', handleMarkerSubmit);

    // Маршрут
    $('#close-route-modal').addEventListener('click', () => $('#route-modal').classList.remove('active'));
    $('#route-modal').addEventListener('click', (e) => { if (e.target === $('#route-modal')) $('#route-modal').classList.remove('active'); });

    // Закрытие модалок по фону
    $('#catch-modal').addEventListener('click', (e) => { if (e.target === $('#catch-modal')) closeCatchModal(); });
    $('#delete-modal').addEventListener('click', (e) => { if (e.target === $('#delete-modal')) closeDeleteModal(); });
    $('#marker-modal').addEventListener('click', (e) => { if (e.target === $('#marker-modal')) $('#marker-modal').classList.remove('active'); });
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

function toggleCatchSection() {
    const hasCatch = $('#status-catch').checked;
    $('#catch-details-section').style.display = hasCatch ? 'block' : 'none';
}

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
    $('#modal-title').textContent = 'Редактировать запись';
    $('#catch-id').value = id;
    $('#catch-date').value = c.date;
    $('#catch-location').value = c.location;

    // Период лова
    $('#time-night').checked = (c.periods || '').includes('Ночь');
    $('#time-morning').checked = (c.periods || '').includes('Утро');
    $('#time-day').checked = (c.periods || '').includes('День');
    $('#time-evening').checked = (c.periods || '').includes('Вечер');

    // Снасть
    $('#catch-tackle').value = c.tackle || '';

    // Статус
    if (c.hasCatch === false) {
        $('#status-no-catch').checked = true;
    } else {
        $('#status-catch').checked = true;
    }

    // Улов
    $('#catch-species').value = c.species || '';
    $('#catch-size').value = c.size || '';
    $('#catch-weight').value = c.weight || '';
    $('#catch-bait').value = c.bait || '';
    $('#catch-notes').value = c.notes || '';

    toggleCatchSection();
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

    const location = $('#catch-location').value.trim();
    if (!location) {
        showToast('Заполните место!', 'error');
        return;
    }

    // Период лова
    const periods = [];
    if ($('#time-night').checked) periods.push('Ночь');
    if ($('#time-morning').checked) periods.push('Утро');
    if ($('#time-day').checked) periods.push('День');
    if ($('#time-evening').checked) periods.push('Вечер');

    // Статус улова
    const hasCatch = $('#status-catch').checked;

    const data = {
        date: $('#catch-date').value || new Date().toISOString().split('T')[0],
        location: location,
        periods: periods.join(', ') || null,
        tackle: $('#catch-tackle').value || null,
        hasCatch: hasCatch,
        species: hasCatch ? $('#catch-species').value.trim() : null,
        size: hasCatch ? parseFloat($('#catch-size').value) || null : null,
        weight: hasCatch ? parseFloat($('#catch-weight').value) || null : null,
        bait: hasCatch ? $('#catch-bait').value.trim() : null,
        notes: $('#catch-notes').value.trim() || null,
        photo: photoDataUrl || null
    };

    if (currentEditId) {
        const i = catches.findIndex(c => c.id === currentEditId);
        if (i !== -1) catches[i] = { ...catches[i], ...data };
        showToast('Запись обновлена!');
    } else {
        data.id = genId();
        data.createdAt = Date.now();
        catches.push(data);
        showToast('Запись сохранена!');
    }

    saveData();
    updateAll();
    closeCatchModal();
}

function genId() { return Date.now().toString(36) + Math.random().toString(36).substr(2,6); }

// ─── Обновление ───
function updateAll() { updateDashboard(); updateJournal(); updateStats(); renderPointsList(); }

function updateDashboard() {
    const list = $('#recent-catches-list');
    const sorted = [...catches].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0,5);
    if (!sorted.length) { list.innerHTML = '<li class="empty-state">Пока нет записей</li>'; return; }
    list.innerHTML = sorted.map(c => {
        const status = c.hasCatch === false ? '❌ Нет улова' : (c.species ? `🐟 ${c.species}` : '🐟 Улов');
        const time = c.periods ? `🕐 ${c.periods}` : '';
        const tackle = c.tackle ? `🎣 ${c.tackle}` : '';
        return `<li>
            <div>
                <span class="catch-species">${status}</span><br>
                <span class="catch-details">📍 ${c.location}${time ? ' · ' + time : ''}</span>
            </div>
            <span class="catch-date">${fmtDate(c.date)}</span>
        </li>`;
    }).join('');

    $('#total-catches').textContent = catches.length;
    $('#total-fish').textContent = catches.filter(c => c.hasCatch !== false && c.species).length;
    if (catches.length) {
        const sz = catches.filter(c=>c.size);
        $('#biggest-fish').textContent = sz.length ? sz.reduce((a,b)=>a.size>b.size?a:b).size + ' см' : '-';
        const sp = {};
        catches.filter(c=>c.species).forEach(c=>{ sp[c.species]=(sp[c.species]||0)+1; });
        const top = Object.entries(sp).sort((a,b)=>b[1]-a[1])[0];
        $('#favorite-species').textContent = top ? top[0] : '-';
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
    list.innerHTML = f.map(c => {
        const status = c.hasCatch === false ? '❌ Нет улова' : (c.species ? `🐟 ${c.species}` : '');
        return `<div class="catch-card">
            <div class="catch-header">
                <span class="catch-species">${status || '📋 Запись'}</span>
                <span class="catch-date">${fmtDate(c.date)}</span>
            </div>
            <p class="catch-location">📍 ${c.location}</p>
            <div class="catch-details">
                ${c.periods ? `<span class="catch-detail">🕐 ${c.periods}</span>` : ''}
                ${c.tackle ? `<span class="catch-detail">🎣 ${c.tackle}</span>` : ''}
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
        </div>`;
    }).join('');
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
    $('#weather-content').style.display = 'none';
    $('#weather-error').style.display = 'none';
    try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(settings.city)}&count=1&language=ru&format=json`);
        const geoData = await geoRes.json();
        if (!geoData.results || !geoData.results.length) throw new Error(`Город "${settings.city}" не найден`);
        const { latitude: lat, longitude: lon } = geoData.results[0];

        // Текущая погода + прогноз на 2 дня
        const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure,apparent_temperature&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,relative_humidity_2m_mean&timezone=auto&forecast_days=2`);
        if (!wRes.ok) throw new Error('Ошибка API');
        const data = await wRes.json();
        const cur = data.current;
        const daily = data.daily;

        // Сегодня
        $('#today-icon').textContent = wmoToEmoji(cur.weather_code);
        $('#today-temp').textContent = `${Math.round(cur.temperature_2m)}°C`;
        $('#today-desc').textContent = wmoToText(cur.weather_code);
        $('#today-feels').textContent = `Ощущается как ${Math.round(cur.apparent_temperature)}°C`;
        $('#today-wind').textContent = `${cur.wind_speed_10m} м/с`;
        $('#today-humidity').textContent = `${cur.relative_humidity_2m}%`;
        $('#today-pressure').textContent = `${Math.round(cur.surface_pressure * 0.75)} мм`;
        $('#today-temp-min').textContent = `${Math.round(daily.temperature_2m_min[0])}°`;
        $('#today-temp-max').textContent = `${Math.round(daily.temperature_2m_max[0])}°`;

        // Завтра
        if (daily.time.length > 1) {
            $('#tomm-icon').textContent = wmoToEmoji(daily.weather_code[1]);
            $('#tomm-temp').textContent = `${Math.round((daily.temperature_2m_max[1] + daily.temperature_2m_min[1]) / 2)}°C`;
            $('#tomm-desc').textContent = wmoToText(daily.weather_code[1]);
            $('#tomm-feels').textContent = `Мин: ${Math.round(daily.temperature_2m_min[1])}° / Макс: ${Math.round(daily.temperature_2m_max[1])}°`;
            $('#tomm-wind').textContent = `${daily.wind_speed_10m_max[1]} м/с`;
            $('#tomm-humidity').textContent = `${daily.relative_humidity_2m_mean[1]}%`;
            $('#tomm-pressure').textContent = `${Math.round(cur.surface_pressure * 0.75)} мм`;
            $('#tomm-temp-min').textContent = `${Math.round(daily.temperature_2m_min[1])}°`;
            $('#tomm-temp-max').textContent = `${Math.round(daily.temperature_2m_max[1])}°`;
        }

        $('#weather-location').textContent = `📍 ${settings.city}`;
        $('#weather-loading').style.display = 'none';
        $('#weather-content').style.display = 'block';
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
            navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
        });
        const { latitude: lat, longitude: lon, accuracy } = pos.coords;

        // Определяем место через Nominatim
        let locationName = '';
        try {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ru&zoom=14`);
            const geoData = await geoRes.json();
            const a = geoData.address;
            locationName = a?.city || a?.town || a?.village || a?.hamlet || a?.county || a?.state || '';
            if (!locationName && a?.road) locationName = a.road;
        } catch (_) {}

        // Погода по координатам напрямую
        const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure,apparent_temperature&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,relative_humidity_2m_mean&timezone=auto&forecast_days=2`);
        const data = await wRes.json();
        const cur = data.current;
        const daily = data.daily;

        // Сегодня
        $('#today-icon').textContent = wmoToEmoji(cur.weather_code);
        $('#today-temp').textContent = `${Math.round(cur.temperature_2m)}°C`;
        $('#today-desc').textContent = wmoToText(cur.weather_code);
        $('#today-feels').textContent = `Ощущается как ${Math.round(cur.apparent_temperature)}°C`;
        $('#today-wind').textContent = `${cur.wind_speed_10m} м/с`;
        $('#today-humidity').textContent = `${cur.relative_humidity_2m}%`;
        $('#today-pressure').textContent = `${Math.round(cur.surface_pressure * 0.75)} мм`;
        $('#today-temp-min').textContent = `${Math.round(daily.temperature_2m_min[0])}°`;
        $('#today-temp-max').textContent = `${Math.round(daily.temperature_2m_max[0])}°`;

        // Завтра
        if (daily.time.length > 1) {
            $('#tomm-icon').textContent = wmoToEmoji(daily.weather_code[1]);
            $('#tomm-temp').textContent = `${Math.round((daily.temperature_2m_max[1] + daily.temperature_2m_min[1]) / 2)}°C`;
            $('#tomm-desc').textContent = wmoToText(daily.weather_code[1]);
            $('#tomm-feels').textContent = `Мин: ${Math.round(daily.temperature_2m_min[1])}° / Макс: ${Math.round(daily.temperature_2m_max[1])}°`;
            $('#tomm-wind').textContent = `${daily.wind_speed_10m_max[1]} м/с`;
            $('#tomm-humidity').textContent = `${daily.relative_humidity_2m_mean[1]}%`;
            $('#tomm-pressure').textContent = `${Math.round(cur.surface_pressure * 0.75)} мм`;
            $('#tomm-temp-min').textContent = `${Math.round(daily.temperature_2m_min[1])}°`;
            $('#tomm-temp-max').textContent = `${Math.round(daily.temperature_2m_max[1])}°`;
        }

        const displayLocation = locationName || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        $('#weather-location').textContent = `📍 ${displayLocation}`;
        $('#weather-loading').style.display = 'none';
        $('#weather-content').style.display = 'block';
        $('#weather-error').style.display = 'none';
        updateForecastFromWeather(cur);

        settings.city = locationName || settings.city;
        settings.lat = lat;
        settings.lng = lon;
        saveData();
        $('#default-city-input').value = settings.city;

        showToast(`📍 ${displayLocation}`);
    } catch (e) {
        let msg = 'Не удалось определить местоположение';
        if (e.code === 1) msg = 'Разрешите доступ к геолокации';
        else if (e.code === 2) msg = 'Сигнал геолокации недоступен';
        else if (e.code === 3) msg = 'Превышено время ожидания';
        alert(msg);
    }
    btn.classList.remove('loading');
    btn.textContent = '📍 Моя локация';
}

function wmoToEmoji(c) {
    if (c === 0) return '☀️';          // Ясно
    if (c === 1) return '🌤️';          // Малооблачно
    if (c === 2) return '⛅';          // Облачно
    if (c === 3) return '☁️';          // Пасмурно
    if (c === 45 || c === 48) return '🌫️'; // Туман
    if (c >= 51 && c <= 55) return '🌦️';   // Морось
    if (c >= 56 && c <= 57) return '🌧️';   // Ледяная морось
    if (c >= 61 && c <= 63) return '🌧️';   // Дождь
    if (c === 65) return '🌧️';          // Сильный дождь
    if (c >= 66 && c <= 67) return '🌧️';   // Ледяной дождь
    if (c >= 71 && c <= 75) return '❄️';   // Снег
    if (c === 77) return '❄️';          // Снежная крупа
    if (c >= 80 && c <= 82) return '🌦️';   // Ливень
    if (c >= 85 && c <= 86) return '❄️';   // Снегопад
    if (c >= 95) return '⛈️';          // Гроза
    return '🌤️';
}
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

async function showDayTips(date) {
    const moon=getMoonPhase(date), month=date.getMonth(), rating=getDayRating(date);
    let a = rating>=75?'Отличный день! ':rating>=55?'Хороший день. ':rating>=35?'Средний день. ':'Сложный день. ';
    if(moon<0.1||moon>0.9) a+='Новолуние — мелкие приманки.';
    else if(moon>=0.45&&moon<=0.55) a+='Полнолуние — рыбы активны.';
    else if(month>=2&&month<=4) a+='Весна — будьте осторожны с запретами.';
    else if(month>=5&&month<=7) a+='Лучшее время — утро и вечер.';
    else if(month>=8&&month<=10) a+='Осень — рыба активно питается.';
    else a+='Зима — ловля на мотыля.';

    // Прогноз погоды на выбранную дату
    let weatherHtml = '';
    try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(settings.city)}&count=1&language=ru&format=json`);
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results.length > 0) {
            const { latitude: lat, longitude: lng } = geoData.results[0];
            const dateStr = date.getFullYear() + '-' + String(date.getMonth()+1).padStart(2,'0') + '-' + String(date.getDate()).padStart(2,'0');
            const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,wind_speed_10m_max&timezone=auto&start_date=${dateStr}&end_date=${dateStr}`);
            const wData = await wRes.json();
            if (wData.daily) {
                const d = wData.daily;
                weatherHtml = '<div style="margin-top:10px;padding:10px 12px;background:#f0f9ff;border-radius:8px;border:1px solid #bae6fd;">'
                    + '<div style="font-weight:600;margin-bottom:6px;">🌤 Погода:</div>'
                    + '<div style="font-size:.85rem;display:grid;grid-template-columns:1fr 1fr;gap:4px;">'
                    + '<span>' + wmoToEmoji(d.weather_code[0]) + ' ' + wmoToText(d.weather_code[0]) + '</span>'
                    + '<span>🌡 ' + Math.round(d.temperature_2m_min[0]) + '°...+' + Math.round(d.temperature_2m_max[0]) + '°</span>'
                    + '<span>💨 ' + Math.round(d.wind_speed_10m_max[0]) + ' км/ч</span>'
                    + '<span>💧 ' + (d.precipitation_sum[0] || 0) + ' мм</span>'
                    + '</div></div>';
            }
        }
    } catch(e) {}

    $('#tips-text').innerHTML = a + weatherHtml;
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

        // Слои карты
        window._mapLayers = {
            map: ymap.layers.get(0),
            satellite: null,
            hybrid: null,
            depth: null
        };

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
            $('#marker-name').value = '';
            $('#marker-fish').value = '';
            $('#marker-desc').value = '';
            $('#marker-modal').classList.add('active');
        });
    });
}

// Переключение слоёв карты
function switchMapLayer(layerName) {
    if (!ymap) return;

    // Убрать активный класс у всех кнопок
    $$('.layer-btn').forEach(b => b.classList.remove('active'));
    $(`#layer-${layerName}`).classList.add('active');

    // Сохранить текущие координаты и зум
    const center = ymap.getCenter();
    const zoom = ymap.getZoom();

    // Удалить старый слой глубин если был
    if (window._depthLayer) {
        ymap.layers.remove(window._depthLayer);
        window._depthLayer = null;
        $('#depth-legend').style.display = 'none';
    }

    // Удалить метку местоположения если есть
    const savedLoc = window._myLocationMark;
    const savedCircle = window._myLocationCircle;

    // Тип карты для Yandex
    const typeMap = {
        'map': 'yandex#map',
        'satellite': 'yandex#satellite',
        'hybrid': 'yandex#hybrid',
        'depth': 'yandex#satellite'
    };

    // Пересоздать карту с нужным типом
    ymap.destroy();
    ymap = new ymaps.Map('map-container', {
        center: center,
        zoom: zoom,
        type: typeMap[layerName],
        controls: ['zoomControl', 'geolocationControl']
    });

    // Восстановить маркеры
    mapMarkers.forEach(m => addPlacemark(m));

    // Восстановить метку местоположения
    if (savedLoc) {
        const coords = savedLoc.geometry.getCoordinates();
        const MyLocLayout = ymaps.templateLayoutFactory.createClass(
            '<div style="background:#22c55e;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,.35);border:3px solid #fff;">📍</div>'
        );
        window._myLocationMark = new ymaps.Placemark(coords, {
            balloonContent: savedLoc.properties.get('balloonContent')
        }, {
            iconLayout: 'default#imageWithContent',
            iconImageHref: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="14" fill="#22c55e" stroke="white" stroke-width="3"/></svg>'),
            iconImageSize: [32, 32],
            iconImageOffset: [-16, -16],
            iconContentOffset: [0, 0],
            iconContentLayout: MyLocLayout
        });
        ymap.geoObjects.add(window._myLocationMark);
    }

    // Клик по карте для добавления точки
    ymap.events.add('click', (e) => {
        if (!placingMarker) return;
        placingMarker = false;
        $('#add-marker-btn').textContent = '📍 Добавить точку';
        $('#add-marker-btn').style.background = '';
        const coords = e.get('coords');
        $('#marker-lat').value = coords[0];
        $('#marker-lng').value = coords[1];
        $('#marker-name').value = '';
        $('#marker-fish').value = '';
        $('#marker-desc').value = '';
        $('#marker-modal').classList.add('active');
    });

    // Добавить слой глубин если выбран
    if (layerName === 'depth') {
        addDepthLayer();
    }

    window._currentLayer = layerName;
}

// Слой глубин (OpenSeaMap для морей + спутник для内陆)
function addDepthLayer() {
    try {
        // OpenSeaMap тайлы с маркировками глубин (моря, крупные реки, озёра)
        const depthTileUrl = 'https://tiles.openseamap.org/seamarkings/{z}/{x}/{y}.png';
        const depthLayer = new ymaps.Layer(
            (tile, zoom) => {
                if (zoom >= 5 && zoom <= 18) {
                    return depthTileUrl.replace('{z}', zoom).replace('{x}', tile[0]).replace('{y}', tile[1]);
                }
                return null;
            },
            {
                projection: ymaps.Projection.MERCATOR,
                tessellation: true
            }
        );
        ymap.layers.add(depthLayer);
        window._depthLayer = depthLayer;
        $('#depth-legend').style.display = 'inline';
        showToast('🌊 OpenSeaMap: глубины для морей и крупных водоёмов');
    } catch (e) {
        console.error('Depth layer error:', e);
    }
}

// Получение глубины по координатам через Open-Meteo (водоёмы)
async function getDepthInfo(lat, lng) {
    // Показываем приблизительную информацию о водоёме
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ru&zoom=14`);
        const data = await res.json();
        const a = data.address;
        const waterName = a?.water || a?.waterway || a?.river || a?.lake || a?.reservoir || '';
        const waterType = a?.waterway ? 'Река' : a?.lake ? 'Озеро' : a?.reservoir ? 'Водохранилище' : '';

        if (waterName) {
            return `${waterType}: ${waterName}`;
        }
    } catch (e) {}
    return null;
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
    showToast('Точка сохранена!');
}

function addPlacemark(m) {
    if (!ymap) return;

    const MyIconLayout = ymaps.templateLayoutFactory.createClass(
        '<div style="background:#2563eb;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 2px 8px rgba(0,0,0,.35);border:3px solid #fff;">🐟</div>'
    );

    let fishInfo = '';
    if (m.fish) {
        fishInfo = '<div style="margin-top:6px;padding:8px 10px;background:#eff6ff;border-radius:8px;font-size:.85rem;color:#1e40af;"><b>🐟 Какая рыба:</b><br>' + m.fish + '</div>';
    }

    const naviUrl = 'yandexnavi://build_route_on_map?lat_to=' + m.lat + '&lon_to=' + m.lng;

    const placemark = new ymaps.Placemark([m.lat, m.lng], {
        balloonContent: '<div style="font-size:1.1rem;font-weight:700;margin-bottom:4px;">🐟 ' + m.name + '</div>'
            + (m.desc ? '<div style="color:#64748b;font-size:.85rem;margin-bottom:4px;">' + m.desc + '</div>' : '')
            + fishInfo
            + '<div style="margin-top:10px;display:flex;gap:6px;flex-direction:column;">'
            + '<a href="' + naviUrl + '" style="display:block;padding:10px 12px;background:#00bfff;color:#fff;border-radius:8px;text-decoration:none;font-size:.9rem;text-align:center;font-weight:600;">🚗 Открыть в Навигаторе</a>'
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
    if (ymap) {
        ymap.geoObjects.removeAll();
        mapMarkers.forEach(m => addPlacemark(m));
    }
    saveData();
    ymap && ymap.balloon.close();
    showToast('Точка удалена');
}

// Геолокация на карте
function mapLocateMe() {
    if (!ymap) { showToast('Карта ещё не загрузилась', 'error'); return; }
    if (!navigator.geolocation) { alert('Геолокация не поддерживается'); return; }

    const btn = $('#map-geo-btn');
    btn.textContent = '⏳ Определение...';

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const accuracy = pos.coords.accuracy;
            ymap.setCenter([lat, lng], 14);

            // Убрать старую метку местоположения
            if (window._myLocationMark) {
                ymap.geoObjects.remove(window._myLocationMark);
            }
            if (window._myLocationCircle) {
                ymap.geoObjects.remove(window._myLocationCircle);
            }

            // Круг точности
            window._myLocationCircle = new ymaps.Circle([[lat, lng], accuracy], {}, {
                fillColor: '#22c55e',
                fillOpacity: 0.1,
                strokeColor: '#22c55e',
                strokeWidth: 1
            });
            ymap.geoObjects.add(window._myLocationCircle);

            // Метка местоположения
            const MyLocLayout = ymaps.templateLayoutFactory.createClass(
                '<div style="background:#22c55e;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,.35);border:3px solid #fff;">📍</div>'
            );
            window._myLocationMark = new ymaps.Placemark([lat, lng], {
                balloonContent: '<b>Вы здесь</b><br>' + lat.toFixed(6) + ', ' + lng.toFixed(6) + '<br>Точность: ±' + Math.round(accuracy) + ' м'
            }, {
                iconLayout: 'default#imageWithContent',
                iconImageHref: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="14" fill="#22c55e" stroke="white" stroke-width="3"/></svg>'),
                iconImageSize: [32, 32],
                iconImageOffset: [-16, -16],
                iconContentOffset: [0, 0],
                iconContentLayout: MyLocLayout
            });
            ymap.geoObjects.add(window._myLocationMark);
            btn.textContent = '📍 Моё местоположение';
            showToast('📍 Местоположение определено! Точность: ±' + Math.round(accuracy) + ' м');
        },
        (err) => {
            let msg = 'Не удалось определить местоположение';
            if (err.code === 1) msg = 'Разрешите доступ к геолокации';
            else if (err.code === 2) msg = 'Сигнал геолокации недоступен';
            else if (err.code === 3) msg = 'Превышено время ожидания';
            alert(msg);
            btn.textContent = '📍 Моё местоположение';
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

// Поиск места на карте
async function mapSearch() {
    const query = $('#map-search-input').value.trim();
    if (!query) { showToast('Введите название места', 'error'); return; }
    if (!ymap) { showToast('Карта ещё не загрузилась', 'error'); return; }

    try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=ru&format=json`);
        const data = await res.json();
        if (!data.results || !data.results.length) {
            showToast('Место не найдено', 'error');
            return;
        }
        const r = data.results[0];
        ymap.setCenter([r.latitude, r.longitude], 12);
        showToast(`📍 ${r.name}${r.admin1 ? ', ' + r.admin1 : ''}`);
    } catch (e) {
        showToast('Ошибка поиска', 'error');
    }
}

// Список сохранённых точек
function renderPointsList() {
    const list = $('#points-list');
    const count = $('#points-count');
    count.textContent = mapMarkers.length;

    if (!mapMarkers.length) {
        list.innerHTML = '<p class="empty-state">Пока нет сохранённых точек</p>';
        return;
    }

    list.innerHTML = mapMarkers.map(m => `
        <div class="point-card" onclick="flyToPoint(${m.lat},${m.lng})">
            <div class="point-info">
                <div class="point-name">🐟 ${m.name}</div>
                ${m.fish ? `<div class="point-fish">${m.fish}</div>` : ''}
            </div>
            <div class="point-actions">
                <button class="btn btn-icon" onclick="event.stopPropagation();openDeletePointModal('${m.id}')" title="Удалить">🗑️</button>
            </div>
        </div>
    `).join('');
}

function flyToPoint(lat, lng) {
    if (!ymap) return;
    ymap.setCenter([lat, lng], 14);
    // Найти и открыть балун ближайшего маркера
    ymap.geoObjects.each(obj => {
        if (obj.geometry && obj.geometry.getCoordinates) {
            const c = obj.geometry.getCoordinates();
            if (Math.abs(c[0] - lat) < 0.0001 && Math.abs(c[1] - lng) < 0.0001) {
                obj.balloon.open();
            }
        }
    });
}

function openDeletePointModal(id) {
    if (confirm('Удалить эту точку?')) {
        mapMarkers = mapMarkers.filter(m => m.id !== id);
        if (ymap) {
            ymap.geoObjects.removeAll();
            mapMarkers.forEach(m => addPlacemark(m));
        }
        saveData();
        renderPointsList();
        showToast('Точка удалена');
    }
}

// Построение маршрута в приложении
function buildRoute(lat, lng, name) {
    const routeUrl = 'https://yandex.ru/maps/?rtext=' + lat + ',' + lng + '&rtt=auto&z=14';
    const naviUrl = 'yandexnavi://build_route_on_map?lat_to=' + lat + '&lon_to=' + lng;

    $('#route-title').textContent = '🗺 Маршрут к: ' + name;
    $('#route-iframe').src = routeUrl;
    $('#route-open-navi').href = naviUrl;
    $('#route-modal').classList.add('active');
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
window.buildRoute = buildRoute;
window.flyToPoint = flyToPoint;
window.openDeletePointModal = openDeletePointModal;