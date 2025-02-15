# PogPredict UI

Frontend application for PogPredict, a decentralized prediction market for esports.

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
```

Create a `.env` file based on `.env.example` and fill in your environment variables:

```bash
cp .env.example .env
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

The following environment variables are required:

- `NEXT_PUBLIC_AVALANCHE_RPC`: Avalanche RPC URL
- `NEXT_PUBLIC_CS2_ORACLE_ADDRESS`: CS2 Oracle contract address
- `NEXT_PUBLIC_REFERRAL_ADDRESS`: Referral contract address
- `NEXT_PUBLIC_POGPREDICT_ADDRESS`: PogPredict contract address
- Firebase configuration variables (see `.env.example`)

## Features

- Real-time esports prediction markets
- User profiles and statistics
- Referral system
- Market creation and management
- Automated market resolution through oracles

## Built With

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [ethers.js](https://docs.ethers.org/v6/)
- [Firebase](https://firebase.google.com/) 