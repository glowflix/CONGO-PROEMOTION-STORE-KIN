// Gestion de la page contact
class ContactManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupContactForm();
        this.setupAIAssistant();
    }

    setupContactForm() {
        const form = document.getElementById('contactForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit(e);
            });
        }
    }

    async handleSubmit(e) {
        const form = e.target;
        const formData = new FormData(form);
        
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };

        // Validation
        if (!data.name || !data.email || !data.subject || !data.message) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        // Simuler l'envoi (dans une vraie app, envoyer à l'API)
        console.log('Données du formulaire:', data);
        
        // Afficher un message de succès
        alert('Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.');
        form.reset();
    }

    setupAIAssistant() {
        const askBtn = document.getElementById('askAIBtn');
        const questionInput = document.getElementById('aiQuestion');
        const answerDiv = document.getElementById('aiAnswer');

        if (askBtn && questionInput && answerDiv) {
            askBtn.addEventListener('click', () => {
                this.askQuestion();
            });

            questionInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.askQuestion();
                }
            });
        }
    }

    async askQuestion() {
        const questionInput = document.getElementById('aiQuestion');
        const answerDiv = document.getElementById('aiAnswer');
        
        if (!questionInput || !answerDiv) return;

        const question = questionInput.value.trim();
        if (!question) {
            alert('Veuillez poser une question');
            return;
        }

        // Afficher un loader
        answerDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Recherche en cours...';
        answerDiv.classList.add('show');

        try {
            const response = await AIAPI.askQuestion(question);
            answerDiv.innerHTML = `
                <strong><i class="fas fa-robot"></i> Réponse :</strong>
                <p style="margin-top: 0.5rem;">${this.escapeHtml(response.answer || 'Désolé, je ne comprends pas votre question.')}</p>
            `;
        } catch (error) {
            console.error('Erreur lors de la question IA:', error);
            answerDiv.innerHTML = `
                <strong><i class="fas fa-exclamation-triangle"></i> Erreur :</strong>
                <p style="margin-top: 0.5rem;">Impossible de traiter votre question. Veuillez réessayer plus tard.</p>
            `;
        }

        questionInput.value = '';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ContactManager();
});

