'use client';

import React from 'react';
import { EvaluationReport, EvaluationScenario } from '@/types/api';
import { ProviderEvaluationWizardModal } from '../wizard/ProviderEvaluationWizardModal';

interface NewEvaluationModalProps {
  scenarios: EvaluationScenario[];
  onClose: () => void;
  onEvaluationCreated: (report: EvaluationReport) => void;
  initialScenarioId?: string;
}

export const NewEvaluationModal: React.FC<NewEvaluationModalProps> = ({
  scenarios,
  onClose,
  onEvaluationCreated,
  initialScenarioId,
}) => {
  return (
    <ProviderEvaluationWizardModal
      isOpen={true}
      onClose={onClose}
      scenarios={scenarios}
      initialScenarioId={initialScenarioId}
      isBackendConnected={true}
      onEvaluationCreated={onEvaluationCreated}
      onRequireProviderModal={onClose}
    />
  );
};
