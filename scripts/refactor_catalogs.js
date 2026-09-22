const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..');
const files = fs.readdirSync(dir);

const htmlFiles = files.filter(f => f.endsWith('.html') && f !== 'index.html');

for (const file of htmlFiles) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Replace the <style> block
  const styleStart = content.indexOf('<style>');
  const styleEnd = content.indexOf('</style>', styleStart) + 8;
  
  if (styleStart !== -1 && styleEnd !== -1 && (styleEnd - styleStart) > 100) {
    const styleBlock = content.substring(styleStart, styleEnd);
    // Ensure it's the right style block (checking for :root { --green-primary )
    if (styleBlock.includes('--green-primary')) {
       content = content.substring(0, styleStart) + '<link rel="stylesheet" href="catalog-common.css">' + content.substring(styleEnd);
    }
  }

  // 2. Replace the fetch script blocks with Promise.all
  // The old block looks like:
  /*
    <!-- Load Navbar Component -->
    <script>
        // Load navbar component after DOM is ready
        fetch('navbar.html')
            ...
    </script>

    <!-- Footer Placeholder -->
    <div id="footer-placeholder"></div>

    <!-- Load Footer Component -->
    <script>
        // Load footer component after DOM is ready
        fetch('footer.html')
            ...
    </script>
  */
  // We can just replace everything from "<!-- Load Navbar Component -->" to the end of the second script with the new logic.

  const navStart = content.indexOf('<!-- Load Navbar Component -->');
  const bodyEnd = content.lastIndexOf('</body>');
  
  if (navStart !== -1 && bodyEnd !== -1) {
    const newScripts = `<!-- Footer Placeholder -->
    <div id="footer-placeholder"></div>

    <!-- Load Components -->
    <script>
        Promise.all([
            fetch('navbar.html').then(r => r.text()),
            fetch('footer.html').then(r => r.text())
        ]).then(([navbarData, footerData]) => {
            const navbarPlaceholder = document.getElementById('navbar-placeholder');
            const footerPlaceholder = document.getElementById('footer-placeholder');
            
            if (navbarPlaceholder) navbarPlaceholder.innerHTML = navbarData;
            if (footerPlaceholder) footerPlaceholder.innerHTML = footerData;
            
            // Load navbar JavaScript AFTER HTML is injected
            const navScript = document.createElement('script');
            navScript.src = 'navbar.js';
            navScript.defer = true;
            navScript.onload = function() {
                document.body.classList.add('loaded');
            };
            navScript.onerror = function() {
                document.body.classList.add('loaded'); // Still show page even if nav fails
            };
            document.body.appendChild(navScript);
        }).catch(error => {
            console.error('Error loading components:', error);
            document.body.classList.add('loaded');
        });
    </script>
`;
    content = content.substring(0, navStart) + newScripts + content.substring(bodyEnd);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Refactored ' + file);
}
