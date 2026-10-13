Legendary Lifestyle — Design Specification
1. Design Direction
Legendary Lifestyle should feel like a modern streetwear and lifestyle brand: confident, clean, youthful, and product-focused. The design must make the clothing the visual priority while keeping shopping actions obvious.
The interface should feel like a printed fashion editorial brought to the web. Use strong photography, oversized typography, visible grid lines, asymmetric composition, intentional whitespace, and small moments of visual tension. The design must look art-directed rather than assembled from a standard e-commerce template.
Do not use generic SaaS dashboard styling, excessive rounded cards, glassmorphism, gradients, stock “fashion model” imagery, AI-generated product mockups, or repetitive pill-shaped controls. Every decorative element must support the brand or the shopping task.
2. Brand Personality
- Confident
- Minimal
- Modern
- Creative
- Casual
- Community-oriented
Suggested brand message: Wear your everyday legend.
3. Visual System
Color Palette
Use CSS variables or Tailwind theme values so the palette can be changed from one location.
Token	Suggested value	Use
brand-black	#0A0A0A	Main text, navigation, buttons, footer
brand-white	#FFFFFF	Main background and product surfaces
brand-paper	#F4F4F0	Subtle section contrast and editorial panels
brand-gray	#8A8A84	Secondary text and inactive controls
brand-line	#D6D6D0	Thin rules and product-grid lines
brand-sale	#E8E8E2	Sale labels and quiet highlights
brand-success	#25543F	Success status only
brand-danger	#A83232	Error status only


