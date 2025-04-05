'use client';

import React, { useState } from 'react';
import { ArrowUpRight, ArrowRight, Info } from 'lucide-react';
import { MainLayout } from "@/components/layout/MainLayout";

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
    <MainLayout>
      <div className="text-foreground">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
            Explore DeFi <span className="text-purple">Examples</span>
          </h1>
          
          {/* Navigation */}
          <div className="flex flex-col md:flex-row mb-8 gap-4">
            {projects.map((project, index) => (
              <button
                key={index}
                onClick={() => setActiveProject(index)}
                className={`px-6 py-4 text-left rounded-xl transition-all backdrop-blur-sm ${
                  activeProject === index 
                    ? "bg-purple text-white border-purple" 
                    : "border border-white/10 hover:border-purple/50 bg-black-200/50"
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
            <div className="md:col-span-2 border border-white/10 rounded-xl p-6 backdrop-blur-sm bg-black-200/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{projects[activeProject].name}</h2>
                <a 
                  href={projects[activeProject].website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm border border-white/10 px-4 py-2 rounded-lg hover:bg-purple hover:border-purple transition-all backdrop-blur-sm"
                >
                  Visit Project <ArrowUpRight size={14} className="ml-2" />
                </a>
              </div>
              
              <div className="mb-6">
                <p className="text-white/70 mb-4">{projects[activeProject].description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="border border-white/10 rounded-xl p-4 backdrop-blur-sm bg-black-200/30">
                    <span className="text-white/50 text-sm">Total Value Locked</span>
                    <p className="text-xl font-bold">{projects[activeProject].tvl}</p>
                  </div>
                  <div className="border border-white/10 rounded-xl p-4 backdrop-blur-sm bg-black-200/30">
                    <span className="text-white/50 text-sm">Blockchain</span>
                    <p className="text-xl font-bold">{projects[activeProject].chain}</p>
                  </div>
                </div>
                
                <div className="border border-white/10 rounded-xl p-4 backdrop-blur-sm bg-black-200/30">
                  <h3 className="text-lg font-bold mb-3 flex items-center">
                    <Info size={18} className="mr-2" /> Key Features
                  </h3>
                  <ul className="space-y-2">
                    {projects[activeProject].key_features.map((feature, index) => (
                      <li key={index} className="flex items-center text-white/70">
                        <span className="text-purple mr-2">•</span> {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {projects[activeProject].composition && (
                  <div className="border border-white/10 rounded-xl p-4 mt-4 backdrop-blur-sm bg-black-200/30">
                    <h3 className="text-lg font-bold mb-3 flex items-center">
                      <Info size={18} className="mr-2" /> Composition Details
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-white/50 mb-2">Primitives Used:</h4>
                        <div className="flex flex-wrap gap-2">
                          {projects[activeProject].composition.primitives.map((primitive, index) => (
                            <span key={index} className="bg-purple/20 border border-purple/30 px-3 py-1 rounded-full text-sm">
                              {primitive}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-white/50 mb-2">Connections:</h4>
                        <ul className="space-y-1">
                          {projects[activeProject].composition.connections.map((connection, index) => (
                            <li key={index} className="text-sm text-white/70">
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
            <div className="border border-white/10 rounded-xl flex flex-col backdrop-blur-sm bg-black-200/50">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-lg font-bold">Interactive Preview</h3>
              </div>
              <div className="flex-1 p-4 flex items-center justify-center bg-black-300/50">
                <div className="text-center">
                  <p className="text-white/70 mb-4">Preview for {projects[activeProject].name}</p>
                  <img 
                    src="/api/placeholder/320/240" 
                    alt={`${projects[activeProject].name} interface`}
                    className="border border-white/10 rounded-lg"
                  />
                  <button className="mt-6 px-6 py-3 bg-purple hover:bg-purple/80 rounded-xl font-bold transition-all">
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
                className={`px-3 py-2 whitespace-nowrap rounded-lg ${
                  activeProject === index 
                    ? "bg-purple text-white" 
                    : "border border-white/10 hover:border-purple/50"
                }`}
              >
                {project.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DefiProjectsShowcase;