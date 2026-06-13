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
