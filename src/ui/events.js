// UI event bindings extracted from main.js for modularity
import { q } from '@/ui/query.js';
import { toggleTheme } from '@/ui/theme.js';
import { showModal as showAdvancedModal, setupModal as setupAdvancedModal } from '@/ui/advancedModal.js';

export default function bindEvents(app) {
    const generateBtn = q('#generate-btn');
    if (generateBtn) {
        generateBtn.onclick = () => app.generateText();
    }

    const resetBtn = q('#reset-btn');
    if (resetBtn) {
        resetBtn.onclick = () => app.resetToDefaults();
    }

    const clearBtn = q('#clear-output');
    if (clearBtn) {
        clearBtn.onclick = () => app.clearOutput();
    }

    const jsonToggleBtn = q('#toggle-json');
    if (jsonToggleBtn) {
        jsonToggleBtn.onclick = () => app.toggleJsonViewer();
    }

    const generatorSelect = q('#generator-select');
    if (generatorSelect) {
        generatorSelect.onchange = e => app.selectGenerator(e.target.value);
    }

    const advancedBtn = q('#advanced-btn');
    if (advancedBtn) advancedBtn.onclick = () => showAdvancedModal(app);

    const darkToggle = q('#dark-mode-toggle');
    if (darkToggle) darkToggle.onclick = toggleTheme;

    // Initialize advanced modal button handlers
    setupAdvancedModal(app);
}
