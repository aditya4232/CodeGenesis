# Contributing to CodeGenesis

Thank you for your interest in contributing to CodeGenesis! We welcome contributions from the community to help make this the best autonomous AI software architect.

## Getting Started

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone https://github.com/your-username/CodeGenesis.git
    cd CodeGenesis/frontend
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```
4.  **Set up environment variables**:
    -   Copy `.env.local.example` to `.env.local` (create one if not exists).
    -   Add your Clerk and Supabase keys.

5.  **Run the development server**:
    ```bash
    npm run dev
    ```

## Project Structure

-   `app/`: Next.js App Router pages and API routes.
    -   `(public)/`: Publicly accessible pages (Home, Pricing, etc.).
    -   `(dashboard)/`: Protected dashboard pages.
    -   `api/`: Backend API routes.
-   `components/`: Reusable React components.
    -   `ui/`: Shadcn UI components.
    -   `modals/`: Dialogs and modals.
    -   `providers/`: Context providers.
-   `lib/`: Utility functions and clients (Supabase, etc.).
-   `supabase/`: Database schema and migrations.

## Code Style

-   We use **TypeScript** for type safety.
-   We use **Tailwind CSS** for styling.
-   We follow the **Next.js App Router** conventions.
-   Please ensure your code is clean, commented, and formatted.

## Pull Request Process

1.  Create a new branch for your feature or fix: `git checkout -b feature/amazing-feature`.
2.  Commit your changes with descriptive messages.
3.  Push to your fork and submit a Pull Request to the `main` branch.
4.  Describe your changes in detail in the PR description.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
