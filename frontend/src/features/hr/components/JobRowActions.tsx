import { Eye, MoreHorizontal, Pencil, RotateCcw, Trash2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/sonner';
import { useUpdateJobMutation } from '@/features/hr/api/hrJobsApi';
import { JOB_STATUS } from '@/constants/job-status';
import { hrApplicantsPath, hrJobEditPath } from '@/constants/routes';
import type { Job } from '@/types/job';
import { getApiErrorMessage } from '@/utils/api-error';

import { DeleteJobDialog } from './DeleteJobDialog';

interface JobRowActionsProps {
  job: Job;
}

/**
 * Row-level actions for a job: edit, view applicants, close/reopen, and delete.
 * Mutations are disabled while in flight to prevent duplicate requests, and each
 * reports success or failure through a toast.
 */
export function JobRowActions({ job }: JobRowActionsProps) {
  const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation();
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isPublished = job.status === JOB_STATUS.PUBLISHED;
  const isClosed = job.status === JOB_STATUS.CLOSED;

  const changeStatus = async (status: typeof JOB_STATUS.CLOSED | typeof JOB_STATUS.PUBLISHED) => {
    try {
      await updateJob({ id: job.id, data: { status } }).unwrap();
      toast.success(status === JOB_STATUS.CLOSED ? 'Job closed.' : 'Job reopened.');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleConfirmClose = async () => {
    await changeStatus(JOB_STATUS.CLOSED);
    setIsCloseDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Actions for ${job.title}`}
            disabled={isUpdating}
          >
            <MoreHorizontal aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link to={hrJobEditPath(job.id)}>
              <Pencil aria-hidden="true" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={hrApplicantsPath(job.id)}>
              <Eye aria-hidden="true" />
              View applicants
            </Link>
          </DropdownMenuItem>

          {isPublished ? (
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                setIsCloseDialogOpen(true);
              }}
              disabled={isUpdating}
            >
              <XCircle aria-hidden="true" />
              Close job
            </DropdownMenuItem>
          ) : null}

          {isClosed ? (
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                void changeStatus(JOB_STATUS.PUBLISHED);
              }}
              disabled={isUpdating}
            >
              <RotateCcw aria-hidden="true" />
              Reopen job
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setIsDeleteDialogOpen(true);
            }}
            className="text-danger focus:text-danger"
          >
            <Trash2 aria-hidden="true" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationDialog
        open={isCloseDialogOpen}
        onOpenChange={setIsCloseDialogOpen}
        title="Close job"
        description={`"${job.title}" will stop accepting new applications. You can reopen it later.`}
        confirmLabel="Close job"
        onConfirm={handleConfirmClose}
        isConfirming={isUpdating}
      />

      <DeleteJobDialog job={job} open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} />
    </>
  );
}
