// Game state management
class GameState {
    constructor() {
        this.balance = 5000.00;
        this.currentGame = 'blackjack';
        this.loadBalance();
        this.initializeGames();
    }

    loadBalance() {
        const savedBalance = localStorage.getItem('purpleStakeBalance');
        if (savedBalance) {
            this.balance = parseFloat(savedBalance);
        }
        this.updateBalanceDisplay();
    }

    saveBalance() {
        localStorage.setItem('purpleStakeBalance', this.balance.toString());
        this.updateBalanceDisplay();
    }

    updateBalanceDisplay() {
        const balanceElement = document.getElementById('balance');
        balanceElement.textContent = `$${this.balance.toFixed(2)}`;
    }

    addMoney(amount) {
        this.balance += amount;
        this.saveBalance();
    }

    removeMoney(amount) {
        if (this.balance >= amount) {
            this.balance -= amount;
            this.saveBalance();
            return true;
        }
        return false;
    }

    initializeGames() {
        this.blackjack = new BlackjackGame(this);
        this.roulette = new RouletteGame(this);
        this.mines = new MinesGame(this);
        this.slots = new SlotsGame(this);
        this.plinko = new PlinkoGame(this);
        this.dice = new DiceGame(this);
        this.limbo = new LimboGame(this);
        this.baccarat = new BaccaratGame(this);
        this.setupEventListeners();
        this.setupRewardsSystem();
    }

    setupEventListeners() {
        // Game selector
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchGame(e.target.closest('.nav-link').dataset.game);
            });
        });

        // Mobile menu toggle
        document.getElementById('menu-toggle').addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('sidebar-open');
        });
    }

    switchGame(game) {
        this.currentGame = game;
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-game="${game}"]`).classList.add('active');
        
        // Update breadcrumb
        const gameNames = {
            'blackjack': 'Blackjack',
            'roulette': 'European Roulette',
            'mines': 'Mines',
            'slots': 'Slots',
            'plinko': 'Plinko',
            'dice': 'Dice',
            'limbo': 'Limbo',
            'baccarat': 'Speed Baccarat'
        };
        document.getElementById('current-game').textContent = gameNames[game] || game;
        
        // Show/hide game containers
        document.getElementById('blackjack-game').classList.toggle('hidden', game !== 'blackjack');
        document.getElementById('roulette-game').classList.toggle('hidden', game !== 'roulette');
        document.getElementById('mines-game').classList.toggle('hidden', game !== 'mines');
        document.getElementById('slots-game').classList.toggle('hidden', game !== 'slots');
        document.getElementById('plinko-game').classList.toggle('hidden', game !== 'plinko');
        document.getElementById('dice-game').classList.toggle('hidden', game !== 'dice');
        document.getElementById('limbo-game').classList.toggle('hidden', game !== 'limbo');
        document.getElementById('baccarat-game').classList.toggle('hidden', game !== 'baccarat');
        
        // Close mobile sidebar
        document.querySelector('.sidebar').classList.remove('sidebar-open');
    }

    setupRewardsSystem() {
        this.lastRewardTime = localStorage.getItem('lastRewardTime') || 0;
        this.lastDailyRewardTime = localStorage.getItem('lastDailyRewardTime') || 0;
        this.lastWeeklyRewardTime = localStorage.getItem('lastWeeklyRewardTime') || 0;
        
        this.rewardInterval = 10 * 60 * 1000; // 10 minutes in milliseconds
        this.dailyRewardInterval = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        this.weeklyRewardInterval = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
        
        this.updateRewardTimer();
        
        // Check for rewards every second
        setInterval(() => {
            this.updateRewardTimer();
        }, 1000);

        // Setup claim buttons
        document.getElementById('claim-reward-btn').addEventListener('click', () => {
            this.claimReward();
        });
        document.getElementById('claim-daily-btn').addEventListener('click', () => {
            this.claimDailyReward();
        });
        document.getElementById('claim-weekly-btn').addEventListener('click', () => {
            this.claimWeeklyReward();
        });
    }

    updateRewardTimer() {
        const now = Date.now();
        
        // Update 10-minute reward
        const timeSinceLastReward = now - this.lastRewardTime;
        const timeUntilNextReward = this.rewardInterval - timeSinceLastReward;
        
        const claimBtn = document.getElementById('claim-reward-btn');
        const timerElement = document.getElementById('reward-timer');
        
        if (timeUntilNextReward <= 0) {
            timerElement.textContent = 'Ready!';
            claimBtn.disabled = false;
            claimBtn.classList.add('claimable');
        } else {
            const minutes = Math.floor(timeUntilNextReward / 60000);
            const seconds = Math.floor((timeUntilNextReward % 60000) / 1000);
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            claimBtn.disabled = true;
            claimBtn.classList.remove('claimable');
        }
        
        // Update daily reward
        const timeSinceLastDailyReward = now - this.lastDailyRewardTime;
        const timeUntilNextDailyReward = this.dailyRewardInterval - timeSinceLastDailyReward;
        
        const dailyClaimBtn = document.getElementById('claim-daily-btn');
        const dailyTimerElement = document.getElementById('daily-timer');
        
        if (timeUntilNextDailyReward <= 0) {
            dailyTimerElement.textContent = 'Ready!';
            dailyClaimBtn.disabled = false;
            dailyClaimBtn.classList.add('claimable');
        } else {
            const hours = Math.floor(timeUntilNextDailyReward / (60 * 60 * 1000));
            const minutes = Math.floor((timeUntilNextDailyReward % (60 * 60 * 1000)) / (60 * 1000));
            const seconds = Math.floor((timeUntilNextDailyReward % (60 * 1000)) / 1000);
            dailyTimerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            dailyClaimBtn.disabled = true;
            dailyClaimBtn.classList.remove('claimable');
        }
        
        // Update weekly reward
        const timeSinceLastWeeklyReward = now - this.lastWeeklyRewardTime;
        const timeUntilNextWeeklyReward = this.weeklyRewardInterval - timeSinceLastWeeklyReward;
        
        const weeklyClaimBtn = document.getElementById('claim-weekly-btn');
        const weeklyTimerElement = document.getElementById('weekly-timer');
        
        if (timeUntilNextWeeklyReward <= 0) {
            weeklyTimerElement.textContent = 'Ready!';
            weeklyClaimBtn.disabled = false;
            weeklyClaimBtn.classList.add('claimable');
        } else {
            const days = Math.floor(timeUntilNextWeeklyReward / (24 * 60 * 60 * 1000));
            const hours = Math.floor((timeUntilNextWeeklyReward % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
            const minutes = Math.floor((timeUntilNextWeeklyReward % (60 * 60 * 1000)) / (60 * 1000));
            weeklyTimerElement.textContent = `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
            weeklyClaimBtn.disabled = true;
            weeklyClaimBtn.classList.remove('claimable');
        }
    }

    claimReward() {
        const now = Date.now();
        const timeSinceLastReward = now - this.lastRewardTime;
        
        if (timeSinceLastReward >= this.rewardInterval) {
            this.addMoney(100.00);
            this.lastRewardTime = now;
            localStorage.setItem('lastRewardTime', this.lastRewardTime.toString());
            this.updateRewardTimer();
            
            this.showRewardNotification('🎉 10min Reward claimed! +$100.00');
        }
    }

    claimDailyReward() {
        const now = Date.now();
        const timeSinceLastDailyReward = now - this.lastDailyRewardTime;
        
        if (timeSinceLastDailyReward >= this.dailyRewardInterval) {
            this.addMoney(1000.00);
            this.lastDailyRewardTime = now;
            localStorage.setItem('lastDailyRewardTime', this.lastDailyRewardTime.toString());
            this.updateRewardTimer();
            
            this.showRewardNotification('🎉 Daily Reward claimed! +$1,000.00');
        }
    }

    claimWeeklyReward() {
        const now = Date.now();
        const timeSinceLastWeeklyReward = now - this.lastWeeklyRewardTime;
        
        if (timeSinceLastWeeklyReward >= this.weeklyRewardInterval) {
            this.addMoney(10000.00);
            this.lastWeeklyRewardTime = now;
            localStorage.setItem('lastWeeklyRewardTime', this.lastWeeklyRewardTime.toString());
            this.updateRewardTimer();
            
            this.showRewardNotification('🎉 Weekly Reward claimed! +$10,000.00');
        }
    }

    showRewardNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #10b981, #059669);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.5s ease-out;
            font-weight: 600;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }
}

