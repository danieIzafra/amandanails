document.addEventListener('DOMContentLoaded', () => {
    
    // === CONFIGURAÇÃO DO CLOUDINARY ===
    const CLOUD_NAME = 'dadysjhqful'; 
    const TAGS_MAP = {
        'criativas': 'criativas',
        'minimalistas': 'minimalistas',
        'noivas': 'noivas'
    };

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

    // --- 2. Menu Mobile ---
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

    // --- 3. Carregar Galeria do Cloudinary ---
    async function loadGallery() {
        const galleryGrid = document.getElementById('gallery-grid');
        const categories = Object.keys(TAGS_MAP);
        let allImages = [];

        try {
            for (const category of categories) {
                const url = `https://res.cloudinary.com/${CLOUD_NAME}/image/list/${TAGS_MAP[category]}.json`;
                
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        const data = await response.json();
                        const resources = data.resources.map(img => ({ ...img, category }));
                        allImages = [...allImages, ...resources];
                    } else {
                        console.warn(`Nenhuma imagem encontrada para a tag: ${category}`);
                    }
                } catch (err) {
                    console.log(`Erro ao buscar tag ${category}:`, err);
                }
            }

            galleryGrid.innerHTML = '';

            if (allImages.length === 0) {
                galleryGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Nenhuma imagem encontrada no momento.</p>';
                return;
            }

            allImages.forEach(img => {
                const imgSrc = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,w_600/${img.public_id}.${img.format}`;
                
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('gallery-item', 'glass-card', 'animate');
                itemDiv.setAttribute('data-category', img.category);
                
                itemDiv.innerHTML = `
                    <img src="${imgSrc}" alt="Unha ${img.category}" loading="lazy">
                    <div class="overlay"><i class="fas fa-plus"></i></div>
                `;
                
                galleryGrid.appendChild(itemDiv);
            });

            initFilters();

        } catch (error) {
            console.error('Erro fatal na galeria:', error);
            galleryGrid.innerHTML = '<p>Erro ao carregar galeria.</p>';
        }
    }

    // --- 4. Lógica de Filtro ---
    function initFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const galleryItems = document.querySelectorAll('.gallery-item');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                galleryItems.forEach(item => {
                    const itemCategory = item.getAttribute('data-category');

                    if (filterValue === 'all' || filterValue === itemCategory) {
                        item.classList.remove('hide');
                        item.classList.remove('animate');
                        void item.offsetWidth;
                        item.classList.add('animate');
                    } else {
                        item.classList.add('hide');
                    }
                });
            });
        });
    }

    // --- 5. Executa o carregamento ---
    loadGallery();


    // --- 6. Lógica de Agendamento e Envio (ATUALIZADO PARA EMAILJS) ---
    const timeGrid = document.getElementById('time-grid');
    const bookingConfirmation = document.getElementById('booking-confirmation');
    const selectedTimeDisplay = document.getElementById('selected-time');
    const bookingForm = document.getElementById('booking-form');
    let selectedTimeValue = null; // Guarda o horário clicado

    if (timeGrid) {
        const startHour = 9;
        const endHour = 19;

        for (let hour = startHour; hour <= endHour; hour++) {
            const button = document.createElement('div');
            const timeString = `${hour.toString().padStart(2, '0')}:00`;
            
            button.innerText = timeString;
            button.classList.add('time-slot');
            
            button.addEventListener('click', function() {
                // Visual: remove anterior e marca novo
                document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
                this.classList.add('selected');
                
                // Lógica: salva o horário
                selectedTimeValue = timeString;

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

    // Escuta o envio do formulário
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Não recarrega a página

            // Validação
            if (!selectedTimeValue) {
                alert("Por favor, selecione um horário no calendário acima.");
                return;
            }

            const btnSubmit = bookingForm.querySelector('button[type="submit"]');
            const originalText = btnSubmit.innerText;
            btnSubmit.innerText = 'Enviando...';
            btnSubmit.disabled = true;

            // Prepara os dados. As chaves devem bater com seu template no EmailJS.
            const templateParams = {
                nome: document.getElementById('name').value,
                telefone: document.getElementById('phone').value,
                servico: document.getElementById('service').value,
                horario: selectedTimeValue
            };

            // !!! PREENCHA AQUI SEUS DADOS DO EMAILJS !!!
            const serviceID = 'service_8h57c56';   // Ex: service_z3k9...
            const templateID = 'template_zpokwji'; // Ex: template_x4y...

            emailjs.send(serviceID, templateID, templateParams)
                .then(() => {
                    // Sucesso
                    btnSubmit.innerText = 'Agendado!';
                    alert('Agendamento enviado com sucesso! Aguarde nossa confirmação no WhatsApp.');
                    
                    // Reset total
                    bookingForm.reset();
                    document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
                    bookingConfirmation.classList.add('hidden');
                    selectedTimeValue = null;
                    
                    setTimeout(() => {
                        btnSubmit.disabled = false;
                        btnSubmit.innerText = originalText;
                    }, 3000);

                }, (err) => {
                    // Erro
                    btnSubmit.innerText = 'Erro';
                    btnSubmit.disabled = false;
                    console.error('Erro EmailJS:', err);
                    alert('Houve um erro ao enviar. Tente novamente ou chame no WhatsApp.');
                });
        });
    }

    // --- 7. Smooth Scroll ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                if (window.innerWidth <= 768 && navLinks) {
                    navLinks.style.display = 'none';
                }
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    console.log("%c Amanda Nails - Sistema Conectado ", "background: #E7B8B1; color: #fff; padding: 5px; border-radius: 5px;");
});