document.addEventListener("DOMContentLoaded", () => {
  const geoButton = document.getElementById("geo-button");
  const geoLocation = document.getElementById("geo-location");
  const directionButton = document.getElementById("direction-button");
  const direction = document.getElementById("direction");

  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;

  // Função para trocar de tema
  function toggleTheme() {
    const currentTheme = body.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    body.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  }

  // Carregar tema salvo no localStorage
  const savedTheme = localStorage.getItem("theme") || "light"; // padrão para 'light'
  body.setAttribute("data-theme", savedTheme);

  // Lidar com o clique no botão de toggle de temas
  themeToggle.addEventListener("click", toggleTheme);

  geoButton.addEventListener("click", () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, altitude } = position.coords;

          let locationText = `Localização: Latitude ${latitude}, Longitude ${longitude}`;

          if (altitude !== null) {
            const altitudeStatus =
              altitude > 0 ? "acima do nível do mar" : "abaixo do nível do mar";
            locationText += `, Altitude ${altitude.toFixed(
              2
            )} metros (${altitudeStatus})`;
          } else {
            locationText += `, Altitude: Não disponível`;
          }

          geoLocation.textContent = locationText;
        },
        (error) => {
          geoLocation.textContent = `Erro ao obter localização: ${error.message}`;
        }
      );
    } else {
      geoLocation.textContent = "Geolocalização não é suportada.";
    }
  });

  directionButton.addEventListener("click", () => {
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", (event) => {
        let alpha = event.alpha;
        if (alpha !== null) {
          let directionString;
          if (alpha >= 337.5 || alpha < 22.5) directionString = "Norte";
          else if (alpha >= 22.5 && alpha < 67.5) directionString = "Nordeste";
          else if (alpha >= 67.5 && alpha < 112.5) directionString = "Leste";
          else if (alpha >= 112.5 && alpha < 157.5) directionString = "Sudeste";
          else if (alpha >= 157.5 && alpha < 202.5) directionString = "Sul";
          else if (alpha >= 202.5 && alpha < 247.5)
            directionString = "Sudoeste";
          else if (alpha >= 247.5 && alpha < 292.5) directionString = "Oeste";
          else if (alpha >= 292.5 && alpha < 337.5)
            directionString = "Noroeste";

          direction.textContent = `Direção: ${directionString} - ${Math.round(
            alpha
          )}°`;
        } else {
          direction.textContent = "Direção: Indisponíve";
        }
      });
    } else {
      direction.textContent = "O sensor de orientação não é suportado.";
    }
  });
});
