import { Dialog, DialogButton } from 'konsta/react';
import { useT } from '../../i18n';

interface PrivacyConsentDialogProps {
  opened: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function PrivacyConsentDialog({ opened, onAccept, onDecline }: PrivacyConsentDialogProps) {
  const t = useT();

  return (
    <Dialog
      opened={opened}
      title={t('privacy.title')}
      content={
        <p className="text-sm text-slate-300">
          {t('privacy.description')}
        </p>
      }
      buttons={
        <>
          <DialogButton onClick={onDecline}>{t('privacy.cancel')}</DialogButton>
          <DialogButton strong onClick={onAccept}>{t('privacy.continue')}</DialogButton>
        </>
      }
    />
  );
}
