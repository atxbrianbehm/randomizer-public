// UI event bindings extracted from main.js for modularity
import { toggleTheme } from './theme.js';
import { showModal as showAdvancedModal, setupModal as setupAdvancedModal } from './advancedModal.js';

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
        generatorSelect.onchange = e => app.selectGenerator(e.target.value);
    }

    const advancedBtn = document.getElementById('advanced-btn');
    if (advancedBtn) advancedBtn.onclick = () => showAdvancedModal(app);

    const darkToggle = document.getElementById('dark-mode-toggle');
    if (darkToggle) darkToggle.onclick = toggleTheme;

    // Initialize advanced modal button handlers
    setupAdvancedModal(app);
}
