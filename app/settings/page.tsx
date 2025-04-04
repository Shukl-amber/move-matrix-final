import React from 'react';
import { Metadata } from 'next';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const metadata: Metadata = {
  title: 'Settings - MoveMatrix',
  description: 'Configure your MoveMatrix settings',
};

export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your preferences and account settings.
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Blockchain Settings</CardTitle>
              <CardDescription>
                Configure your blockchain network and connection settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="font-medium text-sm">Network</div>
                <Select defaultValue="mainnet">
                  <SelectTrigger>
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mainnet">Aptos Mainnet</SelectItem>
                    <SelectItem value="testnet">Aptos Testnet</SelectItem>
                    <SelectItem value="devnet">Aptos Devnet</SelectItem>
                    <SelectItem value="local">Local Network</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="font-medium text-sm">RPC Endpoint</div>
                <Input 
                  placeholder="https://fullnode.mainnet.aptoslabs.com/v1" 
                  defaultValue="https://fullnode.mainnet.aptoslabs.com/v1"
                />
              </div>
              
              <div className="space-y-2">
                <div className="font-medium text-sm">Gas Price Strategy</div>
                <Select defaultValue="standard">
                  <SelectTrigger>
                    <SelectValue placeholder="Select gas price strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button>Save Blockchain Settings</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>User Preferences</CardTitle>
              <CardDescription>
                Customize your experience with MoveMatrix.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="font-medium text-sm">Default Transaction Confirmation</div>
                <Select defaultValue="1">
                  <SelectTrigger>
                    <SelectValue placeholder="Select confirmations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 confirmation</SelectItem>
                    <SelectItem value="2">2 confirmations</SelectItem>
                    <SelectItem value="3">3 confirmations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="font-medium text-sm">Auto-refresh Interval (seconds)</div>
                <Input 
                  type="number" 
                  min="5"
                  max="60"
                  defaultValue="15"
                />
              </div>
              
              <Button>Save Preferences</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>About MoveMatrix</CardTitle>
              <CardDescription>
                Information about the current version of MoveMatrix.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="font-medium text-sm">Version</div>
                <div className="text-sm text-muted-foreground">1.0.0-beta</div>
              </div>
              
              <div className="space-y-1">
                <div className="font-medium text-sm">Built With</div>
                <div className="text-sm text-muted-foreground">Next.js, Aptos, Move</div>
              </div>
              
              <div className="space-y-1">
                <div className="font-medium text-sm">License</div>
                <div className="text-sm text-muted-foreground">MIT License</div>
              </div>
              
              <Button variant="outline">Check for Updates</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
} 