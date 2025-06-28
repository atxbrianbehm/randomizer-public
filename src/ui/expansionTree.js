import { q } from './query.js';
import { createVirtualTree } from './virtualTree.js';

const VIRTUALIZATION_THRESHOLD = 100; // Number of nodes to trigger virtualization

/**
 * Flattens a hierarchical segments array into a linear list, preserving order.
 * @param {Array<Object>} segments - The hierarchical segments array.
 * @returns {Array<Object>} A flattened array of segments.
 */
function flattenSegments(segments) {
    const flatList = [];
    segments.forEach(segment => {
        flatList.push(segment);
        if (segment.children && segment.children.length > 0) {
            flatList.push(...flattenSegments(segment.children));
        }
    });
    return flatList;
}

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
            toggleBtn.tabIndex = 0; // Make it focusable
            toggleBtn.setAttribute('role', 'button'); // Indicate it's a button
            toggleBtn.setAttribute('aria-label', `Toggle ${segment.key} children`); // Accessible label
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
 * @param {string} searchTerm - Optional search term to filter the tree.
 */
// Simple filter utility used by renderExpansionTree
export function filterSegments(segments, term = '') {
    if (!term) return segments;
    const lower = term.toLowerCase();
    return segments.filter(s =>
        s.key?.toLowerCase().includes(lower) || s.text?.toLowerCase().includes(lower)
    );
}

export function renderExpansionTree(segments, rawText, searchTerm = '') {
    const startTime = performance.now();
    const treeView = q('#expansion-tree-view');
    if (!treeView) return;

    treeView.innerHTML = ''; // Clear previous content

    if (!segments || segments.length === 0) {
        treeView.textContent = 'No segments to display.';
        return;
    }

    const filteredSegments = filterSegments(segments, searchTerm);

    if (filteredSegments.length === 0) {
        treeView.textContent = 'No matching segments found.';
        return;
    }

    // Determine if virtualization is needed
    const totalNodes = flattenSegments(filteredSegments).length; // Get total count of nodes

    if (totalNodes > VIRTUALIZATION_THRESHOLD) {
        // Use virtualization
        const flatData = flattenSegments(filteredSegments);
        const itemHeight = 20; // Approximate height of a single tree node

        createVirtualTree(treeView, flatData, itemHeight, (segment) => {
            const li = document.createElement('li');
            li.className = 'expansion-tree-node';
            const contentSpan = document.createElement('span');
            contentSpan.className = 'expansion-tree-content';
            contentSpan.innerHTML = `<span class="rule-key">${segment.key}</span>: <span class="rule-text">${segment.text}</span>`;
            li.appendChild(contentSpan);

            if (segment.startIndex !== undefined && segment.endIndex !== undefined) {
                li.dataset.startIndex = segment.startIndex;
                li.dataset.endIndex = segment.endIndex;
                li.dataset.segmentText = segment.text;

                contentSpan.addEventListener('mouseover', () => highlightText(segment.startIndex, segment.endIndex, rawText));
                contentSpan.addEventListener('mouseout', () => removeHighlight());
            }
            // Note: Collapsible toggles and nested children rendering are not directly supported
            // in this basic virtualization. A more advanced virtual tree would need to handle this.
            return li;
        });
    } else {
        // Use standard rendering
        const ul = document.createElement('ul');
        ul.className = 'expansion-tree-root';
        renderNodes(ul, filteredSegments, rawText);
        treeView.appendChild(ul);
    }

    const endTime = performance.now();
    console.log(`Expansion tree render time: ${endTime - startTime}ms`);
}
