"use client";

import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, CreditCard, Key, Lock, Save, User, Wallet } from "lucide-react";

export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-8 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold text-white mb-2">
              Settings
            </h1>
            <p className="text-white/60">
              Manage your account settings and preferences
            </p>
          </div>
          <Button className="bg-gradient-to-r from-purple to-purple/80 hover:from-purple/90 hover:to-purple/70 text-white rounded-xl gap-2 transition-all duration-300">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8 bg-black/50 border border-white/10 rounded-xl p-1">
            <TabsTrigger value="profile" className="data-[state=active]:bg-purple/20 data-[state=active]:text-purple rounded-lg transition-all">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-purple/20 data-[state=active]:text-purple rounded-lg transition-all">
              <Lock className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-purple/20 data-[state=active]:text-purple rounded-lg transition-all">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-purple/20 data-[state=active]:text-purple rounded-lg transition-all">
              <CreditCard className="h-4 w-4 mr-2" />
              Billing
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="border border-white/10 backdrop-blur-sm bg-black/50 p-6 rounded-xl">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-purple/20 flex items-center justify-center">
                    <User className="h-10 w-10 text-purple" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Profile Picture</h3>
                    <p className="text-sm text-white/60">Upload a new profile picture</p>
                  </div>
                  <Button className="ml-auto bg-purple/20 hover:bg-purple/30 text-purple rounded-xl">
                    Change
                  </Button>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-white/70">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      className="bg-black/50 border-white/10 text-white placeholder:text-white/40 focus:border-purple/50"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-white/70">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="bg-black/50 border-white/10 text-white placeholder:text-white/40 focus:border-purple/50"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bio" className="text-white/70">Bio</Label>
                    <Input
                      id="bio"
                      placeholder="Tell us about yourself"
                      className="bg-black/50 border-white/10 text-white placeholder:text-white/40 focus:border-purple/50"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="border border-white/10 backdrop-blur-sm bg-black/50 p-6 rounded-xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-purple/20 text-purple">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Two-Factor Authentication</h3>
                      <p className="text-sm text-white/60">Add an extra layer of security to your account</p>
                    </div>
                  </div>
                  <Switch className="data-[state=checked]:bg-purple" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-purple/20 text-purple">
                      <Key className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">API Keys</h3>
                      <p className="text-sm text-white/60">Manage your API access keys</p>
                    </div>
                  </div>
                  <Button className="bg-purple/20 hover:bg-purple/30 text-purple rounded-xl">
                    Manage
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-purple/20 text-purple">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Connected Wallets</h3>
                      <p className="text-sm text-white/60">Manage your connected wallets</p>
                    </div>
                  </div>
                  <Button className="bg-purple/20 hover:bg-purple/30 text-purple rounded-xl">
                    View
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="border border-white/10 backdrop-blur-sm bg-black/50 p-6 rounded-xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">Email Notifications</h3>
                    <p className="text-sm text-white/60">Receive updates via email</p>
                  </div>
                  <Switch className="data-[state=checked]:bg-purple" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">Push Notifications</h3>
                    <p className="text-sm text-white/60">Receive push notifications</p>
                  </div>
                  <Switch className="data-[state=checked]:bg-purple" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">Marketing Emails</h3>
                    <p className="text-sm text-white/60">Receive marketing and promotional emails</p>
                  </div>
                  <Switch className="data-[state=checked]:bg-purple" />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <Card className="border border-white/10 backdrop-blur-sm bg-black/50 p-6 rounded-xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-purple/20 text-purple">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Current Plan</h3>
                      <p className="text-sm text-white/60">Pro Plan - $29/month</p>
                    </div>
                  </div>
                  <Button className="bg-purple/20 hover:bg-purple/30 text-purple rounded-xl">
                    Upgrade
                  </Button>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="card" className="text-white/70">Payment Method</Label>
                    <Input
                      id="card"
                      placeholder="**** **** **** 4242"
                      className="bg-black/50 border-white/10 text-white placeholder:text-white/40 focus:border-purple/50"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="billing" className="text-white/70">Billing Address</Label>
                    <Input
                      id="billing"
                      placeholder="Enter your billing address"
                      className="bg-black/50 border-white/10 text-white placeholder:text-white/40 focus:border-purple/50"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
} 