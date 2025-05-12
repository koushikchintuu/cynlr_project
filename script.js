document.addEventListener('DOMContentLoaded', () => {
    // Initialize all features
    initHoverLinkPreviews();
    init3DConfigurator();
    initGallery();
    initHoverMeButton();
});

// 1. Interactive Button
// (Already handled with CSS animations in styles.css)

// 2. Hover Link Previews
function initHoverLinkPreviews() {
    const hoverLinks = document.querySelectorAll('.hover-link');
    const previewContainer = document.querySelector('.preview-container');
    const previewContent = document.querySelector('.preview-content');

    // Preview content for each page
    const previewData = {
        'about.html': {
            type: 'text-image',
            title: 'About CynLr',
            content: 'Learn more about CynLr, a robotics company specializing in visual intelligence for robotic arms.',
            image: 'img1.webp'
        },
        'visual-intelligence.html': {
            type: 'text-video',
            title: 'Visual Intelligence',
            content: 'Our technology enables robots to recognize and manipulate objects with human-like dexterity.',
            video: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        },
        'object-aware.html': {
            type: 'text-gif',
            title: 'Object Awareness',
            content: 'CynLr robots can adapt to varying shapes, orientations, and weights of objects.',
            gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ3kweGs2OGhqMTRoNWJiM2ZkaXB6OWQ1dHM4bjh0bWtwaTM0OHg3bCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Ll2fajzk9DgaY/giphy.gif'
        },
        'micro-factories.html': {
            type: 'text-pdf',
            title: 'LEGO Blocks of Microfactories',
            content: 'Our vision is to simplify and standardize large, customized factory lines into modular components.',
            pdf: '#'
        }
    };

    hoverLinks.forEach(link => {
        link.addEventListener('mouseenter', (e) => {
            const target = link.getAttribute('data-target');
            const data = previewData[target];
            
            if (data) {
                // Create preview content based on type
                let previewHTML = `<h3>${data.title}</h3><p>${data.content}</p>`;
                
                switch (data.type) {
                    case 'text-image':
                        previewHTML += `<img src="${data.image}" alt="${data.title}" style="max-width:100%; margin-top:10px;">`;
                        break;
                    case 'text-video':
                        previewHTML += `<video width="100%" height="auto" autoplay muted loop style="margin-top:10px;"><source src="${data.video}" type="video/mp4"></video>`;
                        break;
                    case 'text-gif':
                        previewHTML += `<img src="${data.gif}" alt="${data.title}" style="max-width:100%; margin-top:10px;">`;
                        break;
                    case 'text-pdf':
                        previewHTML += `<div style="margin-top:10px; padding:10px; background:#f5f5f5; border-radius:5px;"><i>PDF Preview</i></div>`;
                        break;
                }
                
                previewContent.innerHTML = previewHTML;
                previewContainer.style.display = 'block';
                
                // Position preview near the link
                const rect = link.getBoundingClientRect();
                previewContainer.style.top = `${rect.bottom + 10}px`;
                previewContainer.style.left = `${rect.left}px`;
            }
        });

        link.addEventListener('mouseleave', () => {
            previewContainer.style.display = 'none';
        });

        // Open the link page when clicked
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-target');
            console.log("Navigating to:", target);
            // Navigate to the target page
            window.location.href = target;
        });
    });
}

