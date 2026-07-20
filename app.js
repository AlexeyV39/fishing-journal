// ─── Константы ───
const STORAGE_KEY = 'fishing_journal';
const MONTHS_RU = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const MONTHS_SHORT = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
const DAYS_RU = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
const FISH_ICONS = { 'окунь':'🐟','щука':'🐟','карась':'🐟','лещ':'🐟','судак':'🐟','плотва':'🐟','налим':'🐟','форель':'🐟','сом':'🐟','язь':'🐟','ерш':'🐟','линь':'🐟','карп':'🐟','амур':'🐟','толстолобик':'🐟' };

// ─── Состояние ───
let catches = [];
let settings = { city: 'Москва' };
let currentEditId = null;
let deleteTargetId = null;
let calendarDate = new Date();
let selectedCalendarDate = null;
let photoDataUrl = null;

// ─── DOM ───
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ─── Инициализация ───
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEvents();
    setDefaultDate();
    updateAll();
    loadWeather();
    renderCalendar();
    calcMoonPhase();
    updateForecast();
});

// ─── Хранилище ───
function loadData() {
    try {
        const d = localStorage.getItem(STORAGE_KEY);
        if (d) catches = JSON.parse(d);
        const s = localStorage.getItem(STORAGE_KEY + '_settings');
        if (s) settings = { ...settings, ...JSON.parse(s) };
    } catch(e) { console.error(e); }
}
function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(catches)); }
function saveSettings() { localStorage.setItem(STORAGE_KEY + '_settings', JSON.stringify(settings)); }

// ─── События ───
function setupEvents() {
    // Навигация
    $$('.nav-btn').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));

    // Модалки
    $('#add-catch-btn').addEventListener('click', openAddModal);
    $('#close-modal').addEventListener('click', closeCatchModal);
    $('#cancel-btn').addEventListener('click', closeCatchModal);
    $('#close-delete-modal').addEventListener('click', closeDeleteModal);
    $('#cancel-delete-btn').addEventListener('click', closeDeleteModal);
    $('#confirm-delete-btn').addEventListener('click', confirmDelete);
    $('#catch-form').addEventListener('submit', handleFormSubmit);

    // Фото
    $('#catch-photo').addEventListener('change', handlePhotoUpload);

    // Фильтры
    $('#search-input').addEventListener('input', updateJournal);
    $('#sort-select').addEventListener('change', updateJournal);

    // Календарь
    $('#prev-month').addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth()-1); renderCalendar(); });
    $('#next-month').addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth()+1); renderCalendar(); });

    // Геолокация
    $('#geo-btn').addEventListener('click', detectLocation);

    // Настройки
    $('#save-city').addEventListener('click', () => { settings.city = $('#default-city-input').value.trim() || 'Москва'; saveSettings(); loadWeather(); });
    $('#retry-weather').addEventListener('click', loadWeather);
    $('#default-city-input').value = settings.city;

    // Экспорт/Импорт
    $('#export-json').addEventListener('click', () => exportData('json'));
    $('#export-csv').addEventListener('click', () => exportData('csv'));
    $('#export-btn').addEventListener('click', () => exportData('json'));
    $('#import-btn').addEventListener('click', () => $('#import-file-input').click());
    $('#import-file-input').addEventListener('change', handleImport);
    $('#clear-data').addEventListener('click', () => {
        if (confirm('Удалить ВСЕ данные? Это нельзя отменить!')) {
            catches = []; saveData(); updateAll();
        }
    });

    // Закрытие модалок по фону
    $('#catch-modal').addEventListener('click', (e) => { if (e.target === $('#catch-modal')) closeCatchModal(); });
    $('#delete-modal').addEventListener('click', (e) => { if (e.target === $('#delete-modal')) closeDeleteModal(); });
}

function switchTab(name) {
    $$('.nav-btn').forEach(b => b.classList.remove('active'));
    $$('.tab-content').forEach(c => c.classList.remove('active'));
    $(`[data-tab="${name}"]`).classList.add('active');
    $(`#${name}`).classList.add('active');
}

