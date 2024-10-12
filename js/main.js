const unlockButton = document.getElementById("unlock-button");
const protectedContent = document.getElementById("protected-content");
const geoButton = document.getElementById("geo-button");
const geoLocation = document.getElementById("geo-location");
const speedButton = document.getElementById("speed-button");
const speed = document.getElementById("speed");
const directionButton = document.getElementById("direction-button");
const direction = document.getElementById("direction");
const torchButton = document.getElementById("torch-button");
const torchStatus = document.getElementById("torchStatus");

let track = null;

// Mock de autenticação com WebAuthn
if (window.PublicKeyCredential || true) {
  unlockButton.addEventListener("click", async () => {
    try {
      const credential = await mockWebAuthn();
      protectedContent.style.display = "block";
      alert("Autenticação bem-sucedida (simulada)!");
    } catch (err) {
      alert("Erro na autenticação (simulada): " + err.message);
    }
  });
} else {
  unlockButton.addEventListener("click", () => {
    alert("Autenticação WebAuthn não é suportada neste navegador.");
  });
}

// Função mock para simular a autenticação
function mockWebAuthn() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = true;
      if (success) {
        resolve({
          id: "mocked-credential-id",
          rawId: new Uint8Array([1, 2, 3, 4]),
          type: "public-key",
        });
      } else {
        reject(new Error("Mock de falha na autenticação."));
      }
    }, 1000);
  });
}

// Função para obter a localização
geoButton.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        geoLocation.textContent = `Localização: Latitude ${position.coords.latitude}, Longitude ${position.coords.longitude}`;
      },
      (error) => {
        geoLocation.textContent = `Erro ao obter localização: ${error.message}`;
      }
    );
  } else {
    geoLocation.textContent = "Geolocalização não é suportada.";
  }
});

// Função para obter a velocidade
speedButton.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (position) => {
        speed.textContent = `Velocidade: ${
          position.coords.speed ? position.coords.speed : "Indisponível"
        } m/s`;
      },
      (error) => {
        speed.textContent = `Erro ao obter velocidade: ${error.message}`;
      }
    );
  } else {
    speed.textContent = "Geolocalização não é suportada.";
  }
});

// Função para obter a direção (bússola)
directionButton.addEventListener("click", () => {
  if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", (event) => {
      let alpha = event.alpha;
      if (alpha !== null) {
        let directionString;
        if (alpha >= 45 && alpha < 135) {
          directionString = "Leste";
        } else if (alpha >= 135 && alpha < 225) {
          directionString = "Sul";
        } else if (alpha >= 225 && alpha < 315) {
          directionString = "Oeste";
        } else {
          directionString = "Norte";
        }
        direction.textContent = `Direção: ${directionString}`;
      } else {
        direction.textContent = "Direção: Indisponível";
      }
    });
  } else {
    direction.textContent = "O sensor de orientação não é suportado.";
  }
});

// Função para controlar a lanterna
torchButton.addEventListener("click", async () => {
  if (!track) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      track = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);
      const capabilities = await imageCapture.getPhotoCapabilities();
      if (
        capabilities &&
        capabilities.fillLightMode &&
        capabilities.fillLightMode.includes("flash")
      ) {
        toggleTorch(true);
      } else {
        alert("Lanterna não suportada no dispositivo.");
      }
    } catch (error) {
      alert("Erro ao acessar a câmera: " + error.message);
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
      alert("Erro ao controlar a lanterna: " + error.message);
    });
}
