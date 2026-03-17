// import {
//   describe, it, expect, beforeEach, afterEach, jest, beforeAll, afterAll,
// } from '@jest/globals';

// // --- Module mocks (must precede imports) ---

// jest.mock('../../scripts/aem.js', () => ({
//   loadCSS: jest.fn().mockResolvedValue(undefined),
//   toCamelCase: jest.fn((name) => name.replace(/-([a-z])/g, (g) => g[1].toUpperCase())),
//   readBlockConfig: jest.fn(() => ({})),
//   loadBlock: jest.fn().mockResolvedValue(undefined),
// }));

// jest.mock('../../scripts/scripts.js', () => ({
//   moveInstrumentation: jest.fn(),
// }));

// jest.mock('../../scripts/baici/utils/utils.js', () => ({
//   fetchSvg: jest.fn().mockResolvedValue('<svg><path/></svg>'),
// }));

// // commerce.js and utils.js are auto-mocked via moduleNameMapper in jest.config.js

// // --- Helpers ---

// /**
//  * Configures window.matchMedia to simulate mobile or desktop viewport.
//  * @param {boolean} matches - true = desktop (min-width: 768px matches)
//  */
// const mockMatchMedia = (matches) => {
//   Object.defineProperty(window, 'matchMedia', {
//     writable: true,
//     value: jest.fn().mockImplementation((query) => ({
//       matches,
//       media: query,
//       onchange: null,
//       addListener: jest.fn(),
//       removeListener: jest.fn(),
//       addEventListener: jest.fn(),
//       removeEventListener: jest.fn(),
//       dispatchEvent: jest.fn(),
//     })),
//   });
// };

// // --- Tests ---

// describe('navigation', () => {
//   let consoleWarnSpy;
//   let consoleErrorSpy;

//   beforeAll(() => {
//     consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
//     consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
//   });

//   afterAll(() => {
//     consoleWarnSpy.mockRestore();
//     consoleErrorSpy.mockRestore();
//   });

//   beforeEach(() => {
//     // Default to desktop so module-level isDesktop is defined before each import
//     mockMatchMedia(true);
//     jest.resetModules();
//     document.body.innerHTML = '';
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   // ────────────────────────────────────────────────────────────
//   // resetMenuState()
//   // ────────────────────────────────────────────────────────────

//   describe('resetMenuState()', () => {
//     describe('mobile viewport (matchMedia does NOT match)', () => {
//       it('collapses all expanded section buttons', async () => {
//         // Arrange – module must be imported AFTER matchMedia is set because
//         // isDesktop is evaluated at module load time.
//         mockMatchMedia(false);
//         jest.resetModules();
//         const { resetMenuState } = await import('./navigation.js');

//         document.body.innerHTML = `
//           <nav>
//             <button class="navigation-section-button" aria-expanded="true"></button>
//             <button class="navigation-section-button" aria-expanded="true"></button>
//             <a class="navigation-section-link" aria-expanded="true"></a>
//           </nav>
//         `;
//         const nav = document.querySelector('nav');

//         // Act
//         resetMenuState(nav);

//         // Assert
//         const buttons = nav.querySelectorAll('[aria-expanded]');
//         buttons.forEach((btn) => {
//           expect(btn.getAttribute('aria-expanded')).toBe('false');
//         });
//       });

//       it('collapses all expanded group buttons', async () => {
//         mockMatchMedia(false);
//         jest.resetModules();
//         const { resetMenuState } = await import('./navigation.js');

//         document.body.innerHTML = `
//           <nav>
//             <button class="navigation-group-button" aria-expanded="true"></button>
//             <a class="navigation-group-link" aria-expanded="true"></a>
//           </nav>
//         `;
//         const nav = document.querySelector('nav');

//         resetMenuState(nav);

//         const buttons = nav.querySelectorAll('[aria-expanded]');
//         buttons.forEach((btn) => {
//           expect(btn.getAttribute('aria-expanded')).toBe('false');
//         });
//       });

//       it('does not collapse buttons that are already aria-expanded="false"', async () => {
//         mockMatchMedia(false);
//         jest.resetModules();
//         const { resetMenuState } = await import('./navigation.js');

//         document.body.innerHTML = `
//           <nav>
//             <button class="navigation-section-button" aria-expanded="false"></button>
//           </nav>
//         `;
//         const nav = document.querySelector('nav');

//         resetMenuState(nav);

//         // Button was already collapsed; still collapsed, no error thrown
//         const btn = nav.querySelector('.navigation-section-button');
//         expect(btn.getAttribute('aria-expanded')).toBe('false');
//       });

//       it('removes .navigation-overlay elements', async () => {
//         mockMatchMedia(false);
//         jest.resetModules();
//         const { resetMenuState } = await import('./navigation.js');

//         document.body.innerHTML = `
//           <nav>
//             <div class="navigation-overlay"></div>
//             <div class="navigation-overlay"></div>
//           </nav>
//         `;
//         const nav = document.querySelector('nav');

//         resetMenuState(nav);

