let taches = JSON.parse(localStorage.getItem("taches")) || [];
let depenses = JSON.parse(localStorage.getItem("depenses")) || [];
let energie = 100;
let stress = 20;
let motivation = 80;

const nbTaches = document.getElementById("nb-taches");
const totalDepensesEl = document.getElementById("total-depenses");
const energieEl = document.getElementById("energie");
const stressEl = document.getElementById("stress");
const motivationEl = document.getElementById("motivation");
const messageEl = document.getElementById("message");

const listeTaches = document.getElementById("liste-taches");
const listeDepenses = document.getElementById("liste-depenses");

function afficherTaches() {
    listeTaches.innerHTML = "";
    taches.forEach((t, i) => {
        const li = document.createElement("li");
        li.textContent = `${t.nom} (Deadline: ${t.deadline || "Aucune"})`;
        const btnSuppr = document.createElement("button");
        btnSuppr.textContent = "Supprimer";
        btnSuppr.onclick = () => { taches.splice(i,1); sauvegarderTaches(); afficherTaches(); miseAJourStats(); };
        li.appendChild(btnSuppr);
        listeTaches.appendChild(li);
    });
    nbTaches.textContent = taches.length;
}
function sauvegarderTaches() {
    localStorage.setItem("taches", JSON.stringify(taches));
}

document.getElementById("tacheForm").addEventListener("submit", e => {
    e.preventDefault();
    const nom = document.getElementById("tache-input").value;
    const deadline = document.getElementById("deadline").value;
    taches.push({nom, deadline});
    sauvegarderTaches();
    afficherTaches();
    document.getElementById("tacheForm").reset();
    miseAJourStats();
});

function afficherDepenses() {
    listeDepenses.innerHTML = "";
    let total = 0;
    depenses.forEach((d, i) => {
        total += parseFloat(d.montant);
        const li = document.createElement("li");
        li.textContent = `${d.nom} : $${d.montant}`;
        const btnSuppr = document.createElement("button");
        btnSuppr.textContent = "Supprimer";
        btnSuppr.onclick = () => { depenses.splice(i,1); sauvegarderDepenses(); afficherDepenses(); miseAJourStats(); };
        li.appendChild(btnSuppr);
        listeDepenses.appendChild(li);
    });
    document.getElementById("total-budget").textContent = total;
    totalDepensesEl.textContent = total;
}

function sauvegarderDepenses() {
    localStorage.setItem("depenses", JSON.stringify(depenses));
}

document.getElementById("budgetForm").addEventListener("submit", e => {
    e.preventDefault();
    const nom = document.getElementById("depense-nom").value;
    const montant = document.getElementById("depense-montant").value;
    depenses.push({nom, montant});
    sauvegarderDepenses();
    afficherDepenses();
    document.getElementById("budgetForm").reset();
    miseAJourStats();
});

function miseAJourStats() {

    stress = 20 + taches.length * 5;
    energie = 100 - stress/2;
    motivation = 80 - stress/3;
    if(motivation < 0) motivation = 0;

    stressEl.textContent = stress;
    energieEl.textContent = energie;
    motivationEl.textContent = motivation;
    if(stress > 80) {
        messageEl.textContent = "😰 Tu es trop stressé, prends une pause !";
    } else if(depenses.reduce((a,b)=>a+parseFloat(b.montant),0) > 100) {
        messageEl.textContent = "💸 Attention à tes dépenses !";
    } else if(taches.length > 0) {
        messageEl.textContent = "✅ Bravo, tu es productif !";
    } else {
        messageEl.textContent = "😊 Tout est calme pour le moment.";
    }
}

afficherTaches();
afficherDepenses();
miseAJourStats();