function setDefaultDate() { $('#catch-date').value = new Date().toISOString().split('T')[0]; }

// ─── Модалки ───
function openAddModal() {
    currentEditId = null; photoDataUrl = null;
    $('#modal-title').textContent = 'Добавить улов';
    $('#catch-form').reset(); setDefaultDate();
    resetPhotoPreview();
    $('#catch-modal').classList.add('active');
}

function openEditModal(id) {
    const c = catches.find(x => x.id === id);
    if (!c) return;
    currentEditId = id; photoDataUrl = c.photo || null;
    $('#modal-title').textContent = 'Редактировать улов';
    $('#catch-id').value = id;
    $('#catch-date').value = c.date;
    $('#catch-location').value = c.location;
    $('#catch-species').value = c.species;
    $('#catch-size').value = c.size || '';
    $('#catch-weight').value = c.weight || '';
    $('#catch-bait').value = c.bait || '';
    $('#catch-notes').value = c.notes || '';
    if (photoDataUrl) {
        $('#photo-preview').innerHTML = `<img src="${photoDataUrl}">`;
    } else { resetPhotoPreview(); }
    $('#catch-modal').classList.add('active');
}

function closeCatchModal() { $('#catch-modal').classList.remove('active'); currentEditId = null; photoDataUrl = null; }
function openDeleteModal(id) { deleteTargetId = id; $('#delete-modal').classList.add('active'); }
function closeDeleteModal() { $('#delete-modal').classList.remove('active'); deleteTargetId = null; }
function confirmDelete() {
    if (deleteTargetId) {
        catches = catches.filter(c => c.id !== deleteTargetId);
        saveData(); updateAll(); closeDeleteModal();
    }
}

// ─── Фото ───
function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        photoDataUrl = ev.target.result;
        $('#photo-preview').innerHTML = `<img src="${photoDataUrl}">`;
    };
    reader.readAsDataURL(file);
}

function resetPhotoPreview() {
    $('#photo-preview').innerHTML = '<span class="photo-icon">📷</span><span>Нажмите или перетащите</span>';
}

// ─── Форма ───
function handleFormSubmit(e) {
    e.preventDefault();
    const data = {
        date: $('#catch-date').value,
        location: $('#catch-location').value.trim(),
        species: $('#catch-species').value.trim(),
        size: parseFloat($('#catch-size').value) || null,
        weight: parseFloat($('#catch-weight').value) || null,
        bait: $('#catch-bait').value.trim() || null,
        notes: $('#catch-notes').value.trim() || null,
        photo: photoDataUrl || null
    };

    if (currentEditId) {
        const i = catches.findIndex(c => c.id === currentEditId);
        if (i !== -1) catches[i] = { ...catches[i], ...data };
    } else {
        data.id = genId();
        data.createdAt = Date.now();
        catches.push(data);
    }
    saveData(); updateAll(); closeCatchModal();
}

function genId() { return Date.now().toString(36) + Math.random().toString(36).substr(2,6); }

// ─── Обновление ───
function updateAll() { updateDashboard(); updateJournal(); updateStats(); }

