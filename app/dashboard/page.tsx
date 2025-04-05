"use client";

import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, FileText, Plus, Settings, Wallet } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Compositions",
      value: "12",
      change: "+2",
      changeType: "positive",
    },
    {
      title: "Active Deployments",
      value: "5",
      change: "+1",
      changeType: "positive",
    },
    {
      title: "Total TVL",
      value: "$1.2M",
      change: "-$50K",
      changeType: "negative",
    },
    {
      title: "Users",
      value: "342",
      change: "+28",
      changeType: "positive",
    },
  ];

  const quickActions = [
    {
      title: "New Composition",
      description: "Create a new DeFi product",
      icon: <Plus className="h-5 w-5" />,
      href: "/compositions/new",
    },
    {
      title: "View Analytics",
      description: "Check performance metrics",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/analytics",
    },
    {
      title: "Manage Wallet",
      description: "Connect or switch wallets",
      icon: <Wallet className="h-5 w-5" />,
      href: "/wallet",
    },
    {
      title: "Settings",
      description: "Configure your preferences",
      icon: <Settings className="h-5 w-5" />,
      href: "/settings",
    },
  ];

  const recentActivity = [
    {
      title: "Leveraged Yield Farming deployed",
      time: "2 hours ago",
      type: "deployment",
    },
    {
      title: "Borrow-Swap-Stake composition created",
      time: "1 day ago",
      type: "creation",
    },
    {
      title: "Dynamic Liquidity Rebalancer updated",
      time: "3 days ago",
      type: "update",
    },
    {
      title: "New primitive added: Flash Loan",
      time: "1 week ago",
      type: "addition",
    },
  ];

  return (
    <MainLayout>
      <div className="flex flex-col gap-8 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold text-white mb-2">
              Welcome back, <span className="text-purple">User</span>
            </h1>
            <p className="text-white/60">
              Here's what's happening with your DeFi products
            </p>
          </div>
          <Link href="/compositions/new">
            <Button className="bg-gradient-to-r from-purple to-purple/80 hover:from-purple/90 hover:to-purple/70 text-white rounded-xl gap-2 transition-all duration-300">
              <Plus className="h-4 w-4" />
              New Composition
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="border border-white/10 backdrop-blur-sm bg-black/50 p-6 rounded-xl group hover:border-purple/50 transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            >
              <h3 className="text-sm font-medium text-white/70 mb-1">{stat.title}</h3>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-semibold text-white">{stat.value}</p>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    stat.changeType === "positive"
                      ? "bg-green-500/20 text-green-500"
                      : "bg-red-500/20 text-red-500"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link href={action.href} key={index}>
                <Card className="border border-white/10 backdrop-blur-sm bg-black/50 p-6 rounded-xl group hover:border-purple/50 transition-all cursor-pointer hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-purple/20 text-purple group-hover:bg-purple/30 transition-colors">
                      {action.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{action.title}</h3>
                      <p className="text-sm text-white/70">{action.description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-white/30 group-hover:text-purple transition-colors ml-auto" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
          <Card className="border border-white/10 backdrop-blur-sm bg-black/50 p-6 rounded-xl">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 pb-4 border-b border-white/10 last:border-0 last:pb-0"
                >
                  <div className="p-2 rounded-lg bg-purple/20 text-purple">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{activity.title}</h3>
                    <p className="text-sm text-white/60">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
} 