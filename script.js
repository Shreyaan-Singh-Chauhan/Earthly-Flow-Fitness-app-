document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Navigation Logic ---
    const tabs = document.querySelectorAll('.nav-tab');
    const sections = document.querySelectorAll('.content-section');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active state from all tabs and add to the clicked one
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const targetId = tab.getAttribute('data-target');
            
            // Hide all sections, then show target
            sections.forEach(section => {
                section.classList.remove('active');
            });

            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });

    // --- 2. Journal Logic (Add, Edit, Delete & Auto-Counter) ---
    let currentlyEditingCard = null; 

    const addBtn = document.getElementById('add-journal-btn');
    const modal = document.getElementById('journal-modal');
    const modalTitle = document.getElementById('modal-title');
    const cancelBtn = document.getElementById('cancel-btn');
    const saveBtn = document.getElementById('save-btn');
    const journalGrid = document.getElementById('journal-grid');
    const journalText = document.getElementById('journal-text');

    if (addBtn && modal && cancelBtn && saveBtn && journalGrid && journalText) {
        
        // NEW FIX: This function recalculates the "Day X" for every card on the screen
        function updateDayCounters() {
            const cards = journalGrid.querySelectorAll('.journal-card');
            cards.forEach((card, index) => {
                const title = card.querySelector('.card-title');
                if (title) {
                    // index starts at 0, so we add 1 (e.g., Day 1, Day 2...)
                    title.innerText = `Day ${index + 1}`;
                }
            });
        }

        // Function to handle opening the modal
        function openModal(cardToEdit = null) {
            currentlyEditingCard = cardToEdit;
            
            if (cardToEdit) {
                modalTitle.innerText = "Edit Journal Entry";
                journalText.value = cardToEdit.querySelector('.card-body').innerText;
            } else {
                modalTitle.innerText = "New Journal Entry";
                journalText.value = '';
            }
            
            modal.classList.add('active');
            journalText.focus(); 
        }

        // Open Modal to Add
        addBtn.addEventListener('click', () => {
            openModal(null);
        });

        // Close Modal via Cancel
        cancelBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            currentlyEditingCard = null;
        });

        // Save Entry (Create New or Update Existing)
        saveBtn.addEventListener('click', () => {
            const text = journalText.value.trim();
            
            if (text !== '') {
                if (currentlyEditingCard) {
                    // Update existing card text
                    currentlyEditingCard.querySelector('.card-body').innerText = text;
                } else {
                    // Create new card
                    const newCard = document.createElement('div');
                    newCard.className = 'journal-card';
                    
                    newCard.innerHTML = `
                        <div class="card-header">
                            <div class="avatar">S</div>
                            <div class="user-info">
                                <span class="name">Sahil Mishra</span>
                                <span class="time">Just now</span>
                            </div>
                            <button class="edit-btn">Edit</button>
                            <button class="delete-btn">Delete</button>
                        </div>
                        <h3 class="card-title">Day X</h3> <p class="card-body">${text}</p>
                    `;
                    
                    journalGrid.appendChild(newCard);
                }
                
                // NEW FIX: Force all cards to recalculate their Day number after saving
                updateDayCounters();
                
                // Clean up modal
                modal.classList.remove('active');
                journalText.value = '';
                currentlyEditingCard = null;
            }
        });

        // Event listener for both Edit and Delete buttons on the grid
        journalGrid.addEventListener('click', (event) => {
            const card = event.target.closest('.journal-card');
            
            // Handle Edit
            if (event.target.classList.contains('edit-btn')) {
                openModal(card);
            } 
            // Handle Delete
            else if (event.target.classList.contains('delete-btn')) {
                const confirmDelete = confirm("Are you sure you want to delete this journal entry?");
                if (confirmDelete) {
                    card.remove(); // Removes the HTML
                    // NEW FIX: Force all cards to recalculate their Day number after deleting
                    updateDayCounters(); 
                }
            }
        });
    }
});