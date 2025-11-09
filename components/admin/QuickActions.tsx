"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Download, 
  FileText, 
  UserPlus,
  BarChart3
} from "lucide-react";

interface QuickActionsProps {
  onExport: () => void;
  onGenerateReport: () => void;
  onBulkAction: () => void;
}

export function QuickActions({
  onExport,
  onGenerateReport,
  onBulkAction,
}: QuickActionsProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            onClick={onExport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onGenerateReport}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onBulkAction}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Bulk Actions
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2 ml-auto"
          >
            <BarChart3 className="h-4 w-4" />
            View Analytics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}