// Blackjack Game
class BlackjackGame {
    constructor(gameState) {
        this.gameState = gameState;
        this.deck = [];
        this.playerHand = [];
        this.dealerHand = [];
        this.currentBet = 0;
        this.gameInProgress = false;
        this.setupEventListeners();
        this.createDeck();
    }

    createDeck() {
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        
        this.deck = [];
        for (let suit of suits) {
            for (let value of values) {
                this.deck.push({ suit, value });
            }
        }
        this.shuffleDeck();
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    dealCard() {
        if (this.deck.length === 0) {
            this.createDeck();
        }
        return this.deck.pop();
    }

    calculateHandValue(hand) {
        let value = 0;
        let aces = 0;
        
        for (let card of hand) {
            if (card.value === 'A') {
                aces += 1;
            } else if (['K', 'Q', 'J'].includes(card.value)) {
                value += 10;
            } else {
                value += parseInt(card.value);
            }
        }
        
        for (let i = 0; i < aces; i++) {
            if (value + 11 <= 21) {
                value += 11;
            } else {
                value += 1;
            }
        }
        
        return value;
    }

    setupEventListeners() {
        document.getElementById('deal-btn').addEventListener('click', () => this.deal());
        document.getElementById('hit-btn').addEventListener('click', () => this.hit());
        document.getElementById('stand-btn').addEventListener('click', () => this.stand());
        
        // Quick bet buttons
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = parseInt(e.target.dataset.amount);
                document.getElementById('bet-amount').value = amount;
            });
        });
    }

    deal() {
        const betAmount = parseFloat(document.getElementById('bet-amount').value);
        
        if (betAmount <= 0 || betAmount > this.gameState.balance) {
            this.showMessage('Invalid bet amount!', 'lose');
            return;
        }

        if (!this.gameState.removeMoney(betAmount)) {
            this.showMessage('Insufficient funds!', 'lose');
            return;
        }

        this.currentBet = betAmount;
        this.gameInProgress = true;
        this.playerHand = [];
        this.dealerHand = [];

        // Deal initial cards
        this.playerHand.push(this.dealCard());
        this.dealerHand.push(this.dealCard());
        this.playerHand.push(this.dealCard());
        this.dealerHand.push(this.dealCard());

        this.updateDisplay();
        this.updateButtons();

        // Check for blackjack
        if (this.calculateHandValue(this.playerHand) === 21) {
            this.stand();
        }
    }

    hit() {
        if (!this.gameInProgress) return;

        this.playerHand.push(this.dealCard());
        this.updateDisplay();

        const playerValue = this.calculateHandValue(this.playerHand);
        if (playerValue > 21) {
            this.endGame('bust');
        } else if (playerValue === 21) {
            this.stand();
        }
    }

    stand() {
        if (!this.gameInProgress) return;

        // Dealer plays
        while (this.calculateHandValue(this.dealerHand) < 17) {
            this.dealerHand.push(this.dealCard());
        }

        this.updateDisplay(true); // Show dealer's hidden card
        this.determineWinner();
    }

    determineWinner() {
        const playerValue = this.calculateHandValue(this.playerHand);
        const dealerValue = this.calculateHandValue(this.dealerHand);

        if (playerValue > 21) {
            this.endGame('bust');
        } else if (dealerValue > 21) {
            this.endGame('dealer_bust');
        } else if (playerValue > dealerValue) {
            this.endGame('win');
        } else if (dealerValue > playerValue) {
            this.endGame('lose');
        } else {
            this.endGame('push');
        }
    }

    endGame(result) {
        this.gameInProgress = false;
        this.updateButtons();

        switch (result) {
            case 'win':
                this.gameState.addMoney(this.currentBet * 2);
                this.showMessage(`You won $${this.currentBet.toFixed(2)}!`, 'win');
                break;
            case 'lose':
            case 'bust':
                this.showMessage(`You lost $${this.currentBet.toFixed(2)}!`, 'lose');
                break;
            case 'dealer_bust':
                this.gameState.addMoney(this.currentBet * 2);
                this.showMessage(`Dealer bust! You won $${this.currentBet.toFixed(2)}!`, 'win');
                break;
            case 'push':
                this.gameState.addMoney(this.currentBet);
                this.showMessage('Push! Your bet is returned.', 'info');
                break;
        }

        this.currentBet = 0;
    }

    updateDisplay(showDealerCard = false) {
        // Update dealer cards
        const dealerCardsContainer = document.getElementById('dealer-cards');
        dealerCardsContainer.innerHTML = '';
        
        this.dealerHand.forEach((card, index) => {
            const cardElement = this.createCardElement(card);
            if (index === 1 && !showDealerCard && this.gameInProgress) {
                cardElement.classList.add('hidden');
                cardElement.textContent = '?';
            }
            dealerCardsContainer.appendChild(cardElement);
        });

        // Update player cards
        const playerCardsContainer = document.getElementById('player-cards');
        playerCardsContainer.innerHTML = '';
        
        this.playerHand.forEach(card => {
            const cardElement = this.createCardElement(card);
            playerCardsContainer.appendChild(cardElement);
        });

        // Update scores
        document.getElementById('dealer-score').textContent = 
            showDealerCard ? this.calculateHandValue(this.dealerHand) : 
            this.calculateHandValue([this.dealerHand[0]]);
        document.getElementById('player-score').textContent = this.calculateHandValue(this.playerHand);
    }

    createCardElement(card) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.textContent = `${card.value}${card.suit}`;
        
        if (['♥', '♦'].includes(card.suit)) {
            cardElement.classList.add('red');
        } else {
            cardElement.classList.add('black');
        }
        
        return cardElement;
    }

    updateButtons() {
        const hitBtn = document.getElementById('hit-btn');
        const standBtn = document.getElementById('stand-btn');
        const dealBtn = document.getElementById('deal-btn');

        hitBtn.disabled = !this.gameInProgress;
        standBtn.disabled = !this.gameInProgress;
        dealBtn.disabled = this.gameInProgress;
    }

    showMessage(message, type) {
        const messageElement = document.getElementById('blackjack-message');
        messageElement.textContent = message;
        messageElement.className = `game-message ${type}`;
    }
}

