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
    if (taches.length === 0) {
        const empty = document.createElement("li");
        empty.style.cssText = "text-align: center; color: #999; padding: 20px; border: none;";
        empty.textContent = "Aucune tâche pour le moment. Créez-en une! 🚀";
        listeTaches.appendChild(empty);
    } else {
        taches.forEach((t, i) => {
            const li = document.createElement("li");
            const content = document.createElement("span");
            content.textContent = `${t.nom} ${t.deadline ? '📅 ' + t.deadline : ''}`;
            li.appendChild(content);
            const btnSuppr = document.createElement("button");
            btnSuppr.innerHTML = '<i class="fas fa-trash"></i> Supprimer';
            btnSuppr.onclick = () => { taches.splice(i,1); sauvegarderTaches(); afficherTaches(); miseAJourStats(); };
            li.appendChild(btnSuppr);
            listeTaches.appendChild(li);
        });
    }
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
    if (depenses.length === 0) {
        const empty = document.createElement("li");
        empty.style.cssText = "text-align: center; color: #999; padding: 20px; border: none;";
        empty.textContent = "Aucune dépense enregistrée. C'est économique! 💰";
        listeDepenses.appendChild(empty);
    } else {
        depenses.forEach((d, i) => {
            total += parseFloat(d.montant);
            const li = document.createElement("li");
            const content = document.createElement("span");
            content.innerHTML = `<strong>${d.nom}</strong> <span style="color: #667eea; font-weight: 600;">$${parseFloat(d.montant).toFixed(2)}</span>`;
            li.appendChild(content);
            const btnSuppr = document.createElement("button");
            btnSuppr.innerHTML = '<i class="fas fa-trash"></i> Supprimer';
            btnSuppr.onclick = () => { depenses.splice(i,1); sauvegarderDepenses(); afficherDepenses(); miseAJourStats(); };
            li.appendChild(btnSuppr);
            listeDepenses.appendChild(li);
        });
    }
    document.getElementById("total-budget").textContent = total.toFixed(2);
    totalDepensesEl.textContent = total.toFixed(2);
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

    stress = Math.round(20 + taches.length * 5);
    energie = Math.round(100 - stress/2);
    motivation = Math.round(80 - stress/3);
    if(motivation < 0) motivation = 0;
    if(energie > 100) energie = 100;

    stressEl.textContent = stress;
    energieEl.textContent = energie;
    motivationEl.textContent = motivation;
    const totalDepenses = depenses.reduce((a,b)=>a+parseFloat(b.montant),0);
    if(stress > 80) {
        messageEl.textContent = "😰 Tu es trop stressé, prends une pause !";
        messageEl.style.background = "linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)";
    } else if(totalDepenses > 100) {
        messageEl.textContent = "💸 Attention à tes dépenses !";
        messageEl.style.background = "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)";
    } else if(taches.length > 0) {
        messageEl.textContent = "✅ Bravo, tu es productif !";
        messageEl.style.background = "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)";
    } else {
        messageEl.textContent = "😊 Tout est calme pour le moment.";
        messageEl.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    }
}

afficherTaches();
afficherDepenses();
miseAJourStats();
