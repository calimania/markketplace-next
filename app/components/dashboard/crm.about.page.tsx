import { Page } from "@/markket";
import { strapiClient } from "@/markket/api.strapi";
import { useEffect, useState } from "react";
import { IconInfoCircle   } from '@tabler/icons-react';
import PageContent from '@/app/components/ui/page.content';

/**
 * Dashboard Page with information about the available features
 * @returns
 */
const CRMAboutTab =  () => {
  const [page, setPage] = useState({} as Page);

  useEffect(() => {
    const fetchData = async () => {
      const query  = await strapiClient.getPage("crm.about");
       setPage(query?.data?.[0] ?? null);
    }

    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h2 className="font-bold text-lg mb-2 flex items-center gap-2">
        <IconInfoCircle size={20} /> {page?.Title || 'About CRM'}
      </h2>
      <PageContent params={{ page }} />
    </div>
  );
}

export default CRMAboutTab;
