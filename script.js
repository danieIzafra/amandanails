document.addEventListener('DOMContentLoaded', () => {
    
    // ======================================================
    // 1. TEMA (DARK/LIGHT MODE) E MENU MOBILE (VISUAL)
    // ======================================================
    
    // --- Lógica do Tema ---
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

    // --- Menu Mobile ---
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

    // ======================================================
    // 2. SISTEMA DE AGENDAMENTO INTELIGENTE (DATAS + FIREBASE)
    // ======================================================

    const timeGrid = document.getElementById('time-grid');
    const dateContainer = document.getElementById('date-scroll');
    const bookingForm = document.getElementById('booking-form');
    const bookingConfirmation = document.getElementById('booking-confirmation');
    const selectedTimeDisplay = document.getElementById('selected-time');

    // Variáveis para guardar a escolha do usuário
    let selectedDateValue = null; // Formato: YYYY-MM-DD
    let selectedDateVisual = null; // Formato: DD/MM
    let selectedTimeValue = null; // Formato: HH:00

    // --- FUNÇÃO A: Gerar o Carrossel de Datas ---
    function renderizarDatas() {
        if (!dateContainer) return;

        dateContainer.innerHTML = ''; // Limpa antes de gerar
        const hoje = new Date();
        let diasGerados = 0;
        
        // Gera os próximos dias até completar 10 opções válidas
        for (let i = 0; diasGerados < 10; i++) {
            const dataFutura = new Date(hoje);
            dataFutura.setDate(hoje.getDate() + i);

            // Se for Domingo (0), pula
            if (dataFutura.getDay() === 0) continue;

            // Formata data para o Banco (YYYY-MM-DD)
            const ano = dataFutura.getFullYear();
            const mes = (dataFutura.getMonth() + 1).toString().padStart(2, '0');
            const dia = dataFutura.getDate().toString().padStart(2, '0');
            const dataIso = `${ano}-${mes}-${dia}`;

            // Formata data para o Usuário ver (Dia da semana + DD/MMM)
            const diaSemana = dataFutura.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
            const dataCurta = dataFutura.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });

            // Cria o elemento HTML do dia
            const card = document.createElement('div');
            card.classList.add('date-card');
            
            // Seleciona o primeiro dia automaticamente
            if (diasGerados === 0 && !selectedDateValue) {
                card.classList.add('selected');
                selectedDateValue = dataIso;
                selectedDateVisual = dataCurta;
            }

            card.innerHTML = `<span>${diaSemana}</span><strong>${dataCurta}</strong>`;

            // Clique no dia
            card.addEventListener('click', () => {
                // Remove seleção dos outros
                document.querySelectorAll('.date-card').forEach(d => d.classList.remove('selected'));
                card.classList.add('selected');
                
                // Atualiza variáveis
                selectedDateValue = dataIso;
                selectedDateVisual = dataCurta;
                selectedTimeValue = null; // Reseta o horário ao trocar de dia
                
                // Esconde confirmação antiga e recarrega agenda
                if(bookingConfirmation) bookingConfirmation.classList.add('hidden');
                carregarAgendaDoDia();
            });

            dateContainer.appendChild(card);
            diasGerados++;
        }
    }

    // --- FUNÇÃO B: Buscar Horários no Firebase ---
    async function carregarAgendaDoDia() {
        if (!timeGrid || !selectedDateValue) return;

        // Mostra "Carregando..."
        timeGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; opacity: 0.7;">Verificando disponibilidade...</p>';

        try {
            const { collection, getDocs, query, where } = window.firestoreTools;
            const db = window.db;

            // BUSCA FILTRADA: Traz apenas agendamentos da data selecionada
            const q = query(
                collection(db, "agendamentos"), 
                where("data", "==", selectedDateValue)
            );

            const querySnapshot = await getDocs(q);
            const horariosOcupados = [];
            
            querySnapshot.forEach((doc) => {
                horariosOcupados.push(doc.data().horario);
            });

            // Renderiza os botões de horário
            timeGrid.innerHTML = '';
            const startHour = 9;
            const endHour = 19;

            for (let hour = startHour; hour <= endHour; hour++) {
                const timeString = `${hour.toString().padStart(2, '0')}:00`;
                const button = document.createElement('div');
                
                if (horariosOcupados.includes(timeString)) {
                    // OCUPADO
                    button.innerText = "Ocupado";
                    button.classList.add('time-slot', 'ocupado');
                } else {
                    // LIVRE
                    button.innerText = timeString;
                    button.classList.add('time-slot');
                    
                    button.addEventListener('click', function() {
                        document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
                        this.classList.add('selected');
                        
                        selectedTimeValue = timeString;

                        if (bookingConfirmation) {
                            bookingConfirmation.classList.remove('hidden');
                            selectedTimeDisplay.innerText = `${selectedDateVisual} às ${timeString}`;
                        }
                    });
                }
                timeGrid.appendChild(button);
            }

        } catch (error) {
            console.error("Erro ao carregar agenda:", error);
            timeGrid.innerHTML = '<p style="color: red;">Erro ao conectar com a agenda.</p>';
        }
    }

    // --- FUNÇÃO C: Enviar Formulário (Email + Firebase) ---
    if (bookingForm) {
        bookingForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            if (!selectedTimeValue || !selectedDateValue) {
                alert("Por favor, selecione um DIA e um HORÁRIO.");
                return;
            }

            const btnSubmit = bookingForm.querySelector('button[type="submit"]');
            const originalText = btnSubmit.innerText;
            btnSubmit.innerText = 'Processando...';
            btnSubmit.disabled = true;

            const dadosAgendamento = {
                nome: document.getElementById('name').value,
                telefone: document.getElementById('phone').value,
                servico: document.getElementById('service').value,
                data: selectedDateValue,       // Salva: 2026-02-18
                data_visual: selectedDateVisual, // Salva: 18 Fev
                horario: selectedTimeValue,
                criado_em: new Date().toISOString()
            };

            try {
                // 1. Envia E-mail (EmailJS)
                // Dica: No seu template do EmailJS, use {{data_visual}} para mostrar o dia bonito
                await emailjs.send('service_8h57c56', 'template_zpokwji', dadosAgendamento);

                // 2. Salva no Firebase
                const { collection, addDoc } = window.firestoreTools;
                await addDoc(collection(window.db, "agendamentos"), dadosAgendamento);

                // Sucesso
                alert(`Agendamento confirmado para ${selectedDateVisual} às ${selectedTimeValue}!`);
                
                // Reset visual
                bookingForm.reset();
                bookingConfirmation.classList.add('hidden');
                selectedTimeValue = null;
                document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
                
                // Atualiza a agenda para bloquear o horário que acabou de ser pego
                carregarAgendaDoDia();

            } catch (err) {
                console.error('Erro no envio:', err);
                alert('Houve um erro ao agendar. Tente novamente.');
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.innerText = originalText;
            }
        });
    }

    // ======================================================
    // 3. INICIALIZAÇÃO E UTILITÁRIOS
    // ======================================================

    // Inicia o sistema
    renderizarDatas();     // Cria os dias
    setTimeout(carregarAgendaDoDia, 500); // Carrega horários do primeiro dia

    // Smooth Scroll
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

    console.log("%c Amanda Nails - Sistema Online ", "background: #E7B8B1; color: #fff; padding: 5px; border-radius: 5px;");
});