// ===== BANNER - THREE.JS COM SOL NA EXTREMIDADE =====
(function initThree() {
    const container = document.getElementById('canvasContainer');
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070c);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 2, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // --- SOL (posicionado na extremidade direita e acima) ---
    const sunGroup = new THREE.Group();

    // Corpo do sol
    const sunGeom = new THREE.SphereGeometry(2.2, 64, 64);
    const sunMat = new THREE.MeshStandardMaterial({
        color: 0xffaa00,
        emissive: 0xff6600,
        emissiveIntensity: 1.0,
        roughness: 0.2,
        metalness: 0.1,
    });
    const sun = new THREE.Mesh(sunGeom, sunMat);
    sunGroup.add(sun);

    // Glow do sol (camada externa)
    const glowGeom = new THREE.SphereGeometry(2.8, 48, 48);
    const glowMat = new THREE.MeshBasicMaterial({
        color: 0xff8800,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
    });
    const glow = new THREE.Mesh(glowGeom, glowMat);
    sunGroup.add(glow);

    // Glow mais externo
    const glowGeom2 = new THREE.SphereGeometry(3.8, 32, 32);
    const glowMat2 = new THREE.MeshBasicMaterial({
        color: 0xff5500,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
    });
    const glow2 = new THREE.Mesh(glowGeom2, glowMat2);
    sunGroup.add(glow2);

    // Posiciona o sol na EXTREMIDADE DIREITA e ACIMA
    sunGroup.position.set(6.0, 3.5, -10);
    sunGroup.scale.set(1.2, 1.2, 1.2);
    scene.add(sunGroup);

    // --- LUZES ---
    const ambientLight = new THREE.AmbientLight(0x303060, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffaa55, 1.5, 35);
    sunLight.position.copy(sunGroup.position);
    scene.add(sunLight);

    const backLight = new THREE.DirectionalLight(0x4488ff, 0.3);
    backLight.position.set(0, 2, 6);
    scene.add(backLight);

    // --- RENDER LOOP ---
    function render() {
        const elapsed = performance.now() / 1000;
        const pulse = 1 + Math.sin(elapsed * 0.5) * 0.02;
        sunGroup.scale.set(1.2 * pulse, 1.2 * pulse, 1.2 * pulse);

        glow.material.opacity = 0.12 + Math.sin(elapsed * 0.7) * 0.05;
        glow2.material.opacity = 0.06 + Math.sin(elapsed * 0.5 + 1) * 0.03;

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    // --- RESIZE ---
    function onResize() {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    // --- EXPORTA REFERÊNCIAS PARA O PARALLAX ---
    window.__sunGroup = sunGroup;
    window.__scene = scene;
    window.__camera = camera;
})();

// ===== PARALLAX DO SOL =====
document.addEventListener('DOMContentLoaded', function () {
    const sunGroup = window.__sunGroup;
    if (!sunGroup) return;

    const initialY = 3.5;
    const initialX = 6.0;
    const initialZ = -10;

    function updateSunPosition() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;

        const progress = Math.min(scrollY / documentHeight, 1);

        const targetY = initialY - (progress * 7.5);
        const targetX = initialX - (progress * 1.5);
        const targetZ = initialZ + (progress * 2.5);

        sunGroup.position.y = targetY;
        sunGroup.position.x = targetX;
        sunGroup.position.z = targetZ;

        const sunLight = window.__scene?.children.find(c => c.isPointLight);
        if (sunLight) {
            sunLight.position.copy(sunGroup.position);
        }
    }

    window.addEventListener('scroll', updateSunPosition, { passive: true });
    window.addEventListener('resize', updateSunPosition, { passive: true });
    setTimeout(updateSunPosition, 100);
});

