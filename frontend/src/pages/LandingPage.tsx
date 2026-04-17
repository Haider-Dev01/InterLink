import { TemplatePage } from '../components/TemplatePage';
import { setupLandingPage } from '../lib/pageBehaviors';
import { landingPageHtml } from '../lib/pageSources';

export default function LandingPage() {
  return <TemplatePage pageKey="landing" rawHtml={landingPageHtml} setup={setupLandingPage} />;
}
