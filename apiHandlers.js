// apiHandlers.js
// À placer dans le dossier scripts

// Gestionnaire pour l'API Géo
class GeoAPI {
   static async getLocations(type, search = '') {
   try {
       console.log(`Récupération des ${type} (search: ${search})`);
       let url = '';
       switch(type) {
           case 'Région':
               url = `https://geo.api.gouv.fr/regions`;
               break;
           case 'Département':
               url = `https://geo.api.gouv.fr/departements`;
               break;
           case 'Ville':
               if (search.length < 3) {
                   console.log('Recherche trop courte');
                   return [];
               }
               url = `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(search)}&boost=population`;
               break;
           default:
               throw new Error('Type de localisation non valide');
       }

       console.log(`URL de requête : ${url}`);
       console.log(`URL complète de la requête : ${url}`);
       const response = await fetch(url);
       console.log(`Statut de la réponse : ${response.status}`);

       if (!response.ok) {
           throw new Error(`Erreur HTTP: ${response.status}`);
       }

       const data = await response.json();
       console.log('Données reçues :', data);

       return data.map(item => ({
           code: item.code,
           nom: item.nom
       }));
   } catch (error) {
       console.error('Erreur lors de la récupération des données géographiques:', error);
       return [];
   }
}

// Gestionnaire pour l'API GPT
class GPTAPI {
   static async generateText(prompt) {
       try {
           const response = await fetch(API_CONFIG.GPT_URL, {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json',
                   'Authorization': `Bearer ${API_CONFIG.GPT_KEY}`
               },
               body: JSON.stringify({
                   model: API_CONFIG.GPT_MODEL,
                   messages: [
                       { role: "user", content: prompt }
                   ],
                   store: true
               })
           });

           if (!response.ok) {
               throw new Error(`Erreur HTTP: ${response.status}`);
           }

           const data = await response.json();
           return data.choices[0].message.content;
       } catch (error) {
           console.error('Erreur lors de la génération du texte:', error);
           throw error;
       }
   }

   static generatePrompt(formData) {
       const basePrompt = `Générez un texte de 800 mots en français avec les caractéristiques suivantes :
- Utilisez uniquement la voix active
- Écrivez des phrases courtes (15-20 mots maximum)
- Adoptez un style direct et dynamique
- Utilisez un ton chaleureux et accueillant
- La requête SEO '${formData.seoQuery}' doit apparaître 10 fois\n\n`;

       let specificPrompt = '';
       switch(parseInt(formData.pageType)) {
           case PAGE_TYPES.HEBERGEMENT:
               specificPrompt = this.getHebergementPrompt(formData);
               break;
           case PAGE_TYPES.SEJOUR:
               specificPrompt = this.getSejourPrompt(formData);
               break;
           case PAGE_TYPES.WEEKEND:
               specificPrompt = this.getWeekendPrompt(formData);
               break;
           case PAGE_TYPES.DESTINATION:
               specificPrompt = this.getDestinationPrompt(formData);
               break;
       }

       return basePrompt + specificPrompt;
   }

   // Méthodes privées pour générer les prompts spécifiques
   static getHebergementPrompt(formData) {
       return `Structure du texte pour hébergement :
1. Comment choisir votre ${formData.specificType} en ${formData.destination} ?
2. Avantages de choisir un ${formData.specificType}
3. Profitez de la tranquillité de ${formData.destination} dans votre ${formData.specificType}
4. À la découverte des ${formData.specificType}s authentiques de ${formData.destination}
5. Activités et expériences autour de votre ${formData.specificType}
6. Conseils pour réserver votre ${formData.specificType} idéal
Conclusion: Réservez votre ${formData.specificType} en ${formData.destination} avec Hortense
Incluez 4-5 références naturelles aux types de séjours possibles et destinations populaires`;
   }

// Suite de apiHandlers.js

   static getSejourPrompt(formData) {
       return `Structure du texte pour séjour :
1. Que faire lors d'un ${formData.specificType} ?
2. Bien choisir sa destination pour un ${formData.specificType}
3. Séjourner dans un hébergement typique
4. Découvrez les activités pour un ${formData.specificType}
5. Voyager de manière responsable pendant votre ${formData.specificType}
6. Détendez-vous et profitez
Conclusion: Organisez votre ${formData.specificType} avec Hortense
Incluez 4-5 références naturelles aux types d'hébergements adaptés et destinations recommandées`;
   }

   static getWeekendPrompt(formData) {
       return `Structure du texte pour week-end :
1. Que faire lors d'un week-end à ${formData.destination} ?
2. Séjourner dans un hébergement typique
3. Explorer des paysages époustouflants
4. Découvrir le patrimoine historique
5. Déguster les saveurs locales
6. Partager des moments uniques
Conclusion: Un week-end à ${formData.destination} avec Hortense
Incluez 4-5 références naturelles aux types d'hébergements locaux et activités thématiques possibles`;
   }

   static getDestinationPrompt(formData) {
       return `Structure du texte pour destination :
1. Découvrir ${formData.destination} : Guide complet
2. Où séjourner à ${formData.destination} ?
3. Les incontournables de ${formData.destination}
4. Activités et expériences uniques en ${formData.destination}
5. Saveurs et traditions de ${formData.destination}
6. Comment explorer ${formData.destination} de manière responsable ?
Conclusion: Planifiez votre séjour en ${formData.destination} avec Hortense
Incluez 4-5 références naturelles aux types d'hébergements disponibles et séjours populaires`;
   }
}

// Export des classes pour utilisation dans d'autres fichiers
export { GeoAPI, GPTAPI };