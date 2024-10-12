document.addEventListener("DOMContentLoaded", () => {
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }

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

  contactButton.addEventListener("click", async () => {
    try {
      if ("contacts" in navigator && "ContactsManager" in window) {
        const props = ["name", "tel"]; // Propriedades desejadas
        const opts = { multiple: false }; // Seleciona um contato

        const contacts = await navigator.contacts.select(props, opts);

        if (contacts.length > 0) {
          const newContact = contacts[0];

          // Carregar contatos existentes
          const savedContacts =
            JSON.parse(localStorage.getItem("contacts")) || [];
          savedContacts.push(newContact);

          // Salvar no localStorage
          localStorage.setItem("contacts", JSON.stringify(savedContacts));

          // Atualizar a lista de contatos exibida
          loadContacts();
        } else {
          alert("Nenhum contato foi selecionado.");
        }
      } else {
        alert("A API de contatos não é suportada neste navegador.");
      }
    } catch (error) {
      console.error("Erro ao acessar contatos: ", error);
      alert(
        "Não foi possível acessar os contatos. Suporte ou permissões insuficientes."
      );
    }
  });

  // Carregar contatos ao inicializar a página
  loadContacts();

  // // Verificar e requisitar permissões (se necessário na inicialização):
  // if (!("contacts" in navigator)) {
  //   alert("Este navegador não suporta o acesso a contatos.");
  // } else if (Notification.permission !== "granted") {
  //   Notification.requestPermission();
  // }

  const installButton = document.getElementById("install-button");
  let deferredPrompt;

  window.addEventListener("beforeinstallprompt", (e) => {
    // Impedir que o navegador mostre o prompt imediatamente
    e.preventDefault();
    // Guardar o evento para mais tarde
    deferredPrompt = e;

    // Mostrar o botão de instalação
    installButton.style.display = "block";
  });

  installButton.addEventListener("click", async () => {
    if (deferredPrompt) {
      // Mostrar o prompt de instalação
      deferredPrompt.prompt();

      // Aguardar a resposta do usuário ao prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`Instalação do aplicativo: ${outcome}`);

      // Redefinir o deferredPrompt, pois só pode ser usado uma vez
      deferredPrompt = null;

      // Ocultar o botão de instalação após uso
      installButton.style.display = "none";
    }
  });
});
