const fs = require('fs');
const path = './app/admin/resume/resume-collections-cms.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace react imports
content = content.replace(
  'import { useMemo, useState, type ReactNode } from "react";',
  'import { useMemo, useState, useEffect, useTransition, type ReactNode } from "react";'
);

// Replace mock-content imports with Prisma and Actions
content = content.replace(
  /import \{\s*certificates,\s*education,\s*experiences,\s*type CertificateItem,\s*type EducationItem,\s*type ExperienceItem,\s*\} from "@\/lib\/mock-content";/g,
  `import type { Experience as ExperienceRecord, Education as EducationRecord, Certificate as CertificateRecord } from "@prisma/client";
import { adminDeleteExperience, adminSaveExperience, adminDeleteEducation, adminSaveEducation, adminDeleteCertificate, adminSaveCertificate } from "./resume.actions";`
);

// Remove mock specific Record typings and add formatUpdatedAt
const recordRegex = /type ExperienceRecord = .*?};\s*type EducationRecord = .*?};\s*type CertificateRecord = .*?};/s;
content = content.replace(
  recordRegex,
  `function formatUpdatedAt(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(date));
}`
);

// Remove seed records
const seedRegex = /const experienceSeedRecords.*?\];\s*const educationSeedRecords.*?\];\s*const certificateSeedRecords.*?\];/s;
content = content.replace(seedRegex, '');

