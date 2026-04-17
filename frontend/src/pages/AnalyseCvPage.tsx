import { TemplatePage } from '../components/TemplatePage';
import { setupAnalyseCvPage } from '../lib/pageBehaviors';
import { analyseCvHtml } from '../lib/pageSources';

export default function AnalyseCvPage() {
  return <TemplatePage pageKey="analyse-cv" rawHtml={analyseCvHtml} setup={setupAnalyseCvPage} />;
}
