const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

const FEDAPAY_CONFIG = {
    baseURL: 'https://api.fedapay.com/v1',
    publicKey: process.env.FEDAPAY_PUBLIC_KEY || 'pk_sandbox_votre_cle_publique',
    privateKey: process.env.FEDAPAY_PRIVATE_KEY || 'sk_sandbox_votre_cle_privee',
    amount: 1000,
    currency: 'XOF'
};

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/inscription', async (req, res) => {
    try {
        const { nom, age, ethnie, vodoun, vodoun_autres, gmail } = req.body;

        if (!nom || !age || !ethnie || telephone || !vodoun || !gmail) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs obligatoires doivent être remplis'
            });
        }

        const inscriptionData = {
            nom,
            age: parseInt(age),
            ethnie,
            vodoun: vodoun === 'Autres' ? vodoun_autres : vodoun,
            gmail,
            dateInscription: new Date().toISOString(),
            statut: 'en_attente_paiement'
        };

        const transactionData = {
            description: `Inscription Vodoun - ${nom}`,
            amount: FEDAPAY_CONFIG.amount,
            currency: FEDAPAY_CONFIG.currency,
            callback_url: `${req.protocol}://${req.get('host')}/webhook/fedapay`,
            return_url: `${req.protocol}://${req.get('host')}/success`,
            cancel_url: `${req.protocol}://${req.get('host')}/cancel`,
            custom_metadata: {
                inscription_id: Date.now().toString(),
                nom: nom,
                gmail: gmail
            }
        };

        const fedapayResponse = await axios.post(
            `${FEDAPAY_CONFIG.baseURL}/transactions`,
            transactionData,
            {
                headers: {
                    'Authorization': `Bearer ${FEDAPAY_CONFIG.privateKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (fedapayResponse.data && fedapayResponse.data.token) {
            global.pendingInscriptions = global.pendingInscriptions || {};
            global.pendingInscriptions[fedapayResponse.data.token] = inscriptionData;

            res.json({
                success: true,
                payment_url: fedapayResponse.data.url,
                transaction_token: fedapayResponse.data.token,
                message: 'Redirection vers le paiement...'
            });
        } else {
            throw new Error('Erreur lors de la création de la transaction');
        }

    } catch (error) {
        console.error('Erreur inscription:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du traitement de l\'inscription'
        });
    }
});

app.post('/webhook/fedapay', (req, res) => {
    try {
        const { transaction, event } = req.body;

        if (event === 'transaction.approved') {
            const inscriptionData = global.pendingInscriptions[transaction.token];
            
            if (inscriptionData) {
                inscriptionData.statut = 'payee';
                inscriptionData.transaction_id = transaction.id;
                inscriptionData.datePaiement = new Date().toISOString();

                global.completedInscriptions = global.completedInscriptions || [];
                global.completedInscriptions.push(inscriptionData);

                delete global.pendingInscriptions[transaction.token];

                console.log('Inscription confirmée:', inscriptionData);
            }
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Erreur webhook:', error);
        res.status(500).json({ error: 'Erreur webhook' });
    }
});

app.get('/success', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <title>Inscription Réussie</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .success { color: #28a745; font-size: 24px; margin-bottom: 20px; }
                .message { font-size: 18px; color: #333; }
                .btn { 
                    background: #007BFF; color: white; padding: 10px 20px; 
                    text-decoration: none; border-radius: 5px; margin-top: 20px; 
                    display: inline-block;
                }
            </style>
        </head>
        <body>
            <div class="success">✅ Inscription Réussie !</div>
            <div class="message">
                Votre paiement a été confirmé et votre inscription au Vodoun est maintenant active.
                <br><br>
                Vous recevrez bientôt un email de confirmation.
            </div>
            <a href="/" class="btn">Retour à l'accueil</a>
        </body>
        </html>
    `);
});

app.get('/cancel', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <title>Paiement Annulé</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .cancel { color: #dc3545; font-size: 24px; margin-bottom: 20px; }
                .message { font-size: 18px; color: #333; }
                .btn { 
                    background: #007BFF; color: white; padding: 10px 20px; 
                    text-decoration: none; border-radius: 5px; margin-top: 20px; 
                    display: inline-block;
                }
            </style>
        </head>
        <body>
            <div class="cancel">❌ Paiement Annulé</div>
            <div class="message">
                Votre paiement a été annulé. Votre inscription n'est pas confirmée.
                <br><br>
                Vous pouvez réessayer quand vous le souhaitez.
            </div>
            <a href="/" class="btn">Retour à l'accueil</a>
        </body>
        </html>
    `);
});

// Route pour vérifier le statut d'une transaction
app.get('/status/:token', async (req, res) => {
    try {
        const { token } = req.params;
        
        const response = await axios.get(
            `${FEDAPAY_CONFIG.baseURL}/transactions/${token}`,
            {
                headers: {
                    'Authorization': `Bearer ${FEDAPAY_CONFIG.privateKey}`
                }
            }
        );

        res.json({
            success: true,
            transaction: response.data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la vérification du statut'
        });
    }
});

app.get('/admin/inscriptions', (req, res) => {
    const inscriptions = global.completedInscriptions || [];
    res.json({
        success: true,
        inscriptions: inscriptions,
        total: inscriptions.length
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📝 Formulaire disponible sur: http://localhost:${PORT}`);
    console.log(`💳 Paiement configuré: ${FEDAPAY_CONFIG.amount} ${FEDAPAY_CONFIG.currency}`);
});

process.on('uncaughtException', (error) => {
    console.error('Erreur non capturée:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promesse rejetée:', reason);
});
