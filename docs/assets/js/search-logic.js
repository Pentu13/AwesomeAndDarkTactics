export function performSearch(query, selectedTags, searchIndex) {
    const lowerCaseQuery = query.toLowerCase();

    if (lowerCaseQuery.length < 2 && selectedTags.size === 0) {
        return [];
    }

    return searchIndex.filter(item => {
        // Text search
        const titleMatch = item.title && item.title.toLowerCase().includes(lowerCaseQuery);
        const contentMatch = item.content && item.content.toLowerCase().includes(lowerCaseQuery);
        const tagsMatch = item.tags && item.tags.some(tag => tag && tag.toLowerCase().includes(lowerCaseQuery));
        const textMatch = titleMatch || contentMatch || tagsMatch;

        // Tag filter
        const tagFilterMatch = selectedTags.size === 0 || 
            (item.tags && Array.from(selectedTags).every(tag => item.tags.includes(tag)));

        return textMatch && tagFilterMatch;
    });
} 