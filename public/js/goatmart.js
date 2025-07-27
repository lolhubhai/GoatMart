
#!/usr/bin/env node

const https = require('https');
const http = require('http');

class GoatMart {
    constructor() {
        this.baseUrl = 'https://goatmart-production.up.railway.app';
        this.version = '2.0.0';
        this.author = 'GoatMart Team';
    }

    // Display help information
    help() {
        console.log(`
╔══════════════════════════════════════════════════════════════╗
║                        🐐 GoatMart CLI                        ║
║                      Bot Command Hub                         ║
╠══════════════════════════════════════════════════════════════╣
║ Version: ${this.version}                                     ║
║ Author: ${this.author}                               ║
╚══════════════════════════════════════════════════════════════╝

📋 Available Commands:
┌─────────────────────────────────────────────────────────────┐
│ CONTENT MANAGEMENT                                          │
├─────────────────────────────────────────────────────────────┤
│ upload <file>           Upload bot command from file       │
│ paste <text>            Upload command from text           │
│ get <id>                Download command by ID             │
│ list [category]         List available commands            │
│ search <query>          Search commands                    │
│ trending                Show trending commands             │
│ stats                   Display platform statistics        │
├─────────────────────────────────────────────────────────────┤
│ SYSTEM INFORMATION                                          │
├─────────────────────────────────────────────────────────────┤
│ status                  Check website status               │
│ maintenance             Check maintenance status           │
│ endpoints               List all API endpoints             │
│ help                    Show this help message             │
│ version                 Show version information           │
└─────────────────────────────────────────────────────────────┘

🌐 Web Interface: ${this.baseUrl}
📧 Support: support@goatmart.com
📖 Documentation: ${this.baseUrl}/docs

💡 Examples:
   goatmart upload mybot.js
   goatmart search "music bot"
   goatmart get abc123
   goatmart trending
        `);
    }

    // Check website and maintenance status
    async status() {
        try {
            console.log('🔍 Checking GoatMart status...\n');
            
            const maintenanceStatus = await this.makeRequest('/api/maintenance');
            const stats = await this.makeRequest('/api/stats');
            
            console.log('╔══════════════════════════════════════════════════════════════╗');
            console.log('║                      🐐 GoatMart Status                       ║');
            console.log('╚══════════════════════════════════════════════════════════════╝');
            
            if (maintenanceStatus.enabled) {
                console.log('🚧 Status: MAINTENANCE MODE');
                console.log(`📝 Title: ${maintenanceStatus.title}`);
                console.log(`💬 Message: ${maintenanceStatus.message}`);
                if (maintenanceStatus.estimatedTime) {
                    console.log(`⏰ Estimated Time: ${maintenanceStatus.estimatedTime}`);
                }
            } else {
                console.log('✅ Status: ONLINE');
                console.log(`📊 Total Commands: ${stats.totalCommands || 0}`);
                console.log(`👤 Daily Active Users: ${stats.dailyActiveUsers || 0}`);
                console.log(`❤️  Total Likes: ${stats.totalLikes || 0}`);
                
                if (stats.hosting) {
                    const uptime = stats.hosting.uptime;
                    console.log(`⏱️  Uptime: ${uptime.days}d ${uptime.hours}h ${uptime.minutes}m`);
                    console.log(`💾 Memory Usage: ${stats.hosting.memory.heapUsed}MB / ${stats.hosting.memory.heapTotal}MB`);
                    console.log(`🏃 Response Time: ${stats.hosting.performance.averageResponseTime || 0}ms`);
                }
            }
            
            console.log(`\n🌐 Website: ${this.baseUrl}`);
            console.log(`📅 Last Checked: ${new Date().toLocaleString()}`);
            
        } catch (error) {
            console.log('❌ Status: OFFLINE or ERROR');
            console.log(`🔗 Website: ${this.baseUrl}`);
            console.log(`⚠️  Error: ${error.message}`);
        }
    }

