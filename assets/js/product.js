// Gestion de la page produit
class ProductPage {
    constructor() {
        this.productId = null;
        this.product = null;
        this.currentImageIndex = 0;
        this.showing3D = false;
        this.selectedRating = 0;
        this.init();
    }

    init() {
        // Récupérer l'ID du produit depuis l'URL
        const urlParams = new URLSearchParams(window.location.search);
        this.productId = urlParams.get('id');

        if (!this.productId) {
            this.showError('Produit non trouvé');
            return;
        }

        this.setupEventListeners();
        this.loadProduct();
        this.loadComments();
        this.loadReviews();
    }

    setupEventListeners() {
        // Toggle 3D/Photos
        const togglePhotos = document.getElementById('togglePhotos');
        const toggle3D = document.getElementById('toggle3D');
        
        if (togglePhotos) {
            togglePhotos.addEventListener('click', () => this.showGallery());
        }
        
        if (toggle3D) {
            toggle3D.addEventListener('click', () => this.show3D());
        }

        // Tabs
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Star rating
        const stars = document.querySelectorAll('.star-rating i');
        stars.forEach(star => {
            star.addEventListener('click', () => {
                this.selectedRating = parseInt(star.dataset.rating);
                this.updateStarRating();
            });
        });

        // Submit review
        const submitReviewBtn = document.getElementById('submitReviewBtn');
        if (submitReviewBtn) {
            submitReviewBtn.addEventListener('click', () => this.submitReview());
        }

        // Submit comment
        const submitCommentBtn = document.getElementById('submitCommentBtn');
        if (submitCommentBtn) {
            submitCommentBtn.addEventListener('click', () => this.submitComment());
        }

        // Add to cart button
        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => this.addToCart());
        }

        // Like button
        const likeBtn = document.getElementById('likeBtn');
        if (likeBtn) {
            likeBtn.addEventListener('click', () => this.toggleLike());
        }

        // Share button
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareProduct());
        }
    }

    async loadProduct() {
        try {
            const data = await ProductsAPI.getProduct(this.productId);
            console.log('📦 Produit chargé:', data);
            
            if (!data || !data.product) {
                throw new Error('Produit non trouvé dans la réponse API');
            }
            
            this.product = data.product;
            console.log('📦 Données produit:', {
                id: this.product.id,
                title: this.product.title,
                coverImageUrl: this.product.coverImageUrl,
                imagesJson: this.product.imagesJson
            });
            
            this.renderProduct();
        } catch (error) {
            console.error('❌ Erreur lors du chargement du produit:', error);
            this.showError('Erreur de chargement du produit: ' + (error.message || 'Erreur inconnue'));
        }
    }

    renderProduct() {
        if (!this.product) return;

        const loading = document.getElementById('productLoading');
        const content = document.getElementById('productContent');
        
        if (loading) loading.style.display = 'none';
        if (content) content.style.display = 'block';

        // Titre
        const title = document.getElementById('productTitle');
        if (title) title.textContent = this.product.title;

        // Prix
        const price = document.getElementById('productPrice');
        if (price) {
            price.textContent = `${this.product.price} ${this.product.currency || 'CDF'}`;
        }

        // Description
        const description = document.getElementById('productDescription');
        if (description) description.textContent = this.product.description;

        // Badges
        const badges = document.getElementById('productBadges');
        if (badges) {
            let badgesHtml = '';
            if (this.product.isNew) {
                badgesHtml += '<span class="badge badge-new">Nouveau</span>';
            }
            if (this.product.isPromo) {
                badgesHtml += '<span class="badge badge-promo">Promo</span>';
            }
            badges.innerHTML = badgesHtml;
        }

        // Rating
        const rating = document.getElementById('productRating');
        if (rating) {
            rating.innerHTML = this.generateStars(this.product.ratingAvg || 0) + 
                             ` <span>(${this.product.ratingCount || 0})</span>`;
        }

        // Stock
        const stock = document.getElementById('productStock');
        if (stock) {
            if (this.product.stock === 0) {
                stock.className = 'product-stock out';
                stock.innerHTML = '<i class="fas fa-times-circle"></i> <strong>Rupture de stock</strong>';
            } else if (this.product.stock < 10) {
                stock.className = 'product-stock low';
                stock.innerHTML = `<i class="fas fa-exclamation-triangle"></i> <strong>Stock faible</strong> - ${this.product.stock} disponible(s)`;
            } else {
                stock.className = 'product-stock';
                stock.innerHTML = `<i class="fas fa-check-circle"></i> <strong>En stock</strong> - ${this.product.stock} disponible(s)`;
            }
        }

        // Like count
        const likeCount = document.getElementById('likeCount');
        if (likeCount) likeCount.textContent = this.product.likesCount || 0;

        // Comments count
        const commentsCount = document.getElementById('commentsCount');
        if (commentsCount) commentsCount.textContent = this.product.commentsCount || 0;

        // Gallery - S'assurer qu'elle est visible
        const galleryContainer = document.getElementById('productGallery');
        if (galleryContainer) {
            galleryContainer.style.display = 'grid';
            galleryContainer.style.visibility = 'visible';
            galleryContainer.style.opacity = '1';
        }
        
        // Gallery
        this.renderGallery();
        
        // Forcer l'affichage de la galerie après un court délai
        setTimeout(() => {
            if (galleryContainer) {
                const mainImg = galleryContainer.querySelector('.gallery-main');
                if (mainImg) {
                    console.log('🔍 Vérification image principale:', {
                        src: mainImg.src,
                        complete: mainImg.complete,
                        naturalWidth: mainImg.naturalWidth,
                        naturalHeight: mainImg.naturalHeight
                    });
                    
                    if (!mainImg.complete || mainImg.naturalWidth === 0) {
                        console.warn('⚠️ Image principale non chargée, réessai avec placeholder si nécessaire');
                    }
                }
            }
        }, 500);

        // 3D Model
        if (this.product.model3dUrl) {
            const modelViewer = document.getElementById('modelViewer');
            if (modelViewer) {
                modelViewer.src = this.product.model3dUrl;
                const product3D = document.getElementById('product3D');
                if (product3D) product3D.style.display = 'block';
            }
        }
    }

    renderGallery() {
        const gallery = document.getElementById('productGallery');
        if (!gallery) {
            console.error('❌ Gallery element not found');
            return;
        }

        console.log('🖼️ Rendering gallery for product:', this.product);

        // Récupérer toutes les images disponibles
        let images = [];
        
        // Essayer de parser imagesJson si c'est une string
        if (this.product.imagesJson) {
            try {
                if (typeof this.product.imagesJson === 'string') {
                    images = JSON.parse(this.product.imagesJson);
                } else if (Array.isArray(this.product.imagesJson)) {
                    images = this.product.imagesJson;
                }
            } catch (e) {
                console.warn('Erreur parsing imagesJson:', e);
                images = [];
            }
        }
        
        // Ajouter coverImageUrl
        const coverImage = this.product.coverImageUrl || this.product.coverImage || this.product.imageUrl;
        
        // Créer un tableau de toutes les images uniques
        let allImages = [];
        if (coverImage && coverImage.trim()) {
            allImages.push(coverImage.trim());
        }
        
        // Ajouter les autres images
        if (Array.isArray(images)) {
            images.forEach(img => {
                if (img && typeof img === 'string' && img.trim() && !allImages.includes(img.trim())) {
                    allImages.push(img.trim());
                } else if (typeof img === 'object' && img.url) {
                    if (!allImages.includes(img.url.trim())) {
                        allImages.push(img.url.trim());
                    }
                }
            });
        }
        
        console.log('🖼️ Images trouvées:', allImages);
        
        // Si aucune image, utiliser placeholder
        if (allImages.length === 0) {
            console.warn('⚠️ Aucune image trouvée, utilisation du placeholder');
            allImages.push('/assets/images/placeholder.jpg');
        }
        
        const mainImage = allImages[0];
        
        // Créer la galerie avec l'image principale - AFFICHAGE DIRECT
        let galleryHtml = `<img src="${mainImage}" alt="${this.escapeHtml(this.product.title)}" class="gallery-main" id="galleryMain" loading="eager" style="opacity: 1;" onerror="this.onerror=null; this.src='/assets/images/placeholder.jpg'; this.style.opacity='1';">`;
        
        // Ajouter les miniatures si on a plus d'une image
        if (allImages.length > 1) {
            galleryHtml += '<div class="gallery-thumbs-container">';
            allImages.forEach((img, index) => {
                // Utiliser directement le src pour charger l'image immédiatement
                galleryHtml += `<img src="${img}" alt="Image ${index + 1}" class="gallery-thumb ${index === 0 ? 'active' : ''}" data-index="${index}" data-src="${img}" loading="lazy" onerror="this.onerror=null; if (!this.src.includes('placeholder')) { this.src='/assets/images/placeholder.jpg'; console.warn('Erreur chargement image ${index + 1}:', '${img}'); }">`;
            });
            galleryHtml += '</div>';
        } else {
            // Si une seule image, afficher quand même une miniature
            galleryHtml += `<img src="${mainImage}" alt="${this.escapeHtml(this.product.title)}" class="gallery-thumb active" data-index="0" data-src="${mainImage}" loading="lazy" onerror="this.onerror=null; this.src='/assets/images/placeholder.jpg';">`;
        }

        gallery.innerHTML = galleryHtml;

        // Event listeners pour les miniatures
        const thumbs = gallery.querySelectorAll('.gallery-thumb');
        const mainImg = document.getElementById('galleryMain');
        
        if (!mainImg) {
            console.error('❌ Main image element not found after rendering');
            return;
        }
        
        // Forcer l'affichage immédiat de l'image principale
        mainImg.style.display = 'block';
        mainImg.style.visibility = 'visible';
        mainImg.style.opacity = '1';
        
        // Précharger et vérifier toutes les images avant affichage
        this.preloadImages(allImages, () => {
            console.log('✅ Toutes les images préchargées');
            
            // Vérifier que l'image principale se charge correctement
            if (mainImg.src !== mainImage) {
                mainImg.src = mainImage;
            }
        });
        
        // Vérifier si l'image principale se charge
        mainImg.addEventListener('load', () => {
            console.log('✅ Image principale chargée:', mainImg.src);
            mainImg.style.opacity = '1';
        });
        
        mainImg.addEventListener('error', (e) => {
            console.warn('⚠️ Erreur chargement image principale:', mainImg.src);
            // Essayer le placeholder seulement si ce n'est pas déjà le placeholder
            if (!mainImg.src.includes('placeholder.jpg')) {
                mainImg.src = '/assets/images/placeholder.jpg';
                mainImg.style.opacity = '1';
            }
        });
        
        // Précharger et vérifier les miniatures pour s'assurer qu'elles se chargent
        thumbs.forEach((thumb, index) => {
            const thumbSrc = thumb.getAttribute('data-src') || thumb.src;
            const originalSrc = thumbSrc;
            
            // Vérifier si l'image se charge correctement
            thumb.addEventListener('load', () => {
                console.log(`✅ Miniature ${index + 1} chargée avec succès:`, thumb.src);
            });
            
            // Fonction pour réessayer le chargement avec plusieurs tentatives
            let retryCount = 0;
            const maxRetries = 3;
            
            const retryLoad = () => {
                retryCount++;
                console.log(`🔄 Tentative ${retryCount}/${maxRetries} pour image ${index + 1}:`, originalSrc);
                
                const loader = new Image();
                loader.onload = () => {
                    console.log(`✅ Image ${index + 1} chargée avec succès après ${retryCount} tentative(s)`);
                    // Mettre à jour seulement si ce n'est pas déjà le placeholder
                    if (!thumb.src.includes('placeholder.jpg')) {
                        thumb.src = originalSrc;
                    }
                };
                
                loader.onerror = () => {
                    if (retryCount < maxRetries) {
                        // Réessayer après un délai progressif (1s, 2s, 3s)
                        setTimeout(retryLoad, 1000 * retryCount);
                    } else {
                        // Après tous les retries, utiliser le placeholder
                        console.warn(`⚠️ Image ${index + 1} n'a pas pu être chargée après ${maxRetries} tentatives`);
                        if (!thumb.src.includes('placeholder.jpg')) {
                            thumb.src = '/assets/images/placeholder.jpg';
                        }
                    }
                };
                
                loader.src = originalSrc;
            };
            
            thumb.addEventListener('error', () => {
                console.warn(`⚠️ Erreur initiale chargement miniature ${index + 1}:`, originalSrc);
                // Lancer le système de retry seulement si ce n'est pas déjà le placeholder
                if (!thumb.src.includes('placeholder.jpg') && retryCount === 0) {
                    retryLoad();
                }
            });
            
            // Vérifier après 3 secondes si l'image s'est chargée
            setTimeout(() => {
                if (!thumb.complete || thumb.naturalWidth === 0) {
                    console.warn(`⚠️ Image ${index + 1} non chargée après 3s, vérification...`);
                    
                    // Si ce n'est pas déjà le placeholder et qu'on n'a pas encore fait de retry
                    if (!thumb.src.includes('placeholder.jpg') && retryCount === 0) {
                        retryLoad();
                    }
                }
            }, 3000);
        });
        
        thumbs.forEach(thumb => {
            thumb.addEventListener('click', () => {
                thumbs.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
                
                const newSrc = thumb.getAttribute('data-src') || thumb.src;
                
                if (mainImg && newSrc) {
                    // Précharger la nouvelle image
                    const newImgLoader = new Image();
                    newImgLoader.onload = () => {
                        mainImg.src = newSrc;
                        mainImg.style.opacity = '0';
                        setTimeout(() => {
                            mainImg.style.transition = 'opacity 0.3s ease';
                            mainImg.style.opacity = '1';
                        }, 50);
                    };
                    newImgLoader.onerror = () => {
                        mainImg.src = '/assets/images/placeholder.jpg';
                        mainImg.style.opacity = '1';
                    };
                    newImgLoader.src = newSrc;
                }
            });
        });
        
        console.log('✅ Galerie rendue avec', allImages.length, 'image(s)');
    }

    preloadImages(imageUrls, callback) {
        let loaded = 0;
        const total = imageUrls.length;
        
        if (total === 0) {
            callback();
            return;
        }
        
        imageUrls.forEach((url, index) => {
            const img = new Image();
            img.onload = () => {
                loaded++;
                console.log(`✅ Image ${index + 1}/${total} préchargée:`, url);
                if (loaded === total) {
                    callback();
                }
            };
            img.onerror = () => {
                loaded++;
                console.warn(`⚠️ Erreur préchargement image ${index + 1}/${total}:`, url);
                // Même en cas d'erreur, on compte comme chargé pour continuer
                if (loaded === total) {
                    callback();
                }
            };
            img.src = url;
            
            // Timeout de sécurité : après 5 secondes, considérer comme chargé (même si erreur)
            setTimeout(() => {
                if (loaded < total) {
                    const currentLoaded = loaded;
                    loaded = total;
                    if (currentLoaded === total - 1) {
                        callback();
                    }
                }
            }, 5000);
        });
    }

    showGallery() {
        this.showing3D = false;
        const gallery = document.getElementById('productGallery');
        const product3D = document.getElementById('product3D');
        const togglePhotos = document.getElementById('togglePhotos');
        const toggle3D = document.getElementById('toggle3D');

        if (gallery) gallery.style.display = 'grid';
        if (product3D) product3D.style.display = 'none';
        if (togglePhotos) togglePhotos.classList.add('active');
        if (toggle3D) toggle3D.classList.remove('active');
    }

    show3D() {
        if (!this.product.model3dUrl) {
            alert('Vue 3D non disponible pour ce produit');
            return;
        }

        this.showing3D = true;
        const gallery = document.getElementById('productGallery');
        const product3D = document.getElementById('product3D');
        const togglePhotos = document.getElementById('togglePhotos');
        const toggle3D = document.getElementById('toggle3D');

        if (gallery) gallery.style.display = 'none';
        if (product3D) product3D.style.display = 'block';
        if (togglePhotos) togglePhotos.classList.remove('active');
        if (toggle3D) toggle3D.classList.add('active');
    }

    switchTab(tab) {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            if (btn.dataset.tab === tab) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        tabContents.forEach(content => {
            if (content.id === `${tab}Tab`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    }

    updateStarRating() {
        const stars = document.querySelectorAll('.star-rating i');
        const selectedRatingDisplay = document.getElementById('selectedRating');
        
        stars.forEach((star, index) => {
            if (index < this.selectedRating) {
                star.classList.add('active');
                star.classList.remove('far');
                star.classList.add('fas');
            } else {
                star.classList.remove('active');
                star.classList.remove('fas');
                star.classList.add('far');
            }
        });

        if (selectedRatingDisplay) {
            selectedRatingDisplay.textContent = this.selectedRating;
        }
    }

    async submitReview() {
        const content = document.getElementById('reviewContent');
        if (!content || !content.value.trim()) {
            alert('Veuillez saisir un commentaire');
            return;
        }

        if (this.selectedRating === 0) {
            alert('Veuillez sélectionner une note');
            return;
        }

        try {
            await ReviewsAPI.addReview(this.productId, this.selectedRating, content.value.trim());
            content.value = '';
            this.selectedRating = 0;
            this.updateStarRating();
            this.loadReviews();
            alert('Avis publié avec succès ! Il sera visible après modération.');
        } catch (error) {
            console.error('Erreur lors de la publication de l\'avis:', error);
            alert('Erreur lors de la publication de l\'avis');
        }
    }

    async submitComment() {
        const content = document.getElementById('commentContent');
        if (!content || !content.value.trim()) {
            alert('Veuillez saisir un commentaire');
            return;
        }

        try {
            await CommentsAPI.addComment(this.productId, content.value.trim());
            content.value = '';
            this.loadComments();
            alert('Commentaire publié avec succès ! Il sera visible après modération.');
        } catch (error) {
            console.error('Erreur lors de la publication du commentaire:', error);
            alert('Erreur lors de la publication du commentaire');
        }
    }

    async toggleLike() {
        try {
            await LikesAPI.likeProduct(this.productId);
            const likeBtn = document.getElementById('likeBtn');
            const likeCount = document.getElementById('likeCount');
            
            if (likeBtn) {
                const icon = likeBtn.querySelector('i');
                if (icon) {
                    icon.classList.toggle('far');
                    icon.classList.toggle('fas');
                }
            }
            
            if (likeCount) {
                const current = parseInt(likeCount.textContent) || 0;
                likeCount.textContent = current + 1;
            }
        } catch (error) {
            console.error('Erreur lors du like:', error);
        }
    }

    addToCart() {
        if (!this.product) return;
        
        if (window.cartManager) {
            window.cartManager.addToCart(this.product, 1);
        } else {
            alert('Panier non disponible');
        }
    }

    shareProduct() {
        if (navigator.share) {
            navigator.share({
                title: this.product.title,
                text: this.product.description,
                url: window.location.href
            });
        } else {
            // Fallback: copier le lien
            navigator.clipboard.writeText(window.location.href);
            alert('Lien copié dans le presse-papiers !');
        }
    }

    async loadComments() {
        try {
            const data = await CommentsAPI.getComments(this.productId);
            this.renderComments(data.comments || []);
        } catch (error) {
            console.error('Erreur lors du chargement des commentaires:', error);
        }
    }

    async loadReviews() {
        try {
            const data = await ReviewsAPI.getReviews(this.productId);
            this.renderReviews(data.reviews || []);
            
            const reviewsCount = document.getElementById('reviewsCount');
            if (reviewsCount) {
                reviewsCount.textContent = data.reviews ? data.reviews.length : 0;
            }
        } catch (error) {
            console.error('Erreur lors du chargement des avis:', error);
        }
    }

    renderComments(comments) {
        const list = document.getElementById('commentsList');
        if (!list) return;

        if (comments.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">Aucun commentaire pour le moment. Soyez le premier à commenter !</p>';
            return;
        }

        list.innerHTML = comments.map(comment => {
            const repliesHtml = comment.replies && comment.replies.length > 0 ? 
                `<div class="comment-replies">
                    ${comment.replies.map(reply => `
                        <div class="comment-item comment-reply">
                            <div class="comment-header">
                                <div class="comment-author">
                                    <div class="author-avatar">${reply.userName ? reply.userName.charAt(0).toUpperCase() : 'U'}</div>
                                    <div>
                                        <strong>${this.escapeHtml(reply.userName || 'Utilisateur')}</strong>
                                        <div class="comment-date">${this.formatDate(reply.createdAt)}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="comment-content">${this.escapeHtml(reply.content)}</div>
                        </div>
                    `).join('')}
                </div>` : '';

            return `
                <div class="comment-item comment-parent">
                    <div class="comment-header">
                        <div class="comment-author">
                            <div class="author-avatar">${comment.userName ? comment.userName.charAt(0).toUpperCase() : 'U'}</div>
                            <div>
                                <strong>${this.escapeHtml(comment.userName || 'Utilisateur')}</strong>
                                <div class="comment-date">${this.formatDate(comment.createdAt)}</div>
                            </div>
                        </div>
                    </div>
                    <div class="comment-content">${this.escapeHtml(comment.content)}</div>
                    <div class="comment-actions">
                        <button class="comment-action" onclick="productPage.replyToComment('${comment.id}')">
                            <i class="fas fa-reply"></i> Répondre
                        </button>
                        <button class="comment-action" onclick="productPage.likeComment('${comment.id}')">
                            <i class="far fa-heart"></i> ${comment.likesCount || 0}
                        </button>
                    </div>
                    ${repliesHtml}
                    <div class="comment-reply-form" id="replyForm-${comment.id}" style="display: none;">
                        <textarea id="replyContent-${comment.id}" placeholder="Écrivez votre réponse..." rows="3"></textarea>
                        <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                            <button class="btn btn-primary btn-sm" onclick="productPage.submitReply('${comment.id}')">Publier</button>
                            <button class="btn btn-secondary btn-sm" onclick="productPage.cancelReply('${comment.id}')">Annuler</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    replyToComment(commentId) {
        const replyForm = document.getElementById(`replyForm-${commentId}`);
        if (replyForm) {
            replyForm.style.display = replyForm.style.display === 'none' ? 'block' : 'none';
            if (replyForm.style.display === 'block') {
                const textarea = document.getElementById(`replyContent-${commentId}`);
                if (textarea) textarea.focus();
            }
        }
    }

    cancelReply(commentId) {
        const replyForm = document.getElementById(`replyForm-${commentId}`);
        const textarea = document.getElementById(`replyContent-${commentId}`);
        if (replyForm) replyForm.style.display = 'none';
        if (textarea) textarea.value = '';
    }

    async submitReply(parentId) {
        const textarea = document.getElementById(`replyContent-${parentId}`);
        if (!textarea || !textarea.value.trim()) {
            alert('Veuillez saisir une réponse');
            return;
        }

        try {
            await CommentsAPI.addComment(this.productId, textarea.value.trim(), parentId);
            textarea.value = '';
            this.cancelReply(parentId);
            this.loadComments();
            alert('Réponse publiée avec succès ! Elle sera visible après modération.');
        } catch (error) {
            console.error('Erreur lors de la publication de la réponse:', error);
            alert('Erreur lors de la publication de la réponse');
        }
    }

    likeComment(commentId) {
        // TODO: Implémenter le like de commentaire
        console.log('Like comment:', commentId);
    }

    renderReviews(reviews) {
        const list = document.getElementById('reviewsList');
        if (!list) return;

        if (reviews.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Aucun avis pour le moment</p>';
            return;
        }

        list.innerHTML = reviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <div class="review-author">
                        <div class="author-avatar">${review.userName ? review.userName.charAt(0).toUpperCase() : 'U'}</div>
                        <div>
                            <strong>${this.escapeHtml(review.userName || 'Utilisateur')}</strong>
                            <div class="review-rating">${this.generateStars(review.rating)}</div>
                        </div>
                    </div>
                    <div class="review-date">${this.formatDate(review.createdAt)}</div>
                </div>
                <div class="review-content">${this.escapeHtml(review.content)}</div>
            </div>
        `).join('');
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i === fullStars && hasHalfStar) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }

        return stars;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        const loading = document.getElementById('productLoading');
        if (loading) {
            loading.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            `;
        }
    }
}

// Variable globale pour accéder depuis les event handlers
let productPage;

document.addEventListener('DOMContentLoaded', () => {
    productPage = new ProductPage();
    window.productPage = productPage; // Exposer globalement pour les onclick
});

