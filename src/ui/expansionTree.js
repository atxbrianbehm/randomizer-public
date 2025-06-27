// src/ui/expansionTree.js
import { q } from './query.js';

/**
 * Renders the expansion tree into the debug overlay.
 * @param {Array<Object>} segments - The array of segments from generateDetailed.
 */
export function renderExpansionTree(segments) {
    const treeView = q('#expansion-tree-view');
    if (!treeView) return;

    treeView.innerHTML = ''; // Clear previous content

    if (!segments || segments.length === 0) {
        treeView.textContent = 'No segments to display.';
        return;
    }

    const ul = document.createElement('ul');
    ul.className = 'expansion-tree-root';

    segments.forEach(segment => {
        const li = document.createElement('li');
        li.className = 'expansion-tree-node';
        li.innerHTML = `<span class="rule-key">${segment.key}</span>: <span class="rule-text">${segment.text}</span>`;
        ul.appendChild(li);
    });

    treeView.appendChild(ul);
}
