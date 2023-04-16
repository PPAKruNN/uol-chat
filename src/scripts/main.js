axios.defaults.headers.common['Authorization'] = 'ZWLdksLAVDIu2hZSh9r0blMY';

let username;
let target = "Todos";
let messageType = "message"

let chatMessages = [];

const endpoints = {
    "join": "https://mock-api.driven.com.br/api/vm/uol/participants",
    "keepalive": "https://mock-api.driven.com.br/api/vm/uol/status",
    "messages": "https://mock-api.driven.com.br/api/vm/uol/messages",
}

async function startup() {
    while(true) {
        username = prompt("Qual o seu nome de usuário?")

        if(username) break;
    }

    const promisse = axios.post(endpoints.join, {name: username});

    promisse.then( (res) => {
        console.log("Deu bom!: " + res.status)
        setInterval( keepAlive, 5000);
        reloadMessages();
        setInterval( reloadMessages, 3000)
        setInterval( renderUsers(), 10000);
    }, (err) => {
        console.log("Deu ruim!: " + err.response.data)
        startup()  
    })
    
}

function keepAlive() {
    const promisse = axios.post(endpoints.keepalive, {name: username});
    promisse.then( (res) => {
        console.log("KeepAlive ok!: " + res.status);
    })
}

function getChatMessages() {
    const promisse = axios.get(endpoints.messages);
    promisse.then( (res) => {
        chatMessages = res.data;
    })

    return promisse;
}

function submitMessage() {
   const el = document.querySelector(".messageInput");
   const typedMessage = el.value;
   el.value = "";

   sendMessage(typedMessage);
}

function sendMessage(messageTextToSend) {

    const messageObj = {
        "from": username,
        "to": target,
        "text": messageTextToSend,
        "type": messageType,
    }

    const promisse = axios.post(endpoints.messages, messageObj)
    promisse.then( (res) => {
        console.log("Mensagem enviada?" + res);
        reloadMessages();
    })
}

function createMessageElement(messageData) {

    const el = document.createElement("li")
    el.dataset.test = "message"
    let connective = "";

    if (messageData.type == "message")          connective = "para"
    if (messageData.type == "private_message")  connective = "reservadamente para"

    if(messageData.type != "message") {
        el.classList.add(messageData.type); 
    }

    const msg = `
    <span>
        <span class="timestamp">
            (${messageData.time})
        </span>
        <b>${messageData.from}</b> ${connective} ${messageData.type == "status" ? "" : "<b>" + messageData.to + "</b>"} ${messageData.text}
    </span>
    `
    el.innerHTML = msg;
    return el;
}

function createContactElement(name) {

    const el = document.createElement("div")
    
    const contact = `
    <div data-test="${name == "Todos" ? "all" : "participant"}" onclick="selectOption(this)" class="option">
        <img class="option-icon" src="src/users.png" alt="Todos">
        <span class="optionTitle">${name}</span>
        <img data-test="check" class="disabled option-check" src="src/check.png" alt="check">
    </div>
    `
    el.innerHTML = contact
    return el.firstElementChild;
}

function renderUsers() {
    const optionBox = document.querySelector("#contato");
    const h1 = document.createElement("h1")
    h1.innerHTML = "Escolha um contato para enviar mensagem:"
    optionBox.innerHTML = "";

    optionBox.append(h1); // Recriando h1
    optionBox.append(createContactElement("Todos")); // Recriando opção de "todos".

    const promisse = getParticipants();

    promisse.then( (res) => {
        console.log(res.data);

        res.data.forEach( (msg) => {
            if(msg.name == username) return;
            const contact = createContactElement(msg.name);
            optionBox.append(contact)
        })
    })
}

function renderMessages() {
    const msgbox = document.querySelector(".messages-box");
    msgbox.innerHTML = ""; // Limpar caixa antes de colocar novas mensagens.
    let lastMessage;

    chatMessages.forEach(message => {
        if(message.type == "private_message" && message.to != username && message.to != "Todos" && message.from != username) return;

        const currMessage = createMessageElement(message);
        msgbox.appendChild(currMessage);
        lastMessage = currMessage;
    });

    lastMessage.scrollIntoView()
}

function reloadMessages() {
    const promisse = getChatMessages();
    promisse.then( () => {
        console.log("Reload messages!!")
        renderMessages();
    })
}

function toggleSideBar() {
    document.querySelector(".side-bar").classList.toggle("disabled")
    document.querySelector(".side-bar-black").classList.toggle("disabled")

    renderUsers();
}

// Adicionando ENTER como forma de enviar a mensagem! ;D
const el = document.querySelector(".messageInput");
el.onkeydown = (e) => {
    if(e.keyCode == 13) {
        submitMessage();
    }
}

function getParticipants() 
{
    const promisse = axios.get(endpoints.join);
    promisse.then( (res) => {
        console.log(res);
    }, (error) => {
        console.log("Failed to receive participants!")
    })

    return promisse;
}

// Option-box

function selectOption(option) {
    const el = document.querySelector("#contato")
    const parent_id = option.parentElement.id;
    const optionName = option.children[1].innerHTML;
    //Alterando target da mensagem
    if(parent_id == "contato")
    {
        target = optionName;

        if(target == "Todos") 
        {
            selectOption(document.querySelector("#visibility").children[1])
        }
    }
    
    if(parent_id == "visibility")
    {
        if(target == "Todos" && optionName == "Reservadamente") return;
        messageType = (optionName == "Público") ? "message" : "private_message";
    }
    
    console.log("MessageType : " + messageType+"; " + "target: " + target)
    document.querySelector(".input-extra-info").innerHTML = `Enviando ${messageType == "message" ? "" : "reservadamente" } para ${target}`
    
    // Removendo os selects
    const checks = document.querySelectorAll(`#${parent_id} .option-check`)
    checks.forEach(check => {
        check.classList.add("disabled");
    });
    // Adicionando select icon
    option.children[2].classList.remove("disabled");
}


startup()