
export default function Console() {
  const REPORT_ID = "7b61550e-f1fd-4ce9-8cc3-97f642278bd3"; // ← MODIFICATION
  const PAGE_ID   = "p_unu6wznuvd"; // ← MODIFICATION
  const src = `https://lookerstudio.google.com/embed/reporting/${REPORT_ID}/page/${PAGE_ID}`;
  return (
    <div className="ratio ratio-16x9"> {/* Bootstrap responsive */}
      <iframe width="600" height="849" src="https://lookerstudio.google.com/embed/reporting/7b61550e-f1fd-4ce9-8cc3-97f642278bd3/page/4uTWF" frameBorder="0" style={{ border: 0 }}allowFullScreen sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"></iframe>
    </div>
  );
}