function updateDashboard() {
    // Последние уловы
    const list = $('#recent-catches-list');
    const sorted = [...catches].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0,5);
    if (!sorted.length) { list.innerHTML = '<li class="empty-state">Пока нет уловов</li>'; return; }
    list.innerHTML = sorted.map(c => `
        <li>
            <div><span class="catch-species">${fishIcon(c.species)} ${c.species}</span><br><span class="catch-details">${c.location}</span></div>
            <span class="catch-date">${fmtDate(c.date)}</span>
        </li>`).join('');

    // Статистика
    $('#total-catches').textContent = catches.length;
    $('#total-fish').textContent = catches.length;
    if (catches.length) {
        const sz = catches.filter(c=>c.size);
        if (sz.length) { const m = sz.reduce((a,b)=>a.size>b.size?a:b); $('#biggest-fish').textContent = m.size+' см'; }
        else $('#biggest-fish').textContent = '-';
        const sp = {}; catches.forEach(c=>{ sp[c.species]=(sp[c.species]||0)+1; });
        const top = Object.entries(sp).sort((a,b)=>b[1]-a[1])[0];
        $('#favorite-species').textContent = top[0];
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
    const m = {};
    catches.forEach(c => { const d=new Date(c.date); const k=`${d.getFullYear()}-${d.getMonth()}`; m[k]=(m[k]||0)+1; });
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
    const withSize = catches.filter(c=>c.size);
    if (withSize.length < 2) { el.innerHTML = '<p class="empty-state">Недостаточно данных</p>'; return; }
    const m = {};
    withSize.forEach(c => { const d=new Date(c.date); const k=`${d.getFullYear()}-${d.getMonth()}`; if(!m[k]) m[k]=[]; m[k].push(c.size); });
    const sorted = Object.entries(m).sort((a,b)=>{ const [yA,mA]=a[0].split('-').map(Number); const [yB,mB]=b[0].split('-').map(Number); return (yB*12+mB)-(yA*12+mA); }).slice(0,8);
    const max = Math.max(...sorted.map(([,v])=>Math.max(...v)));
    el.innerHTML = `<div class="bar-chart">${sorted.map(([k,v])=>{ const [y,mo]=k.split('-').map(Number); const avg=(v.reduce((a,b)=>a+b,0)/v.length).toFixed(0); return `<div class="bar-item"><span class="bar-label">${MONTHS_SHORT[mo]} ${y}</span><div class="bar"><div class="bar-fill" style="width:${(Math.max(...v)/max)*100}%">~${avg} см</div></div></div>`; }).join('')}</div>`;
}

// ─── Маппинг городов на координаты (fallback) ───
const CITY_COORDS = {
    'москва': [55.7558, 37.6173], 'moscow': [55.7558, 37.6173],
    'санкт-петербург': [59.9343, 30.3351], 'петербург': [59.9343, 30.3351], 'питер': [59.9343, 30.3351],
    'новосибирск': [55.0084, 82.9357], 'екатеринбург': [56.8389, 60.6057], 'казань': [55.8304, 49.0661],
    'челябинск': [55.1644, 61.4368], 'самара': [53.1959, 50.1002], 'омск': [54.9914, 73.3645],
    'ростов-на-дону': [47.2357, 39.7015], 'уфа': [54.7388, 55.9721], 'красноярск': [56.0153, 92.8932],
    'воронеж': [51.6720, 39.1843], 'пермь': [58.0105, 56.2502], 'волгоград': [48.7080, 44.5133],
    'краснодар': [45.0355, 38.9753], 'сочи': [43.5855, 39.7231], 'мурманск': [68.9585, 33.0827],
    'калининград': [54.7104, 20.4522], 'ярославль': [57.6261, 39.8845], 'владивосток': [43.1332, 131.9113],
    'хабаровск': [48.4827, 135.0837], 'иркутск': [52.2978, 104.2964], 'томск': [56.4977, 84.9744],
    'балашиха': [55.7522, 37.9238], 'тула': [54.1938, 37.6184], 'нижний тагил': [57.9102, 59.9680],
    'кемерово': [55.3333, 86.0833], 'рязань': [54.6296, 39.6917], 'саратов': [51.5336, 46.0342],
    'тюмень': [57.1553, 65.5654], 'липецк': [52.6088, 39.5992], 'барнаул': [53.3548, 83.7696],
    'ижевск': [56.8528, 53.2334], 'тольятти': [53.5078, 49.4042], 'ахтубинск': [48.2833, 46.1667],
    'архангельск': [64.5399, 40.5152], 'псков': [57.8136, 28.3496],
};

