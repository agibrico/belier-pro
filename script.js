const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwLoVBoydPMt1JSYTZ0IE3P4cF1DNeREbFGw0AueNv09XH_shxuUH-GlEFH65tvRJ46JA/exec";

// Fonction à déclencher lors de la soumission du formulaire d'entrée
function envoyerEntreePorc(donneesFormulaire) {
  const payload = {
    id: donneesFormulaire.id,              // ex: "PORC-001"
    lot: donneesFormulaire.lot,            // ex: "LOT-A"
    origine: donneesFormulaire.origine,    // ex: "Ferme X"
    poids: donneesFormulaire.poids,        // ex: 45
    date_entree: donneesFormulaire.date,  // ex: "2026-06-13"
    role: donneesFormulaire.role,          // ex: "Engraissement"
    quantite_actuelle: donneesFormulaire.quantite // Nombre de porcs dans le lot
  };

  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "text/plain;charset=utf-8" }
  })
  .then(res => res.json())
  .then(response => {
    if (response.status === "success") {
      alert("Enregistrement réussi dans Google Sheets !");
    } else {
      alert("Erreur serveur : " + response.message);
    }
  })
  .catch(err => console.error("Erreur de réseau :", err));
}
// Au chargement de la page
window.addEventListener('DOMContentLoaded', () => {
    initialiserApplication();
});

async function initialiserApplication() {
    const statusReseau = document.body; 
    
    // 1. Détection immédiate du réseau
    if (!navigator.onLine) {
        remplacerTexteConfiguration("Hors ligne 🔴", "Mode local activé");
        activerInterface();
        return; 
    }

    remplacerTexteConfiguration("En ligne 🟢", "Connexion au serveur...");

    // 2. Tentative de récupération des données Google Sheets avec Sécurité (Timeout)
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 secondes max d'attente

        // 🔥 LA CORRECTION EST ICI : On utilise SCRIPT_URL (ton lien Google)
        const response = await fetch(SCRIPT_URL, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const donneesFeuilles = await response.json();

        // Sauvegarde dans le téléphone
        localStorage.setItem('sauvegarde_ferme', JSON.stringify(donneesFeuilles));
        remplacerTexteConfiguration("En ligne 🟢", "Prêt !");

    } catch (error) {
        console.log("Le serveur est indisponible ou long. Passage en mode local :", error);
        remplacerTexteConfiguration("Mode dégradé ⚠️", "Données locales chargées");
    }

    // 3. Quoi qu'il arrive, on libère l'interface !
    activerInterface();
}


function activerInterface() {
    // Code pour rendre votre bouton "PROJET PORC" actif et cliquable
    // Exemple : document.getElementById('btn-porc').removeAttribute('disabled');
    console.log("Interface débloquée !");
}

function remplacerTexteConfiguration(texteReseau, texteInit) {
    // Adaptez ce code avec vos propres ID ou classes HTML
    // Exemple : 
    // document.getElementById('reseau-id').textContent = texteReseau;
    // document.getElementById('init-id').textContent = texteInit;
}