// ===== HEADER FIXO E SCROLL SUAVE =====
document.addEventListener('DOMContentLoaded', function () {
    // Header fixo - controle de estado
    const header = document.querySelector('.header-fixed');
    if (header) {
        function checkHeaderPosition() {
            const scrollY = window.scrollY;
            if (scrollY < 100) {
                header.classList.add('at-top');
            } else {
                header.classList.remove('at-top');
            }
        }
        window.addEventListener('scroll', checkHeaderPosition, { passive: true });
        window.addEventListener('load', checkHeaderPosition);
        setTimeout(checkHeaderPosition, 100);
    }

    // ===== SCROLL SUAVE PARA OS LINKS =====
    const navLinks = document.querySelectorAll('.main-nav .nav-link, .mobile-nav .nav-link, .btn[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    const headerHeight = document.querySelector('.header-fixed')?.offsetHeight || 80;
                    const topbarHeight = document.querySelector('.topbar')?.offsetHeight || 0;
                    const offset = headerHeight + topbarHeight + 20;

                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
});

// ===== CALCULADORA =====
document.addEventListener('DOMContentLoaded', function () {
    const gastoInput = document.getElementById('gastoInput');
    const calcularBtn = document.getElementById('calcularBtn');
    const economiaValor = document.getElementById('economiaValor');
    const badges = document.querySelectorAll('[data-gasto]');

    badges.forEach(badge => {
        badge.addEventListener('click', function () {
            const valor = this.getAttribute('data-gasto');
            gastoInput.value = valor;
            calcularEconomia();
        });
    });

    function calcularEconomia() {
        let gasto = parseFloat(gastoInput.value);
        if (isNaN(gasto) || gasto < 0) gasto = 0;

        const fator = 0.85;
        const economia = gasto * fator;

        // Formata no padrão brasileiro: R$ 1.234,56
        economiaValor.textContent = `R$ ${formatarMoedaBrasileira(economia)}`;

        const infoSpans = document.querySelectorAll('.economia-box .d-flex span');
        if (infoSpans.length >= 2) {
            infoSpans[0].innerHTML = `<i class="bi bi-arrow-up-circle text-success me-1"></i> Economia: 85%`;
            const payback = gasto > 0 ? Math.round(8000 / (gasto * 0.85)) : 0;
            infoSpans[1].innerHTML = `<i class="bi bi-clock-history me-1"></i> Payback: ~${payback || 0} anos`;
        }
    }

    // Função auxiliar para formatar moeda no padrão brasileiro
    function formatarMoedaBrasileira(valor) {
        // Separa a parte inteira da decimal
        let partes = valor.toFixed(2).split('.');
        let parteInteira = partes[0];
        let parteDecimal = partes[1];

        // Adiciona pontos de milhar na parte inteira
        parteInteira = parteInteira.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        // Retorna com vírgula como separador decimal
        return parteInteira + ',' + parteDecimal;
    }

    calcularBtn.addEventListener('click', calcularEconomia);
    gastoInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') calcularEconomia();
    });

    setTimeout(calcularEconomia, 100);

    // ===== GSAP =====
    gsap.registerPlugin(ScrollTrigger);

    gsap.from('.banner-content h1', {
        opacity: 0,
        y: 40,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.2,
    });

    gsap.from('.calculator-card', {
        opacity: 0,
        x: 30,
        duration: 1,
        ease: 'power3.out',
        delay: 0.5,
    });
});

