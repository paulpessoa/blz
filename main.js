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

  // contactButton.addEventListener("click", async () => {
  //   // Verificar e requisitar permissões (se necessário na inicialização):
  //   if (!("contacts" in navigator)) {
  //     alert("Este navegador não suporta o acesso a contatos.");
  //   } else if (Notification.permission !== "granted") {
  //     Notification.requestPermission();
  //   }

  //   try {
  //     if ("contacts" in navigator && "ContactsManager" in window) {
  //       // Incluir 'icon' nas propriedades desejadas
  //       const props = ["name", "tel", "icon"]; // Propriedades desejadas

  //       // Opções para seleção
  //       const opts = { multiple: false };

  //       // Tentativa de seleção de contatos
  //       const contacts = await navigator.contacts.select(props, opts);

  //       if (contacts.length > 0) {
  //         const contact = contacts[0];
  //         const contactImageHtml =
  //           contact.icon && contact.icon.length > 0
  //             ? `<img src="${URL.createObjectURL(
  //                 contact.icon[0]
  //               )}" alt="Imagem do contato" style="width:100px; height:auto;">`
  //             : "<p>Sem foto.</p>";

  //         contactInfo.innerHTML = `
  //                         <p><strong>Nome:</strong> ${contact.name}</p>
  //                         <p><strong>Telefone:</strong> ${contact.tel}</p>
  //                         ${contactImageHtml}
  //                     `;
  //       } else {
  //         contactInfo.innerHTML = "<p>Nenhum contato selecionado.</p>";
  //       }
  //     } else {
  //       alert("A API de contatos não é suportada neste navegador.");
  //     }
  //   } catch (error) {
  //     console.error("Erro ao acessar contatos: ", error);
  //     // Mensagem de erro para o usuário
  //     contactInfo.innerHTML =
  //       "<p>Não foi possível acessar os contatos. Permissões necessárias ou suporte indisponível.</p>";
  //   }
  // });

  contactButton.addEventListener("click", async () => {
    // Verificar e requisitar permissões (se necessário na inicialização):
    if (!("contacts" in navigator)) {
      alert("Este navegador não suporta o acesso a contatos.");
    } else if (Notification.permission !== "granted") {
      await Notification.requestPermission();
    }

    try {
      if ("contacts" in navigator && "ContactsManager" in window) {
        const props = ["name", "tel", "icon"]; // Propriedades desejadas
        const opts = { multiple: true }; // Permitir selecionar múltiplos contatos

        const contacts = await navigator.contacts.select(props, opts);

        // Converter e salvar os contatos no localStorage
        saveContactsToLocalStorage(contacts);

        displayContacts(contacts);
      } else {
        alert("A API de contatos não é suportada neste navegador.");
      }
    } catch (error) {
      console.error("Erro ao acessar contatos: ", error);
      contactInfo.innerHTML =
        "<p>Não foi possível acessar os contatos. Permissões necessárias ou suporte indisponível.</p>";
    }
  });

  function saveContactsToLocalStorage(contacts) {
    const contactsToSave = contacts.map(async (contact) => {
      return {
        name: contact.name ? contact.name[0] : "",
        tel: contact.tel ? contact.tel[0] : "",
      };
    });
    localStorage.setItem("savedContacts", JSON.stringify(contactsToSave));
  }

  function displayContacts(contacts) {
    if (contacts.length > 0) {
      contactInfo.innerHTML = contacts
        .map(
          (contact, index) =>
            `
          <div class="contact-entry" data-index="${index}">
            <p><strong>Nome:</strong> ${contact.name}</p>
            <p><strong>Telefone:</strong> ${contact.tel}</p>
            ${
              contact.icon
                ? `<img src="${contact.icon}" style="width:100px; height:auto;">`
                : "<p>Sem foto.</p>"
            }
            <button onclick="removeContact(${index})">Remover</button>
          </div>
        `
        )
        .join("");
    } else {
      contactInfo.innerHTML = "<p>Nenhum contato selecionado.</p>";
    }
  }

  displayContacts(JSON.parse(localStorage.getItem("savedContacts") || "[]"));
});