// ─── Геолокация ───
function detectLocation() {
    const btn = $('#geo-btn');
    if (!navigator.geolocation) {
        alert('Геолокация не поддерживается вашим браузером');
        return;
    }

    btn.classList.add('loading');
    btn.textContent = '⏳ Определение...';

    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            const { latitude: lat, longitude: lon } = pos.coords;
            try {
                // Обратное геокодирование: координаты → название города
                const url = `https://geocoding-api.open-meteo.com/v1/search?name=&latitude=${lat}&longitude=${lon}&count=1&language=ru&format=json`;
                // Open-Meteo не поддерживает reverse geocoding напрямую, используем fallback
                // Определяем ближайший город из маппинга
                let nearestCity = 'Москва';
                let minDist = Infinity;
                for (const [city, coords] of Object.entries(CITY_COORDS)) {
                    if (city.length > 3 && !city.includes(' ')) continue; // пропускаем дубли
                    const d = Math.sqrt((lat - coords[0]) ** 2 + (lon - coords[1]) ** 2);
                    if (d < minDist) { minDist = d; nearestCity = city; }
                }

                // Загружаем погоду по координатам напрямую
                const wUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`;
                const wRes = await fetch(wUrl);
                if (!wRes.ok) throw new Error('Ошибка API');
                const data = await wRes.json();
                const cur = data.current;

                // Показываем погоду
                $('#weather-icon').textContent = wmoToEmoji(cur.weather_code);
                $('#weather-temp').textContent = `${Math.round(cur.temperature_2m)}°C`;
                $('#weather-desc').textContent = wmoToText(cur.weather_code);
                $('#weather-location').textContent = `📍 ${nearestCity}`;
                $('#wind-speed').textContent = `${cur.wind_speed_10m} км/ч`;
                $('#humidity').textContent = `${cur.relative_humidity_2m}%`;
                $('#pressure').textContent = `${Math.round(cur.surface_pressure * 0.75)} мм`;

                $('#weather-loading').style.display = 'none';
                $('#weather-info').style.display = 'flex';
                $('#weather-params').style.display = 'grid';
                $('#weather-error').style.display = 'none';

                updateForecastFromWeather(cur);

                // Сохраняем город
                settings.city = nearestCity;
                saveSettings();
                $('#default-city-input').value = nearestCity;

            } catch (e) {
                console.error('Geo weather error:', e);
                alert('Не удалось загрузить погоду для вашей локации');
            }
            btn.classList.remove('loading');
            btn.textContent = '📍 Моя локация';
        },
        (err) => {
            console.error('Geolocation error:', err);
            let msg = 'Не удалось определить местоположение';
            if (err.code === 1) msg = 'Доступ к геолокации запрещён. Разрешите в настройках браузера.';
            if (err.code === 2) msg = 'Местоположение недоступно';
            if (err.code === 3) msg = 'Превышено время ожидания';
            alert(msg);
            btn.classList.remove('loading');
            btn.textContent = '📍 Моя локация';
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
}

// ─── Погода (Open-Meteo — бесплатно, без ключа) ───
async function loadWeather() {
    $('#weather-loading').style.display = 'block';
    $('#weather-info').style.display = 'none';
    $('#weather-params').style.display = 'none';
    $('#weather-error').style.display = 'none';

    try {
        let lat, lon;

        // Попробовать геокодинг Open-Meteo
        try {
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(settings.city)}&count=1&language=ru&format=json`;
            const geoRes = await fetch(geoUrl);
            const geoData = await geoRes.json();
            if (geoData.results && geoData.results.length > 0) {
                lat = geoData.results[0].latitude;
                lon = geoData.results[0].longitude;
            }
        } catch (_) {}

        // Fallback на локальный маппинг
        if (lat === undefined) {
            const key = settings.city.toLowerCase().trim();
            const coords = CITY_COORDS[key];
            if (!coords) throw new Error(`Город "${settings.city}" не найден`);
            [lat, lon] = coords;
        }

        const wUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`;
        const wRes = await fetch(wUrl);
        if (!wRes.ok) throw new Error('Ошибка API погоды');
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
        console.error('Weather error:', e);
        $('#weather-loading').style.display = 'none';
        $('#weather-error').style.display = 'block';
        $('#weather-error p').textContent = `Ошибка: ${e.message}`;
    }
}

function wmoToEmoji(code) {
    if (code === 0) return '☀️';
    if (code <= 2) return '⛅';
    if (code === 3) return '☁️';
    if (code === 45 || code === 48) return '🌫️';
    if (code >= 51 && code <= 55) return '🌦️';
    if (code >= 56 && code <= 57) return '🌧️';
    if (code >= 61 && code <= 65) return '🌧️';
    if (code >= 66 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 77) return '❄️';
    if (code >= 80 && code <= 82) return '🌦️';
    if (code >= 85 && code <= 86) return '❄️';
    if (code >= 95) return '⛈️';
    return '🌤️';
}

function wmoToText(code) {
    if (code === 0) return 'Ясно';
    if (code === 1) return 'Малооблачно';
    if (code === 2) return 'Облачно';
    if (code === 3) return 'Пасмурно';
    if (code === 45 || code === 48) return 'Туман';
    if (code >= 51 && code <= 55) return 'Морось';
    if (code >= 56 && code <= 57) return 'Ледяная морось';
    if (code >= 61 && code <= 63) return 'Дождь';
    if (code === 65) return 'Сильный дождь';
    if (code >= 66 && code <= 67) return 'Ледяной дождь';
    if (code >= 71 && code <= 75) return 'Снег';
    if (code === 77) return 'Снежная крупа';
    if (code >= 80 && code <= 82) return 'Ливень';
    if (code >= 85 && code <= 86) return 'Снегопад';
    if (code === 95) return 'Гроза';
    if (code >= 96) return 'Гроза с градом';
    return 'Неизвестно';
}

// ─── Прогноз клёва ───
function updateForecast() {
    const moon = getMoonPhase(new Date());
    const now = new Date();
    const month = now.getMonth();
    const hour = now.getHours();

    // Базовый прогноз на основе луны и времени года
    const moonFactor = getMoonFactor(moon);
    const seasonFactor = getSeasonFactor(month);
    const timeFactor = (h) => {
        if (h >= 5 && h < 9) return 0.9;   // утро — отлично
        if (h >= 9 && h < 14) return 0.5;   // день — средне
        if (h >= 14 && h < 18) return 0.6;  // день — средне
        if (h >= 18 && h < 22) return 0.85;  // вечер — хорошо
        return 0.3;                           // ночь — плохо
    };

    const periods = [
        { id: 'morning', h: 7 },
        { id: 'day', h: 12 },
        { id: 'evening', h: 19 },
        { id: 'night', h: 1 }
    ];

    periods.forEach(p => {
        const score = Math.min(1, moonFactor * seasonFactor * timeFactor(p.h));
        const pct = Math.round(score * 100);
        let rating, cls;
        if (pct >= 75) { rating = 'Отлично'; cls = 'excellent'; }
        else if (pct >= 55) { rating = 'Хорошо'; cls = 'good'; }
        else if (pct >= 35) { rating = 'Средне'; cls = 'medium'; }
        else { rating = 'Слабо'; cls = 'bad'; }

        $(`#forecast-${p.id}`).textContent = rating;
        $(`#forecast-${p.id}`).className = 'forecast-rating ' + cls;
        $(`#bar-${p.id}`).style.width = pct + '%';
        $(`#bar-${p.id}`).className = 'forecast-fill ' + cls;
    });
}

