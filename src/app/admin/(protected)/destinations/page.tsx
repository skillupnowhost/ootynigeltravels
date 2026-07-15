import Link from "next/link";
import Image from "next/image";
import { Plus, ImageOff } from "lucide-react";
import { destinationsRepo } from "@/lib/db/queries/destinations";
import { listAllDestinationImages } from "@/lib/db/queries/destinationImages";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteDestinationAction } from "@/lib/actions/adminMedia";
import { requireRole } from "@/lib/auth/rbac";
import { Reveal } from "@/components/ui/Reveal";
import { MotionIcon } from "@/components/ui/MotionIcon";

export const dynamic = "force-dynamic";

export default async function AdminDestinationsPage() {
  await requireRole(["admin", "manager"]);
  const destinations = await destinationsRepo.list();
  const allImages = await listAllDestinationImages();
  const imagesByDestination = new Map<number, typeof allImages>();
  for (const img of allImages) {
    const list = imagesByDestination.get(img.destination_id) ?? [];
    list.push(img);
    imagesByDestination.set(img.destination_id, list);
  }

  return (
    <div>
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl text-forest-950 sm:text-2xl">Destinations</h1>
            <p className="mt-1 text-sm text-charcoal-500">Main homepage destination cards — each carries up to 5 slideshow photos.</p>
          </div>
          <Link
            href="/admin/destinations/new"
            className="flex items-center gap-1.5 rounded-xl bg-forest-900 px-4 py-2.5 text-sm font-semibold text-ivory-50 transition-colors duration-200 hover:bg-forest-800"
          >
            <MotionIcon preset="pop">
              <Plus size={16} />
            </MotionIcon>
            Add destination
          </Link>
        </div>

        <div className="mt-4 divide-y divide-forest-50 rounded-2xl border border-forest-100 bg-white sm:hidden">
          {destinations.map((d) => {
            const images = imagesByDestination.get(d.id) ?? [];
            const cover = images[0];
            return (
              <div key={d.id} className="flex items-center gap-3 px-4 py-3">
                <Link href={`/admin/destinations/${d.id}`} className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-forest-50">
                  {cover ? (
                    <Image src={cover.src} alt={cover.alt} width={80} height={56} className="h-full w-full object-cover" />
                  ) : (
                    <ImageOff size={18} className="text-forest-300" />
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-forest-900">{d.name}</span>
                  <p className="truncate text-xs text-charcoal-500">{images.length}/5 photos · {d.region}</p>
                  <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${d.active ? "bg-forest-100 text-forest-800" : "bg-ivory-200 text-charcoal-500"}`}>
                    {d.active ? "Active" : "Hidden"}
                  </span>
                </div>
                <DeleteButton action={deleteDestinationAction} id={d.id} confirmLabel="Delete this destination and all its photos?" />
              </div>
            );
          })}
        </div>

        <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-forest-100 bg-white sm:mt-6 sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-forest-100 text-left text-xs uppercase tracking-wide text-charcoal-500">
                <th className="px-5 py-3">Photo</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Photos</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {destinations.map((d) => {
                const images = imagesByDestination.get(d.id) ?? [];
                const cover = images[0];
                return (
                  <tr key={d.id} className="border-b border-forest-50 last:border-0 hover:bg-forest-50/50">
                    <td className="px-5 py-3">
                      <Link href={`/admin/destinations/${d.id}`} className="flex h-14 w-20 items-center justify-center overflow-hidden rounded-lg bg-forest-50">
                        {cover ? (
                          <Image src={cover.src} alt={cover.alt} width={80} height={56} className="h-full w-full object-cover" />
                        ) : (
                          <ImageOff size={18} className="text-forest-300" />
                        )}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/admin/destinations/${d.id}`} className="font-medium text-forest-900 hover:text-gold-700">
                        {d.name}
                      </Link>
                      <p className="text-xs text-charcoal-500">{d.region}</p>
                    </td>
                    <td className="px-5 py-3 text-charcoal-500">{images.length}/5</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${d.active ? "bg-forest-100 text-forest-800" : "bg-ivory-200 text-charcoal-500"}`}>
                        {d.active ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <DeleteButton action={deleteDestinationAction} id={d.id} confirmLabel="Delete this destination and all its photos?" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Reveal>
    </div>
  );
}
