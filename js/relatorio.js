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

        const dayOfWeek = getDayOfWeek(dateString);

        if (registrosDoDia.length > 0) {
            const pontosHTML = registrosDoDia
                .map(reg => `
                    <p>
                        ${reg.tipo.charAt(0).toUpperCase() + reg.tipo.slice(1)}: ${reg.hora}
                        ${reg.dataAlterada ? '<span class="alterado">(Alterado)</span>' : ''}
                    </p>`)
                .join("");

            divRegistro.innerHTML = `
                <p><strong>${dateString} (${dayOfWeek})</strong></p>
                ${pontosHTML}
            `;
        } else {
            divRegistro.innerHTML = `
                <p><strong>${dateString} (${dayOfWeek})</strong></p>
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
    modalBody.innerHTML = ''; // Limpa o conteúdo do modal

    // Campo para justificar a falta
    const justifyContainer = document.createElement('div');
    justifyContainer.classList.add('justify-container');

    const justifyLabel = document.createElement('label');
    justifyLabel.textContent = "Justificativa:";
    justifyLabel.setAttribute('for', 'justificativaInput');

    const justifyInput = document.createElement('textarea');
    justifyInput.id = 'justificativaInput';
    justifyInput.rows = 3;
    justifyInput.placeholder = "Digite aqui sua justificativa (opcional).";

    justifyContainer.appendChild(justifyLabel);
    justifyContainer.appendChild(justifyInput);

    // Botão para upload de arquivos
    const uploadContainer = document.createElement('div');
    uploadContainer.classList.add('upload-container');

    const uploadLabel = document.createElement('label');
    uploadLabel.textContent = "Anexar documento:";
    uploadLabel.setAttribute('for', 'uploadInput');

    const uploadInput = document.createElement('input');
    uploadInput.type = 'file';
    uploadInput.id = 'uploadInput';

    uploadContainer.appendChild(uploadLabel);
    uploadContainer.appendChild(uploadInput);

    // Adiciona a justificativa e o upload ao modal
    modalBody.appendChild(justifyContainer);
    modalBody.appendChild(uploadContainer);

    // Adiciona os registros (se houver)
    if (registros.length > 0) {
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
                alert('O registro de ponto não pode ser excluído.');
            });

            container.appendChild(input);
            container.appendChild(deleteButton);
            modalBody.appendChild(container);
        });
    } else {
        modalBody.innerHTML += `<p>Nenhum registro para esta data.</p>`;
    }

    // Adiciona o botão de salvar alterações
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Salvar Alterações';
    saveButton.classList.add('save-button');
    saveButton.addEventListener('click', saveChanges); // Salvar as mudanças
    modalBody.appendChild(saveButton);

    // Vincula o modal com a data atual
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
    const justificativaInput = document.getElementById('justificativaInput');
    const uploadInput = document.getElementById('uploadInput');

    // Recupera os registros armazenados no localStorage
    const registers = JSON.parse(localStorage.getItem("register")) || [];
    
    // Atualiza ou cria registros para a data do modal
    let registrosDoDia = registers.filter(registro => registro.data === date);
    
    // Limpa os registros antigos
    registrosDoDia = [];

    // Recupera a justificativa
    const justificativa = justificativaInput.value.trim();

    // Recupera o arquivo (se houver)
    let fileData = null;
    if (uploadInput.files.length > 0) {
        const file = uploadInput.files[0];
        const reader = new FileReader();
        reader.onloadend = function() {
            // Armazenamos o arquivo como base64
            fileData = reader.result;

            // Atualiza os registros com a justificativa e arquivo (depois de ler o arquivo)
            updateRegistersWithFile(fileData, justificativa);
        };
        reader.readAsDataURL(file); // Lê o arquivo como base64
    } else {
        // Se não houver arquivo, apenas salvar a justificativa
        updateRegistersWithFile(null, justificativa);
    }

    // Função que faz o update nos registros
    function updateRegistersWithFile(fileData, justificativa) {
        inputs.forEach(input => {
            const [tipo, ...rest] = input.value.split(':');
            const hora = rest.join(':').trim(); // Junta o restante como hora
            if (tipo && hora) {
                registrosDoDia.push({
                    tipo: tipo.toLowerCase(),
                    hora: formatTime(hora),
                    data: date,
                    justificativa: justificativa, // Salva a justificativa
                    arquivo: fileData, // Salva os dados do arquivo (base64 ou null)
                    dataAlterada: true // Marca como alterado
                });
            }
        });

        // Atualiza os registros no localStorage
        const updatedRegisters = [...registers.filter(registro => registro.data !== date), ...registrosDoDia];
        localStorage.setItem("register", JSON.stringify(updatedRegisters));

        // Feedback para o usuário
        alert('Alterações salvas com sucesso!');
        closeModal();
        renderList(); // Re-renderiza a lista com os dados atualizados
    }
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
