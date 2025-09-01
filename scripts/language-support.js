// Language Support for Vibe Code IDE
// Provides syntax highlighting, auto-completion, and language-specific features

class LanguageSupport {
    constructor() {
        this.languages = {
            html: {
                name: 'HTML',
                extensions: ['.html', '.htm'],
                keywords: ['html', 'head', 'body', 'div', 'span', 'p', 'a', 'img', 'ul', 'li', 'ol', 'table', 'tr', 'td', 'th'],
                snippets: {
                    'div': '<div class=""></div>',
                    'link': '<a href=""></a>',
                    'img': '<img src="" alt="">',
                    'ul': '<ul>\n  <li></li>\n</ul>',
                    'table': '<table>\n  <tr>\n    <th></th>\n  </tr>\n  <tr>\n    <td></td>\n  </tr>\n</table>'
                }
            },
            css: {
                name: 'CSS',
                extensions: ['.css'],
                keywords: ['color', 'background', 'margin', 'padding', 'border', 'font', 'display', 'position', 'width', 'height'],
                snippets: {
                    'flex': 'display: flex;\njustify-content: center;\nalign-items: center;',
                    'grid': 'display: grid;\ngrid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\ngap: 1rem;',
                    'center': 'margin: 0 auto;\ntext-align: center;',
                    'gradient': 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);'
                }
            },
            javascript: {
                name: 'JavaScript',
                extensions: ['.js', '.jsx'],
                keywords: ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'class', 'import', 'export'],
                snippets: {
                    'func': 'function functionName() {\n  \n}',
                    'arrow': 'const functionName = () => {\n  \n};',
                    'class': 'class ClassName {\n  constructor() {\n    \n  }\n}',
                    'foreach': 'array.forEach((item, index) => {\n  \n});',
                    'fetch': 'fetch(url)\n  .then(response => response.json())\n  .then(data => {\n    \n  })\n  .catch(error => {\n    console.error(error);\n  });'
                }
            },
            python: {
                name: 'Python',
                extensions: ['.py'],
                keywords: ['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'import', 'from', 'return', 'try', 'except'],
                snippets: {
                    'def': 'def function_name():\n    pass',
                    'class': 'class ClassName:\n    def __init__(self):\n        pass',
                    'for': 'for item in items:\n    pass',
                    'if': 'if condition:\n    pass',
                    'try': 'try:\n    pass\nexcept Exception as e:\n    print(f"Error: {e}")'
                }
            }
        };
        
