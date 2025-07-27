function showTab(tabName) {
  document.querySelectorAll('.auth-tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  document.getElementById(tabName).classList.add('active');
  document.querySelector(`[onclick="showTab('${tabName}')"]`)?.classList.add('active');
}

// Auth functions
async function handleAuth(type, formData) {
  try {
    const res = await fetch(`/api/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();

    if (data.success) {
      location.reload();
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    alert(error.message);
  }
}

function showAuthModal(type) {
  const modal = document.getElementById('authModal');
  modal.style.display = 'block';
  switchForm(type);
}

function closeAuthModal() {
  document.getElementById('authModal').style.display = 'none';
}

function switchForm(type) {
  const loginForm = document.getElementById('loginForm');
  loginForm.querySelector('h2').innerHTML = type === 'login' ? 
    '<i class="fas fa-lock"></i> Login' : 
    '<i class="fas fa-user-plus"></i> Register';
}

function socialAuth(provider) {
  window.location.href = `/auth/${provider}`;
}

function showForgotPassword() {
  const loginForm = document.getElementById('loginForm');
  loginForm.innerHTML = `
    <h2><i class="fas fa-key"></i> Reset Password</h2>
    <input type="email" placeholder="Enter your email" required>
    <button type="submit" class="submit-btn">Send Reset Link</button>
    <p class="auth-links">
      <a href="#" onclick="switchForm('login')">Back to Login</a>
    </p>
  `;
}

// Auth functions
async function login(username, password) {
  try {
    const deviceId = generateDeviceId();
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Device-ID': deviceId
      },
      body: JSON.stringify({ username, password, deviceId })
    });

    const data = await response.json();
    if (data.success) {
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('device_id', deviceId);
      window.location.href = '/dashboard';
    } else {
      throw new Error(data.error || 'Login failed');
    }
  } catch (error) {
    showError(error.message);
  }
}

// Auto login check
function checkStoredAuth() {
  const token = localStorage.getItem('auth_token');
  const deviceId = localStorage.getItem('device_id');
  if (token && deviceId && window.location.pathname === '/login') {
    window.location.href = '/dashboard';
  }
}

// Run auth check on page load
document.addEventListener('DOMContentLoaded', checkStoredAuth);

async function updateProfile(formData) {
  try {
    const response = await fetch('/api/profile/update', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    if (data.success) {
      showSuccess('Profile updated successfully!');
      localStorage.setItem('user', JSON.stringify(data.user));
      loadProfile();
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    showError(error.message);
  }
}

function toggleEditProfile() {
  const profileInfo = document.querySelector('.profile-info');
  const editForm = document.querySelector('.edit-profile-form');

  if (editForm.style.display === 'none') {
    profileInfo.style.display = 'none';
    editForm.style.display = 'block';
  } else {
    profileInfo.style.display = 'block';
    editForm.style.display = 'none';
  }
}

async function register(formData) {
  const response = await fetch('/api/register', {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  if (data.success) {
    showSuccess('Registration successful!');
    showAuthModal('login');
  } else {
    showError(data.error);
  }
}

async function forgotPassword(username, newPassword) {
  const response = await fetch('/api/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, newPassword })
  });

  const data = await response.json();
  if (data.success) {
    showSuccess('Password updated successfully!');
    showAuthModal('login');
  } else {
    showError(data.error);
  }
}

function logout() {
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}

async function loadProfile() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    window.location.href = '/login.html';
    return;
  }

  // Update profile info
  document.getElementById('userName').textContent = user.name || 'Anonymous';
  document.getElementById('userUsername').textContent = `@${user.username}`;
  document.getElementById('userAvatar').src = user.profilePicture ? 
    `/uploads/${user.profilePicture}` : 
    'https://cdn-icons-png.flaticon.com/512/149/149071.png';

  // Set edit form values
  document.getElementById('editName').value = user.name || '';

  try {
    const response = await fetch(`/api/profile/${user.username}`);
    const data = await response.json();

    document.getElementById('postCount').textContent = data.posts;
    document.getElementById('likesCount').textContent = data.likes;
    document.getElementById('commentsCount').textContent = data.comments;

    const activityHtml = data.activity.map(item => `
      <div class="activity-item">
        <i class="fas fa-${item.type === 'post' ? 'paste' : 'comment'}"></i>
        <div class="activity-content">
          <p>${item.content}</p>
          <small>${new Date(item.date).toLocaleDateString()}</small>
        </div>
      </div>
    `).join('');

    document.getElementById('userActivity').innerHTML = activityHtml;
  } catch (error) {
    console.error('Error loading profile:', error);
  }
}

// Load profile data if on profile page
if (window.location.pathname === '/profile.html') {
  loadProfile();
}

// Check if already logged in
function checkAuth() {
  const user = localStorage.getItem('user');
  if (user && window.location.pathname === '/login.html') {
    window.location.href = '/';
  }
}

// Form submission handlers
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const forgotForm = document.getElementById('forgotForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('loginUsername').value;
      const password = document.getElementById('loginPassword').value;
      try {
        await login(username, password);
      } catch (error) {
        showError(error.message);
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append('username', document.getElementById('registerUsername').value);
      formData.append('password', document.getElementById('registerPassword').value);
      formData.append('name', document.getElementById('registerName').value);

      const profilePic = document.getElementById('profilePicture').files[0];
      if (profilePic) {
        formData.append('profilePicture', profilePic);
      }

      try {
        await register(formData);
      } catch (error) {
        showError(error.message);
      }
    });
  }

  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('forgotUsername').value;
      const newPassword = document.getElementById('newPassword').value;
      try {
        await forgotPassword(username, newPassword);
      } catch (error) {
        showError(error.message);
      }
    });
  }

  // Dark mode toggle
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) document.body.classList.add('dark-mode');

    darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });
  }

  // Add animations to cards
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  });

  document.querySelectorAll('.paste-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    observer.observe(card);
  });

  const uploadForm = document.getElementById('uploadForm');

  if (uploadForm) {
    const previewCommand = () => {
      const name = document.getElementById('itemName').value.trim();
      const desc = document.getElementById('description').value.trim();
      const type = document.getElementById('type').value;
      const preview = document.getElementById('commandPreview');

      if (preview) {
        preview.innerHTML = `
          <div class="preview-card">
            <h3>${name || 'Command Name'}</h3>
            <div class="preview-type">${type || 'Select Type'}</div>
            <p>${desc || 'Command description will appear here'}</p>
          </div>
        `;
      }
    };

    ['itemName', 'description', 'type'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', previewCommand);
    });

    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = {
        itemName: document.getElementById('itemName').value.trim(),
        description: document.getElementById('description').value.trim(),
        type: document.getElementById('type').value,
        pastebinLink: document.getElementById('commandLink').value.trim(),
        authorName: document.getElementById('authorName').value.trim()
      };

      try {
        const res = await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (res.ok) {
          alert('Command shared successfully!');
          window.location.href = '/';
        } else {
          throw new Error('Failed to share command');
        }
      } catch (error) {
        alert('Error sharing command: ' + error.message);
      }
    });
  }

  const itemList = document.getElementById('itemList');
  if (itemList) {
    loadItems();
  }
});

async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    const stats = await res.json();
    document.getElementById('statsCounter').innerHTML = `
      <div class="stats">
        <div><i class="fas fa-users"></i> ${stats.totalVisitors} Visitors</div>
        <div><i class="fas fa-chart-line"></i> ${stats.dailyApiCalls} API Calls Today</div>
        <div><i class="fas fa-paste"></i> ${stats.totalPastes || 0} Pastes</div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

function generateDeviceId() {
  const id = localStorage.getItem('device_id') || 
    Math.random().toString(36).substring(2) + Date.now().toString(36);
  localStorage.setItem('device_id', id);
  return id;
}

async function vote(itemId, type) {
  try {
    const deviceId = generateDeviceId();
    const response = await fetch(`/api/items/${itemId}/vote`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Device-ID': deviceId
      },
      body: JSON.stringify({ type })
    });

    const data = await response.json();
    if (!response.ok) {
      showError(data.error);
      return;
    }

    showSuccess(`${type === 'like' ? 'Liked' : 'Disliked'} successfully!`);
    loadItems();
  } catch (error) {
    showError('Error voting: ' + error.message);
  }
}

async function addComment(itemId) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    showError('Please login to comment');
    return;
  }

  const commentModal = document.createElement('div');
  commentModal.className = 'comment-modal animated fadeIn';
  commentModal.innerHTML = `
    <div class="comment-form">
      <div class="comment-header">
        <h3><i class="fas fa-comment"></i> Add Comment</h3>
        <button class="close-btn" onclick="closeCommentModal(this)"><i class="fas fa-times"></i></button>
      </div>
      <div class="comment-user-info">
        <img src="${user.profilePicture ? '/uploads/' + user.profilePicture : 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}" alt="Profile" class="comment-avatar">
        <div class="user-details">
          <span class="user-name">${user.name}</span>
          <span class="user-handle">@${user.username}</span>
        </div>
      </div>
      <textarea id="commentText" placeholder="Write your thoughts..." required></textarea>
      <div class="button-group">
        <button class="submit-btn"><i class="fas fa-paper-plane"></i> Post Comment</button>
      </div>
    </div>
  `;
  document.body.appendChild(commentModal);

  const submitComment = async () => {
    const text = document.getElementById('commentText').value.trim();

    if (!text) {
      showError('Please enter a comment');
      return;
    }

    try {
      const response = await fetch(`/api/items/${itemId}/comment`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content
        },
        credentials: 'include',
        body: JSON.stringify({ text })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add comment');
      }

      document.body.removeChild(commentModal);
      await loadItems();
      showSuccess('Comment added successfully!');
    } catch (error) {
      showError('Error adding comment: ' + error.message);
    }
  };

  commentModal.querySelector('.submit-btn').addEventListener('click', submitComment);
  commentModal.querySelector('.close-btn').addEventListener('click', () => {
    closeCommentModal(commentModal);
  });
}

