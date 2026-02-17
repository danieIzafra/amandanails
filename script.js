document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Lógica do Tema (Dark/Light Mode) ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const icon = themeToggleBtn.querySelector('i');

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
        updateIcon(savedTheme);
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateIcon(newTheme);
    });

    function updateIcon(theme) {
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    // --- 2. Menu Mobile (Hambúrguer) ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            const isFlex = navLinks.style.display === 'flex';
            navLinks.style.display = isFlex ? 'none' : 'flex';
            
            if (!isFlex) {
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '70px';
                navLinks.style.right = '20px';
                navLinks.style.background = 'var(--glass-bg)';
                navLinks.style.padding = '1rem';
                navLinks.style.borderRadius = '10px';
                navLinks.style.border = '1px solid var(--glass-border)';
            }
        });
    }

    // --- 3. Lógica de Filtro do Catálogo (Novo) ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove classe ativa de todos e adiciona no selecionado
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                galleryItems.forEach(item => {
                    const itemCategory = item.getAttribute('data-category');

                    // Lógica de exibição com animação
                    if (filterValue === 'all' || filterValue === itemCategory) {
                        item.classList.remove('hide');
                        // Reset da animação para disparar novamente
                        item.classList.remove('animate');
                        void item.offsetWidth; // Trigger reflow para reiniciar CSS animation
                        item.classList.add('animate');
                    } else {
                        item.classList.add('hide');
                    }
                });
            });
        });
    }

    // --- 4. Lógica de Agendamento (Time Grid) ---
    const timeGrid = document.getElementById('time-grid');
    const bookingConfirmation = document.getElementById('booking-confirmation');
    const selectedTimeDisplay = document.getElementById('selected-time');

    if (timeGrid) {
        const startHour = 9;
        const endHour = 19;

        for (let hour = startHour; hour <= endHour; hour++) {
            const button = document.createElement('div');
            const timeString = `${hour.toString().padStart(2, '0')}:00`;
            
            button.innerText = timeString;
            button.classList.add('time-slot');
            button.setAttribute('role', 'button');
            button.setAttribute('aria-label', `Selecionar horário das ${timeString}`);
            
            button.addEventListener('click', function() {
                document.querySelectorAll('.time-slot').forEach(slot => {
                    slot.classList.remove('selected');
                });
                
                this.classList.add('selected');
                
                if (bookingConfirmation) {
                    bookingConfirmation.classList.remove('hidden');
                    bookingConfirmation.style.opacity = 0;
                    bookingConfirmation.style.display = 'block';
                    setTimeout(() => {
                        bookingConfirmation.style.opacity = 1;
                        bookingConfirmation.style.transition = 'opacity 0.5s';
                    }, 50);
                }

                if (selectedTimeDisplay) {
                    selectedTimeDisplay.innerText = timeString;
                }
            });

            timeGrid.appendChild(button);
        }
    }

    // --- 5. Smooth Scroll (Rolagem Suave) ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Fecha o menu mobile se estiver aberto ao clicar em um link
                if (window.innerWidth <= 768 && navLinks) {
                    navLinks.style.display = 'none';
                }

                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // --- 6. Log de Boas-vindas ---
    console.log("%c Amanda Nails - Estúdio Premium ", "background: #E7B8B1; color: #fff; padding: 5px; border-radius: 5px; font-weight: bold;");
    console.log("Catálogo dinâmico e sistema de agendamento prontos.");
});