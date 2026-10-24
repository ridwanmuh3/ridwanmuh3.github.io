import type { Lang } from '../config';

export interface SocialLink {
  icon: string;
  label: string;
  href: string;
}

export interface Skill {
  name: string;
}

export interface SkillGroup {
  label: string;
  items: Skill[];
}

export interface TimelineItem {
  name: string;
  company?: string;
  duration?: string;
  description?: string;
  keypoints?: string[];
}

export interface ProjectCardData {
  name: string;
  skills: string[];
  duration?: string;
  date: string;
  description?: string;
  type?: string;
  photo?: string;
  mark?: string;
  url?: string;
  link?: string;
}

export interface SectionMeta {
  title: string;
  body?: string;
}

export interface SectionConfig {
  title?: string;
  body?: string;
  cta_label?: string;
  cta_href?: string;
}

export interface SiteContent {
  hero: {
    tagline?: string;
  };
  sections: Record<
    'skills' | 'projects' | 'blogs' | 'education' | 'experiences' | 'cta',
    SectionConfig
  >;
  pages: Record<'projects' | 'blogs' | 'contact', SectionMeta>;
  skills: SkillGroup[];
  socials: SocialLink[];
  education: TimelineItem[];
  experiences: TimelineItem[];
  projects: ProjectCardData[];
}

export type { Lang };
