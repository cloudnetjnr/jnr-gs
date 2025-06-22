// Modal functionality
const partsBtn = document.getElementById('partsBtn');
const modal = document.getElementById('partsModal');
const closeBtn = document.querySelector('.close-btn');

partsBtn.addEventListener('click', () => {
    modal.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target == modal) {
        modal.style.display = 'none';
    }
});