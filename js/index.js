// TO-DO:
// Organizar código-fonte

const diaSemana = document.getElementById("dia-semana");
const diaMesAno = document.getElementById("dia-mes-ano");
const horaMinSeg = document.getElementById("hora-min-seg");

const btnBaterPonto = document.getElementById("btn-bater-ponto");
btnBaterPonto.addEventListener("click", register);

const dialogPonto = document.getElementById("dialog-ponto");

const btnDialogFechar = document.getElementById("btn-dialog-fechar");
btnDialogFechar.addEventListener("click", () => {
    dialogPonto.close();
});

const nextRegister = {
    "entrada": "intervalo",
    "intervalo": "volta-intervalo", 
    "volta-intervalo": "saida", 
    "saida": "entrada"
}

let registerLocalStorage = getRegisterLocalStorage();

const dialogData = document.getElementById("dialog-data");
const dialogHora = document.getElementById("dialog-hora");

const divAlertaRegistroPonto = document.getElementById("alerta-registro-ponto");

diaSemana.textContent = getWeekDay();
diaMesAno.textContent = getCurrentDate();


async function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition((position) => {
            let userLocation = {
                "latitude": position.coords.latitude,
                "longitude": position.coords.longitude
            }
            resolve(userLocation);
        },
        (error) => {
            reject("Erro ao recuperar a localização " + error);
        });
    });
}

// TO-DO:
// Problema: os 5 segundos continuam contando
const btnCloseAlertRegister = document.getElementById("alerta-registro-ponto-fechar");
btnCloseAlertRegister.addEventListener("click", () => {
    divAlertaRegistroPonto.classList.remove("show");
    divAlertaRegistroPonto.classList.add("hidden");
});

const btnDialogBaterPonto = document.getElementById("btn-dialog-bater-ponto");

btnDialogBaterPonto.addEventListener("click", async () => {
    const typeRegister = document.getElementById("tipos-ponto");
    const seletedDate = document.getElementById("date-select").value;
    const horaInput = document.getElementById("hora-input");
    let lastTypeRegister = localStorage.getItem("lastTypeRegister");

    console.log(lastTypeRegister);

    let userCurrentPosition = await getCurrentPosition();

    const hora = (horaInput && horaInput.style.display !== "none" && horaInput.value) ? horaInput.value : getCurrentHour(); 

    let ponto = {
        "data": seletedDate,
        "hora": hora,
        "localizacao": userCurrentPosition,
        "id": 1,
        "tipo": typeRegister.value
    }

    console.log(ponto);

    saveRegisterLocalStorage(ponto);

    localStorage.setItem("lastDateRegister", ponto.data);
    localStorage.setItem("lastTimeRegister", ponto.hora);

    dialogPonto.close();

    divAlertaRegistroPonto.classList.remove("hidden");
    divAlertaRegistroPonto.classList.add("show");

    setTimeout(() => {
        divAlertaRegistroPonto.classList.remove("show");
        divAlertaRegistroPonto.classList.add("hidden");
    }, 5000);

});

function saveRegisterLocalStorage(register) {
    const typeRegister = document.getElementById("tipos-ponto");
    registerLocalStorage.push(register); // Array
    localStorage.setItem("register", JSON.stringify(registerLocalStorage));
    localStorage.setItem("lastTypeRegister", typeRegister.value);
} 

function getRegisterLocalStorage() {
    let registers = localStorage.getItem("register");

    if(!registers) {
        return [];
    }

    return JSON.parse(registers); 
}

