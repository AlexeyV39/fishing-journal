// ═══════════════════════════════════════════════════════════════
// РЕЧНАЯ РЫБАЛКА — Реалистичная Canvas графика
// Все координаты относительные (canvas.width / canvas.height)
// ═══════════════════════════════════════════════════════════════

(function () {
    'use strict';

    // ─── Кэш canvase и контекста ───
    let canvas, ctx;
    let W, H;
    let animFrame;
    let time = 0;

    // ─── Состояние мыши/тача ───
    let mouseX = 0.5;
    let mouseY = 0.5;
    let rodAngle = -0.35;

    // ─── Время суток (0–1, 0.5 = полдень) ───
    let timeOfDay = 0.35;

    // ─── Частицы ───
    let leaves = [];
    let mistParticles = [];
    let fishRipples = [];

    // ═══════════════════════════════════════════════════════════
    // ИНИЦИАЛИЗАЦИЯ
    // ═══════════════════════════════════════════════════════════

    function init(canvasEl) {
        canvas = canvasEl;
        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);
        canvas.addEventListener('mousemove', onPointerMove);
        canvas.addEventListener('touchmove', onPointerMove, { passive: true });
        canvas.addEventListener('click', onCanvasClick);

        // Создать начальные частицы
        for (let i = 0; i < 8; i++) spawnLeaf();
        for (let i = 0; i < 12; i++) spawnMist();

        animate();
    }

    function resize() {
        const parent = canvas.parentElement;
        if (!parent) return;
        W = canvas.width = parent.clientWidth;
        H = canvas.height = parent.clientHeight || W * 0.5625;
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
    }

    function onPointerMove(e) {
        const rect = canvas.getBoundingClientRect();
        const t = e.touches ? e.touches[0] : e;
        mouseX = (t.clientX - rect.left) / W;
        mouseY = (t.clientY - rect.top) / H;
    }

    function onCanvasClick() {
        // Поклёвка — создать рябь
        const rippleX = W * (0.3 + Math.random() * 0.15);
        const rippleY = H * 0.72;
        fishRipples.push({ x: rippleX, y: rippleY, r: 0, maxR: 30 + Math.random() * 20, alpha: 0.6, speed: 0.8 });
    }

    // ═══════════════════════════════════════════════════════════
    // ЦВЕТОВЫЕ УТИЛИТЫ
    // ═══════════════════════════════════════════════════════════

    function lerpColor(a, b, t) {
        const ar = parseInt(a.slice(1, 3), 16), ag = parseInt(a.slice(3, 5), 16), ab = parseInt(a.slice(5, 7), 16);
        const br = parseInt(b.slice(1, 3), 16), bg = parseInt(b.slice(3, 5), 16), bb = parseInt(b.slice(5, 7), 16);
        const r = Math.round(ar + (br - ar) * t);
        const g = Math.round(ag + (bg - ag) * t);
        const bl = Math.round(ab + (bb - ab) * t);
        return `rgb(${r},${g},${bl})`;
    }

    function rgba(hex, a) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${a})`;
    }

    // ═══════════════════════════════════════════════════════════
    // 1. НЕБО С ОБЛАКАМИ
    // ═══════════════════════════════════════════════════════════

    function drawSky() {
        const horizon = H * 0.55;

        // Градиент неба
        const grad = ctx.createLinearGradient(0, 0, 0, horizon);
        grad.addColorStop(0, '#3A7BD5');
        grad.addColorStop(0.4, '#5B9FE3');
        grad.addColorStop(0.7, '#87CEEB');
        grad.addColorStop(1.0, '#B8DCF0');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, horizon);

        // Солнце
        drawSun(W * 0.78, H * 0.12, H * 0.06);

        // Облака
        drawClouds(horizon);
    }

    function drawSun(cx, cy, r) {
        // Свечение вокруг солнца
        const glowGrad = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 4);
        glowGrad.addColorStop(0, 'rgba(255,250,220,0.6)');
        glowGrad.addColorStop(0.3, 'rgba(255,230,150,0.25)');
        glowGrad.addColorStop(0.7, 'rgba(255,200,100,0.05)');
        glowGrad.addColorStop(1, 'rgba(255,200,100,0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 4, 0, Math.PI * 2);
        ctx.fill();

        // Диск солнца
        const sunGrad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.1, cx, cy, r);
        sunGrad.addColorStop(0, '#FFFDE7');
        sunGrad.addColorStop(0.5, '#FFF9C4');
        sunGrad.addColorStop(1, '#FFE082');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawClouds(horizon) {
        const cloudData = [
            { x: 0.15, y: 0.08, w: 0.14, h: 0.04, speed: 0.15 },
            { x: 0.45, y: 0.06, w: 0.18, h: 0.05, speed: 0.1 },
            { x: 0.75, y: 0.1, w: 0.12, h: 0.035, speed: 0.12 },
            { x: 0.3, y: 0.15, w: 0.1, h: 0.03, speed: 0.08 },
            { x: 0.6, y: 0.13, w: 0.16, h: 0.045, speed: 0.11 },
            { x: 0.88, y: 0.07, w: 0.1, h: 0.03, speed: 0.13 },
        ];

        cloudData.forEach((c, idx) => {
            const cx = ((c.x + time * c.speed * 0.0003) % 1.3 - 0.15) * W;
            const cy = c.y * H;
            const cw = c.w * W;
            const ch = c.h * H;
            drawRealisticCloud(cx, cy, cw, ch, idx);
        });
    }

    function drawRealisticCloud(cx, cy, w, h, seed) {
        ctx.save();

        // Тень облака
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = '#8BA0B8';
        drawCloudShape(cx + 2, cy + h * 0.6, w, h * 0.7, seed + 100);

        // Основное облако
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = '#FFFFFF';
        drawCloudShape(cx, cy, w, h, seed);

        // Яркая верхняя часть
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = '#FFFFFF';
        drawCloudShape(cx - w * 0.05, cy - h * 0.15, w * 0.85, h * 0.7, seed + 50);

        ctx.restore();
    }

    function drawCloudShape(cx, cy, w, h, seed) {
        // Облако из наложенных эллипсов для реалистичной формы
        const bumps = [
            { dx: -0.35, dy: 0.1, rw: 0.4, rh: 0.7 },
            { dx: -0.12, dy: -0.15, rw: 0.38, rh: 0.85 },
            { dx: 0.12, dy: -0.25, rw: 0.42, rh: 0.9 },
            { dx: 0.32, dy: -0.1, rw: 0.36, rh: 0.75 },
            { dx: 0.45, dy: 0.05, rw: 0.3, rh: 0.6 },
            { dx: 0.0, dy: 0.0, rw: 0.5, rh: 0.65 },
        ];

        bumps.forEach(b => {
            ctx.beginPath();
            ctx.ellipse(
                cx + b.dx * w, cy + b.dy * h,
                b.rw * w * 0.5, b.rh * h * 0.5,
                0, 0, Math.PI * 2
            );
            ctx.fill();
        });
    }

    // ═══════════════════════════════════════════════════════════
    // 2. ГОРЫ (МНОГОСЛОЙНЫЕ)
    // ═══════════════════════════════════════════════════════════

    function drawMountains() {
        const horizon = H * 0.55;

        // Дальний ряд — атмосферная дымка
        drawMountainLayer(horizon, 0.12, '#8BA0B8', '#A0B4C8', 0.4, 0.25, 200);

        // Средний ряд
        drawMountainLayer(horizon, 0.08, '#5A8A6A', '#6B9B7A', 0.55, 0.2, 150);

        // Ближний ряд
        drawMountainLayer(horizon, 0.04, '#3B6B4A', '#4A7C59', 0.7, 0.15, 120);
    }

    function drawMountainLayer(horizon, yOff, colorDark, colorLight, detail, opacity, segments) {
        ctx.save();
        ctx.globalAlpha = opacity;

        const baseY = horizon - H * yOff;
        const amplitude = H * 0.08 + H * yOff * 0.5;

        ctx.beginPath();
        ctx.moveTo(0, horizon);

        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const x = t * W;

            // Суммирование синусоид для неровного рельефа
            const n1 = Math.sin(t * 4.5 + 0.3) * 0.5;
            const n2 = Math.sin(t * 7.2 + 1.8) * 0.25;
            const n3 = Math.sin(t * 12.8 + 3.1) * 0.12;
            const n4 = Math.sin(t * 2.1 - 0.5) * 0.3;
            const ridge = (n1 + n2 + n3 + n4) * amplitude;

            const y = baseY - Math.max(0, ridge);
            ctx.lineTo(x, y);
        }

        ctx.lineTo(W, horizon);
        ctx.closePath();

        // Градиент заливки гор
        const grad = ctx.createLinearGradient(0, baseY - amplitude, 0, horizon);
        grad.addColorStop(0, colorDark);
        grad.addColorStop(0.5, colorLight);
        grad.addColorStop(1, colorDark);
        ctx.fillStyle = grad;
        ctx.fill();

        // Детали — тёмные участки (тени на склонах)
        if (detail > 0.3) {
            drawMountainDetails(baseY, amplitude, segments, colorDark, detail);
        }

        ctx.restore();
    }

    function drawMountainDetails(baseY, amplitude, segments, baseColor, detail) {
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#2E5D3A';

        for (let i = 0; i < 15; i++) {
            const t = (i * 0.073 + 0.12) % 1;
            const x = t * W;
            const y = baseY - amplitude * 0.5 * Math.sin(t * 4.5 + 0.3);
            const bw = W * 0.02 + Math.sin(i * 1.7) * W * 0.01;
            const bh = H * 0.02 + Math.cos(i * 2.3) * H * 0.01;

            ctx.beginPath();
            ctx.ellipse(x, y + bh * 0.3, bw, bh, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    // ═══════════════════════════════════════════════════════════
    // 3. ДЕРЕВЬЯ (РАЗНООБРАЗНЫЕ)
    // ═══════════════════════════════════════════════════════════

    function drawTrees() {
        const treeLine = H * 0.52;

        // Дальние деревья (силуэты)
        drawDistantTrees(treeLine);

        // Ели (левая группа)
        drawPine(W * 0.05, treeLine + H * 0.01, H * 0.18, 1.0);
        drawPine(W * 0.1, treeLine + H * 0.03, H * 0.14, 0.85);
        drawPine(W * 0.08, treeLine + H * 0.02, H * 0.16, 0.92);

        // Берёзы (центр)
        drawBirch(W * 0.22, treeLine + H * 0.02, H * 0.15, 1.0);
        drawBirch(W * 0.26, treeLine + H * 0.04, H * 0.12, 0.85);

        // Ель (справа)
        drawPine(W * 0.85, treeLine + H * 0.01, H * 0.2, 1.0);
        drawPine(W * 0.9, treeLine + H * 0.03, H * 0.16, 0.9);
        drawPine(W * 0.95, treeLine + H * 0.02, H * 0.17, 0.95);

        // Кустарники у воды
        drawBush(W * 0.15, H * 0.58, H * 0.04);
        drawBush(W * 0.35, H * 0.59, H * 0.035);
        drawBush(W * 0.7, H * 0.57, H * 0.045);
        drawBush(W * 0.82, H * 0.585, H * 0.03);
    }

    function drawDistantTrees(treeLine) {
        ctx.save();
        ctx.fillStyle = '#3B6B4A';
        ctx.globalAlpha = 0.6;

        for (let i = 0; i < 40; i++) {
            const x = (i / 40) * W + Math.sin(i * 1.7) * 8;
            const h = H * 0.03 + Math.abs(Math.sin(i * 2.3)) * H * 0.02;
            const w = W * 0.008;

            ctx.beginPath();
            ctx.moveTo(x, treeLine);
            ctx.lineTo(x - w, treeLine);
            ctx.lineTo(x, treeLine - h);
            ctx.lineTo(x + w, treeLine);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }

    function drawPine(cx, baseY, height, scale) {
        ctx.save();

        const trunkH = height * 0.15;
        const crownH = height * 0.85;
        const baseW = height * 0.2;

        // Тень на земле
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.beginPath();
        ctx.ellipse(cx + baseW * 0.3, baseY + 2, baseW * 0.7, H * 0.005, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ствол
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(cx - height * 0.015, baseY - trunkH, height * 0.03, trunkH);

        // Крона — 4 яруса треугольников
        const layers = 4;
        for (let i = 0; i < layers; i++) {
            const t = i / layers;
            const layerY = baseY - trunkH - t * crownH;
            const layerW = baseW * (1 - t * 0.7);
            const layerH = crownH / layers * 1.3;

            // Тёмная сторона
            ctx.fillStyle = `rgba(27,94,32,${0.85 - t * 0.1})`;
            ctx.beginPath();
            ctx.moveTo(cx - layerW, layerY + layerH * 0.2);
            ctx.lineTo(cx, layerY - layerH * 0.6);
            ctx.lineTo(cx + layerW * 0.1, layerY + layerH * 0.2);
            ctx.closePath();
            ctx.fill();

            // Светлая сторона
            ctx.fillStyle = `rgba(56,142,60,${0.7 - t * 0.1})`;
            ctx.beginPath();
            ctx.moveTo(cx + layerW * 0.1, layerY + layerH * 0.2);
            ctx.lineTo(cx, layerY - layerH * 0.6);
            ctx.lineTo(cx + layerW, layerY + layerH * 0.2);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }

    function drawBirch(cx, baseY, height, scale) {
        ctx.save();

        const trunkH = height * 0.6;
        const trunkW = height * 0.02;

        // Тень
        ctx.fillStyle = 'rgba(0,0,0,0.08)';
        ctx.beginPath();
        ctx.ellipse(cx + 5, baseY + 1, height * 0.12, H * 0.004, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ствол берёзы — белый с тёмными полосками
        const trunkGrad = ctx.createLinearGradient(cx - trunkW, 0, cx + trunkW, 0);
        trunkGrad.addColorStop(0, '#C8C0A8');
        trunkGrad.addColorStop(0.3, '#F5F0E0');
        trunkGrad.addColorStop(0.7, '#F5F0E0');
        trunkGrad.addColorStop(1, '#D0C8B0');

        ctx.fillStyle = trunkGrad;
        ctx.beginPath();
        ctx.moveTo(cx - trunkW * 0.5, baseY);
        ctx.quadraticCurveTo(cx - trunkW * 0.8, baseY - trunkH * 0.5, cx - trunkW * 0.3, baseY - trunkH);
        ctx.lineTo(cx + trunkW * 0.3, baseY - trunkH);
        ctx.quadraticCurveTo(cx + trunkW * 0.8, baseY - trunkH * 0.5, cx + trunkW * 0.5, baseY);
        ctx.closePath();
        ctx.fill();

        // Полоски на стволе
        ctx.strokeStyle = '#3E2723';
        ctx.lineWidth = 0.8;
        for (let i = 0; i < 5; i++) {
            const y = baseY - trunkH * 0.15 - i * trunkH * 0.15;
            const w = trunkW * (0.3 + Math.random() * 0.4);
            ctx.beginPath();
            ctx.moveTo(cx - w, y);
            ctx.lineTo(cx + w, y + 1);
            ctx.stroke();
        }

        // Крона — шаровидная из кругов
        const crownCenterY = baseY - trunkH - height * 0.15;
        const crownR = height * 0.15;

        const leafClusters = [
            { dx: 0, dy: 0, r: crownR },
            { dx: -crownR * 0.6, dy: crownR * 0.3, r: crownR * 0.7 },
            { dx: crownR * 0.6, dy: crownR * 0.2, r: crownR * 0.75 },
            { dx: 0, dy: -crownR * 0.5, r: crownR * 0.8 },
            { dx: -crownR * 0.3, dy: -crownR * 0.3, r: crownR * 0.6 },
            { dx: crownR * 0.35, dy: -crownR * 0.1, r: crownR * 0.65 },
        ];

        leafClusters.forEach(cl => {
            const lcGrad = ctx.createRadialGradient(
                cx + cl.dx - cl.r * 0.2, crownCenterY + cl.dy - cl.r * 0.2, cl.r * 0.1,
                cx + cl.dx, crownCenterY + cl.dy, cl.r
            );
            lcGrad.addColorStop(0, '#7CB342');
            lcGrad.addColorStop(0.5, '#558B2F');
            lcGrad.addColorStop(1, '#33691E');
            ctx.fillStyle = lcGrad;
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(cx + cl.dx, crownCenterY + cl.dy, cl.r, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }

    function drawBush(cx, baseY, size) {
        ctx.save();

        // Тень
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        ctx.beginPath();
        ctx.ellipse(cx, baseY + size * 0.3, size * 1.2, size * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();

        const clusters = [
            { dx: -size * 0.5, dy: -size * 0.2, r: size * 0.7 },
            { dx: size * 0.3, dy: -size * 0.3, r: size * 0.8 },
            { dx: 0, dy: -size * 0.5, r: size * 0.9 },
            { dx: -size * 0.2, dy: -size * 0.1, r: size * 0.6 },
        ];

        clusters.forEach(cl => {
            const grad = ctx.createRadialGradient(
                cx + cl.dx, baseY + cl.dy - cl.r * 0.3, cl.r * 0.1,
                cx + cl.dx, baseY + cl.dy, cl.r
            );
            grad.addColorStop(0, '#689F38');
            grad.addColorStop(0.6, '#558B2F');
            grad.addColorStop(1, '#33691E');
            ctx.fillStyle = grad;
            ctx.globalAlpha = 0.85;
            ctx.beginPath();
            ctx.arc(cx + cl.dx, baseY + cl.dy, cl.r, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }

    // ═══════════════════════════════════════════════════════════
    // 4. ВОДА (ГРАДИЕНТ, ОТРАЖЕНИЯ, РЯБЬ, ВОЛНЫ)
    // ═══════════════════════════════════════════════════════════

    function drawWater() {
        const waterTop = H * 0.6;
        const waterBot = H;

        // Основной градиент воды
        const waterGrad = ctx.createLinearGradient(0, waterTop, 0, waterBot);
        waterGrad.addColorStop(0, '#4A90C4');
        waterGrad.addColorStop(0.2, '#2E78B0');
        waterGrad.addColorStop(0.5, '#1A5C8A');
        waterGrad.addColorStop(1, '#0D3A5E');
        ctx.fillStyle = waterGrad;
        ctx.fillRect(0, waterTop, W, waterBot - waterTop);

        // Отражения деревьев
        drawWaterReflections(waterTop);

        // Отражение неба (блики на поверхности)
        drawWaterSkyReflection(waterTop);

        // Рябь и волны
        drawWaterRipples(waterTop);

        // Течение
        drawWaterFlow(waterTop);

        // Рыбацкие ряби (от поплавка)
        drawFishRipples();
    }

    function drawWaterReflections(waterTop) {
        ctx.save();

        // Отражения деревьев — перевёрнутые, затемнённые, размытые
        const reflectionBase = waterTop + H * 0.02;
        ctx.globalAlpha = 0.15;

        // Ели
        drawReflectedPine(W * 0.05, reflectionBase, H * 0.18);
        drawReflectedPine(W * 0.1, reflectionBase, H * 0.14);
        drawReflectedPine(W * 0.85, reflectionBase, H * 0.2);
        drawReflectedPine(W * 0.9, reflectionBase, H * 0.16);

        ctx.restore();
    }

    function drawReflectedPine(cx, baseY, height) {
        ctx.fillStyle = '#1B5E20';

        // Перевёрнутый треугольник
        const layers = 3;
        for (let i = 0; i < layers; i++) {
            const t = i / layers;
            const y = baseY + t * height * 0.6;
            const w = height * 0.15 * (1 + t * 0.5);
            const h = height * 0.25;

            ctx.beginPath();
            ctx.moveTo(cx - w, y);
            ctx.lineTo(cx + w, y);
            ctx.lineTo(cx, y + h);
            ctx.closePath();
            ctx.fill();
        }

        // «Растворение» в воде
        const fadeGrad = ctx.createLinearGradient(0, baseY, 0, baseY + height * 0.6);
        fadeGrad.addColorStop(0, 'rgba(74,144,196,0)');
        fadeGrad.addColorStop(1, 'rgba(74,144,196,1)');
        ctx.fillStyle = fadeGrad;
        ctx.fillRect(cx - height * 0.2, baseY, height * 0.4, height * 0.6);
    }

    function drawWaterSkyReflection(waterTop) {
        ctx.save();

        // Яркие полосы — отражение неба
        ctx.globalAlpha = 0.08;
        const skyReflect = ctx.createLinearGradient(0, waterTop, 0, waterTop + H * 0.15);
        skyReflect.addColorStop(0, '#87CEEB');
        skyReflect.addColorStop(1, '#4A90C4');
        ctx.fillStyle = skyReflect;

        for (let i = 0; i < 6; i++) {
            const y = waterTop + H * 0.01 + i * H * 0.025;
            const w = W * (0.2 + Math.sin(i * 1.3) * 0.1);
            const x = W * (0.1 + i * 0.12);
            ctx.beginPath();
            ctx.ellipse(x, y, w, H * 0.008, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    function drawWaterRipples(waterTop) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1;

        // Горизонтальные линии ряби
        for (let i = 0; i < 20; i++) {
            const y = waterTop + H * 0.03 + i * H * 0.02;
            const waveAmp = 1 + Math.sin(time * 0.001 + i * 0.5) * 0.5;
            const alpha = 0.08 + Math.sin(time * 0.002 + i * 0.7) * 0.04;
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = `rgba(255,255,255,${alpha + 0.1})`;

            ctx.beginPath();
            for (let x = 0; x < W; x += 3) {
                const wy = y + Math.sin(x * 0.01 + time * 0.0015 + i) * waveAmp;
                if (x === 0) ctx.moveTo(x, wy);
                else ctx.lineTo(x, wy);
            }
            ctx.stroke();
        }

        ctx.restore();
    }

    function drawWaterFlow(waterTop) {
        ctx.save();
        ctx.globalAlpha = 0.06;

        // Горизонтальные полосы течения
        for (let i = 0; i < 8; i++) {
            const y = waterTop + H * 0.05 + i * H * 0.06;
            const speed = (i % 2 === 0 ? 1 : -0.6);
            const offset = (time * speed * 0.03) % W;
            const w = W * 0.15 + i * 10;

            ctx.fillStyle = `rgba(200,230,255,${0.06 + i * 0.005})`;
            ctx.beginPath();
            ctx.ellipse(W * 0.5 + offset, y, w, H * 0.005, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    function drawFishRipples() {
        ctx.save();

        fishRipples.forEach((rip, idx) => {
            rip.r += rip.speed;
            rip.alpha -= 0.008;

            if (rip.alpha <= 0) {
                fishRipples.splice(idx, 1);
                return;
            }

            ctx.strokeStyle = rgba('#FFFFFF', rip.alpha);
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
            ctx.stroke();

            if (rip.r > 5) {
                ctx.strokeStyle = rgba('#FFFFFF', rip.alpha * 0.5);
                ctx.beginPath();
                ctx.arc(rip.x, rip.y, rip.r * 0.6, 0, Math.PI * 2);
                ctx.stroke();
            }
        });

        ctx.restore();
    }

    // ═══════════════════════════════════════════════════════════
    // 5. УДОЧКА (ПАЛКА, КАТУШКА, ЛЕСКА, ПОПЛАВОК)
    // ═══════════════════════════════════════════════════════════

    function drawFishingRod() {
        const rodBaseX = W * 0.62;
        const rodBaseY = H * 0.58;
        const rodTipX = W * 0.32;
        const rodTipY = H * 0.56;

        // Палка (с изгибом)
        drawRodBlank(rodBaseX, rodBaseY, rodTipX, rodTipY);

        // Катушка
        drawReel(rodBaseX - W * 0.01, rodBaseY + H * 0.01);

        // Леска с физикой
        const lineEndX = W * 0.305;
        const lineEndY = H * 0.72;
        drawFishingLine(rodTipX, rodTipY, lineEndX, lineEndY);

        // Поплавок
        drawBobber(lineEndX, lineEndY);
    }

    function drawRodBlank(baseX, baseY, tipX, tipY) {
        ctx.save();

        // Тень палки
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(baseX + 2, baseY + 3);
        ctx.quadraticCurveTo(
            (baseX + tipX) / 2 + 3,
            (baseY + tipY) / 2 - H * 0.04 + 3,
            tipX + 2, tipY + 3
        );
        ctx.stroke();

        // Основная палка — градиент от тёмного к светлому
        const rodGrad = ctx.createLinearGradient(baseX, baseY, tipX, tipY);
        rodGrad.addColorStop(0, '#3E2723');
        rodGrad.addColorStop(0.3, '#5D4037');
        rodGrad.addColorStop(0.6, '#795548');
        rodGrad.addColorStop(1, '#8D6E63');
        ctx.strokeStyle = rodGrad;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.quadraticCurveTo(
            (baseX + tipX) / 2,
            (baseY + tipY) / 2 - H * 0.04,
            tipX, tipY
        );
        ctx.stroke();

        // Верхний слой — блик
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(baseX, baseY - 1);
        ctx.quadraticCurveTo(
            (baseX + tipX) / 2,
            (baseY + tipY) / 2 - H * 0.04 - 1,
            tipX, tipY - 1
        );
        ctx.stroke();

        // Кольца (пропускные)
        ctx.strokeStyle = '#9E9E9E';
        ctx.lineWidth = 2;
        for (let i = 1; i <= 5; i++) {
            const t = i / 6;
            const rx = baseX + (tipX - baseX) * t;
            const ry = baseY + (tipY - baseY) * t - H * 0.04 * 4 * t * (1 - t);
            ctx.beginPath();
            ctx.arc(rx, ry, 2, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }

    function drawReel(cx, cy) {
        ctx.save();

        // Тело катушки
        const reelGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, W * 0.012);
        reelGrad.addColorStop(0, '#757575');
        reelGrad.addColorStop(0.5, '#616161');
        reelGrad.addColorStop(1, '#424242');
        ctx.fillStyle = reelGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, W * 0.012, 0, Math.PI * 2);
        ctx.fill();

        // Ободок
        ctx.strokeStyle = '#9E9E9E';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, W * 0.012, 0, Math.PI * 2);
        ctx.stroke();

        // Ручка
        ctx.strokeStyle = '#5D4037';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx + W * 0.012, cy);
        ctx.lineTo(cx + W * 0.018, cy - H * 0.01);
        ctx.stroke();

        // Блик
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(cx - 2, cy - 2, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    function drawFishingLine(tipX, tipY, bobberX, bobberY) {
        ctx.save();
        ctx.strokeStyle = 'rgba(200,200,200,0.5)';
        ctx.lineWidth = 0.8;

        // Catmull-Rom сплайн для реалистичной провисающей лески
        const segments = 30;
        const cp1x = tipX + (bobberX - tipX) * 0.3;
        const cp1y = tipY + H * 0.02;
        const cp2x = tipX + (bobberX - tipX) * 0.7;
        const cp2y = bobberY - H * 0.01;

        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, bobberX, bobberY);
        ctx.stroke();

        // Под水ная часть лески
        ctx.strokeStyle = 'rgba(180,200,220,0.3)';
        ctx.beginPath();
        ctx.moveTo(bobberX, bobberY);
        ctx.lineTo(bobberX - W * 0.02, bobberY + H * 0.08);
        ctx.stroke();

        ctx.restore();
    }

    function drawBobber(cx, cy) {
        ctx.save();

        const bobH = H * 0.015;
        const bobW = W * 0.004;

        // Покачивание поплавка
        const sway = Math.sin(time * 0.003) * 2;
        const bounce = Math.sin(time * 0.005) * 1.5;
        const bx = cx + sway;
        const by = cy + bounce;

        // Отражение поплавка в воде
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#C62828';
        ctx.beginPath();
        ctx.ellipse(bx, by + bobH * 1.5, bobW * 0.8, bobH * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;

        // Нижняя часть (белая)
        ctx.fillStyle = '#FAFAFA';
        ctx.beginPath();
        ctx.ellipse(bx, by + bobH * 0.3, bobW, bobH * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Верхняя часть (красная)
        const bobGrad = ctx.createLinearGradient(bx - bobW, 0, bx + bobW, 0);
        bobGrad.addColorStop(0, '#C62828');
        bobGrad.addColorStop(0.5, '#E53935');
        bobGrad.addColorStop(1, '#C62828');
        ctx.fillStyle = bobGrad;
        ctx.beginPath();
        ctx.ellipse(bx, by - bobH * 0.2, bobW, bobH * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Антенна поплавка
        ctx.strokeStyle = '#F5F5F5';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx, by - bobH * 0.7);
        ctx.lineTo(bx, by - bobH * 1.8);
        ctx.stroke();

        // Блик
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.ellipse(bx - 1, by - bobH * 0.3, 1, bobH * 0.2, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Маленькие волны вокруг поплавка
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 3; i++) {
            const wr = bobW * (2 + i * 0.8) + Math.sin(time * 0.002 + i) * 2;
            ctx.beginPath();
            ctx.ellipse(bx, by + bobH * 0.5, wr, 1, 0, 0, Math.PI);
            ctx.stroke();
        }

        ctx.restore();
    }

    // ═══════════════════════════════════════════════════════════
    // 6. АТМОСФЕРНЫЕ ЭФФЕКТЫ
    // ═══════════════════════════════════════════════════════════

    function drawAtmosphericEffects() {
        drawMist();
        drawSunGlare();
        drawFallingLeaves();
    }

    // ─── Туман над водой ───
    function drawMist() {
        ctx.save();

        mistParticles.forEach(m => {
            m.x += m.vx;
            m.y += m.vy;
            m.life -= 0.0005;

            if (m.life <= 0 || m.x < -m.size || m.x > W + m.size) {
                m.x = -m.size + Math.random() * W * 0.3;
                m.y = H * 0.55 + Math.random() * H * 0.08;
                m.life = 1;
            }

            const alpha = m.life * m.alpha;
            const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.size);
            grad.addColorStop(0, `rgba(220,230,240,${alpha})`);
            grad.addColorStop(0.5, `rgba(200,215,230,${alpha * 0.5})`);
            grad.addColorStop(1, `rgba(180,200,220,0)`);

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(m.x, m.y, m.size, m.size * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }

    function spawnMist() {
        mistParticles.push({
            x: Math.random() * W,
            y: H * 0.56 + Math.random() * H * 0.06,
            vx: 0.1 + Math.random() * 0.3,
            vy: Math.sin(Math.random() * Math.PI) * 0.02,
            size: W * 0.05 + Math.random() * W * 0.08,
            alpha: 0.06 + Math.random() * 0.08,
            life: Math.random()
        });
    }

    // ─── Световые блики на воде ───
    function drawSunGlare() {
        ctx.save();

        const sunX = W * 0.78;
        const sunY = H * 0.12;

        // Вертикальная полоса блика от солнца
        ctx.globalAlpha = 0.06 + Math.sin(time * 0.002) * 0.02;
        const glareGrad = ctx.createLinearGradient(sunX, H * 0.55, sunX, H);
        glareGrad.addColorStop(0, 'rgba(255,250,200,0.15)');
        glareGrad.addColorStop(0.3, 'rgba(255,240,180,0.08)');
        glareGrad.addColorStop(1, 'rgba(255,230,150,0)');
        ctx.fillStyle = glareGrad;
        ctx.fillRect(sunX - W * 0.08, H * 0.55, W * 0.16, H * 0.45);

        // Отдельные искры бликов
        for (let i = 0; i < 5; i++) {
            const sparkleX = sunX + Math.sin(time * 0.003 + i * 1.7) * W * 0.06;
            const sparkleY = H * 0.65 + i * H * 0.04 + Math.sin(time * 0.004 + i) * 3;
            const sparkleAlpha = 0.1 + Math.sin(time * 0.005 + i * 2.3) * 0.08;

            ctx.fillStyle = `rgba(255,255,230,${sparkleAlpha})`;
            ctx.beginPath();
            ctx.arc(sparkleX, sparkleY, 1.5 + Math.sin(time * 0.006 + i) * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    // ─── Падающие листья ───
    function drawFallingLeaves() {
        ctx.save();

        leaves.forEach((leaf, idx) => {
            leaf.x += leaf.vx + Math.sin(time * 0.002 + leaf.phase) * 0.3;
            leaf.y += leaf.vy;
            leaf.rot += leaf.rotSpeed;
            leaf.life -= 0.001;

            if (leaf.life <= 0 || leaf.y > H) {
                leaves[idx] = createLeaf();
                return;
            }

            ctx.save();
            ctx.translate(leaf.x, leaf.y);
            ctx.rotate(leaf.rot);
            ctx.globalAlpha = leaf.life * 0.7;

            // Форма листа
            ctx.fillStyle = leaf.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, leaf.size, leaf.size * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Жилка
            ctx.strokeStyle = rgba(leaf.color, 0.5);
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(-leaf.size, 0);
            ctx.lineTo(leaf.size, 0);
            ctx.stroke();

            ctx.restore();
        });

        ctx.restore();
    }

    function createLeaf() {
        const colors = ['#8D6E63', '#A1887F', '#BCAAA4', '#C8B090', '#7CB342', '#8BC34A', '#FFB74D', '#FF8A65'];
        return {
            x: Math.random() * W * 0.8,
            y: -10 - Math.random() * H * 0.2,
            vx: -0.2 + Math.random() * 0.1,
            vy: 0.3 + Math.random() * 0.4,
            rot: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.02,
            size: 3 + Math.random() * 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            phase: Math.random() * Math.PI * 2,
            life: 0.8 + Math.random() * 0.2
        };
    }

    function spawnLeaf() {
        leaves.push(createLeaf());
    }

    // ═══════════════════════════════════════════════════════════
    // 7. БЕРЕГОВАЯ ЛИНИЯ
    // ═══════════════════════════════════════════════════════════

    function drawShoreline() {
        const shoreY = H * 0.6;

        ctx.save();

        // Земля / берег
        const shoreGrad = ctx.createLinearGradient(0, shoreY - H * 0.02, 0, shoreY + H * 0.02);
        shoreGrad.addColorStop(0, '#5D4037');
        shoreGrad.addColorStop(0.3, '#6D4C41');
        shoreGrad.addColorStop(0.7, '#4E342E');
        shoreGrad.addColorStop(1, '#3E2723');
        ctx.fillStyle = shoreGrad;

        ctx.beginPath();
        ctx.moveTo(0, shoreY + H * 0.01);
        for (let x = 0; x <= W; x += 5) {
            const y = shoreY + Math.sin(x * 0.02) * 2 + Math.sin(x * 0.05) * 1;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(W, shoreY + H * 0.03);
        ctx.lineTo(0, shoreY + H * 0.03);
        ctx.closePath();
        ctx.fill();

        // Трава на берегу
        drawShoreGrass(shoreY);

        // Камни
        drawRocks(shoreY);

        ctx.restore();
    }

    function drawShoreGrass(shoreY) {
        ctx.save();

        const grassColors = ['#4CAF50', '#388E3C', '#2E7D32', '#558B2F'];

        for (let i = 0; i < 60; i++) {
            const x = (i / 60) * W + Math.sin(i * 2.1) * 5;
            const h = 5 + Math.abs(Math.sin(i * 1.3)) * 8;
            const sway = Math.sin(time * 0.002 + i * 0.5) * 2;
            const color = grassColors[i % grassColors.length];

            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.moveTo(x, shoreY);
            ctx.quadraticCurveTo(x + sway, shoreY - h * 0.6, x + sway * 1.2, shoreY - h);
            ctx.stroke();
        }

        ctx.restore();
    }

    function drawRocks(shoreY) {
        ctx.save();

        const rocks = [
            { x: W * 0.3, y: shoreY + 3, rx: 6, ry: 4 },
            { x: W * 0.31, y: shoreY + 2, rx: 4, ry: 3 },
            { x: W * 0.55, y: shoreY + 4, rx: 5, ry: 3 },
            { x: W * 0.78, y: shoreY + 2, rx: 7, ry: 4 },
            { x: W * 0.82, y: shoreY + 3, rx: 4, ry: 3 },
        ];

        rocks.forEach(r => {
            const rockGrad = ctx.createRadialGradient(r.x - 1, r.y - 1, 1, r.x, r.y, r.rx);
            rockGrad.addColorStop(0, '#9E9E9E');
            rockGrad.addColorStop(0.6, '#757575');
            rockGrad.addColorStop(1, '#616161');
            ctx.fillStyle = rockGrad;
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.ellipse(r.x, r.y, r.rx, r.ry, 0, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }

    // ═══════════════════════════════════════════════════════════
    // ГЛАВНЫЙ ЦИКЛ ОТРИСОВКИ
    // ═══════════════════════════════════════════════════════════

    function render() {
        ctx.clearRect(0, 0, W, H);

        drawSky();
        drawMountains();
        drawTrees();
        drawShoreline();
        drawWater();
        drawFishingRod();
        drawAtmosphericEffects();
    }

    function animate() {
        time++;
        render();
        animFrame = requestAnimationFrame(animate);
    }

    function destroy() {
        cancelAnimationFrame(animFrame);
        window.removeEventListener('resize', resize);
    }

    // ═══════════════════════════════════════════════════════════
    // ЭКСПОРТ API
    // ═══════════════════════════════════════════════════════════

    window.RiverFishingGame = {
        init,
        destroy,
        resize,
        // Публичные функции рендеринга
        drawSky,
        drawMountains,
        drawTrees,
        drawWater,
        drawFishingRod,
        drawAtmosphericEffects,
        drawShoreline,
        // Утилиты
        setTimeOfDay: (v) => { timeOfDay = v; },
        addRipple: (x, y) => {
            fishRipples.push({ x, y, r: 0, maxR: 30 + Math.random() * 20, alpha: 0.6, speed: 0.8 });
        },
    };

})();
