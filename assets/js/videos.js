// Gestion de la page vidéos
class VideosManager {
    constructor() {
        this.videos = [];
        this.cursor = null;
        this.loading = false;
        this.init();
    }

    init() {
        this.loadVideos();
        this.setupLoadMore();
    }

    async loadVideos() {
        if (this.loading) return;
        
        this.loading = true;
        const grid = document.getElementById('videosGrid');
        
        try {
            const data = await VideosAPI.getVideos(20, this.cursor);
            
            if (data.videos && data.videos.length > 0) {
                this.videos.push(...data.videos);
                this.cursor = data.cursor;
                this.renderVideos();
                
                const loadMoreBtn = document.getElementById('loadMoreBtn');
                if (data.hasMore && loadMoreBtn) {
                    loadMoreBtn.style.display = 'block';
                }
            } else {
                grid.innerHTML = '<div class="loading-spinner"><p>Aucune vidéo trouvée</p></div>';
            }
        } catch (error) {
            console.error('Erreur lors du chargement des vidéos:', error);
            grid.innerHTML = `
                <div class="loading-spinner">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Erreur de chargement. Veuillez réessayer.</p>
                </div>
            `;
        } finally {
            this.loading = false;
        }
    }

    renderVideos() {
        const grid = document.getElementById('videosGrid');
        
        if (this.videos.length === 0) {
            grid.innerHTML = '<div class="loading-spinner"><p>Aucune vidéo trouvée</p></div>';
            return;
        }

        const spinner = grid.querySelector('.loading-spinner');
        if (spinner) {
            spinner.remove();
        }

        this.videos.forEach(video => {
            if (!document.getElementById(`video-${video.id}`)) {
                const card = this.createVideoCard(video);
                grid.appendChild(card);
            }
        });
    }

    createVideoCard(video) {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.id = `video-${video.id}`;
        
        card.innerHTML = `
            <div class="video-thumbnail">
                <img src="${video.coverUrl || '/assets/images/video-placeholder.jpg'}" 
                     alt="${video.title}"
                     onerror="this.src='/assets/images/video-placeholder.jpg'">
                <div class="video-play-button">
                    <i class="fas fa-play"></i>
                </div>
            </div>
            <div class="video-info">
                <h3 class="video-title">${this.escapeHtml(video.title)}</h3>
                <div class="video-stats">
                    <div class="video-stat">
                        <i class="fas fa-heart"></i>
                        <span>${video.likesCount || 0}</span>
                    </div>
                    <div class="video-stat">
                        <i class="fas fa-comment"></i>
                        <span>${video.commentsCount || 0}</span>
                    </div>
                    <div class="video-stat">
                        <i class="fas fa-eye"></i>
                        <span>${video.viewsCount || 0}</span>
                    </div>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            this.openVideoModal(video);
        });

        return card;
    }

    openVideoModal(video) {
        // Créer le modal s'il n'existe pas
        let modal = document.getElementById('videoModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'videoModal';
            modal.className = 'video-modal';
            modal.innerHTML = `
                <div class="video-modal-content">
                    <button class="video-modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                    <video controls autoplay>
                        <source src="" type="video/mp4">
                        Votre navigateur ne supporte pas la lecture de vidéos.
                    </video>
                </div>
            `;
            document.body.appendChild(modal);

            // Fermer le modal
            const closeBtn = modal.querySelector('.video-modal-close');
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
                const videoEl = modal.querySelector('video');
                if (videoEl) {
                    videoEl.pause();
                    videoEl.src = '';
                }
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                    const videoEl = modal.querySelector('video');
                    if (videoEl) {
                        videoEl.pause();
                        videoEl.src = '';
                    }
                }
            });
        }

        // Charger la vidéo
        const videoEl = modal.querySelector('video');
        if (videoEl) {
            videoEl.src = video.videoUrl;
        }

        modal.classList.add('active');
    }

    setupLoadMore() {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadVideos();
            });
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new VideosManager();
});