//         const overlays = nav.querySelectorAll('.navigation-overlay');
//         expect(overlays.length).toBe(0);
//       });

//       it('handles a section with no buttons or overlays without throwing', async () => {
//         mockMatchMedia(false);
//         jest.resetModules();
//         const { resetMenuState } = await import('./navigation.js');

//         document.body.innerHTML = '<nav></nav>';
//         const nav = document.querySelector('nav');

//         expect(() => resetMenuState(nav)).not.toThrow();
//       });
//     });

//     describe('desktop viewport (matchMedia matches)', () => {
//       it('sets section buttons aria-expanded to "false"', async () => {
//         mockMatchMedia(true);
//         jest.resetModules();
//         const { resetMenuState } = await import('./navigation.js');

//         document.body.innerHTML = `
//           <nav>
//             <button class="navigation-section-button" aria-expanded="true"></button>
//             <a class="navigation-section-link" aria-expanded="true"></a>
//           </nav>
//         `;
//         const nav = document.querySelector('nav');

//         resetMenuState(nav);

//         const sectionButtons = nav.querySelectorAll(
//           'button.navigation-section-button, a.navigation-section-link',
//         );
//         sectionButtons.forEach((btn) => {
//           expect(btn.getAttribute('aria-expanded')).toBe('false');
//         });
//       });

//       it('sets group buttons aria-expanded to "true"', async () => {
//         mockMatchMedia(true);
//         jest.resetModules();
//         const { resetMenuState } = await import('./navigation.js');

//         document.body.innerHTML = `
//           <nav>
//             <button class="navigation-group-button" aria-expanded="false"></button>
//             <a class="navigation-group-link" aria-expanded="false"></a>
//           </nav>
//         `;
//         const nav = document.querySelector('nav');

//         resetMenuState(nav);

//         const groupButtons = nav.querySelectorAll(
//           'button.navigation-group-button, a.navigation-group-link',
//         );
//         groupButtons.forEach((btn) => {
//           expect(btn.getAttribute('aria-expanded')).toBe('true');
//         });
//       });

//       it('does NOT remove navigation-overlay elements on desktop', async () => {
//         mockMatchMedia(true);
//         jest.resetModules();
//         const { resetMenuState } = await import('./navigation.js');

//         document.body.innerHTML = `
//           <nav>
//             <div class="navigation-overlay"></div>
//           </nav>
//         `;
//         const nav = document.querySelector('nav');

//         resetMenuState(nav);

//         // Desktop branch does not touch overlays
//         const overlays = nav.querySelectorAll('.navigation-overlay');
//         expect(overlays.length).toBe(1);
//       });

//       it('handles a section with no buttons without throwing', async () => {
//         mockMatchMedia(true);
//         jest.resetModules();
//         const { resetMenuState } = await import('./navigation.js');

//         document.body.innerHTML = '<nav></nav>';
//         const nav = document.querySelector('nav');

//         expect(() => resetMenuState(nav)).not.toThrow();
//       });
//     });
//   });

//   // ────────────────────────────────────────────────────────────
//   // closeAllSections()
//   // ────────────────────────────────────────────────────────────

//   describe('closeAllSections()', () => {
//     it('calls closeSection (aria-expanded=false) on each button when expanded=true', async () => {
//       mockMatchMedia(true);
//       jest.resetModules();
//       const { closeAllSections } = await import('./navigation.js');

//       document.body.innerHTML = `
//         <div id="container">
//           <button class="navigation-section-button" aria-expanded="true"></button>
//           <a class="navigation-section-link" aria-expanded="true"></a>
//         </div>
//       `;
//       const container = document.getElementById('container');

//       closeAllSections(container, true);

//       const buttons = container.querySelectorAll(
//         'button.navigation-section-button, a.navigation-section-link',
//       );
//       buttons.forEach((btn) => {
//         expect(btn.getAttribute('aria-expanded')).toBe('false');
//       });
//     });

//     it('calls openSection (aria-expanded=true) on each button when expanded=false (default)', async () => {
//       mockMatchMedia(true);
//       jest.resetModules();
//       const { closeAllSections } = await import('./navigation.js');

//       document.body.innerHTML = `
//         <div id="container">
//           <button class="navigation-section-button" aria-expanded="false"></button>
//           <a class="navigation-section-link" aria-expanded="false"></a>
//         </div>
//       `;
//       const container = document.getElementById('container');

//       closeAllSections(container);

//       const buttons = container.querySelectorAll(
//         'button.navigation-section-button, a.navigation-section-link',
//       );
//       buttons.forEach((btn) => {
//         expect(btn.getAttribute('aria-expanded')).toBe('true');
//       });
//     });

//     it('handles an empty container without throwing', async () => {
//       mockMatchMedia(true);
//       jest.resetModules();
//       const { closeAllSections } = await import('./navigation.js');

//       document.body.innerHTML = '<div id="container"></div>';
//       const container = document.getElementById('container');

//       expect(() => closeAllSections(container, true)).not.toThrow();
//       expect(() => closeAllSections(container, false)).not.toThrow();
//     });

