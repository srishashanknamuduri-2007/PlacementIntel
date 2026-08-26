import { notFound } from 'next/navigation';
import { getPublicStudentProfile } from '@/lib/portfolio';
import { PortfolioViewer, TemplateType } from '@/components/portfolio/PortfolioViewer';
import { Metadata } from 'next';

interface Props {
  params: { username: string };
  searchParams: { t?: string };
}

// Next.js Dynamic Metadata for Recruiters (SEO)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await getPublicStudentProfile(params.username);
  if (!profile) {
    return { title: 'Portfolio Not Found — PlacementIntel' };
  }
  return {
    title: `${profile.full_name} — Student Portfolio | PlacementIntel`,
    description: profile.bio || `${profile.full_name} (${profile.department}) - Professional Student Portfolio`,
  };
}

// Next.js Server Component (SSR)
export default async function PublicPortfolioPage({ params, searchParams }: Props) {
  const profile = await getPublicStudentProfile(params.username);

  if (!profile) {
    notFound();
  }

  const initialTemplate = (searchParams.t as TemplateType) || 'dark';

  return (
    <div className="min-h-screen bg-slate-950">
      <PortfolioViewer profile={profile} initialTemplate={initialTemplate} showControls={true} />
    </div>
  );
}
