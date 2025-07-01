import { Page } from "@/markket";
import { strapiClient } from "@/markket/api.strapi";
import { useEffect, useState } from "react";
import { IconHorse   } from '@tabler/icons-react';
import PageContent from '@/app/components/ui/page.content';

/**
 * Interactive Notification settings page
 *
 * @returns
 */
const NotificationsSettingsTab =  () => {
  const [page, setPage] = useState({} as Page);

  useEffect(() => {
    const fetchData = async () => {
      const query  = await strapiClient.getPage("settings.newsletter");
       setPage(query?.data?.[0] ?? null);
    }

    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h2 className="font-bold text-lg mb-2 flex items-center gap-2 text-[#a21caf]">
        <IconHorse size={20} color="#a21caf" /> {page?.Title || 'Notification Settings'}
      </h2>
      <PageContent params={{ page }} />
    </div>
  );
}

export default NotificationsSettingsTab;
