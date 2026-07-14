const nextStopButtons = document.querySelectorAll(
  ".js-next-stop"
);

const stopTransition = document.getElementById(
  "stopTransition"
);

const stopTransitionKicker = document.getElementById(
  "stopTransitionKicker"
);

const stopTransitionFrom = document.getElementById(
  "stopTransitionFrom"
);

const stopTransitionTo = document.getElementById(
  "stopTransitionTo"
);

const stopTransitionTitle = document.getElementById(
  "stopTransitionTitle"
);

const miniPlane = document.getElementById("miniPlane");

const supportsMotionPath =
  typeof CSS !== "undefined" &&
  typeof CSS.supports === "function" &&
  CSS.supports("offset-path", "path('M 0 0 L 1 1')");

let isStopTransitionRunning = false;
const miniFlightDuration = 1350;
const stopTransitionDuration = 3200;

function resetMiniStopsState() {
  if (stopTransitionFrom) {
    stopTransitionFrom.classList.remove("is-origin", "is-arrived");
  }

  if (stopTransitionTo) {
    stopTransitionTo.classList.remove("is-origin", "is-arrived");
  }
}

function animateMiniPlane() {
  if (!miniPlane) return;

  miniPlane.style.transition = "none";

  if (supportsMotionPath) {
    miniPlane.style.offsetDistance = "0%";
    miniPlane.style.left = "";
  } else {
    miniPlane.style.left = "0%";
  }

  // Forzamos el estado inicial antes de lanzar el vuelo.
  void miniPlane.offsetWidth;

  miniPlane.style.transition =
    "offset-distance 1.35s cubic-bezier(.35, 0, .25, 1), left 1.35s cubic-bezier(.35, 0, .25, 1)";

  requestAnimationFrame(() => {
    if (supportsMotionPath) {
      miniPlane.style.offsetDistance = "100%";
      return;
    }

    miniPlane.style.left = "100%";
  });
}

if (nextStopButtons.length && stopTransition) {
  nextStopButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
      event.preventDefault();

      if (isStopTransitionRunning) {
        return;
      }

      isStopTransitionRunning = true;

      const nextTarget =
        this.dataset.next || this.getAttribute("href");

      if (stopTransitionKicker) {
        stopTransitionKicker.textContent =
          this.dataset.transitionKicker ||
          "Siguiente destino";
      }

      if (stopTransitionFrom) {
        stopTransitionFrom.textContent =
          this.dataset.transitionFrom || "";
      }

      if (stopTransitionTo) {
        stopTransitionTo.textContent =
          this.dataset.transitionTo || "";
      }

      if (stopTransitionTitle) {
        stopTransitionTitle.textContent =
          this.dataset.transitionTitle ||
          "Continuamos el viaje";
      }

      resetMiniStopsState();
      stopTransitionFrom?.classList.add("is-origin");

      stopTransition.classList.add("is-active");
      animateMiniPlane();

      window.setTimeout(() => {
        stopTransitionTo?.classList.add("is-arrived");
      }, miniFlightDuration);

      window.setTimeout(() => {
        stopTransition.classList.remove("is-active");
        isStopTransitionRunning = false;
        resetMiniStopsState();

        if (typeof window.appNavigateTo === "function") {
          window.appNavigateTo(nextTarget);
          return;
        }

        window.location.href = nextTarget;
      }, stopTransitionDuration);
    });
  });
}