// Fix ExperienceManager
content = content.replace(
  /type ExperienceManagerProps = \{\s*setFeedback: \(feedback: FeedbackState\) => void;\s*\};/s,
  `type ExperienceManagerProps = { initialItems: ExperienceRecord[]; setFeedback: (feedback: FeedbackState) => void; };`
);
content = content.replace(
  /function ExperienceManager\(\{ setFeedback \}: ExperienceManagerProps\) \{\s*const \[items, setItems\] = useState\(experienceSeedRecords\);/s,
  `function ExperienceManager({ initialItems, setFeedback }: ExperienceManagerProps) {
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();
  useEffect(() => { setItems(initialItems); }, [initialItems]);`
);
content = content.replace(
  /function handleSubmit\(\) \{[\s\S]*?const nextRecord: ExperienceRecord = \{[\s\S]*?\};[\s\S]*?setItems\(\(currentItems\).*?\);[\s\S]*?setCurrentPage\(1\);[\s\S]*?setFeedback\(\{[\s\S]*?detail: \`\$\{nextRecord\.role\} at \$\{nextRecord\.company\} is now reflected in the local resume manager\.\`,[\s\S]*?\}\);[\s\S]*?closeEditor\(\);[\s\S]*?\}/g,
  `function handleSubmit() {
    const nextErrors = validateExperience(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    startTransition(async () => {
      const result = await adminSaveExperience({
        id: editingItem?.id ?? undefined,
        role: values.role.trim(),
        company: values.company.trim(),
        period: values.period.trim(),
        location: values.location.trim(),
        summary: values.summary.trim(),
        achievements: toLines(values.achievementsText),
      });

      if (result.ok) {
        setFeedback({
          title: editingItem ? "Experience updated" : "Experience added",
          detail: result.message,
        });
        closeEditor();
      } else {
        setErrors({ achievementsText: result.message });
      }
    });
  }`
);
content = content.replace(
  /function handleDelete\(item: ExperienceRecord\) \{([\s\S]*?)setFeedback\(\{[\s\S]*?\}\);\s*if \(editingId === item\.id\) \{\s*closeEditor\(\);\s*\}\s*\}/g,
  `function handleDelete(item: ExperienceRecord) {
    startTransition(async () => {
      const result = await adminDeleteExperience(item.id);
      if (result.ok) {
        setFeedback({ title: "Experience removed", detail: result.message });
        if (editingId === item.id) closeEditor();
      }
    });
  }`
);

// Fix EducationManager
content = content.replace(
  /type EducationManagerProps = \{\s*setFeedback: \(feedback: FeedbackState\) => void;\s*\};/s,
  `type EducationManagerProps = { initialItems: EducationRecord[]; setFeedback: (feedback: FeedbackState) => void; };`
);
content = content.replace(
  /function EducationManager\(\{ setFeedback \}: EducationManagerProps\) \{\s*const \[items, setItems\] = useState\(educationSeedRecords\);/s,
  `function EducationManager({ initialItems, setFeedback }: EducationManagerProps) {
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();
  useEffect(() => { setItems(initialItems); }, [initialItems]);`
);
content = content.replace(
  /function handleSubmit\(\) \{([\s\S]*?)const nextRecord: EducationRecord = \{([\s\S]*?)\};([\s\S]*?)setItems\(\(currentItems\).*?\);([\s\S]*?)setCurrentPage\(1\);([\s\S]*?)setFeedback\(\{([\s\S]*?)detail: \`\$\{nextRecord\.school\} now appears in the local education manager\.\`,([\s\S]*?)\}\);([\s\S]*?)closeEditor\(\);([\s\S]*?)\}/g,
  `function handleSubmit() {
    const nextErrors = validateEducation(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    startTransition(async () => {
      const result = await adminSaveEducation({
        id: editingItem?.id ?? undefined,
        degree: values.degree.trim(),
        school: values.school.trim(),
        period: values.period.trim(),
        description: values.description.trim(),
        highlights: toLines(values.highlightsText),
      });

      if (result.ok) {
        setFeedback({ title: editingItem ? "Education updated" : "Education added", detail: result.message });
        closeEditor();
      } else {
        setErrors({ highlightsText: result.message });
      }
    });
  }`
);
content = content.replace(
  /function handleDelete\(item: EducationRecord\) \{([\s\S]*?)setFeedback\(\{[\s\S]*?\}\);\s*if \(editingId === item\.id\) \{\s*closeEditor\(\);\s*\}\s*\}/g,
  `function handleDelete(item: EducationRecord) {
    startTransition(async () => {
      const result = await adminDeleteEducation(item.id);
      if (result.ok) {
        setFeedback({ title: "Education removed", detail: result.message });
        if (editingId === item.id) closeEditor();
      }
    });
  }`
);

// Fix CertificatesManager
content = content.replace(
  /type CertificatesManagerProps = \{\s*setFeedback: \(feedback: FeedbackState\) => void;\s*\};/s,
  `type CertificatesManagerProps = { initialItems: CertificateRecord[]; setFeedback: (feedback: FeedbackState) => void; };`
);
content = content.replace(
  /function CertificatesManager\(\{ setFeedback \}: CertificatesManagerProps\) \{\s*const \[items, setItems\] = useState\(certificateSeedRecords\);/s,
  `function CertificatesManager({ initialItems, setFeedback }: CertificatesManagerProps) {
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();
  useEffect(() => { setItems(initialItems); }, [initialItems]);`
);
content = content.replace(
  /function handleSubmit\(\) \{([\s\S]*?)const nextRecord: CertificateRecord = \{([\s\S]*?)\};([\s\S]*?)setItems\(\(currentItems\).*?\);([\s\S]*?)setCurrentPage\(1\);([\s\S]*?)setFeedback\(\{([\s\S]*?)detail: \`\$\{nextRecord\.name\} was added to the local certificate manager\.\`,([\s\S]*?)\}\);([\s\S]*?)closeEditor\(\);([\s\S]*?)\}/g,
  `function handleSubmit() {
    const nextErrors = validateCertificate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    startTransition(async () => {
      const result = await adminSaveCertificate({
        id: editingItem?.id ?? undefined,
        name: values.name.trim(),
        issuer: values.issuer.trim(),
        year: values.year.trim(),
        verificationLink: values.verificationLink.trim(),
        credentialId: values.credentialId?.trim() || undefined,
        featured: values.featured,
      });

      if (result.ok) {
        setFeedback({ title: editingItem ? "Certificate updated" : "Certificate added", detail: result.message });
        closeEditor();
      } else {
        setErrors({ verificationLink: result.message });
      }
    });
  }`
);
content = content.replace(
  /function handleDelete\(item: CertificateRecord\) \{([\s\S]*?)setFeedback\(\{[\s\S]*?\}\);\s*if \(editingId === item\.id\) \{\s*closeEditor\(\);\s*\}\s*\}/g,
  `function handleDelete(item: CertificateRecord) {
    startTransition(async () => {
      const result = await adminDeleteCertificate(item.id);
      if (result.ok) {
        setFeedback({ title: "Certificate removed", detail: result.message });
        if (editingId === item.id) closeEditor();
      }
    });
  }`
);

// Fix {item.updatedAt} -> {formatUpdatedAt(item.updatedAt)}
content = content.replace(/>\{item\.updatedAt\}<\/Badge>/g, '>{formatUpdatedAt(item.updatedAt)}</Badge>');

// Fix ResumeCollectionsCms component
content = content.replace(
  /export function ResumeCollectionsCms\(\) \{([\s\S]*?)const \[feedback, setFeedback\] = useState<FeedbackState>\(null\);/s,
  `export function ResumeCollectionsCms({
  initialExperiences = [],
  initialEducations = [],
  initialCertificates = [],
}: {
  initialExperiences?: ExperienceRecord[];
  initialEducations?: EducationRecord[];
  initialCertificates?: CertificateRecord[];
}) {
  const [feedback, setFeedback] = useState<FeedbackState>(null);`
);
content = content.replace(
  /<ExperienceManager setFeedback=\{setFeedback\} \/>/,
  '<ExperienceManager initialItems={initialExperiences} setFeedback={setFeedback} />'
);
content = content.replace(
  /<EducationManager setFeedback=\{setFeedback\} \/>/,
  '<EducationManager initialItems={initialEducations} setFeedback={setFeedback} />'
);
content = content.replace(
  /<CertificatesManager setFeedback=\{setFeedback\} \/>/,
  '<CertificatesManager initialItems={initialCertificates} setFeedback={setFeedback} />'
);

// Fix the map and submit buttons to show loading state if desired (optional)
// Replace "disabled={clearDisabled}" with "disabled={clearDisabled || isPending}" etc
content = content.replace(/disabled=\{clearDisabled\}/g, 'disabled={clearDisabled || isPending}');
content = content.replace(/Saving.../g, 'Saving...'); // Leave logic simple for now

fs.writeFileSync(path, content, 'utf8');
console.log("Rewrite done!");
