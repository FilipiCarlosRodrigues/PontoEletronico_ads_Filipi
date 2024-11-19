function renderList() {
    const dataInicial = document.getElementById('dataInicial')?.value;
    const dataFinal = document.getElementById('dataFinal')?.value;

    if (!dataInicial || !dataFinal) {
        alert('Por favor, selecione as datas.');
        return;
    }

    const inicio = new Date(dataInicial);
    const fim = new Date(dataFinal);

    if (inicio > fim) {
        alert('A data inicial não pode ser maior que a data final.');
        return;
    }

    const storedRegisters = localStorage.getItem("register");
    const registers = storedRegisters ? JSON.parse(storedRegisters) : [];

    const containerRegisters = document.getElementById("registros-relatorio");
    containerRegisters.innerHTML = '';

    const registrosPorData = registers.reduce((acc, registro) => {
        const dataFormatada = formatDateToISO(registro.data);
        if (!acc[dataFormatada]) acc[dataFormatada] = [];
        acc[dataFormatada].push({
            ...registro,
            hora: formatTime(registro.hora),
        });
        return acc;
    }, {});

    for (
        let currentDate = new Date(inicio);
        currentDate <= fim;
        currentDate.setDate(currentDate.getDate() + 1)
    ) {
        const dateString = currentDate.toISOString().split('T')[0];
        const registrosDoDia = registrosPorData[dateString] || [];

        const divRegistro = document.createElement("div");
        divRegistro.classList.add("registro");

        if (registrosDoDia.length > 0) {
            const pontosHTML = registrosDoDia
                .map(reg => `<p>${reg.tipo.charAt(0).toUpperCase() + reg.tipo.slice(1)}: ${reg.hora}</p>`)
                .join("");

            divRegistro.innerHTML = `
                <p><strong>${dateString} (${getDayOfWeek(dateString)})</strong></p>
                ${pontosHTML}
            `;
        } else {
            divRegistro.innerHTML = `
                <p><strong>${dateString} (${getDayOfWeek(dateString)})</strong></p>
                <p>Sem registro de ponto</p>
            `;
        }

        // Adiciona o botão "Justificar" para todas as datas
        const buttonJustificar = document.createElement("button");
        buttonJustificar.textContent = "Justificar";
        buttonJustificar.addEventListener('click', () => {
            openModal(dateString, registrosDoDia);
        });
        divRegistro.appendChild(buttonJustificar);

        containerRegisters.appendChild(divRegistro);
    }
}


// Função para formatar horas no padrão HH:mm
function formatTime(time) {
    // Verifica se o horário é válido
    if (!time) return '00:00'; // Valor padrão caso o campo esteja vazio ou nulo

    // Caso o horário já esteja no formato HH:mm, retorna direto
    if (/^\d{2}:\d{2}$/.test(time)) return time;

    // Caso contrário, tenta separar as horas e minutos
    const [hour, minute] = time.split(':').map(Number);

    // Verifica se hour ou minute são NaN, caso sejam, atribui valores padrão
    const formattedHour = isNaN(hour) ? 0 : hour;
    const formattedMinute = isNaN(minute) ? 0 : minute;

    // Garantir que ambos tenham 2 dígitos
    return `${formattedHour.toString().padStart(2, '0')}:${formattedMinute.toString().padStart(2, '0')}`;
}


function openModal(date, registros) {
    const modal = document.getElementById('modal');
    const modalDate = document.getElementById('modalDate');
    const modalBody = document.getElementById('modalBody');

    modalDate.textContent = `Data: ${date}`;
    modalBody.innerHTML = '';

    registros.forEach((registro, index) => {
        const container = document.createElement('div');
        container.classList.add('registro-item');

        const input = document.createElement('input');
        input.type = 'text';
        input.value = `${registro.tipo}: ${registro.hora}`;
        input.dataset.index = index;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Excluir';
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', () => {
            container.remove();
            registros.splice(index, 1); // Remove o registro do array local
        });

        container.appendChild(input);
        container.appendChild(deleteButton);
        modalBody.appendChild(container);
    });

    modal.dataset.date = date;
    modal.style.display = 'flex';
}


function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

function saveChanges() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    const date = modal.dataset.date;
    const inputs = modalBody.querySelectorAll('input');

    const registers = JSON.parse(localStorage.getItem("register")) || [];
    const registrosPorData = registers.reduce((acc, registro) => {
        const dataFormatada = formatDateToISO(registro.data);
        if (!acc[dataFormatada]) acc[dataFormatada] = [];
        acc[dataFormatada].push(registro);
        return acc;
    }, {});

    const registrosDoDia = registrosPorData[date] || [];

    // Atualiza ou exclui registros com base nos inputs restantes no modal
    registrosDoDia.length = 0; // Limpa os registros antigos do dia
    inputs.forEach(input => {
        const [tipo, ...rest] = input.value.split(':');
        const hora = rest.join(':').trim(); // Junta o restante
        registrosDoDia.push({
            tipo: tipo.toLowerCase(),
            hora: formatTime(hora),
            data: date // Garante que o campo "data" está presente
        });
    });

    // Atualiza os registros no localStorage
    const updatedRegisters = Object.entries(registrosPorData).flatMap(([data, registros]) => {
        return registros.map(registro => ({
            ...registro,
            data
        }));
    });

    localStorage.setItem("register", JSON.stringify(updatedRegisters));

    alert('Alterações salvas com sucesso!');
    closeModal();
    renderList();
}



function formatDateToISO(date) {
    if (!date) return '';

    if (date.includes('/')) {
        const [day, month, year] = date.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    return date;
}

function getDayOfWeek(date) {
    const daysOfWeek = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    const d = new Date(date);
    return daysOfWeek[d.getDay()];
}
