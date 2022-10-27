const maxAttempts = 8, // attempts máximos que tiene el jugador
  columns = 4, // columns del memorama
  timeFlip = 1, // Por cuántos segundos mostrar ambas imágenes
  imgHidden = "../styles/images/block.jpg"; // La imagen que se muestra cuando la real está oculta
new Vue({
  el: "#app",
  data: () => ({
    // La ruta de las imágenes. Puede ser relativa o absoluta
    images: [
      "../styles/images/1up.ico",
      "../styles/images/feather.ico",
      "../styles/images/flower_fire.ico",
      "../styles/images/mushroom.png",
      "../styles/images/mario.jpg",
      "../styles/images/boo.png",
      "../styles/images/goomba.jfif",
      "../styles/images/luma.png",
    ],
    memorama: [],
    // Para saber cuál fue la carta anteriormente seleccionada
    lastClick: {
      iFile: null,
      iImg: null,
    },
    imgHidden: imgHidden,
    maxAttempts: maxAttempts,
    attempts: 0,
    correctAnswer: 0,
    waitTime: false,
  }),
  methods: {
    // Método que muestra la alerta indicando que el jugador ha perdido; después de mostrarla, se reinicia el juego:
    failed() {
        Swal.fire({
                title: "You lost",
                html: `
            <img class="img-fluid" src="../styles/images/gameover.jpg" alt="Perdiste">
            <p class="h4">Agotaste tus intentos</p>`,
                confirmButtonText: "Jugar de nuevo",
                allowOutsideClick: false,
                allowEscapeKey: false,
            })
            .then(this.restartGame)
    },
    // Mostrar alerta de victoria y reiniciar juego:
    victory() {
        Swal.fire({
                title: "¡Ganaste!",
                html: `
            <img class="img-fluid" src="../styles/images/win.png" alt="Ganaste">
            <p class="h4">Muy bien hecho</p>`,
                confirmButtonText: "Jugar de nuevo",
                allowOutsideClick: false,
                allowEscapeKey: false,
            })
            .then(this.restartGame)
    },
    // Método que indica si el jugador ha ganado:
    winner() {
        return this.memorama.every(array => array.every(image => image.sucess));
    },
    // Para mezclar un arreglo:
    random(random) {
      var j, x, i;
      for (i = random.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = random[i];
        random[i] = random[j];
        random[j] = x;
      }
      return random;
    },
    // Aumenta un intento y verifica si el jugador ha perdido:
    attemptIncrease() {
        this.attempts++;
        if (this.attempts >= maxAttempts) {
            this.failed();
        }
    },
    // Se desencadena cuando se hace click en la imagen (voltear la imagen):
    flip(iFile, iImg) {
      // Si se está regresando una imagen a su estado original, detener flujo
      if (this.waitTime) {
        return;
      }
      // Si es una imagen se acierta:
      if (this.memorama[iFile][iImg].sucess) {
        return;
      }
      // Selección de imagen por primera vez:
      if (this.lastClick.iFile === null && this.lastClick.iImg === null) {
        this.memorama[iFile][iImg].show = true;
        this.lastClick.iFile = iFile;
        this.lastClick.iImg = iImg;
        return;
      }
      // Ocultar la imagen que no es par:
      let imgSelected = this.memorama[iFile][iImg];
      let ultimaimgSelected =
        this.memorama[this.lastClick.iFile][this.lastClick.iImg];
      if (iFile === this.lastClick.iFile && iImg === this.lastClick.iImg) {
        this.memorama[iFile][iImg].show = false;
        this.lastClick.iFile = null;
        this.lastClick.iImg = null;
        this.attemptIncrease();
        return;
      }

      // Al seleccionar imagen par (se guarda la última seleccionada):
      this.memorama[iFile][iImg].show = true;
      if (imgSelected.ruta === ultimaimgSelected.ruta) {
        this.correctAnswer++;
        this.memorama[iFile][iImg].sucess = true;
        this.memorama[this.lastClick.iFile][this.lastClick.iImg].sucess = true;
        this.lastClick.iFile = null;
        this.lastClick.iImg = null;
        // Se comprueba cada vez que se gana:
        if (this.winner()) {
          this.victory();
        }
      } else {
        // Si no  se acierta, entonces gira ambas imágenes:
        this.waitTime = true;
        setTimeout(() => {
          this.memorama[iFile][iImg].show = false;
          this.memorama[iFile][iImg].animacion = false;
          this.memorama[this.lastClick.iFile][this.lastClick.iImg].show = false;
          this.lastClick.iFile = null;
          this.lastClick.iImg = null;
          this.waitTime = false;
        }, timeFlip * 1000);
        this.attemptIncrease();
      }
    },
    restartGame() {
      let memorama = [];
      this.images.forEach((imagen, indice) => {
        let imgMemorama = {
          ruta: imagen,
          show: false, // No se muestra la original
          sucess: false, // No acertada
        };
        // Poner dos veces la misma imagen:
        memorama.push(imgMemorama, Object.assign({}, imgMemorama));
      });

      // Mandar aleatorio las imágenes:
      this.random(memorama);

      // Dividirlo en subarreglos o columns
      let memoramaDividido = [];
      for (let i = 0; i < memorama.length; i += columns) {
        memoramaDividido.push(memorama.slice(i, i + columns));
      }
      // Reiniciar attempts
      this.attempts = 0;
      this.correctAnswer = 0;
      // Asignar a instancia de Vue para que lo dibuje
      this.memorama = memoramaDividido;
    },
    // CArgar las imágenes:
    loadImg() {
      // Mostrar la alerta
      Swal.fire({
        title: "Charging...",
        allowOutsideClick: false,
        allowEscapeKey: false,
      }).then(this.restartGame);
      Swal.showLoading();

      let total = this.images.length,
        contador = 0;
      let preloadImg = Array.from(this.images);
      // También vamos a precargar la "espalda" de la tarjeta
      preloadImg.push(imgHidden);
      // Cargamos cada imagen y en el evento load aumentamos el contador:
      preloadImg.forEach((ruta) => {
        const imagen = document.createElement("img");
        imagen.src = ruta;
        imagen.addEventListener("load", () => {
          contador++;
          if (contador >= total) {
            // Si el contador >= total entonces se ha terminado la carga de todas:
            this.restartGame();
            Swal.close();
          }
        });
        // Agregamos la imagen y la removemos instantáneamente, así no se muestra
        document.body.appendChild(imagen);
        document.body.removeChild(imagen);
      });
    },
  },
  mounted() {
    this.loadImg();
  },
});