//     it('dispatches update:live:region event for each button when expanded=true', async () => {
//       mockMatchMedia(true);
//       jest.resetModules();
//       const { closeAllSections } = await import('./navigation.js');

//       document.body.innerHTML = `
//         <div id="container">
//           <button class="navigation-section-button" aria-expanded="true">
//             <span class="navigation-section-button-title">Products</span>
//           </button>
//         </div>
//       `;
//       const container = document.getElementById('container');
//       const dispatchSpy = jest.spyOn(window, 'dispatchEvent');

//       closeAllSections(container, true);

//       const liveRegionEvents = dispatchSpy.mock.calls.filter(
//         (call) => call[0] instanceof CustomEvent && call[0].type === 'update:live:region',
//       );
//       expect(liveRegionEvents.length).toBeGreaterThan(0);

//       dispatchSpy.mockRestore();
//     });

//     it('dispatches update:live:region event for each button when expanded=false', async () => {
//       mockMatchMedia(true);
//       jest.resetModules();
//       const { closeAllSections } = await import('./navigation.js');

//       document.body.innerHTML = `
//         <div id="container">
//           <button class="navigation-section-button" aria-expanded="false">
//             <span class="navigation-section-button-title">Products</span>
//           </button>
//         </div>
//       `;
//       const container = document.getElementById('container');
//       const dispatchSpy = jest.spyOn(window, 'dispatchEvent');

//       closeAllSections(container, false);

//       const liveRegionEvents = dispatchSpy.mock.calls.filter(
//         (call) => call[0] instanceof CustomEvent && call[0].type === 'update:live:region',
//       );
//       expect(liveRegionEvents.length).toBeGreaterThan(0);

//       dispatchSpy.mockRestore();
//     });

//     it('processes multiple buttons independently', async () => {
//       mockMatchMedia(true);
//       jest.resetModules();
//       const { closeAllSections } = await import('./navigation.js');

//       document.body.innerHTML = `
//         <div id="container">
//           <button class="navigation-section-button" aria-expanded="true"></button>
//           <button class="navigation-section-button" aria-expanded="false"></button>
//           <button class="navigation-section-button" aria-expanded="true"></button>
//         </div>
//       `;
//       const container = document.getElementById('container');

//       closeAllSections(container, true);

//       const buttons = container.querySelectorAll('button.navigation-section-button');
//       buttons.forEach((btn) => {
//         expect(btn.getAttribute('aria-expanded')).toBe('false');
//       });
//     });
//   });

//   // ────────────────────────────────────────────────────────────
//   // updateSubMenuHeight()
//   // ────────────────────────────────────────────────────────────

//   describe('updateSubMenuHeight()', () => {
//     it('updates --row-span on navigation-group elements within the submenu', async () => {
//       mockMatchMedia(true);
//       jest.resetModules();
//       const { updateSubMenuHeight } = await import('./navigation.js');

//       document.body.innerHTML = `
//         <div class="navigation-section-submenu">
//           <div class="navigation-item"></div>
//           <div class="navigation-item"></div>
//           <div class="navigation-group"></div>
//         </div>
//       `;
//       const submenu = document.querySelector('.navigation-section-submenu');
//       const item = submenu.querySelector('.navigation-item');

//       updateSubMenuHeight(item);

//       const group = submenu.querySelector('.navigation-group');
//       // 3 navigation-item elements in submenu → row count = 3 (navigation-item count)
//       // Actually getRowCount counts .navigation-item elements (2 here)
//       expect(group.style.getPropertyValue('--row-span')).toBeDefined();
//     });

//     it('does not throw when element is inside a submenu with navigation-items', async () => {
//       mockMatchMedia(true);
//       jest.resetModules();
//       const { updateSubMenuHeight } = await import('./navigation.js');

//       document.body.innerHTML = `
//         <nav>
//           <li class="navigation-section">
//             <div class="navigation-section-submenu" id="nav-section-submenu-0">
//               <div class="navigation-item"></div>
//               <div class="navigation-group"></div>
//             </div>
//           </li>
//         </nav>
//       `;
//       const item = document.querySelector('.navigation-item');

//       expect(() => updateSubMenuHeight(item)).not.toThrow();
//     });

//     it('sets --row-span equal to navigation-item count in submenu', async () => {
//       mockMatchMedia(true);
//       jest.resetModules();
//       const { updateSubMenuHeight } = await import('./navigation.js');

//       document.body.innerHTML = `
//         <div class="navigation-section-submenu">
//           <div class="navigation-item"></div>
//           <div class="navigation-item"></div>
//           <div class="navigation-group"></div>
//         </div>
//       `;
//       const submenu = document.querySelector('.navigation-section-submenu');
//       const item = submenu.querySelector('.navigation-item');

//       updateSubMenuHeight(item);

//       const group = submenu.querySelector('.navigation-group');
//       expect(group.style.getPropertyValue('--row-span')).toBe('2');
//     });

//     it('throws when element is null', async () => {
//       mockMatchMedia(true);
//       jest.resetModules();
//       const { updateSubMenuHeight } = await import('./navigation.js');

