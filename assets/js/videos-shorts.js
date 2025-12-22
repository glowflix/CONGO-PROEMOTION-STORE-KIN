// Gestion du carrousel de vidéos shorts pour la section Homme
class VideosShortsCarousel {
    constructor() {
        this.videos = [];
        this.currentIndex = 0;
        this.maxVideos = 5; // Maximum 5 vidéos dans le carrousel
        this.hoverTimeout = null;
        this.init();
    }

    async init() {
        await this.loadVideos();
        this.renderCarousel();
        this.setupEventListeners();
    }

    async loadVideos() {
        try {
            const data = await VideosAPI.getVideos(20); // Charger plus pour avoir du choix
            if (data.videos && data.videos.length > 0) {
                // Prendre seulement les 5 premières vidéos
                this.videos = data.videos.slice(0, this.maxVideos);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des vidéos shorts:', error);
            this.videos = [];
        }
    }

    renderCarousel() {
        const wrapper = document.getElementById('shortsWrapper');
        const viewMore = document.getElementById('shortsViewMore');
        
        if (!wrapper) return;

        // Supprimer le spinner
        const spinner = wrapper.querySelector('.loading-spinner');
        if (spinner) {
            spinner.remove();
        }

        if (this.videos.length === 0) {
            wrapper.innerHTML = '<div class="no-videos"><p>Aucune vidéo disponible</p></div>';
            return;
        }

        // Créer les cartes de vidéos
        wrapper.innerHTML = '';
        this.videos.forEach((video, index) => {
            const card = this.createVideoCard(video, index);
            wrapper.appendChild(card);
        });

        // Afficher le bouton "Voir plus" si on a des vidéos
        if (viewMore && this.videos.length > 0) {
            viewMore.style.display = 'flex';
        }
    }

    createVideoCard(video, index) {
        const card = document.createElement('div');
        card.className = 'short-video-card';
        card.dataset.index = index;
        card.dataset.videoId = video.id;
        
        // Image de couverture ou thumbnail
        const thumbnail = video.coverUrl || video.thumbnail || '/assets/images/video-placeholder.jpg';
        
        card.innerHTML = `
            <div class="short-video-thumbnail">
                <img src="${thumbnail}" 
                     alt="${this.escapeHtml(video.title)}"
                     loading="lazy"
                     onerror="this.src='/assets/images/video-placeholder.jpg'">
                <div class="short-video-overlay">
                    <div class="short-video-play">
                        <i class="fas fa-play"></i>
                    </div>
                    <div class="short-video-duration">${video.duration || '0:00'}</div>
                </div>
            </div>
            <div class="short-video-info">
                <h4 class="short-video-title">${this.escapeHtml(video.title)}</h4>
                <div class="short-video-stats">
                    <span><i class="fas fa-eye"></i> ${video.viewsCount || 0}</span>
                    <span><i class="fas fa-heart"></i> ${video.likesCount || 0}</span>
                </div>
            </div>
        `;

        // Gestion du hover avec effet Netflix
        this.setupHoverEffect(card, video);

        // Clic pour ouvrir en mode TikTok
        card.addEventListener('click', () => {
            if (window.tiktokViewer) {
                window.tiktokViewer.open(this.videos, index);
            }
        });

        return card;
    }

    setupHoverEffect(card, video) {
        let hoverTimer = null;
        const thumbnail = card.querySelector('.short-video-thumbnail');
        const videoElement = thumbnail.querySelector('video');

        card.addEventListener('mouseenter', () => {
            // Démarrer le timer pour l'effet zoom après 2-3 secondes
            hoverTimer = setTimeout(() => {
                card.classList.add('netflix-zoom');
                
                // Si c'est une vidéo, la lancer automatiquement
                if (video.videoUrl && !videoElement) {
                    this.createAutoPlayVideo(card, video);
                }
            }, 2000); // 2 secondes
        });

        card.addEventListener('mouseleave', () => {
            // Annuler le timer
            if (hoverTimer) {
                clearTimeout(hoverTimer);
                hoverTimer = null;
            }
            
            // Retirer l'effet zoom
            card.classList.remove('netflix-zoom');
            
            // Arrêter la vidéo si elle est en lecture
            if (videoElement) {
                videoElement.pause();
                videoElement.currentTime = 0;
            }
        });

        // Pour mobile : utiliser touchstart/touchend
        card.addEventListener('touchstart', () => {
            hoverTimer = setTimeout(() => {
                card.classList.add('netflix-zoom');
                if (video.videoUrl && !videoElement) {
                    this.createAutoPlayVideo(card, video);
                }
            }, 2000);
        });

        card.addEventListener('touchend', () => {
            if (hoverTimer) {
                clearTimeout(hoverTimer);
                hoverTimer = null;
            }
            card.classList.remove('netflix-zoom');
            if (videoElement) {
                videoElement.pause();
                videoElement.currentTime = 0;
            }
        });
    }

    createAutoPlayVideo(card, video) {
        const thumbnail = card.querySelector('.short-video-thumbnail');
        const img = thumbnail.querySelector('img');
        
        // Créer l'élément vidéo
        const videoEl = document.createElement('video');
        videoEl.src = video.videoUrl;
        videoEl.muted = true;
        videoEl.loop = true;
        videoEl.playsInline = true;
        videoEl.className = 'short-video-autoplay';
        
        // Remplacer l'image par la vidéo
        if (img) {
            img.style.display = 'none';
        }
        thumbnail.appendChild(videoEl);
        
        // Lancer la lecture
        videoEl.play().catch(err => {
            console.log('Auto-play bloqué:', err);
        });
    }

    setupEventListeners() {
        // Navigation au clavier (optionnel)
        document.addEventListener('keydown', (e) => {
            const carousel = document.getElementById('videosShortsCarousel');
            if (!carousel || !carousel.contains(document.activeElement)) return;

            if (e.key === 'ArrowLeft') {
                this.navigate(-1);
            } else if (e.key === 'ArrowRight') {
                this.navigate(1);
            }
        });
    }

    navigate(direction) {
        const wrapper = document.getElementById('shortsWrapper');
        if (!wrapper) return;

        const cards = wrapper.querySelectorAll('.short-video-card');
        if (cards.length === 0) return;

        this.currentIndex += direction;
        
        if (this.currentIndex < 0) {
            this.currentIndex = cards.length - 1;
        } else if (this.currentIndex >= cards.length) {
            this.currentIndex = 0;
        }

        // Faire défiler vers la carte active
        const activeCard = cards[this.currentIndex];
        if (activeCard) {
            activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialiser le carrousel quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('videosShortsCarousel')) {
        window.videosShortsCarousel = new VideosShortsCarousel();
    }
});

