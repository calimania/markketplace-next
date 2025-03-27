'use client';

import { useContext } from "react";
import { DashboardContext } from "@/app/providers/dashboard.provider";
import ArticleActions from "./article.actions";

/**
 * The dashboard item to view, edit and interact with a specific item
 *
 * @param { params: { id: string, action: string } }
 * @returns
 */
const DashboardItemPage =  ({id, action, slug }: { id: string, action : string, slug: string }) => {
  const { store } = useContext(DashboardContext);

  if (slug === "articles") {
    return <ArticleActions action={action} id={id} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{store.title}</h1>
      <p>{store.Description}</p>
      <div className="flex gap-4">
    {action}
    {id}
      </div>
    </div>
  );
}

export default DashboardItemPage;