function updateForecastFromWeather(cur) {
    const temp = cur.temperature_2m;
    const wind = cur.wind_speed_10m;
    const humidity = cur.relative_humidity_2m;
    const code = cur.weather_code;

    let factor = 1.0;
    if (temp < 5 || temp > 30) factor *= 0.6;
    else if (temp >= 10 && temp <= 22) factor *= 1.1;
    if (wind > 25) factor *= 0.5;
    else if (wind > 15) factor *= 0.8;
    if (humidity < 40 || humidity > 90) factor *= 0.7;
    if (code >= 61) factor *= 0.7; // дождь
    if (code >= 95) factor *= 0.4; // гроза

    ['morning','day','evening','night'].forEach(id => {
        const bar = $(`#bar-${id}`);
        const rating = $(`#forecast-${id}`);
        const curWidth = parseInt(bar.style.width) || 50;
        const newWidth = Math.min(100, Math.round(curWidth * factor));
        bar.style.width = newWidth + '%';

        let cls, text;
        if (newWidth >= 75) { cls = 'excellent'; text = 'Отлично'; }
        else if (newWidth >= 55) { cls = 'good'; text = 'Хорошо'; }
        else if (newWidth >= 35) { cls = 'medium'; text = 'Средне'; }
        else { cls = 'bad'; text = 'Слабо'; }

        bar.className = 'forecast-fill ' + cls;
        rating.className = 'forecast-rating ' + cls;
        rating.textContent = text;
    });
}

