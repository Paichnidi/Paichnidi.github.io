const OFFICERS = [
    {"name": "O-11 Grim Reaper", "id": "1193393168247422989"},
    {"name": "O-10 Jax", "id": "1023303156676972554"},
    {"name": "O-10 Danny", "id": "1204222144834175016"},
    {"name": "O-10 German", "id": "1077077242468909177"},
    {"name": "O-9 Inky", "id": "864207724992659506"},
    {"name": "O-9 Charlie", "id": "1159909532839989350"},
    {"name": "O-8 Raptor", "id": "1282765927271895193"},
    {"name": "E-12 Dutch", "id": "718881205944189038"},
    {"name": "E-2 Ethan", "id": "1267667948844220479"},
    {"name": "E-1 FreakFinder", "id": "596814048956383239"},
    {"name": "E-0 Cold", "id": "1304557564511653973"},
    {"name": "E-0 Carson", "id": "1217266779676610732"},
    {"name": "E-0 Joseph", "id": "747170260800634891"},
    {"name": "E-0 Ryder", "id": "942476009230446603"}
];

function loadOfficers() {
    const select = document.getElementById('officerSelect');
    select.innerHTML = ''; // Clear previous options

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Select an Officer --';
    select.appendChild(defaultOption);

    console.log(OFFICERS);  // Debugging: Check if officer data is loaded

    OFFICERS.forEach(officer => {
        const option = document.createElement('option');
        option.value = JSON.stringify({ id: officer.id, name: officer.name });
        option.textContent = officer.name;
        select.appendChild(option);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    loadOfficers();  // Ensure officers are loaded after DOM is ready
    
    // Set default datetime to now
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('incidentDate').value = now.toISOString().slice(0, 16);
});

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

        // Send to Netlify function
        await fetch("/.netlify/functions/send-report", {
            method: 'POST',
            body: JSON.stringify({ embed })
        });
        
        alert("Report submitted successfully!");
    } catch (error) {
        console.error("Error:", error);
        alert("Error submitting report.");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Report';
    }
});
