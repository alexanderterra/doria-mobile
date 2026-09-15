export interface CourseLesson {
  title: string;
  speaker: string;
}

export interface CourseVideo {
  id: string;
  title: string;
  description: string;
  duration?: string;
  youtubeId?: string;
  externalLink?: string;
  author?: string;

  format?: string;
  durationInfo?: string;
  availability?: string;
  hasCertificate?: boolean;
  curriculum?: CourseLesson[];
  coverUrl?: string;
}

export interface CourseCategory {
  id: string;
  sectionTitle: string;
  videos: CourseVideo[];
}
