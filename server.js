// server.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const sendMail = require('./config/mail'); // Assurez-vous que le chemin est correct
const app = express();

// Middleware
app.use(express.json());
app.use(bodyParser.json());

// Servir les fichiers statiques depuis le dossier public
app.use(express.static('public'));

// Route pour servir la page principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Le fichier index.html à la racine
});

// Route pour traiter l'inscription
app.post('/inscription', async (req, res) => {
    const { nom, age, telephone, ethnie, vodoun, vodoun_autres, gmail } = req.body;

    // Validation des données
    if (!nom || !age || !telephone || !ethnie || !vodoun || !gmail) {
        return res.json({ 
            success: false, 
            message: 'Tous les champs obligatoires doivent être remplis.' 
        });
    }

    // Validation de l'email Gmail
    if (!gmail.endsWith('@gmail.com')) {
        return res.json({ 
            success: false, 
            message: 'Veuillez utiliser une adresse Gmail valide.' 
        });
    }

    // Déterminer la divinité
    const divinite = vodoun === 'Autres' ? vodoun_autres : vodoun;
    
    if (vodoun === 'Autres' && !vodoun_autres) {
        return res.json({ 
            success: false, 
            message: 'Veuillez préciser la divinité Vodoun.' 
        });
    }

    // Message à envoyer par email
    const message = `
Nouvelle inscription au Vodoun :

👤 Nom : ${nom}
🎂 Âge : ${age}
📞 Téléphone : ${telephone}
🌍 Ethnie : ${ethnie}
🧿 Divinité : ${divinite}
📧 Gmail : ${gmail}
💰 Montant à payer : 1,000 FCFA
📱 Numéro de paiement : 97 00 00 00
📝 Référence : ${gmail}

---
Inscription effectuée le : ${new Date().toLocaleString('fr-FR')}
`;

    try {
        // Envoyer l'email de confirmation
        const emailResult = await sendMail(message, gmail, 'Confirmation d\'inscription Vodoun');
        
        console.log(`✅ Inscription ET email réussis pour ${nom} (${gmail})`);
        
        res.json({ 
            success: true, 
            message: 'Inscription enregistrée et email envoyé avec succès.',
            emailSent: true
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi de l\'email :', error.message);
        
        res.json({ 
            success: false, 
            message: 'Erreur lors de l\'envoi de l\'email de confirmation : ' + error.message,
            emailSent: false
        });
    }
});

// Route pour obtenir des statistiques (optionnel)
app.get('/stats', (req, res) => {
    res.json({
        status: 'Service actif',
        timestamp: new Date().toISOString()
    });
});

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Route non trouvée' 
    });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📱 Accédez à votre site: http://localhost:${PORT}`);
    console.log(`📧 Service email configuré`);
});

module.exports = app;
