// Git Integration for Vibe Code IDE
// Supports GitHub, GitLab, and Codeberg

class GitIntegration {
    constructor() {
        this.connectedRepo = null;
        this.accessToken = null;
        this.platform = null;
        this.projectId = null; // For GitLab
        this.apiEndpoints = {
            github: 'https://api.github.com',
            gitlab: 'https://gitlab.com/api/v4',
            codeberg: 'https://codeberg.org/api/v1'
        };
        this.init();
    }

    init() {
        this.loadSavedConnection();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('gitDropdown');
            const toggle = document.querySelector('.dropdown-toggle');
            
            if (dropdown && !dropdown.contains(e.target) && !toggle.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }

    loadSavedConnection() {
        const saved = localStorage.getItem('vibeCodeGitConnection');
        if (saved) {
            try {
                const connection = JSON.parse(saved);
                this.connectedRepo = connection.repo;
                this.accessToken = connection.token;
                this.platform = connection.platform;
                this.projectId = connection.projectId;
                this.updateUIForConnectedState();
            } catch (error) {
                console.error('Error loading saved Git connection:', error);
            }
        }
    }

    saveConnection() {
        const connection = {
            repo: this.connectedRepo,
            token: this.accessToken,
            platform: this.platform,
            projectId: this.projectId
        };
        localStorage.setItem('vibeCodeGitConnection', JSON.stringify(connection));
    }

    updateUIForConnectedState() {
        const pushBtn = document.getElementById('pushBtn');
        const pullBtn = document.getElementById('pullBtn');
        
        if (pushBtn) pushBtn.disabled = false;
        if (pullBtn) pullBtn.disabled = false;

        this.showNotification(`Connected to ${this.platform}: ${this.connectedRepo}`, 'success');
    }

    async connectToGitHub() {
        this.platform = 'github';
        this.showGitModal();
    }

    async connectToGitLab() {
        this.platform = 'gitlab';
        this.showGitModal();
    }

    async connectToCodeberg() {
        this.platform = 'codeberg';
        this.showGitModal();
    }

    showGitModal() {
        const modal = document.getElementById('gitModal');
        const title = document.getElementById('gitModalTitle');
        const platformSelect = document.getElementById('gitPlatform');
        
        if (modal && title && platformSelect) {
            title.textContent = `Connect to ${this.platform.charAt(0).toUpperCase() + this.platform.slice(1)}`;
            platformSelect.value = this.platform;
            this.updateGitForm();
            
            modal.classList.remove('hidden');
            modal.classList.add('show');
        }
    }

    updateGitForm() {
        const platform = document.getElementById('gitPlatform').value;
        const tokenInput = document.getElementById('gitToken');
        const repoInput = document.getElementById('gitRepo');
        const helpText = tokenInput.nextElementSibling;

        // Update help text based on platform
        const helpTexts = {
            github: 'Generate a personal access token from GitHub Settings > Developer Settings > Personal Access Tokens',
            gitlab: 'Generate a personal access token from GitLab User Settings > Access Tokens (needs api, read_repository, write_repository scopes)',
            codeberg: 'Generate a personal access token from Codeberg User Settings > Applications'
        };

        if (helpText) {
            helpText.textContent = helpTexts[platform] || 'Generate a personal access token from your platform settings';
        }

        // Update placeholder for repo URL
        const placeholders = {
            github: 'https://github.com/username/repo',
            gitlab: 'https://gitlab.com/username/repo',
            codeberg: 'https://codeberg.org/username/repo'
        };

        if (repoInput) {
            repoInput.placeholder = placeholders[platform] || 'Repository URL';
        }

        this.platform = platform;
    }

    async connectGitRepo() {
        const token = document.getElementById('gitToken').value.trim();
        const repoUrl = document.getElementById('gitRepo').value.trim();
        const platform = document.getElementById('gitPlatform').value;

        if (!token || !repoUrl) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        // Extract owner and repo from URL
        const repoMatch = repoUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:github\.com|gitlab\.com|codeberg\.org)\/([^\/]+)\/([^\/]+)(?:\.git)?/);
        
        if (!repoMatch) {
            this.showNotification('Invalid repository URL format', 'error');
            return;
        }

        const [, owner, repo] = repoMatch;
        this.connectedRepo = `${owner}/${repo}`;
        this.accessToken = token;
        this.platform = platform;