// Roulette Game
class RouletteGame {
    constructor(gameState) {
        this.gameState = gameState;
        this.selectedNumbers = new Set();
        this.selectedBets = new Set();
        this.isSpinning = false;
        this.setupEventListeners();
        this.setupNumberColors();
    }

    setupEventListeners() {
        document.getElementById('spin-btn').addEventListener('click', () => this.spin());
        document.getElementById('clear-bets-btn').addEventListener('click', () => this.clearBets());
        
        // Number selection
        document.querySelectorAll('.number').forEach(number => {
            number.addEventListener('click', (e) => {
                if (!this.isSpinning) {
                    this.toggleNumberSelection(e.target);
                }
            });
        });

        // Outside bet selection
        document.querySelectorAll('.bet-option').forEach(option => {
            option.addEventListener('click', (e) => {
                if (!this.isSpinning) {
                    this.toggleBetSelection(e.target);
                }
            });
        });
        
        // Quick bet buttons
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = parseInt(e.target.dataset.amount);
                document.getElementById('roulette-bet-amount').value = amount;
            });
        });
    }

    setupNumberColors() {
        const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
        
        document.querySelectorAll('.number').forEach(number => {
            const num = parseInt(number.dataset.number);
            if (num === 0) {
                number.style.background = 'linear-gradient(45deg, #059669, #10b981)';
            } else if (redNumbers.includes(num)) {
                number.classList.add('red');
            } else {
                number.classList.add('black');
            }
        });
    }

    toggleNumberSelection(element) {
        const number = element.dataset.number;
        if (this.selectedNumbers.has(number)) {
            this.selectedNumbers.delete(number);
            element.classList.remove('selected');
        } else {
            this.selectedNumbers.add(number);
            element.classList.add('selected');
        }
    }

    toggleBetSelection(element) {
        const bet = element.dataset.bet;
        if (this.selectedBets.has(bet)) {
            this.selectedBets.delete(bet);
            element.classList.remove('selected');
        } else {
            this.selectedBets.add(bet);
            element.classList.add('selected');
        }
    }

    clearBets() {
        this.selectedNumbers.clear();
        this.selectedBets.clear();
        
        document.querySelectorAll('.number.selected').forEach(el => el.classList.remove('selected'));
        document.querySelectorAll('.bet-option.selected').forEach(el => el.classList.remove('selected'));
    }

    spin() {
        if (this.isSpinning) return;

        const betAmount = parseFloat(document.getElementById('roulette-bet-amount').value);
        const totalBets = this.selectedNumbers.size + this.selectedBets.size;
        
        if (totalBets === 0) {
            this.showMessage('Please select at least one bet!', 'lose');
            return;
        }

        const totalBetAmount = betAmount * totalBets;
        if (totalBetAmount > this.gameState.balance) {
            this.showMessage('Insufficient funds!', 'lose');
            return;
        }

        if (!this.gameState.removeMoney(totalBetAmount)) {
            this.showMessage('Insufficient funds!', 'lose');
            return;
        }

        this.isSpinning = true;
        document.getElementById('spin-btn').disabled = true;
        document.getElementById('clear-bets-btn').disabled = true;

        // Animate wheel
        const wheel = document.getElementById('wheel');
        const ball = document.getElementById('ball');
        
        wheel.classList.add('spinning');
        ball.classList.add('pulse');

        // Generate random number
        const winningNumber = Math.floor(Math.random() * 37); // 0-36
        
        setTimeout(() => {
            this.endSpin(winningNumber, betAmount, totalBets);
        }, 3000);
    }

    endSpin(winningNumber, betAmount, totalBets) {
        this.isSpinning = false;
        document.getElementById('spin-btn').disabled = false;
        document.getElementById('clear-bets-btn').disabled = false;

        const wheel = document.getElementById('wheel');
        const ball = document.getElementById('ball');
        
        wheel.classList.remove('spinning');
        ball.classList.remove('pulse');

        // Update last number display
        document.getElementById('last-number').textContent = winningNumber;

        // Calculate winnings
        let totalWinnings = 0;
        let wonOnNumbers = false;
        let wonOnBets = false;

        // Check number bets (35:1 payout)
        if (this.selectedNumbers.has(winningNumber.toString())) {
            totalWinnings += betAmount * 35;
            wonOnNumbers = true;
        }

        // Check outside bets
        for (let bet of this.selectedBets) {
            if (this.checkOutsideBet(bet, winningNumber)) {
                totalWinnings += betAmount * this.getBetPayout(bet);
                wonOnBets = true;
            }
        }

        // Update balance and show result
        if (totalWinnings > 0) {
            this.gameState.addMoney(totalWinnings);
            this.showMessage(`You won $${totalWinnings.toFixed(2)}!`, 'win');
        } else {
            this.showMessage(`You lost $${(betAmount * totalBets).toFixed(2)}!`, 'lose');
        }

        // Clear selections
        this.clearBets();
    }

    checkOutsideBet(bet, number) {
        const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
        
        switch (bet) {
            case 'red':
                return redNumbers.includes(number);
            case 'black':
                return number !== 0 && !redNumbers.includes(number);
            case 'even':
                return number !== 0 && number % 2 === 0;
            case 'odd':
                return number !== 0 && number % 2 === 1;
            case '1-18':
                return number >= 1 && number <= 18;
            case '19-36':
                return number >= 19 && number <= 36;
            case '1st12':
                return number >= 1 && number <= 12;
            case '2nd12':
                return number >= 13 && number <= 24;
            case '3rd12':
                return number >= 25 && number <= 36;
            default:
                return false;
        }
    }

    getBetPayout(bet) {
        const payouts = {
            'red': 1, 'black': 1, 'even': 1, 'odd': 1,
            '1-18': 1, '19-36': 1, '1st12': 2, '2nd12': 2, '3rd12': 2
        };
        return payouts[bet] || 0;
    }

    showMessage(message, type) {
        const messageElement = document.getElementById('roulette-message');
        messageElement.textContent = message;
        messageElement.className = `game-message ${type}`;
    }
}

