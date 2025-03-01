'use client';

import React from 'react';

interface SubgraphIndexingMessageProps {
  entityName: string;
}

const SubgraphIndexingMessage: React.FC<SubgraphIndexingMessageProps> = ({ entityName }) => {
  return (
    <div className="cyber-card text-center p-6 max-w-4xl mx-auto my-8">
      <h2 className="text-xl font-bold text-pog-orange mb-4">Subgraph Indexing in Progress</h2>
      
      <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-lg mb-4 text-blue-400">
        The subgraph is still indexing data. {entityName} will be available soon.
      </div>
      
      <p className="mb-6 text-gray-300">
        We've recently migrated to Base Sepolia and our subgraph is still indexing the blockchain data.
        This process may take some time as we wait for events to be processed.
      </p>
      
      <div className="flex justify-center items-center space-x-4 mb-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pog-orange"></div>
        <span className="text-gray-300">Indexing in progress...</span>
      </div>
      
      <div className="mt-4 text-sm text-gray-400">
        <p>Please check back later or try refreshing the page.</p>
      </div>
    </div>
  );
};

export default SubgraphIndexingMessage; 