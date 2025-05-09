import ItemPageComponent from "@/app/components/dashboard/item.page";
import { ContentType } from "@/app/hooks/common";
import { notFound } from "next/navigation";

/**
 * The dashboard item to view, edit and interact with a specific item
 *
 * @param param0
 * @returns
 */
const ItemPage = async ({ params }: { params: Promise<{ id: string[], slug: string }> }) => {
  const { id, slug } = await params;

  if (!id[1] && id[0] !== 'new') {
    return notFound();
  }

  return (
    <ItemPageComponent
      id={id[1] as string}
      action={id[0] as 'view' | 'edit' | 'new'}
      slug={slug as ContentType} />
  );
}

export default ItemPage;
