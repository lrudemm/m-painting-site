// Get form and fields
const form = document.getElementById('inquiryForm');
const textInputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
const radioInputs = form.querySelectorAll('input[type="radio"]');
const selectInputs = form.querySelectorAll('select');
const textareas = form.querySelectorAll('textarea');
const successMessage = document.getElementById('successMessage');

// Validation rules and messages
const validationRules = {
    fullName: {
        minlength: 'Full name must be at least 2 characters',
        valueMissing: 'Full name is required'
    },
    email: {
        typeMismatch: 'Please enter a valid email address',
        valueMissing: 'Email is required'
    },
    phone: {
        patternMismatch: 'Phone format must be XXX-XXX-XXXX (e.g., 555-123-4567)',
        valueMissing: 'Phone number is required'
    },
    inquiryType: {
        valueMissing: 'Please select an inquiry type'
    },
    medium: {
        valueMissing: 'Please select a preferred medium'
    },
    estimatedSize: {
        patternMismatch: 'Please use format: WIDTHxHEIGHT (e.g., 24x36)',
    },
    message: {
        minlength: 'Message must be at least 10 characters',
        valueMissing: 'Message is required',
        tooShort: 'Message must be at least 10 characters'
    }
};

/**
 * Validate a single field in real-time
 * Reads validity flags and calls setCustomValidity() with tailored messages
 */
function validateField(field) {
    const errorDiv = document.getElementById(field.name + 'Error');
    const fieldRules = validationRules[field.name];
    
    // Clear previous custom message
    field.setCustomValidity('');
    
    // Check validity flags
    const validity = field.validity;
    let errorMessage = '';
    
    if (validity.valueMissing) {
        errorMessage = fieldRules?.valueMissing || 'This field is required';
    } else if (validity.typeMismatch) {
        errorMessage = fieldRules?.typeMismatch || `Please enter a valid ${field.type}`;
    } else if (validity.patternMismatch) {
        errorMessage = fieldRules?.patternMismatch || (field.title || 'Format is invalid');
    } else if (validity.tooShort) {
        errorMessage = fieldRules?.tooShort || fieldRules?.minlength || `Minimum length is ${field.minLength} characters`;
    } else if (validity.tooLong) {
        errorMessage = fieldRules?.maxlength || `Maximum length is ${field.maxLength} characters`;
    } else if (validity.rangeUnderflow) {
        errorMessage = fieldRules?.rangeUnderflow || 'Value is too low';
    } else if (validity.rangeOverflow) {
        errorMessage = fieldRules?.rangeOverflow || 'Value is too high';
    }
    
    // Set custom validity message (triggers :invalid pseudo-class)
    if (errorMessage) {
        field.setCustomValidity(errorMessage);
        errorDiv.textContent = errorMessage;
    } else {
        // Clear message when valid
        errorDiv.textContent = '';
    }
}

/**
 * Validate radio button group
 */
function validateRadioGroup(name) {
    const radioButtons = form.querySelectorAll(`input[name="${name}"]`);
    const errorDiv = document.getElementById(name + 'Error');
    const fieldRules = validationRules[name];
    
    const isChecked = Array.from(radioButtons).some(radio => radio.checked);
    
    if (!isChecked) {
        errorDiv.textContent = fieldRules?.valueMissing || 'Please select an option';
        radioButtons.forEach(radio => radio.setCustomValidity('Please select an option'));
    } else {
        errorDiv.textContent = '';
        radioButtons.forEach(radio => radio.setCustomValidity(''));
    }
}

/**
 * Add real-time validation listeners to all fields
 */
function attachValidationListeners() {
    // Text, email, and tel inputs
    textInputs.forEach(field => {
        field.addEventListener('input', (e) => {
            validateField(e.target);
        });
        
        field.addEventListener('blur', (e) => {
            validateField(e.target);
        });
    });
    
    // Select dropdowns
    selectInputs.forEach(field => {
        field.addEventListener('change', (e) => {
            validateField(e.target);
        });
        
        field.addEventListener('blur', (e) => {
            validateField(e.target);
        });
    });
    
    // Textareas
    textareas.forEach(field => {
        field.addEventListener('input', (e) => {
            validateField(e.target);
        });
        
        field.addEventListener('blur', (e) => {
            validateField(e.target);
        });
    });
    
    // Radio buttons
    radioInputs.forEach(radio => {
        radio.addEventListener('change', (e) => {
            validateRadioGroup(e.target.name);
        });
    });
}

/**
 * Handle form submission
 */
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Hide previous success message
    successMessage.classList.remove('show');
    successMessage.textContent = '';
    
    // Validate all text/email/tel inputs
    textInputs.forEach(field => validateField(field));
    
    // Validate all select inputs
    selectInputs.forEach(field => validateField(field));
    
    // Validate all textareas
    textareas.forEach(field => validateField(field));
    
    // Validate radio groups
    validateRadioGroup('inquiryType');
    
    // Use checkValidity() to check overall form state
    if (form.checkValidity() === false) {
        // Form is invalid - focus first invalid field
        const firstInvalid = form.querySelector('input:invalid, select:invalid, textarea:invalid');
        if (firstInvalid) {
            firstInvalid.focus();
        }
    } else {
        // Form is valid - show success message
        displaySuccessMessage();
        
        // In a real app, you would send data to server here
        console.log('Form is valid! Inquiry would be sent to Meghan.');
        console.log({
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            inquiryType: document.querySelector('input[name="inquiryType"]:checked').value,
            medium: document.getElementById('medium').value,
            estimatedSize: document.getElementById('estimatedSize').value || 'Not specified',
            message: document.getElementById('message').value
        });
    }
});

/**
 * Display success message
 */
function displaySuccessMessage() {
    const inquiryType = document.querySelector('input[name="inquiryType"]:checked').value;
    const typeLabel = inquiryType === 'commission' ? 'commission request' : 'inquiry';
    successMessage.textContent = `✓ Thank you! Your ${typeLabel} has been received. I'll get back to you soon via email or phone.`;
    successMessage.classList.add('show');
}

/**
 * Initialize validation listeners when page loads
 */
document.addEventListener('DOMContentLoaded', () => {
    attachValidationListeners();
});
