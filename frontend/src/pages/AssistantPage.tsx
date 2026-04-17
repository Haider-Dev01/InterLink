import { TemplatePage } from '../components/TemplatePage';
import { setupAssistantPage } from '../lib/pageBehaviors';
import { assistantIaHtml } from '../lib/pageSources';

export default function AssistantPage() {
  return <TemplatePage pageKey="assistant" rawHtml={assistantIaHtml} setup={setupAssistantPage} />;
}
