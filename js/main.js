const unlockButton = document.getElementById("unlock-button");
const protectedContent = document.getElementById("protected-content");
const torchButton = document.getElementById("toggle-torch");
const torchStatus = document.getElementById("torch-status");

let track = null;

if (window.PublicKeyCredential) {
  unlockButton.addEventListener("click", () => {
    navigator.credentials
      .get({
        publicKey: {
          challenge: new Uint8Array([
            /* random challenge */
          ]),
          allowCredentials: [],
          timeout: 60000,
          userVerification: "required",
        },
      })
      .then(() => {
        protectedContent.style.display = "block";
      })
      .catch((err) => {
        alert("Autenticação falhou: " + err);
      });
  });
} else {
  unlockButton.addEventListener("click", () => {
    alert("Autenticação não suportada neste navegador.");
  });
}

// Geolocalização e Velocidade
const locationSpan = document.getElementById("location");
const speedSpan = document.getElementById("speed-value");

if ("geolocation" in navigator) {
  navigator.geolocation.watchPosition((position) => {
    const { latitude, longitude, speed } = position.coords;
    locationSpan.textContent = `Lat: ${latitude}, Long: ${longitude}`;
    speedSpan.textContent = speed ? speed : "0";
  });
} else {
  locationSpan.textContent = "Geolocalização não suportada.";
}

// Direção (Bússola)
const directionSpan = document.getElementById("direction-value");

if (window.DeviceOrientationEvent) {
  window.addEventListener("deviceorientation", (event) => {
    const degrees = event.alpha;
    if (degrees >= 315 || degrees < 45) {
      directionSpan.textContent = "Norte";
    } else if (degrees >= 45 && degrees < 135) {
      directionSpan.textContent = "Leste";
    } else if (degrees >= 135 && degrees < 225) {
      directionSpan.textContent = "Sul";
    } else {
      directionSpan.textContent = "Oeste";
    }
  });
} else {
  directionSpan.textContent = "Direção não suportada.";
}

// Ligar/Desligar Lanterna
torchButton.addEventListener("click", async () => {
  if (!track) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      track = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);
      const capabilities = await imageCapture.getPhotoCapabilities();

      if (capabilities.fillLightMode.includes("flash")) {
        toggleTorch(true);
      } else {
        alert("Lanterna não suportada no dispositivo.");
      }
    } catch (error) {
      alert("Erro ao acessar a câmera: " + error);
    }
  } else {
    toggleTorch(track.getSettings().torch ? false : true);
  }
});

function toggleTorch(state) {
  track
    .applyConstraints({
      advanced: [{ torch: state }],
    })
    .then(() => {
      torchStatus.textContent = state
        ? "Lanterna Ligada"
        : "Lanterna Desligada";
      torchButton.textContent = state ? "Desligar Lanterna" : "Ligar Lanterna";
    })
    .catch((error) => {
      alert("Erro ao controlar a lanterna: " + error);
    });
}
