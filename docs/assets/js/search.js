import { performSearch as searchLogic } from './search-logic.js';

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const tagFilters = document.getElementById('tag-filters');
    let searchIndex = [];
    let allTags = new Set();
    let selectedTags = new Set();

    // Fetch the search index
    fetch('/AwesomeAndDarkTactics/search.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Search index loaded:', data);
            searchIndex = data.index;
            
            // Collect all unique tags
            searchIndex.forEach(item => {
                if (item.tags) {
                    item.tags.forEach(tag => allTags.add(tag));
                }
            });
            
            // Populate tag filters
            populateTagFilters();
        })
        .catch(error => {
            console.error('Error loading search index:', error);
            searchResults.innerHTML = '<div class="no-results">Error loading search index. Please try again later.</div>';
        });

    // Populate tag filters
    function populateTagFilters() {
        tagFilters.innerHTML = '';
        // Sort tags alphabetically before creating elements
        Array.from(allTags).sort((a, b) => a.localeCompare(b)).forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.className = 'tag-filter';
            tagElement.textContent = tag;
            tagElement.addEventListener('click', () => toggleTag(tag));
            tagFilters.appendChild(tagElement);
        });
    }

    // Toggle tag selection
    function toggleTag(tag) {
        const tagElement = Array.from(tagFilters.children).find(el => el.textContent === tag);
        if (selectedTags.has(tag)) {
            selectedTags.delete(tag);
            tagElement.classList.remove('selected');
        } else {
            selectedTags.add(tag);
            tagElement.classList.add('selected');
        }
        performSearch();
    }

    // Handle search input
    searchInput.addEventListener('input', performSearch);

    function performSearch() {
        const query = searchInput.value;
        
        const results = searchLogic(query, selectedTags, searchIndex);

        console.log('Searching for:', query);
        console.log('Selected tags:', Array.from(selectedTags));
        console.log('Search results:', results);
        displayResults(results);
    }

    function displayResults(results) {
        searchResults.innerHTML = '';
        
        if (results.length === 0) {
            if ((searchInput.value.length >= 2 || selectedTags.size > 0)) {
                searchResults.innerHTML = '<div class="no-results">No results found</div>';
            } else {
                searchResults.style.display = 'none';
                return;
            }
        } else {
            // Group results by type
            const groupedResults = {
                category: results.filter(r => r.type === 'category'),
                tactic: results.filter(r => r.type === 'tactic')
            };

            // Display categories first
            if (groupedResults.category.length > 0) {
                const categorySection = document.createElement('div');
                categorySection.className = 'search-section';
                categorySection.innerHTML = '<h4>Categories</h4>';
                
                groupedResults.category.forEach(result => {
                    const resultElement = document.createElement('div');
                    resultElement.className = 'search-result-item category-item';
                    resultElement.innerHTML = `
                        <a href="${result.url}">
                            <h3>${result.title || 'Untitled'}</h3>
                            <div class="content">${result.content}</div>
                        </a>
                    `;
                    categorySection.appendChild(resultElement);
                });
                
                searchResults.appendChild(categorySection);
            }

            // Then display tactics
            if (groupedResults.tactic.length > 0) {
                const tacticSection = document.createElement('div');
                tacticSection.className = 'search-section';
                tacticSection.innerHTML = '<h4>Tactics</h4>';
                
                groupedResults.tactic.forEach(result => {
                    const resultElement = document.createElement('div');
                    resultElement.className = 'search-result-item tactic-item';
                    resultElement.innerHTML = `
                        <a href="${result.url}">
                            <h3>${result.title || 'Untitled'}</h3>
                            ${result.category ? `<span class="category">${result.category}</span>` : ''}
                            ${result.tags && result.tags.length ? `<div class="tags">${result.tags.join(', ')}</div>` : ''}
                        </a>
                    `;
                    tacticSection.appendChild(resultElement);
                });
                
                searchResults.appendChild(tacticSection);
            }
        }
        
        searchResults.style.display = 'block';
    }

    // Close search results when clicking outside
    document.addEventListener('click', function(event) {
        if (!searchInput.contains(event.target) && 
            !searchResults.contains(event.target) && 
            !tagFilters.contains(event.target)) {
            searchResults.style.display = 'none';
        }
    });
});