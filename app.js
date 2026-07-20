// ─── Константы ───
const STORAGE_KEY = 'fishing_journal';
const MONTHS_RU = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const MONTHS_SHORT = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
const DAYS_RU = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

// ─── Состояние ───
let catches = [];
let mapMarkers = [];
let settings = { city: 'Москва' };
let currentEditId = null;
let deleteTargetId = null;
let calendarDate = new Date();
let selectedCalendarDate = null;
let photoDataUrl = null;
let map = null;
let leafletMarkers = [];
let placingMarker = false;

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
    calcMoonPhase();
    updateForecast();
});

// ─── Хранилище ───
function loadData() {
    try {
        const d = localStorage.getItem(STORAGE_KEY);
        if (d) { const parsed = JSON.parse(d); catches = parsed.catches || parsed || []; }
        const s = localStorage.getItem(STORAGE_KEY + '_settings');
        if (s) settings = { ...settings, ...JSON.parse(s) };
        const m = localStorage.getItem(STORAGE_KEY + '_markers');
        if (m) mapMarkers = JSON.parse(m);
    } catch(e) { console.error('Load error:', e); }
}
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ catches }));
    localStorage.setItem(STORAGE_KEY + '_settings', JSON.stringify(settings));
    localStorage.setItem(STORAGE_KEY + '_markers', JSON.stringify(mapMarkers));
}

// ─── События ───
function setupEvents() {
    $$('.nav-btn').forEach(b => b.addEventListener('click', () => {
        switchTab(b.dataset.tab);
        if (b.dataset.tab === 'map' && !map) setTimeout(initMap, 100);
        if (b.dataset.tab === 'map' && map) setTimeout(() => map.invalidateSize(), 100);
    }));

    $('#add-catch-btn').addEventListener('click', openAddModal);
    $('#close-modal').addEventListener('click', closeCatchModal);
    $('#cancel-btn').addEventListener('click', closeCatchModal);
    $('#close-delete-modal').addEventListener('click', closeDeleteModal);
    $('#cancel-delete-btn').addEventListener('click', closeDeleteModal);
    $('#confirm-delete-btn').addEventListener('click', confirmDelete);
    $('#catch-form').addEventListener('submit', handleFormSubmit);
    $('#catch-photo').addEventListener('change', handlePhotoUpload);
    $('#search-input').addEventListener('input', updateJournal);
    $('#sort-select').addEventListener('change', updateJournal);

    $('#prev-month').addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth()-1); renderCalendar(); });
    $('#next-month').addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth()+1); renderCalendar(); });

    $('#geo-btn').addEventListener('click', detectLocation);
    $('#save-city').addEventListener('click', () => { settings.city = $('#default-city-input').value.trim() || 'Москва'; saveData(); loadWeather(); });
    $('#retry-weather').addEventListener('click', loadWeather);
    $('#default-city-input').value = settings.city;

    $('#export-json').addEventListener('click', () => exportData('json'));
    $('#export-csv').addEventListener('click', () => exportData('csv'));
    $('#export-btn').addEventListener('click', () => exportData('json'));
    $('#import-btn').addEventListener('click', () => $('#import-file-input').click());
    $('#import-file-input').addEventListener('change', handleImport);
    $('#clear-data').addEventListener('click', () => {
        if (confirm('Удалить ВСЕ данные? Это нельзя отменить!')) {
            catches = []; mapMarkers = []; saveData(); updateAll();
        }
    });

    // Карта: модалка маркера
    $('#add-marker-btn').addEventListener('click', () => {
        placingMarker = true;
        $('#add-marker-btn').textContent = '👆 Тапните на карту';
        $('#add-marker-btn').style.background = '#dc2626';
    });
    $('#close-marker-modal').addEventListener('click', () => $('#marker-modal').classList.remove('active'));
    $('#cancel-marker-btn').addEventListener('click', () => $('#marker-modal').classList.remove('active'));
    $('#marker-form').addEventListener('submit', handleMarkerSubmit);

    $('#catch-modal').addEventListener('click', (e) => { if (e.target === $('#catch-modal')) closeCatchModal(); });
    $('#delete-modal').addEventListener('click', (e) => { if (e.target === $('#delete-modal')) closeDeleteModal(); });
    $('#marker-modal').addEventListener('click', (e) => { if (e.target === $('#marker-modal')) $('#marker-modal').classList.remove('active'); });
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
    if (photoDataUrl) { $('#photo-preview').innerHTML = `<img src="${photoDataUrl}">`; }
    else resetPhotoPreview();
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
    if (file.size > 2 * 1024 * 1024) { alert('Фото слишком большое (макс 2 МБ). Сожмите фото.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { photoDataUrl = ev.target.result; $('#photo-preview').innerHTML = `<img src="${photoDataUrl}">`; };
    reader.readAsDataURL(file);
}
function resetPhotoPreview() { $('#photo-preview').innerHTML = '<span class="photo-icon">📷</span><span>Нажмите или перетащите</span>'; }

// ─── Форма улова ───
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
    saveData();
    updateAll();
    closeCatchModal();
    alert('Улов сохранён!');
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

// ─── Погода (Open-Meteo) ───
async function loadWeather() {
    $('#weather-loading').style.display = 'block';
    $('#weather-info').style.display = 'none';
    $('#weather-params').style.display = 'none';
    $('#weather-error').style.display = 'none';

    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(settings.city)}&count=1&language=ru&format=json`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();
        if (!geoData.results || !geoData.results.length) throw new Error(`Город "${settings.city}" не найден`);
        const { latitude: lat, longitude: lon } = geoData.results[0];

        const wUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure&timezone=auto&forecast_days=1`;
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

        // Обратное геокодирование через Nominatim (OpenStreetMap)
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ru`);
        const geoData = await geoRes.json();
        const city = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.county || geoData.address?.state || 'Москва';

        // Погода по координатам
        const wUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure&timezone=auto&forecast_days=1`;
        const wRes = await fetch(wUrl);
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
    } catch (e) {
        console.error('Geo error:', e);
        let msg = 'Не удалось определить местоположение';
        if (e.code === 1) msg = 'Разрешите доступ к геолокации в настройках браузера';
        alert(msg);
    }
    btn.classList.remove('loading');
    btn.textContent = '📍 Моя локация';
}

