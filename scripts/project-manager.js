// Project Manager for Vibe Code IDE

class ProjectManager {
    constructor() {
        this.currentProject = {
            name: 'Untitled Project',
            type: 'web',
            description: '',
            files: {}
        };
        this.init();
    }

    init() {
        this.setupProjectTypes();
        this.loadDefaultProject();
    }

    setupProjectTypes() {
        const projectTypes = {
            web: {
                name: 'Web (HTML/CSS/JS)',
                files: {
                    html: {
                        name: 'HTML',
                        icon: '📄',
                        language: 'html',
                        defaultContent: `<!DOCTYPE html>
<html>
<head>
    <title>My Vibe Project</title>
</head>
<body>
    <div class="container">
        <h1>Welcome to Vibe Coding! ✨</h1>
        <p>Start creating something amazing...</p>
        <button onclick="vibeAlert()">Click for Good Vibes</button>
    </div>
</body>
</html>`
                    },
                    css: {
                        name: 'CSS',
                        icon: '🎨',
                        language: 'css',
                        defaultContent: `body {
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    min-height: 100vh;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
    padding: 2rem;
}

h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

button {
    background: #ff6b6b;
    color: white;
    border: none;
    padding: 1rem 2rem;
    font-size: 1.2rem;
    border-radius: 50px;
    cursor: pointer;
    transition: transform 0.3s ease;
}

button:hover {
    transform: scale(1.05);
}`
                    },
                    js: {
                        name: 'JavaScript',
                        icon: '⚡',
                        language: 'javascript',
                        defaultContent: `function vibeAlert() {
    const messages = [
        "You're coding with great vibes! ✨",
        "Keep that creative energy flowing! 🌟",
        "Your code is looking fantastic! 🚀",
        "Vibe coding at its finest! 💫",
        "You're in the zone! 🔥"
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    alert(randomMessage);
}

// Add some interactive elements
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Vibe Code IDE is ready!');
    
    // Add some sparkle effect
    setInterval(() => {
        const sparkle = document.createElement('div');
        sparkle.innerHTML = '✨';
        sparkle.style.position = 'fixed';
        sparkle.style.left = Math.random() * window.innerWidth + 'px';
        sparkle.style.top = Math.random() * window.innerHeight + 'px';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.animation = 'sparkle 2s ease-out forwards';
        document.body.appendChild(sparkle);
        
        setTimeout(() => sparkle.remove(), 2000);
    }, 3000);
});

// Add CSS for sparkle animation
const style = document.createElement('style');
style.textContent = \`
    @keyframes sparkle {
        0% { opacity: 1; transform: scale(0) rotate(0deg); }
        50% { opacity: 1; transform: scale(1) rotate(180deg); }
        100% { opacity: 0; transform: scale(0) rotate(360deg); }
    }
\`;
document.head.appendChild(style);`
                    }
                }
            },
            react: {
                name: 'React',
                files: {
                    jsx: {
                        name: 'App.jsx',
                        icon: '⚛️',
                        language: 'javascript',
                        defaultContent: `import React, { useState } from 'react';

function App() {
    const [vibes, setVibes] = useState(0);
    
    const addVibes = () => {
        setVibes(vibes + 1);
    };
    
    return (
        <div className="app">
            <h1>React Vibes! ⚛️</h1>
            <p>Current vibe level: {vibes}</p>
            <button onClick={addVibes}>
                Add Good Vibes ✨
            </button>
        </div>
    );
}

export default App;`
                    },
                    css: {
                        name: 'App.css',
                        icon: '🎨',
                        language: 'css',
                        defaultContent: `.app {
    text-align: center;
    padding: 2rem;
    background: linear-gradient(135deg, #61dafb 0%, #21759b 100%);
    min-height: 100vh;
    color: white;
}

button {
    background: #ff6b6b;
    color: white;
    border: none;
    padding: 1rem 2rem;
    font-size: 1.2rem;
    border-radius: 50px;
    cursor: pointer;
    transition: transform 0.3s ease;
}

button:hover {
    transform: scale(1.05);
}`
                    }
                }
            },
            python: {
                name: 'Python',
                files: {
                    py: {
                        name: 'main.py',
                        icon: '🐍',
                        language: 'python',
                        defaultContent: `#!/usr/bin/env python3
"""
Vibe Code IDE - Python Project
Let's code with good vibes! 🐍✨
"""

import random

def generate_vibes():
    """Generate some good vibes!"""
    vibes = [
        "Your Python skills are on fire! 🔥",
        "Clean code, clear mind! 🧘‍♂️",
        "Pythonic and proud! 🐍",
        "Keep coding with passion! ❤️",
        "You're a Python wizard! 🧙‍♂️"
    ]
    return random.choice(vibes)

def main():
    """Main function with good vibes"""
    print("🚀 Welcome to Python Vibe Coding!")
    print("=" * 40)
    
    for i in range(3):
        print(f"Vibe {i+1}: {generate_vibes()}")
    
    print("\\n✨ Keep coding and stay awesome! ✨")

if __name__ == "__main__":
    main()`
                    }
                }
            }
        };

        this.projectTypes = projectTypes;
    }

