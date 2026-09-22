/*=============== SHOW MENU ===============*/
const showMenu = (toggleId, navId) => {
   const toggle = document.getElementById(toggleId),
         nav = document.getElementById(navId)

   if(toggle && nav) {
      toggle.addEventListener('click', () => {
         // Add show-menu class to nav menu
         nav.classList.toggle('show-menu')
         // Add show-icon to show and hide the menu icon
         toggle.classList.toggle('show-icon')
      })
   }
}

showMenu('nav-toggle','nav-menu')

/*=============== DROPDOWN MENU DELAY ===============*/
// Add delay to dropdown menus on desktop to prevent premature closing
if (window.innerWidth >= 1118) {
   const dropdownItems = document.querySelectorAll('.dropdown__item');
   let closeTimeout;

   dropdownItems.forEach(item => {
      item.addEventListener('mouseenter', function() {
         // Clear any pending close timeout
         clearTimeout(closeTimeout);
         // Add active class for JavaScript-controlled opening
         this.classList.add('dropdown-active');
      });

      item.addEventListener('mouseleave', function() {
         const dropdownItem = this;
         // Set timeout to close after 500ms
         closeTimeout = setTimeout(() => {
            dropdownItem.classList.remove('dropdown-active');
         }, 500);
      });

      // Also handle mega menu hover to keep it open
      const megaMenu = item.querySelector('.dropdown__mega');
      if (megaMenu) {
         megaMenu.addEventListener('mouseenter', function() {
            clearTimeout(closeTimeout);
            item.classList.add('dropdown-active');
         });

         megaMenu.addEventListener('mouseleave', function() {
            closeTimeout = setTimeout(() => {
               item.classList.remove('dropdown-active');
            }, 500);
         });
      }

      // Handle regular dropdown menus
      const dropdownMenu = item.querySelector('.dropdown__menu');
      if (dropdownMenu) {
         dropdownMenu.addEventListener('mouseenter', function() {
            clearTimeout(closeTimeout);
            item.classList.add('dropdown-active');
         });

         dropdownMenu.addEventListener('mouseleave', function() {
            closeTimeout = setTimeout(() => {
               item.classList.remove('dropdown-active');
            }, 500);
         });
      }
   });
}