// Mines Game
class MinesGame {
    constructor(gameState) {
        this.gameState = gameState;
        this.board = [];
        this.mines = [];
        this.revealed = [];
        this.gameInProgress = false;
        this.currentBet = 0;
        this.gemsFound = 0;
        this.currentMultiplier = 1.00;
        this.setupEventListeners();
        this.createBoard();
    }

    createBoard() {
        this.board = [];
        for (let i = 0; i < 25; i++) {
            this.board.push(i);
        }
        this.renderBoard();
    }

    renderBoard() {
        const boardElement = document.getElementById('mines-board');
        boardElement.innerHTML = '';
        
        for (let i = 0; i < 25; i++) {
            const tile = document.createElement('div');
            tile.className = 'mine-tile';
            tile.dataset.index = i;
            
            if (this.revealed.includes(i)) {
                tile.classList.add('revealed');
                if (this.mines.includes(i)) {
                    tile.classList.add('mine');
                } else {
                    tile.classList.add('gem');
                }
            }
            
            tile.addEventListener('click', () => this.revealTile(i));
            boardElement.appendChild(tile);
        }
    }

    setupEventListeners() {
        document.getElementById('start-mines-btn').addEventListener('click', () => this.startGame());
        document.getElementById('cashout-mines-btn').addEventListener('click', () => this.cashout());
        document.getElementById('reset-mines-btn').addEventListener('click', () => this.resetGame());
    }

    startGame() {
        const betAmount = parseFloat(document.getElementById('mines-bet-amount').value);
        const minesCount = parseInt(document.getElementById('mines-count').value);
        
        if (betAmount <= 0 || betAmount > this.gameState.balance) {
            this.showMessage('Invalid bet amount!', 'lose');
            return;
        }

        if (!this.gameState.removeMoney(betAmount)) {
            this.showMessage('Insufficient funds!', 'lose');
            return;
        }

        this.currentBet = betAmount;
        this.gameInProgress = true;
        this.gemsFound = 0;
        this.currentMultiplier = 1.00;
        this.revealed = [];
        this.mines = [];

        // Place mines randomly
        const availablePositions = [...this.board];
        for (let i = 0; i < minesCount; i++) {
            const randomIndex = Math.floor(Math.random() * availablePositions.length);
            this.mines.push(availablePositions[randomIndex]);
            availablePositions.splice(randomIndex, 1);
        }

        this.updateDisplay();
        this.updateButtons();
        this.showMessage('Game started! Click tiles to reveal gems. Avoid mines!', 'info');
    }

    revealTile(index) {
        if (!this.gameInProgress || this.revealed.includes(index)) {
            return;
        }

        this.revealed.push(index);

        if (this.mines.includes(index)) {
            // Hit a mine - game over
            this.gameInProgress = false;
            this.updateDisplay();
            this.updateButtons();
            this.showMessage(`BOOM! You hit a mine and lost $${this.currentBet.toFixed(2)}!`, 'lose');
        } else {
            // Found a gem
            this.gemsFound++;
            this.currentMultiplier = this.calculateMultiplier();
            this.updateDisplay();
            this.updateButtons();
            
            if (this.gemsFound >= 5) {
                this.showMessage(`Amazing! You found ${this.gemsFound} gems! Consider cashing out!`, 'win');
            } else {
                this.showMessage(`Great! You found a gem! Multiplier: ${this.currentMultiplier.toFixed(2)}x`, 'win');
            }
        }
    }

