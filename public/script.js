document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const urlInput = document.getElementById('urlInput');
    const testBtn = document.getElementById('testBtn');
    const statusContainer = document.getElementById('statusContainer');
    const statusCode = document.getElementById('statusCode');
    const contentPreview = document.getElementById('contentPreview');
    const contentSnippet = document.getElementById('contentSnippet');
    const errorMessage = document.getElementById('errorMessage');
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    // Add function to check signature headers
    const checkSignatureBtn = document.getElementById('checkSignatureBtn');
    if (checkSignatureBtn) {
        checkSignatureBtn.addEventListener('click', checkSignatureHeaders);
    }

    // Add event listener to the test button
    testBtn.addEventListener('click', testConnection);

    // Add event listener for Enter key on the input field
    urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            testConnection();
        }
    });

    // Function to test the connection
    function testConnection() {
        const url = urlInput.value.trim();
        
        // Validate URL
        if (!url) {
            showError('Please enter a URL');
            return;
        }
        
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            showError('URL must start with http:// or https://');
            return;
        }
        
        // Show loading indicator and hide other elements
        loadingIndicator.classList.remove('hidden');
        statusContainer.classList.add('hidden');
        contentPreview.classList.add('hidden');
        errorMessage.classList.add('hidden');
        
        // Make the API request
        fetch('/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: url })
        })
        .then(response => {
            // Store the status code to display later
            const status = response.status;
            
            // Parse the JSON response
            return response.json().then(data => {
                return { status, data };
            });
        })
        .then(({ status, data }) => {
            // Hide loading indicator
            loadingIndicator.classList.add('hidden');
            
            // Display the status code
            statusContainer.classList.remove('hidden');
            statusCode.textContent = status;
            
            if (status >= 200 && status < 300) {
                // Success
                statusCode.className = 'status-code success';
                
                // Display content snippet if available
                if (data.data) {
                    contentPreview.classList.remove('hidden');
                    
                    // For HTML content, convert special characters to prevent rendering
                    let contentText = typeof data.data === 'string' 
                        ? data.data.replace(/</g, '&lt;').replace(/>/g, '&gt;')
                        : JSON.stringify(data.data, null, 2);
                    
                    // Limit the content to a reasonable size for preview
                    if (contentText.length > 1000) {
                        contentText = contentText.substring(0, 1000) + '...';
                    }
                    
                    contentSnippet.innerHTML = contentText;
                }
            } else {
                // Error
                statusCode.className = 'status-code error';
                
                if (data.error) {
                    showError(`Error: ${data.error}`);
                    if (data.details) {
                        errorMessage.textContent += `\nDetails: ${data.details}`;
                    }
                }
            }
        })
        .catch(error => {
            // Hide loading indicator and show error
            loadingIndicator.classList.add('hidden');
            showError(`Failed to connect to the API: ${error.message}`);
        });
    }
    
    // Helper function to display error messages
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }
    
    // Function to check signature headers
    function checkSignatureHeaders() {
        // Show loading indicator
        loadingIndicator.classList.remove('hidden');
        errorMessage.classList.add('hidden');
        contentPreview.classList.add('hidden');
        
        // Fetch the signature directory
        fetch('/.well-known/http-message-signatures-directory')
            .then(response => {
                // Get all headers
                const headers = {};
                for (const [key, value] of response.headers.entries()) {
                    headers[key] = value;
                }
                
                // Check if signature headers exist
                const signatureHeader = headers['signature'] || 'Not found';
                const signatureInputHeader = headers['signature-input'] || 'Not found';
                
                // Create header info display
                const headerInfo = {
                    'Headers Received': 'The following headers were received from the server:',
                    'Signature': signatureHeader,
                    'Signature-Input': signatureInputHeader,
                    'All Headers': headers
                };
                
                // Hide loading indicator
                loadingIndicator.classList.add('hidden');
                contentPreview.classList.remove('hidden');
                
                // Display headers in the content area
                contentSnippet.innerHTML = JSON.stringify(headerInfo, null, 2)
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
                
                // Update status
                statusContainer.classList.remove('hidden');
                statusCode.textContent = response.status;
                statusCode.className = 'status-code success';
                
                return response.json();
            })
            .catch(error => {
                // Hide loading indicator and show error
                loadingIndicator.classList.add('hidden');
                showError(`Failed to fetch signatures: ${error.message}`);
            });
    }
});
