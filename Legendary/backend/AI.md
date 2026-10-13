Legendary Lifestyle — Agent Instructions
1. Project Context
Legendary Lifestyle is a clothing e-commerce website for T-shirts, caps, and tote bags. The system includes a public storefront, customer account features, checkout, order management, inventory management, and an admin dashboard.
The main differentiating feature is Build Your Look, where a customer selects a T-shirt, cap, and tote bag, previews the combination, views the total price, and adds the complete look to the cart.
2. Required Technology
- Backend: Laravel.
- Frontend: React JS.
- Frontend build tool: Vite.
- Styling: Tailwind CSS.
- Backend and frontend must remain in separate folders and run separately.
- Backend development URL: http://127.0.0.1:8000.
- Frontend development URL: http://localhost:5173.
- Use a REST-style JSON API between the frontend and backend.
Do not replace Laravel with another backend framework or replace React/Vite/Tailwind unless the user explicitly requests it.
3. First Actions Before Coding
Before making changes:
1. Inspect the repository structure.
2. Check whether the work belongs in backend or frontend.
3. Read requirements.md and design.md.
4. Inspect existing routes, controllers, models, migrations, components, hooks, and API utilities.
5. Check the current package versions and available scripts.
6. Identify unfinished work before creating duplicate files.
7. Confirm the project can run or document the exact existing error before changing configuration.
Do not assume that a missing page means the entire feature is missing. Search for existing implementations first.
4. General Coding Rules
- Make the smallest complete change that satisfies the request.
- Reuse existing components, styles, services, and utilities.
- Keep unrelated user changes intact.
- Do not overwrite or delete files without a clear reason.
- Use descriptive names and consistent folder organization.
- Do not use emojis in the code or in the commit messages.
- Use icons instead of emojis.
- Keep presentation, business logic, API communication, and data validation separated.
- Avoid duplicated constants, API URLs, formatting logic, and validation rules.
- Avoid unnecessary dependencies.
- Do not hardcode secrets, tokens, private keys, or production credentials.
- Use environment variables for environment-specific configuration.
- Add comments only when they clarify non-obvious reasoning.
5. Frontend Rules
- Build reusable React components for product cards, buttons, inputs, alerts, modals, loading states, and layout sections.
- Use Tailwind classes consistently with the design system in design.md.
- Use a centralized API client or service layer instead of placing repeated fetch logic in components.
- Keep components focused and avoid very large page components.
- Use controlled form inputs when validation or submission state is required.
- Handle loading, success, error, and empty states for every API-driven screen.
- Prevent duplicate submissions by disabling buttons while requests are processing.
- Preserve accessible labels, keyboard navigation, focus states, and semantic HTML.
- Do not place business-critical prices, discounts, or stock decisions only in frontend code.
- Use frontend calculations for display only; the backend is authoritative.
6. Backend Rules
- Use Laravel routes, controllers, requests, resources, models, migrations, and policies according to their intended responsibilities.
- Use Form Request classes for complex request validation.
- Use API Resources or a consistent JSON response structure.
- Use authorization policies or middleware for customer and admin access.
- Hash passwords using Laravel’s supported secure mechanisms.
- Validate product variants and stock on the backend.
- Recalculate cart and order totals on the backend.
- Use database transactions when creating an order and updating inventory.
- Prevent negative stock and invalid quantities.
- Return appropriate HTTP status codes and useful error messages.
- Keep sensitive implementation details out of API responses.
- Use pagination for large product, order, customer, and review lists.
7. API Contract Rules
Every API endpoint must document or clearly establish:
- HTTP method and route.
- Authentication requirement.
- Request parameters and body format.
- Successful response shape.
- Validation error shape.
- Authorization failure behavior.
- Not-found behavior.
- Pagination behavior where applicable.
Use a predictable error format, for example:
{
  "message": "The selected variant is out of stock.",
  "errors": {
    "variant_id": ["The selected variant is unavailable."]
  }
}
Do not silently change an endpoint response shape when existing frontend code depends on it. Update both sides deliberately and test the contract.
8. Business Rules
- A product must belong to a supported category: T-shirt, Cap, or Tote Bag.
- A product variant may have its own color, size, SKU, price, and stock quantity.
- A customer must select required variants before adding a product to the cart.
- The cart must reject quantities greater than available stock.
- Stock must be checked again when an order is submitted.
- The server must calculate subtotal, discounts, shipping, and total.
- An order must have a unique order number.
- Build Your Look should normally contain one T-shirt, one cap, and one tote bag.
- Build Your Look suggestions must use deterministic product attributes such as category and color; do not add an AI API unless explicitly requested.
- Only authorized administrators may manage products, inventory, discounts, orders, and reviews.
9. Testing Requirements
Before marking a feature complete, add or update tests for the relevant behavior.
Backend Tests
- Request validation.
- Authentication and authorization.
- Product and variant retrieval.
- Stock validation.
- Cart and order total calculation.
- Order creation and inventory update.
- Admin-only actions.
Frontend Tests
- Product card rendering.
- Filter and search behavior.
- Cart quantity and removal behavior.
- Build Your Look selection and summary.
- Form validation and submission states.
- Error and empty states.
Manual Checks
- Mobile, tablet, and desktop layouts.
- Keyboard navigation.
- Refreshing pages with authentication or cart state.
- Failed API requests.
- Out-of-stock products.
- Duplicate clicks during checkout.
10. Safe Change Workflow
For every feature:
1. State the files and behavior that will be changed.
2. Inspect related code and existing patterns.
3. Implement the backend contract first when the feature needs new data.
4. Implement the frontend behavior using the established API service.
5. Add validation and failure handling.
6. Run focused tests.
7. Run the frontend build and relevant Laravel checks.
8. Review the diff for accidental changes.
9. Summarize what changed and what remains.
If a command fails because of the local environment, do not hide the failure. Report the command, the relevant error, and whether the code itself was still verified by another method.
11. Do Not Do These Things
- Do not use mock data as the final implementation when a real API is required.
- Do not expose admin pages to unauthenticated customers.
- Do not trust frontend prices, totals, roles, or stock values.
- Do not store plain-text passwords.
- Do not commit .env files or credentials.
- Do not remove existing features to make a new feature easier.
- Do not create duplicate versions of existing components without checking first.
- Do not make broad styling changes unrelated to the requested feature.
- Do not install packages without explaining why they are needed.
- Do not claim that tests passed if they were not actually run.
12. Completion Report Format
At the end of each task, report:
Implemented:
- [completed change]

Files changed:
- [path]

Verification:
- [command or manual check]
- [result]

Known issues:
- [issue, or “None”]
13. Definition of Done
A task is complete only when the implementation follows requirements.md and design.md, works with the Laravel/React architecture, handles loading and failure states, protects relevant routes, validates important inputs, passes relevant tests or clearly reports environment blockers, and does not introduce unrelated changes.