    // Check maintenance status specifically
    async maintenance() {
        try {
            console.log('🔧 Checking maintenance status...\n');
            
            const status = await this.makeRequest('/api/maintenance');
            
            console.log('╔══════════════════════════════════════════════════════════════╗');
            console.log('║                   🔧 Maintenance Status                       ║');
            console.log('╚══════════════════════════════════════════════════════════════╝');
            
            if (status.enabled) {
                console.log('🚧 Maintenance Mode: ENABLED');
                console.log(`📝 Title: ${status.title}`);
                console.log(`💬 Message: ${status.message}`);
                if (status.estimatedTime) {
                    console.log(`⏰ Estimated Time: ${status.estimatedTime}`);
                }
                console.log('\n⚠️  All endpoints are currently unavailable');
                console.log('🔄 Use "goatmart status" to check again later');
            } else {
                console.log('✅ Maintenance Mode: DISABLED');
                console.log('🎉 All services are operational');
                console.log('🚀 All endpoints are available');
            }
            
        } catch (error) {
            console.log('❌ Unable to check maintenance status');
            console.log(`⚠️  Error: ${error.message}`);
        }
    }

    // List all API endpoints
    endpoints() {
        console.log(`
╔══════════════════════════════════════════════════════════════╗
║                     🔗 GoatMart API Endpoints                 ║
╚══════════════════════════════════════════════════════════════╝

📋 CONTENT ENDPOINTS:
┌─────────────────────────────────────────────────────────────┐
│ GET    /api/items              Get all commands             │
│ POST   /api/items              Upload new command           │
│ GET    /api/item/:id           Get command by ID            │
│ POST   /api/items/:id/like     Like a command               │
│ DELETE /api/items/:id          Delete command               │
│ GET    /api/command/:shortId   Get command by short ID      │
│ GET    /raw/:shortId           Get raw command code         │
└─────────────────────────────────────────────────────────────┘

📊 ANALYTICS ENDPOINTS:
┌─────────────────────────────────────────────────────────────┐
│ GET    /api/stats              Platform statistics          │
│ GET    /api/trending           Trending commands            │
└─────────────────────────────────────────────────────────────┘

🔧 SYSTEM ENDPOINTS:
┌─────────────────────────────────────────────────────────────┐
│ GET    /api/maintenance        Maintenance status           │
│ POST   /api/maintenance        Update maintenance (Admin)   │
│ POST   /api/admin/login        Admin authentication         │
│ POST   /api/admin/logout       Admin logout                 │
└─────────────────────────────────────────────────────────────┘

📝 LEGACY ENDPOINTS:
┌─────────────────────────────────────────────────────────────┐
│ POST   /v1/paste               Upload command (legacy)      │
│ GET    /v1/paste/:shortId      Get command (legacy)         │
└─────────────────────────────────────────────────────────────┘

⚠️  Note: During maintenance mode, all endpoints except system 
    endpoints will return 503 status with maintenance message.

🌐 Base URL: ${this.baseUrl}
📖 Documentation: ${this.baseUrl}/docs
        `);
    }

    // Get trending commands
    async trending() {
        try {
            console.log('📈 Fetching trending commands...\n');
            
            const trending = await this.makeRequest('/api/trending');
            
            console.log('╔══════════════════════════════════════════════════════════════╗');
            console.log('║                    📈 Trending Commands                       ║');
            console.log('╚══════════════════════════════════════════════════════════════╝');
            
            if (trending.length === 0) {
                console.log('📭 No trending commands found');
                return;
            }
            
            trending.forEach((item, index) => {
                console.log(`\n${index + 1}. 📝 ${item.itemName}`);
                console.log(`   👤 Author: ${item.authorName}`);
                console.log(`   👀 Views: ${item.views} | ❤️  Likes: ${item.likes}`);
            });
            
        } catch (error) {
            if (error.message.includes('maintenance')) {
                console.log('🚧 Service is currently under maintenance');
                console.log('🔄 Please try again later');
            } else {
                console.log(`❌ Error fetching trending: ${error.message}`);
            }
        }
    }

