export function performSearch(query, selectedTags, searchIndex) {
    const lowerCaseQuery = query.toLowerCase();

    if (!lowerCaseQuery && selectedTags.size === 0) {
        return searchIndex;
    }

    return searchIndex.filter(item => {
        // Text search
        const inTitle = item.title && item.title.toLowerCase().includes(lowerCaseQuery);
        const inContent = item.content && item.content.toLowerCase().includes(lowerCaseQuery);
        const inTags = item.tags && item.tags.some(tag => tag && tag.toLowerCase().includes(lowerCaseQuery));
        const textMatch = !lowerCaseQuery || inTitle || inContent || inTags;

        // Tag filter
        const tagFilterMatch = selectedTags.size === 0 || 
            (item.tags && Array.from(selectedTags).every(tag => item.tags.includes(tag)));

        return textMatch && tagFilterMatch;
    });
} 