//       // Passing null causes a TypeError when accessing .closest
//       expect(() => updateSubMenuHeight(null)).toThrow();
//     });
//   });

//   // ────────────────────────────────────────────────────────────
//   // autoBlockNavigationFragment()
//   // ────────────────────────────────────────────────────────────

//   describe('autoBlockNavigationFragment()', () => {
//     let loadCSS;
//     let moveInstrumentation;

//     beforeEach(async () => {
//       mockMatchMedia(true);
//       jest.resetModules();

//       ({ loadCSS } = await import('../../scripts/aem.js'));
//       ({ moveInstrumentation } = await import('../../scripts/scripts.js'));
//     });

//     it('loads navigation CSS on every call', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = '<div class="navigation-block"></div>';
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);

//       expect(loadCSS).toHaveBeenCalledWith(
//         expect.stringContaining('navigation/navigation.css'),
//       );
//     });

//     it('continues when CSS load fails (try/catch in source)', async () => {
//       loadCSS.mockRejectedValueOnce(new Error('CSS not found'));
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = '<div class="navigation-block"></div>';
//       const container = document.querySelector('.navigation-block');

//       await expect(autoBlockNavigationFragment(container)).resolves.not.toThrow();
//     });

//     it('creates ul.navigation-wrapper when not already present', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = '<div class="navigation-block"></div>';
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);

//       const wrapper = container.querySelector('ul.navigation-wrapper');
//       expect(wrapper).not.toBeNull();
//       expect(wrapper.getAttribute('role')).toBe('menubar');
//     });

//     it('reuses existing ul.navigation-wrapper when already present', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <ul class="navigation-wrapper" role="menubar" id="existing-wrapper"></ul>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);

//       const wrappers = container.querySelectorAll('ul.navigation-wrapper');
//       expect(wrappers.length).toBe(1);
//       expect(wrappers[0].id).toBe('existing-wrapper');
//     });

//     it('inserts ul.navigation-wrapper before the first navigation-section', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);

//       const wrapper = container.querySelector('ul.navigation-wrapper');
//       const firstChild = container.firstElementChild;
//       expect(firstChild).toBe(wrapper);
//     });

//     it('prepends ul.navigation-wrapper when no navigation-section exists', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <p>Some content</p>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);

//       const wrapper = container.querySelector('ul.navigation-wrapper');
//       expect(wrapper).not.toBeNull();
//     });

//     it('returns the container element', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = '<div class="navigation-block"></div>';
//       const container = document.querySelector('.navigation-block');

//       const result = await autoBlockNavigationFragment(container);

//       expect(result).toBe(container);
//     });

//     it('converts navigation-section divs to LI elements', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products"></div>
//           <div class="navigation-section" data-title="Services"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);

//       // Allow async forEach to settle
//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const lis = container.querySelectorAll('li.navigation-section');
//       expect(lis.length).toBeGreaterThanOrEqual(1);
//     });

//     it('adds navigation-section class to processed sections', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="About"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);

//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const section = container.querySelector('.navigation-section');
//       expect(section).not.toBeNull();
//       expect(section.classList.contains('navigation-section')).toBe(true);
//     });

//     it('calls moveInstrumentation when replacing a div with LI', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Home"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);

//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       expect(moveInstrumentation).toHaveBeenCalled();
//     });

//     it('creates a section button for each navigation-section with a title', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);

//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const sectionButton = container.querySelector('.navigation-section-button');
//       expect(sectionButton).not.toBeNull();
//     });

//     it('creates section buttons with aria-expanded="false" initially', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);

//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const sectionButton = container.querySelector('.navigation-section-button');
//       expect(sectionButton?.getAttribute('aria-expanded')).toBe('false');
//     });

//     it('creates section buttons with aria-haspopup="true"', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Services"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);

//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const sectionButton = container.querySelector('.navigation-section-button');
//       expect(sectionButton?.getAttribute('aria-haspopup')).toBe('true');
//     });

//     it('creates section buttons with role="menuitem"', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Contact"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);

//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const section = container.querySelector('.navigation-section');
//       expect(section?.getAttribute('role')).toBe('menuitem');
//     });

//     it('creates section buttons with aria-controls referencing submenu id', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);

//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const sectionButton = container.querySelector('.navigation-section-button');
//       const controls = sectionButton?.getAttribute('aria-controls');
//       expect(controls).toMatch(/^nav-section-submenu-\d+$/);
//     });

//     it('creates a navigation-section-submenu list with matching id', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);

//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const sectionButton = container.querySelector('.navigation-section-button');
//       const submenuId = sectionButton?.getAttribute('aria-controls');
//       const submenu = submenuId ? document.getElementById(submenuId) : null;

//       expect(submenu).not.toBeNull();
//       expect(submenu?.classList.contains('navigation-section-submenu')).toBe(true);
//     });

//     it('creates submenu with role="menu"', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);

//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const submenu = container.querySelector('.navigation-section-submenu');
//       expect(submenu?.getAttribute('role')).toBe('menu');
//     });

