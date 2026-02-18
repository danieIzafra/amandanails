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

    // --- 3. Lógica de Agendamento e Envio (EmailJS) ---
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

            // !!! DADOS DO EMAILJS (Do seu arquivo original) !!!
            const serviceID = 'service_8h57c56';   
            const templateID = 'template_zpokwji'; 

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

    // --- 4. Smooth Scroll (Rolagem Suave) ---
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

    console.log("%c Amanda Nails - Sistema Atualizado ", "background: #E7B8B1; color: #fff; padding: 5px; border-radius: 5px;");
});