    loadDefaultProject() {
        this.switchProjectType('web');
    }

    switchProjectType(type = 'web') {
        if (!this.projectTypes[type]) {
            console.error(`Unknown project type: ${type}`);
            return;
        }

        this.currentProject.type = type;
        this.renderCodePanels();
        this.updateProjectTypeSelector();
    }

    renderCodePanels() {
        const codePanels = document.getElementById('codePanels');
        if (!codePanels) return;

        const projectType = this.projectTypes[this.currentProject.type];
        codePanels.innerHTML = '';

        Object.entries(projectType.files).forEach(([key, file]) => {
            const panel = this.createCodePanel(key, file);
            codePanels.appendChild(panel);
        });

        // Initialize IDE after panels are created
        setTimeout(() => {
            if (window.ide) {
                window.ide.refreshEditors();
            }
        }, 100);
    }

    createCodePanel(key, file) {
        const panel = document.createElement('div');
        panel.className = 'code-panel';
        panel.id = `${key}Panel`;

        panel.innerHTML = `
            <div class="panel-header" onclick="togglePanel('${key}Panel')">
                <div class="panel-header-left">
                    <span class="collapse-icon">▼</span>
                    <span class="panel-title">${file.icon} ${file.name}</span>
                </div>
                <div class="panel-actions">
                    <button class="panel-btn" onclick="clearPanel('${key}')" title="Clear">Clear</button>
                </div>
            </div>
            <textarea 
                class="code-editor" 
                id="${key}Code" 
                placeholder="Start coding with good vibes... ✨"
            >${file.defaultContent}</textarea>
        `;

        return panel;
    }

    updateProjectTypeSelector() {
        const selector = document.getElementById('projectType');
        if (selector) {
            selector.value = this.currentProject.type;
        }
    }

    newProject() {
        const modal = document.getElementById('projectModal');
        const modalTitle = document.getElementById('modalTitle');
        const projectNameInput = document.getElementById('projectNameInput');
        const projectTypeModal = document.getElementById('projectTypeModal');
        
        if (modal && modalTitle) {
            modalTitle.textContent = 'New Project';
            projectNameInput.value = '';
            projectTypeModal.value = 'web';
            this.showModal('projectModal');
        }
    }

    createProject() {
        const projectName = document.getElementById('projectNameInput').value.trim();
        const projectType = document.getElementById('projectTypeModal').value;
        const projectDescription = document.getElementById('projectDescription').value.trim();

        if (!projectName) {
            alert('Please enter a project name');
            return;
        }

        this.currentProject = {
            name: projectName,
            type: projectType,
            description: projectDescription,
            files: {}
        };

        // Update project name display
        const projectNameDisplay = document.getElementById('projectName');
        if (projectNameDisplay) {
            projectNameDisplay.textContent = projectName;
        }

        this.switchProjectType(projectType);
        this.closeModal();
        this.showNotification(`Project "${projectName}" created! 🎉`, 'success');
    }

