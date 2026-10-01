import { Github, Linkedin, Mail, ArrowUpRight } from "lucide-react";
import { getSettings } from "@/lib/content";
import { PageHeading } from "@/components/ui";
import { ContactForm } from "@/components/contact-form";
import { metadata as makeMetadata } from "@/lib/seo";
import { contactSchema } from "@/lib/validation";
export const metadata = makeMetadata(
  "Contact",
  "Contactez Marouane Messafri pour un projet, une collaboration ou une opportunité.",
  "/contact",
);
export default async function Contact({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const settings = await getSettings();
  const subject = contactSchema.shape.subject.safeParse(
    (await searchParams).subject,
  );
  return (
    <div className="container page-content">
      <PageHeading
        label="CONTACT / START A CONVERSATION"
        title="Faisons quelque chose de bien."
      >
        Un projet précis ou une idée encore à explorer ? Je serai ravi d’en
        discuter.
      </PageHeading>
      <div className="contact-grid">
        <div className="contact-details">
          <div className="availability">
            <i className="status-dot" />
            {settings.availability
              ? "Ouvert aux projets & aux opportunités"
              : "Disponible pour échanger"}
          </div>
          <p>
            Développement, cybersécurité, recrutement ou collaboration :
            décrivez-moi votre contexte et ce que vous avez en tête.
          </p>
          {settings.contactEmail && (
            <a href={`mailto:${settings.contactEmail}`}>
              <Mail size={18} />
              {settings.contactEmail}
            </a>
          )}
          {settings.github && (
            <a href={settings.github} target="_blank" rel="noopener noreferrer">
              <Github size={18} /> GitHub <ArrowUpRight size={13} />
            </a>
          )}
          {settings.linkedin && (
            <a
              href={settings.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin size={18} /> LinkedIn <ArrowUpRight size={13} />
            </a>
          )}
        </div>
        <ContactForm
          email={settings.contactEmail}
          initialSubject={subject.success ? subject.data : "Freelance"}
          serverDelivery={Boolean(
            process.env.RESEND_API_KEY && process.env.RESEND_FROM,
          )}
        />
      </div>
    </div>
  );
}
