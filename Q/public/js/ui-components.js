
// UI Components
class UIComponents {
  static createCard(title, content, options = {}) {
    const card = document.createElement('div');
    card.className = `card ${options.className || ''}`;
    
    card.innerHTML = `
      <h3 class="card-title">${title}</h3>
      <div class="card-content">${content}</div>
      ${options.footer ? `<div class="card-footer">${options.footer}</div>` : ''}
    `;
    
    return card;
  }

  static createBadge(text, type = 'primary') {
    const badge = document.createElement('span');
    badge.className = `badge badge-${type}`;
    badge.textContent = text;
    return badge;
  }

  static createStatCard(icon, value, label) {
    return `
      <div class="stat-item">
        <i class="${icon} stat-icon"></i>
        <div class="stat-value">${value}</div>
        <div class="stat-label">${label}</div>
      </div>
    `;
  }

  static createAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
      <i class="fas fa-info-circle"></i>
      <span>${message}</span>
    `;
    return alert;
  }
}

// Export components
window.UIComponents = UIComponents;
