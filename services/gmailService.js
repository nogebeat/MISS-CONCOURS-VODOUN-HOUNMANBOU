const { google } = require('googleapis');
const nodemailer = require('nodemailer');

class GmailService {

    async getAccessToken() {
        try {
            const { credentials } = await this.oauth2Client.refreshAccessToken();
            return credentials.access_token;
        } catch (error) {
            console.error('Erreur lors de l\'obtention du token d\'accès:', error);
            throw error;
        }
    }

    async createTransporter() {
        try {
            const accessToken = await this.getAccessToken();

            const transporter = nodemailer.createTransporter({
                service: 'gmail',
                auth: {
                    user: 'eliseeadan@gmail.com',
                    pass: 'nlbk tpkm mtqe uokn',
                }
            });

            return transporter;
        } catch (error) {
            console.error('Erreur lors de la création du transporteur:', error);
            throw error;
        }
    }

    generateEmailTemplate(inscriptionData) {
        const { nom, age, ethnie, vodoun, gmail, dateInscription, transaction_id } = inscriptionData;
        
        return {
            subject: '✅ Confirmation d\'inscription au Vodoun',
            html: `
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Confirmation d'inscription</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            background: linear-gradient(135deg, #007BFF, #0056b3);
                            color: white;
                            padding: 30px;
                            text-align: center;
                            border-radius: 10px 10px 0 0;
                        }
                        .content {
                            background: #f8f9fa;
                            padding: 30px;
                            border-radius: 0 0 10px 10px;
                        }
                        .info-section {
                            background: white;
                            padding: 20px;
                            margin: 20px 0;
                            border-radius: 8px;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                        }
                        .info-row {
                            display: flex;
                            justify-content: space-between;
                            margin: 10px 0;
                            padding: 8px 0;
                            border-bottom: 1px solid #eee;
                        }
                        .info-label {
                            font-weight: bold;
                            color: #007BFF;
                        }
                        .success-badge {
                            background: #28a745;
                            color: white;
                            padding: 10px 20px;
                            border-radius: 20px;
                            display: inline-block;
                            margin: 20px 0;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 30px;
                            padding: 20px;
                            color: #666;
                            border-top: 1px solid #eee;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>🎉 Inscription Confirmée</h1>
                        <p>Bienvenue dans la communauté Vodoun</p>
                    </div>
                    
                    <div class="content">
                        <div class="success-badge">
                            ✅ Paiement confirmé - Inscription validée
                        </div>
                        
                        <p>Bonjour <strong>${nom}</strong>,</p>
                        
                        <p>Nous sommes ravis de confirmer votre inscription au Vodoun. Votre paiement a été traité avec succès et votre inscription est maintenant active.</p>
                        
                        <div class="info-section">
                            <h3>📋 Détails de votre inscription</h3>
                            <div class="info-row">
                                <span class="info-label">Nom complet :</span>
                                <span>${nom}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Âge :</span>
                                <span>${age} ans</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Ethnie :</span>
                                <span>${ethnie}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Divinité Vodoun :</span>
                                <span>${vodoun}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Email :</span>
                                <span>${gmail}</span>
                            </div>
                        </div>
                        
                        <div class="info-section">
                            <h3>💳 Informations de paiement</h3>
                            <div class="info-row">
                                <span class="info-label">Date d'inscription :</span>
                                <span>${new Date(dateInscription).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Montant payé :</span>
                                <span>1,000 FCFA</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">ID Transaction :</span>
                                <span>${transaction_id}</span>
                            </div>
                        </div>
                        
                        <div class="info-section">
                            <h3>📢 Prochaines étapes</h3>
                            <p>Votre inscription est maintenant confirmée. Vous recevrez bientôt des informations supplémentaires concernant :</p>
                            <ul>
                                <li>Les prochaines cérémonies et événements</li>
                                <li>Les formations et initiations</li>
                                <li>Les rencontres communautaires</li>
                            </ul>
                        </div>
                        
                        <p>Si vous avez des questions ou besoin d'assistance, n'hésitez pas à nous contacter.</p>
                        
                        <p>Que les divinités vous accompagnent dans votre parcours spirituel !</p>
                    </div>
                    
                    <div class="footer">
                        <p>© 2025 Communauté Vodoun - Tous droits réservés</p>
                        <p>Cet email a été généré automatiquement, merci de ne pas y répondre.</p>
                    </div>
                </body>
                </html>
            `,
            text: `
Confirmation d'inscription au Vodoun

Bonjour ${nom},

Nous sommes ravis de confirmer votre inscription au Vodoun. Votre paiement a été traité avec succès.

Détails de votre inscription :
- Nom complet : ${nom}
- Âge : ${age} ans
- Ethnie : ${ethnie}
- Divinité Vodoun : ${vodoun}
- Email : ${gmail}
- Date d'inscription : ${new Date(dateInscription).toLocaleDateString('fr-FR')}
- Montant payé : 1,000 FCFA
- ID Transaction : ${transaction_id}

Votre inscription est maintenant confirmée. Vous recevrez bientôt des informations supplémentaires.

Que les divinités vous accompagnent dans votre parcours spirituel !

© 2025 Communauté Vodoun
            `
        };
    }

    async sendConfirmationEmail(inscriptionData) {
        try {
            const transporter = await this.createTransporter();
            const emailTemplate = this.generateEmailTemplate(inscriptionData);

            const mailOptions = {
                from: `"Communauté Vodoun" <eliseeadan@gmail.com>`,
                to: inscriptionData.gmail,
                subject: emailTemplate.subject,
                text: emailTemplate.text,
                html: emailTemplate.html
            };

            const result = await transporter.sendMail(mailOptions);
            console.log('✅ Email de confirmation envoyé:', result.messageId);
            return { success: true, messageId: result.messageId };

        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
            throw error;
        }
    }

    async sendAdminNotification(inscriptionData) {
        try {
            const transporter = await this.createTransporter();
            
            const mailOptions = {
                from: `"Système Vodoun" <${process.env.GMAIL_USER_EMAIL}>`,
                to: process.env.GMAIL_USER_EMAIL,
                subject: `🔔 Nouvelle inscription - ${inscriptionData.nom}`,
                html: `
                    <h2>Nouvelle inscription reçue</h2>
                    <p><strong>Nom :</strong> ${inscriptionData.nom}</p>
                    <p><strong>Âge :</strong> ${inscriptionData.age} ans</p>
                    <p><strong>Ethnie :</strong> ${inscriptionData.ethnie}</p>
                    <p><strong>Divinité :</strong> ${inscriptionData.vodoun}</p>
                    <p><strong>Email :</strong> ${inscriptionData.gmail}</p>
                    <p><strong>Transaction :</strong> ${inscriptionData.transaction_id}</p>
                    <p><strong>Date :</strong> ${new Date(inscriptionData.dateInscription).toLocaleString('fr-FR')}</p>
                `
            };

            const result = await transporter.sendMail(mailOptions);
            console.log('✅ Notification admin envoyée:', result.messageId);
            return { success: true, messageId: result.messageId };

        } catch (error) {
            console.error('❌ Erreur notification admin:', error);
            throw error;
        }
    }
}

module.exports = new GmailService();
