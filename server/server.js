// Folosim libraria ws pentru crearea serverului WebSocket pe portul 8081.
const WebSocket = require("ws")
const wss = new WebSocket.Server({ port: 8081 })

//Creem un array unde salvam un obiect care contine numele si conexiunea utilizatorilor.
let connections = []

//Creem un array unde salvam un obiect care contine mesajele din chat, de cine au fost trimise si la ce ora.
let chatMessages = [{}]

//Ascultam eventul de conectare a unui client la server si preluam conexiunea acestuia.
wss.on("connection", function (client_connection) {
  console.log("New user connected!")

  //Ascultam eventul de trimitere de mesaj pentru o anumita conexiune a unui utilizator.
  client_connection.on("message", (data) => {
    //Convertim datele primite din biti in string pentru a putea citii mesajul si apoi intr-un obiect.
    //Verificam tipul mesajului.
    const received_msg = JSON.parse(data.toString())

    switch (received_msg.type) {
      case "registerUser": {
        //Adaugam conexiunea clientului in arrayul unde sunt salvate toate conexiunile.
        connections.push(client_connection)

        //Afisam in consola serverului ca jucatorul s-a conectat
        console.log(
          `User ${received_msg.username} has been registered to the chat!`
        )

        //Luam ora si formatam mesajul care va fi afisat de catre server
        const date = getHour()
        const messageToSend = `Utilizatorul ${received_msg.username} s-a conectat la chat!`

        //Trimitem ultimele 25 de mesaje catre clientul care tocmai s-a conectat.
        //Trimitem 25 pentru ca numarul mesajelor poate fi foarte mare si ar dura prea mult.
        for (let i = 0; i < 25; i++) {
          if (i > chatMessages.length) {
            break
          }
          client_connection.send(JSON.stringify(chatMessages[i]))
        }

        //Adaugam mesajul de conectare cu tipul "receiveServerMessage" pentru a stii atunci cand il afisam
        //ca este un mesaj de la server.
        chatMessages.push({
          type: "receiveServerMessage",
          date: date,
          message: messageToSend,
        })

        //Afisam in chat pentru fiecare conexiune ca un utilizator nou s-a conectat.
        //Am adaugat mesajul in arrayul care contine toate mesajele deci il luam de acolo.
        connections.forEach((connection) => {
          connection.send(JSON.stringify(chatMessages[chatMessages.length - 1]))
        })

        break
      }

      case "sendChatMessage": {
        received_msg.type = "receiveChatMessage"
        received_msg["date"] = getHour()
        chatMessages.push(received_msg)

        connections.forEach((connection) => {
          connection.send(JSON.stringify(chatMessages[chatMessages.length - 1]))
        })
      }
    }
  })

  //Ascultam eventul de deconectare al unui utilizator si ii scoatem conexiunea in array pentru a nu trimite mesaje conexiunilor care nu mai exista.
  client_connection.on("close", () => {
    console.log("An user has been disconnected!")
    connections = connections.filter(
      (connection) => connection != client_connection
    )
  })
})

//Functia pentru care returneaza un string continand ora
const getHour = () => {
  const date = new Date()
  return `${date.getHours() < 10 ? "0" : ""}${date.getHours()}:${
    date.getMinutes() < 10 ? "0" : ""
  }${date.getMinutes()}`
}
