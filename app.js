// ─── Firebase ───
const firebaseConfig = {
    apiKey: "AIzaSyApqGTDgPeg8L2025WkpuyEwItP5AuHTkA",
    authDomain: "fishing-journal-fe36a.firebaseapp.com",
    projectId: "fishing-journal-fe36a",
    storageBucket: "fishing-journal-fe36a.firebasestorage.app",
    messagingSenderId: "735536109139",
    appId: "1:735536109139:web:f22363a81c8b1ad0ba98a6"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
let currentUser = null;
let unsubscribeCatches = null;
let unsubscribeMarkers = null;

// ─── Константы ───
const STORAGE_KEY = 'fishing_journal';
const MONTHS_RU = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const MONTHS_SHORT = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
const DAYS_RU = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

// ─── Нерестовые запреты (ПП РФ № 1074, общие) ───
const SPAWNING_BANS = [
    { name: 'Щука', banStart: [3, 15], banEnd: [5, 31], note: 'Запрет зависит от региона: с конца марта по конец мая' },
    { name: 'Судак', banStart: [3, 20], banEnd: [5, 31], note: 'Запрет: март–май. Судак — ценный промысловый вид' },
    { name: 'Лещ', banStart: [4, 15], banEnd: [6, 15], note: 'Нерест: май–июнь. Нельзя ловить на нерестилищах' },
    { name: 'Окунь', banStart: [4, 1], banEnd: [5, 31], note: 'Запрет в период нереста (в некоторых регионах)' },
    { name: 'Налим', banStart: [2, 15], banEnd: [4, 15], note: 'Нерест: февраль–апрель. Ночная рыба' },
    { name: 'Форель', banStart: [3, 1], banEnd: [5, 31], note: 'Запрет зависит от вида: радужная, кумжа, голец' },
    { name: 'Сом', banStart: [5, 15], banEnd: [7, 31], note: 'Нерест: июнь–август. Крупный хищник' },
    { name: 'Карп', banStart: [5, 1], banEnd: [6, 30], note: 'Нерест: май–июнь. Теплолюбивый вид' },
    { name: 'Амур', banStart: [5, 1], banEnd: [7, 15], note: 'Нерест: июнь–июль. Травоядный' },
    { name: 'Линь', banStart: [5, 15], banEnd: [7, 15], note: 'Нерест: июнь–июль. Теплолюбивый вид' },
];

// ─── Справочник рыб ───
const FISH_DB = [
    { name: 'Окунь', emoji: '🐟', minSize: 15, season: 'Круглый год', months: [0,1,2,3,4,5,6,7,8,9,10,11], tackle: ['Спиннинг', 'Жерлицы', 'Поплавочная удочка'], bait: ['Мотыль', 'Опарыш', 'Блесна', 'Воблер', 'Силикон'], desc: 'Предпочитает заросли, коряги, камни. Активен ранним утром и вечером.', color: '#4a7c59', stripes: true, waterTemp: '10-22', depth: '1-5м', habitat: 'Заросли, коряги, камни', img: 'assets/fish/окунь.jpg' },
    { name: 'Щука', emoji: '🐟', minSize: 30, season: 'Круглый год', months: [0,1,2,3,4,5,6,7,8,9,10,11], tackle: ['Спиннинг', 'Жерлицы', 'Донка'], bait: ['Живец', 'Блесна', 'Воблер', 'Силикон'], desc: 'Хищник. Засадный охотник. Любимые места: урез воды, коряги, трава.', color: '#5c7a3a', stripes: false, waterTemp: '4-25', depth: '0.5-4м', habitat: 'Урез воды, коряги, трава', img: 'assets/fish/щука.jpg' },
    { name: 'Карась', emoji: '🐟', minSize: 0, season: 'Май — Октябрь', months: [4,5,6,7,8,9], tackle: ['Поплавочная удочка', 'Донка', 'Фидер'], bait: ['Червь', 'Тесто', 'Хлеб', 'Кукуруза', 'Горох'], desc: 'Любит тихие, прогретые места. Активен в тёплую погоду.', color: '#c9a832', stripes: false, waterTemp: '18-28', depth: '1-3м', habitat: 'Тихие заливы, прогретые места', img: 'assets/fish/карась.jpg' },
    { name: 'Лещ', emoji: '🐟', minSize: 25, season: 'Апрель — Ноябрь', months: [3,4,5,6,7,8,9,10], tackle: ['Фидер', 'Поплавочная удочка', 'Донка'], bait: ['Мотыль', 'Опарыш', 'Червь', 'Манка'], desc: 'Держится на глубине. Активен на рассвете и закате.', color: '#8a9aa4', stripes: false, waterTemp: '10-22', depth: '3-8м', habitat: 'Глубокие участки, бровки', img: 'assets/fish/лещ.jpg' },
    { name: 'Судак', emoji: '🐟', minSize: 30, season: 'Круглый год', months: [0,1,2,3,4,5,6,7,8,9,10,11], tackle: ['Спиннинг', 'Донка', 'Жерлицы'], bait: ['Воблер', 'Силикон', 'Блесна', 'Живец'], desc: 'Глубоководный хищник. Любимые места: ямы, бровки, свалы глубин.', color: '#7a8a6a', stripes: true, waterTemp: '5-20', depth: '3-10м', habitat: 'Ямы, бровки, свалы', img: 'assets/fish/судак.jpg' },
    { name: 'Плотва', emoji: '🐟', minSize: 0, season: 'Круглый год', months: [0,1,2,3,4,5,6,7,8,9,10,11], tackle: ['Поплавочная удочка', 'Фидер'], bait: ['Мотыль', 'Червь', 'Хлеб', 'Тесто'], desc: 'Самая распространённая рыба. Держится стаями на мелководье.', color: '#9aa8b0', stripes: false, waterTemp: '8-25', depth: '1-4м', habitat: 'Мелководье, заросли', img: 'assets/fish/плотва.jpg' },
    { name: 'Налим', emoji: '🐟', minSize: 25, season: 'Ноябрь — Март', months: [0,1,2,3,10,11], tackle: ['Донка', 'Жерлицы'], bait: ['Живец', 'Мотыль', 'Червь'], desc: 'Ночная рыба. Активен зимой. Держится на глубине.', color: '#6a7a5a', stripes: false, waterTemp: '2-10', depth: '3-10м', habitat: 'Ямы, глубокие участки', img: 'assets/fish/налим.jpg' },
    { name: 'Форель', emoji: '🐟', minSize: 15, season: 'Круглый год', months: [0,1,2,3,4,5,6,7,8,9,10,11], tackle: ['Спиннинг', 'Нахлыст'], bait: ['Блесна', 'Воблер', 'Муха', 'Червь'], desc: 'Предпочитает чистую, холодную воду. Горные реки, озёра.', color: '#8fbc8f', stripes: true, waterTemp: '8-18', depth: '1-5м', habitat: 'Чистые реки, озёра', img: 'assets/fish/форель.jpg' },
    { name: 'Сом', emoji: '🐟', minSize: 50, season: 'Июнь — Сентябрь', months: [5,6,7,8], tackle: ['Донка', 'Жерлицы'], bait: ['Живец', 'Лягушка', 'Куски мяса'], desc: 'Крупный хищник. Активен ночью. Держится в ямах и у обрывов.', color: '#4a5a4a', stripes: false, waterTemp: '18-28', depth: '3-10м', habitat: 'Ямы, обрывы', img: 'assets/fish/сом.jpg' },
    { name: 'Язь', emoji: '🐟', minSize: 0, season: 'Апрель — Октябрь', months: [3,4,5,6,7,8,9], tackle: ['Поплавочная удочка', 'Фидер', 'Спиннинг'], bait: ['Червь', 'Мотыль', 'Кукуруза', 'Тесто'], desc: 'Осторожная рыба. Держится на средней глубине.', color: '#7a8a7a', stripes: false, waterTemp: '12-22', depth: '2-5м', habitat: 'Средняя глубина, русло', img: 'assets/fish/язь.jpg' },
    { name: 'Ерш', emoji: '🐟', minSize: 0, season: 'Круглый год', months: [0,1,2,3,4,5,6,7,8,9,10,11], tackle: ['Поплавочная удочка', 'Донка'], bait: ['Мотыль', 'Опарыш', 'Червь'], desc: 'Колючий, но вкусный. Держится у дна, в корягах.', color: '#8a7a5a', stripes: false, waterTemp: '5-20', depth: '1-4м', habitat: 'Дно, коряги', img: 'assets/fish/ерш.jpg' },
    { name: 'Линь', emoji: '🐟', minSize: 0, season: 'Июнь — Сентябрь', months: [5,6,7,8], tackle: ['Поплавочная удочка', 'Донка'], bait: ['Тесто', 'Горох', 'Кукуруза', 'Червь'], desc: 'Любит теплую, тихую воду. Заросли камыша, заливы.', color: '#8a9a3a', stripes: false, waterTemp: '18-28', depth: '1-2м', habitat: 'Заросли, заливы', img: 'assets/fish/линь.jpg' },
    { name: 'Карп', emoji: '🐟', minSize: 0, season: 'Май — Сентябрь', months: [4,5,6,7,8], tackle: ['Поплавочная удочка', 'Фидер', 'Донка'], bait: ['Кукуруза', 'Горох', 'Тесто', 'Бойлы', 'Червь'], desc: 'Крупная, осторожная рыба. Предпочитает тёплые воды.', color: '#c4a032', stripes: false, waterTemp: '18-28', depth: '2-6м', habitat: 'Тёплые воды, ямы', img: 'assets/fish/карп.jpg' },
    { name: 'Амур', emoji: '🐟', minSize: 0, season: 'Июнь — Сентябрь', months: [5,6,7,8], tackle: ['Поплавочная удочка', 'Донка'], bait: ['Кукуруза', 'Горох', 'Бамбук', 'Тесто'], desc: 'Травоядный. Держится в камышовых зарослях.', color: '#6a8a6a', stripes: false, waterTemp: '20-30', depth: '1-3м', habitat: 'Камыши, заросли', img: 'assets/fish/амур.jpg' },
    { name: 'Краснопёрка', emoji: '🐟', minSize: 0, season: 'Май — Октябрь', months: [4,5,6,7,8,9], tackle: ['Поплавочная удочка', 'Фидер'], bait: ['Мотыль', 'Опарыш', 'Червь'], desc: 'Красивая рыба с красными плавниками. Тёплые, заросшие заливы.', color: '#b87a5a', stripes: false, waterTemp: '15-25', depth: '1-3м', habitat: 'Заросшие заливы', img: 'assets/fish/краснопёрка.jpg' },
    { name: 'Уклейка', emoji: '🐟', minSize: 0, season: 'Май — Сентябрь', months: [4,5,6,7,8], tackle: ['Поплавочная удочка'], bait: ['Мотыль', 'Опарыш'], desc: 'Мелкая стайная рыба. Хороша как живец.', color: '#b0c0c0', stripes: false, waterTemp: '15-25', depth: '0.5-2м', habitat: 'Мелководье', img: 'assets/fish/уклейка.jpg' },
    { name: 'Гольян', emoji: '🐟', minSize: 0, season: 'Круглый год', months: [0,1,2,3,4,5,6,7,8,9,10,11], tackle: ['Поплавочная удочка'], bait: ['Мотыль', 'Опарыш'], desc: 'Мелкая рыба чистых рек. Индикатор экологии.', color: '#90a080', stripes: false, waterTemp: '8-20', depth: '0.5-2м', habitat: 'Чистые реки', img: 'assets/fish/гольян.jpg' },
    { name: 'Густера', emoji: '🐟', minSize: 0, season: 'Апрель — Октябрь', months: [3,4,5,6,7,8,9], tackle: ['Поплавочная удочка', 'Фидер'], bait: ['Мотыль', 'Опарыш', 'Тесто'], desc: 'Стайная рыба. Держится на средней глубине.', color: '#a0a8b0', stripes: false, waterTemp: '10-22', depth: '2-5м', habitat: 'Средняя глубина', img: 'assets/fish/густера.jpg' },
];

// SVG генерация рыб
function fishSVG(fish, w = 80, h = 50) {
    const c = fish.color;
    const dark = shadeColor(c, -30);
    const light = shadeColor(c, 30);
    const stripes = fish.stripes ?
        `<line x1="30" y1="12" x2="35" y2="${h-12}" stroke="${dark}" stroke-width="2" opacity=".3"/>
         <line x1="40" y1="10" x2="45" y2="${h-10}" stroke="${dark}" stroke-width="2" opacity=".3"/>
         <line x1="50" y1="12" x2="55" y2="${h-12}" stroke="${dark}" stroke-width="2" opacity=".3"/>` : '';

    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${light}"/><stop offset="100%" stop-color="${c}"/></linearGradient></defs><ellipse cx="${w/2}" cy="${h/2}" rx="${w/2-4}" ry="${h/2-4}" fill="url(#g)" stroke="${dark}" stroke-width="1"/>${stripes}<polygon points="${w-4},${h/2} ${w+4},${h/2-8} ${w+4},${h/2+8}" fill="${dark}"/><circle cx="16" cy="${h/2-4}" r="3" fill="#1a1a1a"/><circle cx="17" cy="${h/2-5}" r="1" fill="#fff"/></svg>`)}`;
}

function shadeColor(hex, percent) {
    const num = parseInt(hex.slice(1), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + Math.round(2.55 * percent)));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + Math.round(2.55 * percent)));
    const b = Math.min(255, Math.max(0, (num & 0xff) + Math.round(2.55 * percent)));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// ─── Справочник рыб ───
