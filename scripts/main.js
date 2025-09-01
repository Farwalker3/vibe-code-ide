// Vibe Code IDE - Main JavaScript

class VibeCodeIDE {
    constructor() {
        this.editors = {};
        this.preview = document.getElementById('preview');
        this.runBtn = document.getElementById('runBtn');
        
        this.init();
    }
    
    init() {
        // Initialize after DOM is fully loaded and other components are ready
        setTimeout(() => {
            this.setupEditors();
            this.addEventListeners();
            this.updatePreview();
            
            // Welcome message
            console.log('🚀 Welcome to Vibe Code IDE!');
            console.log('Start coding and let the creative vibes flow! ✨');
        }, 200);
    }

    setupEditors() {
        // Find all code editors and set them up
        const editorElements = document.querySelectorAll('.code-editor');
        editorElements.forEach(editor => {
            const editorId = editor.id;
            this.editors[editorId] = editor;
        });
    }
    
    addEventListeners() {
        // Auto-update preview on code change (with debouncing)
        let updateTimeout;
        const debouncedUpdate = () => {
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(() => this.updatePreview(), 500);
        };
        
        // Add event listeners to all current editors
        Object.values(this.editors).forEach(editor => {
            editor.addEventListener('input', debouncedUpdate);
        });

        // Manual run button
        if (this.runBtn) {
            this.runBtn.addEventListener('click', () => this.updatePreview());
        }
        
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
                if (window.projectManager) {
                    window.projectManager.saveProject();
                } else {
                    this.saveProject();
                }
            }
        });
        
        // Tab key support in textareas
        Object.values(this.editors).forEach(editor => {
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

    // Method to refresh editors when project type changes
    refreshEditors() {
        this.setupEditors();
        this.addEventListeners();
        this.updatePreview();
    }
    
    updatePreview() {
        const htmlEditor = document.getElementById('htmlCode');
        const cssEditor = document.getElementById('cssCode');
        const jsEditor = document.getElementById('jsCode');
        
        if (!htmlEditor && !cssEditor && !jsEditor) {
            console.log('No editors found for preview update');
            return;
        }

        const html = htmlEditor ? htmlEditor.value : '';
        const css = cssEditor ? cssEditor.value : '';
        const js = jsEditor ? jsEditor.value : '';
        
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
                        const errorDiv = document.createElement('div');
                        errorDiv.style.cssText = 'background: #fee; border: 1px solid #fcc; padding: 10px; margin: 10px 0; border-radius: 4px; color: #c33; font-family: monospace;';
                        errorDiv.innerHTML = '<strong>JavaScript Error:</strong> ' + e.message;
                        document.body.appendChild(errorDiv);
                    });
                    
                    try {
                        ${js}
                    } catch (error) {
                        console.error('JavaScript Error:', error);
                        const errorDiv = document.createElement('div');
                        errorDiv.style.cssText = 'background: #fee; border: 1px solid #fcc; padding: 10px; margin: 10px 0; border-radius: 4px; color: #c33; font-family: monospace;';
                        errorDiv.innerHTML = '<strong>JavaScript Error:</strong> ' + error.message;
                        document.body.appendChild(errorDiv);
                    }
                </script>
            </body>
            </html>
        `;
        
        // Update preview iframe
        if (this.preview) {
            const blob = new Blob([previewContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            this.preview.src = url;
            
            // Clean up previous blob URL
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
        
        // Add visual feedback
        if (this.runBtn) {
            this.runBtn.textContent = '✓ Updated';
            this.runBtn.style.background = 'linear-gradient(45deg, #22c55e, #16a34a)';
            
            setTimeout(() => {
                this.runBtn.textContent = '▶ Run';
                this.runBtn.style.background = 'linear-gradient(45deg, #6366f1, #7c3aed)';
            }, 1000);
        }
    }
    
    saveProject() {
        const projectData = {
            html: this.getEditorValue('htmlCode'),
            css: this.getEditorValue('cssCode'),
            js: this.getEditorValue('jsCode'),
            timestamp: new Date().toISOString()
        };
        
        // Save to localStorage
        localStorage.setItem('vibeCodeProject', JSON.stringify(projectData));
        
        // Show save confirmation
        this.showNotification('Project saved locally! 💾', 'success');
    }

    getEditorValue(editorId) {
        const editor = document.getElementById(editorId);
        return editor ? editor.value : '';
    }
    
    loadProject() {
        const saved = localStorage.getItem('vibeCodeProject');
        if (saved) {
            const projectData = JSON.parse(saved);
            
            const htmlEditor = document.getElementById('htmlCode');
            const cssEditor = document.getElementById('cssCode');
            const jsEditor = document.getElementById('jsCode');
            
            if (htmlEditor) htmlEditor.value = projectData.html || '';
            if (cssEditor) cssEditor.value = projectData.css || '';
            if (jsEditor) jsEditor.value = projectData.js || '';
            
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

// Panel collapse/expand functionality - FIXED to remove extra space
function togglePanel(panelId) {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    
    const collapseIcon = panel.querySelector('.collapse-icon');
    const codeEditor = panel.querySelector('.code-editor');
    
    if (panel.classList.contains('collapsed')) {
        // Expand panel
        panel.classList.remove('collapsed');
        if (collapseIcon) collapseIcon.textContent = '▼';
        
        // Restore editor visibility and functionality
        if (codeEditor) {
            codeEditor.style.height = '';
            codeEditor.style.minHeight = '';
            codeEditor.style.padding = '';
            codeEditor.style.margin = '';
            codeEditor.style.opacity = '';
            codeEditor.style.visibility = '';
            codeEditor.style.overflow = '';
        }
    } else {
        // Collapse panel
        panel.classList.add('collapsed');
        if (collapseIcon) collapseIcon.textContent = '▶';
        
        // Hide editor completely to remove space
        if (codeEditor) {
            codeEditor.style.height = '0';
            codeEditor.style.minHeight = '0';
            codeEditor.style.padding = '0';
            codeEditor.style.margin = '0';
            codeEditor.style.opacity = '0';
            codeEditor.style.visibility = 'hidden';
            codeEditor.style.overflow = 'hidden';
        }
    }
}

// Global functions for UI interactions
function clearPanel(type) {
    const editorId = type + 'Code';
    const editor = document.getElementById(editorId);
    
    if (editor) {
        editor.value = '';
        if (window.ide) {
            window.ide.updatePreview();
        }
    }
}

function refreshPreview() {
    if (window.ide) {
        window.ide.updatePreview();
    }
}

function openInNewTab() {
    const htmlEditor = document.getElementById('htmlCode');
    const cssEditor = document.getElementById('cssCode');
    const jsEditor = document.getElementById('jsCode');
    
    const html = htmlEditor ? htmlEditor.value : '';
    const css = cssEditor ? cssEditor.value : '';
    const js = jsEditor ? jsEditor.value : '';
    
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
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 1000);
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

    /* Enhanced syntax highlighting styles */
    .keyword {
        color: #ff79c6;
        font-weight: bold;
    }
    
    .string {
        color: #f1fa8c;
    }
    
    .comment {
        color: #6272a4;
        font-style: italic;
    }
    
    .number {
        color: #bd93f9;
    }
`;
document.head.appendChild(style);

// Initialize the IDE when DOM is loaded
let ide;
document.addEventListener('DOMContentLoaded', () => {
    // Wait for other components to initialize first
    setTimeout(() => {
        ide = new VibeCodeIDE();
        window.ide = ide; // Make it globally accessible
        
        // Try to load saved project
        if (localStorage.getItem('vibeCodeProject') && !window.projectManager) {
            setTimeout(() => {
                if (confirm('Found a saved project. Would you like to load it?')) {
                    ide.loadProject();
                }
            }, 1000);
        }
    }, 300);
});

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VibeCodeIDE };
}