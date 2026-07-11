import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { Textarea } from '@/components/ui/textarea';
import { useApplyToJobMutation } from '@/features/applications/api/applicationsApi';
import type { ApplyRequest } from '@/types/application';
import { getApiErrorMessage } from '@/utils/api-error';

const COVER_LETTER_MAX_LENGTH = 5000;

export interface ApplyDialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when the dialog requests to open or close. */
  onOpenChange: (open: boolean) => void;
  /** The job being applied to. */
  jobId: string;
  /** The job title, shown in the dialog description for context. */
  jobTitle: string;
}

/** A modal form for submitting an application to a job. Both fields optional. */
export function ApplyDialog({ open, onOpenChange, jobId, jobTitle }: ApplyDialogProps) {
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [applyToJob, { isLoading }] = useApplyToJobMutation();

  function resetForm(): void {
    setCoverLetter('');
    setResumeUrl('');
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const trimmedCoverLetter = coverLetter.trim();
    const trimmedResumeUrl = resumeUrl.trim();

    const payload: ApplyRequest = {
      jobId,
      ...(trimmedCoverLetter ? { coverLetter: trimmedCoverLetter } : {}),
      ...(trimmedResumeUrl ? { resumeUrl: trimmedResumeUrl } : {}),
    };

    try {
      await applyToJob(payload).unwrap();
      toast.success('Application submitted.');
      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply to this role</DialogTitle>
          <DialogDescription>
            Submitting your application for {jobTitle}. Both fields are optional.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="apply-cover-letter">Cover letter</Label>
            <Textarea
              id="apply-cover-letter"
              value={coverLetter}
              onChange={(event) => setCoverLetter(event.target.value)}
              maxLength={COVER_LETTER_MAX_LENGTH}
              rows={6}
              placeholder="Tell the hiring team why you're a great fit (optional)."
              disabled={isLoading}
            />
            <p className="text-caption text-foreground-muted">
              {coverLetter.length}/{COVER_LETTER_MAX_LENGTH}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="apply-resume-url">Resume URL</Label>
            <Input
              id="apply-resume-url"
              type="url"
              value={resumeUrl}
              onChange={(event) => setResumeUrl(event.target.value)}
              placeholder="https://example.com/resume.pdf"
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" isLoading={isLoading}>
              Submit application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