        try {
            // Test the connection and get project info
            await this.testConnection();
            
            this.saveConnection();
            this.updateUIForConnectedState();
            this.closeModal();
            
            this.showNotification(`Successfully connected to ${this.platform}!`, 'success');
        } catch (error) {
            console.error('Connection error:', error);
            this.showNotification(`Connection failed: ${error.message}`, 'error');
        }
    }

    async testConnection() {
        const [owner, repo] = this.connectedRepo.split('/');
        
        if (this.platform === 'gitlab') {
            // For GitLab, we need to get the project ID first
            const projectPath = encodeURIComponent(`${owner}/${repo}`);
            const endpoint = `${this.apiEndpoints.gitlab}/projects/${projectPath}`;
            
            const response = await fetch(endpoint, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
            }

            const projectData = await response.json();
            this.projectId = projectData.id;
            return projectData;
        } else {
            // For GitHub and Codeberg
            const endpoint = this.getApiEndpoint('repos', owner, repo);
            
            const response = await fetch(endpoint, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
            }

            return response.json();
        }
    }

    getApiEndpoint(type, ...params) {
        const baseUrl = this.apiEndpoints[this.platform];
        
        switch (this.platform) {
            case 'github':
                return `${baseUrl}/${type}/${params.join('/')}`;
            case 'gitlab':
                // Use project ID if available, otherwise use encoded path
                if (this.projectId && type === 'files') {
                    return `${baseUrl}/projects/${this.projectId}/repository/files`;
                }
                const projectPath = params.join('/');
                return `${baseUrl}/projects/${encodeURIComponent(projectPath)}`;
            case 'codeberg':
                return `${baseUrl}/${type}/${params.join('/')}`;
            default:
                throw new Error(`Unsupported platform: ${this.platform}`);
        }
    }

    getAuthHeaders() {
        switch (this.platform) {
            case 'github':
                return {
                    'Authorization': `token ${this.accessToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                };
            case 'gitlab':
                return {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                };
            case 'codeberg':
                return {
                    'Authorization': `token ${this.accessToken}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                };
            default:
                return {};
        }
    }

    async pushToRepo() {
        if (!this.connectedRepo || !this.accessToken) {
            this.showNotification('No repository connected', 'error');
            return;
        }

        try {
            this.showNotification('Pushing to repository...', 'info');
            
            // Get current project files
            const files = this.getCurrentProjectFiles();
            
            if (Object.keys(files).length === 0) {
                this.showNotification('No files to push', 'error');
                return;
            }

            // Create or update files in the repository
            const [owner, repo] = this.connectedRepo.split('/');
            
            for (const [filename, content] of Object.entries(files)) {
                await this.createOrUpdateFile(owner, repo, filename, content);
            }

            this.showNotification('Successfully pushed to repository! 🚀', 'success');
        } catch (error) {
            console.error('Push error:', error);
            this.showNotification(`Push failed: ${error.message}`, 'error');
        }
    }

    async createOrUpdateFile(owner, repo, filename, content) {
        const path = this.getFilePath(filename);
        
        try {
            if (this.platform === 'gitlab') {
                return await this.handleGitLabFile(path, content);
            } else {
                return await this.handleGitHubCodebergFile(owner, repo, path, content);
            }
        } catch (error) {
            console.error(`Error updating ${filename}:`, error);
            throw error;
        }
    }

    async handleGitLabFile(path, content) {
        const endpoint = `${this.apiEndpoints.gitlab}/projects/${this.projectId}/repository/files/${encodeURIComponent(path)}`;
        
        // First, try to get the file to see if it exists
        let fileExists = false;
        try {
            const getResponse = await fetch(endpoint, {
                headers: this.getAuthHeaders()
            });
            fileExists = getResponse.ok;
        } catch (error) {
            // File doesn't exist, that's okay
        }

        // Create or update the file
        const body = {
            branch: 'main',
            content: content,
            commit_message: `Update ${path} from Vibe Code IDE`,
            encoding: 'text'
        };

        const method = fileExists ? 'PUT' : 'POST';
        const response = await fetch(endpoint, {
            method: method,
            headers: this.getAuthHeaders(),
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
        }

        return response.json();
    }

    async handleGitHubCodebergFile(owner, repo, path, content) {
        const endpoint = this.getFileEndpoint(owner, repo, path);
        
        // First, try to get the file to see if it exists
        let sha = null;
        try {
            const getResponse = await fetch(endpoint, {
                headers: this.getAuthHeaders()
            });
            
            if (getResponse.ok) {
                const fileData = await getResponse.json();
                sha = fileData.sha;
            }
        } catch (error) {
            // File doesn't exist, that's okay
        }

        // Create or update the file
        const body = {
            message: `Update ${path} from Vibe Code IDE`,
            content: btoa(unescape(encodeURIComponent(content))), // Base64 encode
            ...(sha && { sha }) // Include SHA if updating existing file
        };

        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
        }

        return response.json();
    }

    getFileEndpoint(owner, repo, path) {
        switch (this.platform) {
            case 'github':
                return `${this.apiEndpoints.github}/repos/${owner}/${repo}/contents/${path}`;
            case 'codeberg':
                return `${this.apiEndpoints.codeberg}/repos/${owner}/${repo}/contents/${path}`;
            default:
                throw new Error(`Unsupported platform for file endpoint: ${this.platform}`);
        }
    }

    getFilePath(filename) {
        // Map editor IDs to actual file names
        const fileMap = {
            html: 'index.html',
            css: 'style.css',
            js: 'script.js',
            jsx: 'App.jsx',
            py: 'main.py'
        };
        
        return fileMap[filename] || filename;
    }

    getCurrentProjectFiles() {
        const files = {};
        
        // Get all code editors and their content
        const editors = document.querySelectorAll('.code-editor');
        editors.forEach(editor => {
            const id = editor.id.replace('Code', ''); // Remove 'Code' suffix
            const content = editor.value.trim();
            
            if (content) {
                files[id] = content;
            }
        });

        return files;
    }

    async pullFromRepo() {
        if (!this.connectedRepo || !this.accessToken) {
            this.showNotification('No repository connected', 'error');
            return;
        }

        try {
            this.showNotification('Pulling from repository...', 'info');
            
            const [owner, repo] = this.connectedRepo.split('/');
            const files = await this.getRepositoryFiles(owner, repo);
            
            if (Object.keys(files).length === 0) {
                this.showNotification('No files found in repository', 'info');
                return;
            }
            
            // Update editors with pulled content
            Object.entries(files).forEach(([filename, content]) => {
                const editorId = this.getEditorId(filename);
                const editor = document.getElementById(editorId);
                
                if (editor) {
                    editor.value = content;
                }
            });

            // Update preview
            if (window.ide && window.ide.updatePreview) {
                window.ide.updatePreview();
            }

            this.showNotification('Successfully pulled from repository! 📥', 'success');
        } catch (error) {
            console.error('Pull error:', error);
            this.showNotification(`Pull failed: ${error.message}`, 'error');
        }
    }

    async getRepositoryFiles(owner, repo) {
        const files = {};
        const filesToFetch = ['index.html', 'style.css', 'script.js', 'App.jsx', 'main.py'];
        
        for (const filename of filesToFetch) {
            try {
                let content;
                
                if (this.platform === 'gitlab') {
                    const endpoint = `${this.apiEndpoints.gitlab}/projects/${this.projectId}/repository/files/${encodeURIComponent(filename)}`;
                    const response = await fetch(endpoint, {
                        headers: this.getAuthHeaders()
                    });
                    
                    if (response.ok) {
                        const fileData = await response.json();
                        content = atob(fileData.content); // Decode base64
                    }
                } else {
                    const endpoint = this.getFileEndpoint(owner, repo, filename);
                    const response = await fetch(endpoint, {
                        headers: this.getAuthHeaders()
                    });
                    
                    if (response.ok) {
                        const fileData = await response.json();
                        content = atob(fileData.content); // Decode base64
                    }
                }
                
                if (content) {
                    files[filename] = content;
                }
            } catch (error) {
                // File doesn't exist, skip it
                continue;
            }
        }
        
        return files;
    }

    getEditorId(filename) {
        // Map file names back to editor IDs
        const editorMap = {
            'index.html': 'htmlCode',
            'style.css': 'cssCode',
            'script.js': 'jsCode',
            'App.jsx': 'jsxCode',
            'main.py': 'pyCode'
        };
        
        return editorMap[filename] || filename.replace('.', '') + 'Code';
    }

    toggleGitDropdown() {
        const dropdown = document.getElementById('gitDropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    }

    closeModal() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.remove('show');
            modal.classList.add('hidden');
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Global functions for Git integration
function toggleGitDropdown() {
    if (window.gitIntegration) {
        window.gitIntegration.toggleGitDropdown();
    }
}

function connectToGitHub() {
    if (window.gitIntegration) {
        window.gitIntegration.connectToGitHub();
    }
}

function connectToGitLab() {
    if (window.gitIntegration) {
        window.gitIntegration.connectToGitLab();
    }
}

function connectToCodeberg() {
    if (window.gitIntegration) {
        window.gitIntegration.connectToCodeberg();
    }
}

function connectGitRepo() {
    if (window.gitIntegration) {
        window.gitIntegration.connectGitRepo();
    }
}

function updateGitForm() {
    if (window.gitIntegration) {
        window.gitIntegration.updateGitForm();
    }
}

function pushToRepo() {
    if (window.gitIntegration) {
        window.gitIntegration.pushToRepo();
    }
}

function pullFromRepo() {
    if (window.gitIntegration) {
        window.gitIntegration.pullFromRepo();
    }
}

// Initialize Git integration when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gitIntegration = new GitIntegration();
});