function getMoonFactor(phase) {
    // Рыбы активнее на молодой и полной луне
    if (phase < 0.1 || phase > 0.9) return 0.7;  // новолуние
    if (phase >= 0.45 && phase <= 0.55) return 1.0; // полная луна
    if (phase >= 0.2 && phase <= 0.3) return 0.9;   // первая четверть
    if (phase >= 0.7 && phase <= 0.8) return 0.85;   // последняя четверть
    return 0.6;
}

function getSeasonFactor(month) {
    // 0 = январь, 6 = июль
    const factors = [0.2, 0.2, 0.3, 0.5, 0.7, 0.9, 1.0, 0.95, 0.8, 0.6, 0.3, 0.2];
    return factors[month];
}

// ─── Лунная фаза ───
function calcMoonPhase() {
    const phase = getMoonPhase(new Date());
    const emojis = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'];
    const names = ['Новолуние','Растущая луна','Первая четверть','Растущая луна','Полнолуние','Убывающая луна','Последняя четверть','Убывающая луна'];

    const idx = Math.round(phase * 8) % 8;
    $('#moon-icon').textContent = emojis[idx];
    $('#moon-text').textContent = `${names[idx]} (${Math.round(phase*100)}%)`;
}

function getMoonPhase(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    let c = 0, e = 0;
    if (month < 3) { c = year - 1; e = month + 12; }
    else { c = year; e = month; }

    const a = Math.floor(c / 100);
    const b = Math.floor(a / 4);
    const f = Math.floor(8 * (a + 2) / 25);
    const g = Math.floor((c - b + f + 30) / 4);
    const jd = Math.floor(365.25 * (c + 4716)) + Math.floor(30.6001 * (e + 1)) + day + g - 1524.5;
    const daysSinceNew = jd - 2451549.5;
    const newMoons = daysSinceNew / 29.53059;
    return newMoons - Math.floor(newMoons);
}

// ─── Календарь клёва ───
function renderCalendar() {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    $('#calendar-month-year').textContent = `${MONTHS_RU[month]} ${year}`;

    const grid = $('#calendar-grid');
    grid.innerHTML = '';

    // Заголовки дней
    DAYS_RU.forEach(d => { grid.innerHTML += `<div class="cal-header">${d}</div>`; });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = (firstDay + 6) % 7; // Пн = 0

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

    // Пустые ячейки
    for (let i = 0; i < startDay; i++) {
        grid.innerHTML += `<div class="cal-day empty"></div>`;
    }

    // Дни
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        const dateStr = `${year}-${month}-${d}`;
        const isToday = dateStr === todayStr;
        const isSelected = selectedCalendarDate === dateStr;
        const rating = getDayRating(date);
        const moonEmoji = getDayMoonEmoji(date);

        let cls = 'cal-day';
        if (isToday) cls += ' today';
        if (isSelected) cls += ' selected';
        else if (rating >= 75) cls += ' excellent';
        else if (rating >= 55) cls += ' good';
        else if (rating >= 35) cls += ' medium';
        else cls += ' bad';

        grid.innerHTML += `<div class="${cls}" onclick="selectCalendarDay(${year},${month},${d})">${d}<span class="moon-emoji">${moonEmoji}</span></div>`;
    }
}

function selectCalendarDay(y, m, d) {
    const dateStr = `${y}-${m}-${d}`;
    selectedCalendarDate = dateStr;
    renderCalendar();
    showDayTips(new Date(y, m, d));
}

function getDayRating(date) {
    const moon = getMoonPhase(date);
    const month = date.getMonth();
    const moonF = getMoonFactor(moon);
    const seasonF = getSeasonFactor(month);
    return Math.round(moonF * seasonF * 100);
}

