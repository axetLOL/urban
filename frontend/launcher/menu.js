// static://launcher/menu.js

// --- Menu Initialization ---
async function initializeMenu() {
    try {
        const result = await window.api.clearPlaybox('all');
        console.log(result.data?.message);
    } catch (err) {
        console.error('ClearPlaybox Error:', err);
    }

    const entries = [
        { name: "Game", config: "game.json", file: "game/index.html"},
        { name: "Credits", config: "credits.json", file: "credits/index.html"},
        { name: "Quit Game", config: null, file: null},
        { name: "Manual", config: "procmon.json", file: "procmon/index.html"}
    ];

    // --- DOM references
    const body = document.body;

    // --- Header
    const title = document.createElement("h1");
    title.textContent = "Electron Playbox";
    body.appendChild(title);

    // --- Entry List Container
    const list = document.createElement("div");
    list.id = "entry-list";
    body.appendChild(list);

    // --- Populate the list
    for (const g of entries) {
        const btn = document.createElement("button");
        btn.className = "entry-button";
        btn.textContent = g.name;
        btn.addEventListener("click", async () => {
            try {
                // Step 1: assemble playbox using config
                const result = await window.api.assemblePlaybox(g.config);
                if (!result?.data?.success) {
                    console.error("Assembly failed:", result?.data?.message);
                    createPopup(`Failed to assemble ${g.name}`);
                    return;
                }
                // Step 2: navigate to the entry file in the playbox
                const navResult = await window.api.navigate(`playbox/${g.file}`);
                if (!navResult?.data?.success) {
                    console.error("Navigation failed:", navResult?.data?.message);
                    createPopup(`Failed to navigate to ${g.name}`);
                }
            } catch (err) {
                console.error(err);
                createPopup("Unexpected error: " + err.message);
            }
        });
        list.appendChild(btn);
    }
}

function createPopup(message) {
    // Create the popup container
    const popup = document.createElement('div');
    popup.classList.add('popup');
    // Create the popup message
    const popupMessage = document.createElement('p');
    popupMessage.textContent = message;
    popup.appendChild(popupMessage);
    // Create the "OK" button
    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.classList.add('popup-btn');
    okButton.addEventListener('click', function () {
        popup.remove(); // Remove the popup when OK is clicked
    });
    popup.appendChild(okButton);
    // Append the popup to the body
    document.body.appendChild(popup);
}

// --- Initialize menu on page load ---
initializeMenu();