    calculateMultiplier() {
        const minesCount = this.mines.length;
        const gemsFound = this.gemsFound;
        
        // Calculate house edge and multiplier
        const totalTiles = 25;
        const safeTiles = totalTiles - minesCount;
        const remainingSafeTiles = safeTiles - gemsFound;
        const remainingTiles = totalTiles - gemsFound;
        
        if (remainingTiles === 0) return 1.00;
        
        // Calculate probability of winning
        let probability = 1.0;
        for (let i = 0; i < gemsFound; i++) {
            probability *= (safeTiles - i) / (totalTiles - i);
        }
        
        // Apply house edge (5%)
        const houseEdge = 0.95;
        const multiplier = houseEdge / probability;
        
        return Math.max(1.00, multiplier);
    }

    cashout() {
        if (!this.gameInProgress || this.gemsFound === 0) {
            return;
        }

        const winnings = this.currentBet * this.currentMultiplier;
        this.gameState.addMoney(winnings);
        
        this.gameInProgress = false;
        this.updateButtons();
        this.showMessage(`Congratulations! You cashed out $${winnings.toFixed(2)}!`, 'win');
    }

    resetGame() {
        this.gameInProgress = false;
        this.currentBet = 0;
        this.gemsFound = 0;
        this.currentMultiplier = 1.00;
        this.revealed = [];
        this.mines = [];
        
        this.createBoard();
        this.updateDisplay();
        this.updateButtons();
        this.showMessage('Game reset!', 'info');
    }

    updateDisplay() {
        this.renderBoard();
        document.getElementById('current-multiplier').textContent = `${this.currentMultiplier.toFixed(2)}x`;
        document.getElementById('gems-found').textContent = this.gemsFound;
    }

    updateButtons() {
        const startBtn = document.getElementById('start-mines-btn');
        const cashoutBtn = document.getElementById('cashout-mines-btn');
        const resetBtn = document.getElementById('reset-mines-btn');

        startBtn.disabled = this.gameInProgress;
        cashoutBtn.disabled = !this.gameInProgress || this.gemsFound === 0;
        resetBtn.disabled = this.gameInProgress;
    }

    showMessage(message, type) {
        const messageElement = document.getElementById('mines-message');
        messageElement.textContent = message;
        messageElement.className = `game-message ${type}`;
    }
}

// Slots Game
class SlotsGame {
    constructor(gameState) {
        this.gameState = gameState;
        this.symbols = ['7', 'bar', 'wild', 'double'];
        this.payouts = {
            '7': 777, 'bar': 100, 'wild': 200, 'double': 150
        };
        this.isSpinning = false;
        this.setupEventListeners();
        this.createReels();
    }

    createReels() {
        for (let i = 1; i <= 3; i++) {
            const reel = document.getElementById(`reel-${i}`);
            reel.innerHTML = '';
            for (let j = 0; j < 6; j++) {
                const symbol = document.createElement('div');
                symbol.className = 'reel-symbol';
                const symbolType = this.symbols[Math.floor(Math.random() * this.symbols.length)];
                symbol.setAttribute('data-symbol', symbolType);
                symbol.textContent = this.getSymbolText(symbolType);
                reel.appendChild(symbol);
            }
        }
    }

    getSymbolText(symbolType) {
        const symbolTexts = {
            '7': '7',
            'bar': 'BAR',
            'wild': 'WILD',
            'double': 'DOUBLE'
        };
        return symbolTexts[symbolType] || symbolType;
    }

    setupEventListeners() {
        document.getElementById('spin-slots-btn').addEventListener('click', () => this.spin());
        document.getElementById('auto-spin-slots-btn').addEventListener('click', () => this.toggleAutoSpin());
    }

    spin() {
        if (this.isSpinning) return;

        const betAmount = parseFloat(document.getElementById('slots-bet-amount').value);

        if (betAmount > this.gameState.balance) {
            this.showMessage('Insufficient funds!', 'lose');
            return;
        }

        if (!this.gameState.removeMoney(betAmount)) {
            this.showMessage('Insufficient funds!', 'lose');
            return;
        }

        this.isSpinning = true;
        document.getElementById('spin-slots-btn').disabled = true;
        document.getElementById('auto-spin-slots-btn').disabled = true;

        // Animate reels
        this.animateReels().then(() => {
            this.evaluateWin(betAmount);
        });
    }

    async animateReels() {
        const reels = document.querySelectorAll('.reel');
        const promises = [];

        reels.forEach((reel, index) => {
            const promise = new Promise(resolve => {
                setTimeout(() => {
                    this.spinReel(reel);
                    resolve();
                }, index * 200);
            });
            promises.push(promise);
        });

        await Promise.all(promises);
    }

    spinReel(reel) {
        const symbols = reel.querySelectorAll('.reel-symbol');
        symbols.forEach((symbol, index) => {
            setTimeout(() => {
                const symbolType = this.symbols[Math.floor(Math.random() * this.symbols.length)];
                symbol.setAttribute('data-symbol', symbolType);
                symbol.textContent = this.getSymbolText(symbolType);
            }, index * 100);
        });
    }

    evaluateWin(betAmount) {
        const reels = document.querySelectorAll('.reel');
        const centerSymbols = [];
        
        reels.forEach(reel => {
            const symbols = reel.querySelectorAll('.reel-symbol');
            centerSymbols.push(symbols[2].getAttribute('data-symbol'));
        });

        // Check for winning combinations
        let totalWin = 0;
        const payline = document.getElementById('payline');
        
        // Check for 3 matching symbols on payline
        if (centerSymbols[0] === centerSymbols[1] && centerSymbols[1] === centerSymbols[2]) {
            const symbol = centerSymbols[0];
            const payout = this.payouts[symbol] || 0;
            totalWin = betAmount * (payout / 100);
            
            // Highlight winning symbols
            reels.forEach((reel, index) => {
                const symbols = reel.querySelectorAll('.reel-symbol');
                symbols[2].classList.add('win');
            });
        }

        if (totalWin > 0) {
            this.gameState.addMoney(totalWin);
            payline.classList.add('active');
            this.showMessage(`You won $${totalWin.toFixed(2)}!`, 'win');
        } else {
            this.showMessage('No win this time!', 'lose');
        }

        document.getElementById('slots-win').textContent = `$${totalWin.toFixed(2)}`;

        this.isSpinning = false;
        document.getElementById('spin-slots-btn').disabled = false;
        document.getElementById('auto-spin-slots-btn').disabled = false;

        setTimeout(() => {
            payline.classList.remove('active');
            document.querySelectorAll('.reel-symbol.win').forEach(symbol => {
                symbol.classList.remove('win');
            });
        }, 2000);
    }