function renderFishGuide() {
    const searchVal = ($('#fish-search')?.value || '').toLowerCase();
    const seasonFilter = $('#fish-season-filter')?.value || '';
    const currentMonth = new Date().getMonth();
    const list = $('#fish-list');
    if (!list) return;

    let filtered = FISH_DB.filter(f => {
        if (searchVal && !f.name.toLowerCase().includes(searchVal)) return false;
        if (seasonFilter === 'current' && !f.months.includes(currentMonth)) return false;
        if (seasonFilter === 'winter' && ![0,1,2,10,11].some(m => f.months.includes(m))) return false;
        if (seasonFilter === 'summer' && ![5,6,7,8].some(m => f.months.includes(m))) return false;
        return true;
    });

    if (!filtered.length) {
        list.innerHTML = '<p class="empty-state">Рыба не найдена</p>';
        return;
    }

    list.innerHTML = filtered.map(f => {
        const isActive = f.months.includes(currentMonth);
        const imgHtml = f.img
            ? `<img class="fish-card-img" src="${f.img}" alt="${f.name}" onerror="this.src='${fishSVG(f)}'">`
            : `<img class="fish-card-img" src="${fishSVG(f)}" alt="${f.name}">`;
        return `
        <div class="fish-card" onclick="this.classList.toggle('expanded')">
            <div class="fish-card-header">
                ${imgHtml}
                <div class="fish-card-info">
                    <div class="fish-card-name">${f.name}</div>
                    <span class="fish-card-season ${isActive ? 'active' : 'inactive'}">${isActive ? '✓ Активна' : '✗ Неактивна'}</span>
                </div>
            </div>
            <div class="fish-card-details">
                <div>📏 Мин: <b>${f.minSize} см</b></div>
                <div>📅 ${f.season}</div>
                <div>🌡 Вода: ${f.waterTemp}°C</div>
                <div>🔍 Глубина: ${f.depth}</div>
                <div>🎣 ${f.tackle.join(', ')}</div>
                <div>🪝 ${f.bait.join(', ')}</div>
            </div>
            <div class="fish-card-full">
                <p><b>Где искать:</b> ${f.habitat}</p>
                <p class="fish-card-desc">${f.desc}</p>
            </div>
        </div>`;
    }).join('');
}

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
let lastWeatherData = null;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ─── Инициализация ───
document.addEventListener('DOMContentLoaded', () => {
    setupEvents();
    setDefaultDate();
    setupAuth();
});

// ─── Авторизация ───
function setupAuth() {
    const loginBtn = $('#auth-login-btn');
    const registerBtn = $('#auth-register-btn');
    const anonBtn = $('#auth-anon-btn');

    loginBtn.addEventListener('click', () => authWithEmail('login'));
    registerBtn.addEventListener('click', () => authWithEmail('register'));
    anonBtn.addEventListener('click', authAnon);

    // Enter на полях
    $('#auth-password').addEventListener('keydown', (e) => { if (e.key === 'Enter') authWithEmail('login'); });

    // Слушатель состояния авторизации
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            $('#auth-screen').classList.add('hidden');
            initApp();
        } else {
            currentUser = null;
            $('#auth-screen').classList.remove('hidden');
        }
    });
}

async function authWithEmail(mode) {
    const email = $('#auth-email').value.trim();
    const password = $('#auth-password').value;
    const errorEl = $('#auth-error');
    const loadingEl = $('#auth-loading');

    if (!email || !password) { showAuthError('Введите email и пароль'); return; }
    if (password.length < 6) { showAuthError('Пароль минимум 6 символов'); return; }

    loadingEl.style.display = 'block';
    errorEl.style.display = 'none';

    try {
        if (mode === 'register') {
            await auth.createUserWithEmailAndPassword(email, password);
        } else {
            await auth.signInWithEmailAndPassword(email, password);
        }
    } catch (e) {
        const messages = {
            'auth/user-not-found': 'Пользователь не найден',
            'auth/wrong-password': 'Неверный пароль',
            'auth/email-already-in-use': 'Этот email уже зарегистрирован',
            'auth/invalid-email': 'Некорректный email',
            'auth/weak-password': 'Пароль слишком простой (минимум 6 символов)',
        };
        showAuthError(messages[e.code] || e.message);
    }
    loadingEl.style.display = 'none';
}

async function authAnon() {
    try {
        await auth.signInAnonymously();
    } catch (e) {
        showAuthError(e.message);
    }
}

function showAuthError(msg) {
    const el = $('#auth-error');
    el.textContent = msg;
    el.style.display = 'block';
}

