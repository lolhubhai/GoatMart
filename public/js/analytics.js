
class AnalyticsDashboard {
    constructor() {
        this.charts = {};
        this.realtimeData = [];
        this.init();
    }

    async init() {
        await this.loadInitialData();
        this.setupCharts();
        this.startRealtimeUpdates();
        this.setupActivityFeed();
    }

    async loadInitialData() {
        try {
            const response = await fetch('/api/analytics');
            const data = await response.json();
            
            document.getElementById('todayViews').textContent = data.todayViews || 0;
            document.getElementById('todayLikes').textContent = data.todayLikes || 0;
            document.getElementById('todayUploads').textContent = data.todayUploads || 0;
            document.getElementById('activeUsers').textContent = data.activeUsers || 0;
            
            this.analyticsData = data;
        } catch (error) {
            console.error('Error loading analytics:', error);
        }
    }

    setupCharts() {
        // Views over time chart
        const viewsCtx = document.getElementById('viewsChart').getContext('2d');
        this.charts.views = new Chart(viewsCtx, {
            type: 'line',
            data: {
                labels: this.generateTimeLabels(),
                datasets: [{
                    label: 'Views',
                    data: this.generateRandomData(24),
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        // Top commands chart
        const topCtx = document.getElementById('topCommandsChart').getContext('2d');
        this.charts.topCommands = new Chart(topCtx, {
            type: 'bar',
            data: {
                labels: ['Music Bot', 'Auto Reply', 'Welcome Msg', 'Moderation', 'Fun Commands'],
                datasets: [{
                    data: [120, 95, 87, 72, 65],
                    backgroundColor: [
                        '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                }
            }
        });

        // Command types pie chart
        const typesCtx = document.getElementById('typesChart').getContext('2d');
        this.charts.types = new Chart(typesCtx, {
            type: 'doughnut',
            data: {
                labels: ['GoatBot', 'MiraiBot', 'AutoBot'],
                datasets: [{
                    data: [60, 30, 10],
                    backgroundColor: ['#6366f1', '#10b981', '#f59e0b']
                }]
            },
            options: {
                responsive: true
            }
        });
    }

    generateTimeLabels() {
        const labels = [];
        for (let i = 23; i >= 0; i--) {
            const hour = new Date();
            hour.setHours(hour.getHours() - i);
            labels.push(hour.getHours() + ':00');
        }
        return labels;
    }

    generateRandomData(count) {
        return Array.from({ length: count }, () => Math.floor(Math.random() * 100));
    }

    startRealtimeUpdates() {
        setInterval(() => {
            this.updateCharts();
            this.updateStats();
        }, 30000); // Update every 30 seconds
    }

    setupActivityFeed() {
        const activities = [
            '🆕 New command uploaded: "Auto Welcome Message"',
            '❤️ Command "Music Player Bot" received 5 new likes',
            '👀 Command "Moderation System" viewed 12 times',
            '🚀 Command "Fun Facts Bot" trending now',
            '📈 Daily uploads increased by 15%'
        ];

        const feed = document.getElementById('realtimeActivity');
        activities.forEach((activity, index) => {
            setTimeout(() => {
                const item = document.createElement('div');
                item.className = 'activity-item animate-slide-in';
                item.innerHTML = `
                    <div class="activity-text">${activity}</div>
                    <div class="activity-time">${this.getTimeAgo(index * 5)} ago</div>
                `;
                feed.insertBefore(item, feed.firstChild);
                
                // Keep only last 10 items
                if (feed.children.length > 10) {
                    feed.removeChild(feed.lastChild);
                }
            }, index * 1000);
        });
    }

    updateCharts() {
        // Add new data point to views chart
        const newViews = Math.floor(Math.random() * 50);
        this.charts.views.data.datasets[0].data.shift();
        this.charts.views.data.datasets[0].data.push(newViews);
        this.charts.views.update();
    }

    updateStats() {
        // Simulate real-time stat updates
        const currentViews = parseInt(document.getElementById('todayViews').textContent);
        document.getElementById('todayViews').textContent = currentViews + Math.floor(Math.random() * 5);
    }

    getTimeAgo(minutes) {
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m`;
        return `${Math.floor(minutes / 60)}h`;
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    new AnalyticsDashboard();
});
