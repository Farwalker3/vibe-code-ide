// Vibe Code IDE - Main JavaScript

class VibeCodeIDE {
    constructor() {
        this.htmlEditor = document.getElementById('htmlCode');
        this.cssEditor = document.getElementById('cssCode');
        this.jsEditor = document.getElementById('jsCode');
        this.preview = document.getElementById('preview');
        this.runBtn = document.getElementById('runBtn');
        
        this.init();
    }
    
    init() {
        // Auto-run on load
        this.updatePreview();
        
        // Add event listeners
        this.addEventListeners();
        
        // Welcome message
        console.log('🚀 Welcome to Vibe Code IDE!');
        console.log('Start coding and let the creative vibes flow! ✨');
    }
    
    addEventListeners() {
        // Auto-update preview on code change (with debouncing)
        let updateTimeout;
        const debouncedUpdate = () => {
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(() => this.updatePreview(), 500);
        };
        
        this.htmlEditor.addEventListener('input', debouncedUpdate);
        this.cssEditor.addEventListener('input', debouncedUpdate);
        this.jsEditor.addEventListener('input', debouncedUpdate);
        
        // Manual run button
        this.runBtn.addEventListener('click', () => this.updatePreview());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + R to run
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.updatePreview();
            }
            
            // Ctrl/Cmd + S to save (placeholder)
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveProject();
            }
        });
        
        // Tab key support in textareas
        [this.htmlEditor, this.cssEditor, this.jsEditor].forEach(editor => {
            editor.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    const start = editor.selectionStart;
                    const end = editor.selectionEnd;
                    
                    // Insert tab character
                    editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
                    editor.selectionStart = editor.selectionEnd = start + 2;
                }
            });
        });
    }
    
    updatePreview() {
        const html = this.htmlEditor.value;
        const css = this.cssEditor.value;
        const js = this.jsEditor.value;
        
        // Create the complete HTML document
        const previewContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Vibe Code Preview</title>
                <style>
                    body {
                        margin: 0;
                        padding: 20px;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    }
                    ${css}
                </style>
            </head>
            <body>
                ${html}
                <script>
                    // Error handling for user code
                    window.addEventListener('error', function(e) {
                        console.error('Preview Error:', e.error);
                        document.body.innerHTML += '<div style="background: #fee; border: 1px solid #fcc; padding: 10px; margin: 10px 0; border-radius: 4px; color: #c33;"><strong>JavaScript Error:</strong> ' + e.message + '</div>';
                    });
                    
                    try {
                        ${js}
                    } catch (error) {
                        console.error('JavaScript Error:', error);
                        document.body.innerHTML += '<div style="background: #fee; border: 1px solid #fcc; padding: 10px; margin: 10px 0; border-radius: 4px; color: #c33;"><strong>JavaScript Error:</strong> ' + error.message + '</div>';
                    }
                </script>
            </body>
            </html>
        `;
        
        // Update preview iframe
        const blob = new Blob([previewContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        this.preview.src = url;
        
        // Clean up previous blob URL
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        
        // Add visual feedback
        this.runBtn.textContent = '✓ Updated';
        this.runBtn.style.background = 'linear-gradient(45deg, #22c55e, #16a34a)';
        
        setTimeout(() => {
            this.runBtn.textContent = '▶ Run';
            this.runBtn.style.background = 'linear-gradient(45deg, #6366f1, #7c3aed)';
        }, 1000);
    }
    
    saveProject() {
        const projectData = {
            html: this.htmlEditor.value,
            css: this.cssEditor.value,
            js: this.jsEditor.value,
            timestamp: new Date().toISOString()
        };
        
        // Save to localStorage
        localStorage.setItem('vibeCodeProject', JSON.stringify(projectData));
        
        // Show save confirmation
        this.showNotification('Project saved locally! 💾', 'success');
    }
    
    loadProject() {
        const saved = localStorage.getItem('vibeCodeProject');
        if (saved) {
            const projectData = JSON.parse(saved);
            this.htmlEditor.value = projectData.html || '';
            this.cssEditor.value = projectData.css || '';
            this.jsEditor.value = projectData.js || '';
            this.updatePreview();
            this.showNotification('Project loaded! 📂', 'success');
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Panel collapse/expand functionality
function togglePanel(panelId) {
    const panel = document.getElementById(panelId);
    const collapseIcon = panel.querySelector('.collapse-icon');
    
    if (panel.classList.contains('collapsed')) {
        // Expand panel
        panel.classList.remove('collapsed');
        collapseIcon.textContent = '▼';
    } else {
        // Collapse panel
        panel.classList.add('collapsed');
        collapseIcon.textContent = '▶';
    }
}

// Global functions for UI interactions
function clearPanel(type) {
    const editors = {
        html: document.getElementById('htmlCode'),
        css: document.getElementById('cssCode'),
        js: document.getElementById('jsCode')
    };
    
    if (editors[type]) {
        editors[type].value = '';
        ide.updatePreview();
    }
}

function refreshPreview() {
    ide.updatePreview();
}

function openInNewTab() {
    const html = document.getElementById('htmlCode').value;
    const css = document.getElementById('cssCode').value;
    const js = document.getElementById('jsCode').value;
    
    const fullHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Vibe Code Project</title>
            <style>${css}</style>
        </head>
        <body>
            ${html}
            <script>${js}</script>
        </body>
        </html>
    `;
    
    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize the IDE when DOM is loaded
let ide;
document.addEventListener('DOMContentLoaded', () => {
    ide = new VibeCodeIDE();
    
    // Try to load saved project
    if (localStorage.getItem('vibeCodeProject')) {
        setTimeout(() => {
            if (confirm('Found a saved project. Would you like to load it?')) {
                ide.loadProject();
            }
        }, 1000);
    }
});

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VibeCodeIDE };
}