// ─── Инициализация приложения после входа ───
function initApp() {
    loadData();
    // Восстановить вкладку
    const savedTab = localStorage.getItem(STORAGE_KEY + '_tab') || 'dashboard';
    switchTab(savedTab);
    updateAll();
    loadWeather();
    calcMoonPhase();
    updateForecast();
    renderCalendar();
    renderMonthTabs();
    // Автоматически выбрать сегодня в календаре
    const today = new Date();
    selectCalendarDay(today.getFullYear(), today.getMonth(), today.getDate());
    requestNotificationPermission();
    checkFishingAlerts();
    // Показать статус аккаунта
    if (currentUser) {
        const statusEl = $('#auth-status');
        if (statusEl) {
            statusEl.textContent = currentUser.isAnonymous
                ? '⚡ Анонимный вход (данные только на этом устройстве)'
                : '✅ ' + currentUser.email;
        }
    }
    // Подписаться на изменения из Firestore
    if (currentUser && !currentUser.isAnonymous) {
        subscribeToFirestore();
    }
}

// ─── Хранилище (localStorage + Firestore) ───
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
        showToast('Ошибка сохранения!', 'error');
    }
    // Синхронизировать в Firestore
    syncToFirestore();
}

// ─── Firestore синхронизация ───
function syncToFirestore() {
    if (!currentUser || currentUser.isAnonymous) return;
    const uid = currentUser.uid;
    const userDoc = db.collection('users').doc(uid);

    userDoc.set({
        catches: catches,
        markers: mapMarkers,
        settings: settings,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true }).catch(e => console.error('Firestore sync error:', e));
}

function subscribeToFirestore() {
    if (!currentUser || currentUser.isAnonymous) return;
    const uid = currentUser.uid;

    unsubscribeCatches = db.collection('users').doc(uid).onSnapshot(doc => {
        if (doc.exists) {
            const data = doc.data();
            if (data.catches) {
                catches = data.catches;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(catches));
                updateAll();
            }
            if (data.markers) {
                mapMarkers = data.markers;
                localStorage.setItem(STORAGE_KEY + '_markers', JSON.stringify(mapMarkers));
            }
            if (data.settings) {
                settings = { ...settings, ...data.settings };
                localStorage.setItem(STORAGE_KEY + '_settings', JSON.stringify(settings));
            }
        }
    }, e => console.error('Firestore subscribe error:', e));
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
    // Уловы
    $('#add-catch-btn').addEventListener('click', openAddModal);
    $('#close-modal').addEventListener('click', closeCatchModal);
    $('#cancel-btn').addEventListener('click', closeCatchModal);
    $('#catch-form').addEventListener('submit', handleFormSubmit);
    $('#catch-photo').addEventListener('change', handlePhotoUpload);
    $('#search-input').addEventListener('input', updateJournal);
    $('#sort-select').addEventListener('change', updateJournal);

    // Справочник рыб
    if ($('#fish-search')) $('#fish-search').addEventListener('input', renderFishGuide);
    if ($('#fish-season-filter')) $('#fish-season-filter').addEventListener('change', renderFishGuide);

    // Показать/скрыть секцию улова
    $$('input[name="catch-status"]').forEach(r => r.addEventListener('change', toggleCatchSection));
    toggleCatchSection();

    // Удаление
    $('#close-delete-modal').addEventListener('click', closeDeleteModal);
    $('#cancel-delete-btn').addEventListener('click', closeDeleteModal);
    $('#confirm-delete-btn').addEventListener('click', confirmDelete);

    // Календарь (табы месяцев)
    renderMonthTabs();

    // Геолокация
    $('#geo-btn').addEventListener('click', detectLocation);

    // Настройки
    $('#save-city').addEventListener('click', () => { settings.city = $('#default-city-input').value.trim() || 'Москва'; saveData(); loadWeather(); showToast('Город сохранён'); });
    $('#retry-weather').addEventListener('click', loadWeather);
    $('#default-city-input').value = settings.city;

    // Экспорт/Импорт
    $('#export-json').addEventListener('click', () => exportData('json'));
    $('#export-csv').addEventListener('click', () => exportData('csv'));
    $('#export-pdf-btn').addEventListener('click', exportPDF);
    $('#export-btn').addEventListener('click', () => exportData('json'));
    $('#import-btn').addEventListener('click', () => $('#import-file-input').click());
    $('#import-file-input').addEventListener('change', handleImport);
    $('#enable-notif-btn').addEventListener('click', () => {
        requestNotificationPermission();
        showToast('Уведомления включены!');
    });
    $('#clear-data').addEventListener('click', () => {
        if (confirm('Удалить ВСЕ данные?')) { catches = []; mapMarkers = []; saveData(); updateAll(); showToast('Данные удалены'); }
    });

    // Выход
    $('#logout-btn').addEventListener('click', async () => {
        if (confirm('Выйти из аккаунта? Данные останутся на этом устройстве.')) {
            if (unsubscribeCatches) unsubscribeCatches();
            if (unsubscribeMarkers) unsubscribeMarkers();
            await auth.signOut();
        }
    });

    // Смена почты
    $('#change-email-btn').addEventListener('click', async () => {
        const newEmail = prompt('Введите новый email:');
        if (!newEmail) return;
        const password = prompt('Введите текущий пароль для подтверждения:');
        if (!password) return;
        try {
            const credential = firebase.auth.EmailAuthProvider.credential(currentUser.email, password);
            await currentUser.reauthenticateWithCredential(credential);
            await currentUser.updateEmail(newEmail);
            showToast('Почта обновлена! Войдите заново.');
            $('#auth-status').textContent = '✅ ' + newEmail;
        } catch (e) {
            const msgs = { 'auth/email-already-in-use': 'Этот email уже занят', 'auth/wrong-password': 'Неверный пароль', 'auth/invalid-email': 'Некорректный email', 'auth/requires-recent-login': 'Выйдите и войдите заново, затем повторите' };
            showToast(msgs[e.code] || e.message, 'error');
        }
    });

    // Смена пароля
    $('#change-pass-btn').addEventListener('click', async () => {
        const newPass = prompt('Введите новый пароль (минимум 6 символов):');
        if (!newPass || newPass.length < 6) { showToast('Пароль минимум 6 символов', 'error'); return; }
        const password = prompt('Введите текущий пароль для подтверждения:');
        if (!password) return;
        try {
            const credential = firebase.auth.EmailAuthProvider.credential(currentUser.email, password);
            await currentUser.reauthenticateWithCredential(credential);
            await currentUser.updatePassword(newPass);
            showToast('Пароль обновлён!');
        } catch (e) {
            const msgs = { 'auth/wrong-password': 'Неверный текущий пароль', 'auth/weak-password': 'Пароль слишком простой', 'auth/requires-recent-login': 'Выйдите и войдите заново, затем повторите' };
            showToast(msgs[e.code] || e.message, 'error');
        }
    });

    // Карта
    $('#add-marker-btn').addEventListener('click', togglePlacingMarker);
    $('#map-geo-btn').addEventListener('click', mapLocateMe);
    $('#map-search-btn').addEventListener('click', () => {
        const q = $('#map-search-input').value.trim();
        if (q.length >= 2) searchAddresses(q);
    });
    setupSearchAutocomplete();
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
    $('#week-forecast-modal').addEventListener('click', (e) => { if (e.target === $('#week-forecast-modal')) closeWeekForecast(); });
}

// ─── Переключение вкладок (с сохранением позиции скролла) ───
const _scrollPositions = {};

function switchTab(name) {
    // Сохранить скролл текущей вкладки
    const currentActive = document.querySelector('.tab-content.active');
    if (currentActive) {
        const main = $('.main');
        _scrollPositions[currentActive.id] = main ? main.scrollTop : 0;
    }

    $$('.nav-btn').forEach(b => b.classList.remove('active'));
    $$('.tab-content').forEach(c => c.classList.remove('active'));
    const btn = $(`[data-tab="${name}"]`);
    const tab = $(`#${name}`);
    if (btn) btn.classList.add('active');
    if (tab) {
        tab.classList.add('active');
        // Восстановить скролл новой вкладки
        const main = $('.main');
        if (main) {
            requestAnimationFrame(() => {
                main.scrollTop = _scrollPositions[name] || 0;
            });
        }
    }
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

    // Автоопределение времени суток
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 6) $('#time-night').checked = true;
    else if (hour >= 6 && hour < 10) $('#time-morning').checked = true;
    else if (hour >= 10 && hour < 18) $('#time-day').checked = true;
    else $('#time-evening').checked = true;

    // Показать текущую погоду
    updateCatchWeatherPreview();

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