        this.init();
    }

    init() {
        this.setupAutoCompletion();
        this.setupSyntaxHighlighting();
        this.setupCodeFormatting();
    }

    setupAutoCompletion() {
        // Add auto-completion functionality
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && e.target.classList.contains('code-editor')) {
                const editor = e.target;
                const cursorPos = editor.selectionStart;
                const textBefore = editor.value.substring(0, cursorPos);
                const words = textBefore.split(/\s+/);
                const lastWord = words[words.length - 1];
                
                // Try to find a snippet for the last word
                const language = this.detectLanguage(editor);
                if (language && this.languages[language].snippets[lastWord]) {
                    e.preventDefault();
                    this.insertSnippet(editor, lastWord, language);
                }
            }
        });
    }

    setupSyntaxHighlighting() {
        // Basic syntax highlighting using CSS classes
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('code-editor')) {
                this.debounceHighlight(e.target);
            }
        });
    }

    setupCodeFormatting() {
        // Add code formatting shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
                if (e.target.classList.contains('code-editor')) {
                    e.preventDefault();
                    this.formatCode(e.target);
                }
            }
        });
    }

    detectLanguage(editor) {
        const editorId = editor.id;
        
        if (editorId.includes('html')) return 'html';
        if (editorId.includes('css')) return 'css';
        if (editorId.includes('js') || editorId.includes('jsx')) return 'javascript';
        if (editorId.includes('py')) return 'python';
        
        return null;
    }

    insertSnippet(editor, trigger, language) {
        const snippet = this.languages[language].snippets[trigger];
        if (!snippet) return;

        const cursorPos = editor.selectionStart;
        const textBefore = editor.value.substring(0, cursorPos - trigger.length);
        const textAfter = editor.value.substring(cursorPos);
        
        editor.value = textBefore + snippet + textAfter;
        
        // Position cursor at the end of the snippet or at a placeholder
        const newCursorPos = textBefore.length + snippet.length;
        editor.setSelectionRange(newCursorPos, newCursorPos);
        
        // Show notification
        this.showSnippetNotification(trigger, language);
    }

    debounceHighlight(editor) {
        if (this.highlightTimeout) {
            clearTimeout(this.highlightTimeout);
        }
        
        this.highlightTimeout = setTimeout(() => {
            this.applySyntaxHighlighting(editor);
        }, 300);
    }

    applySyntaxHighlighting(editor) {
        // Basic syntax highlighting by adding CSS classes
        // This is a simplified version - for production, consider using a library like Prism.js
        const language = this.detectLanguage(editor);
        if (!language) return;

        const keywords = this.languages[language].keywords;
        let content = editor.value;
        
        // Simple keyword highlighting (this is very basic)
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            content = content.replace(regex, `<span class="keyword">${keyword}</span>`);
        });
        
        // Note: This is just for demonstration. In practice, you'd want to use
        // a proper syntax highlighting library or implement a more sophisticated parser
    }

    formatCode(editor) {
        const language = this.detectLanguage(editor);
        if (!language) return;

        let content = editor.value;
        
        switch (language) {
            case 'html':
                content = this.formatHTML(content);
                break;
            case 'css':
                content = this.formatCSS(content);
                break;
            case 'javascript':
                content = this.formatJavaScript(content);
                break;
            case 'python':
                content = this.formatPython(content);
                break;
        }
        
        editor.value = content;
        this.showNotification('Code formatted! ✨', 'success');
    }

    formatHTML(html) {
        // Basic HTML formatting
        let formatted = html
            .replace(/></g, '>\\n<')
            .replace(/^\\s+|\\s+$/gm, '')
            .split('\\n');
        
        let indent = 0;
        const indentSize = 2;
        
        return formatted.map(line => {
            const trimmed = line.trim();
            if (!trimmed) return '';
            
            if (trimmed.startsWith('</')) {
                indent = Math.max(0, indent - indentSize);
            }
            
            const indentedLine = ' '.repeat(indent) + trimmed;
            
            if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
                if (!this.isSelfClosingTag(trimmed)) {
                    indent += indentSize;
                }
            }
            
            return indentedLine;
        }).join('\\n');
    }

    formatCSS(css) {
        // Basic CSS formatting
        return css
            .replace(/\\{/g, ' {\\n  ')
            .replace(/\\}/g, '\\n}\\n')
            .replace(/;/g, ';\\n  ')
            .replace(/\\n\\s*\\n/g, '\\n')
            .replace(/^\\s+|\\s+$/gm, '')
            .split('\\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\\n');
    }

    formatJavaScript(js) {
        // Basic JavaScript formatting
        let formatted = js
            .replace(/\\{/g, ' {\\n  ')
            .replace(/\\}/g, '\\n}')
            .replace(/;/g, ';\\n')
            .replace(/,/g, ',\\n  ');
        
        // Clean up extra newlines
        return formatted
            .split('\\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\\n');
    }

    formatPython(python) {
        // Basic Python formatting
        const lines = python.split('\\n');
        let indent = 0;
        const indentSize = 4;
        
        return lines.map(line => {
            const trimmed = line.trim();
            if (!trimmed) return '';
            
            if (trimmed.includes('def ') || trimmed.includes('class ') || trimmed.includes('if ') || 
                trimmed.includes('for ') || trimmed.includes('while ') || trimmed.includes('try:') ||
                trimmed.includes('except ') || trimmed.includes('else:')) {
                const indentedLine = ' '.repeat(indent) + trimmed;
                if (trimmed.endsWith(':')) {
                    indent += indentSize;
                }
                return indentedLine;
            }
            
            return ' '.repeat(indent) + trimmed;
        }).join('\\n');
    }

    isSelfClosingTag(tag) {
        const selfClosingTags = ['img', 'br', 'hr', 'input', 'meta', 'link'];
        const tagName = tag.replace(/<\\/?([^\\s>]+).*?>/g, '$1').toLowerCase();
        return selfClosingTags.includes(tagName) || tag.endsWith('/>');
    }

    showSnippetNotification(trigger, language) {
        const notification = document.createElement('div');
        notification.className = 'notification info snippet-notification';
        notification.innerHTML = `
            <strong>Snippet inserted:</strong> ${trigger} (${this.languages[language].name})
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #3b82f6;
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            z-index: 1000;
            font-size: 0.9rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
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

    // Console functionality
    toggleConsole() {
        const console = document.getElementById('console');
        if (console) {
            console.classList.toggle('hidden');
        }
    }

    clearConsole() {
        const consoleOutput = document.getElementById('consoleOutput');
        if (consoleOutput) {
            consoleOutput.innerHTML = '';
        }
    }

    logToConsole(message, type = 'log') {
        const consoleOutput = document.getElementById('consoleOutput');
        if (!consoleOutput) return;

        const logEntry = document.createElement('div');
        logEntry.className = `console-entry console-${type}`;
        logEntry.innerHTML = `
            <span class="console-timestamp">[${new Date().toLocaleTimeString()}]</span>
            <span class="console-message">${message}</span>
        `;

        consoleOutput.appendChild(logEntry);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    // Get language-specific help
    getLanguageHelp(language) {
        const help = {
            html: {
                title: 'HTML Help',
                shortcuts: [
                    'Tab after "div" → Insert div snippet',
                    'Tab after "link" → Insert link snippet',
                    'Tab after "img" → Insert image snippet',
                    'Ctrl+Shift+F → Format code'
                ],
                tips: [
                    'Use semantic HTML elements for better accessibility',
                    'Always include alt attributes for images',
                    'Use proper heading hierarchy (h1, h2, h3...)'
                ]
            },
            css: {
                title: 'CSS Help',
                shortcuts: [
                    'Tab after "flex" → Insert flexbox snippet',
                    'Tab after "grid" → Insert grid snippet',
                    'Tab after "center" → Insert centering snippet',
                    'Ctrl+Shift+F → Format code'
                ],
                tips: [
                    'Use CSS custom properties for consistent theming',
                    'Mobile-first responsive design approach',
                    'Use flexbox and grid for layouts'
                ]
            },
            javascript: {
                title: 'JavaScript Help',
                shortcuts: [
                    'Tab after "func" → Insert function snippet',
                    'Tab after "arrow" → Insert arrow function snippet',
                    'Tab after "class" → Insert class snippet',
                    'Ctrl+Shift+F → Format code'
                ],
                tips: [
                    'Use const and let instead of var',
                    'Prefer arrow functions for callbacks',
                    'Use async/await for asynchronous operations'
                ]
            },
            python: {
                title: 'Python Help',
                shortcuts: [
                    'Tab after "def" → Insert function snippet',
                    'Tab after "class" → Insert class snippet',
                    'Tab after "for" → Insert for loop snippet',
                    'Ctrl+Shift+F → Format code'
                ],
                tips: [
                    'Follow PEP 8 style guidelines',
                    'Use list comprehensions when appropriate',
                    'Handle exceptions with try/except blocks'
                ]
            }
        };

        return help[language] || { title: 'No help available', shortcuts: [], tips: [] };
    }
}

// Global functions for language support
function toggleConsole() {
    if (window.languageSupport) {
        window.languageSupport.toggleConsole();
    }
}

function clearConsole() {
    if (window.languageSupport) {
        window.languageSupport.clearConsole();
    }
}

// Initialize language support when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.languageSupport = new LanguageSupport();
});