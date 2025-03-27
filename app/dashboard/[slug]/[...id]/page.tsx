import ItemPageComponent from "@/app/components/dashboard/item.page";
import { notFound } from "next/navigation";

/**
 * The dashboard item to view, edit and interact with a specific item
 *
 * @param param0
 * @returns
 */
const ItemPage = async ({ params }: { params: Promise<{ id: string[], slug: string }> }) => {
  const { id, slug } = await params;

  if (!id[1]) {
    return notFound();
  }

  return (
    <ItemPageComponent id={id[1] as string} action={id[0]} slug={slug} />
  );
}

export default ItemPage;
