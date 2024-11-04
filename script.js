function generatePDF() {
    const element = document.getElementById('techRiderPreview');
    
    // Create PDF container with specific styling for PDF output
    const pdfContent = `
        <div style="
            width: 210mm;
            min-height: 297mm;
            background: white;
            position: relative;
            left: 42%;
        ">
            <style>
                @page {
                    size: A4;
                    margin: 0;
                }
                
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }

                .rider-content {
                    width: 170mm;
                    margin: 20mm auto;
                    text-align: center;
                    position: relative;
                }

                .header-section {
                    width: 100%;
                    text-align: center;
                    margin-bottom: 30px;
                }

                .header-section img {
                    max-width: 200px;
                    height: auto;
                    margin: 0 auto 20px;
                    display: block;
                }

                .header-section h1 {
                    font-size: 24px;
                    margin-bottom: 20px;
                    text-align: center;
                }

                .requirements-section,
                .stage-section,
                .notes-section {
                    width: 100%;
                    margin: 30px auto;
                    text-align: center;
                }

                h2 {
                    color: #4a5568;
                    margin: 15px 0;
                    padding-bottom: 5px;
                    border-bottom: 2px solid #4299e1;
                    text-align: center;
                }

                .requirements-section ul {
                    width: 80%;
                    margin: 15px auto;
                    text-align: left;
                    list-style-position: inside;
                }

                .requirements-section li {
                    margin-bottom: 10px;
                    line-height: 1.4;
                }

                canvas {
                    width: 80%;
                    max-width: 500px;
                    margin: 20px auto;
                    display: block;
                }

                .notes-section p {
                    width: 80%;
                    margin: 10px auto;
                    line-height: 1.6;
                    text-align: center;
                }

                .equipment-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin: 20px auto;
                }

                .equipment-card {
                    text-align: center;
                }

                .equipment-image {
                    max-width: 100%;
                    height: auto;
                    margin-bottom: 10px;
                }
            </style>
            ${element.innerHTML}
        </div>
    `;
    
    // Create container for PDF
    const pdfContainer = document.createElement('div');
    pdfContainer.innerHTML = pdfContent;
    document.body.appendChild(pdfContainer);
    
    // Add loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.style.position = 'fixed';
    loadingDiv.style.top = '50%';
    loadingDiv.style.left = '50%';
    loadingDiv.style.transform = 'translate(-50%, -50%)';
    loadingDiv.style.padding = '20px';
    loadingDiv.style.background = 'rgba(0,0,0,0.8)';
    loadingDiv.style.color = 'white';
    loadingDiv.style.borderRadius = '8px';
    loadingDiv.style.zIndex = '9999';
    loadingDiv.textContent = 'Generating PDF...';
    document.body.appendChild(loadingDiv);

    // Configure PDF options
    const opt = {
        margin: 0,
        filename: `${document.getElementById('artistName').value || 'dj'}-tech-rider.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: false,
            allowTaint: true,
            scrollY: 0,
            width: 794, // A4 width in pixels (210mm at 96 DPI)
            height: 1123, // A4 height in pixels (297mm at 96 DPI)
            windowWidth: 794,
            windowHeight: 1123
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            compress: true
        }
    };

    // Generate PDF
    html2pdf()
        .from(pdfContainer)
        .set(opt)
        .save()
        .then(() => {
            document.body.removeChild(loadingDiv);
            document.body.removeChild(pdfContainer);
        })
        .catch(error => {
            console.error('PDF generation error:', error);
            document.body.removeChild(loadingDiv);
            document.body.removeChild(pdfContainer);
            alert('Error generating PDF. Please try again.');
        });
}

// Function to update the preview
function updatePreview() {
    const artistName = document.getElementById('artistName').value;
    const notes = document.getElementById('notes').value;
    const logoPreview = document.getElementById('logoPreview').src;
    
    // Equipment image mapping
    const equipmentImages = {
        'cdj1': 'Media/cdj3000.png',
        'cdj2': 'Media/cdj2000nxs2.png',
        'mixer1': 'Media/djm900nxs2.png',
        'mon1': 'Media/monitors.png',
        // Add xone96 if needed
    };
    
    // Get checked equipment with images
    const equipment = [];
    document.querySelectorAll('.equipment-item input[type="checkbox"]').forEach(checkbox => {
        if (checkbox.checked) {
            equipment.push({
                text: checkbox.nextElementSibling.textContent,
                image: equipmentImages[checkbox.id]
            });
        }
    });

    // Create preview HTML
    const previewHTML = `
        <div class="rider-content">
            <div class="header-section">
                ${logoPreview ? `<img src="${logoPreview}" alt="Artist Logo">` : ''}
                <h1>${artistName || 'Artist/DJ Name'}</h1>
            </div>

            <div class="requirements-section">
                <h2>Technical Requirements</h2>
                <div class="equipment-grid">
                    ${equipment.map(item => `
                        <div class="equipment-card">
                            ${item.image ? `<img src="${item.image}" alt="${item.text}" class="equipment-image">` : ''}
                            <p>${item.text}</p>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="stage-section">
                <h2>Stage Setup</h2>
                <canvas id="pdfStageCanvas"></canvas>
            </div>

            ${notes ? `
                <div class="notes-section">
                    <h2>Additional Notes</h2>
                    <p>${notes}</p>
                </div>
            ` : ''}
        </div>
    `;

    // Update preview
    document.getElementById('techRiderPreview').innerHTML = previewHTML;

    // Copy stage canvas content if it exists
    const originalCanvas = document.getElementById('stageCanvas');
    const pdfCanvas = document.getElementById('pdfStageCanvas');
    if (originalCanvas && pdfCanvas) {
        pdfCanvas.width = originalCanvas.width;
        pdfCanvas.height = originalCanvas.height;
        const ctx = pdfCanvas.getContext('2d');
        ctx.drawImage(originalCanvas, 0, 0);
    }
}

// Add event listeners for real-time preview updates
document.addEventListener('DOMContentLoaded', function() {
    // Initial preview
    updatePreview();

    // Add event listeners to all inputs
    document.getElementById('artistName').addEventListener('input', updatePreview);
    document.getElementById('notes').addEventListener('input', updatePreview);
    
    // Add listeners to checkboxes
    document.querySelectorAll('.equipment-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', updatePreview);
    });

    // Logo upload handler
    document.getElementById('logoUpload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('logoPreview').src = e.target.result;
                updatePreview();
            };
            reader.readAsDataURL(file);
        }
    });
});