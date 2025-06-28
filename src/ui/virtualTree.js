// src/ui/virtualTree.js

/**
 * Creates a virtualized list within the given container.
 * @param {HTMLElement} container - The DOM element to render the virtualized list into.
 * @param {Array<Object>} data - The flat array of items to display.
 * @param {number} itemHeight - The estimated height of each item in pixels.
 * @param {Function} renderItem - A callback function (item, index) => HTMLElement that renders a single item.
 */
export function createVirtualTree(container, data, itemHeight, renderItem) {
    const totalHeight = data.length * itemHeight;
    container.style.height = `${container.clientHeight}px`; // Maintain current height
    container.style.overflowY = 'auto';
    container.style.position = 'relative';

    const spacer = document.createElement('div');
    spacer.style.height = `${totalHeight}px`;
    container.appendChild(spacer);

    const contentWrapper = document.createElement('div');
    contentWrapper.style.position = 'absolute';
    contentWrapper.style.top = '0';
    contentWrapper.style.left = '0';
    contentWrapper.style.right = '0';
    container.appendChild(contentWrapper);

    let lastScrollTop = 0;

    const renderVisibleItems = () => {
        const scrollTop = container.scrollTop;
        const visibleHeight = container.clientHeight;

        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(data.length, startIndex + Math.ceil(visibleHeight / itemHeight) + 5); // +5 for buffer

        contentWrapper.innerHTML = '';
        contentWrapper.style.transform = `translateY(${startIndex * itemHeight}px)`;

        for (let i = startIndex; i < endIndex; i++) {
            const itemElement = renderItem(data[i], i);
            contentWrapper.appendChild(itemElement);
        }
    };

    container.addEventListener('scroll', () => {
        // Basic scroll throttling
        if (Math.abs(container.scrollTop - lastScrollTop) > itemHeight / 2) {
            renderVisibleItems();
            lastScrollTop = container.scrollTop;
        }
    });

    // Initial render
    renderVisibleItems();

    // Re-render on resize (optional, but good for responsiveness)
    window.addEventListener('resize', renderVisibleItems);
}
