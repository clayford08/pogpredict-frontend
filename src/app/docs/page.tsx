'use client';

import React from 'react';
import Link from 'next/link';

export default function DocsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="cyber-title text-center mb-8">Documentation</h1>

      {/* Quick Start Guide */}
      <section className="cyber-card mb-8">
        <h2 className="text-2xl font-bold text-pog-orange mb-4">🚀 Quick Start Guide</h2>
        <div className="space-y-4">
          <p>
            PogPredict is an esports prediction platform where you can predict match outcomes
            and earn rewards. Here's how to get started:
          </p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Connect your wallet using the "Connect" button in the top right</li>
            <li>Browse available markets in the "Markets" section</li>
            <li>Select a market and place your prediction</li>
            <li>Wait for the match to complete</li>
            <li>If you win, claim your rewards in the "Claims" section</li>
          </ol>
        </div>
      </section>

      {/* How It Works */}
      <section className="cyber-card mb-8">
        <h2 className="text-2xl font-bold text-pog-orange mb-4">🎮 How It Works</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Prediction Markets</h3>
            <p>
              Each market represents an upcoming esports match or event. Markets have two possible
              outcomes, and users can predict either outcome by staking AVAX. The odds for each
              outcome are determined by the total amount staked on each side.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Odds & Payouts</h3>
            <p>
              The odds shown are real-time and based on the total predictions made by users.
              If you win, your payout will be proportional to your stake and the final odds
              when the market closed. The earlier you predict, the better odds you might get!
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Market Resolution</h3>
            <p>
              Markets are resolved shortly after the match ends. Once resolved, winners can
              claim their payouts from the Claims page. In rare cases where a match is cancelled
              or invalid, all users will be able to claim a refund of their original stake.
            </p>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="cyber-card mb-8">
        <h2 className="text-2xl font-bold text-pog-orange mb-4">🎯 Key Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Markets Page</h3>
            <p>
              Browse all available markets, filter by game, search by team names,
              and sort by various criteria. Each market shows:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>Match details and teams</li>
              <li>Current odds for each outcome</li>
              <li>Total amount staked</li>
              <li>Time remaining until match starts</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Profile Page</h3>
            <p>
              Track your prediction history and performance:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>Total predictions made</li>
              <li>Win/loss record</li>
              <li>Total AVAX won</li>
              <li>Current and best winning streaks</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Claims Page</h3>
            <p>
              Manage your winnings and refunds:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>View all claimable markets</li>
              <li>Claim winnings from successful predictions</li>
              <li>Claim refunds from cancelled markets</li>
              <li>Track claimed and pending rewards</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Referral Program</h3>
            <p>
              Earn additional rewards:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>Get your unique referral code</li>
              <li>Share with friends</li>
              <li>Earn 5% of their trading fees</li>
              <li>Track referral earnings</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Tips & Best Practices */}
      <section className="cyber-card mb-8">
        <h2 className="text-2xl font-bold text-pog-orange mb-4">💡 Tips & Best Practices</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Making Predictions</h3>
            <ul className="list-disc list-inside ml-4">
              <li>Research teams and their recent performance</li>
              <li>Consider the odds and potential payouts</li>
              <li>Don't stake more than you can afford to lose</li>
              <li>Watch for markets with uneven odds - they might present good opportunities</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Managing Your Account</h3>
            <ul className="list-disc list-inside ml-4">
              <li>Regularly check the Claims page for winnings</li>
              <li>Track your performance in the Profile page</li>
              <li>Set up your referral code early to maximize earnings</li>
              <li>Keep enough AVAX in your wallet for transaction fees</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="cyber-card">
        <h2 className="text-2xl font-bold text-pog-orange mb-4">❓ Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">What happens if a match is cancelled?</h3>
            <p>
              If a match is cancelled or cannot be properly resolved, all users will be able to
              claim a refund of their original stake from the Claims page.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">How long do I have to claim my winnings?</h3>
            <p>
              There is no time limit for claiming winnings. Once you win a prediction, you can
              claim your winnings at any time from the Claims page.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">How are the odds calculated?</h3>
            <p>
              Odds are calculated based on the total amount staked on each outcome. The more AVAX
              staked on an outcome, the lower its odds and potential payout will be.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">What networks are supported?</h3>
            <p>
              PogPredict currently operates on the Avalanche network. Make sure your wallet is
              connected to Avalanche and has sufficient AVAX for predictions and gas fees.
            </p>
          </div>
        </div>
      </section>

      {/* Get Started Button */}
      <div className="text-center mt-12">
        <Link 
          href="/markets" 
          className="cyber-button bg-pog-orange hover:bg-pog-orange/80 text-xl px-8 py-4"
        >
          Start Predicting →
        </Link>
      </div>
    </div>
  );
} 