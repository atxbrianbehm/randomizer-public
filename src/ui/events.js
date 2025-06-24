// UI event bindings extracted from main.js for modularity
export default function bindEvents(app) {
    const generateBtn = document.getElementById('generate-btn');
    if (generateBtn) {
        generateBtn.onclick = () => app.generateText();
    }

    const clearBtn = document.getElementById('clear-output');
    if (clearBtn) {
        clearBtn.onclick = () => app.clearOutput();
    }

    const jsonToggleBtn = document.getElementById('toggle-json');
    if (jsonToggleBtn) {
        jsonToggleBtn.onclick = () => app.toggleJsonViewer();
    }

    const generatorSelect = document.getElementById('generator-select');
    if (generatorSelect) {
        generatorSelect.onchange = (e) => app.selectGenerator(e.target.value);
    }

    const advancedBtn = document.getElementById('advanced-btn');
    if (advancedBtn) {
        advancedBtn.onclick = () => app.showAdvancedModal();
    }

    const darkToggle = document.getElementById('dark-mode-toggle');
    if (darkToggle) {
        darkToggle.onclick = () => {
            const html = document.documentElement;
            const current = html.getAttribute('data-color-scheme') === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-color-scheme', current);
        };
    }

    // Initialize advanced modal button handlers
    app.setupAdvancedModal();
}
