import { Metadata, ResolvingMetadata } from "next";
import EventDetailPageWrapper from "@/components/events/details-wrapper";
import { searchForRegimes } from "@/lib/api/getRegimes";
import { removeMarkdownSyntax } from "@/lib";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;

  let response: any;
  try {
    response = await searchForRegimes({
      searchString: id,
      page: 1,
      limit: 1,
    });
  } catch (error) {
    console.error("Error fetching regimes:", error);
    response = null;
  }

  const event = response?.data?.[0];

  if (!event) {
    return {
      title: "Event Not Found | Reventlify",
      description: "The event you are looking for does not exist.",
    };
  }

  return {
    title: `${event.name} | Reventlify`,
    description: removeMarkdownSyntax(event.description),
    openGraph: {
      title: `${event.name} | Reventlify`,
      description: removeMarkdownSyntax(event.description),
      images: [
        {
          url: event.regime_banner || "/placeholder.jpg",
          width: 800,
          height: 600,
          alt: event.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${event.name} | Reventlify`,
      description: removeMarkdownSyntax(event.description),
      images: [event.regime_banner || "/placeholder.jpg"],
    },
  };
}

export default function EventDetailPage() {
  return <EventDetailPageWrapper />;
}