Black and white must dominate the interface. Use brand-paper only to separate sections and use status colors only when they communicate system state. Do not add random accent colors.
Typography
- Use a condensed or characterful display font for major headings and a neutral sans-serif font for body text.
- Headings should be short, bold, and visually prominent, with occasional oversized editorial treatment.
- Body text should use comfortable line spacing and readable font sizes.
- Use sentence case for most labels and buttons.
- Use uppercase text for navigation labels, product metadata, collection names, and small editorial captions.
- Do not use more than two font families.
Spacing and Shape
- Use a consistent spacing scale based on Tailwind utilities, but allow deliberate oversized gaps in editorial sections.
- Prefer square or lightly rounded corners. Avoid making every section look like a floating card.
- Use thin one-pixel rules, cropped images, offset text blocks, and large margins to create visual identity.
- Keep product cards visually clean with minimal borders and a noticeable but restrained hover state.
4. Signature Visual Language
The website should have recognizable design behaviors that appear across pages:
- A thin black announcement strip with compact uppercase text.
- A large wordmark or collection title that may partially extend beyond the content grid.
- Editorial captions such as DROP 01, FIELD NOTES, or EVERYDAY UNIFORM.
- Offset image-and-text compositions instead of identical centered sections.
- A visible twelve-column desktop grid used for alignment, not decoration alone.
- Black navigation and action bars against white content areas.
- Product photography presented as cutouts or tightly cropped editorial images, never as random stock photos.
- A subtle “lookbook” feeling in the homepage while catalog and checkout remain highly practical.
The signature style must never make the store difficult to use. Product name, price, variant, stock, and purchase actions remain clear.
5. Layout Rules
- The site must be responsive from mobile-first layouts to desktop screens.
- The maximum content width should be approximately 1280px.
- Desktop pages should use a centered container with consistent horizontal padding and a visible editorial grid.
- Do not center every section. Alternate between full-bleed, left-aligned, and offset compositions.
- Mobile navigation must collapse into a menu.
- The cart and account actions must remain easy to find on all screen sizes.
- Every page must include a consistent header and footer unless it is an authenticated admin screen.
6. Navigation Structure
Main Navigation
- Home
- Shop
- T-shirts
- Caps
- Tote Bags
- Build Your Look
- About
Utility Actions
- Search
- Wishlist
- Account
- Cart with item count
On mobile, show the logo, cart, and menu button in the top bar. Place the remaining navigation items inside the menu drawer.
7. Page Designs
Homepage
Order of sections:
1. Announcement bar for promotions or new drops.
2. Header and navigation.
3. Hero section with a strong product or lifestyle image.
4. Main call-to-action: Shop the collection.
5. Category cards for T-shirts, Caps, and Tote Bags.
6. Featured products or new arrivals.
7. Build Your Look promotional section.
8. Short brand story.
9. Customer or community section.
10. Footer with links and social media.
The hero should communicate the brand immediately and should not contain too much text. Prefer one strong image, one short statement, and one clear action. A split-screen or off-center hero is preferred over a generic centered banner.
Shop and Category Pages
- Page title and short category description.
- Search and filter controls.
- Sort control.
- Responsive product grid.
- Product count.
- Pagination or load-more behavior.
- Empty state when no products match the filters.
Recommended grid:
- Mobile: 2 columns where product images remain usable.
- Tablet: 3 columns.
- Desktop: 4 columns.
Product Card
Each product card should show:
- Product image.
- New, sale, or low-stock badge when applicable.
- Product name.
- Category or short descriptor.
- Current price and previous price when on sale.
- Wishlist action.
- Hover image or quick-view behavior only if it does not reduce performance.
The card must link to the product detail page, while the wishlist button must not accidentally open the product page.
Product Detail Page
- Use a two-column layout on desktop and a stacked layout on mobile.
- Place product images prominently.
- Show name, price, description, color, size, stock, and quantity near the purchase action.
- Keep Add to Cart visually dominant.
- Place material, care, delivery, and returns information in collapsible sections.
- Show reviews and related products below the main product information.
Build Your Look Page
Use a guided three-step layout:
1. Choose a T-shirt.
2. Choose a cap.
3. Choose a tote bag.
The selected products should appear in a visual preview panel. On desktop, keep the preview visible while the customer selects products. On mobile, show a compact sticky summary or a preview button.
The page must display selected items, combined total, stock warnings, and an Add Complete Look to Cart button. Color suggestions should be presented as simple labels such as Neutral Match, Bold Contrast, or Monochrome.
Cart Page
- Display product image, name, variant, quantity, unit price, and line total.
- Provide quantity controls with accessible labels.
- Show an order summary on desktop in a right-side panel.
- Stack the summary below items on mobile.
- Show empty-cart illustration or message with a link back to shopping.
Checkout Page
Use a focused layout with minimal distractions:
- Customer information.
- Delivery address.
- Payment method.
- Order summary.
- Terms or order confirmation statement.
Display validation errors beside the relevant field. Do not erase valid information when another field fails validation.
Account Pages
Use a simple sidebar on desktop and a top selector on mobile. Include profile, orders, wishlist, and account settings. Order status should be shown with clear badges and a readable timeline.
Admin Pages
Admin screens should prioritize data clarity over marketing visuals. Use a consistent sidebar, page title, primary action, filters, tables, pagination, confirmation dialogs, and visible success/error alerts.
8. Interaction and State Rules
- Buttons must show a loading state during requests.
- Disabled buttons must be visually distinct and inaccessible while an action is processing.
- Use toast messages for short confirmations and inline messages for form errors.
- Confirm destructive actions such as deleting a product or changing an order status.
- Preserve selected filters and search terms when navigating back from a product page.
- Use skeleton loaders for product grids and detail pages when appropriate.
- Provide meaningful empty states instead of blank screens.
9. Accessibility Requirements
- Use semantic HTML elements.
- Every form control must have a visible or programmatically associated label.
- All images must have appropriate alternative text.
- Interactive controls must be keyboard accessible.
- Focus states must be visible.
- Dialogs must trap focus and close with the Escape key.
- Color must not be the only way to communicate status.
- Maintain readable contrast between text and backgrounds.
10. Image and Content Guidelines
- Use consistent product image ratios across the catalog.
- Use optimized WebP or other efficient formats when supported.
- Use descriptive filenames and alt text.
- Show product details in plain, honest language.
- Do not use placeholder images in production pages.
- Keep product descriptions concise but informative.
- Use real product photography, original brand graphics, or intentionally simple CSS shapes.
- Do not use AI-generated people, fake customer photos, fabricated reviews, or exaggerated marketing claims.
- Avoid generic copy such as “Elevate your style” unless it is rewritten to sound specific to Legendary Lifestyle.
11. Technical Design Constraints
- Backend: Laravel REST API.
- Frontend: React JS created with Vite.
- Styling: Tailwind CSS.
- Backend and frontend run as separate applications during development.
- Typical backend URL: http://127.0.0.1:8000.
- Typical frontend URL: http://localhost:5173.
- Frontend communicates with Laravel through documented JSON API endpoints.
- Authentication, authorization, validation, pricing, and inventory rules must be enforced by the backend.
12. Design Acceptance Criteria
The design is ready when:
- The brand looks consistent across all public pages.
- The site is usable on mobile, tablet, and desktop.
- Customers can reach a product and add it to the cart without confusion.
- The Build Your Look flow is understandable without instructions.
- Loading, error, empty, and success states are visually designed.
- Keyboard navigation and visible focus states work.
- The interface uses reusable React and Tailwind components rather than page-specific duplication.
- The visual system is clearly black-and-white and does not rely on random accent colors.
- At least three pages use the signature editorial language without sacrificing usability.
- The homepage does not look like a default Tailwind, Shopify, or AI-generated template.
- Product photography and text feel specific to Legendary Lifestyle rather than generic fashion content.