// src/ui/expansionTree.js
import { q } from './query.js';

/**
 * Recursively filters segments based on a search term.
 * A segment is included if its key or text matches the search term, or if any of its children match.
 * @param {Array<Object>} segments - The array of segments to filter.
 * @param {string} searchTerm - The term to search for.
 * @returns {Array<Object>} The filtered array of segments.
 */
function filterSegments(segments, searchTerm) {
    if (!searchTerm) return segments; // If no search term, return all segments

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return segments.filter(segment => {
        const keyMatches = segment.key.toLowerCase().includes(lowerCaseSearchTerm);
        const textMatches = segment.text.toLowerCase().includes(lowerCaseSearchTerm);
        const childrenMatch = segment.children && filterSegments(segment.children, searchTerm).length > 0;

        return keyMatches || textMatches || childrenMatch;
    }).map(segment => {
        // If a parent matches, ensure its children are also filtered
        if (segment.children) {
            return { ...segment, children: filterSegments(segment.children, searchTerm) };
        }
        return segment;
    });
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

    const ul = document.createElement('ul');
    ul.className = 'expansion-tree-root';
    renderNodes(ul, filteredSegments, rawText);
    treeView.appendChild(ul);
    const endTime = performance.now();
    console.log(`Expansion tree render time: ${endTime - startTime}ms`);
}
