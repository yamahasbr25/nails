document.addEventListener('DOMContentLoaded', function() {
    let allKeywords = [];
    let currentIndex = 0;
    const batchSize = 10;
    let isLoading = false;
    const contentContainer = document.getElementById('auto-content-container');
    const loader = document.getElementById('loader');
    
    // --- KONFIGURASI GAMBAR LOKAL ---
    const MAX_LOCAL_IMAGES = 100; // GANTI ANGKA INI sesuai total gambar di folder image/
    let imagePool = Array.from({length: MAX_LOCAL_IMAGES}, (_, i) => i + 1);
    imagePool.sort(() => Math.random() - 0.5); // Acak urutan nomor gambar

    function getNextLocalImage() {
        if (imagePool.length === 0) {
            imagePool = Array.from({length: MAX_LOCAL_IMAGES}, (_, i) => i + 1);
            imagePool.sort(() => Math.random() - 0.5);
        }
        return `image/${imagePool.pop()}.jpg`;
    }
    // ---------------------------------
    
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    function capitalizeEachWord(str) {
        if (!str) return '';
        return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    function loadKeywords() {
        fetch('keyword.txt')
            .then(response => response.text())
            .then(data => {
                allKeywords = data.split('\n').map(k => k.trim()).filter(k => k.length > 0);
                shuffleArray(allKeywords);
                loadMoreContent();
            })
            .catch(error => {
                console.error('Error loading keywords:', error);
                if(loader) loader.textContent = 'Failed to load content.';
            });
    }

    function generateSeoTitle(baseKeyword) {
        const hookWords = ['Aesthetic', 'Trendy', 'Cute', 'Pretty', 'Gorgeous', 'Y2K', 'Classy'];
        const suffixWords = ['Nails', 'Nail Art', 'Manicure', 'Nail Inspo'];
        const randomHook = hookWords[Math.floor(Math.random() * hookWords.length)];
        const randomSuffix = suffixWords[Math.floor(Math.random() * suffixWords.length)];
        return `${randomHook} ${capitalizeEachWord(baseKeyword)} ${randomSuffix}`;
    }

    function loadMoreContent() {
        if (isLoading || currentIndex >= allKeywords.length) return;
        isLoading = true;
        if(loader) loader.style.display = 'block';
        
        const endIndex = Math.min(currentIndex + batchSize, allKeywords.length);
        const fragment = document.createDocumentFragment();
        
        for (let i = currentIndex; i < endIndex; i++) {
            const keyword = allKeywords[i];
            const title = generateSeoTitle(keyword);
            const keywordForUrl = keyword.replace(/\s/g, '-').toLowerCase();
            const linkUrl = `detail.html?q=${encodeURIComponent(keywordForUrl)}`;
            
            // Panggil fungsi gambar acak dari folder lokal
            const imageUrl = getNextLocalImage();
            
            const article = document.createElement('div');
            article.className = 'wallpaper-card';
            
            article.innerHTML = `
                <a href="${linkUrl}" class="img-link" title="${title}">
                    <img src="${imageUrl}" alt="${title}" loading="lazy" onerror="this.src='https://via.placeholder.com/1080x1620.png?text=Image+Not+Found'">
                </a>
            `;
            fragment.appendChild(article);
        }
        
        if(contentContainer) contentContainer.appendChild(fragment);
        currentIndex = endIndex;
        isLoading = false;
        
        if (currentIndex >= allKeywords.length) {
            if(loader) loader.style.display = 'none';
        }
    }

    window.addEventListener('scroll', () => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 200) {
            loadMoreContent();
        }
    });

    loadKeywords();
});
