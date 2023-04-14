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
    })
    
    promisse.catch( (err) => {
        console.log("Deu ruim!: " + err)
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
    let connective = "";

    if(messageData.type == "message") {
        connective = "para"
    }
    else {
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

function renderMessages() {
    const msgbox = document.querySelector(".messages-box");
    msgbox.innerHTML = ""; // Limpar caixa antes de colocar novas mensagens.

    chatMessages.forEach(message => {
        const currMessage = createMessageElement(message);
        msgbox.appendChild(currMessage);
    });
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
}

// Adicionando ENTER como forma de enviar a mensagem! ;D
const el = document.querySelector(".messageInput");
el.onkeydown = (e) => {
    if(e.keyCode == 13) {
        submitMessage();
    }
}

startup()