import {
  Code2,
  Globe,
  Network,
  ShieldCheck,
  SearchCode,
  Users,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { services } from "@/config/site";
const icons = [Globe, Code2, Network, ShieldCheck, SearchCode, Users];
export function ServicesGrid({ compact = false }: { compact?: boolean }) {
  return (
    <div className="services-grid">
      {services.slice(0, compact ? 3 : 6).map((service, i) => {
        const Icon = icons[i];
        return (
          <Link
            href={`/contact?subject=${i < 3 ? "Freelance" : "Collaboration"}`}
            className="service-card"
            key={service.title}
          >
            <div className="service-icon">
              <Icon size={24} strokeWidth={1.4} />
              <span className="mono">0{i + 1}</span>
            </div>
            <h3>{service.title}</h3>
            <p>{service.text}</p>
            <ArrowUpRight size={19} className="service-arrow" />
          </Link>
        );
      })}
    </div>
  );
}