// ===== FINANCIAMENTO - SIMULADOR =====
document.addEventListener('DOMContentLoaded', function () {
    const valorSistema = document.getElementById('valorSistema');
    const entradaSistema = document.getElementById('entradaSistema');
    const prazoSistema = document.getElementById('prazoSistema');
    const simularBtn = document.getElementById('simularFinanciamento');
    const parcelaValor = document.getElementById('parcelaValor');
    const totalFinanciado = document.getElementById('totalFinanciado');

    if (!valorSistema || !simularBtn) return;

    function formatCurrency(value) {
        return 'R$ ' + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    function calcularFinanciamento() {
        const valor = parseFloat(valorSistema.value) || 0;
        const entrada = parseFloat(entradaSistema.value) || 0;
        const prazo = parseInt(prazoSistema.value) || 60;
        const taxa = 0.015;

        const valorFinanciado = valor - entrada;

        if (valorFinanciado <= 0) {
            parcelaValor.textContent = 'R$ 0,00';
            totalFinanciado.textContent = 'R$ 0,00';
            return;
        }

        const i = taxa;
        const n = prazo;
        const pv = valorFinanciado;

        const pmt = pv * i * Math.pow(1 + i, n) / (Math.pow(1 + i, n) - 1);
        const total = pmt * n;

        parcelaValor.textContent = formatCurrency(pmt);
        totalFinanciado.textContent = formatCurrency(total);
    }

    simularBtn.addEventListener('click', calcularFinanciamento);

    [valorSistema, entradaSistema].forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') calcularFinanciamento();
        });
    });

    prazoSistema.addEventListener('change', calcularFinanciamento);

    setTimeout(calcularFinanciamento, 100);

    // ===== FORMULÁRIO - VALIDAÇÃO BÁSICA =====
    const form = document.getElementById('formFinanciamento');
    if (form) {
        const inputs = form.querySelectorAll('input[required]');

        inputs.forEach(input => {
            input.addEventListener('blur', function () {
                if (this.value.trim() === '') {
                    this.classList.add('is-invalid');
                } else {
                    this.classList.remove('is-invalid');
                }
            });

            input.addEventListener('input', function () {
                if (this.value.trim() !== '') {
                    this.classList.remove('is-invalid');
                }
            });
        });
    }

    // ===== GSAP ANIMAÇÕES =====
    gsap.from('.metric-card', {
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.1,
        scrollTrigger: {
            trigger: '.metric-card',
            start: 'top 90%',
        },
    });

    gsap.from('.vantagem-card', {
        opacity: 0,
        y: 40,
        duration: 0.7,
        stagger: 0.12,
        scrollTrigger: {
            trigger: '.vantagem-card',
            start: 'top 85%',
        },
    });

    gsap.from('.passo-card', {
        opacity: 0,
        y: 40,
        duration: 0.7,
        stagger: 0.12,
        scrollTrigger: {
            trigger: '.passo-card',
            start: 'top 85%',
        },
    });

    gsap.from('.formulario-box', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.2,
        scrollTrigger: {
            trigger: '.formulario-box',
            start: 'top 90%',
        },
    });
});

