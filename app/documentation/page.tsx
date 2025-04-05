"use client";

import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Book, Code, FileText, Github, Globe, Terminal } from "lucide-react";
import Link from "next/link";

export default function DocumentationPage() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-12 pb-20">
        {/* Header */}
        <div className="text-center">
          <p className="uppercase tracking-widest text-xs text-white/60 mb-4">
            DOCUMENTATION
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-6 max-w-4xl mx-auto">
            Build DeFi <span className="text-purple">Visually</span>
          </h1>
          <p className="text-white/60 mb-8 text-base md:text-lg lg:text-xl max-w-[90%] md:max-w-[80%] mx-auto">
            Learn how to compose DeFi primitives and generate production-ready Move code for the Aptos blockchain
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/documentation/getting-started" passHref>
            <Card className="border border-white/10 backdrop-blur-sm bg-black/50 p-6 rounded-xl group hover:border-purple/50 transition-all cursor-pointer hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-purple/20 text-purple group-hover:bg-purple/30 transition-colors">
                  <Terminal className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Getting Started</h3>
                  <p className="text-sm text-white/70">Quick start guide</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/documentation/primitives" passHref>
            <Card className="border border-white/10 backdrop-blur-sm bg-black/50 p-6 rounded-xl group hover:border-purple/50 transition-all cursor-pointer hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-purple/20 text-purple group-hover:bg-purple/30 transition-colors">
                  <Code className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Primitives</h3>
                  <p className="text-sm text-white/70">DeFi building blocks</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/documentation/compositions" passHref>
            <Card className="border border-white/10 backdrop-blur-sm bg-black/50 p-6 rounded-xl group hover:border-purple/50 transition-all cursor-pointer hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-purple/20 text-purple group-hover:bg-purple/30 transition-colors">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Compositions</h3>
                  <p className="text-sm text-white/70">Build complex products</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/documentation/api" passHref>
            <Card className="border border-white/10 backdrop-blur-sm bg-black/50 p-6 rounded-xl group hover:border-purple/50 transition-all cursor-pointer hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-purple/20 text-purple group-hover:bg-purple/30 transition-colors">
                  <Globe className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">API Reference</h3>
                  <p className="text-sm text-white/70">Integration guide</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Navigation */}
          <div className="md:col-span-1">
            <Card className="border border-white/10 backdrop-blur-sm bg-black/50 p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4 text-white">Contents</h2>
              <nav className="space-y-2">
                <Link href="#introduction" className="block text-white/70 hover:text-purple transition-colors">
                  Introduction
                </Link>
                <Link href="#architecture" className="block text-white/70 hover:text-purple transition-colors">
                  Architecture
                </Link>
                <Link href="#primitives" className="block text-white/70 hover:text-purple transition-colors">
                  Primitives
                </Link>
                <Link href="#compositions" className="block text-white/70 hover:text-purple transition-colors">
                  Compositions
                </Link>
                <Link href="#deployment" className="block text-white/70 hover:text-purple transition-colors">
                  Deployment
                </Link>
              </nav>
            </Card>
          </div>

          {/* Right Column - Content */}
          <div className="md:col-span-2 space-y-8">
            <Card className="border border-white/10 backdrop-blur-sm bg-black/50 p-6 rounded-xl">
              <h2 id="introduction" className="text-2xl font-semibold mb-4 text-white">Introduction</h2>
              <p className="text-white/70 mb-4">
                MoveMatrix is a platform for building and deploying DeFi products on the Move blockchain.
                It provides a set of pre-built primitives that can be composed into complex financial products.
              </p>
              <div className="flex gap-4 mt-6">
                <Button className="bg-gradient-to-r from-purple to-purple/80 hover:from-purple/90 hover:to-purple/70 text-white rounded-xl gap-2 transition-all duration-300">
                  <Book className="h-4 w-4" />
                  Read More
                </Button>
                <Button variant="outline" className="border-white/10 text-purple/70 hover:text-purple hover:border-purple/50 rounded-xl gap-2 transition-all duration-300">
                  <Github className="h-4 w-4" />
                  View on GitHub
                </Button>
              </div>
            </Card>

            <Card className="border border-white/10 backdrop-blur-sm bg-black/50 p-6 rounded-xl">
              <h2 id="architecture" className="text-2xl font-semibold mb-4 text-white">Architecture</h2>
              <p className="text-white/70 mb-4">
                MoveMatrix is built on a modular architecture that allows for easy composition of DeFi primitives.
                Each primitive is a self-contained module that can be used independently or composed with others.
              </p>
              <div className="mt-6">
                <Button className="bg-gradient-to-r from-purple to-purple/80 hover:from-purple/90 hover:to-purple/70 text-white rounded-xl gap-2 transition-all duration-300">
                  Learn More
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            <Card className="border border-white/10 backdrop-blur-sm bg-black/50 p-6 rounded-xl">
              <h2 id="primitives" className="text-2xl font-semibold mb-4 text-white">Primitives</h2>
              <p className="text-white/70 mb-4">
                Primitives are the building blocks of DeFi products. They provide core functionality like lending,
                swapping, and staking that can be composed into more complex products.
              </p>
              <div className="mt-6">
                <Button className="bg-gradient-to-r from-purple to-purple/80 hover:from-purple/90 hover:to-purple/70 text-white rounded-xl gap-2 transition-all duration-300">
                  Explore Primitives
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            <Card className="border border-white/10 backdrop-blur-sm bg-black/50 p-6 rounded-xl">
              <h2 id="compositions" className="text-2xl font-semibold mb-4 text-white">Compositions</h2>
              <p className="text-white/70 mb-4">
                Compositions are complex DeFi products built by combining multiple primitives.
                They can be customized to meet specific requirements and deployed to the Move blockchain.
              </p>
              <div className="mt-6">
                <Button className="bg-gradient-to-r from-purple to-purple/80 hover:from-purple/90 hover:to-purple/70 text-white rounded-xl gap-2 transition-all duration-300">
                  View Examples
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            <Card className="border border-white/10 backdrop-blur-sm bg-black/50 p-6 rounded-xl">
              <h2 id="deployment" className="text-2xl font-semibold mb-4 text-white">Deployment</h2>
              <p className="text-white/70 mb-4">
                Deploy your compositions to the Move blockchain with a single click.
                MoveMatrix handles all the complexity of deployment and ensures your products are secure.
              </p>
              <div className="mt-6">
                <Button className="bg-gradient-to-r from-purple to-purple/80 hover:from-purple/90 hover:to-purple/70 text-white rounded-xl gap-2 transition-all duration-300">
                  Deploy Guide
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Examples Button */}
        <div className="flex justify-center mt-8">
          <Link href="/documentation/examples">
            <Button className="bg-gradient-to-r from-black to-black/90 hover:from-black/90 hover:to-black/80 text-white border border-white/20 px-8 py-6 text-lg rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              View Examples
            </Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
