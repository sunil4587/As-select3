document.addEventListener('DOMContentLoaded', function() {
    if (typeof jQuery === 'undefined') {
        alert('Error: jQuery is not loaded! As-Select3 requires jQuery to function.');
        document.body.innerHTML = '<div class="container mt-5"><div class="alert alert-danger">Error: jQuery is not loaded! As-Select3 requires jQuery to function properly. Please check your internet connection or include jQuery manually.</div></div>' + document.body.innerHTML;
    }
    
    const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
    let bootstrapCssLoaded = false;
    
    for (const link of linkElements) {
        if (link.href.includes('bootstrap') && !link.href.includes('bootstrap-icons')) {
            bootstrapCssLoaded = true;
            break;
        }
    }
    
    if (!bootstrapCssLoaded) {
        alert('Warning: Bootstrap CSS is not loaded! Styling will be affected.');
        document.body.innerHTML = '<div style="margin-top: 20px; padding: 15px; color: #856404; background-color: #fff3cd; border: 1px solid #ffeeba; border-radius: 5px;">Warning: Bootstrap CSS is not loaded! Styling will be affected. Please check your internet connection or include Bootstrap CSS properly.</div>' + document.body.innerHTML;
    }
    
    let bootstrapIconsLoaded = false;
    
    for (const link of linkElements) {
        if (link.href.includes('bootstrap-icons')) {
            bootstrapIconsLoaded = true;
            break;
        }
    }
    
    if (!bootstrapIconsLoaded) {
        alert('Warning: Bootstrap Icons are not loaded! Icons may not display correctly.');
        document.body.innerHTML = '<div class="container mt-5"><div class="alert alert-warning">Warning: Bootstrap Icons are not loaded! Icons may not display correctly. Please check your internet connection or include Bootstrap Icons manually.</div></div>' + document.body.innerHTML;
    }
});

window.fetchStates = function(query) {
    return new Promise((resolve) => {
        setTimeout(() => {
            fetch('data/states.json')
                .then(response => response.json())
                .then(data => {
                    if (query && query.trim() !== '') {
                        const filteredData = data.filter(state => 
                            state.text.toLowerCase().includes(query.toLowerCase())
                        );
                        resolve(filteredData);
                    } else {
                        resolve(data);
                    }
                });
        }, 1000);
    });
};

$(document).ready(function() {
    if (typeof $.fn.asSelect3 === 'undefined') {
        alert('Error: As-Select3 is not loaded! Please check the file path.');
        document.body.innerHTML = '<div class="container mt-5"><div class="alert alert-danger">Error: As-Select3 is not loaded! Please check that the file path to as-select3.min.js is correct.</div></div>' + document.body.innerHTML;
        return;
    }
    
    $('#basic-select').asSelect3({
        placeholder: 'Choose an option...',
        searchable: true
    });

    $('#multi-select').asSelect3({
        placeholder: 'Choose options...',
        searchable: true,
        selectAll: true,
        clearAll: true
    });

    $('#preselected-select').asSelect3({
        searchable: true
    });                
    
    $('#icon-select').asSelect3({
        placeholder: 'Select a language...',
        searchable: true
    });
    
    $('#remote-select').asSelect3({
        placeholder: 'Select a state...',
        searchable: true,
        remote: function(query) {
            return fetchStates(query);
        },
        searchDelay: 500
    });
    
    $('#max-select').asSelect3({
        placeholder: 'Choose up to 3 options...',
        searchable: true,
        maxSelection: 3,
        selectAll: true,
        clearAll: true
    });
    
    $('#placeholder-select').asSelect3({
        placeholder: 'Search for a fruit...',
        searchable: true
    });
    
    $('#profile-demo-select').asSelect3({
        placeholder: 'Select team members',
        imageWidth: 36,
        imageHeight: 36,
        imageBorderRadius: '50%',
        imagePosition: 'left',
        searchable: true
    });
    

    $('#html-demo-select').asSelect3({
        allowHtml: true,
        placeholder: 'Choose a team member...',
        searchable: true
    });
    
    $('#template-demo-select').asSelect3({
        placeholder: 'Select products...',
        selectAll: true,
        clearAll: true,
        templateResult: function(data) {
            if (!data.id) return data.text;
            
            const products = {
                laptop: { image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=100&h=100&fit=crop', price: '$1,299' },
                phone: { image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&h=100&fit=crop', price: '$899' },
                tablet: { image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=100&h=100&fit=crop', price: '$649' },
                headphones: { image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop', price: '$299' }
            };
            
            const product = products[data.id];
            if (!product) return data.text;
            
            return `<div class="d-flex align-items-center">
                      <img src="${product.image}" alt="${data.text}" width="50" height="50" class="rounded me-2">
                      <div>
                        <div class="fw-semibold">${data.text}</div>
                        <small class="text-success">${product.price}</small>
                      </div>
                    </div>`;
        }
    });

    // Reinitialize Demo
    window.reinitializeDemoInstance = $('#reinitialize-demo-select').asSelect3({
        placeholder: 'Select a framework...',
        searchable: true
    })[0]._asSelect3;
});

// Global functions for reinitialize demo
window.addFrameworkOption = function() {
    const $select = $('#reinitialize-demo-select');
    const newFrameworks = [
        { value: 'nextjs', text: 'Next.js' },
        { value: 'nuxtjs', text: 'Nuxt.js' },
        { value: 'gatsby', text: 'Gatsby' },
        { value: 'remix', text: 'Remix' },
        { value: 'astro', text: 'Astro' }
    ];
    
    // Find a framework that isn't already in the list
    const existingValues = $select.find('option').map((i, opt) => opt.value).get();
    const newFramework = newFrameworks.find(fw => !existingValues.includes(fw.value));
    
    if (newFramework) {
        // Add new option to the original select element
        $select.append(`<option value="${newFramework.value}">${newFramework.text}</option>`);
        alert(`Added ${newFramework.text} to DOM! Now click "Reinitialize" to see it in the dropdown.`);
    } else {
        alert('All frameworks have been added!');
    }
};

window.reinitializeFramework = function() {
    if (window.reinitializeDemoInstance) {
        try {
            // Call the manual reinitialize method
            const newInstance = window.reinitializeDemoInstance.reinitializeFromDOM();
            
            // Update our global reference
            window.reinitializeDemoInstance = newInstance;
            
            alert('Framework dropdown reinitialized! New options are now visible.');
        } catch (error) {
            console.error('Error reinitializing:', error);
            alert('Error reinitializing dropdown');
        }
    } else {
        alert('Demo instance not found');
    }
};
