'use client';

import type * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AssetDetailTabsProps {
  defaultValue?: string;
  overview: React.ReactNode;
  trend: React.ReactNode;
  records: React.ReactNode;
  labels: {
    overview: string;
    trend: string;
    records: string;
  };
}

export function AssetDetailTabs({
  defaultValue = 'overview',
  overview,
  trend,
  records,
  labels,
}: AssetDetailTabsProps) {
  return (
    <Tabs defaultValue={defaultValue} className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="overview">{labels.overview}</TabsTrigger>
        <TabsTrigger value="trend">{labels.trend}</TabsTrigger>
        <TabsTrigger value="records">{labels.records}</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">{overview}</TabsContent>
      <TabsContent value="trend">{trend}</TabsContent>
      <TabsContent value="records">{records}</TabsContent>
    </Tabs>
  );
}