    toggleAutoSpin() {
        // Auto spin functionality
        if (!this.isSpinning) {
            this.spin();
        }
    }

    showMessage(message, type) {
        const messageElement = document.getElementById('slots-message');
        messageElement.textContent = message;
        messageElement.className = `game-message ${type}`;
    }
}

// Plinko Game
class PlinkoGame {
    constructor(gameState) {
        this.gameState = gameState;
        this.isDropping = false;
        this.setupEventListeners();
        this.createBoard();
    }

    createBoard() {
        this.createPins();
        this.createBuckets();
    }

    createPins() {
        const pinsContainer = document.getElementById('plinko-pins');
        pinsContainer.innerHTML = '';
        
        // Create 16 rows of pins (like in the image)
        for (let row = 0; row < 16; row++) {
            const rowElement = document.createElement('div');
            rowElement.className = 'plinko-row';
            
            // Each row has row + 1 pins
            for (let col = 0; col <= row; col++) {
                const pin = document.createElement('div');
                pin.className = 'plinko-pin';
                rowElement.appendChild(pin);
            }
            
            pinsContainer.appendChild(rowElement);
        }
    }

    createBuckets() {
        const bucketsContainer = document.getElementById('plinko-buckets');
        bucketsContainer.innerHTML = '';
        
        // Multipliers from the image (16 buckets total)
        const multipliers = [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16];
        
        multipliers.forEach((multiplier, index) => {
            const bucket = document.createElement('div');
            bucket.className = 'plinko-bucket';
            bucket.textContent = `${multiplier}x`;
            bucket.dataset.multiplier = multiplier;
            bucketsContainer.appendChild(bucket);
        });
    }

    setupEventListeners() {
        document.getElementById('drop-plinko-btn').addEventListener('click', () => this.dropBall());
        document.getElementById('reset-plinko-btn').addEventListener('click', () => this.reset());
        document.getElementById('plinko-risk-level').addEventListener('change', () => this.updateRisk());
    }

    updateRisk() {
        const risk = document.getElementById('plinko-risk-level').value;
        const multiplierElement = document.getElementById('plinko-multiplier');
        const riskElement = document.getElementById('plinko-risk');
        
        const riskConfigs = {
            low: { multiplier: '1.00x', risk: 'Low' },
            medium: { multiplier: '2.50x', risk: 'Medium' },
            high: { multiplier: '5.00x', risk: 'High' }
        };
        
        const config = riskConfigs[risk];
        multiplierElement.textContent = config.multiplier;
        riskElement.textContent = config.risk;
    }

    dropBall() {
        if (this.isDropping) return;

        const betAmount = parseFloat(document.getElementById('plinko-bet-amount').value);
        
        if (betAmount > this.gameState.balance) {
            this.showMessage('Insufficient funds!', 'lose');
            return;
        }

        if (!this.gameState.removeMoney(betAmount)) {
            this.showMessage('Insufficient funds!', 'lose');
            return;
        }

        this.isDropping = true;
        document.getElementById('drop-plinko-btn').disabled = true;

        const ball = document.getElementById('plinko-ball');
        const dropZone = document.querySelector('.plinko-drop-zone');
        const buckets = document.querySelectorAll('.plinko-bucket');
        
        // Reset ball position
        ball.style.transition = 'none';
        ball.style.top = '0';
        ball.style.left = '50%';
        ball.style.transform = 'translateX(-50%)';
        
        // Simulate realistic ball path through pins
        const finalBucket = this.simulateBallPath();
        const multiplier = parseFloat(buckets[finalBucket].dataset.multiplier);
        
        // Animate ball drop with realistic physics
        this.animateBallDrop(ball, finalBucket, () => {
            const winnings = betAmount * multiplier;
            this.gameState.addMoney(winnings);
            
            // Highlight winning bucket
            buckets[finalBucket].classList.add('win');
            
            this.showMessage(`Ball landed on ${multiplier}x! You won $${winnings.toFixed(2)}!`, 'win');
            
            this.isDropping = false;
            document.getElementById('drop-plinko-btn').disabled = false;
            
            setTimeout(() => {
                buckets[finalBucket].classList.remove('win');
                // Reset ball position
                ball.style.transition = 'none';
                ball.style.top = '0';
                ball.style.left = '50%';
                ball.style.transform = 'translateX(-50%)';
            }, 2000);
        });
    }

    simulateBallPath() {
        // Simulate realistic ball bouncing through pins
        // Each row has a 50/50 chance to go left or right
        let position = 8; // Start in the middle (8th bucket)
        
        for (let row = 0; row < 16; row++) {
            // Add some randomness to make it more realistic
            const random = Math.random();
            if (random < 0.5 && position > 0) {
                position--;
            } else if (random >= 0.5 && position < 16) {
                position++;
            }
        }
        
        return Math.max(0, Math.min(16, position));
    }

    animateBallDrop(ball, finalBucket, callback) {
        const totalTime = 3000; // 3 seconds total
        const steps = 60; // 60 animation steps
        const stepTime = totalTime / steps;
        
        let currentStep = 0;
        
        const animate = () => {
            if (currentStep >= steps) {
                callback();
                return;
            }
            
            const progress = currentStep / steps;
            const easeProgress = this.easeInOutCubic(progress);
            
            // Calculate position based on progress
            const startX = 50; // Start in center
            const endX = (finalBucket / 16) * 100; // End at final bucket
            const currentX = startX + (endX - startX) * easeProgress;
            
            // Calculate Y position (accelerating downward)
            const currentY = progress * 400; // Drop 400px total
            
            ball.style.transition = `all ${stepTime}ms linear`;
            ball.style.top = `${currentY}px`;
            ball.style.left = `${currentX}%`;
            ball.style.transform = 'translateX(-50%)';
            
            currentStep++;
            setTimeout(animate, stepTime);
        };
        
        animate();
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    reset() {
        const ball = document.getElementById('plinko-ball');
        ball.style.transition = 'none';
        ball.style.top = '0';
        ball.style.left = '50%';
        
        document.querySelectorAll('.plinko-bucket.win').forEach(bucket => {
            bucket.classList.remove('win');
        });
    }

    showMessage(message, type) {
        const messageElement = document.getElementById('plinko-message');
        messageElement.textContent = message;
        messageElement.className = `game-message ${type}`;
    }
}

// Dice Game
class DiceGame {
    constructor(gameState) {
        this.gameState = gameState;
        this.betType = 'over';
        this.setupEventListeners();
        this.updateChance();
    }

