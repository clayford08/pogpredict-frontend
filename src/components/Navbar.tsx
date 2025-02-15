'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWeb3 } from '@/components/Web3Provider';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const { account, connect, disconnect } = useWeb3();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="bg-pog-dark border-b border-pog-orange/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center space-x-2 hover:scale-105 transition-all duration-300"
            >
              <Image
                src="/pog.png"
                alt="PogPredict Logo"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-pog-orange to-pog-accent bg-clip-text text-transparent">
                PogPredict
              </span>
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex ml-10 items-center space-x-1">
              <Link 
                href="/markets" 
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive('/markets')
                    ? 'bg-pog-orange text-white shadow-lg shadow-pog-orange/20'
                    : 'text-gray-300 hover:text-pog-orange hover:bg-pog-orange/10'
                }`}
              >
                Markets
              </Link>
              <Link 
                href="/create" 
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive('/create')
                    ? 'bg-pog-orange text-white shadow-lg shadow-pog-orange/20'
                    : 'text-gray-300 hover:text-pog-orange hover:bg-pog-orange/10'
                }`}
              >
                Create
              </Link>
              <Link 
                href="/leaderboard" 
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive('/leaderboard')
                    ? 'bg-pog-orange text-white shadow-lg shadow-pog-orange/20'
                    : 'text-gray-300 hover:text-pog-orange hover:bg-pog-orange/10'
                }`}
              >
                Leaderboard
              </Link>
              <Link 
                href="/referral" 
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive('/referral')
                    ? 'bg-pog-orange text-white shadow-lg shadow-pog-orange/20'
                    : 'text-gray-300 hover:text-pog-orange hover:bg-pog-orange/10'
                }`}
              >
                Referral
              </Link>
              <Link 
                href="/claims" 
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive('/claims')
                    ? 'bg-pog-orange text-white shadow-lg shadow-pog-orange/20'
                    : 'text-gray-300 hover:text-pog-orange hover:bg-pog-orange/10'
                }`}
              >
                Claims
              </Link>
            </div>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center">
            {account ? (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/profile" 
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    isActive('/profile')
                      ? 'bg-pog-orange text-white shadow-lg shadow-pog-orange/20'
                      : 'text-gray-300 hover:text-pog-orange hover:bg-pog-orange/10'
                  }`}
                >
                  <span>Profile</span>
                  <span className="font-mono text-sm opacity-50">
                    ({formatAddress(account)})
                  </span>
                </Link>
                <button
                  onClick={disconnect}
                  className="cyber-button"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                className="cyber-button"
              >
                Connect Wallet
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-pog-orange focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} pb-4`}>
          <div className="flex flex-col space-y-2">
            <Link 
              href="/markets" 
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                isActive('/markets')
                  ? 'bg-pog-orange text-white shadow-lg shadow-pog-orange/20'
                  : 'text-gray-300 hover:text-pog-orange hover:bg-pog-orange/10'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Markets
            </Link>
            <Link 
              href="/create" 
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                isActive('/create')
                  ? 'bg-pog-orange text-white shadow-lg shadow-pog-orange/20'
                  : 'text-gray-300 hover:text-pog-orange hover:bg-pog-orange/10'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Create
            </Link>
            <Link 
              href="/leaderboard" 
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                isActive('/leaderboard')
                  ? 'bg-pog-orange text-white shadow-lg shadow-pog-orange/20'
                  : 'text-gray-300 hover:text-pog-orange hover:bg-pog-orange/10'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Leaderboard
            </Link>
            <Link 
              href="/referral" 
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                isActive('/referral')
                  ? 'bg-pog-orange text-white shadow-lg shadow-pog-orange/20'
                  : 'text-gray-300 hover:text-pog-orange hover:bg-pog-orange/10'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Referral
            </Link>
            <Link 
              href="/claims" 
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                isActive('/claims')
                  ? 'bg-pog-orange text-white shadow-lg shadow-pog-orange/20'
                  : 'text-gray-300 hover:text-pog-orange hover:bg-pog-orange/10'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Claims
            </Link>
            {account ? (
              <>
                <Link 
                  href="/profile" 
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                    isActive('/profile')
                      ? 'bg-pog-orange text-white shadow-lg shadow-pog-orange/20'
                      : 'text-gray-300 hover:text-pog-orange hover:bg-pog-orange/10'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile ({formatAddress(account)})
                </Link>
                <button
                  onClick={() => {
                    disconnect();
                    setIsMenuOpen(false);
                  }}
                  className="cyber-button w-full"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  connect();
                  setIsMenuOpen(false);
                }}
                className="cyber-button w-full"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
