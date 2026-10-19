```javascript
// Select all elements that should animate on scroll
const scrollElements = document.querySelectorAll(
    '.content-section, .feature-card, .page-header, .contact-section'
);

// Create an observer to detect when elements enter the screen
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {

            // Check if the element is visible
            if (entry.isIntersecting) {

                // Make the element visible
                entry.target.classList.add('show');

                // Stop observing after it appears
                observer.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.15
    }
);

// Start observing each element
scrollElements.forEach((element) => {
    element.classList.add('hidden');
    observer.observe(element);
});
```