    // Search commands
    async search(query) {
        if (!query) {
            console.log('❌ Please provide a search query');
            console.log('💡 Example: goatmart search "music bot"');
            return;
        }

        try {
            console.log(`🔍 Searching for: "${query}"\n`);
            
            const results = await this.makeRequest(`/api/items?search=${encodeURIComponent(query)}&limit=10`);
            
            console.log('╔══════════════════════════════════════════════════════════════╗');
            console.log('║                      🔍 Search Results                        ║');
            console.log('╚══════════════════════════════════════════════════════════════╝');
            
            if (results.items.length === 0) {
                console.log('📭 No commands found matching your search');
                console.log('💡 Try different keywords or browse all commands');
                return;
            }
            
            results.items.forEach((item, index) => {
                console.log(`\n${index + 1}. 📝 ${item.itemName}`);
                console.log(`   📄 ${item.description.substring(0, 80)}${item.description.length > 80 ? '...' : ''}`);
                console.log(`   👤 Author: ${item.authorName} | 🏷️  Type: ${item.type}`);
                console.log(`   👀 Views: ${item.views} | ❤️  Likes: ${item.likes}`);
                console.log(`   🔗 Raw: ${item.rawLink}`);
            });
            
            console.log(`\n📊 Found ${results.total} total results`);
            
        } catch (error) {
            if (error.message.includes('maintenance')) {
                console.log('🚧 Service is currently under maintenance');
                console.log('🔄 Please try again later');
            } else {
                console.log(`❌ Error searching: ${error.message}`);
            }
        }
    }

    // Show version information
    version() {
        console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    🐐 GoatMart CLI Tool                       ║
╚══════════════════════════════════════════════════════════════╝

📦 Version: ${this.version}
👨‍💻 Author: ${this.author}
🌐 Website: ${this.baseUrl}
📅 Last Updated: ${new Date().getFullYear()}

🔧 Node.js: ${process.version}
💻 Platform: ${process.platform}
📋 Architecture: ${process.arch}

📖 For help: goatmart help
🐛 Report issues: ${this.baseUrl}/issues
        `);
    }

    // Make HTTP/HTTPS request
    makeRequest(path, options = {}) {
        return new Promise((resolve, reject) => {
            const url = new URL(this.baseUrl + path);
            const requestModule = url.protocol === 'https:' ? https : http;
            
            const requestOptions = {
                hostname: url.hostname,
                port: url.port,
                path: url.pathname + url.search,
                method: options.method || 'GET',
                headers: {
                    'User-Agent': `GoatMart-CLI/${this.version}`,
                    'Accept': 'application/json',
                    ...options.headers
                }
            };

            const req = requestModule.request(requestOptions, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        if (res.statusCode === 503) {
                            // Handle maintenance mode
                            const response = JSON.parse(data);
                            reject(new Error(`Service under maintenance: ${response.message}`));
                            return;
                        }
                        
                        if (res.statusCode >= 400) {
                            const error = JSON.parse(data);
                            reject(new Error(error.error || `HTTP ${res.statusCode}`));
                            return;
                        }
                        
                        const response = JSON.parse(data);
                        resolve(response);
                    } catch (error) {
                        reject(new Error('Invalid JSON response'));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new Error(`Network error: ${error.message}`));
            });

            if (options.body) {
                req.write(JSON.stringify(options.body));
            }

            req.end();
        });
    }
}

// CLI Interface
function main() {
    const goatmart = new GoatMart();
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        goatmart.help();
        return;
    }

    const command = args[0].toLowerCase();
    
    switch (command) {
        case 'help':
        case '--help':
        case '-h':
            goatmart.help();
            break;
            
        case 'version':
        case '--version':
        case '-v':
            goatmart.version();
            break;
            
        case 'status':
            goatmart.status();
            break;
            
        case 'maintenance':
            goatmart.maintenance();
            break;
            
        case 'endpoints':
            goatmart.endpoints();
            break;
            
        case 'trending':
            goatmart.trending();
            break;
            
        case 'search':
            goatmart.search(args.slice(1).join(' '));
            break;
            
        default:
            console.log(`❌ Unknown command: ${command}`);
            console.log('💡 Use "goatmart help" to see available commands');
            break;
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GoatMart;
}

// Run CLI if called directly
if (require.main === module) {
    main();
}
