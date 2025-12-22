// Viewer de vidéos en mode TikTok/Shorts avec défilement vertical
class TikTokViewer {
    constructor() {
        this.videos = [];
        this.currentIndex = 0;
        this.isOpen = false;
        this.touchStartY = 0;
        this.touchEndY = 0;
        this.isScrolling = false;
        this.init();
    }

    init() {
        this.createViewer();
        this.setupEventListeners();
    }

    createViewer() {
        // Créer le conteneur principal
        const viewer = document.createElement('div');
        viewer.id = 'tiktokViewer';
        viewer.className = 'tiktok-viewer';
        
        viewer.innerHTML = `
            <div class="tiktok-viewer-container">
                <button class="tiktok-viewer-close" aria-label="Fermer">
                    <i class="fas fa-times"></i>
                </button>
                <div class="tiktok-viewer-videos" id="tiktokViewerVideos">
                    <!-- Les vidéos seront ajoutées dynamiquement -->
                </div>
                <div class="tiktok-viewer-indicators" id="tiktokViewerIndicators">
                    <!-- Indicateurs de navigation -->
                </div>
            </div>
        `;
        
        document.body.appendChild(viewer);
        
        // Fermer au clic sur le bouton
        const closeBtn = viewer.querySelector('.tiktok-viewer-close');
        closeBtn.addEventListener('click', () => {
            this.close();
        });
        
        // Fermer au clic en dehors
        viewer.addEventListener('click', (e) => {
            if (e.target === viewer) {
                this.close();
            }
        });
    }

    open(videos, startIndex = 0) {
        if (!videos || videos.length === 0) return;
        
        this.videos = videos;
        this.currentIndex = Math.max(0, Math.min(startIndex, videos.length - 1));
        this.isOpen = true;
        
        const viewer = document.getElementById('tiktokViewer');
        const videosContainer = document.getElementById('tiktokViewerVideos');
        const indicatorsContainer = document.getElementById('tiktokViewerIndicators');
        
        if (!viewer || !videosContainer) return;
        
        // Nettoyer le contenu
        videosContainer.innerHTML = '';
        indicatorsContainer.innerHTML = '';
        
        // Créer les éléments vidéo
        this.videos.forEach((video, index) => {
            const videoWrapper = this.createVideoWrapper(video, index);
            videosContainer.appendChild(videoWrapper);
            
            // Créer l'indicateur
            const indicator = document.createElement('div');
            indicator.className = 'tiktok-indicator';
            if (index === this.currentIndex) {
                indicator.classList.add('active');
            }
            indicator.addEventListener('click', () => {
                this.goToVideo(index);
            });
            indicatorsContainer.appendChild(indicator);
        });
        
        // Afficher le viewer
        viewer.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Charger et jouer la première vidéo
        this.goToVideo(this.currentIndex);
    }