function getDayMoonEmoji(date) {
    const phase = getMoonPhase(date);
    if (phase < 0.1 || phase > 0.9) return '🌑';
    if (phase < 0.25) return '🌒';
    if (phase < 0.5) return '🌓';
    if (phase < 0.75) return '🌔';
    return '🌕';
}

function showDayTips(date) {
    const day = date.getDate();
    const month = date.getMonth();
    const moon = getMoonPhase(date);
    const rating = getDayRating(date);

    const tips = {
        'Рыбалка в полнолуние': 'Рыбы особенно активны. Используйте крупные приманки.',
        'Рыбалка на новолуние': 'Рыбы менее активны. Пробуйте мелкие приманки и тихие места.',
        'Весенняя рыбалка': 'Рыба идёт на нерест. Будьте осторожны с запретами.',
        'Летняя рыбалка': 'Лучшее время — раннее утро и поздний вечер.',
        'Осенняя рыбалка': 'Рыба активно питается перед зимой. Используйте живца.',
        'Зимняя рыбалка': 'Ловля на мотыля и бутерброды. Ищите глубокие ямы.',
    };

    let advice = '';
    if (rating >= 75) advice = 'Отличный день для рыбалки! ';
    else if (rating >= 55) advice = 'Хороший день, но нужно подобрать тактику. ';
    else if (rating >= 35) advice = 'Средний день. Терпение и правильный выбор места. ';
    else advice = 'Сложный день. Попробуйте другие методы ловли. ';

    if (moon < 0.1 || moon > 0.9) advice += tips['Рыбалка на новолуние'];
    else if (moon >= 0.45 && moon <= 0.55) advice += tips['Рыбалка в полнолуние'];
    else if (month >= 2 && month <= 4) advice += tips['Весенняя рыбалка'];
    else if (month >= 5 && month <= 7) advice += tips['Летняя рыбалка'];
    else if (month >= 8 && month <= 10) advice += tips['Осенняя рыбалка'];
    else advice += tips['Зимняя рыбалка'];

    $('#tips-text').textContent = advice;
}

// ─── Экспорт/Импорт ───
function exportData(format) {
    if (!catches.length) { alert('Нет данных для экспорта'); return; }

    let content, filename, type;
    if (format === 'csv') {
        const headers = ['Дата','Место','Вид рыбы','Размер (см)','Вес (кг)','Приманка','Заметки'];
        const rows = catches.map(c => [c.date, c.location, c.species, c.size||'', c.weight||'', c.bait||'', c.notes||''].map(v => `"${String(v).replace(/"/g,'""')}"`).join(','));
        content = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');
        filename = `fishing_${new Date().toISOString().slice(0,10)}.csv`;
        type = 'text/csv;charset=utf-8';
    } else {
        content = JSON.stringify({ version: 1, exportDate: new Date().toISOString(), catches }, null, 2);
        filename = `fishing_${new Date().toISOString().slice(0,10)}.json`;
        type = 'application/json';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const data = JSON.parse(ev.target.result);
            if (data.catches && Array.isArray(data.catches)) {
                if (confirm(`Импортировать ${data.catches.length} уловов? Существующие данные будут дополнены.`)) {
                    const existingIds = new Set(catches.map(c=>c.id));
                    data.catches.forEach(c => {
                        if (!existingIds.has(c.id)) catches.push(c);
                    });
                    saveData(); updateAll();
                    alert('Импорт завершён!');
                }
            } else { alert('Неверный формат файла'); }
        } catch(err) { alert('Ошибка чтения файла: ' + err.message); }
    };
    reader.readAsText(file);
    e.target.value = '';
}

// ─── Утилиты ───
function fmtDate(d) { return new Date(d).toLocaleDateString('ru-RU', { day:'numeric', month:'short', year:'numeric' }); }
function fishIcon(s) { return FISH_ICONS[s.toLowerCase()] || '🐠'; }

// ─── Глобальные функции (для onclick) ───
window.openEditModal = openEditModal;
window.openDeleteModal = openDeleteModal;
window.selectCalendarDay = selectCalendarDay;