// ===== DEPOIMENTOS - CARROSSEL =====
document.addEventListener('DOMContentLoaded', function () {
    const track = document.getElementById('depoimentosTrack');
    const prevBtn = document.getElementById('depoimentosPrev');
    const nextBtn = document.getElementById('depoimentosNext');
    const indicators = document.querySelectorAll('.indicator');
    const items = document.querySelectorAll('.depoimento-item');

    if (!track || !items.length) return;

    let currentIndex = 0;
    let visibleItems = 3;
    let totalItems = items.length;

    function getVisibleItems() {
        if (window.innerWidth < 576) return 1;
        if (window.innerWidth < 992) return 2;
        return 3;
    }

    function updateCarousel(animate = true) {
        visibleItems = getVisibleItems();
        const itemWidth = items[0].offsetWidth + 24;
        const maxIndex = Math.max(0, totalItems - visibleItems);

        if (currentIndex > maxIndex) {
            currentIndex = maxIndex;
        }
        if (currentIndex < 0) {
            currentIndex = 0;
        }

        const translateX = currentIndex * itemWidth;
        track.style.transition = animate ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none';
        track.style.transform = `translateX(-${translateX}px)`;

        const totalIndicators = Math.ceil(totalItems / visibleItems);
        const activeIndicator = Math.floor(currentIndex / visibleItems);

        indicators.forEach((indicator, index) => {
            if (index < totalIndicators) {
                indicator.style.display = 'block';
                indicator.classList.toggle('active', index === activeIndicator);
            } else {
                indicator.style.display = 'none';
            }
        });

        if (prevBtn) prevBtn.disabled = currentIndex === 0;
        if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;
    }

    function goTo(index) {
        const maxIndex = Math.max(0, totalItems - getVisibleItems());
        currentIndex = Math.min(Math.max(0, index), maxIndex);
        updateCarousel(true);
    }

    function next() {
        const maxIndex = Math.max(0, totalItems - getVisibleItems());
        if (currentIndex < maxIndex) {
            goTo(currentIndex + 1);
        }
    }

    function prev() {
        if (currentIndex > 0) {
            goTo(currentIndex - 1);
        }
    }

    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);

    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', function () {
            const visible = getVisibleItems();
            const targetIndex = index * visible;
            goTo(targetIndex);
        });
    });

    let resizeTimeout;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const visible = getVisibleItems();
            const currentItemIndex = currentIndex * visible;
            const newVisible = getVisibleItems();
            visibleItems = newVisible;
            currentIndex = Math.floor(currentItemIndex / visibleItems);
            updateCarousel(false);
            setTimeout(() => {
                updateCarousel(true);
            }, 50);
        }, 150);
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') prev();
        if (e.key === 'ArrowRight') next();
    });

    let touchStartX = 0;
    let touchEndX = 0;
    const carousel = document.querySelector('.depoimentos-wrapper');

    if (carousel) {
        carousel.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        carousel.addEventListener('touchend', function (e) {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) next();
                else prev();
            }
        }, { passive: true });
    }

    setTimeout(() => {
        updateCarousel(false);
        setTimeout(() => {
            updateCarousel(true);
        }, 100);
    }, 100);

    window.addEventListener('load', function () {
        setTimeout(() => updateCarousel(true), 200);
    });
});

// Exemplo de como ler o data-bs-delay no script.js
document.querySelectorAll('[data-bs-delay]').forEach(el => {
    const delay = parseFloat(el.getAttribute('data-bs-delay')) || 0;
    // Aplicar animação com o delay
    gsap.from(el, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: delay,
        scrollTrigger: {
            trigger: el,
            start: 'top 90%',
        }
    });
});

// ===== ANIMAÇÃO DE CONTAGEM (COUNT) COM FORMATAÇÃO =====
document.addEventListener('DOMContentLoaded', function () {

    function animateCount(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 1500;
        const startTime = performance.now();

        function updateCount(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing ease-out
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentCount = Math.floor(easedProgress * target);

            // Formata o número com separadores de milhar
            element.textContent = currentCount.toLocaleString('pt-BR');

            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                element.textContent = target.toLocaleString('pt-BR');
            }
        }

        requestAnimationFrame(updateCount);
    }

    const countElements = document.querySelectorAll('.count-number');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                if (!element.classList.contains('counted')) {
                    element.classList.add('counted');
                    // Reseta o texto antes de iniciar
                    element.textContent = '0';
                    animateCount(element);
                }
            }
        });
    }, {
        threshold: 0.5,
        rootMargin: '0px'
    });

    countElements.forEach(el => {
        observer.observe(el);
    });
});

// ===== FECHAR MENU MOBILE AO CLICAR EM UM LINK =====
document.addEventListener('DOMContentLoaded', function () {
    const mobileMenuLinks = document.querySelectorAll('#mobileMenu .nav-link');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuButton = document.querySelector('[data-bs-target="#mobileMenu"]');

    if (mobileMenuLinks.length && mobileMenu && menuButton) {
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', function () {
                // Fecha o menu mobile
                const bsCollapse = bootstrap.Collapse.getInstance(mobileMenu);
                if (bsCollapse) {
                    bsCollapse.hide();
                }

                // Remove a classe 'collapsed' do botão hambúrguer
                menuButton.classList.add('collapsed');
                menuButton.setAttribute('aria-expanded', 'false');
            });
        });
    }
});