function wmoToEmoji(code) {
    if (code === 0) return '☀️';
    if (code <= 2) return '⛅';
    if (code === 3) return '☁️';
    if (code === 45 || code === 48) return '🌫️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 77) return '❄️';
    if (code >= 80 && code <= 82) return '🌦️';
    if (code >= 85) return '❄️';
    if (code >= 95) return '⛈️';
    return '🌤️';
}
function wmoToText(code) {
    if (code === 0) return 'Ясно';
    if (code <= 2) return 'Малооблачно';
    if (code === 3) return 'Пасмурно';
    if (code === 45 || code === 48) return 'Туман';
    if (code >= 51 && code <= 55) return 'Морось';
    if (code >= 61 && code <= 65) return 'Дождь';
    if (code >= 71 && code <= 75) return 'Снег';
    if (code >= 80 && code <= 82) return 'Ливень';
    if (code >= 95) return 'Гроза';
    return 'Неизвестно';
}

function updateForecastFromWeather(cur) {
    let factor = 1.0;
    if (cur.temperature_2m < 5 || cur.temperature_2m > 30) factor *= 0.6;
    else if (cur.temperature_2m >= 10 && cur.temperature_2m <= 22) factor *= 1.1;
    if (cur.wind_speed_10m > 25) factor *= 0.5;
    else if (cur.wind_speed_10m > 15) factor *= 0.8;
    if (cur.relative_humidity_2m < 40 || cur.relative_humidity_2m > 90) factor *= 0.7;
    if (cur.weather_code >= 61) factor *= 0.7;
    if (cur.weather_code >= 95) factor *= 0.4;

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

// ─── Прогноз клёва ───
function updateForecast() {
    const moon = getMoonPhase(new Date());
    const month = new Date().getMonth();
    const moonFactor = getMoonFactor(moon);
    const seasonFactor = getSeasonFactor(month);
    const timeFactor = (h) => {
        if (h >= 5 && h < 9) return 0.9;
        if (h >= 9 && h < 14) return 0.5;
        if (h >= 14 && h < 18) return 0.6;
        if (h >= 18 && h < 22) return 0.85;
        return 0.3;
    };
    [{id:'morning',h:7},{id:'day',h:12},{id:'evening',h:19},{id:'night',h:1}].forEach(p => {
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

function getMoonFactor(p) { if (p<0.1||p>0.9) return 0.7; if (p>=0.45&&p<=0.55) return 1.0; if (p>=0.2&&p<=0.3) return 0.9; if (p>=0.7&&p<=0.8) return 0.85; return 0.6; }
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
    const year = date.getFullYear(), month = date.getMonth()+1, day = date.getDate();
    let c=0, e=0;
    if (month<3) { c=year-1; e=month+12; } else { c=year; e=month; }
    const a=Math.floor(c/100), b=Math.floor(a/4), f=Math.floor(8*(a+2)/25), g=Math.floor((c-b+f+30)/4);
    const jd=Math.floor(365.25*(c+4716))+Math.floor(30.6001*(e+1))+day+g-1524.5;
    const d=jd-2451549.5;
    return (d/29.53059)-(Math.floor(d/29.53059));
}

// ─── Календарь клёва ───
function renderCalendar() {
    const year = calendarDate.getFullYear(), month = calendarDate.getMonth();
    $('#calendar-month-year').textContent = `${MONTHS_RU[month]} ${year}`;
    const grid = $('#calendar-grid');
    grid.innerHTML = '';
    DAYS_RU.forEach(d => { grid.innerHTML += `<div class="cal-header">${d}</div>`; });
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month+1, 0).getDate();
    const startDay = (firstDay+6)%7;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    for (let i=0; i<startDay; i++) grid.innerHTML += `<div class="cal-day empty"></div>`;
    for (let d=1; d<=daysInMonth; d++) {
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

function selectCalendarDay(y,m,d) {
    selectedCalendarDate = `${y}-${m}-${d}`;
    renderCalendar();
    showDayTips(new Date(y,m,d));
}

function getDayRating(date) { return Math.round(getMoonFactor(getMoonPhase(date)) * getSeasonFactor(date.getMonth()) * 100); }
function getDayMoonEmoji(date) { const p=getMoonPhase(date); if(p<0.1||p>0.9) return '🌑'; if(p<0.25) return '🌒'; if(p<0.5) return '🌓'; if(p<0.75) return '🌔'; return '🌕'; }

function showDayTips(date) {
    const moon = getMoonPhase(date), month = date.getMonth(), rating = getDayRating(date);
    let advice = rating >= 75 ? 'Отличный день! ' : rating >= 55 ? 'Хороший день. ' : rating >= 35 ? 'Средний день. ' : 'Сложный день. ';
    if (moon < 0.1 || moon > 0.9) advice += 'Новолуние — рыбы менее активны, пробуйте мелкие приманки.';
    else if (moon >= 0.45 && moon <= 0.55) advice += 'Полнолуние — рыбы активны, крупные приманки.';
    else if (month >= 2 && month <= 4) advice += 'Весна — рыба на нересте, будьте осторожны.';
    else if (month >= 5 && month <= 7) advice += 'Лучшее время — раннее утро и вечер.';
    else if (month >= 8 && month <= 10) advice += 'Осень — рыба активно питается перед зимой.';
    else advice += 'Зима — ловля на мотыля и бутерброды.';
    $('#tips-text').textContent = advice;
}

// ─── Карта (Leaflet + OpenStreetMap) ───
function initMap() {
    if (map) return;
    map = L.map('map-container').setView([55.7558, 37.6173], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 18
    }).addTo(map);

    // Загрузить сохранённые маркеры
    mapMarkers.forEach(m => addMarkerToMap(m));

    // Клик по карте
    map.on('click', (e) => {
        if (!placingMarker) return;
        placingMarker = false;
        $('#add-marker-btn').textContent = '📍 Добавить точку';
        $('#add-marker-btn').style.background = '';
        $('#marker-lat').value = e.latlng.lat;
        $('#marker-lng').value = e.latlng.lng;
        $('#marker-name').value = '';
        $('#marker-desc').value = '';
        $('#marker-modal').classList.add('active');
    });
}

function handleMarkerSubmit(e) {
    e.preventDefault();
    const marker = {
        id: genId(),
        lat: parseFloat($('#marker-lat').value),
        lng: parseFloat($('#marker-lng').value),
        name: $('#marker-name').value.trim(),
        desc: $('#marker-desc').value.trim()
    };
    mapMarkers.push(marker);
    addMarkerToMap(marker);
    saveData();
    $('#marker-modal').classList.remove('active');
}

function addMarkerToMap(m) {
    if (!map) return;
    const icon = L.divIcon({
        className: '',
        html: '<div style="font-size:24px;text-shadow:1px 1px 2px rgba(0,0,0,.3)">🐟</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
    const marker = L.marker([m.lat, m.lng], { icon }).addTo(map);
    marker.bindPopup(`
        <div class="popup-title">${m.name}</div>
        ${m.desc ? `<div class="popup-desc">${m.desc}</div>` : ''}
        <button class="popup-delete" onclick="deleteMapMarker('${m.id}')">Удалить</button>
    `);
    leafletMarkers.push({ id: m.id, leaflet: marker });
}

function deleteMapMarker(id) {
    mapMarkers = mapMarkers.filter(m => m.id !== id);
    const lm = leafletMarkers.find(x => x.id === id);
    if (lm) { map.removeLayer(lm.leaflet); leafletMarkers = leafletMarkers.filter(x => x.id !== id); }
    saveData();
    map.closePopup();
}

// ─── Экспорт/Импорт ───
function exportData(format) {
    if (!catches.length) { alert('Нет данных для экспорта'); return; }
    let content, filename, type;
    if (format === 'csv') {
        const headers = ['Дата','Место','Вид рыбы','Размер (см)','Вес (кг)','Приманка','Заметки'];
        const rows = catches.map(c => [c.date,c.location,c.species,c.size||'',c.weight||'',c.bait||'',c.notes||''].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','));
        content = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');
        filename = `fishing_${new Date().toISOString().slice(0,10)}.csv`;
        type = 'text/csv;charset=utf-8';
    } else {
        content = JSON.stringify({ version:2, exportDate: new Date().toISOString(), catches, markers: mapMarkers }, null, 2);
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
            const imported = data.catches || data;
            if (!Array.isArray(imported)) throw new Error('Неверный формат');
            if (confirm(`Импортировать ${imported.length} уловов?`)) {
                const ids = new Set(catches.map(c=>c.id));
                imported.forEach(c => { if (!ids.has(c.id)) catches.push(c); });
                if (data.markers) {
                    const mIds = new Set(mapMarkers.map(m=>m.id));
                    data.markers.forEach(m => { if (!mIds.has(m.id)) mapMarkers.push(m); });
                }
                saveData(); updateAll();
                alert('Импорт завершён!');
            }
        } catch(err) { alert('Ошибка: ' + err.message); }
    };
    reader.readAsText(file);
    e.target.value = '';
}

// ─── Утилиты ───
function fmtDate(d) { return new Date(d).toLocaleDateString('ru-RU', { day:'numeric', month:'short', year:'numeric' }); }
function fishIcon(s) { const l=(s||'').toLowerCase(); return {окунь:'🐟',щука:'🐟',карась:'🐟',лещ:'🐟',судак:'🐟',плотва:'🐟',налим:'🐟',форель:'🐟',сом:'🐟',язь:'🐟',ерш:'🐟',линь:'🐟',карп:'🐟'}[l] || '🐠'; }

// ─── Глобальные функции ───
window.openEditModal = openEditModal;
window.openDeleteModal = openDeleteModal;
window.selectCalendarDay = selectCalendarDay;
window.deleteMapMarker = deleteMapMarker;