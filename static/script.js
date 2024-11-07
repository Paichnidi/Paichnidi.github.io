// Fetch officers when page loads
async function loadOfficers() {
    try {
        const response = await fetch('http://localhost:5000/get-officers');
        const officers = await response.json();
        
        const select = document.getElementById('officerSelect');
        officers.forEach(officer => {
            const option = document.createElement('option');
            option.value = JSON.stringify({ id: officer.id, name: officer.name });
            option.textContent = officer.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading officers:', error);
        alert('Error loading officers list');
    }
}

// Load officers when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Only call loadOfficers once
    loadOfficers();
    
    // Set default datetime to now
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('incidentDate').value = now.toISOString().slice(0, 16);
});

// Handle misconduct type selection
document.getElementById('misconductType').addEventListener('change', function() {
    const otherInput = document.getElementById('otherMisconductType');
    if (this.value === 'other') {
        otherInput.style.display = 'block';
        otherInput.required = true;
    } else {
        otherInput.style.display = 'none';
        otherInput.required = false;
    }
});

// Handle form submission
document.getElementById('complaintForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
    
    const officerData = JSON.parse(document.getElementById('officerSelect').value);
    const misconductType = document.getElementById('misconductType').value;
    const otherMisconductType = document.getElementById('otherMisconductType').value;
    
    const formData = {
        officerId: officerData.id,
        officerName: officerData.name,
        misconductType: misconductType === 'other' ? otherMisconductType : misconductType,
        incidentDate: document.getElementById('incidentDate').value,
        location: document.getElementById('location').value,
        witnesses: document.getElementById('witnesses').value,
        complaint: document.getElementById('complaint').value,
        evidence: document.getElementById('evidence').value
    };

    try {
        const response = await fetch('http://localhost:5000/submit-complaint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Complaint submitted successfully!');
            e.target.reset();
            // Reset datetime to current
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            document.getElementById('incidentDate').value = now.toISOString().slice(0, 16);
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to submit complaint');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`Error submitting complaint: ${error.message}`);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Complaint';
    }
}); 