    setupEventListeners() {
        document.getElementById('roll-dice-btn').addEventListener('click', () => this.rollDice());
        document.querySelectorAll('.bet-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.betType = e.target.dataset.type;
                document.querySelectorAll('.bet-type-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateChance();
            });
        });
        document.getElementById('dice-target-number').addEventListener('input', () => this.updateChance());
    }

    updateChance() {
        const target = parseInt(document.getElementById('dice-target-number').value);
        let chance;
        
        if (this.betType === 'over') {
            chance = ((100 - target) / 100) * 100;
        } else {
            chance = (target / 100) * 100;
        }
        
        document.getElementById('dice-chance').textContent = `${chance.toFixed(1)}%`;
    }

    rollDice() {
        const betAmount = parseFloat(document.getElementById('dice-bet-amount').value);
        const target = parseInt(document.getElementById('dice-target-number').value);
        
        if (betAmount > this.gameState.balance) {
            this.showMessage('Insufficient funds!', 'lose');
            return;
        }

        if (!this.gameState.removeMoney(betAmount)) {
            this.showMessage('Insufficient funds!', 'lose');
            return;
        }

        const dice = document.getElementById('dice');
        dice.classList.add('rolling');
        
        // Generate random roll (1-100)
        const roll = Math.floor(Math.random() * 100) + 1;
        
        setTimeout(() => {
            dice.classList.remove('rolling');
            
            // Update dice display with proper dots
            this.updateDiceDisplay(roll);
            
            // Determine win
            let won = false;
            if (this.betType === 'over' && roll > target) {
                won = true;
            } else if (this.betType === 'under' && roll < target) {
                won = true;
            }
            
            if (won) {
                const payout = this.calculatePayout(target);
                const winnings = betAmount * payout;
                this.gameState.addMoney(winnings);
                this.showMessage(`You won $${winnings.toFixed(2)}! Roll: ${roll}`, 'win');
            } else {
                this.showMessage(`You lost $${betAmount.toFixed(2)}! Roll: ${roll}`, 'lose');
            }
        }, 1000);
    }

    updateDiceDisplay(roll) {
        const dice = document.getElementById('dice');
        const diceResult = document.getElementById('dice-result');
        
        // Update result text
        diceResult.textContent = `You rolled: ${roll}`;
        
        // Update dice face based on roll (1-6)
        const diceValue = ((roll - 1) % 6) + 1;
        const dots = this.getDiceDots(diceValue);
        
        const diceFace = dice.querySelector('.dice-face');
        diceFace.innerHTML = '';
        
        dots.forEach(dot => {
            const dotElement = document.createElement('div');
            dotElement.className = 'dice-dot';
            dotElement.style.gridArea = dot;
            diceFace.appendChild(dotElement);
        });
    }

    getDiceDots(value) {
        const dotPositions = {
            1: ['2/2'],
            2: ['1/1', '3/3'],
            3: ['1/1', '2/2', '3/3'],
            4: ['1/1', '1/3', '3/1', '3/3'],
            5: ['1/1', '1/3', '2/2', '3/1', '3/3'],
            6: ['1/1', '1/2', '1/3', '3/1', '3/2', '3/3']
        };
        return dotPositions[value] || [];
    }

    calculatePayout(target) {
        let chance;
        if (this.betType === 'over') {
            chance = (100 - target) / 100;
        } else {
            chance = target / 100;
        }
        
        // Apply house edge
        return (0.99 / chance);
    }

    showMessage(message, type) {
        const messageElement = document.getElementById('dice-message');
        messageElement.textContent = message;
        messageElement.className = `game-message ${type}`;
    }
}

// Limbo Game
class LimboGame {
    constructor(gameState) {
        this.gameState = gameState;
        this.isPlaying = false;
        this.setupEventListeners();
        this.updateChance();
    }

    setupEventListeners() {
        document.getElementById('play-limbo-btn').addEventListener('click', () => this.play());
        document.getElementById('limbo-target-multiplier').addEventListener('input', () => this.updateChance());
        
        // Quick bet buttons
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = parseInt(e.target.dataset.amount);
                document.getElementById('limbo-bet-amount').value = amount;
            });
        });
    }

    updateChance() {
        const target = parseFloat(document.getElementById('limbo-target-multiplier').value);
        const chance = (1 / target) * 100;
        document.getElementById('limbo-chance').textContent = `${chance.toFixed(2)}%`;
        document.getElementById('limbo-target').textContent = `${target.toFixed(2)}x`;
    }

    play() {
        if (this.isPlaying) return;

        const betAmount = parseFloat(document.getElementById('limbo-bet-amount').value);
        const target = parseFloat(document.getElementById('limbo-target-multiplier').value);
        
        if (betAmount > this.gameState.balance) {
            this.showMessage('Insufficient funds!', 'lose');
            return;
        }

        if (!this.gameState.removeMoney(betAmount)) {
            this.showMessage('Insufficient funds!', 'lose');
            return;
        }

        this.isPlaying = true;
        document.getElementById('play-limbo-btn').disabled = true;

        // Animate multiplier
        const multiplierElement = document.getElementById('limbo-multiplier');
        const progressElement = document.getElementById('limbo-progress');
        let currentMultiplier = 1.00;
        
        const interval = setInterval(() => {
            currentMultiplier += 0.01;
            multiplierElement.textContent = `${currentMultiplier.toFixed(2)}x`;
            progressElement.style.width = `${Math.min((currentMultiplier / target) * 100, 100)}%`;
            
            if (currentMultiplier >= target) {
                clearInterval(interval);
                this.endGame(betAmount, target, true);
            }
        }, 50);

        // Random crash point
        const crashPoint = this.generateCrashPoint();
        setTimeout(() => {
            if (currentMultiplier < target) {
                clearInterval(interval);
                this.endGame(betAmount, currentMultiplier, false);
            }
        }, crashPoint * 50);
    }

    generateCrashPoint() {
        // Generate random crash point with house edge
        return Math.max(1, Math.floor(Math.random() * 1000));
    }

    endGame(betAmount, multiplier, won) {
        this.isPlaying = false;
        document.getElementById('play-limbo-btn').disabled = false;
        
        if (won) {
            const winnings = betAmount * multiplier;
            this.gameState.addMoney(winnings);
            this.showMessage(`Congratulations! You won $${winnings.toFixed(2)}!`, 'win');
        } else {
            this.showMessage(`Crashed at ${multiplier.toFixed(2)}x! You lost $${betAmount.toFixed(2)}!`, 'lose');
        }
        
        // Reset progress
        setTimeout(() => {
            document.getElementById('limbo-progress').style.width = '0%';
            document.getElementById('limbo-multiplier').textContent = '1.00x';
        }, 2000);
    }

    showMessage(message, type) {
        const messageElement = document.getElementById('limbo-message');
        messageElement.textContent = message;
        messageElement.className = `game-message ${type}`;
    }
}

