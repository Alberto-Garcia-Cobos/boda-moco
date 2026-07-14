(() => {
  const startJourneyButton =
    document.querySelector(".js-start-journey");

  const journeyTransition =
    document.getElementById("journeyTransition");

  const flyingPlane =
    document.getElementById("flyingPlane");

  const storyPolaroid =
    document.getElementById("storyPolaroid");

  const storyPhoto =
    document.getElementById("storyPhoto");

  const storyCaption =
    document.getElementById("storyCaption");

  const storyText =
    document.getElementById("storyText");

  const soundtrack =
    document.getElementById("weddingSoundtrack");

  const supportsMotionPath =
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    CSS.supports("offset-path", "path('M 0 0 L 1 1')");

  let isJourneyRunning = false;

 const storyStops = [
  {
    image: "images/transition/filomena.jpg",
    caption: "Fuenlabrada",
    text: "Donde los planes dejaron de ser ideas para convertirse en un futuro juntos.",
    rotate: "-5deg",
    planePosition: "0%",
    fallbackLeft: "8%"
  },
  {
    image: "images/transition/delphi.jpg",
    caption: "Irlanda",
    text: "Donde descubrimos que el hogar también podía estar lejos.",
    rotate: "4deg",
    planePosition: "50%",
    fallbackLeft: "50%"
  },
  {
    image: "images/transition/hawaianas.jpg",
    caption: "Madridejos",
    text: "Donde nació nuestro sueño compartido y donde comienza la aventura más importante de todas.",
    rotate: "-3deg",
    planePosition: "100%",
    fallbackLeft: "92%"
    }
];

    /*
    Precarga las imágenes para que estén listas
    antes de que empiece la transición.
  */
  storyStops.forEach((stop) => {
    const image = new Image();
    image.src = stop.image;
  })

  function wait(milliseconds) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, milliseconds);
    });
  }

  function fadeInAudio(
    audio,
    targetVolume = 0.38,
    duration = 4000
  ) {
    if (!audio) return;

    audio.volume = 0;

    const steps = 40;
    const intervalTime = duration / steps;
    const volumeStep = targetVolume / steps;

    let currentStep = 0;

    const fadeInterval = window.setInterval(() => {
      currentStep += 1;

      audio.volume = Math.min(
        volumeStep * currentStep,
        targetVolume
      );

      if (currentStep >= steps) {
        window.clearInterval(fadeInterval);
      }
    }, intervalTime);
  }

 function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(src);
    image.onerror = reject;
    image.src = src;
  });
}

async function showPhoto(stop) {
  /*
    Primero dejamos la polaroid totalmente oculta.
  */
  storyPolaroid.classList.remove(
    "is-visible",
    "is-leaving"
  );

  /*
    Esperamos a que la imagen nueva esté cargada
    antes de sustituir la anterior.
  */
  try {
    await loadImage(stop.image);
  } catch (error) {
    console.error(
      `No se pudo cargar la imagen: ${stop.image}`,
      error
    );

    return;
  }

  storyPhoto.src = stop.image;
  storyPhoto.alt = `Recuerdo de ${stop.caption}`;

  storyCaption.textContent = stop.caption;
  storyText.textContent = stop.text;

  storyPolaroid.style.setProperty(
    "--story-rotate",
    stop.rotate
  );

  /*
    Forzamos al navegador a registrar el estado oculto.
  */
  void storyPolaroid.offsetWidth;

  storyPolaroid.classList.add("is-visible");
}

async function hidePhoto() {
  storyPolaroid.classList.remove("is-visible");
  storyPolaroid.classList.add("is-leaving");

  await wait(700);

  storyPolaroid.classList.remove("is-leaving");

  /*
    Evitamos que quede visible la imagen anterior
    mientras se prepara la siguiente.
  */
  storyPhoto.removeAttribute("src");
}

