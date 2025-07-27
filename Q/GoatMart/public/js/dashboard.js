
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch stats
        const statsResponse = await fetch('/api/stats');
        const statsData = await statsResponse.json();
        
        // Update stats
        document.getElementById('totalCommands').textContent = statsData.totalCommands;
        document.getElementById('totalLikes').textContent = statsData.totalLikes;
        document.getElementById('dailyUsers').textContent = statsData.dailyActiveUsers;

        // Fetch and display commands
        const itemsResponse = await fetch('/api/items');
        const itemsData = await itemsResponse.json();
        
        const commandsGrid = document.getElementById('commandsGrid');
        const featuredCommands = document.getElementById('featuredCommands');
        
        // Clear existing content
        commandsGrid.innerHTML = '';
        if (featuredCommands) {
            featuredCommands.innerHTML = '';
        }

        itemsData.items.forEach(command => {
            const commandCard = document.createElement('div');
            commandCard.className = 'command-card animate-fade-in';
            commandCard.innerHTML = `
                <h3>
                    <i class="fas fa-code"></i>
                    <a href="/view.html?id=${command.itemID}" class="command-link">${command.itemName}</a>
                </h3>
                <p class="command-description">${command.description || 'No description available'}</p>
                <div class="tags">
                    ${command.tags ? command.tags.map(tag => `<span class="badge">${tag}</span>`).join('') : ''}
                </div>
                <div class="command-actions">
                    <div class="stats">
                        <span><i class="fas fa-heart"></i> ${command.likes || 0}</span>
                        <span><i class="fas fa-eye"></i> ${command.views || 0}</span>
                        <span><i class="fas fa-user"></i> ${command.authorName}</span>
                    </div>
                </div>
            `;

            // Add click event to the entire card
            commandCard.addEventListener('click', (e) => {
                // If clicking on the link, let the default behavior happen
                if (!e.target.closest('.command-link')) {
                    window.location.href = `/view.html?id=${command.itemID}`;
                }
            });

            if (command.featured && featuredCommands) {
                featuredCommands.appendChild(commandCard.cloneNode(true));
            } else {
                commandsGrid.appendChild(commandCard);
            }
        });

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', async (e) => {
                const searchTerm = e.target.value.trim();
                const searchResponse = await fetch(`/api/items?search=${encodeURIComponent(searchTerm)}`);
                const searchData = await searchResponse.json();
                
                commandsGrid.innerHTML = '';
                searchData.items.forEach(command => {
                    const commandCard = document.createElement('div');
                    commandCard.className = 'command-card animate-fade-in';
                    commandCard.innerHTML = `
                        <h3>
                            <i class="fas fa-code"></i>
                            <a href="/view.html?id=${command.itemID}" class="command-link">${command.itemName}</a>
                        </h3>
                        <p class="command-description">${command.description || 'No description available'}</p>
                        <div class="tags">
                            ${command.tags ? command.tags.map(tag => `<span class="badge">${tag}</span>`).join('') : ''}
                        </div>
                        <div class="command-actions">
                            <div class="stats">
                                <span><i class="fas fa-heart"></i> ${command.likes || 0}</span>
                                <span><i class="fas fa-eye"></i> ${command.views || 0}</span>
                                <span><i class="fas fa-user"></i> ${command.authorName}</span>
                            </div>
                        </div>
                    `;
                    commandsGrid.appendChild(commandCard);
                });
            });
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        const errorAlert = UIComponents.createAlert('Failed to load commands. Please try again later.', 'error');
        document.querySelector('.main-section').prepend(errorAlert);
    }
});
