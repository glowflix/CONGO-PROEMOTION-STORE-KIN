// Outil de débogage pour diagnostiquer les problèmes API

class APIDebugger {
    constructor() {
        this.init();
    }

    init() {
        // Exposer globalement pour la console
        window.debugAPI = this;
        
        // Afficher les infos de configuration
        console.log('%c🔧 Congo Promotion Store - Debug Mode', 'color: #3b82f6; font-size: 16px; font-weight: bold;');
        console.log('API URL:', API_CONFIG?.baseUrl || 'Non configuré');
        console.log('Utilisez window.debugAPI.test() pour tester l\'API');
    }

    async test(route = 'products', params = { limit: 5 }) {
        console.log(`🧪 Test de l'API: route=${route}`, params);
        
        try {
            const url = new URL(API_CONFIG.baseUrl);
            url.searchParams.append('route', route);
            Object.keys(params).forEach(key => {
                url.searchParams.append(key, params[key]);
            });
            
            console.log('📡 URL de test:', url.toString());
            
            const response = await fetch(url.toString(), {
                method: 'GET',
                mode: 'cors',
                redirect: 'follow'
            });
            
            console.log('📥 Status:', response.status, response.statusText);
            console.log('📥 Headers:', [...response.headers.entries()]);
            
            const text = await response.text();
            console.log('📄 Réponse brute:', text);
            
            try {
                const json = JSON.parse(text);
                console.log('✅ JSON parsé:', json);
                return json;
            } catch (e) {
                console.error('❌ Erreur de parsing JSON:', e);
                console.error('Texte reçu:', text);
                return { error: 'Pas du JSON', text };
            }
        } catch (error) {
            console.error('❌ Erreur de requête:', error);
            return { error: error.message };
        }
    }

    async testAll() {
        console.log('🧪 Test de tous les endpoints...\n');
        
        const tests = [
            { route: 'products', params: { limit: 3 } },
            { route: 'videos', params: { limit: 2 } }
        ];
        
        for (const test of tests) {
            console.log(`\n--- Test: ${test.route} ---`);
            await this.test(test.route, test.params);
            await new Promise(resolve => setTimeout(resolve, 500)); // Pause entre les tests
        }
    }

    checkConfig() {
        console.log('⚙️ Configuration API:');
        console.log('  - URL:', API_CONFIG.baseUrl);
        console.log('  - Timeout:', API_CONFIG.timeout);
        console.log('  - URL valide:', API_CONFIG.baseUrl.includes('script.google.com'));
        console.log('  - URL complète:', API_CONFIG.baseUrl !== 'YOUR_SCRIPT_ID');
    }

    checkSheets() {
        console.log('📊 Vérification Sheets:');
        console.log('  - ID configuré dans Code.gs: 1DH7Gl7Pk9Zi4mHr7b4Wa3hr-q66KQ0TJEZJt1ivYd2Q');
        console.log('  - URL Sheets: https://docs.google.com/spreadsheets/d/1DH7Gl7Pk9Zi4mHr7b4Wa3hr-q66KQ0TJEZJt1ivYd2Q/edit');
        console.log('  - Vérifiez que les onglets existent: Products, Videos, Comments, etc.');
    }
}

// Initialiser le débogueur
const apiDebugger = new APIDebugger();
window.apiDebugger = apiDebugger;

// Afficher les instructions
console.log(`
%c🛠️ Outils de débogage disponibles:
%c
window.debugAPI.test('products', { limit: 5 })  - Tester un endpoint
window.debugAPI.testAll()                       - Tester tous les endpoints
window.debugAPI.checkConfig()                  - Vérifier la configuration
window.debugAPI.checkSheets()                  - Vérifier Sheets
`, 'color: #10b981; font-weight: bold;', 'color: #94a3b8;');

