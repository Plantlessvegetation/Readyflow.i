// This script powers the interactive price calculator on the Custom Development page,
// now adapted for both 'Develop a Website' and 'Edit Existing Code' functionalities.

document.addEventListener('DOMContentLoaded', () => {
    // --- MAIN SELECTION ELEMENTS ---
    const mainSelection = document.getElementById('main-selection');
    const developWebsiteSection = document.getElementById('develop-website-section');
    const editCodeSection = document.getElementById('edit-code-section');
    const selectOptionBtns = document.querySelectorAll('.select-option-btn');
    const backToSelectionBtns = document.querySelectorAll('.back-to-selection-btn');

    // --- DEVELOP A WEBSITE CALCULATOR ELEMENTS ---
    const developCalculatorForm = developWebsiteSection ? developWebsiteSection.querySelector('.calculator-form') : null;
    const techOptions = developWebsiteSection ? developWebsiteSection.querySelectorAll('[data-group="tech"] .option-box') : [];
    const typeOptions = developWebsiteSection ? developWebsiteSection.querySelectorAll('[data-group="type"] .option-box') : [];
    const integrationOptions = developWebsiteSection ? developWebsiteSection.querySelectorAll('[data-group="integrations"] .option-box') : [];
    const pageSlider = document.getElementById('page-slider');
    const pageCountDisplay = document.getElementById('page-count-display');
    const developPriceDisplay = document.getElementById('develop-estimated-price');
    const developPriceBarFill = document.getElementById('develop-price-bar-fill');
    const pagesSection = document.getElementById('pages-section');

    // --- EDIT EXISTING CODE CALCULATOR ELEMENTS ---
    const editCodeForm = editCodeSection ? editCodeSection.querySelector('.edit-code-form') : null;
    const editOptions = editCodeSection ? editCodeSection.querySelectorAll('.edit-options-grid .option-box') : [];
    const fileUploadInput = document.getElementById('code-upload-input');
    const fileUploadStatus = document.getElementById('file-upload-status');
    const editPriceDisplay = document.getElementById('edit-estimated-price');

    // --- PRICING CONFIGURATIONS ---
    const DEVELOP_PRICING = {
        tech: { html: 1999, react: 4999 },
        type: { 'landing-page': 500, 'full-website': 2000 },
        perPage: 999,
        integrations: { seo: 1499, ecommerce: 7999, cms: 3999 }
    };

    const EDIT_PRICING = {
        'name-location': 49,
        'text-block': 79,
        'product-add': 79,
        'pricing-table': 79,
        'social-link': 79,
        'google-maps': 79,
        'simple-video': 79,
        'favicon': 79,
        'whatsapp-button': 79,
        'color-scheme': 99,
        'font-update': 99,
        'popup-bar': 199,
        'quick-refresh': 129, // Any 3 basic edits
        'content-boost': 219, // Text Block + Image Gallery Update + Product/Service Addition
        'custom-updation': 299 // Social media link update, Text Block edit (100 words), 1 Product/Service Page integration, Font update (basic), Favicon update, Google Map embed update, Phone number/Email update, and up to 5 Image changes.
    };

    const MAX_DEVELOP_ESTIMATE = 50000; // Used for the visual price bar

    // --- STATE ---
    let developSelections = {
        tech: 'html',
        type: 'landing-page',
        pages: 1,
        integrations: []
    };

    let editSelections = {
        edits: [],
        uploadedFiles: []
    };

    // --- UTILITY FUNCTIONS ---
    function formatPrice(price) {
        return `₹${price.toLocaleString('en-IN')}`;
    }

    function showSection(sectionToShow) {
        mainSelection.classList.add('hidden');
        developWebsiteSection.classList.add('hidden');
        editCodeSection.classList.add('hidden');

        sectionToShow.classList.remove('hidden');
    }

    function resetDevelopForm() {
        // Reset selections to defaults
        developSelections = {
            tech: 'html',
            type: 'landing-page',
            pages: 1,
            integrations: []
        };

        // Reset UI
        techOptions.forEach(box => {
            if (box.dataset.value === 'html') box.classList.add('selected');
            else box.classList.remove('selected');
        });
        typeOptions.forEach(box => {
            if (box.dataset.value === 'landing-page') box.classList.add('selected');
            else box.classList.remove('selected');
        });
        integrationOptions.forEach(box => box.classList.remove('selected'));
        
        if (pageSlider) {
            pageSlider.value = 1;
            pageCountDisplay.textContent = 1;
            pagesSection.style.display = 'none'; // Hide by default
        }
        calculateDevelopPrice();
    }

    function resetEditForm() {
        editSelections = {
            edits: [],
            uploadedFiles: []
        };

        editOptions.forEach(box => box.classList.remove('selected'));
        if (fileUploadInput) fileUploadInput.value = '';
        if (fileUploadStatus) fileUploadStatus.textContent = 'No files chosen';
        calculateEditPrice();
    }


    // --- DEVELOP A WEBSITE LOGIC ---
    function calculateDevelopPrice() {
        let total = 0;
        total += DEVELOP_PRICING.tech[developSelections.tech] || 0;
        total += DEVELOP_PRICING.type[developSelections.type] || 0;
        
        if (developSelections.type === 'full-website') {
            total += (developSelections.pages - 1) * DEVELOP_PRICING.perPage;
        }

        developSelections.integrations.forEach(int => {
            total += DEVELOP_PRICING.integrations[int] || 0;
        });

        if (developPriceDisplay) developPriceDisplay.textContent = formatPrice(total);
        if (developPriceBarFill) {
            const barWidth = Math.min(100, (total / MAX_DEVELOP_ESTIMATE) * 100);
            developPriceBarFill.style.width = `${barWidth}%`;
        }
    }

    function handleDevelopOptionClick(options, key, isMultiSelect = false) {
        options.forEach(box => {
            box.addEventListener('click', () => {
                const value = box.dataset.value;
                if (isMultiSelect) {
                    box.classList.toggle('selected');
                    if (developSelections[key].includes(value)) {
                        developSelections[key] = developSelections[key].filter(item => item !== value);
                    } else {
                        developSelections[key].push(value);
                    }
                } else {
                    options.forEach(opt => opt.classList.remove('selected'));
                    box.classList.add('selected');
                    developSelections[key] = value;
                }

                if (key === 'type' && pagesSection) {
                    if (developSelections.type === 'full-website') {
                        pagesSection.style.display = 'block';
                        // Ensure pages selection is updated if type changes to full-website
                        developSelections.pages = parseInt(pageSlider.value, 10);
                    } else {
                        pagesSection.style.display = 'none';
                        developSelections.pages = 1; // Reset to 1 for landing pages
                    }
                }
                calculateDevelopPrice();
            });
        });
    }

    // --- EDIT EXISTING CODE LOGIC ---
    function calculateEditPrice() {
        let total = 0;
        editSelections.edits.forEach(edit => {
            total += EDIT_PRICING[edit] || 0;
        });
        if (editPriceDisplay) editPriceDisplay.textContent = formatPrice(total);
    }

    function handleEditOptionClick() {
        editOptions.forEach(box => {
            box.addEventListener('click', () => {
                const value = box.dataset.value;
                const isSelected = box.classList.contains('selected');
                
                // Handle bundles and ensure exclusivity
                if (['quick-refresh', 'content-boost', 'custom-updation'].includes(value)) {
                    // If a bundle is selected, deselect all other individual edits and other bundles
                    if (!isSelected) { // If clicking to select a bundle
                        editOptions.forEach(otherBox => {
                            if (otherBox !== box && otherBox.classList.contains('selected')) {
                                otherBox.classList.remove('selected');
                                editSelections.edits = editSelections.edits.filter(item => item !== otherBox.dataset.value);
                            }
                        });
                        editSelections.edits = [value]; // Only this bundle
                    } else { // If clicking to deselect the bundle
                        editSelections.edits = editSelections.edits.filter(item => item !== value);
                    }
                } else { // Individual edit clicked
                    // If an individual edit is selected, deselect any active bundles
                    if (!isSelected) { // If clicking to select an individual edit
                        editOptions.forEach(otherBox => {
                            if (['quick-refresh', 'content-boost', 'custom-updation'].includes(otherBox.dataset.value) && otherBox.classList.contains('selected')) {
                                otherBox.classList.remove('selected');
                                editSelections.edits = editSelections.edits.filter(item => item !== otherBox.dataset.value);
                            }
                        });
                        editSelections.edits.push(value);
                    } else { // If clicking to deselect an individual edit
                        editSelections.edits = editSelections.edits.filter(item => item !== value);
                    }
                }
                
                box.classList.toggle('selected');
                calculateEditPrice();
            });
        });
    }


    // --- EVENT LISTENERS ---

    // Main selection buttons
    selectOptionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const option = btn.dataset.option;
            if (option === 'develop') {
                showSection(developWebsiteSection);
                resetEditForm(); // Clear other form state
                calculateDevelopPrice(); // Re-calculate just in case
            } else if (option === 'edit') {
                showSection(editCodeSection);
                resetDevelopForm(); // Clear other form state
                calculateEditPrice(); // Re-calculate just in case
            }
        });
    });

    // Back to selection buttons
    backToSelectionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showSection(mainSelection);
            resetDevelopForm();
            resetEditForm();
        });
    });

    // Develop a Website listeners
    if (developCalculatorForm) {
        handleDevelopOptionClick(techOptions, 'tech');
        handleDevelopOptionClick(typeOptions, 'type');
        handleDevelopOptionClick(integrationOptions, 'integrations', true);

        if (pageSlider) {
            pageSlider.addEventListener('input', (e) => {
                developSelections.pages = parseInt(e.target.value, 10);
                pageCountDisplay.textContent = developSelections.pages;
                calculateDevelopPrice();
            });
        }
    }

    // Edit Existing Code listeners
    if (editCodeForm) {
        handleEditOptionClick();

        if (fileUploadInput) {
            fileUploadInput.addEventListener('change', () => {
                if (fileUploadInput.files.length > 0) {
                    fileUploadStatus.textContent = `${fileUploadInput.files.length} file(s) selected.`;
                    // In a real scenario, you might process or store these files for the next step.
                    // For now, just update the status text.
                    editSelections.uploadedFiles = Array.from(fileUploadInput.files).map(file => file.name);
                } else {
                    fileUploadStatus.textContent = 'No files chosen';
                    editSelections.uploadedFiles = [];
                }
            });
        }
    }

    // --- INITIALIZATION ---
    // Ensure only the main selection is visible on load
    if (mainSelection) {
        mainSelection.classList.remove('hidden');
        developWebsiteSection.classList.add('hidden');
        editCodeSection.classList.add('hidden');
    }
    
    // Initial calculation for the default selected options
    calculateDevelopPrice();
    calculateEditPrice(); // Ensures edit price is 0 initially
});