function closeCommentModal(element) {
  const modal = element.closest('.comment-modal');
  modal.classList.add('fadeOut');
  setTimeout(() => {
    modal.remove();
  }, 300);
}

async function deleteComment(itemId, commentId) {
  try {
    const response = await fetch(`/api/items/${itemId}/comments/${commentId}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      showSuccess('Comment deleted successfully');
      loadItems();
    } else {
      throw new Error('Failed to delete comment');
    }
  } catch (error) {
    showError('Error deleting comment: ' + error.message);
  }
}

function filterItems() {
  loadItems();
}

// Show error toast
async function shareItem(itemId) {
  try {
    const response = await fetch(`/api/share/${itemId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    const shareUrl = `${window.location.origin}/view/${itemId}`;
    const shareTitle = `${data.item.name} - ${data.item.type} Command`;
    const shareDescription = `${data.item.description.substring(0, 100)}${data.item.description.length > 100 ? '...' : ''}`;

    const shareData = {
      title: shareTitle,
      text: `Check out this ${data.item.type} command: ${shareDescription}`,
      url: shareUrl
    };

    if (navigator.share && /mobile|android|ios/i.test(navigator.userAgent)) {
      await navigator.share(shareData);
      showSuccess('Shared successfully!');
    } else {
      await navigator.clipboard.writeText(shareUrl);

      const toast = document.createElement('div');
      toast.className = 'share-toast';
      toast.innerHTML = `
        <div>Link copied to clipboard!</div>
        <div class="share-buttons">
          <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.title)}&url=${encodeURIComponent(shareUrl)}" target="_blank" class="share-btn twitter">
            <i class="fab fa-twitter"></i>
          </a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}" target="_blank" class="share-btn facebook">
            <i class="fab fa-facebook"></i>
          </a>
          <button onclick="copyLink('${shareUrl}')" class="share-btn copy">
            <i class="fas fa-copy"></i>
          </button>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 5000);
    }
  } catch (err) {
    showError('Error sharing item');
    console.error('Share error:', err);
  }
}

function copyLink(url) {
  navigator.clipboard.writeText(url);
  showSuccess('Link copied!');
}

function showSuccess(message) {
  const toast = document.createElement('div');
  toast.className = 'success-toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function showError(message) {
  const toast = document.createElement('div');
  toast.className = 'error-toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function showLoadingSpinner() {
  const container = document.getElementById('itemList');
  if (container) {
    container.innerHTML = `
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading commands...</p>
      </div>
    `;
  }
}

async function loadTrendingItems() {
  try {
    const res = await fetch('/api/items?sort=popular&limit=5');
    const trending = await res.json();
    const container = document.getElementById('trendingList');
    if (container) {
      container.innerHTML = trending.map(item => `
        <div class="trending-card">
          <span class="trending-badge">🔥 Trending</span>
          <h4>${item.itemName}</h4>
          <div class="trending-meta">
            <span>${item.views} views</span>
            <span>${item.downloads} downloads</span>
          </div>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading trending items:', error);
  }
}

async function loadItems() {
  try {
    const typeFilter = document.getElementById('typeFilter')?.value || '';
    const difficultyFilter = document.getElementById('difficultyFilter')?.value || '';
    const sortBy = document.getElementById('sortBy')?.value || 'newest';
    const searchQuery = document.getElementById('searchInput')?.value || '';

    await loadTrendingItems();

    showLoadingSpinner();

    const res = await fetch(`/api/items?type=${typeFilter}&sort=${sortBy}&search=${searchQuery}`);
    const items = await res.json();
    const container = document.getElementById('itemList');
    const user = JSON.parse(localStorage.getItem('user'));

    container.innerHTML = items.map(item => `
      <div class="paste-card ${item.featured ? 'featured' : ''} ${item.premium ? 'premium' : ''}">
        <div class="paste-meta">
          ${item.verified ? '<span class="verified-badge">✓ Verified</span>' : ''}
          ${item.featured ? '<span class="featured-badge">⭐ Featured</span>' : ''}
          ${item.premium ? '<span class="premium-badge">💎 Premium</span>' : ''}
          <h3><i class="fas fa-code"></i> ${item.itemName}</h3>
          <div class="meta-details">
            <span><i class="fas fa-user"></i> ${item.authorName}</span>
            <span><i class="fas fa-tag"></i> ${item.type}</span>
            <span><i class="fas fa-eye"></i> ${item.views}</span>
            <span><i class="fas fa-star"></i> ${((item.likes - item.dislikes) / (item.likes + item.dislikes) * 5 || 0).toFixed(1)}</span>
            <span><i class="fas fa-clock"></i> ${new Date(item.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <p class="paste-description">${item.description}</p>
        <div class="social-actions">
          <button onclick="vote(${item.itemID}, 'like')" class="action-btn like-btn ${item.userLiked ? 'active' : ''}">
            <i class="fas fa-heart"></i> ${item.likes}
          </button>
          <button onclick="vote(${item.itemID}, 'dislike')" class="action-btn dislike-btn ${item.userDisliked ? 'active' : ''}">
            <i class="fas fa-heart-broken"></i> ${item.dislikes}
          </button>
          <button onclick="addComment(${item.itemID})" class="action-btn">
            <i class="fas fa-comment"></i> ${item.comments.length}
          </button>
          <button onclick="shareItem(${item.itemID})" class="action-btn">
            <i class="fas fa-share-alt"></i> Share
          </button>
        </div>
        <div class="comments">
          ${item.comments.length > 0 ? 
            item.comments.map(comment => `
              <div class="comment animated fadeIn">
                <div class="comment-header">
                  <div class="comment-author">
                    <img src="${comment.authorAvatar ? '/uploads/' + comment.authorAvatar : 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}" 
                         alt="Avatar" class="comment-avatar">
                    <div class="author-info">
                      <span class="author-name">${comment.author}</span>
                      <span class="author-username">@${comment.authorUsername}</span>
                      <span class="comment-time">${new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  ${user && (user.username === comment.authorUsername) ? 
                    `<button onclick="deleteComment(${item.itemID}, '${comment._id}')" class="delete-comment-btn">
                       <i class="fas fa-trash"></i>
                     </button>` : ''
                  }
                </div>
                <div class="comment-text">${comment.text}</div>
              </div>
            `).join('') : 
            '<div class="no-comments">Be the first to comment!</div>'
          }
        </div>
        <a href="${item.pastebinLink}" target="_blank" class="view-btn">
          <i class="fas fa-external-link-alt"></i> View Code
        </a>
      </div>
    `).join('');

    loadStats();
  // Add pagination controls
    const totalPages = Math.ceil(items.total / items.limit);
    container.innerHTML += `
      <div class="pagination">
        ${Array.from({length: totalPages}, (_, i) => `
          <button onclick="loadPage(${i + 1})" class="${items.page === i + 1 ? 'active' : ''}">${i + 1}</button>
        `).join('')}
      </div>
    `;
  } catch (error) {
    console.error('Error loading items:', error);
  }
}

async function loadPage(page) {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set('page', page);
  window.history.pushState({}, '', `?${urlParams.toString()}`);
  await loadItems();
}
