import React from 'react';
import { Metadata } from 'next';
import { 
  CircleDollarSign, 
  TrendingUp, 
  Shield, 
  Activity,
  ArrowRight
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard - MoveMatrix',
  description: 'MoveMatrix dashboard for managing DeFi primitives and compositions',
};

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your MoveMatrix activities and compositions.
          </p>
        </div>


        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>DeFi Primitives</CardTitle>
              <CardDescription>
                Explore and configure the building blocks for your DeFi products.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="rounded-md bg-muted p-4">
                <div className="text-sm font-medium">Available Primitives</div>
                <div className="mt-2 flex gap-2">
                  <div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium">Lending</div>
                  <div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium">Swap</div>
                </div>
              </div>
              <Link href="/primitives" passHref>
                <Button variant="outline" className="w-full justify-between">
                  Manage Primitives <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compositions</CardTitle>
              <CardDescription>
                Create and manage your compositions from multiple primitives.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="rounded-md bg-muted p-4">
                <div className="text-sm font-medium">Recent Compositions</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Leveraged Yield Farming, CDP with Protection
                </div>
              </div>
              <Link href="/compositions" passHref>
                <Button variant="outline" className="w-full justify-between">
                  Build Compositions <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Example Products</CardTitle>
              <CardDescription>
                Explore pre-built example products using our primitives.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="rounded-md bg-muted p-4">
                <div className="text-sm font-medium">Featured Examples</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Leveraged Yield Farming, CDP with Protection
                </div>
              </div>
              <Link href="/examples" passHref>
                <Button variant="outline" className="w-full justify-between">
                  View Examples <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
} 