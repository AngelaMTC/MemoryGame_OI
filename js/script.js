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
        // Útiles para saber cuál fue la carta anteriormente seleccionada
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
// Método que muestra la alerta indicando que el jugador ha perdido; después
        // de mostrarla, se reinicia el juego
        // failed() {
        //     Swal.fire({
        //             title: "You lost",
        //             html: `
        //         <img class="img-fluid" src="./img/perdiste.png" alt="Perdiste">
        //         <p class="h4">Agotaste tus attempts</p>`,
        //             confirmButtonText: "Jugar de nuevo",
        //             allowOutsideClick: false,
        //             allowEscapeKey: false,
        //         })
        //         .then(this.restartGame)
        // },
        // Mostrar alerta de victoria y reiniciar juego
        // victory() {
        //     Swal.fire({
        //             title: "¡Ganaste!",
        //             html: `
        //         <img class="img-fluid" src="./img/ganaste.png" alt="Ganaste">
        //         <p class="h4">Muy bien hecho</p>`,
        //             confirmButtonText: "Jugar de nuevo",
        //             allowOutsideClick: false,
        //             allowEscapeKey: false,
        //         })
        //         .then(this.restartGame)
        // },
        // Método que indica si el jugador ha ganado
        // winner() {
        //     return this.memorama.every(array => array.every(image => image.sucess));
        // },
        // Ayudante para mezclar un arreglo
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
        // Aumenta un intento y verifica si el jugador ha perdido
        // attemptIncrease() {
        //     this.attempts++;
        //     if (this.attempts >= maxAttempts) {
        //         this.failed();
        //     }
        // },
        // Se desencadena cuando se hace click en la imagen
        flip(iFile, iImg) {
            // Si se está regresando una imagen a su estado original, detener flujo
            if (this.waitTime) {
                return;
            }
            // Si es una imagen sucess, no nos importa que la intenten voltear
            if (this.memorama[iFile][iImg].sucess) {
                return;
            }
            // Si es la primera vez que la selecciona
            if (this.lastClick.iFile === null && this.lastClick.iImg === null) {
                this.memorama[iFile][iImg].show = true;
                this.lastClick.iFile = iFile;
                this.lastClick.iImg = iImg;
                return;
            }
            // Si es el que estaba mostrada, lo ocultamos de nuevo
            let imgSelected = this.memorama[iFile][iImg];
            let ultimaimgSelected = this.memorama[this.lastClick.iFile][this.lastClick.iImg];
            if (iFile === this.lastClick.iFile &&
                iImg === this.lastClick.iImg) {
                this.memorama[iFile][iImg].show = false;
                this.lastClick.iFile = null;
                this.lastClick.iImg = null;
                this.attemptIncrease();
                return;
            }

            // En caso de que la haya encontrado, ¡acierta!
            // Se basta en ultimaimgSelected
            this.memorama[iFile][iImg].show = true;
            if (imgSelected.ruta === ultimaimgSelected.ruta) {
                this.aciertos++;
                this.memorama[iFile][iImg].sucess = true;
                this.memorama[this.lastClick.iFile][this.lastClick.iImg].sucess = true;
                this.lastClick.iFile = null;
                this.lastClick.iImg = null;
                // Cada que acierta comprobamos si ha ganado
                if (this.winner()) {
                    this.victory();
                }
            } else {
                // Si no acierta, entonces giramos ambas imágenes
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
                    sucess: false, // No es sucess al inicio
                };
                // Poner dos veces la misma imagen
                memorama.push(imgMemorama, Object.assign({}, imgMemorama));
            });

            // Sacudir o mover arreglo; es decir, hacerlo aleatorio
            this.random(memorama);

            // Dividirlo en subarreglos o columns
            let memoramaDividido = [];
            for (let i = 0; i < memorama.length; i += columns) {
                memoramaDividido.push(memorama.slice(i, i + columns));
            }
            // Reiniciar attempts
            this.attempts = 0;
            this.aciertos = 0;
            // Asignar a instancia de Vue para que lo dibuje
            this.memorama = memoramaDividido;
        },
        // Método que precarga las imágenes para que las mismas ya estén cargadas
        // cuando el usuario gire la tarjeta
        loadImg() {
            // Mostrar la alerta
            Swal.fire({
                    title: "Charging...",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                })
                .then(this.restartGame)
                // Ponerla en modo carga
            Swal.showLoading();


            let total = this.images.length,
                contador = 0;
            let preloadImg = Array.from(this.images);
            // También vamos a precargar la "espalda" de la tarjeta
            preloadImg.push(imgHidden);
            // Cargamos cada imagen y en el evento load aumentamos el contador
            preloadImg.forEach(ruta => {
                const imagen = document.createElement("img");
                imagen.src = ruta;
                imagen.addEventListener("load", () => {
                    contador++;
                    if (contador >= total) {
                        // Si el contador >= total entonces se ha terminado la carga de todas
                        this.restartGame();
                        Swal.close();
                    }
                });
                // Agregamos la imagen y la removemos instantáneamente, así no se muestra
                // pero sí se carga
                document.body.appendChild(imagen);
                document.body.removeChild(imagen);
            });
        },
    },
    mounted() {
        this.loadImg();
    },
});