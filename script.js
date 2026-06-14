// ==========================================================
// CONFIGURATION GLOBALE
// ==========================================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwLoVBoydPMt1JSYTZ0IE3P4cF1DNeREbFGw0AueNv09XH_shxuUH-GlEFH65tvRJ46JA/exec";

// ==========================================================
// INITIALISATION DE L'APPLICATION (Au chargement de la page)
// ==========================================================
window.addEventListener('DOMContentLoaded', () => {
    initialiserApplication();
});

async function initialiserApplication() {
    // 1. Détection immédiate du réseau
    if (!navigator.onLine) {
        remplacerTexteConfiguration("Hors ligne 🔴", "Mode local activé");
        activerInterface();
        basculerPage('page-accueil'); // Force l'affichage de l'accueil
        return; 
    }

    remplacerTexteConfiguration("En ligne 🟢", "Connexion au serveur...");

    // 2. Lancement de la récupération unique des données
    await chargerDonnees();

    // 3. Quoi qu'il arrive, on libère l'interface et on affiche l'accueil
    activerInterface();
    basculerPage('page-accueil');
}

// ==========================================================
// FONCTION DE CHARGEMENT UNIQUE (Pas de boucle infinie !)
// ==========================================================
async function chargerDonnees() {
    if (!navigator.onLine) {
        console.log("Offline mode: loading local data.");
        return;
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 secondes max d'attente

        // Appel propre avec l'action demandée par ton Apps Script
        const response = await fetch(SCRIPT_URL + "?action=obtenirDonnees", {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        
        const donneesFeuilles = await response.json();

        // Sauvegarde des données fraîches dans le téléphone pour le mode hors-ligne
        localStorage.setItem('sauvegarde_ferme', JSON.stringify(donneesFeuilles));
        remplacerTexteConfiguration("En ligne 🟢", "Prêt !");

    } catch (error) {
        console.log("Le serveur est indisponible ou long. Passage en mode local :", error);
        remplacerTexteConfiguration("Mode dégradé ⚠️", "Données locales chargées");
    }
}

// ==========================================================
// NAVIGATION ET GESTION DES RÔLES / ÉCRANS
// ==========================================================

// Moteur de bascule des pages (Nettoie les classes actives pour éviter les doublons)
function basculerPage(idPage) {
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none'; // Sécurité supplémentaire anti-superposition
    });

    const targetPage = document.getElementById(idPage);
    if (targetPage) {
        targetPage.classList.add('active');
        targetPage.style.display = 'block';
    }
    window.scrollTo(0, 0);
}

// Fonction pour orienter l'utilisateur selon le bouton cliqué
function afficherEcranParRole(role) {
    if (role === 'admin') {
        basculerPage('espace-admin');
    } else if (role === 'partenaire') {
        basculerPage('espace-partenaire');
        if (typeof initialiserDatesPartenaire === "function") {
            initialiserDatesPartenaire();
        }
    } else if (role === 'porcher') {
        basculerPage('espace-porcher');
    }
}

// Fonction de déconnexion universelle
function deconnexion() {
    // Renvoie proprement à l'écran intermédiaire des 3 boutons
    basculerPage('ecran-selection-role');
}

// Modifie cette fonction pour qu'elle ouvre le nouvel écran au lieu de faire une alerte
function ouvrirGestionUtilisateurs() {
    basculerPage('page-nouvel-utilisateur');
}

// Fonction pour récupérer les données du formulaire et les envoyer à Google Sheets
function sauvegarderUtilisateur(event) {
    event.preventDefault(); // Empêche la page de se recharger

    if (!navigator.onLine) {
        alert("🔴 Impossible d'enregistrer : vous êtes hors-ligne. Connectez-vous à Internet.");
        return;
    }

    // Récupération des données saisies sur le téléphone
    const payload = {
        action: "ajouterPersonnel",
        role: document.getElementById('user-role').value,
        nom: document.getElementById('user-nom').value,
        telephone: document.getElementById('user-telephone').value
    };

    // Message d'attente
    remplacerTexteConfiguration("Envoi...", "Enregistrement du profil...");

    // Envoi direct vers ton Apps Script Google Sheets
    fetch(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "text/plain;charset=utf-8" }
    })
    .then(res => res.json())
    .then(response => {
        if (response.status === "success") {
            alert("✅ Enregistrement réussi avec succès dans la base de données !");
            document.getElementById('formulaire-utilisateur').reset(); // Vide le formulaire
            basculerPage('espace-admin'); // Retour automatique au tableau de bord
        } else {
            alert("❌ Erreur du serveur : " + response.message);
        }
        remplacerTexteConfiguration("En ligne 🟢", "Prêt !");
    })
    .catch(err => {
        console.error("Erreur réseau :", err);
        alert("❌ Erreur réseau lors de l'envoi. Veuillez réessayer.");
        remplacerTexteConfiguration("En ligne 🟢", "Prêt !");
    });
}
// ==========================================================
// ENVOI DES DONNÉES DU FORMULAIRE (ENTRÉE PORC)
// ==========================================================
function envoyerEntreePorc(donneesFormulaire) {
  const payload = {
    id: donneesFormulaire.id,              // ex: "PORC-001"
    lot: donneesFormulaire.lot,            // ex: "LOT-A"
    origine: donneesFormulaire.origine,    // ex: "Ferme X"
    poids: donneesFormulaire.poids,        // ex: 45
    date_entree: donneesFormulaire.date,  // ex: "2026-06-13"
    role: donneesFormulaire.role,          // ex: "Engraissement"
    quantite_actuelle: donneesFormulaire.quantite 
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

// ==========================================================
// FONCTIONS DE L'INTERFACE GRAPHIQUE
// ==========================================================
function activerInterface() {
    console.log("Interface débloquée !");
}

function remplacerTexteConfiguration(texteReseau, texteInit) {
    const divReseau = document.getElementById('reseau-id');
    const divInit = document.getElementById('init-id');
    
    if (divReseau) divReseau.textContent = texteReseau;
    if (divInit) divInit.textContent = texteInit;
}
