# Move Matrix: DeFi Composition Framework for Aptos

Move Matrix is a powerful tool that enables developers to compose and deploy DeFi protocols on the Aptos blockchain. By using an intuitive visual interface, users can connect various DeFi primitives, validate connections, generate Move code, and deploy smart contracts without writing code.

![Move Matrix Logo](public/logo.svg)

## Features

- **Visual Composition:** Drag-and-drop interface for connecting DeFi primitives
- **Primitive Library:** Pre-built lending, swap, staking, and yield farming primitives
- **Connection Validation:** Real-time validation of primitive connections ensuring protocol safety
- **Code Generation:** Automated Move code generation based on visual compositions
- **One-click Deployment:** Deploy to Aptos testnet directly from the UI
- **Wallet Integration:** Connect with Petra wallet for seamless interaction

## Architecture Overview

Move Matrix consists of:

1. **Frontend:** Next.js-based UI for visual composition building
2. **Backend:** Server-side APIs for primitive management, composition handling, and code generation
3. **Move Compiler:** Integration with Aptos CLI for code compilation and deployment
4. **MongoDB:** Database for storing primitives, compositions, and user data

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (local or MongoDB Atlas)
- [Aptos CLI](https://aptos.dev/tools/aptos-cli/)
- [Petra Wallet](https://petra.app/) browser extension

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/move_matrix.git
   cd move_matrix
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables:**

   Create a `.env.local` file in the root directory with the following variables:
   ```
   MONGODB_URI=mongodb+srv://your-mongodb-uri
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

4. **Set up Aptos configuration:**

   Ensure your `.aptos` directory is properly configured with your wallet credentials. You can set this up using:
   ```bash
   aptos init
   ```

5. **Seed the database:**
   ```bash
   npm run seed
   # or
   yarn seed
   ```

## Running the Application

1. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. **Access the application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### Creating Compositions

1. **Navigate to Compositions:** Go to the dashboard and click "New Composition"
2. **Add Primitives:** Drag primitives from the sidebar onto the canvas
3. **Connect Primitives:** Click and drag between primitive functions to create connections
4. **Configure Parameters:** Map parameters between connected functions
5. **Validate:** Validate your composition to check for errors or issues
6. **Save:** Save your composition for later use

### Generating Code

1. **Open Composition:** Select a saved composition from your dashboard
2. **Click Generate Code:** Use the "Generate Code" button in the composition detail view
3. **Review:** Inspect the generated Move code
4. **Edit (Optional):** Make any necessary adjustments to the generated code

### Deploying to Aptos

1. **Ensure Wallet is Connected:** Connect your Petra wallet to the application
2. **Generate Code:** Make sure you have generated code for your composition
3. **Click Deploy:** Use the "Deploy" button in the deployment panel
4. **Confirm Transaction:** Review and confirm the deployment transaction in your wallet
5. **View Status:** Monitor deployment status and transaction details

## DeFi Products You Can Build

Here are some examples of DeFi products you can build with Move Matrix:

1. **Leveraged Yield Farming Strategy:** Use flash loans to amplify yield farming returns
2. **Borrow-Swap-Stake Yield Optimizer:** Borrow assets, swap for higher yield tokens, and stake
3. **Dynamic Liquidity Rebalancer:** Automatically manage liquidity across pools based on APR

## Troubleshooting

### Common Issues

- **Wallet Connection:** If Petra wallet doesn't connect, ensure the extension is installed and logged in
- **Compilation Errors:** Check primitive connections and parameter mappings for type mismatches
- **Deployment Failures:** Verify wallet has sufficient funds on testnet for gas fees
- **MongoDB Connection:** Ensure MongoDB URI is correctly configured in your environment variables

### Getting Help

If you encounter issues:
1. Check console logs for detailed error messages
2. Review the Move code generated for any syntax errors
3. Verify your Aptos configuration is correct

## Development

### Project Structure
- `/app`: Next.js application code
- `/lib`: Core libraries and utilities
- `/components`: Reusable React components
- `/scripts`: Helper scripts for DB seeding and deployment
- `/move`: Move language utilities and templates

### Adding New Primitives

To add a new primitive:
1. Create a Move module file in `/move/primitives/`
2. Update the seed script or use the admin interface
3. Restart the application and run the seeding process

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Aptos Labs](https://aptoslabs.com/) for the Move language and blockchain platform
- [Petra Wallet](https://petra.app/) for wallet integration
- All contributors who have helped shape Move Matrix