// 3. 3D Configurator
function init3DConfigurator() {
    // Set up Three.js scene
    const container = document.getElementById('model-viewer');
    
    // Check if container exists (page might not have the 3D configurator)
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f1a45); // Deep blue background to match our theme
    
    // Camera - adjusted for better visibility on all environments
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5.0;  // Reduced from 9.0 to bring camera closer
    camera.position.y = 3.0;  // Reduced from 4.8 to lower camera position
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    
    // Controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.7;
    controls.minDistance = 3;
    controls.maxDistance = 10;
    controls.minPolarAngle = 0.2;
    controls.maxPolarAngle = Math.PI / 2;
    controls.target.set(0, 1.0, 0); // Set the orbit target to look at the center of the model
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Add a floor/ground plane
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x212121,
        roughness: 0.8,
        metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Load 3D model
    const loader = new THREE.GLTFLoader();
    let model;
    
    loader.load('robot_love.glb', (gltf) => {
        model = gltf.scene;
        scene.add(model);
        
        // Apply shadows to the model
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        // Center the model with fixed positioning that works on all environments
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        
        // Instead of subtracting the center, set the position explicitly
        model.position.set(-center.x, -center.y + 0.5, -center.z); // +0.5 to raise it slightly above ground
        
        // Scale model to fit in view - smaller scale to make it more visible
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.5 / maxDim; // Slightly smaller scale (3 → 2.5)
        model.scale.set(scale, scale, scale);
        
        // Set initial color
        updateModelColor(0xff5252);
    }, undefined, (error) => {
        console.error('An error occurred loading the 3D model:', error);
        
        // Create a fallback robot model if loading fails
        createFallbackRobotModel();
    });
    
    function createFallbackRobotModel() {
        // Create a simple robot-like shape as fallback
        const robotGroup = new THREE.Group();
        
        // Robot body
        const bodyGeometry = new THREE.BoxGeometry(1.5, 2, 1);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff5252 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1;
        body.castShadow = true;
        robotGroup.add(body);
        
        // Robot head
        const headGeometry = new THREE.SphereGeometry(0.7, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xff5252 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.7;
        head.castShadow = true;
        robotGroup.add(head);
        
        // Robot eyes
        const eyeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 0.5 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.25, 2.8, 0.6);
        robotGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.25, 2.8, 0.6);
        robotGroup.add(rightEye);
        
        // Robot arms
        const armGeometry = new THREE.BoxGeometry(0.3, 1.5, 0.3);
        const armMaterial = new THREE.MeshStandardMaterial({ color: 0xff5252 });
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-1, 1, 0);
        leftArm.castShadow = true;
        robotGroup.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(1, 1, 0);
        rightArm.castShadow = true;
        robotGroup.add(rightArm);
        
        // Robot legs
        const legGeometry = new THREE.BoxGeometry(0.4, 1.5, 0.4);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0xff5252 });
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.5, -0.5, 0);
        leftLeg.castShadow = true;
        robotGroup.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.5, -0.5, 0);
        rightLeg.castShadow = true;
        robotGroup.add(rightLeg);
        
        scene.add(robotGroup);
        model = robotGroup;
    }
    
    // Tab switching
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and tab contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to the clicked tab
            tab.classList.add('active');
            
            // Show the corresponding tab content
            const tabName = tab.getAttribute('data-tab');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
    
    // Color customization
    const colorButtons = document.querySelectorAll('.color-btn');
    
    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            colorButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to the clicked button
            button.classList.add('active');
            
            // Update the model color
            const color = parseInt(button.getAttribute('data-color'), 16);
            updateModelColor(color);
            
            // Update summary
            document.getElementById('selected-color').textContent = 
                button.querySelector('.color-name').textContent;
        });
    });
    
    function updateModelColor(color) {
        if (!model) return;
        
        model.traverse((child) => {
            if (child.isMesh && child.material) {
                // Skip updating certain parts (like wheels on a car)
                if (child.name && (child.name.includes('wheel') || child.name.includes('tire'))) {
                    return;
                }
                
                // Update the color
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => {
                        if (!mat.name || !mat.name.includes('glass')) {
                            mat.color.setHex(color);
                        }
                    });
                } else {
                    if (!child.material.name || !child.material.name.includes('glass')) {
                        child.material.color.setHex(color);
                    }
                }
            }
        });
    }
    
    // Accessories checkboxes
    const accessoryCheckboxes = document.querySelectorAll('input[name="accessory"]');
    
    accessoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateAccessorySummary);
    });
    
    function updateAccessorySummary() {
        const selectedAccessories = [];
        
        accessoryCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const label = checkbox.parentElement.textContent.trim();
                selectedAccessories.push(label);
            }
        });
        
        document.getElementById('selected-accessories').textContent = 
            selectedAccessories.length > 0 ? selectedAccessories.join(', ') : 'None';
    }
    
    // Features radio buttons
    const featureRadios = document.querySelectorAll('input[name="feature"]');
    
    featureRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                document.getElementById('selected-features').textContent = 
                    radio.parentElement.textContent.trim();
            }
        });
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    
    animate();
}

// 4. Gallery with Picture Flow
function initGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    if (!galleryItems.length) return;
    
    // Set up intersection observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        root: null, // viewport
        threshold: 0.2, // 20% of the item is visible
        rootMargin: '0px 0px -100px 0px' // triggers a bit before the item is in view
    });
    
    // Observe each gallery item
    galleryItems.forEach(item => {
        observer.observe(item);
    });
    
    // Add styling to image captions
    const imageCaptions = document.querySelectorAll('.image-caption');
    
    imageCaptions.forEach(caption => {
        caption.querySelector('h3').style.color = 'var(--cyan)';
        caption.querySelector('h3').style.marginBottom = '8px';
        caption.querySelector('p').style.fontSize = '0.9rem';
    });
    
    // Apply staggered delay to items for cascading effect on page load
    galleryItems.forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.15}s`;
    });
}

// Hover Me Button functionality
function initHoverMeButton() {
    const hoverMeButton = document.querySelector('.hover-me-button');
    const hoverLinks = document.querySelectorAll('.hover-link');
    
    if (!hoverMeButton) return;
    
    hoverMeButton.addEventListener('click', () => {
        // Add highlight animation to all hover links
        hoverLinks.forEach((link, index) => {
            // Add highlight class with staggered delay
            setTimeout(() => {
                link.classList.add('highlight-link');
                
                // Remove the class after animation completes
                setTimeout(() => {
                    link.classList.remove('highlight-link');
                }, 2000);
            }, index * 300);
        });
    });
} 