// TO-DO:
// alterar o nome da função
function register() {
    setupDateSelector();
    dialogHora.textContent = "Hora: " + getCurrentHour();
    
    let lastTypeRegister = localStorage.getItem("lastTypeRegister");

    if(lastTypeRegister) {
        const typeRegister   = document.getElementById("tipos-ponto");
        typeRegister.value   = nextRegister[lastTypeRegister];
        let lastRegisterText = "Último registro: " + localStorage.getItem("lastDateRegister") + " - " + localStorage.getItem("lastTimeRegister") + " | " + localStorage.getItem("lastTypeRegister")
        document.getElementById("dialog-last-register").textContent = lastRegisterText;
    }

    // TO-DO
    // Como "matar" o intervalo a cada vez que o dialog é fechado?
    setInterval(() => {
        dialogHora.textContent = "Hora: " + getCurrentHour();
    }, 1000);

    dialogPonto.showModal();
}

// Configura o seletor de datas no modal
function setupDateSelector() {
    const dialogData = document.getElementById("dialog-data");
    dialogData.innerHTML = ""; // Limpa conteúdo existente

    // Criar elemento select
    const dateSelect = document.createElement("select");
    dateSelect.id = "date-select";

    // Gerar opções de datas anteriores
    const currentDate = new Date();
    const maxDaysBack = 30; // Quantidade de dias anteriores a serem mostrados

    for (let i = 0; i <= maxDaysBack; i++) {
        const pastDate = new Date(currentDate);
        pastDate.setDate(pastDate.getDate() - i);

        const option = document.createElement("option");
        option.value = formatDate(pastDate);
        option.textContent = formatDate(pastDate);
        dateSelect.appendChild(option);
    }

    // Adicionar o select ao dialog
    dialogData.appendChild(dateSelect);
    // Adicionar evento para mudar a hora dependendo da data selecionada
    dateSelect.addEventListener("change", handleDateChange);
}

// Função que lida com a mudança de data
function handleDateChange(event) {
    const seletedDate = document.getElementById("date-select").value; // Data escolhida pelo usuário
    const currentDate = new Date();
    const selectedDateObj = new Date(seletedDate.split("/").reverse().join("-")); // Converte a data para o formato Date

    const dialogHora = document.getElementById("dialog-hora");
    const horaInput = document.getElementById("hora-input");
    const horaLabel = document.getElementById("hora-label");
    const horaContainer = document.getElementById("hora-container");

 if (selectedDateObj < currentDate) {
        // Remover o <p> e mostrar a label e o input
        dialogHora.style.display = "none"; // Esconde o <p> com a hora
        horaLabel.style.display = "block"; // Exibe a label
        horaInput.style.display = "block"; // Exibe o campo de hora

        horaInput.value = ""; // Limpar valor de hora
        horaInput.disabled = false; // Habilitar o campo de hora para o usuário inserir
    } else {
        // Se a data for a atual ou futura, mantemos a tag <p> com a hora atual
        dialogHora.style.display = "block"; // Exibe o <p> com a hora
        horaLabel.style.display = "none"; // Esconde a label
        horaInput.style.display = "none"; // Esconde o campo de hora

        // Exibimos a hora atual
        dialogHora.textContent = "Hora: " + getCurrentHour();
    }
}

// Função auxiliar para formatar datas no estilo DD/MM/AAAA
function formatDate(date) {
    return (
        String(date.getDate()).padStart(2, "0") +
        "/" +
        String(date.getMonth() + 1).padStart(2, "0") +
        "/" +
        date.getFullYear()
    );
}

function getWeekDay() {
    const date = new Date();
    let days = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    return days[date.getDay()];
}

function getCurrentHour() {
    const date = new Date();
    return String(date.getHours()).padStart(2, '0') + ":" + String(date.getMinutes()).padStart(2, '0') + ":" + String(date.getSeconds()).padStart(2, '0');
}

function getCurrentDate() {
    const date = new Date();
    return String(date.getDate()).padStart(2, '0') + "/" + String((date.getMonth() + 1)).padStart(2, '0') + "/" + String(date.getFullYear()).padStart(2, '0');
}

function printCurrentHour() {
    horaMinSeg.textContent = getCurrentHour();
}

printCurrentHour();
setInterval(printCurrentHour, 1000);