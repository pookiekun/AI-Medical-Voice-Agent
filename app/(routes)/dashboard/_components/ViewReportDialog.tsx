import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SessionDetail } from "./HistoryTable";

type Props = {
  sessionDetail: import("./HistoryTable").SessionDetail;
  trigger?: React.ReactNode;
};

export function ViewReportDialog({ sessionDetail, trigger }: Props) {
  const { report } = sessionDetail || {};
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">View Report</Button>}
      </DialogTrigger>
      <DialogContent>
        <h2 className="text-center text-2xl font-bold mb-2">Medical AI Voice Agent Report</h2>
        <DialogHeader>
          <DialogTitle asChild>
            <span className="text-lg font-semibold">Session Details</span>
          </DialogTitle>
          <DialogDescription>
            {report ? (
              <pre className="whitespace-pre-wrap text-xs bg-gray-100 p-2 rounded-md overflow-x-auto max-h-96">
                {typeof report === "string"
                  ? report
                  : JSON.stringify(report, null, 2)}
              </pre>
            ) : (
              <span>No report available for this session.</span>
            )}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default ViewReportDialog;
