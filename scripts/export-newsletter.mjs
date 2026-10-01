import { mkdir, writeFile } from 'node:fs/promises';
import { NEWSLETTER, newsletterEmails } from '../src/lib/newsletter.mjs';

const output = new URL('../newsletter-output/', import.meta.url);
const escape = (text) => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const paragraph = (text) => `<p style="margin:0 0 18px;line-height:1.6">${escape(text)}</p>`;
await mkdir(output, { recursive: true });
for (const email of newsletterEmails) {
  const sources = email.sources.map((source) => `<li><a style="color:#3f5a44" href="${escape(source.url)}">${escape(source.label)}</a></li>`).join('');
  const next = email.nextSlug ? `https://gobk.ai/newsletter/${email.nextSlug}/` : 'https://gobk.ai/newsletter/';
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(email.subject)}</title></head><body style="margin:0;background:#fbfaf7;color:#434343;font-family:Arial,sans-serif"><div style="display:none;max-height:0;overflow:hidden">${escape(email.preheader)}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:white"><tr><td style="padding:28px;border-top:5px solid #7a9c80"><p style="font-size:14px;color:#3f5a44">${escape(NEWSLETTER.name)} · ${email.number ? 'ISSUE ' + String(email.number).padStart(2, '0') : 'WELCOME'}</p><h1 style="font-size:28px;line-height:1.2">${escape(email.title)}</h1>${email.intro.map(paragraph).join('')}<h2 style="font-size:22px">${escape(email.heading)}</h2>${email.paragraphs.map(paragraph).join('')}<table role="presentation" width="100%"><tr><td style="padding:20px;background:#fbfaf7;border-left:4px solid #7a9c80"><h2 style="font-size:20px;margin-top:0">${escape(email.checklistTitle)}</h2><ul style="padding-left:22px;line-height:1.6">${email.checklist.map((item) => `<li>${escape(item)}</li>`).join('')}</ul></td></tr></table><h2 style="font-size:22px">Your next step</h2>${paragraph(email.nextStep)}${email.nextSlug ? `<p><a href="${escape(next)}" style="color:#3f5a44">${escape(email.nextLabel)}</a></p>` : ''}${sources ? `<h2 style="font-size:18px">Further reading</h2><ul style="line-height:1.6">${sources}</ul>` : ''}${paragraph('—The GoBK Team')}<hr style="border:0;border-top:1px solid #d9ded9"><p style="font-size:12px;line-height:1.5">${escape(NEWSLETTER.disclaimer)}</p><p style="font-size:12px">[Company mailing address — configure in Brevo before use]</p><p style="font-size:12px"><a href="{{ unsubscribe }}" style="color:#3f5a44">Unsubscribe</a> · <a href="https://gobk.ai/privacy/" style="color:#3f5a44">Privacy</a></p></td></tr></table></td></tr></table></body></html>`;
  const text = [
    'EDITORIAL DRAFT — pending Matt’s review. Do not send before sender, address, links and unsubscribe are verified.',
    `Subject: ${email.subject}`, `Preview: ${email.preheader}`, '', NEWSLETTER.name, email.title, '',
    ...email.intro.flatMap((p) => [p, '']), email.heading, '', ...email.paragraphs.flatMap((p) => [p, '']),
    email.checklistTitle, ...email.checklist.map((p) => '- ' + p), '', 'Your next step', email.nextStep,
    ...(email.nextSlug ? [email.nextLabel + ': ' + next] : []), '',
    ...email.sources.map((s) => s.label + ': ' + s.url), '', '—The GoBK Team', NEWSLETTER.disclaimer,
    '[Company mailing address — configure in Brevo before use]', 'Unsubscribe: {{ unsubscribe }}',
  ].join('\n');
  await writeFile(new URL(email.slug + '.html', output), html);
  await writeFile(new URL(email.slug + '.txt', output), text);
}
console.log(`Exported ${newsletterEmails.length} HTML/text email drafts to newsletter-output. Nothing sent.`);