function updateCatchWeatherPreview() {
    const el = $('#catch-weather-preview');
    if (!el) return;
    if (!lastWeatherData || !lastWeatherData.temp) {
        el.innerHTML = '<span>🌤 Погода не загружена</span>';
        return;
    }
    const d = lastWeatherData;
    el.innerHTML = `
        <span class="catch-weather-tag">🌡 <b>${d.temp}°C</b></span>
        <span class="catch-weather-tag">💨 <b>${d.wind} м/с</b></span>
        <span class="catch-weather-tag">📊 <b>${d.pressure} мм</b></span>
        <span class="catch-weather-tag">💧 <b>${d.humidity}%</b></span>
    `;
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
        photo: photoDataUrl || null,
        weather: {
            temp: lastWeatherData?.temp || null,
            pressure: lastWeatherData?.pressure || null,
            wind: lastWeatherData?.wind || null,
            humidity: lastWeatherData?.humidity || null
        }
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
function updateAll() { updateDashboard(); updateJournal(); updateStats(); renderPointsList(); renderFishGuide(); }

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
const WEATHER_API = '';

const CITY_MAP = {
    'москва': 'Moscow', 'санкт-петербург': 'Saint Petersburg', 'петербург': 'Saint Petersburg',
    'новосибирск': 'Novosibirsk', 'екатеринбург': 'Yekaterinburg', 'казань': 'Kazan',
    'нижний новгород': 'Nizhny Novgorod', 'челябинск': 'Chelyabinsk', 'самара': 'Samara',
    'омск': 'Omsk', 'ростов-на-дону': 'Rostov-on-Don', 'уфа': 'Ufa',
    'красноярск': 'Krasnoyarsk', 'воронеж': 'Voronezh', 'пермь': 'Perm',
    'волгоград': 'Volgograd', 'краснодар': 'Krasnodar', 'саратов': 'Saratov',
    'тюмень': 'Tyumen', 'томск': 'Tomsk', 'иркутск': 'Irkutsk',
    'барнаул': 'Barnaul', 'ульяновск': 'Ulyanovsk', 'хабаровск': 'Khabarovsk',
    'владивосток': 'Vladivostok', 'махачкала': 'Makhachkala', 'оренбург': 'Orenburg',
    'кемерово': 'Kemerovo', 'рязань': 'Ryazan', 'калининград': 'Kaliningrad',
    'томск': 'Tomsk', 'кострома': 'Kostroma', 'вологда': 'Vologda',
    'мурманск': 'Murmansk', 'архангельск': 'Arkhangelsk', 'псков': 'Pskov',
    'сочи': 'Sochi', 'ярославль': 'Yaroslavl', 'смоленск': 'Smolensk',
    'брянск': 'Bryansk', 'орёл': 'Oryol', 'курск': 'Kursk',
    'белгород': 'Belgorod', 'тамбов': 'Tambov', 'липецк': 'Lipetsk',
    'саранск': 'Saransk', 'пенза': 'Penza', 'йошкар-ола': 'Yoshkar-Ola',
    'чебоксары': 'Cheboksyry', 'саранск': 'Saransk', 'владикавказ': 'Vladikavkaz',
    'набережные челны': 'Naberezhnye Chelny', 'златоуст': 'Zlatoust',
    'круглый год': '', '': ''
};

function transliterateCity(city) {
    if (!city) return 'Moscow';
    const lower = city.toLowerCase().trim();
    if (CITY_MAP[lower]) return CITY_MAP[lower];
    // Если не нашли в словаре — пробуем как есть (может быть на английском)
    return city;
}

function yandexWeatherToEmoji(phenomenon) {
    const map = {
        'ясно': '☀️', 'малооблачно': '🌤', 'переменная облачность': '⛅',
        'облачно': '☁️', 'пасмурно': '☁️', 'облачно с прояснениями': '⛅',
        'небольшой дождь': '🌦', 'дождь': '🌧', 'сильный дождь': '🌧',
        'ливень': '🌧', 'гроза': '⛈', 'снег': '❄️', 'небольшой снег': '🌨',
        'метель': '❄️', 'туман': '🌫', 'морось': '🌦',
    };
    const p = (phenomenon || '').toLowerCase();
    for (const [key, emoji] of Object.entries(map)) {
        if (p.includes(key)) return emoji;
    }
    if (p.includes('дождь')) return '🌧';
    if (p.includes('снег')) return '❄️';
    if (p.includes('облачн')) return '☁️';
    return '🌤';
}

function yandexWindDir(deg) {
    if (deg === undefined || deg === null) return '';
    const dirs = ['С','ССВ','СВ','ВСВ','В','ВЮВ','ЮВ','ЮЮВ','Ю','ЮЮЗ','ЮЗ','ЗЮЗ','З','ЗСЗ','СЗ','ССЗ'];
    return dirs[Math.round(deg / 22.5) % 16];
}

async function loadWeather() {
    $('#weather-loading').style.display = 'block';
    $('#weather-content').style.display = 'none';
    $('#weather-error').style.display = 'none';

    const cityRu = settings.city || 'Москва';

    try {
        // Геокодинг
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityRu)}&count=1&language=ru&format=json`);
        const geoData = await geoRes.json();
        if (!geoData.results || !geoData.results.length) throw new Error(`Город "${cityRu}" не найден`);
        const lat = geoData.results[0].latitude;
        const lon = geoData.results[0].longitude;
        settings.lat = lat;
        settings.lng = lon;

        // Погода
        const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,apparent_temperature&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,relative_humidity_2m_mean&timezone=auto&forecast_days=2&wind_speed_unit=ms`);
        if (!wRes.ok) throw new Error('Ошибка API');
        const data = await wRes.json();
        const cur = data.current;
        const daily = data.daily;
        if (!cur) throw new Error('Данные недоступны');

        // Marine API — точная температура воды
        let waterTemp = null;
        try {
            const mRes = await fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,ocean_current_velocity&daily=wave_height_max&timezone=auto&forecast_days=1`);
            if (mRes.ok) {
                const mData = await mRes.json();
                if (mData.current && mData.current.wave_height !== undefined) {
                    waterTemp = { waveHeight: mData.current.wave_height, waveDir: mData.current.wave_direction };
                }
            }
        } catch(_) {}

        const temp = Math.round(cur.temperature_2m);
        const feelsLike = Math.round(cur.apparent_temperature);
        const humidity = cur.relative_humidity_2m;
        const pressure = Math.round(cur.surface_pressure * 0.75);
        const windSpeed = cur.wind_speed_10m;
        const windDir = cur.wind_direction_10m;
        const weatherCode = cur.weather_code;
        const tempMin = Math.round(daily.temperature_2m_min[0]);
        const tempMax = Math.round(daily.temperature_2m_max[0]);

        // Температура воды: Marine API → приблизительный расчёт
        const waterTempText = waterTemp && waterTemp.waveHeight !== undefined
            ? `${Math.round(temp - 3)}°C` // Marine не даёт температуру воды, только волны
            : `${temp > 10 ? Math.round(temp - 3) : Math.round(temp + 1)}°C`;

        // Отрисовка
        $('#today-icon').textContent = wmoToEmoji(weatherCode);
        $('#today-temp').textContent = `${temp}°C`;
        $('#today-desc').textContent = wmoToText(weatherCode);
        $('#today-feels').textContent = `Ощущается как ${feelsLike}°C`;
        $('#today-wind').textContent = `${windSpeed} м/с ${degToDir(windDir)}`;
        $('#today-humidity').textContent = `${humidity}%`;
        $('#today-pressure').textContent = `${pressure} мм`;
        $('#today-temp-min').textContent = `${tempMin}°`;
        $('#today-temp-max').textContent = `${tempMax}°`;
        $('#today-water-temp').textContent = waterTempText;

        // Магнитное поле — скрыто (нет данных в Open-Meteo)
        const magEl = $('#today-magnetic');
        if (magEl) magEl.parentElement.style.display = 'none';

        lastWeatherData = { temp, pressure, wind: windSpeed, humidity };

        // Восход/закат
        const sunTimes = calcSunRiseSet(new Date(), lat, lon);
        if ($('#sunrise-time')) $('#sunrise-time').textContent = sunTimes.rise;
        if ($('#sunset-time')) $('#sunset-time').textContent = sunTimes.set;

        saveData();

        $('#weather-location').textContent = `📍 ${cityRu}`;
        $('#weather-loading').style.display = 'none';
        $('#weather-content').style.display = 'block';
        updateForecastFromWeather(cur);
    } catch (e) {
        console.error('Weather error:', e);
        $('#weather-loading').style.display = 'none';
        $('#weather-error').style.display = 'block';
        $('#weather-error p').textContent = `Ошибка: ${e.message}`;
    }
}

// ─── Погода на 7 дней ───
async function openWeekForecast() {
    const modal = $('#week-forecast-modal');
    const list = $('#week-forecast-list');
    const locEl = $('#week-forecast-location');
    modal.classList.add('active');
    list.innerHTML = '<div style="text-align:center;padding:40px;"><div class="spinner"></div><p>Загрузка...</p></div>';

    const cityRu = settings.city || 'Москва';
    locEl.textContent = `📍 ${cityRu}`;

    try {
        const lat = settings.lat || 55.7558;
        const lon = settings.lng || 37.6173;

        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,relative_humidity_2m_mean&timezone=auto&forecast_days=7&wind_speed_unit=ms`);
        if (!res.ok) throw new Error('Ошибка API');
        const data = await res.json();
        const d = data.daily;
        const currentPressure = data.current ? Math.round(data.current.surface_pressure * 0.75) : '—';

        const DAYS_RU_SHORT = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
        const MONTHS_SHORT_RU = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);

        list.innerHTML = d.time.map((dateStr, i) => {
            const dateParts = dateStr.split('-');
            const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
            const isToday = dateStr === todayStr;
            const dayName = isToday ? 'Сегодня' : DAYS_RU_SHORT[date.getDay()];
            const dateLabel = date.getDate() + ' ' + MONTHS_SHORT_RU[date.getMonth()];
            const tempMin = Math.round(d.temperature_2m_min[i]);
            const tempMax = Math.round(d.temperature_2m_max[i]);
            const emoji = wmoToEmoji(d.weather_code[i]);
            const desc = wmoToText(d.weather_code[i]);
            const wind = d.wind_speed_10m_max ? Math.round(d.wind_speed_10m_max[i]) : '—';
            const precip = d.precipitation_sum[i] || 0;

            return `<div class="week-day-card${isToday ? ' today' : ''}">
                <div class="week-day-name">${dayName}<small>${dateLabel}</small></div>
                <span class="week-day-icon">${emoji}</span>
                <div class="week-day-temps">
                    <div class="week-day-temp-range">
                        <span class="temp-max">${tempMax}°</span> / <span class="temp-min">${tempMin}°</span>
                    </div>
                    <div class="week-day-desc">${desc}</div>
                </div>
                <div class="week-day-extras">
                    <span>💨${wind} м/с</span>
                    ${precip > 0 ? `<span>💧${precip.toFixed(1)}мм</span>` : ''}
                </div>
            </div>`;
        }).join('');

        // Показать и загрузить почасовой прогноз
        const hourlySection = document.querySelector('.hourly-section');
        if (hourlySection) {
            hourlySection.style.display = 'block';
            loadHourlyForecast();
        }
    } catch (e) {
        list.innerHTML = `<p style="text-align:center;padding:20px;color:var(--danger);">Ошибка: ${e.message}</p>`;
    }
}

