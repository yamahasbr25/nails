document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const keywordFromQuery = params.get('q') || '';
    const cleanQuery = keywordFromQuery.replace(/-\d+$/, '');
    
    // --- KONFIGURASI GAMBAR LOKAL (UNTUK GRID) ---
    const MAX_LOCAL_IMAGES = 100; // GANTI ANGKA INI sesuai jumlah gambar di folder
    let imagePool = Array.from({length: MAX_LOCAL_IMAGES}, (_, i) => i + 1);
    imagePool.sort(() => Math.random() - 0.5);

    function getNextLocalImage() {
        if (imagePool.length === 0) {
            imagePool = Array.from({length: MAX_LOCAL_IMAGES}, (_, i) => i + 1);
            imagePool.sort(() => Math.random() - 0.5);
        }
        return `image/${imagePool.pop()}.jpg`;
    }
    // ---------------------------------------------
    
    if (!cleanQuery) {
        runAGC('');
        return;
    }
    const targetHtml = cleanQuery + '.html';
    
    fetch(targetHtml)
        .then(response => {
            if (!response.ok) throw new Error('Not found');
            return response.text();
        })
        .then(htmlData => {
            if (htmlData.toLowerCase().includes('<html') && !htmlData.toLowerCase().includes('finding your inspo') && !htmlData.toLowerCase().includes('page not found')) {
                document.open();
                document.write(htmlData);
                document.close();
            } else {
                throw new Error('Soft 404');
            }
        })
        .catch(() => {
            const keyword = cleanQuery.replace(/-/g, ' ').trim();
            runAGC(keyword);
        });

    function runAGC(keyword) {
        const detailTitle = document.getElementById('detail-title');
        const detailBody = document.getElementById('detail-body');
        const mainImageWrapper = document.getElementById('main-image-wrapper');
        
        if (!keyword) {
            if(detailTitle) detailTitle.textContent = 'Inspo Not Found';
            return;
        }
        
        function capitalize(str) {
            return str.replace(/\b\w/g, l => l.toUpperCase());
        }
        
        const seoTitle = `Aesthetic ${capitalize(keyword)} Nails Ideas & Inspo`;
        document.title = seoTitle + ' | Nails Inspo';
        if(detailTitle) detailTitle.textContent = seoTitle;
        
        // --- GAMBAR UTAMA (TETAP MENGGUNAKAN BING API) ---
        if(mainImageWrapper) {
            const mainQueryImg = keyword + " aesthetic nails pinterest";
            const mainImageUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(mainQueryImg)}&w=1080&h=1620&c=7&rs=1&p=0&dpr=2`;
            const currentUrl = encodeURIComponent(window.location.href);
            const pinUrl = `https://pinterest.com/pin/create/button/?url=${currentUrl}&media=${encodeURIComponent(mainImageUrl)}&description=${encodeURIComponent(seoTitle)}`;
            
            mainImageWrapper.innerHTML = `
                <img src="${mainImageUrl}" alt="${seoTitle}" class="main-image">
                <a href="${pinUrl}" target="_blank" rel="nofollow" class="pinterest-share-btn">
                    <svg style="width:22px;height:22px;margin-right:8px;vertical-align:middle;" viewBox="0 0 24 24"><path fill="currentColor" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.366 18.605 0 12.017 0z"/></svg>
                    Save to Pinterest
                </a>
            `;
        }

        if(detailBody) detailBody.innerHTML = `<p>Save your favorite <strong>${capitalize(keyword)}</strong> nail art ideas for your next appointment. Browse the gorgeous gallery below.</p>`;

        function renderGrid(dataArray, containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            const html = dataArray.map(data => {
                const linkUrl = `detail.html?q=${encodeURIComponent(data.kw.replace(/\s+/g, '-').toLowerCase())}`;
                
                return `
                <div class="wallpaper-card">
                    <a href="${linkUrl}" class="img-link" title="${capitalize(data.kw)} Nails">
                        <img src="${data.img}" alt="${capitalize(data.kw)} Nail Art" loading="lazy" onerror="this.src='https://via.placeholder.com/1080x1620.png?text=Not+Found'">
                    </a>
                </div>
                `;
            }).join('');
            
            container.innerHTML = html;
        }

        function fetchRelated() {
            return new Promise(resolve => {
                const script = document.createElement('script');
                const cb = 'jsonp_' + Date.now() + Math.round(Math.random()*1000);
                
                window[cb] = function(data) {
                    delete window[cb];
                    script.remove();
                    if(data && data[1]) {
                        resolve(data[1].map(i => typeof i === 'string' ? i : i[0]));
                    } else {
                        resolve([]);
                    }
                };
                script.src = `https://suggestqueries.google.com/complete/search?client=youtube&jsonp=${cb}&hl=en&q=${encodeURIComponent(keyword + " nails")}`;
                script.onerror = () => resolve([]);
                document.head.appendChild(script);
                setTimeout(() => resolve([]), 3000);
            });
        }

        function fetchRandom() {
            return fetch('keyword.txt')
                .then(res => res.ok ? res.text() : '')
                .then(txt => {
                    if (txt.includes('<html')) return [];
                    return txt.split('\n').map(l => l.trim()).filter(l => l);
                })
                .catch(() => []);
        }

        async function buildContent() {
            const [relatedApi, randomTxt] = await Promise.all([fetchRelated(), fetchRandom()]);
            
            let randomPool = randomTxt.filter(k => k.toLowerCase() !== keyword.toLowerCase());
            randomPool.sort(() => Math.random() - 0.5); 
            
            const finalList = []; 
            
            function getUniqueData(kwString) {
                let cleanKw = kwString.replace(/wallpaper|nails/gi, '').trim();
                if(!cleanKw) cleanKw = kwString;
                
                // GAMBAR GRID: Menggunakan gambar lokal
                let imageUrl = getNextLocalImage();
                return { kw: cleanKw, img: imageUrl };
            }

            let r1 = relatedApi.map(k => k.replace(/wallpaper|nails/gi, '').trim()).filter(k => k);
            let relatedCount = 0;
            
            for (let k of r1) {
                if (relatedCount >= 3) break; 
                let data = getUniqueData(k);
                if (data) {
                    finalList.push(data);
                    relatedCount++;
                }
            }

            while (finalList.length < 20 && randomPool.length > 0) {
                let rk = randomPool.pop();
                let data = getUniqueData(rk);
                if (data) {
                    finalList.push(data);
                }
            }
            
            let padIndex = 1;
            while (finalList.length < 20) {
                let data = getUniqueData(`trendy nail art ${padIndex++}`);
                if (data) finalList.push(data);
            }

            const top10 = finalList.slice(0, 10);
            const bottom10 = finalList.slice(10, 20);
            renderGrid(top10, 'related-wallpapers-container');
            renderGrid(bottom10, 'random-wallpapers-container');
        }

        buildContent();
    }
});