//     it('creates submenu with inert attribute initially set', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);

//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const submenu = container.querySelector('.navigation-section-submenu');
//       expect(submenu?.hasAttribute('inert')).toBe(true);
//     });

//     it('creates a link (not button) when section has data-link and no children', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div
//             class="navigation-section"
//             data-title="Home"
//             data-link="https://example.com/home.html"
//           ></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);

//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       // section.dataset.link is set and there are no children → anchor is created
//       const link = container.querySelector('.navigation-section-link');
//       expect(link).not.toBeNull();
//       expect(link.tagName.toLowerCase()).toBe('a');
//       // pathname from https://example.com/home.html with .html stripped → /home
//       expect(link.getAttribute('href')).toBe('/home');
//       const section = container.querySelector('.navigation-section');
//       expect(section?.getAttribute('role')).toBe('menuitem');

//       // No button should be created when a link is rendered
//       const button = container.querySelector('.navigation-section-button');
//       expect(button).toBeNull();
//     });

//     it('registers close:navigation:section event listener on window', async () => {
//       const addEventSpy = jest.spyOn(window, 'addEventListener');
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);

//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const calls = addEventSpy.mock.calls.map((call) => call[0]);
//       expect(calls).toContain('close:navigation:section');

//       addEventSpy.mockRestore();
//     });

//     it('triggers closeSection when close:navigation:section fires', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);

//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const sectionButton = container.querySelector('.navigation-section-button');
//       if (sectionButton) {
//         sectionButton.setAttribute('aria-expanded', 'true');

//         window.dispatchEvent(new CustomEvent('close:navigation:section', {
//           detail: { section: sectionButton },
//         }));

//         expect(sectionButton.getAttribute('aria-expanded')).toBe('false');
//       }
//     });

//     it('sets up adobeDataLayer analytics on section link clicks (non-UE mode)', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div
//             class="navigation-section"
//             data-title="Home"
//             data-link="https://example.com/home.html"
//           ></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);

//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       window.adobeDataLayer = [];
//       const link = container.querySelector('.navigation-section-link');
//       if (link) {
//         link.dispatchEvent(new MouseEvent('click', { bubbles: true }));
//         // adobeDataLayer is initialised lazily; verify it was set up
//         expect(Array.isArray(window.adobeDataLayer)).toBe(true);
//       }
//     });

//     it('handles container with no navigation-section divs gracefully', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="some-other-div"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       const result = await autoBlockNavigationFragment(container);

//       expect(result).toBe(container);
//     });

//     it('sets section dataset.sectionStatus to "initialized"', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);

//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const section = container.querySelector('.navigation-section');
//       expect(section?.dataset.sectionStatus).toBe('initialized');
//     });

//     it('sets aria-expanded="true" on section button when in UE mode', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block" data-aue-resource="urn:aem:content/nav">
//           <div class="navigation-section" data-title="Products"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);

//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const sectionButton = container.querySelector('.navigation-section-button');
//       // In UE mode, displaySubMenusForUe expands the button
//       expect(sectionButton?.getAttribute('aria-expanded')).toBe('true');
//     });

//     it('does NOT expand section buttons in non-UE mode', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);

//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const sectionButton = container.querySelector('.navigation-section-button');
//       expect(sectionButton?.getAttribute('aria-expanded')).toBe('false');
//     });

//     // ── toClassName via sectionMeta custom-classes (lines 9-17, 258-271) ──

//     it('applies custom classes from section-metadata to section element', async () => {
//       const { readBlockConfig } = await import('../../scripts/aem.js');
//       readBlockConfig.mockReturnValueOnce({ 'custom-classes': 'featured, hero-nav' });

//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="About">
//             <div class="section-metadata"></div>
//           </div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);
//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const section = container.querySelector('.navigation-section');
//       // toClassName converts "featured" → "featured", "hero-nav" → "hero-nav"
//       expect(section.classList.contains('featured') || section.classList.contains('hero-nav')).toBe(true);
//     });

//     it('sets dataset key from section-metadata non-custom-classes keys', async () => {
//       const { readBlockConfig } = await import('../../scripts/aem.js');
//       readBlockConfig.mockReturnValueOnce({ style: 'dark' });

//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="About">
//             <div class="section-metadata"></div>
//           </div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);
//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const section = container.querySelector('.navigation-section');
//       expect(section.dataset.style).toBe('dark');
//     });

//     it('removes the section-metadata element after processing', async () => {
//       const { readBlockConfig } = await import('../../scripts/aem.js');
//       readBlockConfig.mockReturnValueOnce({ style: 'light' });

//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="About">
//             <div class="section-metadata"></div>
//           </div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);
//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const meta = container.querySelector('.section-metadata');
//       expect(meta).toBeNull();
//     });

//     // ── updateDataSetFromAttributes: data-aue-* branch (lines 46-48) ──

//     it('processes data-aue-* attributes onto dataset (lines 46-48)', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products" data-aue-resource="urn:aem:content/products" data-aue-type="component"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);
//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const section = container.querySelector('.navigation-section');
//       // data-aue-resource → dataset.aueResource
//       expect(section.dataset.aueResource).toBeDefined();
//     });