    saveProject() {
        // Collect current code from all editors
        const projectType = this.projectTypes[this.currentProject.type];
        Object.keys(projectType.files).forEach(key => {
            const editor = document.getElementById(`${key}Code`);
            if (editor) {
                this.currentProject.files[key] = editor.value;
            }
        });

        // Save to localStorage
        const projectData = {
            ...this.currentProject,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('vibeCodeProject', JSON.stringify(projectData));
        this.showNotification('Project saved locally! 💾', 'success');
    }

    openProject() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const projectData = JSON.parse(e.target.result);
                        this.loadProjectData(projectData);
                        this.showNotification('Project loaded! 📂', 'success');
                    } catch (error) {
                        this.showNotification('Error loading project file', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    loadProjectData(projectData) {
        this.currentProject = projectData;
        this.switchProjectType(projectData.type);

        // Load code into editors
        setTimeout(() => {
            Object.entries(projectData.files || {}).forEach(([key, content]) => {
                const editor = document.getElementById(`${key}Code`);
                if (editor) {
                    editor.value = content;
                }
            });

            // Update project name display
            const projectNameDisplay = document.getElementById('projectName');
            if (projectNameDisplay) {
                projectNameDisplay.textContent = projectData.name;
            }

            // Update preview
            if (window.ide) {
                window.ide.updatePreview();
            }
        }, 200);
    }

    downloadProject() {
        // Collect current code
        const projectType = this.projectTypes[this.currentProject.type];
        Object.keys(projectType.files).forEach(key => {
            const editor = document.getElementById(`${key}Code`);
            if (editor) {
                this.currentProject.files[key] = editor.value;
            }
        });

        const projectData = {
            ...this.currentProject,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(projectData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentProject.name.replace(/[^a-z0-9]/gi, '_')}.json`;
        a.click();

        URL.revokeObjectURL(url);
        this.showNotification('Project downloaded! ⬇️', 'success');
    }

    // NEW: Download project as ZIP
    async downloadProjectAsZip() {
        try {
            // Collect current code from all editors
            const projectType = this.projectTypes[this.currentProject.type];
            const files = {};
            
            Object.keys(projectType.files).forEach(key => {
                const editor = document.getElementById(`${key}Code`);
                if (editor && editor.value.trim()) {
                    // Map editor keys to actual file names
                    const fileName = this.getFileName(key);
                    files[fileName] = editor.value;
                }
            });

            if (Object.keys(files).length === 0) {
                this.showNotification('No files to download', 'error');
                return;
            }

            // Create ZIP using JSZip (we'll need to include this library)
            if (typeof JSZip === 'undefined') {
                // Fallback: create individual files if JSZip is not available
                this.downloadIndividualFiles(files);
                return;
            }

            const zip = new JSZip();
            
            // Add files to ZIP
            Object.entries(files).forEach(([fileName, content]) => {
                zip.file(fileName, content);
            });

            // Add a README file
            const readmeContent = `# ${this.currentProject.name}

${this.currentProject.description || 'A project created with Vibe Code IDE'}

## Files
${Object.keys(files).map(file => `- ${file}`).join('\n')}

## Created with
Vibe Code IDE - Creative coding in the flow
https://farwalker3.github.io/vibe-code-ide/

Generated on: ${new Date().toLocaleString()}
`;
            zip.file('README.md', readmeContent);

            // Generate ZIP and download
            const content = await zip.generateAsync({type: 'blob'});
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.currentProject.name.replace(/[^a-z0-9]/gi, '_')}.zip`;
            a.click();

            URL.revokeObjectURL(url);
            this.showNotification('ZIP downloaded! 📦', 'success');

        } catch (error) {
            console.error('Error creating ZIP:', error);
            this.showNotification('Error creating ZIP file', 'error');
        }
    }

    downloadIndividualFiles(files) {
        // Fallback method: download files individually
        Object.entries(files).forEach(([fileName, content], index) => {
            setTimeout(() => {
                const blob = new Blob([content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                a.click();
                URL.revokeObjectURL(url);
            }, index * 500); // Stagger downloads
        });

        this.showNotification('Files downloaded individually! 📁', 'success');
    }

    getFileName(editorKey) {
        const fileMap = {
            html: 'index.html',
            css: 'style.css',
            js: 'script.js',
            jsx: 'App.jsx',
            py: 'main.py'
        };
        return fileMap[editorKey] || `${editorKey}.txt`;
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('show');
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

// Global functions
function switchProjectType() {
    const selector = document.getElementById('projectType');
    if (selector && window.projectManager) {
        window.projectManager.switchProjectType(selector.value);
    }
}

function newProject() {
    if (window.projectManager) {
        window.projectManager.newProject();
    }
}

function openProject() {
    if (window.projectManager) {
        window.projectManager.openProject();
    }
}

function saveProject() {
    if (window.projectManager) {
        window.projectManager.saveProject();
    }
}

function downloadProject() {
    if (window.projectManager) {
        window.projectManager.downloadProject();
    }
}

// NEW: Global function for ZIP download
function downloadProjectAsZip() {
    if (window.projectManager) {
        window.projectManager.downloadProjectAsZip();
    }
}

function createProject() {
    if (window.projectManager) {
        window.projectManager.createProject();
    }
}

function closeModal() {
    if (window.projectManager) {
        window.projectManager.closeModal();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.projectManager = new ProjectManager();
});