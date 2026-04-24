import { TemplatePage } from '../components/TemplatePage';
import { setupAnalyseCvPage } from '../lib/pageBehaviors';
import { analyseCvHtml } from '../lib/pageSources';
import { cvService } from '../services/cvService';

export default function AnalyseCvPage() {
  const handleUploadCv = async (file: File) => {
    return await cvService.uploadCv(file);
  };
  
  const handleGetMyCv = async () => {
    return await cvService.getMyCv();
  };

  return <TemplatePage pageKey="analyse-cv" rawHtml={analyseCvHtml} setup={(args) => setupAnalyseCvPage({ ...args, onUpload: handleUploadCv, onGetMyCv: handleGetMyCv })} />;
}