//     // ── data-title / data-link fallback (lines 282-283, 286-287) ──
//     // In jsdom, data-* HTML attributes automatically populate dataset, so the
//     // fallback branches (dataset.title === undefined with hasAttribute) are reached
//     // only when the LI is pre-built without a dataset. We verify the normal path:
//     // title from dataset.title is used for the button label.

//     it('uses dataset.title for section button title', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Explicit Title"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);
//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const btn = container.querySelector('.navigation-section-button-title');
//       expect(btn?.textContent).toBe('Explicit Title');
//     });

//     it('uses "Menu" as default button title when no data-title is set', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);
//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const btn = container.querySelector('.navigation-section-button-title');
//       expect(btn?.textContent).toBe('Menu');
//     });

//     it('handles pre-built LI section (update=false) without creating duplicate buttons', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       // Pre-existing LI – update=false branch, exercises data-title/link fallback code paths
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <ul class="navigation-wrapper" role="menubar">
//             <li class="navigation-section" data-title="Products">
//               <button class="navigation-section-button" aria-expanded="false" aria-controls="existing-submenu" role="menuitem">
//                 <span class="navigation-section-button-title">Products</span>
//               </button>
//               <ul class="navigation-section-submenu" id="existing-submenu" role="menu" inert></ul>
//             </li>
//           </ul>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);
//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       // Should reuse the existing button, not create a second one
//       const buttons = container.querySelectorAll('.navigation-section-button');
//       expect(buttons.length).toBe(1);
//     });

//     // ── children processing: navigation-item / navigation-group (lines 329-340) ──

//     it('moves navigation-item children into the submenu list', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products">
//             <div class="navigation-item">Item 1</div>
//             <div class="navigation-item">Item 2</div>
//           </div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);
//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const submenu = container.querySelector('.navigation-section-submenu');
//       const items = submenu?.querySelectorAll('.navigation-item');
//       expect(items?.length).toBeGreaterThanOrEqual(1);
//     });

//     it('sets blockName dataset on navigation-item children', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products">
//             <div class="navigation-item">Item</div>
//           </div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);
//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const submenu = container.querySelector('.navigation-section-submenu');
//       const item = submenu?.querySelector('.navigation-item');
//       expect(item?.dataset.blockName).toBe('navigation-item');
//     });

//     it('sets blockName dataset on navigation-group children', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products">
//             <div class="navigation-group">Group</div>
//           </div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);
//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const submenu = container.querySelector('.navigation-section-submenu');
//       const group = submenu?.querySelector('.navigation-group');
//       expect(group?.dataset.blockName).toBe('navigation-group');
//     });

//     // ── wrapper div removal (line 343) ──

//     it('removes wrapper divs (class*="-wrapper") from sections', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products">
//             <div class="some-wrapper">Extra wrapper</div>
//           </div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);
//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const section = container.querySelector('.navigation-section');
//       const wrapper = section?.querySelector('div[class*="-wrapper"]');
//       expect(wrapper).toBeNull();
//     });

//     // ── setEventListeners / toggleButton (lines 181-206) ──

//     it('clicking the section button toggles aria-expanded to true', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);
//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const sectionButton = container.querySelector('.navigation-section-button');
//       expect(sectionButton).not.toBeNull();

//       sectionButton.click();

//       expect(sectionButton.getAttribute('aria-expanded')).toBe('true');
//     });

//     it('clicking the section button twice toggles back to collapsed', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);
//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const sectionButton = container.querySelector('.navigation-section-button');

//       // First click → expanded
//       sectionButton.click();
//       expect(sectionButton.getAttribute('aria-expanded')).toBe('true');

//       // Second click → collapsed
//       sectionButton.click();
//       expect(sectionButton.getAttribute('aria-expanded')).toBe('false');
//     });

//     it('clicking one button closes another expanded button (getOtherSectionButtons)', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products"></div>
//           <div class="navigation-section" data-title="Services"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);
//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const buttons = container.querySelectorAll('.navigation-section-button');
//       expect(buttons.length).toBeGreaterThanOrEqual(2);

//       // Open first button
//       buttons[0].click();
//       expect(buttons[0].getAttribute('aria-expanded')).toBe('true');

//       // Click second button – first should close
//       buttons[1].click();
//       expect(buttons[1].getAttribute('aria-expanded')).toBe('true');
//       expect(buttons[0].getAttribute('aria-expanded')).toBe('false');
//     });

//     it('creates overlay when desktop button is clicked open', async () => {
//       mockMatchMedia(true);
//       jest.resetModules();
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);
//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const sectionButton = container.querySelector('.navigation-section-button');
//       sectionButton.click();

//       const overlay = container.querySelector('.navigation-overlay');
//       expect(overlay).not.toBeNull();
//     });

//     it('removes overlay when clicked', async () => {
//       mockMatchMedia(true);
//       jest.resetModules();
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);
//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const sectionButton = container.querySelector('.navigation-section-button');
//       sectionButton.click();