function closeWeekForecast() {
    $('#week-forecast-modal').classList.remove('active');
    const hourlySection = document.querySelector('.hourly-section');
    if (hourlySection) hourlySection.style.display = 'none';
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

        // Определяем город через Nominatim
        let locationName = '';
        try {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ru&zoom=14`);
            const geoData = await geoRes.json();
            const a = geoData.address;
            locationName = a?.city || a?.town || a?.village || a?.hamlet || a?.county || a?.state || '';
            if (!locationName && a?.road) locationName = a.road;
        } catch (_) {}

        settings.city = locationName || settings.city;
        settings.lat = lat;
        settings.lng = lon;
        saveData();
        $('#default-city-input').value = settings.city;

        // Загрузить погоду через Яндекс API
        await loadWeather();

        showToast(`📍 ${locationName || lat.toFixed(4) + ', ' + lon.toFixed(4)}`);
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

function degToDir(deg) {
    const dirs = ['С', 'ССВ', 'СВ', 'ВСВ', 'В', 'ВЮВ', 'ЮВ', 'ЮЮВ', 'Ю', 'ЮЮЗ', 'ЮЗ', 'ЗЮЗ', 'З', 'ЗСЗ', 'СЗ', 'ССЗ'];
    return dirs[Math.round(deg / 22.5) % 16];
}
function wmoToText(c) {
    const map = {
        0: 'Ясно', 1: 'Преимущественно ясно', 2: 'Переменная облачность', 3: 'Пасмурно',
        45: 'Туман', 48: 'Изморозь',
        51: 'Лёгкая морось', 53: 'Морось', 55: 'Сильная морось',
        56: 'Ледяная морось', 57: 'Сильная ледяная морось',
        61: 'Небольшой дождь', 63: 'Дождь', 65: 'Сильный дождь',
        66: 'Ледяной дождь', 67: 'Сильный ледяной дождь',
        71: 'Небольшой снег', 73: 'Снег', 75: 'Сильный снег',
        77: 'Снежная крупа',
        80: 'Небольшой ливень', 81: 'Ливень', 82: 'Сильный ливень',
        85: 'Снежные ливни', 86: 'Сильные снежные ливни',
        95: 'Гроза', 96: 'Гроза с градом', 99: 'Сильная гроза с градом'
    };
    return map[c] || 'Неизвестно';
}

// ─── Восход/закат солнца (проверенный NOAA) ───
function calcSunRiseSet(date, lat, lng) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // День года
    const dayOfYear = Math.floor((Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 0)) / 86400000) + 1;

    // Гамма (угол орбиты)
    const gamma = (2 * Math.PI / 365) * (dayOfYear - 1);

    // Склонение солнца (радианы)
    const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma)
               - 0.006758 * Math.cos(2*gamma) + 0.000907 * Math.sin(2*gamma)
               - 0.002697 * Math.cos(3*gamma) + 0.00148 * Math.sin(3*gamma);

    // Часовой угол восхода/заката
    const latRad = lat * Math.PI / 180;
    const zenith = 90.833 * Math.PI / 180;
    const cosHA = (Math.cos(zenith) - Math.sin(latRad) * Math.sin(decl)) /
                  (Math.cos(latRad) * Math.cos(decl));

    if (cosHA > 1) return { rise: '—', set: '—' };
    if (cosHA < -1) return { rise: '—', set: '—' };

    const HA = Math.acos(cosHA) * 180 / Math.PI;

    // Уравнение времени (минуты)
    const B = (2 * Math.PI / 365) * (dayOfYear - 81);
    const EoT = 9.87 * Math.sin(2*B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

    // UTC время восхода/заката (в минутах от полуночи)
    const utcRise = 720 - 4 * (lng + HA) - EoT;
    const utcSet = 720 - 4 * (lng - HA) - EoT;

    // Конвертация в часы
    const riseH = ((utcRise / 60) % 24 + 24) % 24;
    const setH = ((utcSet / 60) % 24 + 24) % 24;

    // Часовой пояс по долготе
    const tz = Math.round(lng / 15);

    const fmtH = (h) => {
        const hh = Math.floor(h);
        const mm = Math.round((h - hh) * 60);
        return `${String(hh).padStart(2, '0')}:${String(mm % 60).padStart(2, '0')}`;
    };

    return { rise: fmtH(riseH + tz), set: fmtH(setH + tz) };
}

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
    const now = new Date();
    const phase = getMoonPhase(now);
    const emojis = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'];
    const names = ['Новолуние','Растущая луна','Первая четверть','Растущая луна','Полнолуние','Убывающая луна','Последняя четверть','Убывающая луна'];
    const shortNames = ['Новолуние','Растущая','1/4','Растущая','Полнолуние','Убывающая','Посл. четверть','Убывающая'];
    const idx = Math.round(phase * 8) % 8;

    // Дашборд
    $('#moon-icon').textContent = emojis[idx];
    $('#moon-text').textContent = `${shortNames[idx]} (${Math.round(phase*100)}%)`;

    // Карточка "Сегодня" в календаре
    const emojiEl = $('#moon-today-emoji');
    const phaseEl = $('#moon-today-phase');
    const dateEl = $('#moon-today-date');
    const visEl = $('#moon-visibility');
    const ageEl = $('#moon-age');
    const riseEl = $('#moonrise');
    const setEl = $('#moonset');

    if (emojiEl) {
        const DAYS_RU_FULL = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
        const dayName = DAYS_RU_FULL[now.getDay()];
        const monthName = MONTHS_RU[now.getMonth()].toLowerCase();
        dateEl.textContent = `Сегодня, ${now.getDate()} ${monthName}`;
        phaseEl.textContent = names[idx];
        emojiEl.textContent = emojis[idx];
        visEl.textContent = Math.round(phase * 100) + '%';

        // Возраст луны (дни от новолуния)
        const moonAge = Math.round(phase * 29.53);
        ageEl.textContent = moonAge + ' дн.';

        // Восход/закат солнца (единый алгоритм)
        const sunTimes = calcSunRiseSet(now, settings.lat || 55.75, settings.lng || 37.62);
        riseEl.textContent = sunTimes.rise;
        setEl.textContent = sunTimes.set;
    }
}

function calcMoonRiseSet(date, lat, lng) {
    // Приблизительный расчёт восхода/заката луны
    const phase = getMoonPhase(date);
    // Луна в среднем опаздывает на ~50 минут каждый день
    // Новолуние: восход ≈ восходу солнца, закат ≈ закату солнца
    const year = date.getFullYear(), month = date.getMonth(), day = date.getDate();

    // Приблизительное время восхода/заката солнца для широты ~55°N
    const sunRise = month >= 3 && month <= 8 ? 4.5 + (month < 6 ? month * 0.3 : (8 - month) * 0.3) : 7.5 - month * 0.3;
    const sunSet = month >= 3 && month <= 8 ? 19.5 + (month < 6 ? month * 0.1 : (8 - month) * 0.1) : 16.5 + month * 0.2;

    // Луна опаздывает относительно солнца на phase * 24 часа (приблизительно)
    const moonDelay = phase * 24;
    let riseHour = (sunRise + moonDelay) % 24;
    let setHour = (sunSet + moonDelay) % 24;

    // Корректировка для экстремальных фаз
    if (phase < 0.1 || phase > 0.9) { // Новолуние - луна рядом с солнцем
        riseHour = sunRise + 0.3;
        setHour = sunSet - 0.3;
    } else if (phase > 0.45 && phase < 0.55) { // Полнолуние - луна против солнца
        riseHour = sunSet - 0.5;
        setHour = (sunRise + 24 - 0.5) % 24;
    }

    const fmtH = (h) => {
        const hh = Math.floor(h) % 24;
        const mm = Math.round((h - Math.floor(h)) * 60) % 60;
        return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
    };

    return { rise: fmtH(riseHour), set: fmtH(setHour) };
}

// ─── Лунный календарь: переключение видов ───
let _moonView = 'days';

function switchMoonView(view) {
    _moonView = view;
    $('#moon-view-days').style.display = view === 'days' ? 'block' : 'none';
    $('#moon-view-phases').style.display = view === 'phases' ? 'block' : 'none';
    $('#moon-toggle-days').classList.toggle('active', view === 'days');
    $('#moon-toggle-phases').classList.toggle('active', view === 'phases');
    if (view === 'phases') renderMoonPhases();
}

function renderMoonPhases() {
    const grid = $('#moon-phases-grid');
    if (!grid) return;
    const year = calendarDate.getFullYear(), month = calendarDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    // Определяем фазы для каждого дня
    const phases = [];
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        const phase = getMoonPhase(date);
        phases.push({ day: d, date, phase });
    }

    // Группируем последовательные дни с одной фазой
    const phaseGroups = [];
    let currentGroup = { start: 1, end: 1, phase: phases[0].phase, emoji: getPhaseEmoji(phases[0].phase), name: getPhaseName(phases[0].phase) };

    for (let i = 1; i < phases.length; i++) {
        const pIdx = getPhaseIndex(phases[i].phase);
        const cIdx = getPhaseIndex(currentGroup.phase);
        if (pIdx === cIdx || (pIdx + 1) % 8 === cIdx || (cIdx + 1) % 8 === pIdx) {
            currentGroup.end = phases[i].day;
            currentGroup.phase = phases[i].phase;
            currentGroup.emoji = getPhaseEmoji(phases[i].phase);
            currentGroup.name = getPhaseName(phases[i].phase);
        } else {
            phaseGroups.push(currentGroup);
            currentGroup = { start: phases[i].day, end: phases[i].day, phase: phases[i].phase, emoji: getPhaseEmoji(phases[i].phase), name: getPhaseName(phases[i].phase) };
        }
    }
    phaseGroups.push(currentGroup);

    // Проверяем является ли какой-то группой текущей фазой
    const todayPhase = today.getFullYear() === year && today.getMonth() === month ? today.getDate() : -1;

    grid.innerHTML = phaseGroups.map(g => {
        const isCurrent = todayPhase >= g.start && todayPhase <= g.end;
        const monthShort = MONTHS_SHORT[month].toLowerCase();
        const dateStr = g.start === g.end
            ? `${g.start} ${monthShort}`
            : `${g.start}–${g.end} ${monthShort}`;
        const pct = Math.round(g.phase * 100);
        return `<div class="moon-phase-card${isCurrent ? ' current' : ''}">
            <div class="moon-phase-emoji">${g.emoji}</div>
            <div class="moon-phase-name">${g.name}</div>
            <div class="moon-phase-dates">${dateStr}</div>
            <div class="moon-phase-pct">${pct}%</div>
        </div>`;
    }).join('');
}

function getPhaseIndex(phase) { return Math.round(phase * 8) % 8; }
function getPhaseEmoji(phase) { return ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'][getPhaseIndex(phase)]; }
function getPhaseName(phase) {
    const names = ['Новолуние','Растущая луна','Первая четверть','Растущая луна','Полнолуние','Убывающая луна','Последняя четверть','Убывающая луна'];
    return names[getPhaseIndex(phase)];
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
function renderMonthTabs() {
    const container = $('#moon-months-scroll');
    if (!container) return;
    const now = new Date();
    const currentMonth = calendarDate.getMonth();
    const currentYear = calendarDate.getFullYear();

    // Показываем 12 месяцев начиная с -3 от текущего
    const months = [];
    for (let i = -3; i <= 8; i++) {
        const m = new Date(currentYear, currentMonth + i, 1);
        months.push({ month: m.getMonth(), year: m.getFullYear(), name: MONTHS_SHORT[m.getMonth()] });
    }

    container.innerHTML = months.map(m => {
        const isActive = m.month === currentMonth && m.year === currentYear;
        return `<button class="moon-month-tab${isActive ? ' active' : ''}" onclick="goToMonth(${m.year},${m.month})">${m.name}</button>`;
    }).join('');

    // Прокрутить к активному табу
    const activeTab = container.querySelector('.active');
    if (activeTab) activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

function goToMonth(year, month) {
    calendarDate = new Date(year, month, 1);
    renderCalendar();
    if (_moonView === 'phases') renderMoonPhases();
}

function renderCalendar() {
    const year = calendarDate.getFullYear(), month = calendarDate.getMonth();
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
let _mapGeoBlocked = false;

function initMap() {
    if (ymap) { ymap.container.fitSize(); return; }

    // Блокируем автозапрос геолокации от Яндекс Карт (первый вызов)
    const origGeo = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);
    navigator.geolocation.getCurrentPosition = function(success, error, options) {
        if (!_mapGeoBlocked) {
            _mapGeoBlocked = true;
            if (error) error({ code: 1, message: 'blocked by app' });
            return;
        }
        return origGeo(success, error, options);
    };

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
            controls: ['zoomControl']
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
        controls: ['zoomControl']
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

    const btn = $('#map-geo-btn');
    btn.textContent = '⏳ Определение...';

    // Пробуем IP-геолокацию через несколько сервисов
    const ipServices = [
        'https://ip-api.com/json/?fields=lat,lon,city&lang=ru',
        'https://ipwho.is/',
        'https://ipinfo.io/json'
    ];

    async function tryIpGeo() {
        for (const url of ipServices) {
            try {
                const res = await fetch(url);
                if (!res.ok) continue;
                const data = await res.json();
                const lat = data.lat || data.latitude;
                const lon = data.lon || data.longitude;
                const city = data.city || data.location?.city || '';
                if (lat && lon) {
                    showLocationOnMap(lat, lon, 10000, city);
                    btn.textContent = '📍 Моё местоположение';
                    return true;
                }
            } catch(_) {}
        }
        return false;
    }

    tryIpGeo().then(ok => {
        if (!ok) {
            // Fallback на browser geolocation
            if (!navigator.geolocation) {
                showToast('Геолокация не поддерживается', 'error');
                btn.textContent = '📍 Моё местоположение';
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    showLocationOnMap(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
                    btn.textContent = '📍 Моё местоположение';
                },
                () => {
                    showToast('Не удалось определить местоположение', 'error');
                    btn.textContent = '📍 Моё местоположение';
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        }
    });
}

function showLocationOnMap(lat, lng, accuracy, cityName) {
    ymap.setCenter([lat, lng], 14);

    // Убрать старую метку
    if (window._myLocationMark) ymap.geoObjects.remove(window._myLocationMark);
    if (window._myLocationCircle) ymap.geoObjects.remove(window._myLocationCircle);

    // Круг точности
    window._myLocationCircle = new ymaps.Circle([[lat, lng], accuracy], {}, {
        fillColor: '#22c55e', fillOpacity: 0.1, strokeColor: '#22c55e', strokeWidth: 1
    });
    ymap.geoObjects.add(window._myLocationCircle);

    // Метка
    const MyLocLayout = ymaps.templateLayoutFactory.createClass(
        '<div style="background:#22c55e;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,.35);border:3px solid #fff;">📍</div>'
    );
    window._myLocationMark = new ymaps.Placemark([lat, lng], {
        balloonContent: `<b>Вы здесь</b><br>${cityName ? cityName + '<br>' : ''}${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }, {
        iconLayout: 'default#imageWithContent',
        iconImageHref: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="14" fill="#22c55e" stroke="white" stroke-width="3"/></svg>'),
        iconImageSize: [32, 32], iconImageOffset: [-16, -16], iconContentOffset: [0, 0], iconContentLayout: MyLocLayout
    });
    ymap.geoObjects.add(window._myLocationMark);

    // Сохранить город в настройки для погоды
    if (cityName) {
        settings.city = cityName;
        saveData();
        $('#default-city-input').value = cityName;
    }

    showToast(`📍 ${cityName || lat.toFixed(4) + ', ' + lng.toFixed(4)}`);
}

