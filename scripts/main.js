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
            this.setupResponsiveHandlers();
            
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

    setupResponsiveHandlers() {
        // Handle window resize for responsive layout
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResponsiveLayout();
            }, 150);
        });

        // Initial responsive setup
        this.handleResponsiveLayout();
    }

    handleResponsiveLayout() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Auto-collapse panels on very small screens
        if (width < 480 && height < 600) {
            this.autoCollapsePanels();
        }
        
        // Adjust font sizes for better readability
        this.adjustFontSizes();
    }

    autoCollapsePanels() {
        const panels = document.querySelectorAll('.code-panel');
        panels.forEach((panel, index) => {
            // Keep only the first panel expanded on very small screens
            if (index > 0 && !panel.classList.contains('collapsed')) {
                const panelId = panel.id;
                togglePanel(panelId);
            }
        });
    }

    adjustFontSizes() {
        const width = window.innerWidth;
        const editors = document.querySelectorAll('.code-editor');
        
        editors.forEach(editor => {
            if (width < 480) {
                editor.style.fontSize = '12px';
            } else if (width < 768) {
                editor.style.fontSize = '13px';
            } else {
                editor.style.fontSize = '14px';
            }
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
            
            // Add mobile-friendly touch events
            if ('ontouchstart' in window) {
                editor.addEventListener('touchstart', () => {
                    editor.focus();
                });
            }
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
            
            // Ctrl/Cmd + S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (window.projectManager) {
                    window.projectManager.saveProject();
                } else {
                    this.saveProject();
                }
            }

            // Escape to close modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
        
        // Enhanced tab key support in textareas
        Object.values(this.editors).forEach(editor => {
            editor.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    const start = editor.selectionStart;
                    const end = editor.selectionEnd;
                    
                    if (e.shiftKey) {
                        // Shift+Tab: Remove indentation
                        const lines = editor.value.split('\n');
                        const startLine = editor.value.substring(0, start).split('\n').length - 1;
                        const endLine = editor.value.substring(0, end).split('\n').length - 1;
                        
                        for (let i = startLine; i <= endLine; i++) {
                            if (lines[i].startsWith('  ')) {
                                lines[i] = lines[i].substring(2);
                            }
                        }
                        
                        editor.value = lines.join('\n');
                        editor.setSelectionRange(Math.max(0, start - 2), Math.max(0, end - 2));
                    } else {
                        // Tab: Add indentation
                        if (start === end) {
                            // Single cursor
                            editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
                            editor.selectionStart = editor.selectionEnd = start + 2;
                        } else {
                            // Selection: indent all lines
                            const lines = editor.value.split('\n');
                            const startLine = editor.value.substring(0, start).split('\n').length - 1;
                            const endLine = editor.value.substring(0, end).split('\n').length - 1;
                            
                            for (let i = startLine; i <= endLine; i++) {
                                lines[i] = '  ' + lines[i];
                            }
                            
                            editor.value = lines.join('\n');
                            editor.setSelectionRange(start + 2, end + (endLine - startLine + 1) * 2);
                        }
                    }
                }
            });
        });
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.remove('show');
            modal.classList.add('hidden');
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
                        line-height: 1.6;
                    }
                    
                    /* Responsive defaults */
                    * {
                        box-sizing: border-box;
                    }
                    
                    img {
                        max-width: 100%;
                        height: auto;
                    }
                    
                    ${css}
                </style>
            </head>
            <body>
                ${html}
                <script>
                    // Enhanced error handling for user code
                    window.addEventListener('error', function(e) {
                        console.error('Preview Error:', e.error);
                        const errorDiv = document.createElement('div');
                        errorDiv.style.cssText = 'background: #fee; border: 1px solid #fcc; padding: 10px; margin: 10px 0; border-radius: 4px; color: #c33; font-family: monospace; font-size: 14px; line-height: 1.4;';
                        errorDiv.innerHTML = '<strong>JavaScript Error:</strong><br>' + e.message + '<br><small>Line: ' + e.lineno + '</small>';
                        document.body.appendChild(errorDiv);
                    });
                    
                    // Console override for better debugging
                    const originalLog = console.log;
                    console.log = function(...args) {
                        originalLog.apply(console, args);
                        // Could send to parent frame for console panel
                    };
                    
                    try {
                        ${js}
                    } catch (error) {
                        console.error('JavaScript Error:', error);
                        const errorDiv = document.createElement('div');
                        errorDiv.style.cssText = 'background: #fee; border: 1px solid #fcc; padding: 10px; margin: 10px 0; border-radius: 4px; color: #c33; font-family: monospace; font-size: 14px; line-height: 1.4;';
                        errorDiv.innerHTML = '<strong>JavaScript Error:</strong><br>' + error.message + '<br><small>' + error.stack + '</small>';
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
        
        // Add visual feedback with better mobile support
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
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// ENHANCED Panel collapse/expand functionality - COMPLETELY FIXED
function togglePanel(panelId) {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    
    const collapseIcon = panel.querySelector('.collapse-icon');
    const codeEditor = panel.querySelector('.code-editor');
    
    if (panel.classList.contains('collapsed')) {
        // Expand panel
        panel.classList.remove('collapsed');
        if (collapseIcon) collapseIcon.textContent = '▼';
        
        // Restore editor completely
        if (codeEditor) {
            // Remove all inline styles that were hiding the editor
            codeEditor.style.height = '';
            codeEditor.style.minHeight = '';
            codeEditor.style.maxHeight = '';
            codeEditor.style.padding = '';
            codeEditor.style.margin = '';
            codeEditor.style.border = '';
            codeEditor.style.opacity = '';
            codeEditor.style.visibility = '';
            codeEditor.style.overflow = '';
            codeEditor.style.flex = '';
        }
    } else {
        // Collapse panel - COMPLETELY hide editor
        panel.classList.add('collapsed');
        if (collapseIcon) collapseIcon.textContent = '▶';
        
        // Force hide editor with !important-like behavior through inline styles
        if (codeEditor) {
            codeEditor.style.height = '0px';
            codeEditor.style.minHeight = '0px';
            codeEditor.style.maxHeight = '0px';
            codeEditor.style.padding = '0px';
            codeEditor.style.margin = '0px';
            codeEditor.style.border = 'none';
            codeEditor.style.opacity = '0';
            codeEditor.style.visibility = 'hidden';
            codeEditor.style.overflow = 'hidden';
            codeEditor.style.flex = '0 0 0px';
        }
    }
    
    // Announce change for screen readers
    const title = panel.querySelector('.panel-title');
    if (title) {
        const isCollapsed = panel.classList.contains('collapsed');
        panel.setAttribute('aria-expanded', !isCollapsed);
        
        // Optional: announce to screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.textContent = `${title.textContent} panel ${isCollapsed ? 'collapsed' : 'expanded'}`;
        document.body.appendChild(announcement);
        setTimeout(() => announcement.remove(), 1000);
    }
}

// Global functions for UI interactions
function clearPanel(type) {
    const editorId = type + 'Code';
    const editor = document.getElementById(editorId);
    
    if (editor) {
        if (confirm('Are you sure you want to clear this panel? This action cannot be undone.')) {
            editor.value = '';
            if (window.ide) {
                window.ide.updatePreview();
            }
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
            <style>
                body {
                    margin: 0;
                    padding: 20px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6;
                }
                * { box-sizing: border-box; }
                img { max-width: 100%; height: auto; }
                ${css}
            </style>
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

// Touch and mobile improvements
function setupMobileEnhancements() {
    // Prevent zoom on double tap for buttons
    const buttons = document.querySelectorAll('button, .panel-header');
    buttons.forEach(button => {
        button.addEventListener('touchend', function(e) {
            e.preventDefault();
            e.target.click();
        });
    });

    // Improve touch scrolling
    const scrollableElements = document.querySelectorAll('.code-editor, .console-output');
    scrollableElements.forEach(element => {
        element.style.webkitOverflowScrolling = 'touch';
    });

    // Add haptic feedback on supported devices
    if ('vibrate' in navigator) {
        const tactileElements = document.querySelectorAll('.run-btn, .control-btn');
        tactileElements.forEach(element => {
            element.addEventListener('click', () => {
                navigator.vibrate(50);
            });
        });
    }
}

// Add CSS animations and enhancements
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

    /* Smooth transitions for panel collapse */
    .code-panel {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Better focus indicators for accessibility */
    .code-editor:focus-visible {
        outline: 2px solid #6366f1;
        outline-offset: -2px;
    }

    /* Loading state */
    .loading {
        opacity: 0.6;
        pointer-events: none;
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
        
        // Setup mobile enhancements
        setupMobileEnhancements();
        
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

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Could register a service worker here for offline functionality
    });
}

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VibeCodeIDE };
}