function resetJourneyState() {
  journeyTransition.classList.remove("is-active");
  startJourneyButton.classList.remove("is-clicked");

  if (flyingPlane) {
    if (supportsMotionPath) {
      flyingPlane.style.transition = "none";
      flyingPlane.style.offsetDistance = "0%";
      flyingPlane.style.left = "";
      requestAnimationFrame(() => {
        flyingPlane.style.transition =
          "offset-distance 2.2s cubic-bezier(.45, 0, .2, 1)";
      });
    } else {
      flyingPlane.style.left = storyStops[0].fallbackLeft;
    }
  }

  document.querySelectorAll(".map-stop").forEach((s) => {
    s.classList.remove("is-active");
  });

  const trailPath = document.getElementById("routePathTrail");
  if (trailPath) {
    const len = trailPath.getTotalLength ? trailPath.getTotalLength() : 1000;
    trailPath.style.transition = "none";
    trailPath.style.strokeDashoffset = len;
    requestAnimationFrame(() => {
      trailPath.style.transition =
        "stroke-dashoffset 2.2s cubic-bezier(.45, 0, .2, 1)";
    });
  }

  if (storyPolaroid) {
    storyPolaroid.classList.remove("is-visible", "is-leaving");
  }
}

function movePlaneTo(stopIndex) {
  const stop = storyStops[stopIndex];
  if (!stop || !flyingPlane) return;

  if (supportsMotionPath) {
    flyingPlane.style.offsetDistance = stop.planePosition;
    return;
  }

  flyingPlane.style.left = stop.fallbackLeft;
}

  async function playJourney(nextPage) {
    journeyTransition.classList.add("is-active");

    await wait(700);

    // Calcular longitud real del path para la estela
    const trailPath = document.getElementById("routePathTrail");
    const totalLength = trailPath && trailPath.getTotalLength
      ? trailPath.getTotalLength()
      : 1000;

    if (trailPath) {
      trailPath.style.strokeDasharray = "4 6";
      trailPath.style.strokeDashoffset = totalLength;
    }

    const stops = document.querySelectorAll(".map-stop");

    // ── Parada 0: Fuenlabrada ──
    movePlaneTo(0);
    stops[0]?.classList.add("is-active");

    await showPhoto(storyStops[0]);
    await wait(4500);
    await hidePhoto();

    // Volar hacia parada 1 + dibujar primera mitad de estela
    movePlaneTo(1);
    if (trailPath) trailPath.style.strokeDashoffset = totalLength / 2;

    await wait(2800);
    stops[1]?.classList.add("is-active");

    await showPhoto(storyStops[1]);
    await wait(4500);
    await hidePhoto();

    // Volar hacia parada 2 + completar estela
    movePlaneTo(2);
    if (trailPath) trailPath.style.strokeDashoffset = 0;

    await wait(2800);
    stops[2]?.classList.add("is-active");

    await showPhoto(storyStops[2]);
    await wait(4400);
    await hidePhoto();

    await wait(1800);

    // Primero navegamos a la siguiente pantalla
    if (typeof window.appNavigateTo === "function") {
      window.appNavigateTo(nextPage);
    } else {
      window.location.href = nextPage;
    }

    // Luego limpiamos el overlay
    await wait(500);
    resetJourneyState();
  }

  if (
  startJourneyButton &&
  journeyTransition &&
  flyingPlane &&
  storyPolaroid
) {
  startJourneyButton.addEventListener("click", (event) => {
    event.preventDefault();

    if (isJourneyRunning) {
      return;
    }

    isJourneyRunning = true;

    const nextPage =
      startJourneyButton.getAttribute("href") || "#vispera";

    /*
      Debe ejecutarse directamente dentro del clic.
      No debe haber ningún await ni setTimeout antes de play().
    */
    if (soundtrack) {
      soundtrack.volume = 0;

      const playPromise = soundtrack.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            fadeInAudio(soundtrack, 0.38, 4000);
          })
          .catch((error) => {
            console.error(
              "No se pudo iniciar la música:",
              error
            );
          });
      }
    }

    startJourneyButton.classList.add("is-clicked");
    startJourneyButton.style.pointerEvents = "none";

    window.setTimeout(() => {
      playJourney(nextPage).finally(() => {
        isJourneyRunning = false;
        startJourneyButton.style.pointerEvents = "";
      });
    }, 450);
  });
}
  
})();
