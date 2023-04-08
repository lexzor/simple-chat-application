//Adaugam un event listener pentru a prelua elementele dupa ce pagina a fost incarcata
window.addEventListener("DOMContentLoaded", function () {
  //Ne conectam la serverul WebSocket folosind portul 8081
  let ws = new WebSocket("ws://localhost:8081")

  //Preluam elementele dupa id
  const chatContainer = document.getElementById("chatContainer")
  const sendMsgBtn = document.getElementById("sendMsgBtn")
  const userMessage = document.getElementById("textarea")
  const connectBtn = document.getElementById("connectBtn")
  const inputName = document.getElementById("inputName")

  //O variabila unde verificam daca utilizatorul a fost conectat la chat.
  let connected = false

  /*
  Adaugam un event listener pentru eventul de click pentru butonul de conectare.
  Trimitem un obiect sub forma de string. Acesta contine tipul mesajului si mesajul.
  Tipurile de mesaj trimise de catre client sunt:
    "registUser" -> inregistram userul in chat cu un nume.
    "sendChatMessage" -> trimitem un mesaj care sa fie afisat in chat.
  
  Tipurile de mesaj trimise de catre server sunt:
    "receiveChatMessage" -> afisam un mesaj clientului trimis de catre un utilizator.
    "receiveServerMessage" -> afisam un mesaj clientului trimis de catre server.
  */
  connectBtn.addEventListener("click", () => {
    //Verificam daca utilizatorul este deja conectat.
    if (connected == true) {
      return
    }

    let username = inputName.value

    //Verificam daca utilizatorul si-a pus un nume, in cazul in care nu ii vom pune numele "Guest"
    if (username.length === 0) {
      username = "Guest"
    }

    //Trimitem un mesaj de tip "registerUser" catre server.
    ws.send(
      JSON.stringify({
        type: "registerUser",
        username: username,
      })
    )

    connected = true
  })

  //Adaugam un event pentru conexiunea la server pentru a putea primii mesajele trimise de acesta.
  //Preluam doar proprietatea "data" a obiectului care reprezinta mesajul in sine.
  ws.addEventListener("message", ({ data }) => {
    const msg = JSON.parse(data)

    switch (msg.type) {
      case "receiveServerMessage": {
        //Nu punem nimic pentru parametrul username pentru a stii daca mesajul este trimis de catre server
        messageHandler(msg.message, msg.date)
        break
      }

      case "receiveChatMessage": {
        messageHandler(msg.message, msg.date, msg.username)
        break
      }
    }
  })

  //Adaugam listenerul pentru butonul de send
  sendMsgBtn.addEventListener("click", () => {
    //Verificam daca utiliztorul este conectat. Daca nu este afisam un mesaj in consola si oprim continuarea functiei
    if (connected == false) {
      console.error("Nu te-ai conectat la chat!")
      return
    }

    //Trimitem mesajul catre server pentru a fi afisat si altor utilizatori.
    ws.send(
      JSON.stringify({
        type: "sendChatMessage",
        message: userMessage.value,
        username: inputName.value,
      })
    )

    //Stergem continutul elemntului unde utilizatorul scrie mesajul
    //si folosim functia "focus" pentru a imita o aplicatie de chat.
    userMessage.value = ""
    userMessage.focus()
  })
})

//Functia care manevreaza mesajele.
//Initiem parametrul 'username' ca fiind undefined in cazul in care mesajul este trimis de catre server.
const messageHandler = (msg, server_time, server_username = undefined) => {
  //Incepem creearea elementelor care vor fi adaugate containerului mesajelor de chat

  //Creeam elementul care este containerul mesajului.
  const div = document.createElement("div")
  div.classList.add("chatMessage")

  //Cream elementul care contine ora.
  const client_time = document.createElement("p")
  client_time.innerHTML = server_time
  client_time.classList.add("msgDate")

  //Adaugam elementul care contine ora elementului care este containerul mesajului.
  div.appendChild(client_time)

  //Verificam daca mesajul este trimis de catre server
  if (server_username === undefined) {
    //Cream elementul care contine mesajul serverului.
    const message = document.createElement("p")
    message.innerHTML = msg
    message.classList.add("serverMsg")
    div.appendChild(message)
  } else {
    //Cream elementul care contine numele utilizatorului.
    const username = document.createElement("p")
    username.innerHTML = server_username
    username.classList.add("msgUserName")
    div.appendChild(username)

    //Cream elementul care contine mesajul utilizatorului.
    const message = document.createElement("p")
    message.innerHTML = msg
    message.classList.add("msgMessage")
    div.appendChild(message)
  }

  //Adaugam containerul mesajului in containerul chatului
  chatContainer.append(div)
}