// Поиск места на карте (Nominatim + выпадающий список)
let _searchTimeout = null;
let _searchResults = [];

function setupSearchAutocomplete() {
    const input = $('#map-search-input');
    const dropdown = $('#map-search-dropdown');
    if (!input || !dropdown) return;

    input.addEventListener('input', () => {
        clearTimeout(_searchTimeout);
        const query = input.value.trim();
        if (query.length < 2) { dropdown.style.display = 'none'; return; }

        dropdown.style.display = 'block';
        dropdown.innerHTML = '<div class="search-loading">🔍 Поиск...</div>';

        _searchTimeout = setTimeout(() => searchAddresses(query), 350);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (_searchResults.length > 0) selectSearchResult(_searchResults[0]);
        }
        if (e.key === 'Escape') dropdown.style.display = 'none';
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.map-search-wrapper')) dropdown.style.display = 'none';
    });
}

async function searchAddresses(query) {
    const dropdown = $('#map-search-dropdown');
    try {
        // Ищем через Nominatim (OpenStreetMap) — поддерживает улицы, СНТ, деревни
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=8&accept-language=ru&addressdetails=1`);
        const data = await res.json();
        _searchResults = data;
        window._searchResults = data;

        if (!data.length) {
            dropdown.innerHTML = '<div class="search-loading">Ничего не найдено</div>';
            return;
        }

        dropdown.innerHTML = data.map((r, i) => {
            const type = getResultType(r);
            const icon = type.icon;
            const name = r.display_name.split(',')[0];
            const desc = r.display_name.split(',').slice(1, 3).join(',').trim();
            return `<div class="search-result" onclick="selectSearchResult(window._searchResults[${i}])">
                <span class="search-result-icon">${icon}</span>
                <div class="search-result-info">
                    <div class="search-result-name">${name}</div>
                    <div class="search-result-desc">${desc}</div>
                </div>
            </div>`;
        }).join('');
    } catch (e) {
        dropdown.innerHTML = '<div class="search-loading">Ошибка поиска</div>';
    }
}

function getResultType(r) {
    const a = r.address || {};
    if (a.waterway || a.water) return { icon: '🌊', type: 'Водоём' };
    if (a.road || a.house_number) return { icon: '🛣', type: 'Улица' };
    if (a.hamlet || a.village || a.neighbourhood) return { icon: '🏘', type: 'Деревня' };
    if (a.suburb || a.quarter) return { icon: '🏙', type: 'Район' };
    if (a.town || a.city) return { icon: '🏙', type: 'Город' };
    if (a.state) return { icon: '📍', type: 'Регион' };
    return { icon: '📍', type: 'Место' };
}

function selectSearchResult(r) {
    const dropdown = $('#map-search-dropdown');
    dropdown.style.display = 'none';
    const input = $('#map-search-input');
    input.value = r.display_name.split(',')[0];

    if (!ymap) return;
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    ymap.setCenter([lat, lng], 15);

    // Убрать старый маркер поиска
    if (window._searchMark) ymap.geoObjects.remove(window._searchMark);

    const SearchLayout = ymaps.templateLayoutFactory.createClass(
        '<div style="background:#f59e0b;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,.35);border:3px solid #fff;">📍</div>'
    );
    const type = getResultType(r);
    window._searchMark = new ymaps.Placemark([lat, lng], {
        balloonContent: `<b>${type.icon} ${r.display_name.split(',')[0]}</b><br><small style="color:#666">${r.display_name}</small>`
    }, {
        iconLayout: 'default#imageWithContent',
        iconImageHref: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="14" fill="#f59e0b" stroke="white" stroke-width="3"/></svg>'),
        iconImageSize: [32, 32],
        iconImageOffset: [-16, -16],
        iconContentOffset: [0, 0],
        iconContentLayout: SearchLayout
    });
    ymap.geoObjects.add(window._searchMark);
    window._searchMark.balloon.open();
    showToast(`${type.icon} ${r.display_name.split(',')[0]}`);
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

// Экспорт отчёта (печать)
function exportPDF() {
    if (!catches.length) { alert('Нет данных для отчёта'); return; }

    const sorted = [...catches].sort((a,b) => new Date(b.date) - new Date(a.date));
    let html = `<html><head><meta charset="utf-8"><title>Отчёт рыболова</title>
    <style>body{font-family:sans-serif;padding:20px;max-width:800px;margin:0 auto;}
    h1{text-align:center;color:#1e40af;}h2{color:#334;margin-top:20px;}
    table{width:100%;border-collapse:collapse;margin:10px 0;}
    th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px;}
    th{background:#f0f0f0;}img{max-width:200px;border-radius:8px;}
    .header{text-align:center;margin-bottom:20px;}</style></head><body>
    <div class="header"><h1>🎣 Отчёт рыболова</h1><p>Дата: ${new Date().toLocaleDateString('ru-RU')}</p><p>Всего записей: ${catches.length}</p></div>`;

    html += '<table><tr><th>Дата</th><th>Место</th><th>Период</th><th>Снасть</th><th>Улов</th><th>Размер</th><th>Вес</th><th>Погода</th><th>Фото</th></tr>';

    sorted.forEach(c => {
        const fish = c.hasCatch !== false && c.species ? c.species : '❌ Нет улова';
        const w = c.weather ? `${c.weather.temp}°C, ${c.weather.wind}м/с` : '-';
        const photo = c.photo ? `<img src="${c.photo}">` : '';
        html += `<tr><td>${fmtDate(c.date)}</td><td>${c.location}</td><td>${c.periods||'-'}</td><td>${c.tackle||'-'}</td><td>${fish}</td><td>${c.size?c.size+' см':'-'}</td><td>${c.weight?c.weight+' кг':'-'}</td><td>${w}</td><td>${photo}</td></tr>`;
    });

    html += '</table></body></html>';

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.print();
}

// Уведомления о клёве
function checkFishingAlerts() {
    if (!('Notification' in window)) return;
    const moon = getMoonPhase(new Date());
    const month = new Date().getMonth();
    const rating = Math.round(getMoonFactor(moon) * getSeasonFactor(month) * 100);

    if (rating >= 75 && Notification.permission === 'granted') {
        new Notification('🎣 Отличный клёв!', {
            body: `Сейчас хорошее время для рыбалки! Рейтинг: ${rating}%`,
            icon: '🐟'
        });
    }
}

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
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
window.selectSearchResult = selectSearchResult;
window.closeLightbox = closeLightbox;
window.toggleDrawer = toggleDrawer;
window.closeDrawer = closeDrawer;
window.drawerNav = drawerNav;
window.topNav = topNav;
window.drawerLogout = drawerLogout;

// ─── Боковая панель (Drawer) ───
let _drawerOpen = false;

function toggleDrawer() {
    _drawerOpen ? closeDrawer() : openDrawer();
}

function openDrawer() {
    _drawerOpen = true;
    $('#drawer').classList.add('active');
    $('#drawer-overlay').classList.add('active');
    // Обновить пользователя
    if (currentUser) {
        $('#drawer-user').textContent = currentUser.isAnonymous ? 'Анонимный вход' : currentUser.email;
    }
    // Подсветить активную вкладку
    const activeTab = document.querySelector('.tab-content.active')?.id;
    $$('.drawer-item').forEach(item => {
        item.classList.toggle('active', item.dataset.tab === activeTab);
    });
}

function closeDrawer() {
    _drawerOpen = false;
    $('#drawer').classList.remove('active');
    $('#drawer-overlay').classList.remove('active');
}

function drawerNav(tab) {
    closeDrawer();
    switchTab(tab);
    localStorage.setItem(STORAGE_KEY + '_tab', tab);
    if (tab === 'map') setTimeout(initMap, 200);
    // Обновить активную кнопку в шапке
    $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
}

function topNav(tab) {
    switchTab(tab);
    localStorage.setItem(STORAGE_KEY + '_tab', tab);
    if (tab === 'map') setTimeout(initMap, 200);
}

function drawerLogout() {
    closeDrawer();
    if (confirm('Выйти из аккаунта? Данные останутся на этом устройстве.')) {
        if (unsubscribeCatches) unsubscribeCatches();
        if (unsubscribeMarkers) unsubscribeMarkers();
        auth.signOut();
    }
}

// Свайп для открытия/закрытия drawer
(function() {
    let startX = 0, startY = 0, swiping = false;
    document.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        swiping = false;
    }, { passive: true });
    document.addEventListener('touchmove', e => {
        if (swiping) return;
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) swiping = true;
    }, { passive: true });
    document.addEventListener('touchend', e => {
        if (!swiping) return;
        const dx = e.changedTouches[0].clientX - startX;
        if (dx > 80 && !_drawerOpen) openDrawer();
        else if (dx < -80 && _drawerOpen) closeDrawer();
    }, { passive: true });
})();

// ─── Сезонные советы ───
function updateSeasonalTips() {
    const el = $('#seasonal-tips');
    if (!el) return;
    const now = new Date();
    const month = now.getMonth();
    const tips = [];

    // Нерестовые запреты
    const banned = SPAWNING_BANS.filter(b => {
        const start = new Date(now.getFullYear(), b.banStart[0]-1, b.banStart[1]);
        const end = new Date(now.getFullYear(), b.banEnd[0]-1, b.banEnd[1]);
        return now >= start && now <= end;
    });
    if (banned.length) {
        tips.push({ icon: '🚫', text: `<b>Сейчас запрещено:</b> ${banned.map(b=>b.name).join(', ')}. Не нарушайте правила!`, warning: true });
    }

    // Сезонные советы
    if (month >= 2 && month <= 4) {
        tips.push({ icon: '🌱', text: '<b>Весна:</b> Рыба активизируется после зимы. Хорошо ловится на мотыля и опарыша.' });
        tips.push({ icon: '⚠️', text: '<b>Внимание!</b> Многие виды на нересте. Проверяйте запреты!' });
    } else if (month >= 5 && month <= 7) {
        tips.push({ icon: '☀️', text: '<b>Лето:</b> Лучшее время для рыбалки — раннее утро и вечер. Кукуруза и горох отлично работают.' });
        tips.push({ icon: '🐟', text: '<b>Совет:</b> Карась и линь активны в тёплой воде. Ищите заросшие заливы.' });
    } else if (month >= 8 && month <= 10) {
        tips.push({ icon: '🍂', text: '<b>Осень:</b> Рыба активно питается перед зимой. Хорошо ловится на донные снасти.' });
        tips.push({ icon: '🎣', text: '<b>Совет:</b> Лещ и судак уходят на глубину. Пробуйте фидер на бровках.' });
    } else {
        tips.push({ icon: '❄️', text: '<b>Зима:</b> Ловля на мотыля и мормышку. Налим активен в тёмное время суток.' });
        tips.push({ icon: '🧊', text: '<b>Совет:</b> Ищите рыбу на глубине 3-8м. Утренние клёвы лучше вечерних.' });
    }

    // Текущая погода
    if (lastWeatherData) {
        const t = lastWeatherData.temp;
        if (t < 5) tips.push({ icon: '🥶', text: `При ${t}°C рыба малоактивна. Попробуйте медленные проводки.` });
        else if (t >= 15 && t <= 25) tips.push({ icon: '😎', text: `При ${t}°C отличные условия для рыбалки!` });
    }

    el.innerHTML = tips.map(t =>
        `<div class="tip-item${t.warning ? ' tip-warning' : ''}">
            <span class="tip-icon">${t.icon}</span>
            <span class="tip-text">${t.text}</span>
        </div>`
    ).join('');
}

// ─── Таймер клёва ───
function updateFishingTimer() {
    const el = $('#fishing-timer');
    if (!el) return;
    if (!catches.length) {
        el.innerHTML = '<span class="timer-value">—</span><span class="timer-label">Пока нет записей</span>';
        return;
    }
    const sorted = [...catches].sort((a,b) => new Date(b.date) - new Date(a.date));
    const last = sorted[0];
    const lastDate = new Date(last.date);
    const now = new Date();
    const diffMs = now - lastDate;
    const days = Math.floor(diffMs / 86400000);
    const hours = Math.floor((diffMs % 86400000) / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);

    let timeStr = '';
    if (days > 0) timeStr += `${days} д. `;
    if (hours > 0) timeStr += `${hours} ч. `;
    timeStr += `${mins} мин.`;

    let mood = '🎣';
    let color = 'var(--primary)';
    if (days > 14) { mood = '😫'; color = 'var(--danger)'; }
    else if (days > 7) { mood = '😐'; color = 'var(--warning)'; }
    else if (days > 3) { mood = '🙂'; }
    else { mood = '😄'; color = 'var(--success)'; }

    el.innerHTML = `<span class="timer-value" style="color:${color}">${timeStr}</span>
        <span class="timer-label">${mood} Последняя рыбалка: ${fmtDate(last.date)}${last.location ? ' · ' + last.location : ''}</span>`;
}

// ─── Фотогалерея уловов ───
function renderPhotoGallery() {
    const el = $('#photo-gallery');
    if (!el) return;
    const withPhotos = catches.filter(c => c.photo);
    if (!withPhotos.length) {
        el.innerHTML = '<p class="empty-state">Пока нет фотографий. Добавьте фото к улову!</p>';
        return;
    }
    const sorted = [...withPhotos].sort((a,b) => new Date(b.date) - new Date(a.date));
    el.innerHTML = sorted.map(c => {
        const species = c.hasCatch !== false && c.species ? c.species : '';
        return `<div class="gallery-item" onclick="openLightbox('${c.photo.replace(/'/g,"\\'")}','${species.replace(/'/g,"\\'")}','${fmtDate(c.date)}','${c.location ? c.location.replace(/'/g,"\\'") : ''}')">
            <img src="${c.photo}" loading="lazy" alt="${species}">
            <div class="gallery-item-info">
                <div class="gallery-item-species">${species}</div>
                <div class="gallery-item-date">${fmtDate(c.date)}</div>
            </div>
        </div>`;
    }).join('');
}

function openLightbox(src, species, date, location) {
    const modal = $('#lightbox-modal');
    const img = $('#lightbox-img');
    const info = $('#lightbox-info');
    img.src = src;
    info.innerHTML = `${species ? '<b>' + species + '</b> · ' : ''}${date}${location ? ' · 📍 ' + location : ''}`;
    modal.classList.add('active');
}

function closeLightbox() {
    $('#lightbox-modal').classList.remove('active');
}

// ─── Нерестовые запреты ───
function renderSpawningBans() {
    const el = $('#spawning-list');
    if (!el) return;
    const now = new Date();
    const year = now.getFullYear();

    el.innerHTML = SPAWNING_BANS.map(b => {
        const start = new Date(year, b.banStart[0]-1, b.banStart[1]);
        const end = new Date(year, b.banEnd[0]-1, b.banEnd[1]);
        const isBanned = now >= start && now <= end;
        const isPast = now > end;

        const startStr = `${b.banStart[1]} ${MONTHS_RU[b.banStart[0]-1].toLowerCase()}`;
        const endStr = `${b.banEnd[1]} ${MONTHS_RU[b.banEnd[0]-1].toLowerCase()}`;

        let badge = '';
        if (isBanned) badge = '<span class="spawning-badge banned">🚫 ЗАПРЕЩЕНО</span>';
        else if (isPast) badge = '<span class="spawning-badge allowed">✅ Разрешено</span>';
        else badge = '<span class="spawning-badge allowed">⏳ Будет запрет</span>';

        return `<div class="spawning-card ${isBanned ? 'spawning-active' : 'spawning-ok'}">
            <div class="spawning-card-header">
                <span class="spawning-card-name">🐟 ${b.name}</span>
                ${badge}
            </div>
            <div class="spawning-card-details">
                <span>📅 ${startStr} — ${endStr}</span>
                <span>📝 ${b.note}</span>
            </div>
        </div>`;
    }).join('');
}

// ─── Сравнение годов ───
function updateYearComparison() {
    const el = $('#year-comparison');
    if (!el) return;
    const now = new Date();
    const thisYear = now.getFullYear();
    const lastYear = thisYear - 1;

    const thisYearCatches = catches.filter(c => new Date(c.date).getFullYear() === thisYear);
    const lastYearCatches = catches.filter(c => new Date(c.date).getFullYear() === lastYear);

    if (!thisYearCatches.length && !lastYearCatches.length) {
        el.innerHTML = '<p class="empty-state">Недостаточно данных для сравнения</p>';
        return;
    }

    const thisYearFish = thisYearCatches.filter(c => c.hasCatch !== false && c.species).length;
    const lastYearFish = lastYearCatches.filter(c => c.hasCatch !== false && c.species).length;
    const thisYearBiggest = thisYearCatches.filter(c=>c.size).reduce((m,c) => c.size > m ? c.size : m, 0);
    const lastYearBiggest = lastYearCatches.filter(c=>c.size).reduce((m,c) => c.size > m ? c.size : m, 0);

    function changeIcon(a, b) {
        if (!a || !b) return '';
        const diff = ((a - b) / (b || 1)) * 100;
        if (diff > 0) return `<span class="year-comp-change up">↑ +${Math.round(diff)}%</span>`;
        if (diff < 0) return `<span class="year-comp-change down">↓ ${Math.round(diff)}%</span>`;
        return '';
    }

    el.innerHTML = `
        <div class="year-comp-item">
            <div class="year-comp-label">Уловов</div>
            <div class="year-comp-values">
                <span class="year-comp-old">${lastYearCatches.length}</span>
                <span class="year-comp-new">${thisYearCatches.length}</span>
            </div>
            ${changeIcon(thisYearCatches.length, lastYearCatches.length)}
        </div>
        <div class="year-comp-item">
            <div class="year-comp-label">Рыб поймано</div>
            <div class="year-comp-values">
                <span class="year-comp-old">${lastYearFish}</span>
                <span class="year-comp-new">${thisYearFish}</span>
            </div>
            ${changeIcon(thisYearFish, lastYearFish)}
        </div>
        <div class="year-comp-item">
            <div class="year-comp-label">Крупнейшая рыба</div>
            <div class="year-comp-values">
                <span class="year-comp-old">${lastYearBiggest ? lastYearBiggest+' см' : '—'}</span>
                <span class="year-comp-new">${thisYearBiggest ? thisYearBiggest+' см' : '—'}</span>
            </div>
            ${changeIcon(thisYearBiggest, lastYearBiggest)}
        </div>
    `;
}

// ─── Почасовой прогноз ───
async function loadHourlyForecast() {
    const el = $('#hourly-forecast');
    if (!el || !settings.lat || !settings.lng) {
        if (el) el.innerHTML = '<p style="color:var(--text2);font-size:.85rem;">Определите местоположение</p>';
        return;
    }
    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${settings.lat}&longitude=${settings.lng}&hourly=temperature_2m,weather_code,wind_speed_10m&timezone=auto&forecast_days=1&wind_speed_unit=ms`);
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        const h = data.hourly;
        const now = new Date();
        const currentHour = now.getHours();

        el.innerHTML = h.time.map((t, i) => {
            const hour = new Date(t).getHours();
            const isCurrent = hour === currentHour;
            return `<div class="hourly-item${isCurrent ? ' current' : ''}">
                <div class="hourly-time">${String(hour).padStart(2,'0')}:00</div>
                <div class="hourly-icon">${wmoToEmoji(h.weather_code[i])}</div>
                <div class="hourly-temp">${Math.round(h.temperature_2m[i])}°</div>
                <div class="hourly-wind">💨${Math.round(h.wind_speed_10m[i])}</div>
            </div>`;
        }).join('');
    } catch(e) {
        el.innerHTML = '<p style="color:var(--text2);font-size:.85rem;">Ошибка загрузки</p>';
    }
}

// ─── Обновлённый updateAll ───
const _origUpdateAll = updateAll;
updateAll = function() {
    _origUpdateAll();
    renderPhotoGallery();
    renderSpawningBans();
    updateYearComparison();
    updateSeasonalTips();
    updateFishingTimer();
};