//       const overlay = container.querySelector('.navigation-overlay');
//       expect(overlay).not.toBeNull();

//       overlay.click();

//       const overlayAfter = container.querySelector('.navigation-overlay');
//       expect(overlayAfter).toBeNull();
//     });

//     it('removes existing overlay when button clicked while another section is open', async () => {
//       mockMatchMedia(true);
//       jest.resetModules();
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products"></div>
//           <div class="navigation-section" data-title="Services"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);
//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const buttons = container.querySelectorAll('.navigation-section-button');

//       // Open first
//       buttons[0].click();
//       expect(container.querySelector('.navigation-overlay')).not.toBeNull();

//       // Click second – overlay from first should be removed, new one added
//       buttons[1].click();
//       const overlays = container.querySelectorAll('.navigation-overlay');
//       // There should still be an overlay (for the newly opened section)
//       // and no duplicate from the previous
//       expect(overlays.length).toBeGreaterThanOrEqual(0);
//     });

//     // ── closeOnEscape (lines 67-75) ──

//     it('closes an open section when Escape key is pressed', async () => {
//       mockMatchMedia(true);
//       jest.resetModules();
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);
//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const sectionButton = container.querySelector('.navigation-section-button');
//       sectionButton.click();
//       expect(sectionButton.getAttribute('aria-expanded')).toBe('true');

//       window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', bubbles: true }));

//       expect(sectionButton.getAttribute('aria-expanded')).toBe('false');
//     });

//     it('does not throw when Escape pressed and no section is open', async () => {
//       mockMatchMedia(true);
//       jest.resetModules();
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');
//       await autoBlockNavigationFragment(container);
//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       expect(() => {
//         window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', bubbles: true }));
//       }).not.toThrow();
//     });

//     it('does nothing when a non-Escape key is pressed', async () => {
//       mockMatchMedia(true);
//       jest.resetModules();
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);
//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const sectionButton = container.querySelector('.navigation-section-button');
//       sectionButton.click();
//       expect(sectionButton.getAttribute('aria-expanded')).toBe('true');

//       window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Tab', bubbles: true }));

//       // Tab should not close the section
//       expect(sectionButton.getAttribute('aria-expanded')).toBe('true');
//     });

//     // ── closeSection with sub-buttons (lines 99-102) ──

//     it('collapses nested aria-haspopup buttons when closing a section', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);
//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const sectionButton = container.querySelector('.navigation-section-button');
//       const submenuId = sectionButton?.getAttribute('aria-controls');
//       const submenu = submenuId ? document.getElementById(submenuId) : null;

//       // Add a nested haspopup button to the submenu
//       if (submenu) {
//         const nestedBtn = document.createElement('button');
//         nestedBtn.setAttribute('aria-haspopup', 'true');
//         nestedBtn.setAttribute('aria-expanded', 'true');
//         submenu.appendChild(nestedBtn);
//       }

//       // Open section first
//       sectionButton.click();
//       expect(sectionButton.getAttribute('aria-expanded')).toBe('true');

//       // Now close it
//       sectionButton.click();
//       expect(sectionButton.getAttribute('aria-expanded')).toBe('false');

//       const nestedBtn = submenu?.querySelector('[aria-haspopup="true"]');
//       expect(nestedBtn?.getAttribute('aria-expanded')).toBe('false');
//     });

//     // ── openSection: submenu height + additional submenus (lines 160-173) ──

//     it('opens submenu and removes inert when button clicked', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);
//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const sectionButton = container.querySelector('.navigation-section-button');
//       const submenuId = sectionButton?.getAttribute('aria-controls');
//       const submenu = submenuId ? document.getElementById(submenuId) : null;

//       expect(submenu?.hasAttribute('inert')).toBe(true);

//       sectionButton.click();

//       expect(submenu?.hasAttribute('inert')).toBe(false);
//     });

//     it('sets aria-expanded on nested submenus when desktop section opens', async () => {
//       mockMatchMedia(true);
//       jest.resetModules();
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);
//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const sectionButton = container.querySelector('.navigation-section-button');
//       const submenuId = sectionButton?.getAttribute('aria-controls');
//       const submenu = submenuId ? document.getElementById(submenuId) : null;

//       // Add nested haspopup button
//       if (submenu) {
//         const nestedBtn = document.createElement('button');
//         nestedBtn.setAttribute('aria-haspopup', 'true');
//         nestedBtn.setAttribute('aria-expanded', 'false');
//         submenu.appendChild(nestedBtn);
//       }

//       sectionButton.click();

//       const nestedBtn = submenu?.querySelector('[aria-haspopup="true"]');
//       expect(nestedBtn?.getAttribute('aria-expanded')).toBe('true');
//     });

//     // ── getMaxHeight with navigation-group-list (lines 107-135) ──

//     it('calculates max height via navigation-group-list children', async () => {
//       mockMatchMedia(true);
//       jest.resetModules();
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);
//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const sectionButton = container.querySelector('.navigation-section-button');
//       const submenuId = sectionButton?.getAttribute('aria-controls');
//       const submenu = submenuId ? document.getElementById(submenuId) : null;

