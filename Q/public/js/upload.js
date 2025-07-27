
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        itemName: formData.get('itemName'),
        description: formData.get('description'),
        type: formData.get('type'),
        code: formData.get('code'),
        tags: formData.get('tags').split(',').map(tag => tag.trim()),
        difficulty: formData.get('difficulty'),
        authorName: 'Anonymous' // You might want to add user authentication later
    };
    
    try {
        const response = await fetch('/v1/paste', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Command uploaded successfully!');
            window.location.href = '/';
        } else {
            alert('Error uploading command: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error uploading command');
    }
});
