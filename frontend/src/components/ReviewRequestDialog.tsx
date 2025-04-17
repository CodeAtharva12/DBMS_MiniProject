import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";

interface ReviewRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestData: {
    id: string;
    hospital: string;
    doctor: string;
    email: string;
    phone: string;
    patient: string;
    patientAge: number;
    bloodGroup: string;
    units: number;
    requiredBy: string;
    purpose: string;
    status: string;
    notes: string;
  };
  adminNotes: string;
  onNotesChange: (notes: string) => void;
  onApprove: () => void;
  onReject: () => void;
}

const ReviewRequestDialog: React.FC<ReviewRequestDialogProps> = ({
  open,
  onOpenChange,
  requestData,
  adminNotes,
  onNotesChange,
  onApprove,
  onReject,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-hidden p-0">
        <div className="flex flex-col md:flex-row">
          {/* Left side - Header and main request information */}
          <div className="md:w-1/2 p-6 bg-white">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl">Review Request</DialogTitle>
              <DialogDescription>
                Request #{requestData.id.split("REQ")[1] || requestData.id} from{" "}
                {requestData.hospital}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-500">Blood Group</Label>
                <p className="font-medium">{requestData.bloodGroup}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Units</Label>
                <p className="font-medium">{requestData.units}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Blood Bank</Label>
                <p className="font-medium">LIFESTREAM+</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Required By</Label>
                <p className="font-medium">{requestData.requiredBy}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Purpose</Label>
                <p className="font-medium">{requestData.purpose}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Status</Label>
                <div className="inline-block px-3 py-1 mt-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                  Pending
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Hospital and patient info */}
          <div className="md:w-1/2 p-6 bg-gray-50 border-t md:border-l md:border-t-0">
            <h3 className="font-semibold text-lg mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-500">Doctor</Label>
                <p className="font-medium">{requestData.doctor}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Email</Label>
                <p className="font-medium">{requestData.email}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Phone</Label>
                <p className="font-medium">{requestData.phone}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Patient</Label>
                <p className="font-medium">
                  {requestData.patient} ({requestData.patientAge} years)
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Admin Notes</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => onNotesChange(e.target.value)}
                  placeholder="Add notes about this request (required for rejection)"
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 bg-gray-50 border-t flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onReject}
            className="bg-red-600 text-white"
          >
            <X className="h-4 w-4 mr-2" /> Reject
          </Button>
          <Button
            variant="default"
            onClick={onApprove}
            className="bg-green-600 text-white"
          >
            <Check className="h-4 w-4 mr-2" /> Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewRequestDialog;