    createVideoWrapper(video, index) {
        const wrapper = document.createElement('div');
        wrapper.className = 'tiktok-video-wrapper';
        wrapper.dataset.index = index;
        wrapper.dataset.videoId = video.id;
        
        const thumbnail = video.coverUrl || video.thumbnail || '/assets/images/video-placeholder.jpg';
        const isLiked = video.isLiked || false;
        
        wrapper.innerHTML = `
            <div class="tiktok-video-container">
                <video class="tiktok-video" 
                       preload="metadata"
                       playsinline
                       webkit-playsinline>
                    <source src="${video.videoUrl}" type="video/mp4">
                </video>
                
                <!-- Barre de progression -->
                <div class="tiktok-progress-bar">
                    <div class="tiktok-progress-track">
                        <div class="tiktok-progress-fill"></div>
                        <div class="tiktok-progress-handle"></div>
                    </div>
                </div>
                
                <!-- Indicateurs de double-tap -->
                <div class="tiktok-double-tap-indicator left">
                    <i class="fas fa-backward"></i>
                    <span>-10s</span>
                </div>
                <div class="tiktok-double-tap-indicator right">
                    <i class="fas fa-forward"></i>
                    <span>+10s</span>
                </div>
                
                <!-- Overlay avec informations et contrôles -->
                <div class="tiktok-video-overlay">
                    <div class="tiktok-video-info">
                        <h3 class="tiktok-video-title">${this.escapeHtml(video.title)}</h3>
                        <div class="tiktok-video-stats">
                            <span class="tiktok-stat-item">
                                <i class="fas fa-eye"></i>
                                <span class="stat-value">${this.formatNumber(video.viewsCount || 0)}</span>
                            </span>
                            <span class="tiktok-stat-item tiktok-like-btn ${isLiked ? 'liked' : ''}" data-video-id="${video.id}">
                                <i class="fas fa-heart"></i>
                                <span class="stat-value like-count">${this.formatNumber(video.likesCount || 0)}</span>
                            </span>
                            <span class="tiktok-stat-item tiktok-comment-btn" data-video-id="${video.id}">
                                <i class="fas fa-comment"></i>
                                <span class="stat-value comment-count">${this.formatNumber(video.commentsCount || 0)}</span>
                            </span>
                        </div>
                    </div>
                    <div class="tiktok-video-controls">
                        <button class="tiktok-control-btn play-pause" aria-label="Play/Pause">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="tiktok-control-btn mute" aria-label="Mute/Unmute">
                            <i class="fas fa-volume-up"></i>
                        </button>
                        <button class="tiktok-control-btn share-btn" aria-label="Partager" data-video-id="${video.id}">
                            <i class="fas fa-share-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
            <!-- Sidebar avec commentaires -->
            <div class="tiktok-sidebar">
                <div class="tiktok-sidebar-header">
                    <h4>Commentaires</h4>
                    <button class="tiktok-sidebar-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="tiktok-comments-list" data-video-id="${video.id}">
                    <div class="tiktok-comments-loading">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Chargement des commentaires...</p>
                    </div>
                </div>
                <div class="tiktok-comment-form" data-video-id="${video.id}">
                    <input type="text" class="tiktok-comment-input" placeholder="Ajouter un commentaire..." />
                    <button class="tiktok-comment-submit">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Ajouter les événements pour cette vidéo
        this.setupVideoEvents(wrapper, video);
        
        return wrapper;
    }

    setupVideoEvents(wrapper, video) {
        const videoEl = wrapper.querySelector('.tiktok-video');
        const playPauseBtn = wrapper.querySelector('.play-pause');
        const muteBtn = wrapper.querySelector('.mute');
        const likeBtn = wrapper.querySelector('.tiktok-like-btn');
        const commentBtn = wrapper.querySelector('.tiktok-comment-btn');
        const shareBtn = wrapper.querySelector('.share-btn');
        const sidebar = wrapper.querySelector('.tiktok-sidebar');
        const sidebarClose = wrapper.querySelector('.tiktok-sidebar-close');
        const commentForm = wrapper.querySelector('.tiktok-comment-form');
        const commentInput = wrapper.querySelector('.tiktok-comment-input');
        const commentSubmit = wrapper.querySelector('.tiktok-comment-submit');
        const progressBar = wrapper.querySelector('.tiktok-progress-bar');
        const progressFill = wrapper.querySelector('.tiktok-progress-fill');
        const progressHandle = wrapper.querySelector('.tiktok-progress-handle');
        const progressTrack = wrapper.querySelector('.tiktok-progress-track');
        const leftIndicator = wrapper.querySelector('.tiktok-double-tap-indicator.left');
        const rightIndicator = wrapper.querySelector('.tiktok-double-tap-indicator.right');
        
        if (!videoEl) return;
        
        // Barre de progression
        this.setupProgressBar(videoEl, progressBar, progressFill, progressHandle, progressTrack);
        
        // Double-tap pour avancer/reculer
        this.setupDoubleTap(wrapper, videoEl, leftIndicator, rightIndicator);
        
        // Play/Pause
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePlayPause(videoEl, playPauseBtn);
            });
        }
        
        // Mute/Unmute
        if (muteBtn) {
            muteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMute(videoEl, muteBtn);
            });
        }
        
        // Like
        if (likeBtn) {
            likeBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await this.handleLike(video.id, likeBtn);
            });
        }
        
        // Ouvrir commentaires
        if (commentBtn) {
            commentBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openComments(wrapper, video.id);
            });
        }
        
        // Partager
        if (shareBtn) {
            shareBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.shareVideo(video);
            });
        }
        
        // Fermer sidebar
        if (sidebarClose) {
            sidebarClose.addEventListener('click', () => {
                sidebar.classList.remove('active');
            });
        }
        
        // Soumettre commentaire
        if (commentSubmit && commentInput) {
            const submitComment = async () => {
                const text = commentInput.value.trim();
                if (text) {
                    await this.addComment(video.id, text, wrapper);
                    commentInput.value = '';
                }
            };
            
            commentSubmit.addEventListener('click', submitComment);
            commentInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    submitComment();
                }
            });
        }
        
        // Mise à jour de l'icône play/pause
        videoEl.addEventListener('play', () => {
            if (playPauseBtn) {
                playPauseBtn.querySelector('i').className = 'fas fa-pause';
            }
        });
        
        videoEl.addEventListener('pause', () => {
            if (playPauseBtn) {
                playPauseBtn.querySelector('i').className = 'fas fa-play';
            }
        });
        
        // Clic sur la vidéo pour play/pause
        wrapper.addEventListener('click', (e) => {
            if (e.target === wrapper || e.target === videoEl || e.target.closest('.tiktok-video-container')) {
                if (!e.target.closest('.tiktok-video-controls') && !e.target.closest('.tiktok-video-stats')) {
                    this.togglePlayPause(videoEl, playPauseBtn);
                }
            }
        });
    }
    
    // Gérer le like
    async handleLike(videoId, likeBtn) {
        // Vérifier l'authentification
        if (window.authManager && !window.authManager.isAuthenticated()) {
            window.authManager.showAuthModal('aimer cette vidéo');
            return;
        }
        
        const isLiked = likeBtn.classList.contains('liked');
        const likeCountEl = likeBtn.querySelector('.like-count');
        let currentCount = parseInt(likeCountEl.textContent.replace(/[^\d]/g, '')) || 0;
        
        try {
            if (isLiked) {
                // Retirer le like
                if (window.LikesAPI) {
                    await window.LikesAPI.unlikeProduct(videoId);
                }
                likeBtn.classList.remove('liked');
                currentCount = Math.max(0, currentCount - 1);
            } else {
                // Ajouter le like
                if (window.LikesAPI) {
                    await window.LikesAPI.likeProduct(videoId);
                }
                likeBtn.classList.add('liked');
                currentCount += 1;
            }
            
            likeCountEl.textContent = this.formatNumber(currentCount);
            
            // Animation
            likeBtn.style.transform = 'scale(1.2)';
            setTimeout(() => {
                likeBtn.style.transform = 'scale(1)';
            }, 200);
        } catch (error) {
            console.error('Erreur lors du like:', error);
        }
    }
    
    // Ouvrir les commentaires
    async openComments(wrapper, videoId) {
        const sidebar = wrapper.querySelector('.tiktok-sidebar');
        if (!sidebar) return;
        
        sidebar.classList.add('active');
        await this.loadComments(videoId, wrapper);
    }
    
    // Charger les commentaires
    async loadComments(videoId, wrapper) {
        const commentsList = wrapper.querySelector('.tiktok-comments-list');
        if (!commentsList) return;
        
        commentsList.innerHTML = '<div class="tiktok-comments-loading"><i class="fas fa-spinner fa-spin"></i><p>Chargement...</p></div>';
        
        try {
            let comments = [];
            if (window.CommentsAPI) {
                const data = await window.CommentsAPI.getComments(videoId, 50);
                comments = data.comments || [];
            }
            
            if (comments.length === 0) {
                commentsList.innerHTML = '<div class="tiktok-no-comments"><p>Aucun commentaire pour le moment</p></div>';
                return;
            }
            
            commentsList.innerHTML = '';
            comments.forEach(comment => {
                const commentEl = this.createCommentElement(comment);
                commentsList.appendChild(commentEl);
            });
        } catch (error) {
            console.error('Erreur lors du chargement des commentaires:', error);
            commentsList.innerHTML = '<div class="tiktok-comments-error"><p>Erreur de chargement</p></div>';
        }
    }
    
    // Créer un élément de commentaire
    createCommentElement(comment) {
        const div = document.createElement('div');
        div.className = 'tiktok-comment-item';
        div.innerHTML = `
            <div class="tiktok-comment-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="tiktok-comment-content">
                <div class="tiktok-comment-author">${this.escapeHtml(comment.userName || 'Utilisateur')}</div>
                <div class="tiktok-comment-text">${this.escapeHtml(comment.content)}</div>
                <div class="tiktok-comment-meta">
                    <span>${this.formatTime(comment.createdAt)}</span>
                </div>
            </div>
        `;
        return div;
    }
    
    // Ajouter un commentaire
    async addComment(videoId, text, wrapper) {
        // Vérifier l'authentification
        if (window.authManager && !window.authManager.isAuthenticated()) {
            window.authManager.showAuthModal('commenter cette vidéo');
            return;
        }
        
        try {
            let newComment = null;
            if (window.CommentsAPI) {
                const data = await window.CommentsAPI.addComment(videoId, text);
                newComment = data.comment;
            } else {
                // Fallback si pas d'API
                newComment = {
                    id: 'comment_' + Date.now(),
                    content: text,
                    userName: window.authManager?.getCurrentUser()?.name || 'Utilisateur',
                    createdAt: new Date().toISOString()
                };
            }
            
            // Ajouter le commentaire à la liste
            const commentsList = wrapper.querySelector('.tiktok-comments-list');
            if (commentsList) {
                const noComments = commentsList.querySelector('.tiktok-no-comments');
                if (noComments) noComments.remove();
                
                const commentEl = this.createCommentElement(newComment);
                commentsList.insertBefore(commentEl, commentsList.firstChild);
                
                // Mettre à jour le compteur
                const commentCount = wrapper.querySelector('.comment-count');
                if (commentCount) {
                    const current = parseInt(commentCount.textContent.replace(/[^\d]/g, '')) || 0;
                    commentCount.textContent = this.formatNumber(current + 1);
                }
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajout du commentaire:', error);
        }
    }
    
    // Partager la vidéo
    async shareVideo(video) {
        const shareData = {
            title: video.title,
            text: `Regardez cette vidéo: ${video.title}`,
            url: `${window.location.origin}/videos.html?id=${video.id}`
        };
        
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback: copier le lien
                await navigator.clipboard.writeText(shareData.url);
                if (window.authManager) {
                    window.authManager.showNotification('Lien copié dans le presse-papiers !', 'success');
                }
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Erreur de partage:', error);
            }
        }
    }
    
    // Formater les nombres
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    // Formater le temps
    formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `il y a ${days} jour${days > 1 ? 's' : ''}`;
        if (hours > 0) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
        if (minutes > 0) return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
        return 'à l\'instant';
    }

    // Configuration de la barre de progression
    setupProgressBar(videoEl, progressBar, progressFill, progressHandle, progressTrack) {
        if (!videoEl || !progressBar || !progressFill) return;
        
        let isDragging = false;
        
        // Mettre à jour la progression
        const updateProgress = () => {
            if (isDragging) return;
            const progress = (videoEl.currentTime / videoEl.duration) * 100;
            if (progressFill) {
                progressFill.style.width = `${progress}%`;
            }
            if (progressHandle) {
                progressHandle.style.left = `${progress}%`;
            }
        };
        
        videoEl.addEventListener('timeupdate', updateProgress);
        videoEl.addEventListener('loadedmetadata', () => {
            updateProgress();
        });
        
        // Clic sur la barre pour sauter
        if (progressTrack) {
            progressTrack.addEventListener('click', (e) => {
                if (isDragging) return;
                const rect = progressTrack.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const percent = (x / rect.width) * 100;
                videoEl.currentTime = (percent / 100) * videoEl.duration;
            });
        }
        
        // Drag de la poignée
        if (progressHandle) {
            progressHandle.addEventListener('mousedown', (e) => {
                isDragging = true;
                e.preventDefault();
            });
            
            document.addEventListener('mousemove', (e) => {
                if (!isDragging || !progressTrack) return;
                const rect = progressTrack.getBoundingClientRect();
                const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                const percent = (x / rect.width) * 100;
                videoEl.currentTime = (percent / 100) * videoEl.duration;
                if (progressFill) {
                    progressFill.style.width = `${percent}%`;
                }
                if (progressHandle) {
                    progressHandle.style.left = `${percent}%`;
                }
            });
            
            document.addEventListener('mouseup', () => {
                isDragging = false;
            });
        }
        
        // Touch support
        if (progressTrack) {
            progressTrack.addEventListener('touchstart', (e) => {
                if (isDragging) return;
                const rect = progressTrack.getBoundingClientRect();
                const x = e.touches[0].clientX - rect.left;
                const percent = (x / rect.width) * 100;
                videoEl.currentTime = (percent / 100) * videoEl.duration;
            });
        }
    }
    
    // Configuration du double-tap pour avancer/reculer
    setupDoubleTap(wrapper, videoEl, leftIndicator, rightIndicator) {
        if (!videoEl || !wrapper) return;
        
        let lastTap = 0;
        let tapTimeout;
        
        const showIndicator = (indicator, direction) => {
            if (!indicator) return;
            indicator.classList.add('show');
            setTimeout(() => {
                indicator.classList.remove('show');
            }, 500);
        };
        
        wrapper.addEventListener('click', (e) => {
            // Ignorer si on clique sur les contrôles
            if (e.target.closest('.tiktok-video-controls') || 
                e.target.closest('.tiktok-video-stats') ||
                e.target.closest('.tiktok-progress-bar')) {
                return;
            }
            
            const currentTime = Date.now();
            const tapLength = currentTime - lastTap;
            
            if (tapLength < 300 && tapLength > 0) {
                // Double-tap détecté
                clearTimeout(tapTimeout);
                
                const rect = wrapper.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const middle = rect.width / 2;
                
                if (x < middle) {
                    // Côté gauche - reculer de 10 secondes
                    videoEl.currentTime = Math.max(0, videoEl.currentTime - 10);
                    showIndicator(leftIndicator, 'left');
                } else {
                    // Côté droit - avancer de 10 secondes
                    videoEl.currentTime = Math.min(videoEl.duration, videoEl.currentTime + 10);
                    showIndicator(rightIndicator, 'right');
                }
                
                lastTap = 0;
            } else {
                // Simple tap - play/pause
                tapTimeout = setTimeout(() => {
                    this.togglePlayPause(videoEl, null);
                }, 300);
                lastTap = currentTime;
            }
        });
    }

    togglePlayPause(videoEl, btn) {
        if (videoEl.paused) {
            videoEl.play();
        } else {
            videoEl.pause();
        }
    }

    toggleMute(videoEl, btn) {
        videoEl.muted = !videoEl.muted;
        if (btn) {
            btn.querySelector('i').className = videoEl.muted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
        }
    }

    goToVideo(index) {
        if (index < 0 || index >= this.videos.length) return;
        
        const videosContainer = document.getElementById('tiktokViewerVideos');
        if (!videosContainer) return;
        
        // Arrêter toutes les vidéos
        const allVideos = videosContainer.querySelectorAll('.tiktok-video');
        allVideos.forEach(v => {
            v.pause();
            v.currentTime = 0;
        });
        
        // Mettre à jour l'index
        this.currentIndex = index;
        
        // Faire défiler vers la vidéo active
        const activeWrapper = videosContainer.querySelector(`[data-index="${index}"]`);
        if (activeWrapper) {
            activeWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Charger et jouer la vidéo après un court délai
            setTimeout(() => {
                const videoEl = activeWrapper.querySelector('.tiktok-video');
                if (videoEl) {
                    videoEl.load();
                    videoEl.play().catch(err => {
                        console.log('Auto-play bloqué:', err);
                    });
                }
            }, 300);
        }
        
        // Mettre à jour les indicateurs
        const indicators = document.querySelectorAll('.tiktok-indicator');
        indicators.forEach((ind, i) => {
            ind.classList.toggle('active', i === index);
        });
    }

    setupEventListeners() {
        const viewer = document.getElementById('tiktokViewer');
        if (!viewer) return;
        
        // Navigation au clavier
        document.addEventListener('keydown', (e) => {
            if (!this.isOpen) return;
            
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                const direction = e.key === 'ArrowUp' ? -1 : 1;
                this.goToVideo(this.currentIndex + direction);
            } else if (e.key === 'Escape') {
                this.close();
            } else if (e.key === ' ') {
                e.preventDefault();
                const activeVideo = this.getActiveVideo();
                if (activeVideo) {
                    this.togglePlayPause(activeVideo, null);
                }
            }
        });
        
        // Navigation par swipe (touch)
        let touchStartY = 0;
        let touchEndY = 0;
        
        viewer.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        viewer.addEventListener('touchend', (e) => {
            touchEndY = e.changedTouches[0].clientY;
            this.handleSwipe(touchStartY, touchEndY);
        }, { passive: true });
        
        // Navigation par scroll (souris)
        const videosContainer = document.getElementById('tiktokViewerVideos');
        if (videosContainer) {
            let scrollTimeout;
            videosContainer.addEventListener('scroll', () => {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    this.handleScroll();
                }, 150);
            }, { passive: true });
        }
    }

    handleSwipe(startY, endY) {
        const diff = startY - endY;
        const threshold = 50; // Minimum de pixels pour déclencher le swipe
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                // Swipe vers le haut - vidéo suivante
                this.goToVideo(this.currentIndex + 1);
            } else {
                // Swipe vers le bas - vidéo précédente
                this.goToVideo(this.currentIndex - 1);
            }
        }
    }

    handleScroll() {
        const videosContainer = document.getElementById('tiktokViewerVideos');
        if (!videosContainer) return;
        
        const wrappers = videosContainer.querySelectorAll('.tiktok-video-wrapper');
        let closestIndex = 0;
        let closestDistance = Infinity;
        
        wrappers.forEach((wrapper, index) => {
            const rect = wrapper.getBoundingClientRect();
            const centerY = rect.top + rect.height / 2;
            const viewportCenterY = window.innerHeight / 2;
            const distance = Math.abs(centerY - viewportCenterY);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
            }
        });
        
        if (closestIndex !== this.currentIndex) {
            this.goToVideo(closestIndex);
        }
    }

    getActiveVideo() {
        const videosContainer = document.getElementById('tiktokViewerVideos');
        if (!videosContainer) return null;
        
        const activeWrapper = videosContainer.querySelector(`[data-index="${this.currentIndex}"]`);
        return activeWrapper ? activeWrapper.querySelector('.tiktok-video') : null;
    }

    close() {
        const viewer = document.getElementById('tiktokViewer');
        if (!viewer) return;
        
        // Arrêter toutes les vidéos
        const allVideos = viewer.querySelectorAll('.tiktok-video');
        allVideos.forEach(v => {
            v.pause();
            v.currentTime = 0;
        });
        
        // Fermer le viewer
        viewer.classList.remove('active');
        document.body.style.overflow = '';
        this.isOpen = false;
        this.videos = [];
        this.currentIndex = 0;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialiser le viewer
document.addEventListener('DOMContentLoaded', () => {
    window.tiktokViewer = new TikTokViewer();
});

