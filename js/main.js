// Función para generar aleatoriamente un array de IDs del 1 al 6 (dos veces cada uno)
function generarIDsAleatorios() {
  const ids = [1, 2, 3, 4, 5, 6];
  const idsDuplicados = [...ids, ...ids]; // Duplicar los IDs
  const idsAleatorios = [];

  while (idsDuplicados.length > 0) {
    const indiceAleatorio = Math.floor(Math.random() * idsDuplicados.length);
    const idAleatorio = idsDuplicados.splice(indiceAleatorio, 1)[0];
    idsAleatorios.push(idAleatorio);
  }

  return idsAleatorios;
}

// Añadir tips sobre información del par aprendido
// Gato siames precio 


// Generar los IDs aleatorios y crear el array de cardsData
const idsAleatorios = generarIDsAleatorios();
const cardsData = idsAleatorios.map((id, index) => ({
  imgSrc: `img/1/${id}.jpg`,
  id: (index + 1).toString(),
  dataId: id.toString(),
  selected: false,
  disabled: false,
}));
const game = { goal: 6, reward:1000, correct: 0, score:0, tries:0 };

let selectedCards = [];

function createCard(cardData) {
  const cardCol = document.createElement("div");
  cardCol.classList.add("col-md-3");

  const card = document.createElement("div");
  card.classList.add("card", "memo-card", "active");

  cardCol.onclick = function () {
    if (!cardData.selected && selectedCards.length < 2) {
      cardData.selected = true;
      selectedCards.push(cardData);
      console.log(selectedCards);
      card.classList.add("selected");
      const img = card.querySelector(".card-img-top");
      img.src = cardData.imgSrc; // Cambiar la imagen al hacer clic

      if (selectedCards.length === 2) {
        checkMatch();
      }
    } else if (cardData.selected && !cardData.disabled) {
      // Deseleccionar una tarjeta seleccionada
      cardData.selected = false;
      card.classList.remove("selected");
      const img = card.querySelector(".card-img-top");
      img.src = cardData.imgSrc; // Volver a la imagen de cubierta
      selectedCards = selectedCards.filter(
        (selectedCard) => selectedCard !== cardData
      );
    }
  };

  const img = document.createElement("img");
  img.src = 'img/cover.png';
  img.id = cardData.id;
  img.dataset.img = cardData.dataId;
  img.classList.add("card-img-top");

  card.appendChild(img);
  cardCol.appendChild(card);

  return cardCol;
}

function checkMatch() {
  if (selectedCards[0].dataId === selectedCards[1].dataId) {
    // Desactivar las tarjetas que forman el par
    selectedCards.forEach((cardData) => {
      cardData.disabled = true;
    });

    // Limpiar las tarjetas seleccionadas después de un tiempo
    setTimeout(() => {
      const timeCounter = document.getElementById("time-counter");

      selectedCards.forEach((cardData) => {
        cardData.disabled = true;
        const cardElement = document.querySelector(`[id="${cardData.id}"]`);
        cardElement.classList.add("disabled"); // Agregar clase "disabled"
        cardElement.classList.remove("selected");
        cardElement.classList.remove("active"); // Quitar clase "selected"
      });
      if (game.goal - 1 == game.correct) {
        alert("Felicidades ganaste");
        const postData = {
          jugador: localStorage.getItem("name"), // Reemplaza con el nombre del jugador
          puntuacion: game.score, // La puntuación que deseas enviar
          tiempo_juego:timeCounter.textContent, // El tiempo de juego
          intentos: game.tries, // La cantidad de intentos
        };
      
        // Realiza la solicitud POST
        fetch('http://localhost:3000/puntuaciones', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postData),
        })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Error al enviar la puntuación');
          }
          return response.json();
        })
        .then((data) => {
          console.log('Puntuación enviada con éxito:', data);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
        localStorage.removeItem("name");
        location.reload();
      } else {
        game.correct += 1;
        game.score += game.reward
        console.log(game.score);
      }
      selectedCards = [];
    }, 100); // Esperar 2 segundos antes de limpiar las tarjetas
  } else {
    console.log(selectedCards);
    // No coinciden las tarjetas
      setTimeout(() => {
        selectedCards.forEach((cardData) => {
          cardData.selected = false;
          const cardElement = document.querySelector(`[id="${cardData.id}"]`);
          cardElement.classList.remove("selected");
        });
      }, 100);
      

    // Cubrir las tarjetas después de un breve tiempo y limpiar las tarjetas seleccionadas
    setTimeout(() => {
      selectedCards.forEach((cardData) => {
        const cardElement = document.querySelector(`[id="${cardData.id}"]`);
        cardElement.src = "img/cover.png"; // Volver a la imagen de cubierta
      });
      selectedCards = [];
    }, 200);
      
  }
  setTimeout(() => {
    const scoreCounter = document.getElementById("score-counter");
    game.tries += 1;
    scoreCounter.textContent = `Intentos: ${game.tries} | Puntuación: ${game.score}`;
  },100)

}

document.addEventListener("DOMContentLoaded", function () {
    // Verificación del local storage
    const playerName = localStorage.getItem("name");

    // Si el nombre no está en el almacenamiento local, mostrar el modal
    if (!playerName) {
      $("#nameModal").modal("show");
    }else{
        const nameContainer = document.getElementById("name-container");
        nameContainer.textContent = `Jugador: ${playerName}`;
    }
  
    // Capturar el formulario para guardar el nombre
    const nameForm = document.getElementById("nameForm");
    const nameInput = document.getElementById("nameInput");
  
    // Escuchar el evento de envío del formulario
    nameForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = nameInput.value;
  
      // Guardar el nombre en el almacenamiento local
      localStorage.setItem("name", name);
  
      // Cerrar el modal
      $("#nameModal").modal("hide");
      const nameContainer = document.getElementById("name-container");
      nameContainer.textContent = `Jugador: ${name}`;
    });   
    // Lógica de renderizado
  const cardContainer = document.getElementById("card-container");
  cardsData.forEach((cardData, index) => {
    const cardCol = createCard(cardData);
    cardContainer.appendChild(cardCol);

    // Agregar la clase "mt-5" a cada tarjeta creada
    cardCol.classList.add("mt-3");

    if ((index + 1) % 12 === 0) {
      cardContainer.appendChild(document.createElement("div"));
      cardContainer.lastChild.classList.add("w-100");
    }
  });
  let seconds = 0;
  

  function updateTimer() {
    const timeCounter = document.getElementById("time-counter");
    seconds++;
    let displayTime;
    if (seconds < 60) {
      displayTime = `${seconds}`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      displayTime = `${minutes}:${remainingSeconds}`;
    }
    timeCounter.textContent = `Tiempo: ${displayTime}`;
  
    if (seconds % 10 === 0) {
      game.reward -= 100;
    }
  }
  
  // Iniciar el contador de tiempo
  const timerInterval = setInterval(updateTimer, 1000);
});

