// src/ui/expansionTree.js
import { q } from './query.js';

/**
 * Recursively renders the expansion tree nodes.
 * @param {HTMLElement} parentElement - The UL element to append nodes to.
 * @param {Array<Object>} segments - The array of segments to render.
 * @param {string} rawText - The raw generated text for highlighting.
 */
function renderNodes(parentElement, segments, rawText) {
    segments.forEach(segment => {
        const li = document.createElement('li');
        li.className = 'expansion-tree-node';
        const contentSpan = document.createElement('span');
        contentSpan.className = 'expansion-tree-content';
        contentSpan.innerHTML = `<span class="rule-key">${segment.key}</span>: <span class="rule-text">${segment.text}</span>`;
        li.appendChild(contentSpan);

        if (segment.startIndex !== undefined && segment.endIndex !== undefined) {
            li.dataset.startIndex = segment.startIndex;
            li.dataset.endIndex = segment.endIndex;
            li.dataset.segmentText = segment.text; // Store the segment text for easy access

            contentSpan.addEventListener('mouseover', () => highlightText(segment.startIndex, segment.endIndex, rawText));
            contentSpan.addEventListener('mouseout', () => removeHighlight());
        }

        if (segment.children && segment.children.length > 0) {
            li.classList.add('has-children');
            const toggleBtn = document.createElement('span');
            toggleBtn.className = 'tree-toggle';
            toggleBtn.textContent = '▼'; // Down arrow for expanded state
            li.insertBefore(toggleBtn, contentSpan);

            toggleBtn.addEventListener('click', () => {
                li.classList.toggle('collapsed');
                toggleBtn.textContent = li.classList.contains('collapsed') ? '▶' : '▼';
            });

            const ul = document.createElement('ul');
            ul.className = 'expansion-tree-children';
            renderNodes(ul, segment.children, rawText);
            li.appendChild(ul);
        }
        parentElement.appendChild(li);
    });
}

let originalOutputHtml = '';

function highlightText(startIndex, endIndex, rawText) {
    const outputArea = q('#output-area');
    if (!outputArea) return;

    // Store original HTML if not already stored
    if (!originalOutputHtml) {
        originalOutputHtml = outputArea.innerHTML;
    }

    // Assuming outputArea contains a single <p> tag with the raw text
    const pTag = outputArea.querySelector('p');
    if (!pTag) return;

    const textContent = pTag.textContent;
    const before = textContent.substring(0, startIndex);
    const highlighted = textContent.substring(startIndex, endIndex);
    const after = textContent.substring(endIndex);

    pTag.innerHTML = `${before}<span class="highlight">${highlighted}</span>${after}`;
}

function removeHighlight() {
    const outputArea = q('#output-area');
    if (outputArea && originalOutputHtml) {
        outputArea.innerHTML = originalOutputHtml;
        originalOutputHtml = ''; // Clear stored HTML
    }
}

/**
 * Renders the expansion tree into the debug overlay.
 * @param {Array<Object>} segments - The array of segments from generateDetailed.
 * @param {string} rawText - The raw generated text for highlighting.
 */
export function renderExpansionTree(segments, rawText) {
    const treeView = q('#expansion-tree-view');
    if (!treeView) return;

    treeView.innerHTML = ''; // Clear previous content

    if (!segments || segments.length === 0) {
        treeView.textContent = 'No segments to display.';
        return;
    }

    const ul = document.createElement('ul');
    ul.className = 'expansion-tree-root';
    renderNodes(ul, segments, rawText);
    treeView.appendChild(ul);
}
