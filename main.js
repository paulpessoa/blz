document.addEventListener("DOMContentLoaded", () => {
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  if (!("contacts" in navigator)) {
    alert("Este navegador não suporta o acesso a contatos.");
  } else if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  // Exibe os contatos armazenados ao carregar a página.
  document.addEventListener("DOMContentLoaded", () => {
    displayContacts(JSON.parse(localStorage.getItem("savedContacts") || "[]"));
  });

  const geoButton = document.getElementById("geo-button");
  const geoLocation = document.getElementById("geo-location");
  const directionButton = document.getElementById("direction-button");
  const direction = document.getElementById("direction");

  const contactButton = document.getElementById("add-contact");
  const contactInfo = document.getElementById("contact-info");

  const themeToggle = document.getElementById("theme-toggle");
  const htmlElement = document.documentElement; // Correção: Obtém o elemento <html> diretamente

  // Função para trocar de tema
  function toggleTheme() {
    const currentTheme = htmlElement.getAttribute("data-bs-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";
    htmlElement.setAttribute("data-bs-theme", newTheme);
    localStorage.setItem("theme", newTheme); // Mantém a chave do localStorage consistente
  }

  // Carregar tema salvo no localStorage
  const savedTheme = localStorage.getItem("theme") || "dark"; // Padrão para 'dark'
  htmlElement.setAttribute("data-bs-theme", savedTheme); // Aplica o tema no elemento <html>

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

          if (alpha >= 337.5 || alpha < 22.5) {
            directionString = "Norte";
          } else if (alpha >= 22.5 && alpha < 67.5) {
            directionString = "Nordeste";
          } else if (alpha >= 67.5 && alpha < 112.5) {
            directionString = "Leste";
          } else if (alpha >= 112.5 && alpha < 157.5) {
            directionString = "Sudeste";
          } else if (alpha >= 157.5 && alpha < 202.5) {
            directionString = "Sul";
          } else if (alpha >= 202.5 && alpha < 247.5) {
            directionString = "Sudoeste";
          } else if (alpha >= 247.5 && alpha < 292.5) {
            directionString = "Oeste";
          } else if (alpha >= 292.5 && alpha < 337.5) {
            directionString = "Noroeste";
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

  // Monitorar mudanças na rede
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

  function saveContactsToLocalStorage(contacts) {
    const contactsToSave = contacts.map((contact) => ({
      name: contact.name ? contact.name[0] : "",
      tel: contact.tel ? contact.tel[0] : "",
    }));
    localStorage.setItem("savedContacts", JSON.stringify(contactsToSave));
  }

  function displayContacts(contacts) {
    if (contacts.length > 0) {
      contactInfo.innerHTML = contacts
        .map(
          (contact, index) =>
            `
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
    try {
      if ("contacts" in navigator && "ContactsManager" in window) {
        const props = ["name", "tel"];
        const opts = { multiple: true };

        navigator.contacts.select(props, opts).then((contacts) => {
          saveContactsToLocalStorage(contacts);
          displayContacts(contacts);
        });
      } else {
        alert("A API de contatos não é suportada neste navegador.");
      }
    } catch (error) {
      console.error("Erro ao acessar contatos: ", error);
      contactInfo.innerHTML =
        "<p>Não foi possível acessar os contatos. Permissões necessárias ou suporte indisponível.</p>";
    }
  });
});
