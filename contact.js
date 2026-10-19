
const emailForm = document.querySelector('form[action^="mailto:"]');
const emailButton = emailForm?.querySelector('.email-button');

emailForm?.addEventListener('submit', function (event) {
    // Keep the browser's required-field validation.
    if (!emailForm.checkValidity()) {
        return;
    }

    // Let the mailto form attempt to open the email application.
    emailButton?.classList.add('is-sent');
});
