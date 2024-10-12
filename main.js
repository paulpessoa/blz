document.addEventListener("DOMContentLoaded", () => {
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  if (!("contacts" in navigator)) {
    alert("Este navegador não suporta o acesso a contatos.");
  } else if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }
  // LOCALIZACAO
  const geoButton = document.getElementById("geo-button");
  const geoLocation = document.getElementById("geo-location");

  // DIRECAO
  const directionButton = document.getElementById("direction-button");
  const direction = document.getElementById("direction");

  // CONTATOS
  const contactButton = document.getElementById("add-contact");
  const contactInfo = document.getElementById("contact-info");

  // MUDAR TEMA
  const themeToggle = document.getElementById("theme-toggle");
  const htmlElement = document.documentElement;

  // *********** ************** FUNCAO TROCAR TEMAS *********** **************
  function toggleTheme() {
    const currentTheme = htmlElement.getAttribute("data-bs-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";
    htmlElement.setAttribute("data-bs-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    themeToggle.textContent = `Mudar para tema ${
      newTheme === "light" ? "escuro" : "claro"
    }`;
  }

  // Carregar tema salvo no localStorage
  const savedTheme = localStorage.getItem("theme") || "dark";
  htmlElement.setAttribute("data-bs-theme", savedTheme);

  // Lidar com o clique no botão de toggle de temas
  themeToggle.addEventListener("click", toggleTheme);

  // *********** ************** FUNCAO LOCALIZACAO *********** **************
  geoButton.addEventListener("click", () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, altitude } = position.coords;

          let locationText = `Localização: ${latitude}, ${longitude}`;

          if (altitude !== null) {
            const altitudeStatus =
              altitude > 0 ? "acima do nível do mar" : "abaixo do nível do mar";
            locationText += `Altitude ${altitude.toFixed(
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

  // *********** ************** FUNCAO DIRECAO *********** **************
  directionButton.addEventListener("click", () => {
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", (event) => {
        let alpha = event.alpha;
        if (alpha !== null) {
          let directionString;

          if (alpha >= 315.1 || alpha < 45) {
            directionString = "Norte";
          } else if (alpha >= 45.1 && alpha < 135) {
            directionString = "Leste";
          } else if (alpha >= 135.1 && alpha < 225) {
            directionString = "Sul";
          } else if (alpha >= 225.1 && alpha < 315) {
            directionString = "Oeste";
          }

          direction.textContent = `Direção: ${directionString} - ${Math.round(
            alpha
          )}°`;
        } else {
          direction.textContent = "Direção: Indisponível";
        }
      });
    } else {
      direction.textContent = "O sensor de orientação não é suportado.";
    }
  });

  // *********** ************** FUNCAO WIFI / 3G *********** **************
  function updateConnectionStatus() {
    if (navigator.onLine) {
      showNotification("Conexão estabelecida", "Você está online novamente.");
    } else {
      showNotification(
        "Sem conexão",
        "Você está offline. Verifique sua conexão de rede."
      );
    }
  }

  window.addEventListener("online", updateConnectionStatus);
  window.addEventListener("offline", updateConnectionStatus);

  // Exibir notificação
  function showNotification(title, body) {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    }
  }

  // *********** ************** FUNCAO CONTATOS *********** **************

  function displayContacts(contacts) {
    if (contacts.length > 0) {
      contactInfo.innerHTML = contacts
        .map(
          (contact, index) => `
          <div class="contact-entry" data-index="${index}">
            <p><strong>${contact.name}</strong> - ${contact.tel}</p>
          </div>
        `
        )
        .join("");
    } else {
      contactInfo.innerHTML = "<p>Nenhum contato selecionado.</p>";
    }
  }

  contactButton.addEventListener("click", () => {
    if ("contacts" in navigator && "ContactsManager" in window) {
      const props = ["name", "tel"];
      const opts = { multiple: true };

      navigator.contacts.select(props, opts).then((contacts) => {
        displayContacts(contacts);
      });
    } else {
      alert("A API de contatos não é suportada neste navegador.");
    }
  });
});
