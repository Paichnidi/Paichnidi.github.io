// Replace with your Netlify function URL
const NETLIFY_FUNCTION_URL = 'https://reaper-pirs.netlify.app/.netlify/functions/submit-report';

const OFFICERS = [
    {"name": "0-11 Reaper", "id": "1193393168247422989"},
    {"name": "0-10 Jax", "id": "1023303156676972554"},
    {"name": "0-10 Danny", "id": "1204222144834175016"},
    {"name": "0-8 Raptor", "id": "1282765927271895193"},
    {"name": "0-5 Dutch", "id": "718881205944189038"},
];

// Load officers into dropdown
function loadOfficers() {
    const select = document.getElementById('officerSelect');
    OFFICERS.forEach(officer => {
        const option = document.createElement('option');
        option.value = JSON.stringify({ id: officer.id, name: officer.name });
        option.textContent = officer.name;
        select.appendChild(option);
    });
}

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

// Set up form when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadOfficers();
    
    // Set default datetime to now
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('incidentDate').value = now.toISOString().slice(0, 16);
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
    
    try {
        // Create Discord embed
        const embed = {
            title: "═══ PERSONNEL INCIDENT REPORT ═══",
            color: 0x3282B8,
            timestamp: new Date().toISOString(),
            fields: [
                {
                    name: "═══ CLASSIFICATION ═══",
                    value: "```OFFICIAL USE ONLY```",
                    inline: false
                },
                {
                    name: "SUBJECT PERSONNEL",
                    value: `<@${officerData.id}> (${officerData.name})`,
                    inline: false
                },
                {
                    name: "INCIDENT DETAILS",
                    value: "```\n" +
                        `Type: ${misconductType === 'other' ? otherMisconductType : misconductType}\n` +
                        `Date: ${document.getElementById('incidentDate').value}\n` +
                        `Location: ${document.getElementById('location').value}\n` +
                        "```",
                    inline: false
                }
            ]
        };

        // Add optional fields
        const witnesses = document.getElementById('witnesses').value;
        if (witnesses) {
            embed.fields.push({
                name: "WITNESSES",
                value: `\`\`\`${witnesses}\`\`\``,
                inline: false
            });
        }

        embed.fields.push({
            name: "DETAILED REPORT",
            value: `\`\`\`${document.getElementById('complaint').value}\`\`\``,
            inline: false
        });

        const evidence = document.getElementById('evidence').value;
        if (evidence) {
            embed.fields.push({
                name: "SUPPORTING EVIDENCE",
                value: `\`\`\`${evidence}\`\`\``,
                inline: false
            });
        }

        const requestBody = {
            embed: embed
        };
        
        console.log('Sending request:', requestBody);

        const response = await fetch(NETLIFY_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            body: JSON.stringify(requestBody)
        });

        // Log the response
        console.log('Response status:', response.status);
        const responseData = await response.text();
        console.log('Response data:', responseData);

        if (response.ok) {
            alert('Report submitted successfully!');
            e.target.reset();
            // Reset datetime to current
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            document.getElementById('incidentDate').value = now.toISOString().slice(0, 16);
            // Reset officer select
            loadOfficers();
        } else {
            throw new Error(`Failed to submit report: ${responseData}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`Error submitting report: ${error.message}`);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Report';
    }
});