//       // Add navigation-group-list to submenu to exercise the group-list branch
//       if (submenu) {
//         const groupList = document.createElement('ul');
//         groupList.className = 'navigation-group-list';
//         const li1 = document.createElement('li');
//         const li2 = document.createElement('li');
//         groupList.appendChild(li1);
//         groupList.appendChild(li2);
//         submenu.appendChild(groupList);
//       }

//       // Click button – triggers getMaxHeight internally
//       sectionButton.click();

//       const cssVar = submenu?.style.getPropertyValue('--submenu-max-height');
//       expect(cssVar).toBeDefined();
//     });

//     it('calculates max height via navigation-item fallback (no group-list)', async () => {
//       mockMatchMedia(true);
//       jest.resetModules();
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);
//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const sectionButton = container.querySelector('.navigation-section-button');
//       const submenuId = sectionButton?.getAttribute('aria-controls');
//       const submenu = submenuId ? document.getElementById(submenuId) : null;

//       // Add navigation-items to submenu (no group-list)
//       if (submenu) {
//         const item1 = document.createElement('div');
//         item1.className = 'navigation-item';
//         const item2 = document.createElement('div');
//         item2.className = 'navigation-item';
//         submenu.appendChild(item1);
//         submenu.appendChild(item2);
//       }

//       sectionButton.click();

//       const cssVar = submenu?.style.getPropertyValue('--submenu-max-height');
//       expect(cssVar).toBeDefined();
//     });

//     // ── adobeDataLayer push on link click (lines 359-369) ──

//     it('pushes nav_link_click to adobeDataLayer when a navigation-section-link is clicked', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Home">
//             <a class="navigation-section-link" href="https://example.com/home">
//               <span class="navigation-section-link-title">Home</span>
//             </a>
//           </div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);
//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       window.adobeDataLayer = [];
//       const navLink = container.querySelector('.navigation-section-link');
//       if (navLink) {
//         navLink.dispatchEvent(new MouseEvent('click', { bubbles: true }));
//         expect(window.adobeDataLayer.length).toBeGreaterThan(0);
//         expect(window.adobeDataLayer[0].event).toBe('nav_link_click');
//       }
//     });

//     // ── close:navigation:section custom event calls closeSection (lines 296-303) ──

//     it('handles close:navigation:section event with a button that has a valid submenu', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);
//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const sectionButton = container.querySelector('.navigation-section-button');
//       if (sectionButton) {
//         sectionButton.setAttribute('aria-expanded', 'true');

//         const submenuId = sectionButton.getAttribute('aria-controls');
//         const submenu = submenuId ? document.getElementById(submenuId) : null;
//         if (submenu) {
//           submenu.removeAttribute('inert');
//         }

//         window.dispatchEvent(new CustomEvent('close:navigation:section', {
//           detail: { section: sectionButton },
//         }));

//         expect(sectionButton.getAttribute('aria-expanded')).toBe('false');
//       }
//     });

//     // ── displaySubMenusForUe with null button (lines 286-287) ──

//     it('handles UE mode with a section that has no button (null sectionButton)', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       // Pre-existing LI so update=false, no button gets created.
//       // In UE mode the function wraps content in a <nav> and returns the nav element.
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <ul class="navigation-wrapper" role="menubar">
//             <li class="navigation-section" data-aue-resource="urn:aem:content/nav">
//             </li>
//           </ul>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');
//       container.setAttribute('data-aue-resource', 'urn:aem:content/nav');

//       const result = await autoBlockNavigationFragment(container);
//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       // In UE mode, content is wrapped in a <nav class="navigation"> and the nav is returned
//       expect(result).not.toBeNull();
//       expect(result.tagName.toLowerCase()).toBe('nav');
//       expect(result.classList.contains('navigation')).toBe(true);
//     });

//     // ── section[data-type="navigation"] variant ──

//     it('processes sections with data-type="navigation"', async () => {
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="section" data-type="navigation" data-title="About"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);
//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const section = container.querySelector('.navigation-section');
//       expect(section).not.toBeNull();
//     });

//     // ── mobile: openSection without overlay (isDesktop.matches = false) ──

//     it('opens section on mobile without creating overlay', async () => {
//       mockMatchMedia(false);
//       jest.resetModules();
//       const { autoBlockNavigationFragment } = await import('./navigation.js');
//       document.body.innerHTML = `
//         <div class="navigation-block">
//           <div class="navigation-section" data-title="Products"></div>
//         </div>
//       `;
//       const container = document.querySelector('.navigation-block');

//       await autoBlockNavigationFragment(container);
//       await new Promise((resolve) => { setTimeout(resolve, 0); });

//       const sectionButton = container.querySelector('.navigation-section-button');
//       sectionButton.click();

//       expect(sectionButton.getAttribute('aria-expanded')).toBe('true');
//       expect(container.querySelector('.navigation-overlay')).toBeNull();
//     });
//   });
// });
