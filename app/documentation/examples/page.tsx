'use client';

import React, { useState } from 'react';
import { ArrowUpRight, ArrowRight, Info } from 'lucide-react';

const DefiProjectsShowcase = () => {
  const [activeProject, setActiveProject] = useState(0);
  
  const projects = [
    {
      name: "Leveraged Yield Farming",
      description: "A sophisticated DeFi product that amplifies yield farming returns through leverage. Utilizes flash loans to borrow additional capital, combines it with user funds in liquidity pools, and auto-compounds rewards through yield farming.",
      key_features: [
        "Flash loan leveraging",
        "Auto-compounding rewards",
        "Liquidity pool integration",
        "Risk-managed positions",
        "Automated yield optimization"
      ],
      website: "https://github.com/yourusername/leveraged-yield-farming",
      tvl: "In Development",
      chain: "Aptos",
      composition: {
        primitives: ["Flash Loan Provider", "Liquidity Pool", "Yield Farm"],
        connections: [
          "Flash Loan → Liquidity Pool",
          "Liquidity Pool → Yield Farm",
          "Yield Farm → Flash Loan (Repayment)"
        ]
      }
    },
    {
      name: "Borrow-Swap-Stake Strategy",
      description: "This DeFi product allows users to borrow assets from a lending protocol, swap them for another token with higher yield potential, and then stake those tokens for auto-compounding rewards. This strategy is useful for users who want to maintain their original token position while still generating yield from other token opportunities.",
      key_features: [
        "Asset borrowing optimization",
        "Automated token swapping",
        "Auto-compounding staking rewards",
        "Yield opportunity maximization",
        "Cross-protocol integration"
      ],
      website: "https://github.com/yourusername/borrow-swap-stake",
      tvl: "In Development",
      chain: "Aptos",
      composition: {
        primitives: ["Lending Protocol", "AMM Swap", "AutoCompound Staking"],
        connections: [
          "Lending Protocol → AMM Swap (Borrow & Swap)",
          "AMM Swap → AutoCompound Staking (Stake Swapped Tokens)"
        ]
      }
    },
    {
      name: "Dynamic Liquidity Rebalancer",
      description: "This DeFi product automatically manages liquidity across multiple pools based on market conditions and yield opportunities. It uses the Liquidity Pool to provide initial liquidity, monitors APR through the staking protocol, and dynamically moves liquidity between pools using AMM Swap. This strategy aims to maximize capital efficiency by always positioning liquidity in the highest-yielding opportunities.",
      key_features: [
        "Automated liquidity management",
        "APR monitoring and optimization",
        "Dynamic pool rebalancing",
        "Capital efficiency maximization",
        "Multi-pool yield optimization"
      ],
      website: "https://github.com/yourusername/dynamic-liquidity-rebalancer",
      tvl: "In Development",
      chain: "Aptos",
      composition: {
        primitives: ["Liquidity Pool", "AutoCompound Staking", "AMM Swap"],
        connections: [
          "Liquidity Pool → AutoCompound Staking (Stake LP tokens)",
          "AutoCompound Staking → Liquidity Pool (APR check & remove)",
          "Liquidity Pool → AMM Swap (Rebalance to new pool)"
        ]
      }
    }
  ];
  
  return (
    <div className="bg-black text-white min-h-screen p-6 font-mono">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 border-b border-gray-800 pb-4">
          Explore Top DeFi Protocols
        </h1>
        
        {/* Navigation */}
        <div className="flex flex-col md:flex-row mb-8 gap-4">
          {projects.map((project, index) => (
            <button
              key={index}
              onClick={() => setActiveProject(index)}
              className={`px-6 py-4 text-left border transition-all ${
                activeProject === index 
                  ? "border-white bg-white text-black" 
                  : "border-gray-800 hover:border-gray-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold">{project.name}</span>
                {activeProject === index && <ArrowRight className="ml-2" size={16} />}
              </div>
            </button>
          ))}
        </div>
        
        {/* Project Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Project Info */}
          <div className="md:col-span-2 border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{projects[activeProject].name}</h2>
              <a 
                href={projects[activeProject].website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm border border-gray-800 px-4 py-2 hover:bg-white hover:text-black transition-colors"
              >
                Visit Project <ArrowUpRight size={14} className="ml-2" />
              </a>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-400 mb-4">{projects[activeProject].description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border border-gray-800 p-4">
                  <span className="text-gray-500 text-sm">Total Value Locked</span>
                  <p className="text-xl font-bold">{projects[activeProject].tvl}</p>
                </div>
                <div className="border border-gray-800 p-4">
                  <span className="text-gray-500 text-sm">Blockchain</span>
                  <p className="text-xl font-bold">{projects[activeProject].chain}</p>
                </div>
              </div>
              
              <div className="border border-gray-800 p-4">
                <h3 className="text-lg font-bold mb-3 flex items-center">
                  <Info size={18} className="mr-2" /> Key Features
                </h3>
                <ul className="space-y-2">
                  {projects[activeProject].key_features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-gray-400 mr-2">•</span> {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {projects[activeProject].composition && (
                <div className="border border-gray-800 p-4 mt-4">
                  <h3 className="text-lg font-bold mb-3 flex items-center">
                    <Info size={18} className="mr-2" /> Composition Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-gray-500 mb-2">Primitives Used:</h4>
                      <div className="flex flex-wrap gap-2">
                        {projects[activeProject].composition.primitives.map((primitive, index) => (
                          <span key={index} className="bg-gray-800 px-3 py-1 rounded-full text-sm">
                            {primitive}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-gray-500 mb-2">Connections:</h4>
                      <ul className="space-y-1">
                        {projects[activeProject].composition.connections.map((connection, index) => (
                          <li key={index} className="text-sm text-gray-400">
                            {connection}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Interactive Preview */}
          <div className="border border-gray-800 flex flex-col">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-lg font-bold">Interactive Preview</h3>
            </div>
            <div className="flex-1 p-4 flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <p className="text-gray-400 mb-4">Preview for {projects[activeProject].name}</p>
                <img 
                  src="/api/placeholder/320/240" 
                  alt={`${projects[activeProject].name} interface`}
                  className="border border-gray-700"
                />
                <button className="mt-6 px-6 py-3 bg-white text-black font-bold hover:bg-gray-300 transition-colors">
                  Try {projects[activeProject].name}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Project Selector for Mobile */}
        <div className="mt-8 md:hidden flex overflow-x-auto gap-2">
          {projects.map((project, index) => (
            <button
              key={index}
              onClick={() => setActiveProject(index)}
              className={`px-3 py-2 whitespace-nowrap ${
                activeProject === index 
                  ? "bg-white text-black" 
                  : "border border-gray-800"
              }`}
            >
              {project.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DefiProjectsShowcase;