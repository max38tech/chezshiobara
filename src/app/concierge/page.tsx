import { PageContentWrapper } from '@/components/layout/page-content-wrapper';
import { PageTitle } from '@/components/ui/page-title';
import { AiConciergeForm } from '@/components/specific/concierge/ai-concierge-form';

export default function AiConciergePage() {
  return (
    <PageContentWrapper>
      <PageTitle>AI Powered Local Concierge</PageTitle>
      <p className="font-body text-lg text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
        Looking for things to do around Shiobara? Our AI assistant can provide personalized suggestions for attractions, dining, and unique experiences.
      </p>
      <AiConciergeForm />
    </PageContentWrapper>
  );
}
