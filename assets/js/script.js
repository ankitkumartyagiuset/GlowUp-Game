
        /* 
         * 🧠 GAME LOGIC
         * Includes Theme Persistence
         */

        const EMOJIS = ['🎮', '💎', '🎧', '🦄', '🎀', '🍩', '🌈', '👾', '🤖', '👽', '🚀', '🛸', '💖', '⚡', '🔥', '⭐', '🍭', '🦋'];
        
        // Pricing: Very Low for Children
        const STYLES = [
            { id: 'neon', name: 'Cyan Neon',  bg: 'linear-gradient(135deg, #00f2ff, #00c3ff)', price: 0 },
            { id: 'pink', name: 'Hot Pink',  bg: 'linear-gradient(135deg, #ff00cc, #ff66cc)', price: 40 }, 
            { id: 'gold', name: 'Gold Lux',  bg: 'linear-gradient(135deg, #ffd700, #ffaa00)', price: 80 },
            { id: 'blue', name: 'Ocean',     bg: 'linear-gradient(135deg, #2193b0, #6dd5ed)', price: 150 },
            { id: 'purp', name: 'Galaxy',    bg: 'linear-gradient(135deg, #8e2de2, #4a00e0)', price: 300 },
            { id: 'fire', name: 'Sunset',    bg: 'linear-gradient(135deg, #ff512f, #dd2476)', price: 500 },
            { id: 'green', name: 'Verdant',   bg: 'linear-gradient(135deg, #28a745, #2ecc71)', price: 60 }
        ];

        const defaultState = {
            level: 1,
            coins: 0,
            inventory: ['neon'],
            activeStyle: 'neon',
            theme: 'dark'
        };

        let state = { ...defaultState };

        function init() {
            loadState();
            applyTheme(state.theme); // Apply saved theme immediately
            renderShop();
            startLevel();
        }

        // --- Theme System ---
        function toggleTheme() {
            const body = document.body;
            const icon = document.getElementById('theme-icon');
            
            if (body.classList.contains('light-mode')) {
                body.classList.remove('light-mode');
                state.theme = 'dark';
                icon.textContent = '🌙';
            } else {
                body.classList.add('light-mode');
                state.theme = 'light';
                icon.textContent = '☀️';
            }
            saveState();
        }

        function applyTheme(themeName) {
            const icon = document.getElementById('theme-icon');
            if(themeName === 'light') {
                document.body.classList.add('light-mode');
                icon.textContent = '☀️';
            } else {
                document.body.classList.remove('light-mode');
                icon.textContent = '🌙';
            }
        }

        // --- Core Gameplay ---
        function startLevel() {
            const pairCount = Math.min(15, Math.floor(2 + (state.level - 1) * 1.5));
            const cols = Math.ceil(Math.sqrt(pairCount * 2));
            const finalCols = cols > 5 ? 5 : cols;
            const rows = Math.ceil((pairCount * 2) / finalCols);

            document.getElementById('lvl-txt').innerText = state.level;
            document.getElementById('coin-txt').innerText = state.coins;
            updateProgress(0);

            const board = document.getElementById('game-board');
            board.innerHTML = '';
            board.style.gridTemplateColumns = `repeat(${finalCols}, 1fr)`;

            let deck = EMOJIS.sort(() => 0.5 - Math.random()).slice(0, pairCount);
            deck = [...deck, ...deck].sort(() => 0.5 - Math.random());

            let flipped = [];
            let matched = 0;
            let locked = false;

            deck.forEach((emoji, i) => {
                const card = document.createElement('div');
                card.className = 'card';
                card.dataset.emoji = emoji;
                
                const styleObj = STYLES.find(s => s.id === state.activeStyle);

                const front = document.createElement('div');
                front.className = 'face front';
                front.style.background = styleObj.bg;

                const back = document.createElement('div');
                back.className = 'face back';
                back.textContent = emoji;

                card.appendChild(front);
                card.appendChild(back);
                card.onclick = () => handleClick(card);
                board.appendChild(card);
            });

            function handleClick(card) {
                if (locked) return;
                if (card.classList.contains('flipped')) return;

                card.classList.add('flipped');
                flipped.push(card);

                if (flipped.length === 2) {
                    locked = true;
                    const [c1, c2] = flipped;
                    const isMatch = c1.dataset.emoji === c2.dataset.emoji;

                    if (isMatch) {
                        c1.classList.add('matched');
                        c2.classList.add('matched');
                        
                        const reward = 10 + (state.level * 2);
                        state.coins += reward;
                        matched++;

                        showReward(c2, `+${reward}`);
                        document.getElementById('coin-txt').innerText = state.coins;
                        updateProgress((matched / pairCount) * 100);

                        flipped = [];
                        locked = false;

                        if (matched === pairCount) {
                            setTimeout(levelComplete, 800);
                        }
                    } else {
                        setTimeout(() => {
                            c1.classList.remove('flipped');
                            c2.classList.remove('flipped');
                            flipped = [];
                            locked = false;
                        }, 800);
                    }
                }
            }
        }

        function levelComplete() {
            const msg = document.getElementById('level-msg');
            msg.classList.remove('show');
            void msg.offsetWidth;
            msg.classList.add('show');

            setTimeout(() => {
                state.level++;
                saveState();
                startLevel();
            }, 2000);
        }

        function updateProgress(pct) {
            document.getElementById('prog-bar').style.width = `${pct}%`;
        }

        function showReward(elem, text) {
            const r = elem.getBoundingClientRect();
            const floater = document.createElement('div');
            floater.className = 'float-reward';
            floater.innerText = text;
            floater.style.left = (r.left + 20) + 'px';
            floater.style.top = r.top + 'px';
            document.body.appendChild(floater);
            setTimeout(() => floater.remove(), 1200);
        }

        // --- Shop Logic ---
        function openShop() {
            document.getElementById('shop').classList.add('open');
            renderShop();
        }

        function closeShop() {
            document.getElementById('shop').classList.remove('open');
            startLevel();
        }

        function renderShop() {
            const container = document.getElementById('shop-list');
            container.innerHTML = '';

            STYLES.forEach(style => {
                const btn = document.createElement('div');
                btn.className = 'style-btn';
                btn.style.background = style.bg;
                
                const owned = state.inventory.includes(style.id);
                const equipped = state.activeStyle === style.id;

                if (!owned) btn.classList.add('locked');
                if (equipped) btn.classList.add('selected');

                const label = document.createElement('div');
                label.className = 'price-label';
                label.innerText = owned ? (equipped ? 'Active' : 'Owned') : `${style.price}`;

                btn.appendChild(label);
                btn.onclick = () => buyOrEquip(style);
                container.appendChild(btn);
            });
        }

        function buyOrEquip(style) {
            if (state.inventory.includes(style.id)) {
                state.activeStyle = style.id;
                saveState();
                renderShop();
            } else {
                if (state.coins >= style.price) {
                    state.coins -= style.price;
                    state.inventory.push(style.id);
                    state.activeStyle = style.id;
                    document.getElementById('coin-txt').innerText = state.coins;
                    saveState();
                    renderShop();
                    showReward(document.querySelector('.shop-grid'), `-${style.price}`);
                } else {
                    const shop = document.getElementById('shop-grid');
                    shop.style.transform = 'translateX(10px)';
                    setTimeout(() => shop.style.transform = 'translateX(0)', 100);
                }
            }
        }

        // Quick apply/purchase helper for Green button
        function applyGreenStyle() {
            const style = STYLES.find(s => s.id === 'green');
            if (!style) return;
            buyOrEquip(style);
        }

        function saveState() {
            localStorage.setItem('rgbGame_v2', JSON.stringify(state));
        }

        function loadState() {
            const saved = localStorage.getItem('rgbGame_v2');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    // Merge to ensure new fields exist if code updates
                    state = { ...defaultState, ...parsed };
                } catch (e) { console.error("Save error"); }
            }
        }

        function resetSave() {
            if(confirm("Start over from Level 1?")) {
                localStorage.removeItem('rgbGame_v2');
                location.reload();
            }
        }

        window.onload = init;