// Speed Baccarat Game
class BaccaratGame {
    constructor(gameState) {
        this.gameState = gameState;
        this.deck = [];
        this.playerHand = [];
        this.bankerHand = [];
        this.currentBet = 0;
        this.selectedBet = null;
        this.gameInProgress = false;
        this.setupEventListeners();
        this.createDeck();
    }

    createDeck() {
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        
        this.deck = [];
        for (let suit of suits) {
            for (let value of values) {
                this.deck.push({ suit, value });
            }
        }
        this.shuffleDeck();
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    dealCard() {
        if (this.deck.length === 0) {
            this.createDeck();
        }
        return this.deck.pop();
    }

    calculateHandValue(hand) {
        let value = 0;
        for (let card of hand) {
            if (['K', 'Q', 'J', '10'].includes(card.value)) {
                value += 0;
            } else if (card.value === 'A') {
                value += 1;
            } else {
                value += parseInt(card.value);
            }
        }
        return value % 10;
    }

    setupEventListeners() {
        document.getElementById('deal-baccarat-btn').addEventListener('click', () => this.deal());
        document.querySelectorAll('.baccarat-bet-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectedBet = e.target.dataset.bet;
                document.querySelectorAll('.baccarat-bet-btn').forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
            });
        });
    }

    deal() {
        if (!this.selectedBet) {
            this.showMessage('Please select a bet type!', 'lose');
            return;
        }

        const betAmount = parseFloat(document.getElementById('baccarat-bet-amount').value);
        
        if (betAmount > this.gameState.balance) {
            this.showMessage('Insufficient funds!', 'lose');
            return;
        }

        if (!this.gameState.removeMoney(betAmount)) {
            this.showMessage('Insufficient funds!', 'lose');
            return;
        }

        this.currentBet = betAmount;
        this.gameInProgress = true;
        this.playerHand = [];
        this.bankerHand = [];

        // Deal initial cards
        this.playerHand.push(this.dealCard());
        this.bankerHand.push(this.dealCard());
        this.playerHand.push(this.dealCard());
        this.bankerHand.push(this.dealCard());

        this.updateDisplay();
        this.determineWinner();
    }

    determineWinner() {
        const playerValue = this.calculateHandValue(this.playerHand);
        const bankerValue = this.calculateHandValue(this.bankerHand);
        
        let winner = null;
        if (playerValue > bankerValue) {
            winner = 'player';
        } else if (bankerValue > playerValue) {
            winner = 'banker';
        } else {
            winner = 'tie';
        }

        this.endGame(winner);
    }

    endGame(winner) {
        this.gameInProgress = false;
        let won = false;
        let winnings = 0;

        if (this.selectedBet === winner) {
            won = true;
            if (winner === 'tie') {
                winnings = this.currentBet * 8; // 8:1 payout for tie
            } else {
                winnings = this.currentBet * 2; // 1:1 payout for player/banker
            }
            this.gameState.addMoney(winnings);
        }

        if (won) {
            this.showMessage(`You won $${winnings.toFixed(2)}!`, 'win');
        } else {
            this.showMessage(`You lost $${this.currentBet.toFixed(2)}!`, 'lose');
        }

        this.currentBet = 0;
        this.selectedBet = null;
        document.querySelectorAll('.baccarat-bet-btn').forEach(b => b.classList.remove('selected'));
    }

    updateDisplay() {
        // Update player cards
        const playerCardsContainer = document.getElementById('baccarat-player-cards');
        playerCardsContainer.innerHTML = '';
        this.playerHand.forEach(card => {
            const cardElement = this.createCardElement(card);
            playerCardsContainer.appendChild(cardElement);
        });

        // Update banker cards
        const bankerCardsContainer = document.getElementById('baccarat-banker-cards');
        bankerCardsContainer.innerHTML = '';
        this.bankerHand.forEach(card => {
            const cardElement = this.createCardElement(card);
            bankerCardsContainer.appendChild(cardElement);
        });

        // Update scores
        document.getElementById('baccarat-player-score').textContent = this.calculateHandValue(this.playerHand);
        document.getElementById('baccarat-banker-score').textContent = this.calculateHandValue(this.bankerHand);
    }

    createCardElement(card) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.textContent = `${card.value}${card.suit}`;
        
        if (['♥', '♦'].includes(card.suit)) {
            cardElement.classList.add('red');
        } else {
            cardElement.classList.add('black');
        }
        
        return cardElement;
    }

    showMessage(message, type) {
        const messageElement = document.getElementById('baccarat-message');
        messageElement.textContent = message;
        messageElement.className = `game-message ${type}`;
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.gameState = new GameState();
});

