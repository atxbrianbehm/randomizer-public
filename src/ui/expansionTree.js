// src/ui/expansionTree.js
import { q } from './query.js';

/**
 * Recursively renders the expansion tree nodes.
 * @param {HTMLElement} parentElement - The UL element to append nodes to.
 * @param {Array<Object>} segments - The array of segments to render.
 */
function renderNodes(parentElement, segments) {
    segments.forEach(segment => {
        const li = document.createElement('li');
        li.className = 'expansion-tree-node';
        li.innerHTML = `<span class="rule-key">${segment.key}</span>: <span class="rule-text">${segment.text}</span>`;

        if (segment.children && segment.children.length > 0) {
            const ul = document.createElement('ul');
            ul.className = 'expansion-tree-children';
            renderNodes(ul, segment.children);
            li.appendChild(ul);
        }
        parentElement.appendChild(li);
    });
}

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
    renderNodes(ul, segments);
    treeView.appendChild(ul);
}
