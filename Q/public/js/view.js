
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('id');

    if (!itemId) {
        window.location.href = '/';
        return;
    }

    try {
        const response = await fetch(`/api/item/${itemId}`);
        const data = await response.json();

        document.getElementById('commandName').textContent = data.itemName;
        document.getElementById('authorName').textContent = data.authorName;
        document.getElementById('createdAt').textContent = new Date(data.createdAt).toLocaleDateString();
        document.getElementById('likesCount').textContent = data.likes;
        document.getElementById('viewsCount').textContent = data.views;
        document.getElementById('commandType').textContent = data.type;
        document.getElementById('description').textContent = data.description;
        
        const codeBlock = document.getElementById('codeBlock');
        codeBlock.textContent = data.code;
        Prism.highlightElement(codeBlock);

        // Copy functionality
        document.getElementById('copyBtn').addEventListener('click', () => {
            navigator.clipboard.writeText(data.code);
            const btn = document.getElementById('copyBtn');
            btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-copy"></i> Copy Code';
            }, 2000);
        });

    } catch (error) {
        console.error('Error fetching command:', error);
    }
});
