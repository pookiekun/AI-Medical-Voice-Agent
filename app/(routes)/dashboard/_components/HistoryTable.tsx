import React from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import ViewReportDialog from './ViewReportDialog'

interface doctorAgent {
  id: number;
  specialist: string;
  description: string;
  image: string;
  agentPrompt: string;
  voiceId: string;
}

export type SessionDetail = {
  id: number;
  notes: string;
  sessionId: string;
  report: JSON;
  selectedDoctor: doctorAgent;
  createdOn: string;
}

type Props = {
  historyList: SessionDetail[];
}

function HistoryTable({ historyList }: Props) {
  return (
    <div>
      <Table>
        <TableCaption>Previous Consultation Reports</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">AI Medical Specialist</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {historyList.map((record: SessionDetail, index: number) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{record.selectedDoctor?.specialist}</TableCell>
              <TableCell>{record.notes}</TableCell>
              <TableCell>{record.createdOn}</TableCell>
              <TableCell className="text-right">
                <ViewReportDialog sessionDetail={record} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default HistoryTable
