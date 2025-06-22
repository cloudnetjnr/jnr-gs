// Global donation ticker functionality
let recentDonations = [];

// Fetch donations from JSON
async function fetchDonations() {
    try {
        const response = await fetch('/Games/data/donations.json');
        if (!response.ok) throw new Error('Failed to fetch donations');
        return await response.json();
    } catch (error) {
        console.error('Error loading donations:', error);
        return [];
    }
}

// Display donations in all tickers on the page
function displayDonations() {
    const tickers = document.querySelectorAll('.ticker-content');
    if (!tickers.length) return;

    tickers.forEach(ticker => {
        ticker.innerHTML = '';
        
        recentDonations.forEach(donation => {
            const donationItem = document.createElement('span');
            donationItem.className = 'donation-item';
            donationItem.innerHTML = `
                <span class="donor-name">${donation.name}</span> 
                <span class="donation-amount">${donation.amount}</span>
                ${donation.message ? `<span class="donation-message">- "${donation.message}"</span>` : ''}
            `;
            ticker.appendChild(donationItem);
        });

        // Restart animation
        ticker.style.animation = 'none';
        void ticker.offsetWidth; // Trigger reflow
        ticker.style.animation = 'ticker 20s linear infinite';
    });
}

// Initialize donation ticker on page load
async function initDonationTicker() {
    recentDonations = await fetchDonations();
    if (recentDonations.length) {
        displayDonations();
        
        // Refresh donations every 5 minutes
        setInterval(async () => {
            recentDonations = await fetchDonations();
            displayDonations();
        }, 300000);
    } else {
        // Fallback if no donations are loaded
        document.querySelectorAll('.donation-ticker').forEach(ticker => {
            ticker.innerHTML = '<div class="ticker-content">Thank you to all our supporters!</div>';
        });
    }
}

// Call the initialization when the DOM is loaded
document.addEventListener('DOMContentLoaded', initDonationTicker);

// Export for potential module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fetchDonations,
        displayDonations,
        initDonationTicker
    };
}