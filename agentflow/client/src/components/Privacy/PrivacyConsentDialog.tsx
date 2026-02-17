import { Dialog, DialogButton } from 'konsta/react';

interface PrivacyConsentDialogProps {
  opened: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function PrivacyConsentDialog({ opened, onAccept, onDecline }: PrivacyConsentDialogProps) {
  return (
    <Dialog
      opened={opened}
      title="Privacy Notice"
      content={
        <p className="text-sm text-slate-300">
          Voice and image data will be sent to OpenAI for processing. No data is stored
          permanently on our servers. By continuing, you consent to this processing.
        </p>
      }
      buttons={
        <>
          <DialogButton onClick={onDecline}>Cancel</DialogButton>
          <DialogButton strong onClick={onAccept}>Continue</DialogButton>
        </>
      }
    />
  );
}
