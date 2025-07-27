
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        itemName: formData.get('itemName'),
        description: formData.get('description'),
        type: formData.get('type'),
        code: formData.get('code'),
        tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        difficulty: formData.get('difficulty') || 'Intermediate',
        authorName: formData.get('authorName') || 'Anonymous'
    };
    
    // Validate required fields
    if (!data.itemName || !data.itemName.trim()) {
        alert('Please enter a command name');
        return;
    }
    if (!data.description || !data.description.trim()) {
        alert('Please enter a description for your command');
        return;
    }
    if (!data.code || !data.code.trim()) {
        alert('Please enter the command code');
        return;
    }
    
    try {
        const response = await fetch('/api/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Command uploaded successfully with your custom description!');
            window.location.href = result.viewLink || '/';
        } else {
            alert('Error uploading command: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error uploading command: ' + error.message);
    }
});
